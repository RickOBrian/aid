/**
 * Главный поток плагина. Работает с Figma Plugin API (сканирование,
 * выделение нод) и Figma REST API (загрузка библиотеки токенов), хранит
 * настройки и историю решений в figma.clientStorage.
 *
 * UI ничего не знает о Plugin API / REST API напрямую — общение только
 * через figma.ui.postMessage / typed-протокол из src/messages.ts.
 */

import { colorComparator, computeColorComparisonResults, toTarget } from "./comparators/colorComparator";
import type {
  ComparisonResult,
  ComparisonTarget,
  Decision,
  LayoutRecord,
  LibraryToken,
  LibraryTokenModeValue,
  ScanScope,
} from "./comparators/types";
import { hexToRgb, rgbToHex } from "./lib/colorUtils";
import { pairModesByIndex } from "./lib/modePairing";
import { FigmaRestApiError, fetchFigmaFileName, fetchLibraryColorVariables } from "./lib/figmaRestApi";
import { GitHubRestApiError, fetchRegistry } from "./lib/githubApi";
import {
  DEFAULT_REGISTRY_PATH,
  createEmptyRegistryContent,
  isRegistryNotFound,
  parseGitHubRepo,
} from "./lib/githubTypes";
import { parseFigmaFileKey, parseFigmaFileTitleFromUrl } from "./lib/figmaUrl";
import { buildExportRows } from "./lib/exporter";
import { buildMappingTable, MAX_PRINTABLE_ROWS } from "./lib/figmaTableBuilder";
import * as storage from "./lib/storage";
import type { CodeToUiMessage, UiToCodeMessage } from "./messages";

function send(message: CodeToUiMessage): void {
  figma.ui.postMessage(message);
}

// Состояние последнего сканирования — нужно, чтобы применять решения
// без повторного сканирования всего файла.
let lastRecords: LayoutRecord[] = [];
let lastLibrary: LibraryToken[] = [];
// Скоуп последнего скана — только для человекочитаемого Subtitle Figma-таблицы (не влияет на данные).
let lastScanScope: ScanScope | null = null;

const MAPPING_PAGE_NAME = "Маппинг";

const SCAN_SCOPE_LABELS: Record<ScanScope, string> = {
  file: "Весь файл",
  page: "Текущая страница",
  selection: "Выделение",
};

/** URL/ключ из поля ввода или сохранённый key, если в поле уже имя файла. */
async function resolveLibraryFileKey(input: string): Promise<string | null> {
  const parsed = parseFigmaFileKey(input);
  if (parsed) return parsed;

  const trimmed = input.trim();
  if (!trimmed) return null;

  const [storedKey, storedName, cache] = await Promise.all([
    storage.getLibraryFileKey(),
    storage.getLibraryFileName(),
    storage.getLibraryCache(),
  ]);

  const knownName = storedName ?? cache?.fileName ?? null;
  if (knownName && trimmed === knownName) {
    return storedKey ?? cache?.fileKey ?? null;
  }

  return null;
}

async function resolvePersonalAccessToken(tokenFromUi: string): Promise<string | null> {
  const trimmed = tokenFromUi.trim();
  if (trimmed) return trimmed;
  return storage.getPersonalAccessToken();
}

async function resolveGitHubToken(tokenFromUi: string): Promise<string | null> {
  const trimmed = tokenFromUi.trim();
  if (trimmed) return trimmed;
  return storage.getGitHubToken();
}

async function resolveGitHubRepo(repoFromUi: string): Promise<string | null> {
  const trimmed = repoFromUi.trim();
  if (trimmed) return trimmed;
  return storage.getGitHubRepo();
}

async function resolveGitHubRegistryPath(pathFromUi: string): Promise<string> {
  const trimmed = pathFromUi.trim();
  if (trimmed) return trimmed;
  const stored = await storage.getGitHubRegistryPath();
  return stored ?? DEFAULT_REGISTRY_PATH;
}

async function resolveLibraryDisplayName(
  fileKey: string,
  token: string,
  libraryInput: string
): Promise<string> {
  const apiName = await fetchFigmaFileName(fileKey, token);
  if (apiName !== fileKey) return apiName;
  const fromUrl = parseFigmaFileTitleFromUrl(libraryInput);
  if (fromUrl) return fromUrl;
  const storedName = (await storage.getLibraryFileName()) ?? (await storage.getLibraryCache())?.fileName;
  if (storedName) return storedName;
  return fileKey;
}

async function handleUiReady(): Promise<void> {
  const [token, libraryFileKey, libraryFileName, libraryCache, githubToken, githubRepo, githubRegistryPath, registryCache] =
    await Promise.all([
      storage.getPersonalAccessToken(),
      storage.getLibraryFileKey(),
      storage.getLibraryFileName(),
      storage.getLibraryCache(),
      storage.getGitHubToken(),
      storage.getGitHubRepo(),
      storage.getGitHubRegistryPath(),
      storage.getRegistryCache(),
    ]);

  if (libraryCache) {
    lastLibrary = libraryCache.tokens;
  }

  const effectiveLibraryFileName =
    libraryFileName ?? libraryCache?.fileName ?? libraryFileKey ?? libraryCache?.fileKey ?? null;

  send({
    type: "init-state",
    payload: {
      hasToken: Boolean(token),
      libraryFileName: effectiveLibraryFileName,
      libraryCache: libraryCache
        ? { count: libraryCache.tokens.length, fetchedAt: libraryCache.fetchedAt }
        : null,
      hasGitHubToken: Boolean(githubToken),
      githubRepo,
      githubRegistryPath: githubRegistryPath ?? DEFAULT_REGISTRY_PATH,
      registryCache: registryCache
        ? {
            registryVersion: registryCache.registry.registryVersion,
            entryCount: registryCache.registry.entries.length,
            fetchedAt: registryCache.fetchedAt,
            localOnly: !registryCache.sha,
          }
        : null,
    },
  });
}

