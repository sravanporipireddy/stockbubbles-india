import './polyfills';

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

// Function to determine bubble size based on market cap
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

// API key for IndianAPI.in
const API_KEY = 'sk-live-FzUh40xZf0dIYHahCCt8hc0Kiy84tOZ620CN2Mmm';

// Helper function to make the API requests to indianapi.in
const makeApiRequest = async (endpoint: string): Promise<any> => {
  try {
    const response = await fetch(`https://indianapi.in/sandbox/stock${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Function to fetch stocks from the Indian Stock Market API
export const fetchStocks = async (): Promise<Stock[]> => {
  try {
    // Fetch top stocks from the NSE endpoint (using sandbox endpoint)
    const stocksResponse = await makeApiRequest('/nifty50');
    
    if (!stocksResponse.data || !Array.isArray(stocksResponse.data)) {
      throw new Error("Invalid response format from API");
    }
    
    // Create stock objects from the API data
    const stocks: Stock[] = stocksResponse.data.map((stock: any, index: number) => {
      // Extract and parse numeric values safely
      const price = parseFloat(stock.last_price) || 0;
      const previousPrice = parseFloat(stock.prev_close) || price;
      const change = price - previousPrice;
      const changePercent = previousPrice ? (change / previousPrice) * 100 : 0;
      const marketCap = parseFloat(stock.market_cap) || (1000000000 * (index + 1));
      
      return {
        id: stock.symbol || `STOCK${index}`,
        symbol: stock.symbol || `STOCK${index}`,
        name: stock.name || stock.symbol || `Stock ${index}`,
        price: price,
        previousPrice: previousPrice,
        change: change,
        changePercent: changePercent,
        marketCap: marketCap,
        volume: parseFloat(stock.volume) || (100000 * (index + 1)),
        sector: stock.sector || 'Technology'  // Default to Technology if sector is not provided
      };
    });
    
    return stocks;
  } catch (error) {
    console.error("Error fetching stocks from Indian Stock Market API:", error);
    throw error;
  }
};

// Function to fetch market indices data
export const fetchIndices = async () => {
  try {
    const indicesResponse = await makeApiRequest('/indices');
    
    if (!indicesResponse.data || !Array.isArray(indicesResponse.data)) {
      throw new Error("Invalid indices response format from API");
    }
    
    // Extract the main indices from the response
    const mainIndices = [
      'NIFTY 50',
      'NIFTY BANK',
      'NIFTY IT',
      'INDIA VIX'
    ];
    
    const result = indicesResponse.data
      .filter((index: any) => mainIndices.includes(index.name))
      .map((index: any) => {
        const value = parseFloat(index.last_price) || 0;
        const previousValue = parseFloat(index.prev_close) || value;
        const changePercent = ((value - previousValue) / previousValue) * 100;
        
        return {
          name: index.name,
          value: value,
          changePercent: changePercent
        };
      });
    
    // If we have fewer than 4 indices, add placeholders for missing ones
    const existingIndices = result.map(idx => idx.name);
    mainIndices.forEach(indexName => {
      if (!existingIndices.includes(indexName)) {
        result.push({
          name: indexName,
          value: 0,
          changePercent: 0
        });
      }
    });
    
    // Ensure we only have the exact 4 main indices
    return result.slice(0, 4);
  } catch (error) {
    console.error("Error fetching indices from Indian Stock Market API:", error);
    throw error;
  }
};

// Function to fetch sector performance
export const fetchSectorPerformance = async () => {
  try {
    const sectorsResponse = await makeApiRequest('/sectors');
    
    if (!sectorsResponse.data || !Array.isArray(sectorsResponse.data)) {
      throw new Error("Invalid sectors response format from API");
    }
    
    const result = sectorsResponse.data.slice(0, 10).map((sector: any) => {
      const changePercent = parseFloat(sector.performance) || 0;
      
      return {
        name: sector.name || 'Unknown Sector',
        changePercent: changePercent,
        marketCap: parseFloat(sector.market_cap) || 1000000000
      };
    });
    
    return result;
  } catch (error) {
    console.error("Error fetching sector performance from Indian Stock Market API:", error);
    throw error;
  }
};
