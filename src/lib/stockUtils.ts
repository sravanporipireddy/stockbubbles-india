import { Stock } from './mockData';

// Function to format large numbers with commas and abbreviations
export const formatNumber = (num: number): string => {
  if (num >= 1e12) {
    return (num / 1e12).toFixed(2) + 'T';
  } else if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  return num.toString();
};

// Function to format currency values (in ₹)
export const formatCurrency = (value: number): string => {
  return '₹' + formatNumber(value);
};

// Function to format percentage changes
export const formatPercentage = (percent: number): string => {
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
};

// Function to format price with appropriate decimal places
export const formatPrice = (price: number): string => {
  return price < 10 ? price.toFixed(3) : price.toFixed(2);
};

// Function to determine bubble color based on performance
export const getBubbleColor = (changePercent: number): string => {
  if (changePercent > 5) return 'bg-gradient-to-br from-green-500 to-green-700 shadow-md shadow-green-600/20';
  if (changePercent > 2) return 'bg-gradient-to-br from-green-400 to-green-600 shadow-md shadow-green-500/20';
  if (changePercent > 0) return 'bg-gradient-to-br from-green-300 to-green-500 shadow-md shadow-green-400/20';
  if (changePercent > -2) return 'bg-gradient-to-br from-red-300 to-red-500 shadow-md shadow-red-400/20';
  if (changePercent > -5) return 'bg-gradient-to-br from-red-400 to-red-600 shadow-md shadow-red-500/20';
  return 'bg-gradient-to-br from-red-500 to-red-700 shadow-md shadow-red-600/20';
};

// Improved function to determine bubble size based on market cap with more variation
export const getBubbleSize = (marketCap: number, maxMarketCap: number): number => {
  const minSize = 40; // Minimum bubble size
  const maxSize = 120; // Maximum bubble size - increased for more variation
  
  // Apply logarithmic scaling for better size distribution
  const logMarketCap = Math.log(marketCap + 1);
  const logMaxMarketCap = Math.log(maxMarketCap + 1);
  const sizeRatio = logMarketCap / logMaxMarketCap;
  
  // Use the stock's market cap as a seed for deterministic sizing
  const variance = ((marketCap % 5000) / 5000) * 15; // Creates a larger deterministic variance
  
  return Math.max(minSize, Math.min(maxSize, minSize + (maxSize - minSize) * sizeRatio + variance));
};

// Improved bubble positioning using force-directed placement
export const generateBubblePosition = (
  index: number, 
  totalBubbles: number, 
  containerWidth: number, 
  containerHeight: number, 
  bubbleSize: number
): { x: number, y: number } => {
  // Use a combination of spiral and grid for initial positions
  const columns = Math.ceil(Math.sqrt(totalBubbles * 1.5));
  const rows = Math.ceil(totalBubbles / columns);
  
  // Get row and column for this index
  const col = index % columns;
  const row = Math.floor(index / columns);
  
  // Calculate initial grid-based position with spacing
  const cellWidth = containerWidth / columns;
  const cellHeight = containerHeight / rows;
  
  // Add a controlled offset based on index to break the grid pattern
  // Use prime numbers for more natural distribution
  const offsetX = ((index * 17) % 31 - 15) * 3;
  const offsetY = ((index * 23) % 29 - 14) * 3;
  
  // Calculate final position with a radial bias to create a more circular arrangement
  const centerBias = 0.3; // How much to bias toward the center (0-1)
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  
  // Base position from grid
  let x = (col + 0.5) * cellWidth;
  let y = (row + 0.5) * cellHeight;
  
  // Apply center bias
  x = x * (1 - centerBias) + centerX * centerBias;
  y = y * (1 - centerBias) + centerY * centerBias;
  
  // Apply offset
  x += offsetX;
  y += offsetY;
  
  // Ensure bubbles stay within container with padding
  const padding = bubbleSize / 2 + 10; // Added more padding to prevent edge overlap
  x = Math.max(padding, Math.min(containerWidth - padding, x));
  y = Math.max(padding, Math.min(containerHeight - padding, y));
  
  return { x, y };
};

// Function to determine text color based on performance
export const getTextColor = (changePercent: number): string => {
  if (changePercent > 0) return 'text-profit';
  if (changePercent < 0) return 'text-loss';
  return 'text-neutral';
};

// Function to filter stocks based on search term
export const filterStocksBySearch = (stocks: Stock[], searchTerm: string): Stock[] => {
  if (!searchTerm) return stocks;
  
  const term = searchTerm.toLowerCase();
  return stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(term) || 
    stock.name.toLowerCase().includes(term)
  );
};

// Function to filter stocks by sector
export const filterStocksBySector = (stocks: Stock[], sector: string): Stock[] => {
  if (!sector || sector === 'All') return stocks;
  
  return stocks.filter(stock => stock.sector === sector);
};

// Function to sort stocks by different criteria
export type SortCriteria = 'marketCap' | 'price' | 'changePercent' | 'name';
export type SortDirection = 'asc' | 'desc';

export const sortStocks = (
  stocks: Stock[], 
  criteria: SortCriteria = 'marketCap', 
  direction: SortDirection = 'desc'
): Stock[] => {
  return [...stocks].sort((a, b) => {
    let comparison = 0;
    
    switch (criteria) {
      case 'marketCap':
        comparison = a.marketCap - b.marketCap;
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'changePercent':
        comparison = a.changePercent - b.changePercent;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      default:
        comparison = a.marketCap - b.marketCap;
    }
    
    return direction === 'asc' ? comparison : -comparison;
  });
};

// Function to determine the max market cap in the stock list
export const getMaxMarketCap = (stocks: Stock[]): number => {
  return Math.max(...stocks.map(stock => stock.marketCap));
};