async function handleSaveSettings(tokenFromUi: string, libraryInput: string): Promise<void> {
  const token = await resolvePersonalAccessToken(tokenFromUi);
  if (!token) {
    send({
      type: "error",
      payload: { message: "Укажите Personal Access Token или сохраните его ранее через «Сохранить настройки»." },
    });
    return;
  }

  const libraryFileKey = await resolveLibraryFileKey(libraryInput);
  if (!libraryFileKey) {
    send({
      type: "error",
      payload: {
        message:
          "Не удалось определить библиотеку. Вставьте полный URL Figma или file key — или оставьте имя уже загруженной библиотеки.",
      },
    });
    return;
  }

  const libraryFileName = await resolveLibraryDisplayName(libraryFileKey, token, libraryInput);
  await Promise.all([
    storage.setPersonalAccessToken(token),
    storage.setLibraryFileKey(libraryFileKey),
    storage.setLibraryFileName(libraryFileName),
  ]);

  send({ type: "settings-saved", payload: { libraryFileName } });
}

async function handleSaveGitHubSettings(
  tokenFromUi: string,
  repoInput: string,
  registryPathInput: string
): Promise<void> {
  const token = await resolveGitHubToken(tokenFromUi);
  if (!token) {
    send({
      type: "error",
      payload: {
        message: "Укажите GitHub Personal Access Token или сохраните его ранее через «Сохранить настройки GitHub».",
      },
    });
    return;
  }

  const parsedRepo = parseGitHubRepo(repoInput);
  if (!parsedRepo) {
    send({
      type: "error",
      payload: { message: "Укажите репозиторий в формате owner/repo или URL github.com/owner/repo." },
    });
    return;
  }

  const repo = `${parsedRepo.owner}/${parsedRepo.repo}`;
  const registryPath = registryPathInput.trim() || DEFAULT_REGISTRY_PATH;

  await Promise.all([
    storage.setGitHubToken(token),
    storage.setGitHubRepo(repo),
    storage.setGitHubRegistryPath(registryPath),
  ]);

  send({ type: "github-settings-saved", payload: { repo, registryPath } });
}

async function handleLoadRegistry(
  tokenFromUi: string,
  repoInput: string,
  registryPathInput: string
): Promise<void> {
  const token = await resolveGitHubToken(tokenFromUi);
  if (!token) {
    send({
      type: "error",
      payload: {
        message:
          "Укажите GitHub Personal Access Token в поле выше (или сохраните его ранее) перед загрузкой реестра.",
      },
    });
    return;
  }

  const repoStored = await resolveGitHubRepo(repoInput);
  const parsedRepo = parseGitHubRepo(repoStored ?? repoInput);
  if (!parsedRepo) {
    send({
      type: "error",
      payload: { message: "Укажите репозиторий в формате owner/repo или URL github.com/owner/repo." },
    });
    return;
  }

  const registryPath = await resolveGitHubRegistryPath(registryPathInput);
  const repo = `${parsedRepo.owner}/${parsedRepo.repo}`;

  send({ type: "registry-loading" });
  try {
    const result = await fetchRegistry(token, parsedRepo.owner, parsedRepo.repo, registryPath);

    if (isRegistryNotFound(result)) {
      send({ type: "registry-not-found", payload: { repo, registryPath } });
      return;
    }

    const fetchedAt = new Date().toISOString();
    await storage.setRegistryCache({
      registry: {
        schemaVersion: result.schemaVersion,
        registryVersion: result.registryVersion,
        updatedAt: result.updatedAt,
        entries: result.entries,
      },
      sha: result.sha,
      fetchedAt,
      owner: parsedRepo.owner,
      repo: parsedRepo.repo,
      path: registryPath,
    });

    send({
      type: "registry-loaded",
      payload: {
        registryVersion: result.registryVersion,
        entryCount: result.entries.length,
        updatedAt: result.updatedAt,
        fetchedAt,
        localOnly: false,
      },
    });
  } catch (error) {
    const message =
      error instanceof GitHubRestApiError
        ? error.message
        : "Неизвестная ошибка при загрузке реестра. Попробуйте ещё раз.";
    send({ type: "error", payload: { message } });
  }
}

async function handleInitEmptyRegistry(repoInput: string, registryPathInput: string): Promise<void> {
  const parsedRepo = parseGitHubRepo(repoInput);
  if (!parsedRepo) {
    send({
      type: "error",
      payload: { message: "Укажите репозиторий в формате owner/repo перед инициализацией реестра." },
    });
    return;
  }

  const registryPath = await resolveGitHubRegistryPath(registryPathInput);
  const registry = createEmptyRegistryContent();
  const fetchedAt = new Date().toISOString();

  await storage.setRegistryCache({
    registry,
    fetchedAt,
    owner: parsedRepo.owner,
    repo: parsedRepo.repo,
    path: registryPath,
  });

  send({
    type: "registry-initialized",
    payload: {
      registryVersion: registry.registryVersion,
      entryCount: registry.entries.length,
      updatedAt: registry.updatedAt,
    },
  });
}

