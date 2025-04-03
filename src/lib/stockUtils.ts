
import './polyfills';

import { Stock } from './mockData';
// Import Finnhub correctly - using require syntax for compatibility
const finnhub = require('finnhub');

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

// Function to format currency values (in $)
export const formatCurrency = (value: number): string => {
  return '$' + formatNumber(value);
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

// Initialize Finnhub client with demo API key
// Users should replace this with their own API key
const API_KEY = 'cphvjmir01qiijru5c6g'; // Demo key from Finnhub docs

// Initialize finnhub client properly with error handling
let finnhubClient: any;
try {
  const api = new finnhub.DefaultApi();
  api.apiKey = API_KEY;
  finnhubClient = api;
  console.log('Finnhub client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Finnhub client:', error);
  finnhubClient = null;
}

// Helper function to safely make Finnhub API calls
const makeFinnhubRequest = (method: string, params: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!finnhubClient) {
      reject(new Error('Finnhub client is not initialized'));
      return;
    }
    
    try {
      // @ts-ignore - We know this method exists on the client
      finnhubClient[method](params, (error: any, data: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Function to fetch stocks from Finnhub API
export const fetchStocks = async (): Promise<Stock[]> => {
  try {
    // Use a selection of popular stocks as a sample
    const symbols = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'NVDA', 'JPM', 'BAC', 'WMT'];
    
    const stocks: Stock[] = [];
    
    await Promise.all(symbols.map(async (symbol) => {
      try {
        // Get company profile
        const profileData: any = await makeFinnhubRequest('companyProfile2', { symbol });
        
        // Get quote data
        const quoteData: any = await makeFinnhubRequest('quote', { symbol });
        
        if (profileData && quoteData) {
          const stock: Stock = {
            id: symbol,
            symbol: symbol,
            name: profileData.name || symbol,
            price: quoteData.c || 0,
            previousPrice: quoteData.pc || 0,
            change: quoteData.c - quoteData.pc,
            changePercent: ((quoteData.c - quoteData.pc) / quoteData.pc) * 100,
            marketCap: profileData.marketCapitalization * 1000000 || 1000000000,
            volume: quoteData.v || 0,
            sector: profileData.finnhubIndustry || 'Unknown'
          };
          
          stocks.push(stock);
        }
      } catch (symbolError) {
        console.error(`Error fetching data for ${symbol}:`, symbolError);
      }
    }));
    
    return stocks;
  } catch (error) {
    console.error("Error fetching stocks from Finnhub:", error);
    throw error;
  }
};

// Function to fetch market indices data
export const fetchIndices = async () => {
  try {
    const indices = [
      { symbol: 'SPY', name: 'S&P 500' },
      { symbol: 'DIA', name: 'Dow Jones' },
      { symbol: 'QQQ', name: 'NASDAQ' },
      { symbol: 'VIX', name: 'Volatility Index' },
    ];
    
    const result = await Promise.all(indices.map(async (index) => {
      try {
        const quoteData: any = await makeFinnhubRequest('quote', { symbol: index.symbol });
        
        if (quoteData) {
          return {
            name: index.name,
            value: quoteData.c || 0,
            changePercent: ((quoteData.c - quoteData.pc) / quoteData.pc) * 100
          };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching data for index ${index.symbol}:`, error);
        return null;
      }
    }));
    
    return result.filter(Boolean);
  } catch (error) {
    console.error("Error fetching indices:", error);
    throw error;
  }
};

// Function to fetch sector performance
export const fetchSectorPerformance = async () => {
  try {
    const sectorETFs = [
      { symbol: 'XLK', name: 'Technology' },
      { symbol: 'XLF', name: 'Financial' },
      { symbol: 'XLV', name: 'Healthcare' },
      { symbol: 'XLE', name: 'Energy' },
      { symbol: 'XLI', name: 'Industrial' },
      { symbol: 'XLP', name: 'Consumer Staples' },
      { symbol: 'XLY', name: 'Consumer Discretionary' },
      { symbol: 'XLB', name: 'Materials' },
      { symbol: 'XLU', name: 'Utilities' },
      { symbol: 'XLRE', name: 'Real Estate' },
    ];
    
    const result = await Promise.all(sectorETFs.map(async (sector) => {
      try {
        const quoteData: any = await makeFinnhubRequest('quote', { symbol: sector.symbol });
        
        // Get a rough market cap estimate for the sector (this is simplified)
        const marketCap = Math.random() * 10000000000 + 1000000000;
        
        if (quoteData) {
          return {
            name: sector.name,
            changePercent: ((quoteData.c - quoteData.pc) / quoteData.pc) * 100,
            marketCap: marketCap
          };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching data for sector ${sector.symbol}:`, error);
        return null;
      }
    }));
    
    return result.filter(Boolean);
  } catch (error) {
    console.error("Error fetching sector performance:", error);
    throw error;
  }
};
