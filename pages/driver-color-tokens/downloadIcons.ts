import { iconAssetPath, ICON_DEFAULT_SIZE, type IconItem, type IconSection } from './iconsData';

export type IconDownloadFormat = 'svg' | 'pdf' | 'png1' | 'png2' | 'png3';

export interface IconDownloadFormatOption {
  id: IconDownloadFormat;
  label: string;
  extension: string;
  pngScale?: number;
}

export const ICON_DOWNLOAD_FORMATS: IconDownloadFormatOption[] = [
  { id: 'svg', label: 'SVG', extension: 'svg' },
  { id: 'pdf', label: 'PDF', extension: 'pdf' },
  { id: 'png1', label: 'PNG ×1', extension: 'png', pngScale: 1 },
  { id: 'png2', label: 'PNG ×2', extension: 'png', pngScale: 2 },
  { id: 'png3', label: 'PNG ×3', extension: 'png', pngScale: 3 },
];

export const DEFAULT_ICON_DOWNLOAD_FORMAT: IconDownloadFormat = 'svg';

const ICON_BASE_SIZE = ICON_DEFAULT_SIZE;

export interface IconAssetRef {
  sectionId: string;
  item: IconItem;
  path: string;
  assetUrl: string;
}

export function collectIconAssets(sections: IconSection[]): IconAssetRef[] {
  return sections.flatMap((section) =>
    section.items.map((item) => ({
      sectionId: section.id,
      item,
      path: `${section.id}/${item.id}`,
      assetUrl: iconAssetPath(section.id, item.id),
    })),
  );
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let index = 0; index < data.length; index += 1) {
    crc ^= data[index];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value: number): Uint8Array {
  return new Uint8Array([value & 0xff, (value >>> 8) & 0xff]);
}

function u32(value: number): Uint8Array {
  return new Uint8Array([
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  ]);
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

function createZip(files: { name: string; data: Uint8Array }[]): Blob {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.name);
    const crc = crc32(file.data);
    const localHeader = concatBytes([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(file.data.length),
      u32(file.data.length),
      u16(nameBytes.length),
      u16(0),
      nameBytes,
      file.data,
    ]);

    const centralHeader = concatBytes([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(file.data.length),
      u32(file.data.length),
      u16(nameBytes.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBytes,
    ]);

    localParts.push(localHeader);
    centralParts.push(centralHeader);
    offset += localHeader.length;
  }

  const centralDirectory = concatBytes(centralParts);
  const endRecord = concatBytes([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDirectory.length),
    u32(offset),
    u16(0),
  ]);

  return new Blob([concatBytes([...localParts, centralDirectory, endRecord])], {
    type: 'application/zip',
  });
}

async function fetchSvgText(assetUrl: string): Promise<string> {
  const response = await fetch(assetUrl);
  if (!response.ok) {
    throw new Error(`Не удалось загрузить ${assetUrl}`);
  }
  return response.text();
}

async function svgToRasterBlob(svgText: string, size: number, mimeType: 'image/png' | 'image/jpeg'): Promise<Blob> {
  const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('SVG render failed'));
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas unavailable');
    }
    context.clearRect(0, 0, size, size);
    context.drawImage(image, 0, 0, size, size);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error('Raster export failed'));
            return;
          }
          resolve(result);
        },
        mimeType,
        mimeType === 'image/jpeg' ? 0.92 : undefined,
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function blobToBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