async function handleLoadLibrary(libraryInput: string, tokenFromUi: string): Promise<void> {
  const token = await resolvePersonalAccessToken(tokenFromUi);
  if (!token) {
    send({
      type: "error",
      payload: {
        message:
          "Укажите Personal Access Token в поле выше (или сохраните его ранее) перед загрузкой библиотеки.",
      },
    });
    return;
  }

  const fileKey = await resolveLibraryFileKey(libraryInput);
  if (!fileKey) {
    send({
      type: "error",
      payload: {
        message:
          "Не удалось определить библиотеку. Вставьте полный URL (https://www.figma.com/design/…/…) или file key.",
      },
    });
    return;
  }

  send({ type: "library-loading" });
  try {
    const tokens = await fetchLibraryColorVariables(fileKey, token);
    const fileName = await resolveLibraryDisplayName(fileKey, token, libraryInput);
    const fetchedAt = new Date().toISOString();
    await Promise.all([
      storage.setLibraryCache({ tokens, fetchedAt, fileKey, fileName }),
      storage.setLibraryFileKey(fileKey),
      storage.setLibraryFileName(fileName),
    ]);
    lastLibrary = tokens;
    send({ type: "library-loaded", payload: { tokens, fetchedAt, fileName } });
  } catch (error) {
    const message =
      error instanceof FigmaRestApiError
        ? error.message
        : "Неизвестная ошибка при загрузке библиотеки. Попробуйте ещё раз.";
    send({ type: "error", payload: { message } });
  }
}

