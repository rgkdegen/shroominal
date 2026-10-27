// SHROOMINAL — spore thresholds and trading params for the SHROOM mesh
export const CONFIG = {
  entrySol: 0.5,             // default size when every spore is clean
  maxEntrySol: 1.5,          // Volume Scout + Hype Meter can size up to this
  exits: {
    stopPct: 35,             // Exit Planner: hard stop below entry
    tp1Multiple: 3,          // Profit Taker: sell tp1SellPct at this multiple
    tp1SellPct: 40,
    tp2Multiple: 10,         // sell tp2SellPct at this multiple
    tp2SellPct: 40,          // the remaining 20% rides as a moonbag
  },
  spores: {
    maxAgeSec: 90,           // Launch Sniffer: only judge mints younger than this
    devMaxPct: 5,            // Dev Tracer: max % of supply the dev wallet holds
    devSoldMaxPct: 10,       // Dev Tracer: max % of supply the dev has already sold
    bundledMaxPct: 15,       // Bundle Hunter: max % of supply bought in launch bundles
    minHolders: 80,          // Holder Mapper: min distinct holders
    top10MaxPct: 30,         // Holder Mapper: max % held by the top 10 wallets
    // LP Inspector + Mint Auditor: LP must be burned/locked, mint + freeze authority revoked
    maxSellTaxPct: 10,       // Honeypot Sim: simulated sell must succeed under this tax
    snipersMaxPct: 12,       // Sniper Count: max % of supply taken in block 0
    minMentions: 15,         // Hype Meter: min organic X mentions in the first minutes
    maxPaidKolShare: 0.5,    // KOL Radar: max share of mentions coming from paid callers
    whaleMaxPct: 8,          // Whale Watch: skip if one fresh wallet holds more than this
    minVolSpike: 2,          // Volume Scout: 1m volume vs 5m avg
    curveMaxPct: 60,         // Curve Reader: skip if the bonding curve is already this full
  },
  dryRun: true,              // log decisions only, never send transactions
};
