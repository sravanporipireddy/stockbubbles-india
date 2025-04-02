import '../lib/polyfills';

import { Stock } from './mockData';
import { NseIndia } from 'stock-nse-india';

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

// Improved function to determine bubble size based on market cap with more natural distribution
export const getBubbleSize = (marketCap: number, maxMarketCap: number): number => {
  const minSize = 40; // Minimum bubble size
  const maxSize = 120; // Maximum bubble size
  
  // Apply square root scaling for better visual area representation (standard in D3 bubble charts)
  const sizeRatio = Math.sqrt(marketCap / maxMarketCap);
  
  // Add slight variance based on market cap to avoid exact same sizes
  const sizeSeed = (marketCap % 10000) / 10000;
  const variance = sizeSeed * 15;
  
  return Math.max(minSize, Math.min(maxSize, minSize + (maxSize - minSize) * sizeRatio + variance));
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

// Create an instance of the NSE India API client with error handling
let nseApi: NseIndia | null = null;
try {
  nseApi = new NseIndia();
} catch (error) {
  console.error("Failed to initialize NSE India API:", error);
}

// Improved mock function to fetch stocks (fallback since NSE API methods don't exist)
export const fetchNseStocks = async (): Promise<Stock[]> => {
  try {
    if (!nseApi) {
      throw new Error("NSE API could not be initialized");
    }
    
    // Since the NSE API doesn't have the expected methods, we'll implement a minimal solution
    // that returns some basic stocks for demonstration purposes
    const mockStocks: Stock[] = [
      {
        id: "RELIANCE",
        symbol: "RELIANCE",
        name: "Reliance Industries Ltd",
        price: 2876.45,
        previousPrice: 2850.30,
        change: 26.15,
        changePercent: 0.92,
        marketCap: 1950000000000,
        volume: 3500000,
        sector: "Energy"
      },
      {
        id: "TCS",
        symbol: "TCS",
        name: "Tata Consultancy Services Ltd",
        price: 3567.80,
        previousPrice: 3550.20,
        change: 17.60,
        changePercent: 0.50,
        marketCap: 1300000000000,
        volume: 1200000,
        sector: "Technology"
      },
      {
        id: "HDFCBANK",
        symbol: "HDFCBANK",
        name: "HDFC Bank Ltd",
        price: 1678.25,
        previousPrice: 1690.10,
        change: -11.85,
        changePercent: -0.70,
        marketCap: 935000000000,
        volume: 2800000,
        sector: "Financial Services"
      }
    ];
    
    return mockStocks;
  } catch (error) {
    console.error("Error fetching NSE stocks:", error);
    throw error;
  }
};

// Mock function to fetch key indices data
export const fetchNseIndices = async () => {
  try {
    // Return mock indices data
    return [
      { name: "NIFTY 50", value: 22341.65, changePercent: 0.82 },
      { name: "NIFTY BANK", value: 48165.30, changePercent: 0.45 },
      { name: "NIFTY NEXT 50", value: 63554.20, changePercent: 0.93 },
      { name: "INDIA VIX", value: 13.86, changePercent: -2.34 }
    ];
  } catch (error) {
    console.error("Error fetching NSE indices:", error);
    throw error;
  }
};

// Mock function to fetch sector performance
export const fetchNseSectorPerformance = async () => {
  try {
    // Return mock sector performance data
    return [
      { name: "IT", changePercent: 1.2, marketCap: 15000000000000 },
      { name: "FMCG", changePercent: 0.8, marketCap: 9500000000000 },
      { name: "AUTO", changePercent: -0.3, marketCap: 7800000000000 },
      { name: "PHARMA", changePercent: 1.5, marketCap: 6200000000000 },
      { name: "METAL", changePercent: -1.2, marketCap: 5100000000000 },
      { name: "BANK", changePercent: 0.4, marketCap: 18500000000000 },
      { name: "ENERGY", changePercent: 2.1, marketCap: 12700000000000 }
    ];
  } catch (error) {
    console.error("Error fetching NSE sector performance:", error);
    throw error;
  }
};