async function handleScan(scope: "file" | "page" | "selection"): Promise<void> {
  try {
    lastScanScope = scope;
    send({ type: "scan-progress", payload: { message: "Сканирование макета..." } });
    const records = await colorComparator.scanLayout(scope);
    lastRecords = records;

    if (lastLibrary.length === 0) {
      const cache = await storage.getLibraryCache();
      lastLibrary = cache?.tokens ?? [];
    }

    const history = await storage.getMappingHistory();
    const results: ComparisonResult[] = colorComparator.compareWithLibrary(
      records,
      lastLibrary,
      history
    );
    send({ type: "scan-results", payload: { results, libraryTokens: lastLibrary } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка сканирования макета.";
    send({ type: "error", payload: { message } });
  }
}

/** Находит страницу-предка ноды (для переключения figma.currentPage перед выделением). */
function findOwnerPage(node: BaseNode): PageNode | null {
  let current: BaseNode | null = node;
  while (current) {
    if (current.type === "PAGE") return current;
    current = current.parent;
  }
  return null;
}

function isSceneNode(node: BaseNode): node is SceneNode {
  return node.type !== "PAGE" && node.type !== "DOCUMENT";
}

async function resolveSceneNodeById(id: string): Promise<SceneNode | null> {
  const node = await figma.getNodeByIdAsync(id);
  if (!node || !isSceneNode(node)) return null;
  return node;
}

async function handleSelectNodes(nodeIds: string[]): Promise<void> {
  if (nodeIds.length === 0) {
    send({ type: "error", payload: { message: "Нет привязки к слою для этой строки." } });
    return;
  }

  let anchor = await resolveSceneNodeById(nodeIds[0]);

  // Нода может быть на ещё не загруженной странице (dynamic-page)
  if (!anchor) {
    await figma.loadAllPagesAsync();
    anchor = await resolveSceneNodeById(nodeIds[0]);
  }

  if (!anchor) {
    send({
      type: "error",
      payload: {
        message:
          "Слой не найден — возможно, он удалён или переименован. Пересканируйте макет и попробуйте снова.",
      },
    });
    return;
  }

  const ownerPage = findOwnerPage(anchor);
  if (!ownerPage) {
    send({ type: "error", payload: { message: "Не удалось определить страницу слоя." } });
    return;
  }

  // dynamic-page: currentPage read-only → setCurrentPageAsync; страницу нужно загрузить до selection
  await ownerPage.loadAsync();
  await figma.setCurrentPageAsync(ownerPage);

  const selection: SceneNode[] = [];
  for (const id of nodeIds) {
    const node = await resolveSceneNodeById(id);
    if (node && findOwnerPage(node) === ownerPage) {
      selection.push(node);
    }
  }
  if (selection.length === 0) {
    selection.push(anchor);
  }

  ownerPage.selection = selection;
  figma.viewport.scrollAndZoomIntoView(selection);
}

async function handleApplyDecision(
  recordId: string,
  decision: Decision,
  fields: {
    comment?: string;
    targetVariableId?: string;
    targetName?: string;
    targetCollectionName?: string;
    proposedModeId?: string;
    proposedModeName?: string;
    currentLibraryValue?: string;
    proposedValue?: string;
  }
): Promise<void> {
  const timestamp = new Date().toISOString();
  const history = await storage.setMappingHistoryEntry(recordId, {
    decision,
    targetVariableId: fields.targetVariableId,
    targetName: fields.targetName,
    targetCollectionName: fields.targetCollectionName,
    comment: fields.comment,
    proposedModeId: fields.proposedModeId,
    proposedModeName: fields.proposedModeName,
    currentLibraryValue: fields.currentLibraryValue,
    proposedValue: fields.proposedValue,
    timestamp,
  });

  const record = lastRecords.find((item) => item.id === recordId);
  if (!record) {
    send({ type: "error", payload: { message: "Строка не найдена в текущих результатах. Пересканируйте макет." } });
    return;
  }

  // Пересчёт БЕЗ фильтра requiresUserAction — decision "mapped"/"mapped_suggested"/
  // "ignored" исключает строку из отфильтрованной выборки (см. requiresUserAction),
  // но UI обновляет карточку именно этой строки сразу после Apply (галочка,
  // сохранённые поля), а не убирает её из currentResults — это происходит
  // только при следующем полном скане (см. GUIDE.md, раздел 7).
  const [result] = computeColorComparisonResults([record], lastLibrary, history);
  send({ type: "decision-applied", payload: { recordId, result } });
}

async function handleClearDecision(recordId: string): Promise<void> {
  const history = await storage.clearMappingHistoryEntry(recordId);
  const record = lastRecords.find((item) => item.id === recordId);
  if (!record) return;
  const [result] = computeColorComparisonResults([record], lastLibrary, history);
  send({ type: "decision-applied", payload: { recordId, result } });
}

// ---------------------------------------------------------------------------
// Применить в макет — единственное действие плагина, которое реально
// изменяет макет: привязывает найденную переменную библиотеки к
// fill/stroke/text fill затронутых нод. Доступно только для строк со
// статусом "mapped" (решение mapped/mapped_suggested с известным target).
// Отдельное, самостоятельное действие — не переиспользует "apply-decision".
// ---------------------------------------------------------------------------

/** true, если для найденного paint допустимо применить переменную (совпадает по hex+alpha с тем, что нашёл сканер). */
function paintMatchesRecordValue(paint: Paint, record: LayoutRecord): boolean {
  if (paint.type !== "SOLID" || paint.visible === false) return false;
  const target = readComparisonColor(record.comparisonValue);
  const hex = rgbToHex(paint.color.r, paint.color.g, paint.color.b);
  const alpha = paint.opacity ?? 1;
  return hex.toUpperCase() === target.hex.toUpperCase() && Math.abs(alpha - target.alpha) < 0.01;
}

/** Индекс paint в массиве, чьё текущее значение совпадает с тем, что нашёл сканер для этой группы, либо -1. */
function findMatchingPaintIndex(paints: readonly Paint[], record: LayoutRecord): number {
  return paints.findIndex((paint) => paintMatchesRecordValue(paint, record));
}

interface ApplyToLayoutSkip {
  nodeId: string;
  reason: string;
}

async function handleApplyToLayout(recordId: string): Promise<void> {
  const record = lastRecords.find((item) => item.id === recordId);
  if (!record) {
    send({ type: "error", payload: { message: "Строка не найдена в текущих результатах. Пересканируйте макет." } });
    return;
  }

  const history = await storage.getMappingHistory();
  const [result] = computeColorComparisonResults([record], lastLibrary, history);

  // Доступно только для строк со статусом "Mapped" (решение mapped/mapped_suggested
  // с однозначно выбранной переменной библиотеки) — см. GUIDE.md, раздел 8.
  if (!result || result.status !== "mapped" || !result.target?.variableId) {
    send({
      type: "error",
      payload: {
        message: "«Применить в макет» доступно только для строк со статусом Mapped с известной переменной библиотеки.",
      },
    });
    return;
  }

  const libraryToken = lastLibrary.find((token) => token.variableId === result.target!.variableId);
  if (!libraryToken) {
    send({
      type: "error",
      payload: { message: "Целевая переменная не найдена в загруженной библиотеке. Загрузите библиотеку заново." },
    });
    return;
  }

  const skipped: ApplyToLayoutSkip[] = [];
  let applied = 0;

  let variable: Variable | null = null;
  try {
    variable = await figma.variables.importVariableByKeyAsync(libraryToken.key);
  } catch (importError) {
    const reason =
      importError instanceof Error
        ? `Не удалось импортировать переменную библиотеки: ${importError.message}`
        : "Не удалось импортировать переменную библиотеки.";
    for (const nodeId of record.nodeIds) {
      skipped.push({ nodeId, reason });
    }
    send({ type: "apply-to-layout-result", recordId, applied: 0, skipped });
    return;
  }

  for (const nodeId of record.nodeIds) {
    try {
      let node = await figma.getNodeByIdAsync(nodeId);
      if (!node) {
        await figma.loadAllPagesAsync();
        node = await figma.getNodeByIdAsync(nodeId);
      }
      if (!node || !isSceneNode(node)) {
        skipped.push({ nodeId, reason: "Слой не найден — возможно, удалён или переименован с момента скана." });
        continue;
      }

      if (record.property === "stroke") {
        if (!("strokes" in node)) {
          skipped.push({ nodeId, reason: "У этого слоя нет обводки (strokes)." });
          continue;
        }
        const strokesNode = node as unknown as MinimalStrokesMixin & { strokeStyleId?: string };
        // strokes (в отличие от fills у TEXT-нод) не бывает figma.mixed — посимвольных обводок не существует.
        const strokes = strokesNode.strokes;
        const index = findMatchingPaintIndex(strokes, record);
        if (index === -1) {
          skipped.push({ nodeId, reason: "Не найдена обводка с ожидаемым значением цвета — слой мог измениться." });
          continue;
        }
        if (typeof strokesNode.strokeStyleId === "string" && strokesNode.strokeStyleId) {
          strokesNode.strokeStyleId = ""; // снимаем привязку к paint style перед прямой записью strokes
        }
        const newPaint = figma.variables.setBoundVariableForPaint(strokes[index] as SolidPaint, "color", variable);
        const newStrokes = strokes.slice();
        newStrokes[index] = newPaint;
        strokesNode.strokes = newStrokes;
      } else {
        // "fill" и "text-fill" — оба свойства пишут в fills (для TEXT-нод заливка текста — тоже fills).
        if (!("fills" in node)) {
          skipped.push({ nodeId, reason: "У этого слоя нет заливки (fills)." });
          continue;
        }
        const fillsNode = node as unknown as MinimalFillsMixin & { fillStyleId?: string };
        const fills = fillsNode.fills;
        if (fills === figma.mixed) {
          skipped.push({
            nodeId,
            reason: "Смешанные заливки текста (mixed) — нельзя применить переменную автоматически.",
          });
          continue;
        }
        const index = findMatchingPaintIndex(fills, record);
        if (index === -1) {
          skipped.push({ nodeId, reason: "Не найдена заливка с ожидаемым значением цвета — слой мог измениться." });
          continue;
        }
        if (typeof fillsNode.fillStyleId === "string" && fillsNode.fillStyleId) {
          fillsNode.fillStyleId = ""; // снимаем привязку к paint style перед прямой записью fills
        }
        const newPaint = figma.variables.setBoundVariableForPaint(fills[index] as SolidPaint, "color", variable);
        const newFills = fills.slice();
        newFills[index] = newPaint;
        fillsNode.fills = newFills;
      }

      applied += 1;
    } catch (nodeError) {
      const reason = nodeError instanceof Error ? nodeError.message : "Неизвестная ошибка при применении переменной.";
      skipped.push({ nodeId, reason });
    }
  }

  if (applied > 0) {
    // Группа теперь реально привязана к переменной библиотеки — старое
    // решение из истории больше не нужно (и не должно "залипать" на статусе
    // Mapped): при следующем скане группа пересчитается заново по реальному
    // состоянию макета, обычно как Exact match.
    await storage.clearMappingHistoryEntry(recordId);
  }

  send({ type: "apply-to-layout-result", recordId, applied, skipped });
}

// ---------------------------------------------------------------------------
// Показать превью — "Было / Будет" на клоне ноды. Не меняет оригинальный
// макет ни на миг: все правки — на figma-клоне, который гарантированно
// удаляется в finally сразу после экспорта, при любом исходе.
// ---------------------------------------------------------------------------

/** Лимит по ширине/высоте контейнера превью — крупные слои дают неоправданно тяжёлый экспорт. */
const PREVIEW_MAX_DIMENSION = 4000;
/** Смещение клона по X от оригинала — заведомо далеко за пределами видимого контента. */
const PREVIEW_CLONE_OFFSET_X = 100000;
/** Порог площади (px²), ниже которого нода считается "мелкой" и превью строится по ближайшему контейнеру. */
const PREVIEW_MIN_CONTEXT_AREA = 24 * 24;

/** Не даём запускать построение превью параллельно для нескольких строк — вторая активация ждёт первую. */
let previewInFlight = false;

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * Uint8Array -> base64 без spread/apply на всём массиве целиком (безопасно
 * для больших PNG) и без зависимости от btoa (недоступен в части плагинных
 * рантаймов Figma) — ручная реализация RFC 4648 по 3 байта за проход.
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let result = "";
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const hasB1 = i + 1 < len;
    const hasB2 = i + 2 < len;
    const b1 = hasB1 ? bytes[i + 1] : 0;
    const b2 = hasB2 ? bytes[i + 2] : 0;
    const triplet = (b0 << 16) | (b1 << 8) | b2;

    result += BASE64_CHARS[(triplet >> 18) & 0x3f];
    result += BASE64_CHARS[(triplet >> 12) & 0x3f];
    result += hasB1 ? BASE64_CHARS[(triplet >> 6) & 0x3f] : "=";
    result += hasB2 ? BASE64_CHARS[triplet & 0x3f] : "=";
  }
  return result;
}

