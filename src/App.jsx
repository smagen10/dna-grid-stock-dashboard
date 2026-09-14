import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Check,
  ChevronRight,
  CircleDollarSign,
  Droplets,
  IndianRupee,
  LayoutDashboard,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  WalletCards,
} from 'lucide-react'
import { STOCKS, TIER_META, isCompliant } from './data'
import { useLocalStorage } from './useLocalStorage'

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const money2 = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
const tabs = [
  ['allocate', 'Allocate', LayoutDashboard],
  ['ledger', 'Ledger', WalletCards],
  ['projection', '5-year view', BarChart3],
  ['compliance', 'Compliance', ShieldCheck],
  ['purification', 'Purification', Droplets],
]

function tierForCapital(value) {
  if (value < 2000) return 1
  if (value < 6000) return 2
  return 3
}

function buildAllocation(capital, prices) {
  if (!prices) return { buys: [], spent: 0, remaining: Number(capital) || 0, activeTier: tierForCapital(Number(capital) || 0) }
  let remaining = Math.max(0, Number(capital) || 0)
  const activeTier = tierForCapital(remaining)
  const order = activeTier === 1 ? [1] : activeTier === 2 ? [2, 1] : [3, 2, 1]
  const buys = []

  for (const tier of order) {
    const eligible = STOCKS
      .filter((s) => s.tier === tier && isCompliant(s) && prices[s.ticker] <= remaining)
      .sort((a, b) => b.conviction - a.conviction || prices[b.ticker] - prices[a.ticker])
    if (!eligible.length) continue

    const stock = eligible[0]
    const maxShares = tier === activeTier ? (activeTier === 1 ? 3 : 1) : 3
    const qty = Math.min(maxShares, Math.floor(remaining / prices[stock.ticker]))
    if (qty > 0) {
      buys.push({ ...stock, qty, price: prices[stock.ticker], total: qty * prices[stock.ticker] })
      remaining -= qty * prices[stock.ticker]
    }
  }

  if (remaining > 0) {
    const rounding = STOCKS
      .filter((s) => s.tier === 1 && isCompliant(s) && prices[s.ticker] <= remaining)
      .sort((a, b) => prices[b.ticker] - prices[a.ticker])
    for (const stock of rounding) {
      if (prices[stock.ticker] <= remaining && !buys.some((b) => b.ticker === stock.ticker)) {
        buys.push({ ...stock, qty: 1, price: prices[stock.ticker], total: prices[stock.ticker] })
        remaining -= prices[stock.ticker]
      }
      if (remaining < Math.min(...STOCKS.filter(isCompliant).map((s) => prices[s.ticker]))) break
    }
  }

  const spent = buys.reduce((sum, b) => sum + b.total, 0)
  return { buys, spent, remaining, activeTier }
}

