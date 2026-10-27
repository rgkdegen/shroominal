import { hunt } from "./mesh";
import type { Mint, MintFacts } from "./spores";

// Replace these two with your real mint stream + data source.
async function* demoMints(): AsyncIterable<Mint> {
  const tickers = ["MYCO", "SCAMZ", "HONEY", "GLOOM", "BNDL", "RUGGY", "TRUFF", "SPORE"];
  for (const t of tickers) {
    await new Promise(r => setTimeout(r, 400));
    yield { address: `${t.toLowerCase()}...pump`, ticker: t, dev: "dev...", createdAt: Date.now() };
  }
}

async function demoFacts(m: Mint): Promise<MintFacts> {
  const base: MintFacts = {
    ageSec: 34, devHoldPct: 1.2, devSoldPct: 0, bundledPct: 4, holders: 212, top10Pct: 17,
    lpBurned: true, mintAuthority: null, freezeAuthority: null, sellSimOk: true, sellTaxPct: 0,
    snipersPct: 5, mentions: 64, paidKolShare: 0.2, topFreshWalletPct: 3, volSpike: 3.4, curvePct: 18,
  };
  switch (m.ticker) {
    case "SCAMZ": return { ...base, devSoldPct: 92, top10Pct: 48 };
    case "HONEY": return { ...base, sellSimOk: false, freezeAuthority: "live" };
    case "BNDL":  return { ...base, bundledPct: 61, snipersPct: 22 };
    case "RUGGY": return { ...base, mintAuthority: "live", lpBurned: false };
    case "MYCO":  return { ...base, mentions: 140, volSpike: 6.2 };
    default:      return base;
  }
}

hunt({ mints: demoMints, facts: demoFacts }, v => {
  if (v.kind === "RUG") {
    console.log(`✕ RUG   $${v.mint.ticker.padEnd(7)} ${v.flags.length} spore(s) flagged · ${v.flags.map(f => `${f.spore}: ${f.note}`).join(" | ")}`);
  } else {
    const [tp1, tp2] = v.exits.ladder;
    console.log(`✓ PICK  $${v.mint.ticker.padEnd(7)} 13/13 clean · ${v.entrySol} SOL · TP ${tp1.at}× / ${tp2.at}× · stop −${Math.round((1 - v.exits.stopAt) * 100)}%`);
  }
});
