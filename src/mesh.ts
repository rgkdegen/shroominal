import { CONFIG } from "./config";
import { SPORES, Mint, MintFacts, SporeResult, sizeFor } from "./spores";

export type Verdict =
  | { kind: "RUG"; mint: Mint; flags: { spore: string; note: string }[] }
  | { kind: "PICK"; mint: Mint; entrySol: number; exits: ReturnType<typeof exitPlan> };

export interface MeshDeps {
  /** Async stream of freshly deployed pump.fun mints (Launch Sniffer's feed). */
  mints: () => AsyncIterable<Mint>;
  /** Fetch the facts the spores need. */
  facts: (m: Mint) => Promise<MintFacts>;
  /** Called on PICK when dryRun is false. */
  buy?: (m: Mint, sol: number) => Promise<void>;
}

/**
 * The mesh: all spores check the mint in parallel and share their results.
 * Unlike a pipeline, nothing short-circuits — every flag is collected,
 * and Rug Warden vetoes the coin if even one spore flags it.
 */
export function mesh(mint: Mint, facts: MintFacts): Verdict {
  const results: [string, SporeResult][] = SPORES.map(s => [s.name, s.check(facts)]);
  const flags = results.filter(([, r]) => !r.pass).map(([spore, r]) => ({ spore, note: r.note }));
  if (flags.length) return { kind: "RUG", mint, flags }; // Rug Warden veto
  const entrySol = sizeFor(facts);
  return { kind: "PICK", mint, entrySol, exits: exitPlan(entrySol) };
}

/** Exit Planner + Profit Taker: hard stop, TP1, TP2, moonbag. */
export function exitPlan(entrySol: number) {
  const { stopPct, tp1Multiple, tp1SellPct, tp2Multiple, tp2SellPct } = CONFIG.exits;
  return {
    stopAt: 1 - stopPct / 100,
    ladder: [
      { at: tp1Multiple, sellPct: tp1SellPct, sol: +(entrySol * (tp1SellPct / 100) * tp1Multiple).toFixed(2) },
      { at: tp2Multiple, sellPct: tp2SellPct, sol: +(entrySol * (tp2SellPct / 100) * tp2Multiple).toFixed(2) },
      { at: Infinity, sellPct: 100 - tp1SellPct - tp2SellPct, sol: NaN }, // moonbag
    ],
  };
}

/** Spore Chief: route every new mint through the mesh. */
export async function hunt(deps: MeshDeps, onVerdict: (v: Verdict) => void) {
  for await (const mint of deps.mints()) {
    const facts = await deps.facts(mint);
    const v = mesh(mint, facts);
    onVerdict(v);
    if (v.kind === "PICK" && !CONFIG.dryRun && deps.buy) await deps.buy(mint, v.entrySol);
  }
}