function ProjectionChart({ transactions, monthlyAmount, rate }) {
  const width = 760
  const height = 270
  const pad = 38
  const monthlyRate = Math.pow(1 + rate / 100, 1 / 12) - 1
  const contributions = Array.from({ length: 61 }, (_, month) => {
    const historic = transactions
      .filter((t) => {
        const age = Math.max(0, Math.floor((Date.now() - new Date(t.date).getTime()) / 2629800000))
        return age >= 60 - month
      })
      .reduce((sum, t) => sum + t.spent, 0)
    return historic || monthlyAmount * month
  })
  const projected = []
  let balance = transactions.reduce((sum, t) => sum + t.spent, 0)
  for (let i = 0; i <= 60; i += 1) {
    if (i > 0) balance = balance * (1 + monthlyRate) + monthlyAmount
    projected.push(balance)
  }
  const maximum = Math.max(...contributions, ...projected, 1)
  const points = (values) => values.map((value, index) => {
    const x = pad + (index / 60) * (width - pad * 2)
    const y = height - pad - (value / maximum) * (height - pad * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Five-year portfolio projection at ${rate}% annual growth`}>
        {[0, 1, 2, 3, 4].map((line) => {
          const y = pad + line * ((height - pad * 2) / 4)
          return <line key={line} x1={pad} y1={y} x2={width - pad} y2={y} className="grid-line" />
        })}
        <polyline points={points(contributions)} className="line contributions" />
        <polyline points={points(projected)} className="line projection" />
        {[0, 12, 24, 36, 48, 60].map((month) => (
          <text key={month} x={pad + (month / 60) * (width - pad * 2)} y={height - 10} textAnchor="middle">{month / 12}Y</text>
        ))}
      </svg>
      <div className="chart-legend">
        <span><i className="legend-dot mint" /> Contributions</span>
        <span><i className="legend-dot gold" /> {rate}% projected value</span>
      </div>
    </div>
  )
}

function Status({ stock }) {
  const compliant = isCompliant(stock)
  return <span className={`status ${compliant ? 'ok' : 'bad'}`}><i />{compliant ? 'Compliant' : 'Non-Compliant · Freeze'}</span>
}

export default function App() {
  const [active, setActive] = useState('allocate')
  const [capital, setCapital] = useState(2500)
  const [prices, setPrices] = useState(null)
  const [priceMeta, setPriceMeta] = useState({ source: 'Loading prices…', updatedAt: null })
  const [transactions, setTransactions] = useLocalStorage('dna-transactions', [])
  const [purifications, setPurifications] = useLocalStorage('dna-purifications', [])
  const [rate, setRate] = useState(12)
  const [notice, setNotice] = useState('')
  const [dividend, setDividend] = useState('')
  const [dividendSource, setDividendSource] = useState('')

  useEffect(() => {
    fetch('./prices.json')
      .then((response) => response.json())
      .then((data) => {
        setPrices(data.prices)
        setPriceMeta({ source: data.source, updatedAt: data.updatedAt })
      })
      .catch(() => setPriceMeta({ source: 'Price feed unavailable', updatedAt: null }))
  }, [])

  const allocation = useMemo(() => buildAllocation(capital, prices), [capital, prices])
  const tier = TIER_META[allocation.activeTier]
  const invested = transactions.reduce((sum, t) => sum + t.spent, 0)
  const donated = purifications.reduce((sum, p) => sum + p.donation, 0)

  const addPlan = () => {
    if (!allocation.buys.length) return
    const entry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      capital: Number(capital),
      spent: allocation.spent,
      cash: allocation.remaining,
      buys: allocation.buys,
    }
    setTransactions([entry, ...transactions])
    setNotice('Allocation added to your 5-year ledger.')
    window.setTimeout(() => setNotice(''), 2500)
  }

  const addPurification = (event) => {
    event.preventDefault()
    const amount = Number(dividend)
    if (!amount || amount <= 0) return
    setPurifications([{
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      source: dividendSource || 'Dividend credit',
      amount,
      donation: amount * 0.03,
      reinvest: amount * 0.97,
    }, ...purifications])
    setDividend('')
    setDividendSource('')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setActive('allocate')} aria-label="DNA Grid home">
          <span className="brand-mark"><Sparkles size={18} /></span>
          <span><strong>DNA Grid</strong><small>Freelance capital system</small></span>
        </button>
        <div className="data-pill" title={priceMeta.updatedAt ? new Date(priceMeta.updatedAt).toLocaleString('en-IN') : ''}>
          <i /> {priceMeta.source}
        </div>
      </header>

      <aside className="sidebar" aria-label="Dashboard navigation">
        <nav>
          {tabs.map(([id, label, Icon]) => (
            <button key={id} className={active === id ? 'active' : ''} onClick={() => setActive(id)}>
              <Icon size={19} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <ShieldCheck size={19} />
          <p><strong>Quarterly review</strong><br />Compliance can change with every balance sheet.</p>
        </div>
      </aside>

      <main>
        {active === 'allocate' && (
          <section className="page allocate-page">
            <div className="page-heading compact">
              <div><p className="eyebrow">Invoice routing engine</p><h1>Put this month’s capital to work.</h1></div>
              <div className="mini-stat"><span>5-year invested</span><strong>{money.format(invested)}</strong></div>
            </div>

            <div className="allocator-grid">
              <div className="capital-card">
                <label htmlFor="capital">Available freelance capital</label>
                <div className="money-input"><IndianRupee size={26} /><input id="capital" value={capital} min="0" step="100" type="number" onChange={(e) => setCapital(e.target.value)} /></div>
                <div className="quick-values">
                  {[1000, 2500, 7500, 15000].map((value) => <button key={value} onClick={() => setCapital(value)}>{money.format(value)}</button>)}
                </div>
                <div className={`tier-callout ${tier.color}`}>
                  <div><span>Active matrix</span><strong>{tier.name}</strong></div>
                  <b>{tier.range}</b>
                </div>
              </div>

              <div className="recommendation-card">
                <div className="card-title"><div><p className="eyebrow">Recommended route</p><h2>{allocation.buys.length ? `${allocation.buys.reduce((s, b) => s + b.qty, 0)} shares across ${allocation.buys.length} stocks` : 'Add more capital to begin'}</h2></div><CircleDollarSign size={25} /></div>
                <div className="buy-list">
                  {allocation.buys.map((buy) => (
                    <div className="buy-row" key={buy.ticker}>
                      <span className={`tier-dot t${buy.tier}`}>{buy.tier}</span>
                      <div><strong>{buy.ticker}</strong><small>{buy.sector}</small></div>
                      <span className="qty">{buy.qty} × {money2.format(buy.price)}</span>
                      <b>{money2.format(buy.total)}</b>
                    </div>
                  ))}
                </div>
                <div className="allocation-total">
                  <div><span>Invested</span><strong>{money2.format(allocation.spent)}</strong></div>
                  <div><span>Cash buffer</span><strong>{money2.format(allocation.remaining)}</strong></div>
                  <button className="primary" onClick={addPlan} disabled={!allocation.buys.length}><Plus size={18} /> Add plan to ledger</button>
                </div>
                {notice && <div className="toast" role="status" aria-live="polite"><Check size={17} />{notice}</div>}
              </div>
            </div>

            <div className="tier-strip">
              {[1, 2, 3].map((number) => {
                const meta = TIER_META[number]
                return <button key={number} className={allocation.activeTier === number ? `selected ${meta.color}` : ''} onClick={() => setCapital(number === 1 ? 1000 : number === 2 ? 3500 : 10000)}><span>Tier 0{number}</span><strong>{meta.name}</strong><small>{STOCKS.filter((s) => s.tier === number).length} stocks · {meta.range}</small><ChevronRight size={18} /></button>
              })}
            </div>

            <div className="disclaimer"><ShieldCheck size={18} /><p><strong>Decision-support only.</strong> Prices and screening ratios must be verified before placing an order. This dashboard does not provide investment advice or a religious ruling.</p></div>
          </section>
        )}

        {active === 'ledger' && (
          <section className="page">
            <div className="page-heading"><div><p className="eyebrow">Contribution history</p><h1>Your 5-year ledger</h1><p>Plans are stored only on this device.</p></div><div className="mini-stat"><span>Total recorded</span><strong>{money.format(invested)}</strong></div></div>
            {!transactions.length ? <div className="empty"><WalletCards size={32} /><h2>No contributions yet</h2><p>Add an allocation plan to start your timeline.</p><button className="primary" onClick={() => setActive('allocate')}>Create first plan</button></div> : (
              <div className="ledger-list">
                {transactions.map((entry) => <article key={entry.id} className="ledger-entry"><div><span>{new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span><h2>{money2.format(entry.spent)} invested</h2><p>{entry.buys.map((b) => `${b.qty} ${b.ticker}`).join(' · ')}</p></div><div className="ledger-actions"><small>{money2.format(entry.cash)} buffer</small><button className="icon-button" aria-label="Delete ledger entry" onClick={() => setTransactions(transactions.filter((t) => t.id !== entry.id))}><Trash2 size={17} /></button></div></article>)}
              </div>
            )}
          </section>
        )}

        {active === 'projection' && (
          <section className="page">
            <div className="page-heading"><div><p className="eyebrow">Accumulation outlook</p><h1>Five years, one invoice at a time.</h1><p>Projection assumes the current contribution repeats monthly.</p></div><div className="rate-toggle" aria-label="Growth assumption">{[12, 15].map((value) => <button key={value} className={rate === value ? 'active' : ''} onClick={() => setRate(value)}>{value}% CAGR</button>)}</div></div>
            <div className="projection-layout">
              <div className="chart-card"><ProjectionChart transactions={transactions} monthlyAmount={Number(capital) || 0} rate={rate} /></div>
              <div className="projection-summary"><p className="eyebrow">At year 5</p><strong>{money.format(Array.from({ length: 60 }).reduce((balance) => balance * (1 + (Math.pow(1 + rate / 100, 1 / 12) - 1)) + (Number(capital) || 0), invested))}</strong><span>illustrative projected value</span><hr /><div><small>Monthly assumption</small><b>{money.format(Number(capital) || 0)}</b></div><div><small>Growth assumption</small><b>{rate}% annually</b></div><p className="fineprint">Returns are not guaranteed. Taxes, fees, dividends and market volatility are excluded.</p></div>
            </div>
          </section>
        )}

        {active === 'compliance' && (
          <section className="page">
            <div className="page-heading"><div><p className="eyebrow">Three-filter guardrail</p><h1>Shariah screening matrix</h1><p>Green only when all three configured ratios pass.</p></div><div className="thresholds"><span>Debt &lt; 33%</span><span>Improper revenue &lt; 5%</span><span>Liquidity &lt; 33%</span></div></div>
            <div className="warning"><RefreshCw size={18} /><p><strong>Illustrative fundamentals.</strong> Replace these sample ratios with a verified quarterly data source or qualified screening provider before relying on a status.</p></div>
            <div className="table-wrap"><table><thead><tr><th>Stock</th><th>Tier</th><th>Debt / market cap</th><th>Improper revenue</th><th>Cash / market cap</th><th>Status</th></tr></thead><tbody>{STOCKS.map((stock) => <tr key={stock.ticker}><td><strong>{stock.ticker}</strong><small>{stock.name}</small></td><td><span className={`tier-badge t${stock.tier}`}>Tier {stock.tier}</span></td><td className={stock.debt >= 33 ? 'failed' : ''}>{stock.debt}%</td><td className={stock.improper >= 5 ? 'failed' : ''}>{stock.improper}%</td><td className={stock.liquidity >= 33 ? 'failed' : ''}>{stock.liquidity}%</td><td><Status stock={stock} /></td></tr>)}</tbody></table></div>
          </section>
        )}

        {active === 'purification' && (
          <section className="page">
            <div className="page-heading"><div><p className="eyebrow">Purification loop</p><h1>Log. Cleanse. Reinvest.</h1><p>Track accidental dividend credits and the configured 3% cleansing amount.</p></div><div className="mini-stat"><span>Total marked for donation</span><strong>{money2.format(donated)}</strong></div></div>
            <div className="purification-layout">
              <form className="purification-form" onSubmit={addPurification}><div className="form-icon"><Droplets size={24} /></div><h2>New dividend credit</h2><label>Source or stock<input value={dividendSource} onChange={(e) => setDividendSource(e.target.value)} placeholder="e.g. TCS dividend" /></label><label>Amount received (INR)<input value={dividend} onChange={(e) => setDividend(e.target.value)} type="number" min="0" step="0.01" placeholder="0.00" /></label><div className="split-preview"><div><span>Donate 3%</span><strong>{money2.format((Number(dividend) || 0) * 0.03)}</strong></div><div><span>Return to ledger 97%</span><strong>{money2.format((Number(dividend) || 0) * 0.97)}</strong></div></div><button className="primary" type="submit">Save purification entry</button><p className="fineprint">The 3% setting is a generic tracker rule, not an individualized religious determination.</p></form>
              <div className="purification-history"><h2>Purification history</h2>{!purifications.length ? <div className="empty small"><p>No dividend credits recorded.</p></div> : purifications.map((entry) => <article key={entry.id}><div><span>{entry.source}</span><small>{new Date(entry.date).toLocaleDateString('en-IN')}</small></div><div><span>{money2.format(entry.amount)}</span><small>{money2.format(entry.donation)} donation</small></div><button className="icon-button" aria-label="Delete purification entry" onClick={() => setPurifications(purifications.filter((p) => p.id !== entry.id))}><Trash2 size={17} /></button></article>)}</div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
