import { describe, expect, it } from 'vitest';
import { extractIconSymbolSvg } from '../sanitizeIconSvg';

const exportWithFrames = [
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">',
  '<rect width="24" height="24" fill="#E5E5E5"/>',
  '<g id="Icons">',
  '<g id="Actions" filter="url(#filter0_d_0_1)">',
  '<rect x="-168" y="-436" width="880" height="744" rx="30" fill="white"/>',
  '<g id="ic_card_fill" clip-path="url(#clip0_1_2)">',
  '<g id="inner"><rect width="10" height="10" fill="white"/></g>',
  '<path d="M1 1H2" fill="url(#paint0_linear_1_2)"/>',
  '</g>',
  '</g>',
  '</g>',
  '<defs>',
  '<filter id="filter0_d_0_1" x="0" y="0"><feFlood flood-opacity="0"/></filter>',
  '<linearGradient id="paint0_linear_1_2" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#000"/></linearGradient>',
  '<clipPath id="clip0_1_2"><rect width="24" height="24" fill="white"/></clipPath>',
  '</defs>',
  '</svg>',
].join('\n');

describe('extractIconSymbolSvg', () => {
  it('keeps the symbol group with nested groups and drops parent frames', () => {
    const svg = extractIconSymbolSvg(exportWithFrames, 'ic_card_fill') ?? '';
    expect(svg).toContain('<g id="ic_card_fill" clip-path="url(#clip0_1_2)">');
    expect(svg).toContain('<g id="inner"><rect width="10" height="10" fill="white"/></g>');
    expect(svg).not.toContain('#E5E5E5');
    expect(svg).not.toContain('id="Actions"');
    expect(svg.match(/<\/g>/g)).toHaveLength(2);
  });

  it('keeps only referenced defs', () => {
    const svg = extractIconSymbolSvg(exportWithFrames, 'ic_card_fill') ?? '';
    expect(svg).toContain('<clipPath id="clip0_1_2">');
    expect(svg).toContain('<linearGradient id="paint0_linear_1_2"');
    expect(svg).not.toContain('filter0_d_0_1');
  });

  it('returns null when the symbol is missing', () => {
    expect(extractIconSymbolSvg(exportWithFrames, 'ic_missing')).toBeNull();
  });
});