function waitFrame(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 50));
}

async function exportNodeAsPngDataUrl(node: SceneNode): Promise<string> {
  const bytes = await node.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: 2 } });
  return `data:image/png;base64,${uint8ArrayToBase64(bytes)}`;
}

/** Читает {hex, alpha} из LayoutRecord.comparisonValue (форма Colors comparator). */
function readComparisonColor(value: Record<string, unknown>): { hex: string; alpha: number } {
  return { hex: String(value.hex), alpha: Number(value.alpha) };
}

/** "#RRGGBB" или "#RRGGBB @ NN%" (ComparisonTarget.displayValue) -> {hex, alpha}. */
function parseDisplayValueToColor(displayValue: string): { hex: string; alpha: number } {
  const [hexPart, ...rest] = displayValue.trim().split(" ");
  const percentMatch = rest.join(" ").match(/(\d+)\s*%/);
  const alpha = percentMatch ? Number(percentMatch[1]) / 100 : 1;
  return { hex: hexPart, alpha };
}

interface PreviewModePair {
  modeName: string;
  before: { hex: string; alpha: number };
  after: { hex: string; alpha: number };
}

/**
 * Список пар "Было/Будет" по каждому режиму макета и библиотеки.
 *
 * Сопоставление режимов — через pairModesByIndex (lib/modePairing.ts):
 * сначала по имени / синонимам day↔light, night↔dark, иначе по индексу
 * после стабильной сортировки (Mode 1↔Day, Mode 2↔Night и т.п.).
 *
 * Hardcoded/Style/Ghost (record.modeValues пуст) — значение макета не
 * зависит от режима; одно и то же «Было» для каждого режима библиотеки.
 */