function createPdfFromJpeg(jpegBytes: Uint8Array, width: number, height: number): Uint8Array {
  const chunks: Uint8Array[] = [];
  let size = 0;
  const objectOffsets: number[] = [0];

  const appendText = (text: string) => {
    const bytes = new TextEncoder().encode(text);
    chunks.push(bytes);
    size += bytes.length;
  };

  const appendBytes = (bytes: Uint8Array) => {
    chunks.push(bytes);
    size += bytes.length;
  };

  const startObject = (objectNumber: number, body: string) => {
    objectOffsets[objectNumber] = size;
    appendText(`${objectNumber} 0 obj\n${body}\n`);
  };

  appendText('%PDF-1.4\n');

  startObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
  appendText('endobj\n');

  startObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  appendText('endobj\n');

  startObject(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
  );
  appendText('endobj\n');

  objectOffsets[4] = size;
  appendText(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`,
  );
  appendBytes(jpegBytes);
  appendText('\nendstream\nendobj\n');

  const contentStream = `q\n${width} 0 0 ${height} 0 0 cm\n/Im0 Do\nQ\n`;

  startObject(5, `<< /Length ${contentStream.length} >>`);
  appendText('stream\n');
  appendText(contentStream);
  appendText('endstream\nendobj\n');

  const xrefOffset = size;
  appendText('xref\n');
  appendText('0 6\n');
  appendText('0000000000 65535 f \n');
  for (let index = 1; index <= 5; index += 1) {
    appendText(`${objectOffsets[index].toString().padStart(10, '0')} 00000 n \n`);
  }
  appendText('trailer\n');
  appendText('<< /Size 6 /Root 1 0 R >>\n');
  appendText('startxref\n');
  appendText(`${xrefOffset}\n`);
  appendText('%%EOF\n');

  return concatBytes(chunks);
}

async function exportIconAsset(
  asset: IconAssetRef,
  format: IconDownloadFormatOption,
): Promise<{ name: string; data: Uint8Array }> {
  const svgText = await fetchSvgText(asset.assetUrl);

  if (format.id === 'svg') {
    return {
      name: `${asset.path}.svg`,
      data: new TextEncoder().encode(svgText),
    };
  }

  const scale = format.pngScale ?? 1;
  const size = ICON_BASE_SIZE * scale;

  if (format.id === 'pdf') {
    const jpegBlob = await svgToRasterBlob(svgText, size, 'image/jpeg');
    const jpegBytes = await blobToBytes(jpegBlob);
    return {
      name: `${asset.path}.pdf`,
      data: createPdfFromJpeg(jpegBytes, size, size),
    };
  }

  const pngBlob = await svgToRasterBlob(svgText, size, 'image/png');
  return {
    name: `${asset.path}.png`,
    data: await blobToBytes(pngBlob),
  };
}

export async function downloadSingleIcon(
  sectionId: string,
  item: IconItem,
  formatId: IconDownloadFormat,
): Promise<void> {
  const format = ICON_DOWNLOAD_FORMATS.find((option) => option.id === formatId);
  if (!format) {
    throw new Error(`Unknown format: ${formatId}`);
  }

  const asset: IconAssetRef = {
    sectionId,
    item,
    path: `${sectionId}/${item.id}`,
    assetUrl: iconAssetPath(sectionId, item.id),
  };

  const file = await exportIconAsset(asset, format);
  const mimeType =
    format.id === 'svg' ? 'image/svg+xml' : format.id === 'pdf' ? 'application/pdf' : 'image/png';
  triggerBlobDownload(new Blob([file.data], { type: mimeType }), file.name);
}

export async function downloadIconArchive(
  sections: IconSection[],
  formatId: IconDownloadFormat,
): Promise<void> {
  const format = ICON_DOWNLOAD_FORMATS.find((option) => option.id === formatId);
  if (!format) {
    throw new Error(`Unknown format: ${formatId}`);
  }

  const assets = collectIconAssets(sections);
  if (assets.length === 0) {
    throw new Error('Нет иконок для скачивания');
  }

  const files = await Promise.all(assets.map((asset) => exportIconAsset(asset, format)));
  const zip = createZip(files);
  triggerBlobDownload(zip, `icons-${format.id}.zip`);
}

export function getIconDownloadFormatLabel(formatId: IconDownloadFormat): string {
  return ICON_DOWNLOAD_FORMATS.find((option) => option.id === formatId)?.label ?? formatId;
}
