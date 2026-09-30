/**
 * Точка сборки движка для аудита в Figma через MCP `use_figma` (только
 * чтение). Собирает тот же код, что в плагине: адаптер, роли, изучение,
 * проверки образцов. См. `README.md` рядом.
 */
import { FigmaReader } from "../../src/adapters/figmaNode";
import { LanguageLearner, mergeSources } from "../../src/core/language";
import { checkExemplars } from "../../src/core/exemplarQuality";
import { detectRoles } from "../../src/core/roles";
(globalThis as unknown as { AUDIT: unknown }).AUDIT = { FigmaReader, LanguageLearner, mergeSources, detectRoles, checkExemplars };