function getPreviewModePairs(record: LayoutRecord, target: ComparisonTarget): PreviewModePair[] {
  const targetModes: LibraryTokenModeValue[] =
    target.allModes && target.allModes.length > 0
      ? target.allModes
      : [
          {
            modeId: target.modeId,
            modeName: target.modeName,
            displayValue: target.displayValue,
            comparisonValue: {},
            unresolved: target.valueUnresolved,
          },
        ];

  const resolvedTargetModes = targetModes.filter((mode) => !mode.unresolved);
  const layoutModes = record.modeValues && record.modeValues.length > 0 ? record.modeValues : null;
  const pairs: PreviewModePair[] = [];

  if (layoutModes) {
    for (const { layout, target: targetMode, label } of pairModesByIndex(layoutModes, resolvedTargetModes)) {
      pairs.push({
        modeName: label,
        before: readComparisonColor(layout.comparisonValue),
        after: parseDisplayValueToColor(targetMode.displayValue),
      });
    }
  } else {
    for (const targetMode of resolvedTargetModes) {
      pairs.push({
        modeName: targetMode.modeName,
        before: readComparisonColor(record.comparisonValue),
        after: parseDisplayValueToColor(targetMode.displayValue),
      });
    }
  }

  return pairs;
}

const PREVIEW_CONTAINER_TYPES = new Set(["FRAME", "COMPONENT", "INSTANCE", "GROUP"]);

function hasNumericDimensions(node: BaseNode): node is BaseNode & { width: number; height: number } {
  return "width" in node && "height" in node && typeof (node as { width: unknown }).width === "number";
}

/**
 * Если нода мелкая (площадь < 24×24px) или это самостоятельная VECTOR-иконка
 * без визуального контекста — поднимаемся к ближайшему
 * FRAME/COMPONENT/INSTANCE/GROUP предку. Иначе превью строится по самой ноде.
 */
function resolvePreviewContainer(target: SceneNode): SceneNode {
  const area = hasNumericDimensions(target) ? target.width * target.height : 0;
  const tooSmall = area > 0 && area < PREVIEW_MIN_CONTEXT_AREA;
  const isBareVector = target.type === "VECTOR";

  if (!tooSmall && !isBareVector) return target;

  let current: BaseNode | null = target.parent;
  while (current) {
    if (isSceneNode(current) && PREVIEW_CONTAINER_TYPES.has(current.type)) {
      return current;
    }
    current = current.parent;
  }
  return target; // не нашли подходящего предка — работаем с самой нодой
}

/** Путь по индексам детей от root до node (для повторного поиска той же позиции внутри клона). Null, если node не внутри root. */
function getRelativeChildPath(root: SceneNode, node: SceneNode): number[] | null {
  if (root.id === node.id) return [];

  const path: number[] = [];
  let current: BaseNode = node;
  while (current.id !== root.id) {
    const parent: BaseNode | null = current.parent;
    if (!parent || !("children" in parent)) return null;
    const siblings = (parent as unknown as ChildrenMixin).children as readonly SceneNode[];
    const index = siblings.findIndex((sibling) => sibling.id === current.id);
    if (index === -1) return null;
    path.unshift(index);
    current = parent;
  }
  return path;
}

/** Обратная операция к getRelativeChildPath — находит узел внутри клона по сохранённому пути индексов. */
function resolveNodeAtPath(root: SceneNode, path: number[]): SceneNode | null {
  let current: SceneNode = root;
  for (const index of path) {
    if (!("children" in current)) return null;
    const children = (current as unknown as ChildrenMixin).children as readonly SceneNode[];
    const child = children[index];
    if (!child) return null;
    current = child;
  }
  return current;
}

/** Ставит на ноду сплошную заливку/обводку заданного цвета — единственный способ детерминированно показать before/after для группы, объединяющей разные paint-стеки. */
function applyColorToProperty(node: SceneNode, property: string, hex: string, alpha: number): void {
  const { r, g, b } = hexToRgb(hex);
  const paint: SolidPaint = { type: "SOLID", color: { r, g, b }, opacity: alpha };

  if (property === "stroke") {
    if (!("strokes" in node)) {
      throw new Error("У этого слоя нет обводки (strokes) — превью недоступно.");
    }
    (node as unknown as MinimalStrokesMixin).strokes = [paint];
    return;
  }

  // "fill" и "text-fill" оба пишут в fills (для TEXT-нод заливка текста — тоже fills).
  if (!("fills" in node)) {
    throw new Error("У этого слоя нет заливки (fills) — превью недоступно.");
  }
  (node as unknown as MinimalFillsMixin).fills = [paint];
}

/**
 * Превью доступно в двух режимах:
 * - `variableId` передан явно — токен выбран вручную через combobox
 *   «Выбрать токен из AID», решение ещё не сохранено через «Применить
 *   решение» (history об этой записи ничего не знает) — target строится
 *   напрямую из токена библиотеки, режим по умолчанию (0); полный набор
 *   `allModes` всё равно берётся из токена целиком, поэтому пары
 *   Day/Night строятся так же, как при автоматическом совпадении;
 * - без `variableId` — как раньше, через computeColorComparisonResults
 *   (автоматически найденный target или уже сохранённое mapped-решение).
 */
