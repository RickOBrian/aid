/**
 * Карта стиля (этап 3a): атомы исходника + токены продукта → предложения.
 * Документ не меняет.
 */

import * as store from "../profile/storage";
import type { ExemplarIndex, TokensIndex } from "../profile/types";
import { collectAtoms } from "./collect";
import { mapColors } from "./palette";
import { targetColors, targetTexts, targetValues } from "./targets";
import type { StyleMap } from "./types";
import { mapTexts } from "./typography";
import { mapValues } from "./values";

export async function buildStyleMap(report: (title: string) => void): Promise<StyleMap> {
  const profiles = await store.getProfiles();
  const activeId = await store.getActiveProfileId();
  const profile = profiles.find((p) => p.id === activeId) ?? profiles[0];
  if (!profile) throw new Error("Нет продукта — создайте его на вкладке «Продукт»");

  const tokens: TokensIndex[] = [];
  let exemplars: ExemplarIndex | null = null;
  for (const m of profile.materials) {
    const index = await store.getIndex(profile.id, m.id);
    if (index?.kind === "tokens") tokens.push(index.data);
    if (index?.kind === "exemplars" && !exemplars) exemplars = index.data;
  }
  if (tokens.length === 0) throw new Error(`У продукта «${profile.name}» нет токенов — добавьте их на вкладке «Продукт»`);

  const atoms = await collectAtoms((done, total) => report(`читаю экраны: ${done} из ${total}`));
  report("сопоставляю");

  const tColors = targetColors(profile, tokens, exemplars);
  const tTexts = targetTexts(tokens, exemplars);
  const tRadii = targetValues(tokens, "radius");
  const tSpacing = targetValues(tokens, "spacing");

  const colorProposals = mapColors(atoms.colors, tColors);
  const textProposals = mapTexts(atoms.texts, tTexts);
  const radiusProposals = mapValues(atoms.radii, tRadii, "радиусы");
  const spacingProposals = mapValues(atoms.spacing, tSpacing, "отступы");

  const byCount = <T extends { source: { count: number } }>(a: T, b: T) => b.source.count - a.source.count;
  return {
    screens: atoms.screens,
    colors: atoms.colors
      .map((source) => {
        const proposal = colorProposals.find((p) => p.sourceId === source.id)!;
        return { source, proposal, target: tColors.find((t) => t.key === proposal?.target?.key) };
      })
      .filter((x) => x.proposal)
      .sort(byCount),
    texts: atoms.texts
      .map((source) => {
        const proposal = textProposals.find((p) => p.sourceId === source.id)!;
        return { source, proposal, target: tTexts.find((t) => t.key === proposal.target?.key) };
      })
      .sort((a, b) => b.source.size - a.source.size),
    radii: atoms.radii
      .map((source) => {
        const proposal = radiusProposals.find((p) => p.sourceId === source.id)!;
        return { source, proposal, target: tRadii.find((t) => t.key === proposal.target?.key) };
      })
      .sort((a, b) => a.source.value - b.source.value),
    spacing: atoms.spacing
      .map((source) => {
        const proposal = spacingProposals.find((p) => p.sourceId === source.id)!;
        return { source, proposal, target: tSpacing.find((t) => t.key === proposal.target?.key) };
      })
      .sort((a, b) => a.source.value - b.source.value),
    skipped: atoms.skipped,
    basis: { productName: profile.name, exemplars: Boolean(exemplars), darkEvidence: atoms.darkEvidence },
  };
}
