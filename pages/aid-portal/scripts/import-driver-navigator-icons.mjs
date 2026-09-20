/**
 * Import navigator icons from Driver-Icons Figma file via REST API.
 * Exports symbol nodes directly (preserves opacity / multi-path layers).
 *
 * Usage:
 *   FIGMA_API_KEY=... node scripts/import-driver-navigator-icons.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const FILE_KEY = 'AwRpEGfyeNjRbZP8KGG1wy';
const SECTION_ID = 'navigator';
const BATCH = 50;

const rootDir = dirname(fileURLToPath(import.meta.url));
const publicRoot = join(rootDir, '../public/icons', SECTION_ID);

/** Symbol nodes from Figma frame 2641:4 (navigator). Instances excluded. */
const ICONS = [
  { id: 'lane_dots_left', figmaNodeId: '2787:1018' },
  { id: 'lane_dots_right', figmaNodeId: '2787:1031' },
  { id: 'lane_forward_0', figmaNodeId: '2787:1044' },
  { id: 'lane_forward_1', figmaNodeId: '2787:1043' },
  { id: 'lane_forward_right_0_0', figmaNodeId: '2787:1095' },
  { id: 'lane_forward_right_0_1', figmaNodeId: '2787:1096' },
  { id: 'lane_forward_right_1_0', figmaNodeId: '2787:1097' },
  { id: 'lane_forward_right_1_1', figmaNodeId: '2787:1098' },
  { id: 'lane_forward_sharply_right_0_0', figmaNodeId: '2787:1138' },
  { id: 'lane_forward_sharply_right_0_1', figmaNodeId: '2787:1139' },
  { id: 'lane_forward_sharply_right_1_0', figmaNodeId: '2787:1140' },
  { id: 'lane_forward_sharply_right_1_1', figmaNodeId: '2787:1141' },
  { id: 'lane_forward_slightly_right_0_0', figmaNodeId: '2787:1163' },
  { id: 'lane_forward_slightly_right_0_1', figmaNodeId: '2787:1164' },
  { id: 'lane_forward_slightly_right_1_0', figmaNodeId: '2787:1165' },
  { id: 'lane_forward_slightly_right_1_1', figmaNodeId: '2787:1166' },
  { id: 'lane_left_0', figmaNodeId: '2787:1176' },
  { id: 'lane_left_1', figmaNodeId: '2787:1177' },
  { id: 'lane_non_information', figmaNodeId: '2794:1954' },
  { id: 'lane_right_0', figmaNodeId: '2794:1959' },
  { id: 'lane_left_forward_0_0', figmaNodeId: '2787:1191' },
  { id: 'lane_left_forward_0_1', figmaNodeId: '2787:1192' },
  { id: 'lane_left_forward_1_0', figmaNodeId: '2787:1193' },
  { id: 'lane_left_forward_1_1', figmaNodeId: '2787:1194' },
  { id: 'lane_left_right_0_0', figmaNodeId: '2792:1264' },
  { id: 'lane_left_right_0_1', figmaNodeId: '2792:1265' },
  { id: 'lane_left_right_1_0', figmaNodeId: '2792:1266' },
  { id: 'lane_left_right_1_1', figmaNodeId: '2792:1267' },
  { id: 'lane_left_slightly_left_0_0', figmaNodeId: '2792:1293' },
  { id: 'lane_left_slightly_left_0_1', figmaNodeId: '2792:1294' },
  { id: 'lane_left_slightly_left_1_0', figmaNodeId: '2792:1295' },
  { id: 'lane_left_slightly_left_1_1', figmaNodeId: '2792:1296' },
  { id: 'lane_right_1', figmaNodeId: '2794:1960' },
  { id: 'lane_right_sharply_right_0_0', figmaNodeId: '2794:1961' },
  { id: 'lane_right_sharply_right_0_1', figmaNodeId: '2794:1962' },
  { id: 'lane_right_sharply_right_1_0', figmaNodeId: '2794:1963' },
  { id: 'lane_right_sharply_right_1_1', figmaNodeId: '2794:1964' },
  { id: 'lane_right_with_left_turn_0', figmaNodeId: '2794:1965' },
  { id: 'lane_right_with_left_turn_1', figmaNodeId: '2794:1966' },
  { id: 'lane_sharply_left_0', figmaNodeId: '2794:1967' },
  { id: 'lane_sharply_left_1', figmaNodeId: '2794:1968' },
  { id: 'lane_sharply_left_forward_0_0', figmaNodeId: '2794:1969' },
  { id: 'lane_sharply_left_forward_0_1', figmaNodeId: '2794:1970' },
  { id: 'lane_sharply_left_forward_1_0', figmaNodeId: '2794:1971' },
  { id: 'lane_sharply_left_forward_1_1', figmaNodeId: '2794:1972' },
  { id: 'lane_sharply_right_0', figmaNodeId: '2794:1985' },
  { id: 'lane_sharply_right_1', figmaNodeId: '2794:1986' },
  { id: 'lane_forward_right_with_left_turn_0_0', figmaNodeId: '2787:1099' },
  { id: 'lane_forward_right_with_left_turn_0_1', figmaNodeId: '2787:1100' },
  { id: 'lane_forward_right_with_left_turn_1_0', figmaNodeId: '2787:1102' },
  { id: 'lane_forward_right_with_left_turn_1_1', figmaNodeId: '2787:1101' },
  { id: 'lane_sharply_left_slightly_right_0_0', figmaNodeId: '2794:1981' },
  { id: 'lane_sharply_left_slightly_right_0_1', figmaNodeId: '2794:1982' },
  { id: 'lane_sharply_left_slightly_right_1_0', figmaNodeId: '2794:1983' },
  { id: 'lane_sharply_left_slightly_right_1_1', figmaNodeId: '2794:1984' },
  { id: 'lane_left_forward_right_0_0_0', figmaNodeId: '2792:1239' },
  { id: 'lane_left_forward_right_0_0_1', figmaNodeId: '2792:1240' },
  { id: 'lane_left_forward_right_0_1_0', figmaNodeId: '2792:1241' },
  { id: 'lane_left_forward_right_1_0_0', figmaNodeId: '2792:1242' },
  { id: 'lane_left_forward_right_1_1_1', figmaNodeId: '2792:1243' },
  { id: 'lane_slightly_left_right_0_0', figmaNodeId: '2794:1993' },
  { id: 'lane_slightly_left_right_0_1', figmaNodeId: '2794:1994' },
  { id: 'lane_slightly_left_right_1_0', figmaNodeId: '2794:1995' },
  { id: 'lane_slightly_left_right_1_1', figmaNodeId: '2794:1996' },
  { id: 'lane_slightly_left_sharply_right_0_0', figmaNodeId: '2794:1997' },
  { id: 'lane_slightly_left_sharply_right_0_1', figmaNodeId: '2794:1998' },
  { id: 'lane_slightly_left_sharply_right_1_0', figmaNodeId: '2794:1999' },
  { id: 'lane_slightly_left_sharply_right_1_1', figmaNodeId: '2887:24' },
  { id: 'lane_left_slightly_right_0_0', figmaNodeId: '2794:1950' },
  { id: 'lane_left_slightly_right_0_1', figmaNodeId: '2794:1951' },
  { id: 'lane_left_slightly_right_1_0', figmaNodeId: '2794:1952' },
  { id: 'lane_left_slightly_right_1_1', figmaNodeId: '2794:1953' },
  { id: 'lane_prohibited_0', figmaNodeId: '2794:1955' },
  { id: 'lane_prohibited_1', figmaNodeId: '2794:1956' },
  { id: 'lane_public_transport_0', figmaNodeId: '2794:1957' },
  { id: 'lane_public_transport_1', figmaNodeId: '2794:1958' },
  { id: 'lane_sharply_left_left_0_0', figmaNodeId: '2794:1973' },
  { id: 'lane_sharply_left_left_0_1', figmaNodeId: '2794:1974' },
  { id: 'lane_sharply_left_left_1_0', figmaNodeId: '2794:1975' },
  { id: 'lane_sharply_left_left_1_1', figmaNodeId: '2794:1976' },
  { id: 'lane_sharply_left_slightly_left_0_0', figmaNodeId: '2794:1977' },
  { id: 'lane_sharply_left_slightly_left_0_1', figmaNodeId: '2794:1978' },
  { id: 'lane_sharply_left_slightly_left_1_0', figmaNodeId: '2794:1979' },
  { id: 'lane_sharply_left_slightly_left_1_1', figmaNodeId: '2794:1980' },
  { id: 'lane_slightly_left_0', figmaNodeId: '2794:1987' },
  { id: 'lane_slightly_left_1', figmaNodeId: '2794:1988' },
  { id: 'lane_slightly_left_forward_0_0', figmaNodeId: '2794:1989' },
  { id: 'lane_slightly_left_forward_0_1', figmaNodeId: '2794:1990' },
  { id: 'lane_slightly_left_forward_1_0', figmaNodeId: '2794:1991' },
  { id: 'lane_slightly_left_forward_1_1', figmaNodeId: '2794:1992' },
  { id: 'lane_slightly_left_slightly_right_0_0', figmaNodeId: '2794:2001' },
  { id: 'lane_slightly_left_slightly_right_0_1', figmaNodeId: '2794:2002' },
  { id: 'lane_slightly_left_slightly_right_1_0', figmaNodeId: '2794:2003' },
  { id: 'lane_slightly_left_slightly_right_1_1', figmaNodeId: '2794:2004' },
  { id: 'lane_slightly_right_right_0_0', figmaNodeId: '2794:2007' },
  { id: 'lane_slightly_right_right_0_1', figmaNodeId: '2794:2008' },
  { id: 'lane_slightly_right_right_1_0', figmaNodeId: '2794:2009' },
  { id: 'lane_slightly_right_right_1_1', figmaNodeId: '2794:2010' },
  { id: 'lane_slightly_right_1', figmaNodeId: '2887:33' },
  { id: 'lane_slightly_right_sharply_right_0_0', figmaNodeId: '2794:2011' },
  { id: 'lane_slightly_right_sharply_right_0_1', figmaNodeId: '2794:2012' },
  { id: 'lane_slightly_right_sharply_right_1_0', figmaNodeId: '2794:2013' },
  { id: 'lane_slightly_right_sharply_right_1_1', figmaNodeId: '2794:2014' },
  { id: 'lane_slightly_right_0', figmaNodeId: '2878:31' },
  { id: 'lane_turnover_0', figmaNodeId: '2794:2015' },
  { id: 'lane_turnover_1', figmaNodeId: '2794:2016' },
  { id: 'ic_maneuver_crossroad_left_light', figmaNodeId: '2905:328' },
  { id: 'ic_maneuver_crossroad_right_light', figmaNodeId: '2909:80' },
  { id: 'ic_maneuver_crossroad_sharply_left_light', figmaNodeId: '2909:92' },
  { id: 'ic_maneuver_crossroad_sharply_right_light', figmaNodeId: '2909:107' },
  { id: 'ic_maneuver_crossroad_slightly_left_light', figmaNodeId: '2909:121' },
  { id: 'ic_maneuver_crossroad_slightly_right_light', figmaNodeId: '2910:138' },
  { id: 'ic_maneuver_crossroad_straight_light', figmaNodeId: '2910:149' },
  { id: 'ic_maneuver_start_light', figmaNodeId: '2912:463' },
  { id: 'ic_maneuver_crossroad_uturn_light', figmaNodeId: '2910:161' },
  { id: 'ic_maneuver_uturn_light', figmaNodeId: '2912:468' },
  { id: 'ic_maneuver_crossroad_keep_right_light', figmaNodeId: '3130:301' },
  { id: 'ic_maneuver_crossroad_keep_left_light', figmaNodeId: '3130:298' },
  { id: 'ic_maneuver_finish_light', figmaNodeId: '2910:175' },
  { id: 'ic_maneuver_roundabout_backward_light', figmaNodeId: '2910:192' },
  { id: 'ic_maneuver_roundabout_lefthand_backward_light', figmaNodeId: '2912:316' },
  { id: 'ic_maneuver_roundabout_left_90_light', figmaNodeId: '2909:41' },
  { id: 'ic_maneuver_roundabout_lefthand_right_90_light', figmaNodeId: '2912:406' },
  { id: 'ic_maneuver_roundabout_left_135_light', figmaNodeId: '2912:303' },
  { id: 'ic_maneuver_roundabout_lefthand_right_135_light', figmaNodeId: '2912:417' },
  { id: 'ic_maneuver_roundabout_exit_light', figmaNodeId: '2912:208' },
  { id: 'ic_maneuver_roundabout_forward_light', figmaNodeId: '2912:228' },
  { id: 'ic_maneuver_roundabout_lefthand_forward_light', figmaNodeId: '2912:335' },
  { id: 'ic_maneuver_roundabout_lefthand_left_45_light', figmaNodeId: '2912:346' },
  { id: 'ic_maneuver_roundabout_right_135_light', figmaNodeId: '2912:450' },
  { id: 'ic_maneuver_roundabout_lefthand_left_90_light', figmaNodeId: '2912:364' },
  { id: 'ic_maneuver_roundabout_right_90_light', figmaNodeId: '2912:439' },
  { id: 'ic_maneuver_roundabout_lefthand_left_135_light', figmaNodeId: '2912:384' },
  { id: 'ic_maneuver_roundabout_right_45_light', figmaNodeId: '2912:428' },
  { id: 'ic_maneuver_roundabout_lefthand_right_45_light', figmaNodeId: '2912:395' },
  { id: 'ic_maneuver_roundabout_left_45_light', figmaNodeId: '2912:256' },
];

