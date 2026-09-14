export const STOCKS = [
  { ticker: 'MOTHERSON', api: 'MOTHERSON.NS', name: 'Samvardhana Motherson', sector: 'EV components', tier: 1, debt: 21.4, improper: 1.3, liquidity: 8.2, conviction: 4 },
  { ticker: 'CROMPTON', api: 'CROMPTON.NS', name: 'Crompton Greaves Consumer', sector: 'Consumer durables', tier: 1, debt: 10.8, improper: 0.9, liquidity: 5.6, conviction: 3 },
  { ticker: 'VRLLOG', api: 'VRLLOG.NS', name: 'VRL Logistics', sector: 'Logistics', tier: 1, debt: 35.2, improper: 1.1, liquidity: 3.8, conviction: 2 },
  { ticker: 'TATAPOWER', api: 'TATAPOWER.NS', name: 'Tata Power', sector: 'Green grid infrastructure', tier: 1, debt: 28.1, improper: 2.2, liquidity: 6.4, conviction: 5 },
  { ticker: 'HINDZINC', api: 'HINDZINC.NS', name: 'Hindustan Zinc', sector: 'Non-ferrous metals', tier: 1, debt: 17.5, improper: 1.8, liquidity: 11.2, conviction: 3 },
  { ticker: 'KEC', api: 'KEC.NS', name: 'KEC International', sector: 'Power grid infrastructure', tier: 2, debt: 26.2, improper: 1.6, liquidity: 4.9, conviction: 4 },
  { ticker: 'CARBORUNIV', api: 'CARBORUNIV.NS', name: 'Carborundum Universal', sector: 'Industrial ceramics', tier: 2, debt: 3.9, improper: 1.2, liquidity: 10.8, conviction: 3 },
  { ticker: 'GODREJCP', api: 'GODREJCP.NS', name: 'Godrej Consumer Products', sector: 'Defensive consumption', tier: 2, debt: 8.7, improper: 0.8, liquidity: 4.1, conviction: 5 },
  { ticker: 'CGPOWER', api: 'CGPOWER.NS', name: 'CG Power', sector: 'Semiconductors & locomotives', tier: 2, debt: 1.7, improper: 1.4, liquidity: 7.6, conviction: 5 },
  { ticker: 'CLEAN', api: 'CLEAN.NS', name: 'Clean Science & Technology', sector: 'Specialty green chemicals', tier: 2, debt: 0.3, improper: 2.1, liquidity: 18.4, conviction: 4 },
  { ticker: 'ASTRAL', api: 'ASTRAL.NS', name: 'Astral', sector: 'Pipes & building materials', tier: 3, debt: 2.8, improper: 0.7, liquidity: 9.3, conviction: 3 },
  { ticker: 'SUNPHARMA', api: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical', sector: 'Global pharma', tier: 3, debt: 1.4, improper: 1.9, liquidity: 14.1, conviction: 4 },
  { ticker: 'RELIANCE', api: 'RELIANCE.NS', name: 'Reliance Industries', sector: 'Energy, retail & telecom', tier: 3, debt: 18.9, improper: 4.3, liquidity: 7.9, conviction: 5 },
  { ticker: 'TCS', api: 'TCS.NS', name: 'Tata Consultancy Services', sector: 'Net-cash software export', tier: 3, debt: 0.4, improper: 1.1, liquidity: 12.7, conviction: 5 },
]

export const TIER_META = {
  1: { name: 'Lean month', range: '₹150–₹400/share', color: 'green' },
  2: { name: 'Average month', range: '₹400–₹1,000/share', color: 'amber' },
  3: { name: 'Bumper month', range: '₹1,000–₹4,500+/share', color: 'blue' },
}

export const isCompliant = (stock) => stock.debt < 33 && stock.improper < 5 && stock.liquidity < 33
