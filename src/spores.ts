import { CONFIG } from "./config";

export interface Mint {
  address: string;
  ticker: string;
  dev: string;
  createdAt: number;
}

/** Everything the spores need about a mint. Wire each field to your own RPC / indexer / pump.fun API. */
export interface MintFacts {
  ageSec: number;
  devHoldPct: number;
  devSoldPct: number;
  bundledPct: number;
  holders: number;
  top10Pct: number;
  lpBurned: boolean;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  sellSimOk: boolean;
  sellTaxPct: number;
  snipersPct: number;
  mentions: number;
  paidKolShare: number;
  topFreshWalletPct: number;
  volSpike: number;
  curvePct: number;
}

export type SporeResult = { pass: boolean; note: string };

export interface Spore {
  id: number;
  name: string;
  check: (f: MintFacts) => SporeResult;
}

const S = CONFIG.spores;
const ok = (note: string): SporeResult => ({ pass: true, note });
const bad = (note: string): SporeResult => ({ pass: false, note });

/** The 15 spores. Each one checks a single thing. */
export const SPORES: Spore[] = [
  { id: 1, name: "Launch Sniffer", check: f => f.ageSec <= S.maxAgeSec ? ok(`${f.ageSec}s old`) : bad(`${f.ageSec}s old · stale`) },
  { id: 2, name: "Dev Tracer", check: f =>
      f.devSoldPct > S.devSoldMaxPct ? bad(`dev sold ${f.devSoldPct.toFixed(0)}%`)
    : f.devHoldPct > S.devMaxPct ? bad(`dev holds ${f.devHoldPct.toFixed(1)}%`)
    : ok(`dev ${f.devHoldPct.toFixed(1)}%`) },
  { id: 3, name: "Bundle Hunter", check: f => f.bundledPct <= S.bundledMaxPct ? ok(`${f.bundledPct}% bundled`) : bad(`bundle ${f.bundledPct}%`) },
  { id: 4, name: "Holder Mapper", check: f =>
      f.top10Pct > S.top10MaxPct ? bad(`top10 hold ${f.top10Pct.toFixed(0)}%`)
    : f.holders < S.minHolders ? bad(`only ${f.holders} holders`)
    : ok(`${f.holders} · top10 ${f.top10Pct.toFixed(0)}%`) },
  { id: 5, name: "LP Inspector", check: f => f.lpBurned ? ok("lp burned") : bad("lp not burned") },
  { id: 6, name: "Mint Auditor", check: f =>
      f.freezeAuthority !== null ? bad("freeze authority ON")
    : f.mintAuthority !== null ? bad("mint authority LIVE")
    : ok("revoked") },
  { id: 7, name: "Hype Meter", check: f => f.mentions >= S.minMentions ? ok(`${f.mentions} mentions`) : bad(`${f.mentions} mentions · dead`) },
  { id: 8, name: "Curve Reader", check: f => f.curvePct <= S.curveMaxPct ? ok(`curve ${f.curvePct}%`) : bad(`curve ${f.curvePct}% · too late`) },
  { id: 9, name: "Whale Watch", check: f => f.topFreshWalletPct <= S.whaleMaxPct ? ok(`top fresh ${f.topFreshWalletPct}%`) : bad(`fresh whale ${f.topFreshWalletPct}%`) },
  { id: 10, name: "Honeypot Sim", check: f =>
      !f.sellSimOk ? bad("sell fail · honeypot")
    : f.sellTaxPct > S.maxSellTaxPct ? bad(`sell tax ${f.sellTaxPct}%`)
    : ok(`sell ok · tax ${f.sellTaxPct}%`) },
  { id: 11, name: "Sniper Count", check: f => f.snipersPct <= S.snipersMaxPct ? ok(`snipers ${f.snipersPct}%`) : bad(`snipers ${f.snipersPct}% in blk 0`) },
  { id: 12, name: "KOL Radar", check: f => f.paidKolShare <= S.maxPaidKolShare ? ok(`paid ${Math.round(f.paidKolShare * 100)}%`) : bad(`paid calls ${Math.round(f.paidKolShare * 100)}%`) },
  { id: 13, name: "Volume Scout", check: f => f.volSpike >= S.minVolSpike ? ok(`vol ${f.volSpike.toFixed(1)}×`) : bad(`vol ${f.volSpike.toFixed(1)}× · flat`) },
  // 14 Exit Planner and 15 Profit Taker don't judge entries, they manage the bag (see mesh.ts)
];

/** Volume Scout + Hype Meter size the entry. */
export function sizeFor(f: MintFacts): number {
  const heat = Math.min(1, (f.mentions / 120 + f.volSpike / 8) / 2);
  return +(CONFIG.entrySol + (CONFIG.maxEntrySol - CONFIG.entrySol) * heat).toFixed(2);
}