function resolveToken() {
  if (process.env.FIGMA_API_KEY || process.env.FIGMA_API_TOKEN) {
    return process.env.FIGMA_API_KEY || process.env.FIGMA_API_TOKEN;
  }

  try {
    const mcpPath = join(rootDir, '../../../.cursor/mcp.json');
    const mcp = JSON.parse(readFileSync(mcpPath, 'utf8'));
    const servers = mcp?.mcpServers ?? {};
    for (const server of Object.values(servers)) {
      const env = server?.env ?? {};
      const key = env.FIGMA_API_KEY || env.FIGMA_API_TOKEN;
      if (key) {
        return key;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function sanitizeNavigatorSvg(svgText, iconId) {
  if (!svgText.includes('fill="#F2F2F2"') && !svgText.includes('id="navigator"')) {
    return svgText.trim();
  }

  const openNeedle = `<g id="${iconId}"`;
  const start = svgText.indexOf(openNeedle);
  if (start === -1) {
    return svgText.trim();
  }

  const contentStart = svgText.indexOf('>', start) + 1;
  let depth = 1;
  let index = contentStart;
  while (index < svgText.length && depth > 0) {
    const nextOpen = svgText.indexOf('<g', index);
    const nextClose = svgText.indexOf('</g>', index);
    if (nextClose === -1) break;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      index = nextOpen + 2;
      continue;
    }
    depth -= 1;
    if (depth === 0) {
      const inner = svgText.slice(contentStart, nextClose).trim();
      const root = svgText.match(/<svg\b([^>]*)>/i);
      const attrs = root?.[1] ?? 'width="24" height="24" viewBox="0 0 24 24" fill="none"';
      return `<svg ${attrs} xmlns="http://www.w3.org/2000/svg">\n${inner}\n</svg>`;
    }
    index = nextClose + 4;
  }

  return svgText.trim();
}

const token = resolveToken();
if (!token) {
  console.error('Set FIGMA_API_KEY or FIGMA_API_TOKEN');
  process.exit(1);
}

await mkdir(publicRoot, { recursive: true });

let ok = 0;
const errors = [];

for (let i = 0; i < ICONS.length; i += BATCH) {
  const batch = ICONS.slice(i, i + BATCH);
  const ids = batch.map((item) => item.figmaNodeId).join(',');
  const apiUrl = `https://api.figma.com/v1/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&format=svg&svg_outline_text=false&svg_include_id=true`;

  const res = await fetch(apiUrl, { headers: { 'X-Figma-Token': token } });
  if (!res.ok) {
    throw new Error(`Figma API ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  if (data.err) {
    throw new Error(data.err);
  }

  for (const item of batch) {
    const assetUrl = data.images[item.figmaNodeId];
    if (!assetUrl) {
      errors.push({ id: item.id, error: 'No URL in response' });
      continue;
    }

    try {
      const svgRes = await fetch(assetUrl);
      if (!svgRes.ok) {
        throw new Error(`Download ${svgRes.status}`);
      }
      const raw = await svgRes.text();
      const sanitized = sanitizeNavigatorSvg(raw, item.id);
      await writeFile(join(publicRoot, `${item.id}.svg`), `${sanitized}\n`, 'utf8');
      ok += 1;
    } catch (error) {
      errors.push({ id: item.id, error: String(error) });
    }
  }
}

console.log(JSON.stringify({ section: SECTION_ID, total: ICONS.length, ok, errors }, null, 2));

spawnSync(process.execPath, ['scripts/ensure-icon-dimensions.mjs'], {
  cwd: join(rootDir, '..'),
  stdio: 'inherit',
});
