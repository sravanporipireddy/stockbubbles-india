
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
  if (changePercent > 4) return 'bubble-green-3';
  if (changePercent > 2) return 'bubble-green-2';
  if (changePercent > 0) return 'bubble-green-1';
  if (changePercent > -2) return 'bubble-red-1';
  if (changePercent > -4) return 'bubble-red-2';
  return 'bubble-red-3';
};

// Function to determine bubble size based on market cap
export const getBubbleSize = (marketCap: number, maxMarketCap: number): number => {
  // Min size: 40px, Max size: 120px, scaled by market cap
  const minSize = 40;
  const maxSize = 120;
  const sizeRatio = Math.sqrt(marketCap / maxMarketCap);
  return Math.max(minSize, Math.min(maxSize, minSize + (maxSize - minSize) * sizeRatio));
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
