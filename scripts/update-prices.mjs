import { writeFile } from 'node:fs/promises'

const tickers = {
  MOTHERSON: 'MOTHERSON.NS', CROMPTON: 'CROMPTON.NS', VRLLOG: 'VRLLOG.NS',
  TATAPOWER: 'TATAPOWER.NS', HINDZINC: 'HINDZINC.NS', KEC: 'KEC.NS',
  CARBORUNIV: 'CARBORUNIV.NS', GODREJCP: 'GODREJCP.NS', CGPOWER: 'CGPOWER.NS',
  CLEAN: 'CLEAN.NS', ASTRAL: 'ASTRAL.NS', SUNPHARMA: 'SUNPHARMA.NS',
  RELIANCE: 'RELIANCE.NS', TCS: 'TCS.NS',
}

const current = JSON.parse(await (await import('node:fs/promises')).readFile('public/prices.json', 'utf8'))
const prices = { ...current.prices }
let refreshed = 0

await Promise.all(Object.entries(tickers).map(async ([ticker, symbol]) => {
  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const payload = await response.json()
    const closes = payload.chart.result?.[0]?.indicators?.quote?.[0]?.close?.filter(Number.isFinite) || []
    if (closes.length) {
      prices[ticker] = Number(closes.at(-1).toFixed(2))
      refreshed += 1
    }
  } catch (error) {
    console.warn(`${ticker}: ${error.message}; preserving previous price`)
  }
}))

if (!refreshed) throw new Error('Price refresh failed for every ticker')

await writeFile('public/prices.json', `${JSON.stringify({ source: `Yahoo Finance daily close · ${refreshed}/14 refreshed`, updatedAt: new Date().toISOString(), prices }, null, 2)}\n`)
console.log(`Updated ${refreshed} prices.`)
