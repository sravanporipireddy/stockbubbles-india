
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

// Helper function to make the API requests to indianapi.in
const makeApiRequest = async (endpoint: string): Promise<any> => {
  try {
    const response = await fetch(`https://indianapi.in/stock-market${endpoint}`);
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
    // Fetch top stocks from the NSE endpoint
    const topStocksData = await makeApiRequest('/nse/top-gainers-nse/');
    const nifty50Data = await makeApiRequest('/nse/nifty-50/');
    
    // Combine the two datasets and remove duplicates
    const combinedStocksData = [...topStocksData.data, ...nifty50Data.data];
    const uniqueSymbols = new Set();
    const uniqueStocks = combinedStocksData.filter((stock: any) => {
      if (uniqueSymbols.has(stock.symbol)) {
        return false;
      }
      uniqueSymbols.add(stock.symbol);
      return true;
    });
    
    // Create stock objects from the API data
    const stocks: Stock[] = uniqueStocks.map((stock: any) => {
      // Calculate change and changePercent
      const price = parseFloat(stock.lastPrice) || 0;
      const previousPrice = parseFloat(stock.previousClose) || price;
      const change = price - previousPrice;
      const changePercent = previousPrice ? (change / previousPrice) * 100 : 0;
      
      return {
        id: stock.symbol,
        symbol: stock.symbol,
        name: stock.companyName || stock.symbol,
        price: price,
        previousPrice: previousPrice,
        change: change,
        changePercent: changePercent,
        marketCap: parseFloat(stock.marketCap) || 1000000000,
        volume: parseFloat(stock.totalTradedVolume) || 0,
        sector: stock.series || 'Unknown'
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
    const niftyData = await makeApiRequest('/nse/indices/');
    
    // Extract the main indices from the response
    const mainIndices = [
      'NIFTY 50',
      'NIFTY BANK',
      'NIFTY IT',
      'INDIA VIX'
    ];
    
    const result = niftyData.data
      .filter((index: any) => mainIndices.includes(index.indexName))
      .map((index: any) => {
        const value = parseFloat(index.lastPrice) || 0;
        const previousValue = parseFloat(index.previousClose) || value;
        const changePercent = ((value - previousValue) / previousValue) * 100;
        
        return {
          name: index.indexName,
          value: value,
          changePercent: changePercent
        };
      });
    
    // If we have fewer than 4 indices, add placeholders for missing ones
    while (result.length < 4) {
      result.push({
        name: `Index ${result.length + 1}`,
        value: 0,
        changePercent: 0
      });
    }
    
    return result;
  } catch (error) {
    console.error("Error fetching indices from Indian Stock Market API:", error);
    throw error;
  }
};

// Function to fetch sector performance
export const fetchSectorPerformance = async () => {
  try {
    const sectorsData = await makeApiRequest('/nse/indices/');
    
    // Extract sector indices
    const sectorIndices = sectorsData.data.filter((index: any) => 
      index.indexName.includes('NIFTY') && 
      !['NIFTY 50', 'NIFTY BANK', 'NIFTY NEXT 50', 'NIFTY 100'].includes(index.indexName)
    );
    
    const result = sectorIndices.slice(0, 10).map((sector: any) => {
      const value = parseFloat(sector.lastPrice) || 0;
      const previousValue = parseFloat(sector.previousClose) || value;
      const changePercent = ((value - previousValue) / previousValue) * 100;
      
      // Convert index name to a sector name (e.g., "NIFTY IT" -> "IT")
      let name = sector.indexName.replace('NIFTY ', '');
      name = name.split(' ').map((word: string) => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      
      return {
        name: name,
        changePercent: changePercent,
        marketCap: parseFloat(sector.marketCapitalisation) || 1000000000
      };
    });
    
    return result;
  } catch (error) {
    console.error("Error fetching sector performance from Indian Stock Market API:", error);
    throw error;
  }
};
