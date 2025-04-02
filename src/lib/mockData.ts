export interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  sector: string;
}

// Generate a random stock price movement
const generatePriceMovement = (basePrice: number): number => {
  const change = (Math.random() - 0.45) * (basePrice * 0.05);
  return parseFloat((basePrice + change).toFixed(2));
};

// Calculate the change percentage
const calculateChangePercent = (current: number, previous: number): number => {
  return parseFloat(((current - previous) / previous * 100).toFixed(2));
};

// Generate random market cap based on price
const generateMarketCap = (price: number): number => {
  // Random factor between 500 million and 2 trillion
  const factor = Math.random() * 2000 + 500;
  return Math.round(price * factor * 1000000);
};

// Base stocks with initial prices - expanded list
const baseStocks: Omit<Stock, 'previousPrice' | 'change' | 'changePercent' | 'marketCap' | 'volume'>[] = [
  { id: '1', symbol: 'RELIANCE', name: 'Reliance Industries', price: 2584, sector: 'Oil & Gas' },
  { id: '2', symbol: 'TCS', name: 'Tata Consultancy Services', price: 3456, sector: 'IT' },
  { id: '3', symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1675, sector: 'Banking' },
  { id: '4', symbol: 'INFY', name: 'Infosys', price: 1435, sector: 'IT' },
  { id: '5', symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2576, sector: 'FMCG' },
  { id: '6', symbol: 'ICICIBANK', name: 'ICICI Bank', price: 927, sector: 'Banking' },
  { id: '7', symbol: 'SBIN', name: 'State Bank of India', price: 624, sector: 'Banking' },
  { id: '8', symbol: 'BAJFINANCE', name: 'Bajaj Finance', price: 6983, sector: 'Finance' },
  { id: '9', symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 856, sector: 'Telecom' },
  { id: '10', symbol: 'ITC', name: 'ITC Limited', price: 447, sector: 'FMCG' },
  { id: '11', symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1846, sector: 'Banking' },
  { id: '12', symbol: 'LT', name: 'Larsen & Toubro', price: 2467, sector: 'Construction' },
  { id: '13', symbol: 'HCLTECH', name: 'HCL Technologies', price: 1267, sector: 'IT' },
  { id: '14', symbol: 'WIPRO', name: 'Wipro', price: 437, sector: 'IT' },
  { id: '15', symbol: 'ASIANPAINT', name: 'Asian Paints', price: 3126, sector: 'Consumer Goods' },
  { id: '16', symbol: 'AXISBANK', name: 'Axis Bank', price: 1027, sector: 'Banking' },
  { id: '17', symbol: 'MARUTI', name: 'Maruti Suzuki', price: 10487, sector: 'Automobile' },
  { id: '18', symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', price: 1268, sector: 'Pharmaceutical' },
  { id: '19', symbol: 'TATAMOTORS', name: 'Tata Motors', price: 643, sector: 'Automobile' },
  { id: '20', symbol: 'BAJAJFINSV', name: 'Bajaj Finserv', price: 1589, sector: 'Finance' },
  { id: '21', symbol: 'TITAN', name: 'Titan Company', price: 3245, sector: 'Consumer Goods' },
  { id: '22', symbol: 'POWERGRID', name: 'Power Grid Corporation', price: 234, sector: 'Power' },
  { id: '23', symbol: 'JSWSTEEL', name: 'JSW Steel', price: 785, sector: 'Metal' },
  { id: '24', symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ', price: 834, sector: 'Infrastructure' },
  { id: '25', symbol: 'NTPC', name: 'NTPC', price: 273, sector: 'Power' },
  { id: '26', symbol: 'ULTRACEMCO', name: 'UltraTech Cement', price: 8437, sector: 'Cement' },
  { id: '27', symbol: 'TATASTEEL', name: 'Tata Steel', price: 134, sector: 'Metal' },
  { id: '28', symbol: 'NESTLEIND', name: 'Nestle India', price: 23546, sector: 'FMCG' },
  { id: '29', symbol: 'ONGC', name: 'Oil & Natural Gas Corporation', price: 215, sector: 'Oil & Gas' },
  { id: '30', symbol: 'DIVISLAB', name: 'Divi\'s Laboratories', price: 3678, sector: 'Pharmaceutical' },
  { id: '31', symbol: 'GRASIM', name: 'Grasim Industries', price: 1987, sector: 'Cement' },
  { id: '32', symbol: 'INDUSINDBK', name: 'IndusInd Bank', price: 1432, sector: 'Banking' },
  { id: '33', symbol: 'DRREDDY', name: 'Dr. Reddy\'s Laboratories', price: 5793, sector: 'Pharmaceutical' },
  { id: '34', symbol: 'TECHM', name: 'Tech Mahindra', price: 1248, sector: 'IT' },
  { id: '35', symbol: 'COALINDIA', name: 'Coal India', price: 324, sector: 'Mining' },
  { id: '36', symbol: 'HINDALCO', name: 'Hindalco Industries', price: 543, sector: 'Metal' },
  { id: '37', symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto', price: 6784, sector: 'Automobile' },
  { id: '38', symbol: 'BPCL', name: 'Bharat Petroleum', price: 458, sector: 'Oil & Gas' },
  { id: '39', symbol: 'EICHERMOT', name: 'Eicher Motors', price: 3645, sector: 'Automobile' },
  { id: '40', symbol: 'HDFCLIFE', name: 'HDFC Life Insurance', price: 675, sector: 'Insurance' },
  { id: '41', symbol: 'CIPLA', name: 'Cipla', price: 1145, sector: 'Pharmaceutical' },
  { id: '42', symbol: 'UPL', name: 'UPL Limited', price: 567, sector: 'Agrochemicals' },
  { id: '43', symbol: 'HEROMOTOCO', name: 'Hero MotoCorp', price: 2987, sector: 'Automobile' },
  { id: '44', symbol: 'TATACONSUM', name: 'Tata Consumer Products', price: 945, sector: 'FMCG' },
  { id: '45', symbol: 'BRITANNIA', name: 'Britannia Industries', price: 4578, sector: 'FMCG' },
  { id: '46', symbol: 'ADANIENT', name: 'Adani Enterprises', price: 2453, sector: 'Infrastructure' },
  { id: '47', symbol: 'M&M', name: 'Mahindra & Mahindra', price: 1564, sector: 'Automobile' },
  { id: '48', symbol: 'APOLLOHOSP', name: 'Apollo Hospitals', price: 5243, sector: 'Healthcare' },
  { id: '49', symbol: 'SBILIFE', name: 'SBI Life Insurance', price: 1356, sector: 'Insurance' },
  { id: '50', symbol: 'ZOMATO', name: 'Zomato', price: 146, sector: 'Technology' },
  { id: '51', symbol: 'INDIGOPNTS', name: 'Indigo Paints', price: 1432, sector: 'Consumer Goods' },
  { id: '52', symbol: 'LICI', name: 'Life Insurance Corporation', price: 845, sector: 'Insurance' },
  { id: '53', symbol: 'MARICO', name: 'Marico', price: 543, sector: 'FMCG' },
  { id: '54', symbol: 'BERGEPAINT', name: 'Berger Paints', price: 678, sector: 'Consumer Goods' },
  { id: '55', symbol: 'JUBLFOOD', name: 'Jubilant FoodWorks', price: 478, sector: 'Food & Beverages' },
  { id: '56', symbol: 'HAVELLS', name: 'Havells India', price: 1365, sector: 'Consumer Goods' },
  { id: '57', symbol: 'DABUR', name: 'Dabur India', price: 543, sector: 'FMCG' },
  { id: '58', symbol: 'PIDILITIND', name: 'Pidilite Industries', price: 2543, sector: 'Chemicals' },
  { id: '59', symbol: 'GODREJCP', name: 'Godrej Consumer Products', price: 978, sector: 'FMCG' },
  { id: '60', symbol: 'COLPAL', name: 'Colgate-Palmolive', price: 1678, sector: 'FMCG' },
  { id: '61', symbol: 'SIEMENS', name: 'Siemens', price: 3245, sector: 'Capital Goods' },
  { id: '62', symbol: 'BOSCHLTD', name: 'Bosch', price: 19876, sector: 'Auto Components' },
  { id: '63', symbol: 'ABBOTINDIA', name: 'Abbott India', price: 23456, sector: 'Pharmaceutical' },
  { id: '64', symbol: 'DLF', name: 'DLF', price: 543, sector: 'Real Estate' },
  { id: '65', symbol: 'BAJAJHLDNG', name: 'Bajaj Holdings', price: 7654, sector: 'Finance' },
  { id: '66', symbol: 'MPHASIS', name: 'Mphasis', price: 2345, sector: 'IT' },
  { id: '67', symbol: 'LTIM', name: 'LTI Mindtree', price: 5432, sector: 'IT' },
  { id: '68', symbol: 'TIINDIA', name: 'Tube Investments', price: 3456, sector: 'Engineering' },
  { id: '69', symbol: 'PERSISTENT', name: 'Persistent Systems', price: 4567, sector: 'IT' },
  { id: '70', symbol: 'COFORGE', name: 'Coforge', price: 5432, sector: 'IT' },
  { id: '71', symbol: 'PFC', name: 'Power Finance Corporation', price: 234, sector: 'Finance' },
  { id: '72', symbol: 'RECLTD', name: 'REC Limited', price: 245, sector: 'Finance' },
  { id: '73', symbol: 'IRCTC', name: 'Indian Railway Catering', price: 678, sector: 'Services' },
  { id: '74', symbol: 'BHARATFORG', name: 'Bharat Forge', price: 1098, sector: 'Auto Components' },
  { id: '75', symbol: 'TORNTPHARM', name: 'Torrent Pharmaceuticals', price: 1987, sector: 'Pharmaceutical' },
  { id: '76', symbol: 'LUPIN', name: 'Lupin', price: 1156, sector: 'Pharmaceutical' },
  { id: '77', symbol: 'PAGEIND', name: 'Page Industries', price: 37896, sector: 'Textiles' },
  { id: '78', symbol: 'NYKAA', name: 'FSN E-Commerce (Nykaa)', price: 178, sector: 'Retail' },
  { id: '79', symbol: 'POLICYBZR', name: 'PB Fintech (PolicyBazaar)', price: 765, sector: 'Finance' },
  { id: '80', symbol: 'PAYTM', name: 'One97 Communications', price: 543, sector: 'Technology' }
];

// Initialize stocks with calculated values
export const generateInitialStocks = (): Stock[] => {
  return baseStocks.map(stock => {
    const price = stock.price;
    const previousPrice = price * (1 - (Math.random() * 0.1 - 0.05));
    const change = parseFloat((price - previousPrice).toFixed(2));
    const changePercent = calculateChangePercent(price, previousPrice);
    
    return {
      ...stock,
      previousPrice: parseFloat(previousPrice.toFixed(2)),
      change,
      changePercent,
      marketCap: generateMarketCap(price),
      volume: Math.round(Math.random() * 10000000 + 1000000),
    };
  });
};

// Update stock prices
export const updateStockPrices = (stocks: Stock[]): Stock[] => {
  return stocks.map(stock => {
    const previousPrice = stock.price;
    const newPrice = generatePriceMovement(previousPrice);
    const change = parseFloat((newPrice - previousPrice).toFixed(2));
    const changePercent = calculateChangePercent(newPrice, previousPrice);
    
    return {
      ...stock,
      previousPrice,
      price: newPrice,
      change,
      changePercent,
      volume: Math.round(Math.random() * 10000000 + 1000000),
    };
  });
};

// Generate sector data
export const getSectorPerformance = (stocks: Stock[]) => {
  const sectors: { [sector: string]: { totalMarketCap: number; totalChange: number; count: number } } = {};
  
  // Group stocks by sector and calculate total market cap and change
  stocks.forEach(stock => {
    if (!sectors[stock.sector]) {
      sectors[stock.sector] = { totalMarketCap: 0, totalChange: 0, count: 0 };
    }
    sectors[stock.sector].totalMarketCap += stock.marketCap;
    sectors[stock.sector].totalChange += stock.changePercent;
    sectors[stock.sector].count += 1;
  });
  
  // Calculate average performance for each sector
  return Object.keys(sectors).map(sectorName => {
    const sectorData = sectors[sectorName];
    return {
      name: sectorName,
      changePercent: sectorData.totalChange / sectorData.count, // Using changePercent, not performance
      marketCap: sectorData.totalMarketCap
    };
  });
};

export const stockSectors = [
  'All',
  'IT', 
  'Banking', 
  'Oil & Gas', 
  'FMCG', 
  'Finance', 
  'Telecom', 
  'Construction', 
  'Consumer Goods', 
  'Automobile', 
  'Pharmaceutical', 
  'Metal', 
  'Infrastructure', 
  'Power', 
  'Cement', 
  'Mining', 
  'Insurance', 
  'Agrochemicals', 
  'Healthcare', 
  'Technology',
  'Food & Beverages',
  'Chemicals',
  'Capital Goods',
  'Auto Components',
  'Real Estate',
  'Engineering',
  'Services',
  'Textiles',
  'Retail'
];
