---
name: ds-developer-guide
metadata:
  version: "1.1.0"
description: Build the complete Developer Guide page for a component in the Souz Design System Figma file (sections "Общее", "💻 Для разработчиков", "Layout"). Use whenever the user asks to generate, update, or fix a developer guide / DS guide page for a Figma component, component set, or preset. Covers template import, section layout, annotation drawing (anatomy/radius/sizes), text styles, dark mode, and mockups.
---

# DS Developer Guide — Souz Design System

Builds the 3 top-level sections that every component page needs:

1. **Общее** — navigation hub (always required)
2. **💻 Для разработчиков** — main developer guide (always required)
3. **Layout** — per-type visual spec (required, **except for Presets** — path contains `/Preset/`)

**§0 below is the literal order of execution — follow it top to bottom.** Everything after §0 is reference material for the steps in §0, cross-referenced by number; it is not itself a second, competing sequence. If something in §0 and something later in the file ever seem to disagree, §0 wins.

Sections marked **⚠️ Unverified** describe the theoretically correct approach but haven't been battle-tested on a real guide yet — treat them as a starting point, sanity-check visually, and flag anything that looks off.

## ⛔ Execution discipline

- Follow ONLY the steps listed in this skill. Do NOT add, invent, 
  or "improve" anything beyond what is explicitly described.
- If a property or action is not mentioned — do NOT set or perform it.
- If in doubt whether something should be done — skip it. 
  Missing a step is fixable; inventing a wrong step wastes the user's time.
- Treat every § as a checklist: execute each bullet, nothing more.


---

## 0. Workflow — the order of execution

0. **Get the Figma link — before anything else, before step 1.** This skill can be invoked two ways:
   - **With a Figma link already given** (a `figma.com/design/...` URL, with or without `node-id`, pasted in the same message that triggered this skill) — use it directly, skip straight to step 1.
   - **Without one** — this is a hard stop (§0.2): ask *"Дай ссылку на компонент в Figma (design URL, желательно с node-id выделенного слоя)"* and wait for the answer before running any `figma.*` call or touching a live selection. Never fall back to "whatever is currently selected" as a silent default — a stale selection from a previous, unrelated task is exactly how the wrong component gets a guide built for it.
   See §0.3 for URL parsing and for what to do once you have the link.
1. **Resolve input & identity.** With the link from step 0 (or, if this run is happening inside a live Figma plugin session with a real selection, `figma.getNodeByIdAsync` on that selection) resolve component identity: `INSTANCE` → `node.mainComponent.parent` (the `COMPONENT_SET`); `COMPONENT`/`COMPONENT_SET` → `node.name`.
2. **Ask, before touching Figma at all — three blocking questions, in this order** (§0.2 — each is a hard stop, wait for the answer before asking the next one):
   1. **Multiple components selected?** If so: *"Вы выбрали несколько компонентов: {list}. Строить один общий гайд для всех, или отдельный гайд на каждый?"* Skip this question if only one component/component set is selected.
   2. **Behavior**: write your own assumptions about how the component behaves, then ask *"Как ведёт себя компонент?"* with suggested answer options (§4.7 uses the answer).
   3. **Mockup scenario**: invent 2 concrete usage scenarios for the component in a banking-app context, then ask which one to build (or none) (§4.0 uses the answer).
   Write each answer to the checkpoint (§0.1) immediately after receiving it.
3. **Determine Preset vs regular component.** No formal API check exists — rely on the user or on inspecting the layer's location for a `/Preset/`-like path segment. Ask if genuinely ambiguous. Presets skip Layout entirely (step 9 below).
4. **Check for an existing checkpoint** (§0.1) — this run may be a retry after a crash, not a fresh start.
5. **Load all fonts up front** (§1.6).
6. **Import and place the 5 top-level `[AGENT]` frames** using the fixed offsets in §2. Nothing is wrapped in a section yet at this point — just the raw imported/detached frames, positioned relative to each other.
7. **Wrap `[AGENT] Общее`** in the green "Общее" section and finish its content (§3) — write checkpoint after.
8. **Build the content of `[AGENT] Developer Guide`** (§4), in this exact block order: Guide Header Detailed (+ Mockup) → Анатомия → Скругления → Размеры и отступы → Типы → Состояния → Область тапа → Поведение → Ограничения → Анимация. Write checkpoint after each block, not just at the end.
9. **Wrap `[AGENT] Changelog`, `[AGENT] [OLD] Component`, `[AGENT] Developer Guide`** each in their own grey sub-section, then wrap all three together in the blue "💻 Для разработчиков" section (§5) — write checkpoint after.
10. **Build Layout** (§6) — skip entirely for Presets. Write checkpoint after.
11. **Verify** (§7).
12. **Post the closing message** (§8) and clear the checkpoint.

### 0.1 Checkpointing — recovering from a crash mid-build

Runs can die mid-build (platform timeout, connection drop) and get retried from scratch by the user hitting "Try again". Without a checkpoint, a retry re-asks questions the user already answered and can duplicate sections that already exist on the page.

**Before doing anything else in step 4 above**, look for an existing checkpoint note on the page:
```javascript
function findCheckpoint() {
  return figma.currentPage.findOne(n => n.type === 'TEXT' && n.name === '__ds_guide_checkpoint__');
}
```
If found, read its `.characters` (a small JSON blob, e.g. `{"component":"Switch","behaviorAnswer":"Тап переключает...","mockupAnswer":"Вариант 1","done":["Общее","Behavior"]}`) and **resume from there** instead of re-running everything:
- If `behaviorAnswer` / `mockupAnswer` are already set, don't ask those questions again — reuse the stored answers.
- If a section name is already in `done`, check whether it already exists on the page (`figma.currentPage.findOne(n => n.type === 'SECTION' && n.name === '...')`). If it does, skip rebuilding it. If the checkpoint says done but the section is missing (crashed mid-write), rebuild just that one.