async function handleBuildPreview(recordId: string, variableId?: string): Promise<void> {
  if (previewInFlight) {
    send({
      type: "preview-error",
      recordId,
      message: "Дождитесь завершения текущего построения превью и попробуйте снова.",
    });
    return;
  }
  previewInFlight = true;

  let clone: SceneNode | null = null;
  try {
    const record = lastRecords.find((item) => item.id === recordId);
    if (!record) {
      throw new Error("Строка не найдена в текущих результатах. Пересканируйте макет.");
    }

    let target: ComparisonTarget;
    if (variableId) {
      const token = lastLibrary.find((item) => item.variableId === variableId);
      if (!token) {
        throw new Error("Переменная не найдена в загруженной библиотеке. Обновите библиотеку и повторите выбор.");
      }
      const hasResolvedMode = token.modes.some((mode) => !mode.unresolved);
      if (!hasResolvedMode) {
        throw new Error("Для выбранного токена нет доступного значения библиотеки для превью.");
      }
      target = toTarget(token, 0);
    } else {
      const history = await storage.getMappingHistory();
      const [result] = computeColorComparisonResults([record], lastLibrary, history);
      if (!result?.target || result.target.valueUnresolved) {
        throw new Error("Для этой строки нет доступного значения библиотеки для превью.");
      }
      target = result.target;
    }

    const representativeId = record.nodeIds[0];
    if (!representativeId) {
      throw new Error("Нет привязанного слоя для построения превью.");
    }

    let anchor = await resolveSceneNodeById(representativeId);
    if (!anchor) {
      await figma.loadAllPagesAsync();
      anchor = await resolveSceneNodeById(representativeId);
    }
    if (!anchor) {
      throw new Error("Слой не найден — возможно, он удалён. Пересканируйте макет.");
    }

    const container = resolvePreviewContainer(anchor);

    if (
      hasNumericDimensions(container) &&
      (container.width > PREVIEW_MAX_DIMENSION || container.height > PREVIEW_MAX_DIMENSION)
    ) {
      throw new Error("Слой слишком велик для превью.");
    }

    const relativePath = getRelativeChildPath(container, anchor);
    if (relativePath === null) {
      throw new Error("Не удалось определить положение слоя внутри контейнера превью.");
    }

    if (!("clone" in container) || typeof (container as { clone?: unknown }).clone !== "function") {
      throw new Error("Этот тип слоя не поддерживает построение превью.");
    }

    // Не переключаем figma.currentPage — клон переносится сразу на текущую страницу.
    clone = (container as unknown as { clone(): SceneNode }).clone();
    figma.currentPage.appendChild(clone);
    if ("x" in clone && "y" in clone && "x" in container && "y" in container) {
      const containerPos = container as unknown as { x: number; y: number };
      const clonePos = clone as unknown as { x: number; y: number };
      clonePos.x = containerPos.x + PREVIEW_CLONE_OFFSET_X;
      clonePos.y = containerPos.y;
    }

    const targetInClone = resolveNodeAtPath(clone, relativePath);
    if (!targetInClone) {
      throw new Error("Не удалось найти слой внутри клона для применения цвета.");
    }

    const modePairs = getPreviewModePairs(record, target);
    if (modePairs.length === 0) {
      throw new Error("Нет общих режимов между макетом и библиотекой для этой строки.");
    }

    // Один клон на всю запись — по каждому общему режиму последовательно
    // перекрашиваем и экспортируем тот же клон (не создаём клон на mode).
    const modes: Array<{ modeName: string; before: string; after: string }> = [];
    for (const pair of modePairs) {
      try {
        applyColorToProperty(targetInClone, record.property, pair.before.hex, pair.before.alpha);
        await waitFrame();
        const before = await exportNodeAsPngDataUrl(clone);

        applyColorToProperty(targetInClone, record.property, pair.after.hex, pair.after.alpha);
        await waitFrame();
        const after = await exportNodeAsPngDataUrl(clone);

        modes.push({ modeName: pair.modeName, before, after });
      } catch (modeError) {
        const reason = modeError instanceof Error ? modeError.message : "неизвестная ошибка";
        throw new Error(`Не удалось построить превью для режима «${pair.modeName}»: ${reason}`);
      }
    }

    send({ type: "preview-ready", recordId, modes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось построить превью (неизвестная ошибка).";
    send({ type: "preview-error", recordId, message });
  } finally {
    if (clone) {
      try {
        clone.remove();
      } catch {
        // клон уже недоступен/удалён — не перекрываем исходную ошибку сообщением об этом
      }
    }
    previewInFlight = false;
  }
}

function handleResizeWindow(width: number, height: number): void {
  const size = storage.clampWindowSize({ width, height });
  figma.ui.resize(size.width, size.height);
}

async function handleResizeWindowEnd(width: number, height: number): Promise<void> {
  const size = storage.clampWindowSize({ width, height });
  figma.ui.resize(size.width, size.height);
  await storage.setWindowSize(size);
}

/**
 * Находит страницу "Маппинг" среди figma.root.children (безопасно без
 * loadAsync — доступ к имени/id страниц разрешён и в dynamic-page режиме),
 * либо создаёт новую (figma.createPage() уже добавляет её в конец списка
 * страниц). Перед любой работой с содержимым страницы — loadAsync().
 */
async function findOrCreateMappingPage(): Promise<PageNode> {
  const existing = figma.root.children.find((page) => page.name === MAPPING_PAGE_NAME);
  if (existing) {
    await existing.loadAsync();
    return existing;
  }

  const page = figma.createPage();
  page.name = MAPPING_PAGE_NAME;
  await page.loadAsync();
  return page;
}

/**
 * Смещение по X для новой таблицы — правее самого правого существующего
 * top-level фрейма на странице (история отчётов, не затирание предыдущих).
 * 120px — spacing между отчётами.
 */
function computeNextTableX(page: PageNode): number {
  const topLevelFrames = page.children.filter((child): child is FrameNode => child.type === "FRAME");
  if (topLevelFrames.length === 0) return 0;
  const maxX = Math.max(...topLevelFrames.map((frame) => frame.x + frame.width));
  return maxX + 120;
}

async function handlePrintToFigma(
  sourceFormat: "csv" | "json" | "md",
  results: ComparisonResult[]
): Promise<void> {
  try {
    console.log(`[print-to-figma] triggered from "${sourceFormat}" button, ${results.length} row(s).`);

    if (results.length === 0) {
      send({
        type: "print-error",
        payload: { message: "Нет строк для печати — таблица результатов пуста или всё скрыто фильтром." },
      });
      return;
    }

    send({ type: "print-progress", payload: { message: `Строим таблицу на странице «${MAPPING_PAGE_NAME}»...` } });

    const truncated = results.length > MAX_PRINTABLE_ROWS;
    const resultsForTable = truncated ? results.slice(0, MAX_PRINTABLE_ROWS) : results;
    // Один источник данных для CSV/JSON/MD и для Figma-таблицы — buildExportRows().
    const rows = buildExportRows(resultsForTable);

    const page = await findOrCreateMappingPage();
    // dynamic-page: figma.currentPage — read-only, переключение только через setCurrentPageAsync.
    await figma.setCurrentPageAsync(page);

    const nextX = computeNextTableX(page);

    const libraryFileName =
      (await storage.getLibraryFileName()) ??
      (await storage.getLibraryCache())?.fileName ??
      (await storage.getLibraryFileKey()) ??
      null;
    const table = await buildMappingTable(
      page,
      rows,
      {
        libraryName: libraryFileName || "библиотека не указана",
        scope: lastScanScope ? SCAN_SCOPE_LABELS[lastScanScope] : "не указан",
        printedAt: new Date().toLocaleString("ru-RU"),
      },
      (completed, total) => {
        const percent = total > 0 ? Math.round((completed / total) * 100) : 100;
        send({
          type: "print-progress",
          payload: {
            message: `Строим таблицу на странице «${MAPPING_PAGE_NAME}»... (${completed}/${total})`,
            percent,
          },
        });
      }
    );

    table.x = nextX;
    table.y = 0;
    page.appendChild(table);
    figma.viewport.scrollAndZoomIntoView([table]);

    send({
      type: "print-success",
      payload: {
        pageName: page.name,
        rowCount: rows.length,
        totalRows: results.length,
        truncated,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? `Не удалось построить таблицу в Figma: ${error.message}`
        : "Не удалось построить таблицу в Figma (неизвестная ошибка).";
    send({ type: "print-error", payload: { message } });
  }
}

figma.ui.onmessage = async (message: UiToCodeMessage) => {
  try {
    switch (message.type) {
      case "ui-ready":
        await handleUiReady();
        break;
      case "save-settings":
        await handleSaveSettings(message.payload.token, message.payload.libraryInput);
        break;
      case "save-github-settings":
        await handleSaveGitHubSettings(
          message.payload.token,
          message.payload.repo,
          message.payload.registryPath
        );
        break;
      case "load-registry":
        await handleLoadRegistry(message.payload.token, message.payload.repo, message.payload.registryPath);
        break;
      case "init-empty-registry":
        await handleInitEmptyRegistry(message.payload.repo, message.payload.registryPath);
        break;
      case "load-library":
        await handleLoadLibrary(message.payload.libraryInput, message.payload.token);
        break;
      case "scan":
        await handleScan(message.payload.scope);
        break;
      case "select-nodes":
        await handleSelectNodes(message.payload.nodeIds);
        break;
      case "apply-decision":
        await handleApplyDecision(message.payload.recordId, message.payload.decision, {
          comment: message.payload.comment,
          targetVariableId: message.payload.targetVariableId,
          targetName: message.payload.targetName,
          targetCollectionName: message.payload.targetCollectionName,
          proposedModeId: message.payload.proposedModeId,
          proposedModeName: message.payload.proposedModeName,
          currentLibraryValue: message.payload.currentLibraryValue,
          proposedValue: message.payload.proposedValue,
        });
        break;
      case "clear-decision":
        await handleClearDecision(message.payload.recordId);
        break;
      case "resize-window":
        handleResizeWindow(message.payload.width, message.payload.height);
        break;
      case "resize-window-end":
        await handleResizeWindowEnd(message.payload.width, message.payload.height);
        break;
      case "print-to-figma":
        await handlePrintToFigma(message.payload.sourceFormat, message.payload.results);
        break;
      case "build-preview":
        await handleBuildPreview(message.recordId, message.variableId);
        break;
      case "apply-to-layout":
        await handleApplyToLayout(message.recordId);
        break;
      default:
        break;
    }
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "Неизвестная ошибка плагина.";
    send({ type: "error", payload: { message: messageText } });
  }
};

async function bootstrap(): Promise<void> {
  const savedSize = await storage.getWindowSize();
  const initialSize = savedSize ?? storage.DEFAULT_WINDOW_SIZE;
  figma.showUI(__html__, {
    width: initialSize.width,
    height: initialSize.height,
    themeColors: true,
  });
}

void bootstrap();