**After each major step**, update the checkpoint (create it if it doesn't exist yet):
```javascript
async function writeCheckpoint(data) {
  let note = findCheckpoint();
  if (!note) {
    note = figma.createText();
    note.name = '__ds_guide_checkpoint__';
    note.visible = false; // keep it out of the way, not part of the visible guide
    figma.currentPage.appendChild(note);
  }
  await figma.loadFontAsync(note.fontName ?? { family: "Inter", style: "Regular" });
  note.characters = JSON.stringify(data);
}
```

**On successful completion**, delete the checkpoint node so a future unrelated run doesn't pick up stale state.

### 0.2 Questions are blocking — never work in parallel with an open question

Every question to the user in this skill (the Figma-link question in step 0, the 3 upfront questions in step 2, Preset ambiguity in step 3) is a **hard stop**: ask, then stop issuing tool calls entirely until the answer arrives. Don't run any `figma.*` code, don't build the next section, don't do "useful work in the meantime" while a question is pending — there is no such thing as "in the meantime" here. There's no real concurrency between a pending chat question and code execution in this environment; anything that looks like "asking and continuing at the same time" is actually two separate, un-synchronized runs, and it's exactly what produces duplicated sections and crashes right after the user answers. Treat a posted question as the last action in that turn, full stop.

### 0.3 Parsing the Figma link from step 0

Extract `fileKey` and `nodeId` from the URL:
- `figma.com/design/:fileKey/:fileName?node-id=:nodeId` → convert `-` to `:` in `nodeId` (e.g. `1509-9956` → `1509:9956`).
- `figma.com/design/:fileKey/branch/:branchKey/:fileName` → use `branchKey` as the effective `fileKey`.

Once parsed, resolve the node before doing anything else in step 1:
- **Running inside a live Figma plugin session** — `await figma.getNodeByIdAsync(nodeId)` against the open file (confirm it's the same file as `fileKey`; if not, ask the user to open the right file first).
- **Running outside a plugin** (e.g. through a connected Figma MCP/tool integration that only exposes read-oriented calls such as "get design context", "get metadata", "get screenshot" rather than raw `figma.*` scripting) — use those tools with the parsed `fileKey`/`nodeId` to resolve identity and pull reference context, and say so explicitly: the parts of this skill below step 1 that call `figma.createSection()`, `importComponentByKeyAsync()`, `detachInstance()`, etc. require actual Plugin API execution and cannot run through a read-only integration. Don't silently skip this mismatch — flag it to the user and ask how they want to proceed (e.g. build the guide manually via the plugin console themselves, using this skill as the script/spec, vs. producing whatever subset is achievable with the available read-only tools).

---

## 1. Shared reference — read once before building

### 1.1 Template Import Pattern & the no-detach rule

All structural templates come from the Guide Intern library.

```javascript
const comp = await figma.importComponentByKeyAsync("KEY");
const frame = comp.createInstance().detachInstance();
// frame is now a regular FRAME — edit texts, add content, position freely
```

> ⚠️ **CRITICAL — `detachInstance()` only for the 5 top-level `[AGENT]` frames.**
>
> This pattern applies to the top-level `[AGENT]` frames only: Общее, Changelog, [OLD] Component, Developer Guide, Layout (and Мокап, which is imported as part of Developer Guide's build). All Guide Intern components **nested inside** an `[AGENT]` frame — Guide Block, Guide List, Guide Card Layout, Guide Header Detailed, Guide Header Short, FingerAction, and so on — must **NOT** be detached. Work with them exclusively through their `SLOT`, keeping them as instances:
> ```javascript
> const slot = guideBlock.findOne(n => n.name === 'Slot');
> slot.appendChild(content);
> ```
> Detaching a nested component destroys the library's styling and structure — it stops being a real Guide Block/Guide List/etc. and becomes an arbitrary frame that happens to look similar at that moment.
>
> **Exception:** Guide Header Detailed — set its component properties *before* detaching is not applicable since it's never detached at all; set its properties while it's still an instance (component properties only work on instances) — see §4.0.

### Guide Block: clear the slot and hide the default pattern before adding content

The Guide Block SLOT ships with a default **"Content"** frame containing six Button-instance examples from the library template. Creating a fresh Guide Block instance does **not** clear this — it's part of the template, not scaffolding that goes away on its own. If you skip clearing it, your own content gets added *on top of* the default buttons, and both end up visible in the finished block.

Guide Block also has a component property, **`Show Pattern#20:0`**, that shows a separate default pattern (also full of Button examples). This property does **not** accept `setProperties({ 'Show Pattern': ... })` — the plugin API requires the name-with-suffix form, and using the bare name throws `Could not find component property with name 'Show Pattern'`. Hide it via visibility on the `Pattern` frame instead.

Do both of these **right after creating** the Guide Block instance (it stays an instance, never detached), **before** adding any of your own content:

```javascript
// 1. Clear the default "Content" frame (Button examples) out of the slot
function clearSlot(guideBlockFrame) {
  const slot = guideBlockFrame.findOne(n => n.name === 'Slot');
  if (!slot) return slot;
  while (slot.children.length > 0) slot.children[0].remove();
  return slot;
}
const slot = clearSlot(guideBlockFrame);

// 2. Hide the "Show Pattern" default pattern via visibility, not setProperties()
const patternFrame = guideBlockFrame.findOne(n => n.name === 'Pattern');
if (patternFrame) patternFrame.visible = false;

// THEN add your own content to `slot`
```

**`clearSlot()` is mandatory for EVERY Guide Block**, including placeholder blocks (Анимация, Ограничения) that end up with no content added to them (§4.8). If a block is meant to stay empty, still clear its slot and leave it empty — don't skip the call just because there's nothing to add.

### Slot content wrapper — plain frame, NOT auto-layout

Right after `clearSlot()`, everything you add to the slot goes inside **one plain FRAME** (not an auto-layout frame):

```javascript
const content = figma.createFrame();
content.name = 'Content';
content.fills = [];
slot.appendChild(content);
content.layoutSizingHorizontal = 'FILL'; // matches the slot's width
// content.layoutMode stays 'NONE' — do NOT turn this into an auto-layout frame,
// and do NOT set layoutSizingVertical = 'HUG'.
```

Because `content` is a plain frame, its height does **not** self-adjust to what you put inside it. Once you've placed the block's actual content inside `content`, **manually resize `content.height`** (e.g. from the bottom-most child's `y + height`, plus whatever bottom breathing room the block needs) so nothing renders clipped/cut off. Skipping this manual resize is the usual cause of elements getting cut off at the bottom of a block.

### Guide Block text stays short — captions only

A Guide Block's slot is for short captions/labels next to the annotated component (e.g. a token name, a one-line note) — not for paragraphs of explanation. If a block genuinely needs substantial descriptive text, put that text in its own text block placed **before** the Guide Block (at the block's top level, outside the slot) instead of stuffing it into the slot.

### 1.2 Template keys (the 5 top-level `[AGENT]` frames)

| Template | Key |
|---|---|
| [AGENT] Общее | `979a55eec2748a756810a7bc156b04f29fec2270` |
| [AGENT] Changelog | `5d73b4f2e7dff14efba57d6fc69cba667832329f` |
| [AGENT] [OLD] Component | `6c7e15716bfd430c13d404d6a8f74c2bec9858fd` |
| [AGENT] Developer Guide | `b92d7ced0183a7098625461e4652fb1b7803f482` |
| [AGENT] Counter | `ad491200b4eda7add41897c59752fce6c83c10be` |
| [AGENT] Мокап | `005945978b1abe329d1e59dfd8515fce5021e184` |
| [AGENT] Layouts (12 variants) | see below |

Layout keys (12 total — inspect each once to know which type/theme it maps to, then cache that mapping):
```
6290fdfa8c97cb4f175b2b8d75d872e5eb87f4bc
f6d8845066d50b39f39b10ef5ba06af76cd509be
9bb0d9777a4f846648a15020fab1ca397be0af25
2057e509820969f3b761351e7e8425091efcf08f
140589ac2accf2a64a577e52d6148aaaed89131f
74294fb27082bd4c2a075c6847dea3ffea8438d2
22b5aa792757c0caa7e047b8d4ef9147818ebdf2
d092909b86c5d5315f2a92fe0b09f0f3a3e87c20
ac7631ece719761f20e481dcababba2fa855d9b1
69981e1e1559a630c29370e44b6ed7f1dfba633b
dd8b97f7163634b59820a0e8b95f5ac6b20d4144
6a79d1d923df2a27c20e3f7463c50264bc0e953b
```

### 1.3 Guide Intern component keys (nested — never detached)

| Component | Key |
|---|---|
| Guide Block | `2b547e40a6a9a670b2ef6813d48eb1407c7da5d1` |
| Guide List | `f661298138dc8621c9977211a30df1b9a9731bae` |
| Guide List Item | *(nested inside Guide List's own slot — import via the same key, or clone an existing item)* |
| Guide Header Short | `d0eeef49f5dce51a63fa8380decf42d834df9e8c` |
| Guide Header Detailed | `4cce4cbfc21bdf429c3d22ce6a2a105b255a5678` |
| Guide Card Layout | `2e7de89188dbdd5a4339418bcef320d475320242` |
| FingerAction | *(used in Поведение, §4.7 — inspect once for its key, it isn't in the original key list; if you can't find it, ask the user for the component key rather than fabricating one)* |

### 1.4 SLOT quirks

A `SLOT` node inside a Guide Block **INSTANCE** cannot have its `layoutMode` changed. Any write to `slot.layoutMode` appears to succeed but silently reverts to the value defined by the component — for example, trying to set `slot.layoutMode = 'HORIZONTAL'` on a slot whose component defines it as `'VERTICAL'` will just snap back to `'VERTICAL'`. Don't burn multiple retries on this; it will not work no matter how it's set.

To lay out multiple items horizontally (or with any layout different from the slot's own) inside a SLOT: create a plain `FRAME` with the layout you need, add your items to that frame, then append the frame to the slot as a single child.

```javascript
// WRONG — reverts silently, does not throw:
// slot.layoutMode = 'HORIZONTAL';

// RIGHT — wrap content in a plain FRAME with the desired layout, then append that:
const wrapper = figma.createFrame();
wrapper.layoutMode = 'HORIZONTAL';
wrapper.itemSpacing = 32;
wrapper.fills = [];
wrapper.layoutSizingHorizontal = 'HUG';
wrapper.layoutSizingVertical = 'HUG';
// add each item to `wrapper` here
slot.appendChild(wrapper);
```

This applies to any SLOT inside any Guide Intern INSTANCE, not just Guide Block.

### 1.5 Finding nodes — by name, never by text content

**Always look up nodes by `node.name`, never by text content.** Placeholder text (e.g. "Описание", "Button") can change when the library template is updated; layer names are far more stable.

Known stable layer names in Guide Intern templates:

| Layer name | What it is |
|---|---|
| `Title` | block heading — also the text layer inside `TopBar` holding the mockup's screen name (§4.0) |
| `Text` | description / body text |
| `Slot` | generic content slot |
| `Image` | mockup image slot inside Guide Header Detailed |
| `Label` | caption under an instance |

If a frame has multiple `Text` nodes, disambiguate by also checking `node.type === 'TEXT'` and the parent's name (e.g. `parent.name === 'Block'`).

For the Mockup's image slot specifically, template naming isn't fully consistent across all shapes — fall back to a looser match:
```javascript
function findImageSlot(root) {
  const exact = findByName(root, n => n.type === 'SLOT' && n.name === 'Image');
  if (exact) return exact;
  return findByName(root, n => (n.type === 'FRAME' || n.type === 'SLOT')
    && n.name.toLowerCase().includes('image'));
}
```

**Never modify text nodes inside component instances** — only inside plain frames/templates you've detached:
```javascript
function isInsideInstance(node) {
  let p = node.parent;
  while (p && p.type !== 'PAGE') { if (p.type === 'INSTANCE') return true; p = p.parent; }
  return false;
}
// check isInsideInstance(node) === false before touching textStyleId / characters / fills
```

### 1.6 Fonts — load everything before touching `.characters`

**No exceptions.** Every text node — including a single digit in an anatomy pill marker, a bullet in the Behavior block, a label under a chip — needs its font loaded before you write to `.characters` or `.textStyleId`, or the call throws / silently fails.

```javascript
await Promise.all([
  figma.loadFontAsync({ family: "Inter", style: "Regular" }),
  figma.loadFontAsync({ family: "Inter", style: "Medium" }),
  figma.loadFontAsync({ family: "Inter", style: "SemiBold" }),
]);
```

Loading a font that's already loaded is a harmless no-op — front-load generously. For text coming from a detached template (e.g. replacing "Description" with real copy), still call `await figma.loadFontAsync(t.fontName)` per-node before editing — the template node may use a font/style not in your up-front batch.

### 1.7 Section visual rules & resizing

**Every section** — outer top-level (Общее, Для разработчиков, Layout) and every grey sub-section (Changelog, [OLD] Component, Developer Guide, Counter) — follows the same two rules:
- `cornerRadius: 64`, no strokes (`section.strokes = []`)
- **Padding 112**: the wrapped frame sits 112px from every edge of its section.

Fill colors — **white goes at array index 0, the colored fill goes last**. Figma renders higher array indices on top, so the colored fill needs to be last to render above white and actually tint the section's name-bubble. Get the order backwards and the bubble renders white/grey instead of tinted:
- Общее: `[ #FFFFFF @ 50%, #A2E361 @ 0.01% ]`
- Для разработчиков: `[ #FFFFFF @ 50%, #3C99EF @ 0.01% ]`
- Layout(s): `[ #FFFFFF @ 50%, #5B76E2 @ 0.01% ]`
- Sub-sections (Changelog / [OLD] Component / Developer Guide / Counter): flat `#E7E7E7`, no gradient/two-fill trick needed.

Frames *inside* sub-sections: `cornerRadius: 40`, `clipsContent: true`.

**Sections never auto-resize.** `figma.createSection()` produces a `496×496` default and the Plugin API does not resize it when you `appendChild()` into it. Resize explicitly, only *after* all of a section's children are already added and positioned:

```javascript
function resizeSectionToContent(sec, padding = 112) {
  let maxX = 0, maxY = 0;
  for (const child of sec.children) {
    maxX = Math.max(maxX, child.x + child.width);
    maxY = Math.max(maxY, child.y + child.height);
  }
  sec.resizeWithoutConstraints(maxX + padding, maxY + padding);
}
```

**Wrapping a frame that's already positioned on the page** (this is how every wrap in this skill works, per §2 below — frames are placed first, wrapped into sections later): capture the frame's current page position *before* reparenting it into the new section, so the section ends up exactly where the frame used to be, with 112px padding around it:

```javascript
function wrapPreservingPosition(frame, name, fills) {
  const origX = frame.x, origY = frame.y; // still page-absolute at this point (frame's parent is the page)
  const sec = figma.createSection();
  sec.name = name;
  sec.cornerRadius = 64;
  sec.strokes = [];
  sec.fills = fills;
  figma.currentPage.appendChild(sec);
  sec.appendChild(frame); // reparents — frame.x/y are now relative to sec, not the page
  frame.x = 112; frame.y = 112;
  sec.x = origX - 112; sec.y = origY - 112;
  resizeSectionToContent(sec);
  return sec;
}
```

### 1.8 Text styles (guide-authored nodes only — never inside component instances)

| Role | Style name | Style ID | Color variable |
|---|---|---|---|
| Section title (24px Bold) | Guide/Heading/Title L | `S:f0f583399f729d5c5bb98ed099f9eb7cc6dec9b1,5:1` | text/base/main |
| Sub-heading (18px Bold) | Guide/Heading/Title M | `S:93942d67b91a6fce36aad72677c9c28c3334e215,5:2` | text/base/main |
| Sub-sub-heading (16px SemiBold) | Guide/Heading/Title S | `S:e93271ba1527563330d83e849722a37583c54c57,5:3` | text/base/main |
| Body text (14px Regular) | Guide/Text/Body M | `S:d72bdd82ea4b6e46b48ad2ba4bae6de957063e11,5:5` | text/base/main |
| Labels under components (12px Medium) | Guide/Text/Label S | `S:9f02caf352e8028e796896de9e8e9a93f6a68bca,5:9` | text/base/main-secondary |

```javascript
const mainVar = await figma.variables.getVariableByIdAsync("VariableID:a5faea7006c86ab4c7ba6944b3f9412d09e8f4b3/84:798");
const secVar  = await figma.variables.getVariableByIdAsync("VariableID:40dcb233c8b7ebbbbe305c84bab791a2c0410dc2/84:800");

const boundFill = figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: 0.098, g: 0.141, b: 0.2 } }, 'color', mainVar
);
textNode.fills = [boundFill];
```

**`counterAxisAlignItems` valid values: `'MIN' | 'MAX' | 'CENTER' | 'BASELINE'`.** `'END'` does not exist and throws a validation error — use `'MAX'` for end-alignment.

---

## 2. Placing the 5 top-level `[AGENT]` frames

Import and detach all 5 templates (§1.1, §1.2) first, **before wrapping any of them into a section**. Position them relative to each other using these fixed offsets:

```
[AGENT] Общее             x = 500                                            y = 0
[AGENT] Changelog         x = Общее.x + Общее.width + 538                    y = Общее.y
[AGENT] [OLD] Component   x = Changelog.x                                    y = Changelog.y + Changelog.height + 248
[AGENT] Developer Guide   x = Changelog.x + Changelog.width + 248            y = Changelog.y
[AGENT] Layouts           x = Developer Guide.x + Developer Guide.width + 536  y = Developer Guide.y
```

```javascript
const общее = (await figma.importComponentByKeyAsync("979a55eec2748a756810a7bc156b04f29fec2270")).createInstance().detachInstance();
общее.x = 500; общее.y = 0;
figma.currentPage.appendChild(общее);

const changelog = (await figma.importComponentByKeyAsync("5d73b4f2e7dff14efba57d6fc69cba667832329f")).createInstance().detachInstance();
figma.currentPage.appendChild(changelog);
changelog.x = общее.x + общее.width + 538;
changelog.y = общее.y;

const oldComponent = (await figma.importComponentByKeyAsync("6c7e15716bfd430c13d404d6a8f74c2bec9858fd")).createInstance().detachInstance();
figma.currentPage.appendChild(oldComponent);
oldComponent.x = changelog.x;
oldComponent.y = changelog.y + changelog.height + 248;

const devGuide = (await figma.importComponentByKeyAsync("b92d7ced0183a7098625461e4652fb1b7803f482")).createInstance().detachInstance();
figma.currentPage.appendChild(devGuide);
devGuide.x = changelog.x + changelog.width + 248;
devGuide.y = changelog.y;

const layouts = (await figma.importComponentByKeyAsync("LAYOUT_KEY")).createInstance().detachInstance(); // first Layout frame, §6
figma.currentPage.appendChild(layouts);
layouts.x = devGuide.x + devGuide.width + 536;
layouts.y = devGuide.y;
```

These 5 frames stay as loose page-level frames until each gets wrapped into its section later (§3, §5, §6) via `wrapPreservingPosition()` (§1.7) — wrapping preserves whatever position was set here, so get the numbers right up front rather than repositioning after wrapping.

---

## 3. `[AGENT] Общее` — content & wrap

```javascript
// Guide Header Short (first INSTANCE child)
const hs = общее.children.find(c => c.type === 'INSTANCE');
const tk = Object.keys(hs.componentProperties).find(k => k.startsWith('Title'));
hs.setProperties({ [tk]: componentDisplayName });

// Description — find by layer name, not text content
const gh = общее.children.find(c => c.name === '_Guide-Header');
if (gh) {
  const descText = findByName(gh, n => n.type === 'TEXT' && n.name === 'Text');
  if (descText) {
    await figma.loadFontAsync(descText.fontName);
    descText.characters = componentDescription;
  }
}

// Preview section: Replace Button instances with the real component instances, add type labels below each
// Remove any leftover black placeholder rectangle: fill rgba(0,0,0,60%)
```

### Preview section rules
- **< 3 component types** → vertical layout, 32px gap between groups (chip+label), 8px between chip and label
- **≥ 3 types** → horizontal row
- No black placeholder rectangle
- Labels under instances: `Guide/Text/Label S` style + `text/base/main-secondary` variable

### Links in Guide Link Block "For Dev"
Use `hyperlink` on TEXT nodes — **not** prototype reactions. Targets are the first FRAME child of Changelog / [OLD] Component / Developer Guide (`changelog` / `oldComponent` / `devGuide` from §2 — captured *before* they get reparented into their own sections in §5, so grab and store their `.id` early):

```javascript
[
  { text: "Changelog",         hyperlink: { type: "NODE", value: changelog.id } },
  { text: "[OLD] Component",   hyperlink: { type: "NODE", value: oldComponent.id } },
  { text: "Developer Guide",   hyperlink: { type: "NODE", value: devGuide.id } },
]
// Style: Guide/Text/Body M + text/base/main variable.
```

**Guide Link Block «For Designer»** (`Type=For Designer`) — **do not touch**. Leave it exactly as the template provides it.

### "Все варианты в Layout →" — visibility & hyperlink

If this is a Preset (no Layout section), hide the label and icon:
```javascript
layoutText.visible = false;
layoutIcon.visible = false;
```

If this is NOT a Preset, set a **hyperlink** on the Label text node pointing to the 
first Layout frame (the same way §3 links For Dev items to their target sections). 
The Layout section is built later (§6), so **store the Layout section's node ID once 
it's created** and come back to set this hyperlink as a post-step after §6:

```javascript
// After Layout section is created (§6), set hyperlink on "Все варианты в Layout →":
const layoutLabel = await figma.getNodeByIdAsync(STORED_LABEL_ID); // 1423:290
await figma.loadFontAsync(layoutLabel.fontName);
layoutLabel.hyperlink = { type: "NODE", value: layoutSectionId };
```

> ⚠️ Do NOT skip this step — the label without a hyperlink is a dead link and defeats 
> its purpose as a navigation shortcut to the Layout section.

### Wrap into the "Общее" section

```javascript
const outerSec = wrapPreservingPosition(общее, "Общее", [
  { type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.5 },              // #FFFFFF 50% — bottom
  { type: "SOLID", color: { r: 0.635, g: 0.89, b: 0.38 }, opacity: 0.0001 }, // #A2E361 0.01% — top, colors the name bubble
]); // §1.7 — sets position, padding, resize automatically
```

---

## 4. `[AGENT] Developer Guide` — building the content

Build these blocks **in this exact order**, inside `devGuide` from §2 (still an unwrapped page-level frame at this point — the sub-section wrap happens later, in §5):

**Guide Header Detailed (+ Мокап) → Анатомия → Скругления → Размеры и отступы → Типы → Состояния → Область тапа → Поведение → Ограничения → Анимация**

No custom blocks — this is the complete, fixed list. `Типы` is only included if the component has more than one component set/Type; every other block is always present (Ограничения and Анимация included — see §4.8 for why they're never actually omitted).

### 4.0 Guide Header Detailed + Мокап

```javascript
const hdr = (await figma.importComponentByKeyAsync("4cce4cbfc21bdf429c3d22ce6a2a105b255a5678")).createInstance();
// Set properties BEFORE detaching is moot — Guide Header Detailed is a nested Guide Intern
// component and is never detached at all (§1.1). Set properties on the instance directly.
const props = hdr.componentProperties;
const tk = Object.keys(props).find(k => k.startsWith('Title'));
const dk = Object.keys(props).find(k => k.startsWith('Description'));
const fdk = Object.keys(props).find(k => k.startsWith('For Dev'));
const fk = Object.keys(props).find(k => k.startsWith('For Designer'));
const pk = Object.keys(props).find(k => k.startsWith('Preview Size'));

// After calling hdr.setProperties(...), verify that the text actually changed by
// reading back the property values. If the Title/Description still show defaults,
// fall back to directly editing the TEXT nodes named `Title` and `Text` inside the
// `Info Block` frame (these are inside the instance, but title/description text nodes
// are exposed as overridable — use `findOne` to locate and write `.characters`):
hdr.setProperties({
  [tk]: componentDisplayName,
  [dk]: componentDescription,
  [fdk]: true,   // For Dev = True
  [fk]: false,   // For Designer = False
  [pk]: "M",     // Preview Size = M
});
```

**Title** — component display name. **Text** — a description of what the component actually is/does.

**Мокап scenario question** (this is step 2.3 of §0 — should already be answered by the time you reach this point; if not, ask it now before proceeding):
```
"Сгенерировать пример использования в мокапе?"
  Вариант 1: «{придуманный сценарий 1}»
  Вариант 2: «{придуманный сценарий 2}»
  Нет — оставить мокап пустым
```

Build the Мокап (imported via §1.2 key, never detached — work through its slots per §1.1):
```javascript
const mokup = (await figma.importComponentByKeyAsync("005945978b1abe329d1e59dfd8515fce5021e184")).createInstance();

const screenFrame = mokup.findOne(n => n.type === 'FRAME');
const pasteHere = screenFrame.findOne(n => n.name === 'PASTE HERE'); // 375×696

while (pasteHere.children.length) { try { pasteHere.children[0].remove(); } catch (e) { break; } }
```

The Мокап is **detached** (§1.1) — after `detachInstance()`, the TopBar is still an 
INSTANCE but it sits inside a plain FRAME, not inside a component instance hierarchy. 
The `isInsideInstance` check (§1.5) applies to **Guide Intern nested components that 
must stay as instances** — it does NOT apply to text nodes inside sub-instances of a 
detached frame.

When editing the TopBar Title inside a detached Мокап, **skip the `isInsideInstance` 
guard** — the TopBar's text IS an instance override, and writing `.characters` on it 
is the correct way to change the screen name:

```javascript
// Inside the DETACHED Мокап — TopBar is an instance but that's fine, 
// we're overriding its text which is a normal instance override.
const topBar = screenFrame.findOne(n => n.name === 'TopBar');
const pageTitle = topBar?.findOne(n => n.type === 'TEXT' && n.name === 'Title');
if (pageTitle) {
  await figma.loadFontAsync(pageTitle.fontName);
  pageTitle.characters = screenName; // e.g. "Безопасность"
  // Do NOT check isInsideInstance here — this is a detached template, not a live library instance
}
```

Similarly, `PASTE HERE` inside the detached Мокап is a regular FRAME that accepts 
`appendChild()` — verify that the detach happened before attempting to add content, 
and confirm `pasteHere.children.length > 0` after adding content as a sanity check.

```javascript
// TopBar screen title: find the TEXT node named "Title" INSIDE the "TopBar" component, not the
// mockup's own top-level nodes — it's nested one level deeper than you might expect.
const topBar = findByName(screenFrame, n => n.name === 'TopBar');
const pageTitle = topBar && findByName(topBar, n => n.type === 'TEXT' && n.name === 'Title');
if (pageTitle) { await figma.loadFontAsync(pageTitle.fontName); pageTitle.characters = invitedScreenName; }
```

**Text style library question** (ask once, right before generating the `PASTE HERE` example — this is a blocking question per §0.2, ask then stop until answered):
```
"Из какой библиотеки взять текстовые стили для примера в мокапе?"
  {list every text-style library actually visible to you, e.g. via the team libraries / available text styles the file has access to}
```
Use the chosen library's text styles for every text layer you create inside `PASTE HERE`. This is separate from — and not a substitute for — the §1.8 `Guide/...` styles, which stay reserved for guide-authored labels/headings outside the mockup; the mockup's invented scenario should read like real product UI, so it needs real product text styles.

**Building `PASTE HERE` content** — rules for what to place, in order of priority:
- If the component's own name contains **"Widget"** and its width is **343**: just place the widget component instance directly, centered horizontally, `y: 72` from the top (not vertically centered) — no invented surrounding block needed.
- If the component's width is **< 200**: it likely needs a sibling block of some kind next to it — place that invented block/cell alongside it, **16px to its right**.
- Otherwise: invent the simplest, most legible example — something that, at a glance, tells a person where this component gets used. Don't overbuild the scenario; the component itself should stay the visual focus. Apply the text styles from the library chosen above to any invented text.
- **If a scenario needs a generated image (e.g. a map, illustration, photo)**: do **not** generate one yourself. Leave a clearly labeled placeholder instead, e.g. a rectangle with a text layer reading `"Сгенерировать карту"` (or whatever the actual image should be) — this is a task for the person reviewing the guide, not something to fabricate.

```javascript
const inst = componentToShowcase.createInstance();
pasteHere.appendChild(inst);
inst.x = Math.round((pasteHere.width - inst.width) / 2);
inst.y = 72; // near the top of PASTE HERE, not vertically centered
```

Insert the Мокап into Guide Header Detailed's Image slot (§1.5 `findImageSlot`), centered horizontally, `y: 72` from the slot's top:
```javascript
const slot = findImageSlot(hdr);
while (slot.children.length) { try { slot.children[0].remove(); } catch (e) { break; } }
slot.appendChild(mokup);
mokup.x = Math.round((slot.width - mokup.width) / 2);
mokup.y = 72;
```

Don't leave the mockup at `x:0 y:0` inside the slot — that produces a phone mockup pinned to the top-left corner, overflowing past the slot's right edge instead of sitting centered with breathing room above it.

### 4.1 Анатомия

In the Guide Block's slot, remove everything except the pink pointer markers you draw yourself — no leftover default content, no extra decoration. Place the component **strictly centered, both horizontally and vertically**, inside the slot.

**Annotate only text layers and sub-components** — icons, labels, indicators, counters, that kind of thing. Ignore every other layer type (plain shapes, backgrounds, containers that aren't a meaningful named part). The component's outer shell (e.g. `Track` in Switch) is implied by the component being shown at all and never gets its own marker.

**Guide List and the pink markers are NOT alternatives — both are required.** Guide List is the text legend; the markers are what actually point at each element on the canvas.

```javascript
// Pill marker
const pill = figma.createFrame();
pill.layoutMode = "HORIZONTAL"; pill.counterAxisSizingMode = "AUTO"; pill.primaryAxisSizingMode = "AUTO";
pill.paddingLeft = pill.paddingRight = 8; pill.paddingTop = pill.paddingBottom = 2;
pill.cornerRadius = 5;
pill.fills = [{ type: "SOLID", color: { r: 0.91, g: 0.09, b: 0.54 } }]; // #E8178A
const num = figma.createText();
num.fontName = { family: "Inter", style: "Medium" }; num.fontSize = 14;
num.characters = "1"; // font already loaded up front, per §1.6
num.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
pill.appendChild(num);

// Placement, relative to targetNode (already in the same frame — never absoluteBoundingBox):
pill.x = targetNode.x + targetNode.width + 16;   // to the right of the element
pill.y = targetNode.y + targetNode.height / 2 - pill.height / 2; // vertically centered on it

// Line from marker to the element
const line = figma.createVector();
const lineY = targetNode.y + targetNode.height / 2;
const lineX1 = pill.x - 16;
const lineX2 = targetNode.x + targetNode.width;
line.vectorPaths = [{ windingRule: "NONZERO", data: `M ${lineX1} ${lineY} L ${lineX2} ${lineY}` }];
line.strokes = [{ type: "SOLID", color: { r: 0.91, g: 0.09, b: 0.54 } }];
line.strokeWeight = 1; line.fills = [];

// Dot overlapping the target element (~3px overlap)
const dot = figma.createEllipse();
dot.resize(6, 6); dot.fills = [{ type: "SOLID", color: { r: 0.91, g: 0.09, b: 0.54 } }]; dot.strokes = [];
dot.x = lineX2 - 3; dot.y = lineY - 3; // MUST overlap the target edge
```

**Vertical markers** (for elements in the middle of a stack): marker above the element → vertical line going down + dot at the element's top edge; marker below → the mirror. Same x-center-of-target logic, rotated 90°.

#### Guide List — one Guide List Item per marker

For every pink marker you drew, add a matching **Guide List Item** in Guide List's slot:
- **Title** — the layer name of the element being pointed at.
- **Text** — a short, contextual description of what that element is/does (write this from the component's actual purpose, not a generic placeholder).
- **`Show Function` property → `True`.**
- **`Function` component variant** — `Caption CanToggle` if the element has a boolean show/hide property on the component; `Caption CannotToggle` if it doesn't.

> ⚠️ **CRITICAL — never modify text inside the `Function` instance.**
> The `Function` component (`Caption CanToggle` / `Caption CannotToggle`) contains 
> pre-defined text that is part of the library template. Do NOT override, replace, or 
> write `.characters` on any TEXT node inside the `Function` instance — only select the 
> correct variant via component properties. The text inside these variants is read-only 
> by design; writing custom descriptions there violates §1.5 (no text modifications 
> inside component instances).

Duplicate (clone) the Guide List Item once per marker — don't build new ones from scratch each time.

> ⚠️ **MULTIPLE TYPES:** build a separate Anatomy example per Type only if the anatomy genuinely differs between Types; if the Types share the same structure, one shared Anatomy example is fine (unlike Скругления/Размеры below, where each Type always gets its own Guide Block).

### 4.2 Скругления

Inside the Guide Block slot, the component and the radius indicator (L-shape + bubble) 
live inside one **HORIZONTAL auto-layout wrapper FRAME** (`HUG × HUG`). The L-shape and 
Bubble are **absolute-positioned** children of the wrapper (not in a separate indicator 
group), anchored to the component's top-right corner.

```javascript
const wrapper = figma.createFrame();
wrapper.layoutMode = 'HORIZONTAL';
wrapper.primaryAxisAlignItems = 'CENTER';
wrapper.counterAxisAlignItems = 'CENTER';
wrapper.itemSpacing = 24;
wrapper.fills = [];
wrapper.layoutSizingHorizontal = 'HUG';
wrapper.layoutSizingVertical = 'HUG';
slot.appendChild(wrapper);

// Place the component — the only auto-layout child
wrapper.appendChild(chip);

const boundVar = chip.boundVariables?.topRightRadius;

if (!boundVar) {
  const noToken = figma.createText();
  noToken.characters = "Токены скругления не найдено";
  wrapper.appendChild(noToken);
} else {
  const radVar = await figma.variables.getVariableByIdAsync(boundVar.id);
  const radiusLabel = radVar.name;

  // L-shape: 24×24, absolute-positioned at the chip's top-right corner
  const shape = figma.createRectangle();
  shape.resize(24, 24);
  shape.fills = [];
  shape.strokeTopWeight = 2; shape.strokeRightWeight = 2;
  shape.strokeBottomWeight = 0; shape.strokeLeftWeight = 0;
  shape.strokes = [{ type: "SOLID", color: { r: 0.886, g: 0.357, b: 0.549 } }];
  shape.strokeAlign = "CENTER";
  shape.setBoundVariable('topRightRadius', radVar);
  wrapper.appendChild(shape);
  shape.layoutPositioning = 'ABSOLUTE';
  shape.constraints = { horizontal: 'MAX', vertical: 'MIN' };
  shape.x = chip.width - 12;  // overlaps the chip's right edge
  shape.y = -12;               // overlaps above the chip's top edge

  // Bubble: absolute-positioned above the L-shape, touching its top
  const bubble = figma.createFrame();
  bubble.fills = [{ type: "SOLID", color: { r: 0.886, g: 0.357, b: 0.549 }, opacity: 0.2 }];
  bubble.cornerRadius = 6;
  bubble.layoutMode = "HORIZONTAL";
  bubble.primaryAxisSizingMode = "AUTO";
  bubble.counterAxisSizingMode = "AUTO";
  bubble.paddingLeft = 6; bubble.paddingRight = 6;
  bubble.paddingTop = 2; bubble.paddingBottom = 2;

  const bubbleText = figma.createText();
  bubbleText.fontName = { family: "Inter", style: "Medium" };
  bubbleText.fontSize = 12;
  bubbleText.characters = radiusLabel;
  bubbleText.fills = [{ type: "SOLID", color: { r: 0.886, g: 0.357, b: 0.549 } }];
  bubbleText.textStyleId = "S:9f02caf352e8028e796896de9e8e9a93f6a68bca,5:9";
  bubble.appendChild(bubbleText);
  wrapper.appendChild(bubble);
  bubble.layoutPositioning = 'ABSOLUTE';
  bubble.constraints = { horizontal: 'MAX', vertical: 'MIN' };
  bubble.x = chip.width + 12;             // to the right of the L-shape
  bubble.y = -(12 + bubble.height);        // directly above the L-shape, touching its top
}
```

**Key points:**
- The wrapper hugs to the chip — its size equals the chip's size.
- The L-shape and Bubble are `layoutPositioning: 'ABSOLUTE'` with `constraints: { horizontal: 'MAX', vertical: 'MIN' }` — they float over the chip, not part of the auto-layout flow.
- Positioning formulas: L-shape at `(chip.width - 12, -12)`, Bubble at `(chip.width + 12, -(12 + bubble.height))`.
- To use this for a different component, **just swap the `chip` instance** — the absolute-positioned markers will adjust via the formulas.

> ⚠️ **MULTIPLE TYPES:** build a **separate Guide Block per Type** — one shared "for all types" Guide Block is not allowed:
> ```
> Title S: "TypeA" → Guide Block (Скругления TypeA)
> Title S: "TypeB" → Guide Block (Скругления TypeB)
> ```
> If there's only one Type, the Title S is unnecessary.

### 4.3 Размеры и отступы

Two separate Guide Blocks per Type:
1. **Guide Block «Отступы»** — padding highlight + gap annotation. If the component has neither padding nor gap, **skip this block entirely**.
2. **Guide Block «Размеры»** — dimension lines (width × height). **Always required**, regardless of padding/gap.

```
Title M: "Размеры и отступы"
  [Title S: "TypeA"]        ← only if there is more than one Type
  Guide Block: отступы TypeA   (skip if no padding/gap on TypeA)
  Guide Block: размеры TypeA
  [Title S: "TypeB"]
  Guide Block: отступы TypeB
  Guide Block: размеры TypeB
```

If the component has a padding or gap **variable**, highlight it and place a bubble with the variable's name next to it — if there's no such variable, show the component's raw size instead.

#### Guide Block «Отступы»
```javascript
const hasPadding = chip.paddingLeft > 0 || chip.paddingRight > 0 || chip.paddingTop > 0 || chip.paddingBottom > 0;
const hasGap = chip.itemSpacing > 0;

// Padding highlight rectangle (colored area, dashed border) — #0C8CE9
const padW = parentFrame.paddingLeft + parentFrame.paddingRight;
const padH = parentFrame.paddingTop + parentFrame.paddingBottom;
const hi = figma.createRectangle();
hi.resize(padW, padH); // for a specific edge — repeat per edge you're annotating
hi.fills = [{ type: "SOLID", color: { r: 0.047, g: 0.549, b: 0.914 }, opacity: 0.1 }];
hi.strokes = [{ type: "SOLID", color: { r: 0.965, g: 0.965, b: 0.973 } }]; // #F6F6F9
hi.strokeWeight = 1; hi.strokeAlign = "CENTER";
hi.dashPattern = [4, 2];

// Boundary line, e.g. horizontal padding on the left edge:
const bLine = figma.createVector();
const y1 = parentFrame.height / 2, y2 = y1;
const x1 = 0, x2 = parentFrame.paddingLeft;
bLine.vectorPaths = [{ windingRule: "NONZERO", data: `M ${x1} ${y1} L ${x2} ${y2}` }];
bLine.strokes = [{ type: "SOLID", color: { r: 0.047, g: 0.549, b: 0.914 } }];
bLine.strokeWeight = 1; bLine.fills = [];

// Tick-marks: short perpendicular caps at each end of bLine
// Bubble: r:3.5, fill #0C8CE9, style Guide/Text/Label S, white text: "token_name  value"
```

Gap annotation — same structure, `#F316B0` (`{ r: 0.953, g: 0.086, b: 0.690 }`) instead of `#0C8CE9`.

#### Guide Block «Размеры»
Always draw a horizontal line (width) + a vertical line (height), tick-marks at each end, and a bubble with the number.

**343/375 → `"100%"` rule** — these two widths are the standard full-bleed component widths in this system:
```javascript
const displayW = (chip.width === 343 || chip.width === 375) ? "100%" : `${Math.round(chip.width)}`;
const displayH = `${Math.round(chip.height)}`;
```

> ⚠️ **MULTIPLE TYPES:** same rule as §4.2 — build separate «Отступы»/«Размеры» Guide Blocks per Type.

### 4.4 Типы

Only include this block **if the component has more than one component set/Type**.

```javascript
// Horizontal row (components ≤ 343px wide)
const row = figma.createFrame();
row.layoutMode = "HORIZONTAL"; row.primaryAxisSizingMode = "AUTO"; row.counterAxisSizingMode = "AUTO";
row.itemSpacing = 32; row.fills = []; row.counterAxisAlignItems = "MIN"; row.primaryAxisAlignItems = "CENTER";

// Vertical column (components > 343px wide)
row.layoutMode = "VERTICAL";
row.primaryAxisSizingMode = "AUTO";   // MUST be AUTO to prevent clipping
row.counterAxisAlignItems = "CENTER";
row.itemSpacing = 32;
row.paddingTop = row.paddingBottom = 24;
```

Guide Block, types centered inside it. Below each type instance, **8px gap**, a text label with its name:
```javascript
const label = figma.createText();
label.textStyleId = "S:9f02caf352e8028e796896de9e8e9a93f6a68bca,5:9"; // Guide/Text/Label S
const secVar = await figma.variables.getVariableByIdAsync("VariableID:40dcb233c8b7ebbbbe305c84bab791a2c0410dc2/84:800");
label.fills = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0.416, g: 0.459, b: 0.537 } }, 'color', secVar)];
label.y = typeInstance.y + typeInstance.height + 8; // 8px below the type instance
```

### 4.5 Состояния

Same structure as Типы: Guide Block with the component's states centered inside it. If the Types are visually very similar, it's fine to use just one Type as the representative example instead of repeating states per Type.

States can show up in two different shapes on the component itself:
- As a **variant prop** on the same component (`State=StateName`).
- As a **separate component**, identifiable by `State` or `States` appearing in its name.

Either way, the goal is the same: show every distinct state the component can be in.

### 4.6 Область тапа

*(Not yet specified in detail — build a Guide Block showing the component's tappable/interactive area, consistent with the visual conventions used elsewhere in this file. If the exact annotation style for this block isn't clear from context, ask the user rather than guessing at something new.)*

### 4.7 Поведение

Guide Block containing behavior examples, built from the Behavior answer collected in §0 step 2.2.

Use the **FingerAction** component (§1.3 — inspect its key once if not already known) to demonstrate gestures:
- `Type=Tap` — tap
- `` Type=<- Swipe `` — swipe left
- `` Type=-> Swipe `` — swipe right
- `Type=Hold` — press-and-hold

Also show **Disabled** and **Skeleton** if the component has them as a `State`.

Reference — the full set of `State` values you may encounter on components while building this block: `Pressed`, `Actived`, `Swiped`, `Hovered`, `Default`, `Disabled`, `Focused`, `Filled`, `Skeleton`. Not every component has all of these — only show the ones that actually apply.

```javascript
const bullet = figma.createText();
bullet.textStyleId = "S:d72bdd82ea4b6e46b48ad2ba4bae6de957063e11,5:5"; // Guide/Text/Body M
bullet.characters = "• Описание поведения"; // font already loaded up front, §1.6
const mainVar = await figma.variables.getVariableByIdAsync("VariableID:a5faea7006c86ab4c7ba6944b3f9412d09e8f4b3/84:798");
bullet.fills = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0.098, g: 0.141, b: 0.2 } }, 'color', mainVar)];
// Use Guide/Heading/Title M for sub-headings per case/type, if the behavior needs to be split up
```

### 4.8 Ограничения и Анимация

**Both blocks are always present and always left empty.** Don't populate them, and don't omit them either — `clearSlot()` still runs on both (§1.1), they just end up with nothing in the slot.

---

## 5. Wrapping `[AGENT] Changelog`, `[AGENT] [OLD] Component`, `[AGENT] Developer Guide`

Each frame first gets its own grey sub-section, then all three sub-sections get wrapped together into the outer blue "💻 Для разработчиков" section.

```javascript
[changelog, oldComponent, devGuide].forEach(f => {
  f.cornerRadius = 40;
  f.clipsContent = true;
});

const clSec = wrapPreservingPosition(changelog,    "Changelog",         [{ type: "SOLID", color: { r: 0.906, g: 0.906, b: 0.906 } }]);
const lgSec = wrapPreservingPosition(oldComponent, "[OLD] Component",   [{ type: "SOLID", color: { r: 0.906, g: 0.906, b: 0.906 } }]);
const dgSec = wrapPreservingPosition(devGuide,      "Developer Guide",  [{ type: "SOLID", color: { r: 0.906, g: 0.906, b: 0.906 } }]);
// const cSec = wrapPreservingPosition(counterFrame, "Counter", [...]); // if needed

// wrapPreservingPosition (§1.7) already placed each sub-section at the page position its
// frame had after §2's fixed offsets — 538/248/536 were chosen so that, once each frame is
// wrapped with 112px padding, the visible gap between the resulting grey sub-sections comes
// out to 24px, matching the sub-section gap convention used everywhere else in this file.

const outerDevOrigin = { x: clSec.x, y: clSec.y }; // top-left of the whole group, before final wrap
const outerDev = figma.createSection();
outerDev.name = "💻 Для разработчиков";
outerDev.cornerRadius = 64;
outerDev.strokes = [];
outerDev.fills = [
  { type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.5 },              // #FFFFFF 50% — bottom
  { type: "SOLID", color: { r: 0.235, g: 0.6, b: 0.937 }, opacity: 0.0001 }, // #3C99EF 0.01% — top
];
figma.currentPage.appendChild(outerDev);
[clSec, lgSec, dgSec].forEach(s => {
  const ox = s.x, oy = s.y; // page-absolute before reparenting
  outerDev.appendChild(s);
  s.x = ox - outerDevOrigin.x + 112;
  s.y = oy - outerDevOrigin.y + 112;
});
outerDev.x = outerDevOrigin.x - 112;
outerDev.y = outerDevOrigin.y - 112;
resizeSectionToContent(outerDev); // §1.7
```

---

## 6. Layout — `[AGENT] Layouts`

Skip this section entirely for Presets (path contains `/Preset/`).

### 6.1 Grouping: Type vs Appearance — don't conflate them

- **Тип (Type)** — a structural variant of the component. Each Type gets its **own separate Layout frame(s)** — never merged into the same frame as another Type.
- **Appearance (Внешний вид)** — a style variant within a single Type (e.g. `Accent` / `Viv`). Appearance variants belong together inside one frame, as separate `Block Section`s.

One Layout frame = one Type × one theme. Appearance variants are sub-groups *inside* that frame, not separate frames.

**Do NOT create Block Section Heading frames from scratch.** The detached Layout template already contains `Block Section` nodes with `Block Section Heading`s inside them — find and modify the existing ones:
```javascript
const block = layoutFrame.findOne(n => n.name === 'Block');
const existingBlockSections = block.children.filter(c => c.name === 'Block Section');
const heading = existingBlockSections[0].findOne(n => n.name === 'Block Section Heading');
const headingText = heading.findOne(n => n.type === 'TEXT');
await figma.loadFontAsync(headingText.fontName);
headingText.characters = appearanceName;
```
If the template has fewer Block Sections than the component has appearance variants, add the missing ones by duplicating an existing Block Section node (`.clone()`), not by building from scratch.

### 6.2 Minimum frame count: light + dark per Type

For every Type, build **at least 2** Layout frames — one light-theme, one dark-theme. Never ship just the dark one. Multiple Types → `2 × number of types` frames minimum.

```javascript
const types = resolveComponentTypes(componentSet);

for (const type of types) {
  for (const theme of ["light", "dark"]) {
    const layoutKey = pickLayoutKey(type, theme); // from the 12 keys, §1.2 — cache the type/theme mapping after inspecting once
    const layoutFrame = (await figma.importComponentByKeyAsync(layoutKey)).createInstance().detachInstance();
    // Structure after detach:
    // FRAME "Layouts" r:40
    //   INSTANCE "Guide Header Short" — set Title = `${componentName} — Layout` (+ type name if >1 type)
    //   FRAME "Section" r:40 pad:32/40
    //     FRAME "Block" r:24 pad:24 gap:32
    //       FRAME "Block Section" — ONE PER APPEARANCE VARIANT OF THIS TYPE ONLY
    //         FRAME "Block Section Heading" r:16 — set to the appearance name
    //         FRAME "List"
    //           INSTANCE "Guide Card Layout" × N — see §6.3 for what goes in each

    if (theme === "dark") {
      // CRITICAL: setExplicitVariableModeForCollection is called ONLY on the dark-theme frame.
      // Never call it on the light-theme frame — light must end up with ZERO explicit variable
      // modes so it inherits the default (light) theme.
      const ids = {
        csr: "VariableCollectionId:17a28bd89541823ca1ed0d3fd28d1a4c7fe680c6/12077:0",
        cs:  "VariableCollectionId:6da85ea5cf0409a4a64868b3a847b7f3bf0657e7/84:485",
        cso: "VariableCollectionId:d0fe74fc6beec2ceb68d78fd08a7ded3a0bb7eca/11264:668",
      };
      const c1 = await figma.variables.getVariableCollectionByIdAsync(ids.csr);
      const c2 = await figma.variables.getVariableCollectionByIdAsync(ids.cs);
      const c3 = await figma.variables.getVariableCollectionByIdAsync(ids.cso);
      layoutFrame.setExplicitVariableModeForCollection(c1, "7931:1"); // color-sem-retail dark
      layoutFrame.setExplicitVariableModeForCollection(c2, "84:1");   // color-sem dark
      layoutFrame.setExplicitVariableModeForCollection(c3, "657:0");  // color-sem-old dark
    }

    layoutFramesByTypeAndTheme[type][theme] = layoutFrame;
  }
}
```

### 6.3 What goes in a Guide Card Layout: states vs sizes

Guide Card Layout represents **one of two different things**, depending on what the component set actually varies — don't mix both purposes into the same card set without checking which applies:

- **States** — if the Type's variants are interaction states, one Guide Card Layout per state (Default / Active / Pressed / etc.), the component centered in the card's slot on **both axes**:
  ```javascript
  const inst = filteredVariant.createInstance();
  slot.appendChild(inst);
  inst.x = Math.round((slot.width  - inst.width)  / 2);
  inst.y = Math.round((slot.height - inst.height) / 2);
  ```
- **Sizes** — if the Type has multiple size variants:
  - If all the sizes **fit inside one card** together: place them side by side, centered as a group, and describe them in the card's text as a list, e.g. "Доступные размеры: S, M, L" (pull the actual values from the component's props).
  - If they **don't fit in one card**: give each size its own separate Guide Card Layout instead of cramming them in.

### Positioning multiple Layout frames — ⚠️ Unverified / assumption

No reference example exists yet for a multi-type or multi-theme Layout section — treat this as a reasonable default, not a confirmed rule, and flag it to the user if the result looks off:
- Light and dark frames of the same Type sit side by side, gap 24.
- Different Types form separate columns/groups, gap 112 apart.

### 6.4 Wrap into the "Layouts" section

```javascript
const layoutOrigin = { x: 500, y: 0 }; // or wherever the first light/dark pair for the first Type landed
const layoutSec = figma.createSection();
layoutSec.name = "Layouts";
layoutSec.cornerRadius = 64;
layoutSec.strokes = [];
layoutSec.fills = [
  { type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.5 },                // #FFFFFF 50% — bottom
  { type: "SOLID", color: { r: 0.357, g: 0.463, b: 0.886 }, opacity: 0.0001 }, // #5B76E2 0.01% — top
];
figma.currentPage.appendChild(layoutSec);

let typeGroupX = 112;
for (const type of types) {
  const { light, dark } = layoutFramesByTypeAndTheme[type];
  layoutSec.appendChild(light);
  layoutSec.appendChild(dark);
  light.x = typeGroupX; light.y = 112;
  dark.x = light.x + light.width + 24; dark.y = 112;
  typeGroupX = dark.x + dark.width + 112;
}
layoutSec.x = layoutOrigin.x - 112; layoutSec.y = layoutOrigin.y - 112;
resizeSectionToContent(layoutSec); // §1.7
```

---

## 7. Verification — do this before finishing

There's no automated node-by-node placeholder check yet (worth building — e.g. "walk all TEXT nodes, flag anything matching common placeholder patterns"). Until then, do this manually:

1. `await node.screenshot()` on at least: the Типы block, the Anatomy block, and the Layout section's dark-mode frame.
2. Visually confirm:
   - No leftover placeholder text ("Component description here", "Button") anywhere.
   - Anatomy pills/lines/dots actually point at their target elements (not floating).
   - Radius/Sizes annotations are positioned correctly, not overlapping content oddly.
   - Dark-mode Layout frames render in dark colors, not falling back to light.
   - Ограничения and Анимация blocks are present but empty (§4.8), not missing.
3. Re-check against **Critical rules** below.

---

## 8. Closing message

Once verification passes, clear the checkpoint (§0.1) and post this message to the user, unmodified:

> Базовая сборка гайда компонента готова, если есть что подправить - выделите фрейм и напишите что исправить. Для дополнительных вопросов обращайтесь к дизайнерам DS SOUZ

---

## Critical rules — never violate

1. **Markers in Anatomy**: REQUIRED — pill + line + dot overlapping the target element, positions computed from real node coordinates in a shared frame (§4.1). Guide List is not a substitute for the markers; both are required. Only annotate text layers and sub-components (§4.1) — never the body/shell itself, never plain shapes/backgrounds.
2. **Radius rectangle**: exactly **24×24**, bubble sits at **0px offset** from the L-shape's top-right corner (§4.2). If the component has no corner-radius token, don't draw an unannotated rectangle — show `"Токены скругления не найдено"` instead.
3. **Sizes annotations**: two separate Guide Blocks per Type — one for padding/gap (skip it if the component has neither), one for dimensions (w×h lines + ticks + bubbles — ALWAYS required). Width 343/375 → `"100%"`. Multiple Types repeat this per Type (§4.3).
4. **Layout structure**: one frame = one Type × one theme; Block Section Heading per **Appearance** (never per Type) → Guide Card Layout per heading, one per state OR one set per size depending on what the Type actually varies (§6.1, §6.3). Different Types never share a frame. Block Section Headings come from the detached template — find/edit or clone existing ones, never build from scratch.
4a. **Layout theme coverage**: minimum 2 frames per Type — light and dark — never ship dark-only (§6.2).
5. **Mockup**: component instance horizontally centered, `y: 72` from the top of PASTE HERE (not vertically centered); the mockup frame itself is horizontally centered in the Image slot with `y: 72` from the slot's top — never left at `x:0 y:0`. Screen title comes from the TEXT node named `Title` inside `TopBar` (§4.0), not a node literally named "Page name". Never self-generate images for the mockup scenario — placeholder text only (§4.0).
6. **Text styles**: only apply to guide-authored nodes, NEVER inside component instances (check with `isInsideInstance`, §1.5).
7. **Dark mode**: set all 3 variable collections on every dark Layout frame, regardless of whether the component uses retail tokens.
7a. **Dark mode isolation**: `setExplicitVariableModeForCollection` is called on dark Layout frames ONLY — light frames get zero explicit variable modes.
8. **Section strokes**: `section.strokes = []` — always.
9. **No-detach for nested components**: only the 5 top-level `[AGENT]` frames get detached (§1.1, §2). Guide Block, Guide List, Guide Card Layout, Guide Header Detailed, FingerAction, and every other nested Guide Intern component are never detached — work through their `Slot` instead.
10. **Developer Guide block order**: exactly this order, no custom blocks — Guide Header Detailed → Анатомия → Скругления → Размеры и отступы → [Типы, if >1 Type] → Состояния → Область тапа → Поведение → Ограничения → Анимация (§4). Ограничения and Анимация are always present and always empty (§4.8) — never omitted, never populated.
11. **Fonts**: `loadFontAsync` before every `.characters`/`.textStyleId` write, no exceptions (§1.6).
12. **Node lookup**: by `node.name`, never by text content (§1.5).
13. **Verify before finishing**: screenshot + visual check per §7.
14. **Section radius & padding**: every section has `cornerRadius: 64` and 112px padding from its edge to the frame inside it (§1.7).
14a. **Sections never auto-resize**: always call `resizeSectionToContent()` after all of a section's children are positioned (§1.7).
15. **Sub-sections are real sections**: Changelog / [OLD] Component / Developer Guide / Counter each get their own `figma.createSection()` wrapper (§5) — not just styling applied to the plain frame.
16. **Fill order**: white goes at array index 0, colored fill goes last (§1.7).
17. **Frame placement**: the 5 top-level `[AGENT]` frames are placed using the fixed offsets in §2 (538 / 248 / 248 / 536) **before** any section-wrapping — sections are wrapped around already-positioned frames via `wrapPreservingPosition()` (§1.7), not the other way around.
18. **Multiple components selected**: always ask whether to build one combined guide or separate guides — never assume (§0 step 2.1).
19. **Checkpointing**: write a checkpoint after every major step (§0.1); never re-ask a question whose answer is already in the checkpoint.
20. **Questions block execution**: after asking the user anything (§0.2), stop completely until the answer arrives — including all 3 upfront questions in §0 step 2, asked before any Figma work begins.
21. **Component centering in slots**: any instance placed into a display slot (Card Variant Preview, etc.) must be centered both horizontally AND vertically — never left at `x:0 y:0`.
22. **Guide List Item**: `Show Function` property set to `True`; `Function` variant set to `Caption CanToggle` or `Caption CannotToggle` depending on whether the annotated element has a boolean show/hide prop (§4.1).
23. **Closing message**: post the exact text in §8 once the guide is verified — this is the signal to the user that the base build is done.
24. **Slot content wrapper**: content added to a Guide Block slot after `clearSlot()` lives in one plain FRAME (`layoutSizingHorizontal: 'FILL'`, `layoutMode` left as `'NONE'`) — never auto-layout, never `layoutSizingVertical: 'HUG'`. Height is resized manually to fit the actual content (§1).
25. **Guide Block captions only**: the slot holds short captions/labels only. Longer descriptive text goes in its own text block placed before the Guide Block, not inside its slot (§1).
26. **Mockup text style library**: ask which visible library to take text styles from before generating the `PASTE HERE` example, then use that library's styles for all invented text in the mockup (§4.0). Never reuse the §1.8 `Guide/...` styles for mockup content.
