
import '../lib/polyfills';
import { Stock } from './mockData';

// API key for IndianAPI.in
const API_KEY = 'sk-live-FzUh40xZf0dIYHahCCt8hc0Kiy84tOZ620CN2Mmm';

// Helper function to make the API requests to indianapi.in with the new base URL and auth method
const makeApiRequest = async (endpoint: string): Promise<any> => {
  try {
    console.log(`Making API request to: https://stock.indianapi.in${endpoint}`);
    
    const response = await fetch(`https://stock.indianapi.in${endpoint}`, {
      headers: {
        'x-api-key': API_KEY,
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

// Sample response structure from IndianAPI.in:
/*
{
  "ticker": "ZOMT.NS",
  "company": "Zomato",
  "price": 210.9,
  "percent_change": -0.53,
  "net_change": -1.13,
  "bid": 210.9,
  "ask": 0,
  "high": 214,
  "low": 208,
  "open": 208.15,
  "low_circuit_limit": 190.82,
  "up_circuit_limit": 233.23,
  "volume": 44447473,
  "close": 212.03,
  "overall_rating": "Bearish",
  "short_term_trend": "Bearish",
  "long_term_trend": "Bearish",
  "52_week_low": 146.3,
  "52_week_high": 304.7
}
*/

// Function to fetch stocks from the Indian Stock Market API
export const fetchStocks = async (): Promise<Stock[]> => {
  try {
    // Fetch most active stocks using the new endpoint
    const stocksResponse = await makeApiRequest('/NSE_most_active');
    
    console.log("API Response:", stocksResponse);
    
    if (!stocksResponse || !Array.isArray(stocksResponse)) {
      throw new Error("Invalid response format from API");
    }
    
    // Create stock objects from the API data
    const stocks: Stock[] = stocksResponse.map((stock: any, index: number) => {
      // Extract ticker symbol (removing .NS suffix if present)
      const symbol = stock.ticker ? stock.ticker.replace('.NS', '') : `STOCK${index}`;
      
      // Extract and parse numeric values safely
      const price = parseFloat(stock.price) || 0;
      const previousPrice = parseFloat(stock.close) || price;
      const change = parseFloat(stock.net_change) || 0;
      const changePercent = parseFloat(stock.percent_change) || 0;
      const volume = parseFloat(stock.volume) || (100000 * (index + 1));
      
      // Determine sector based on available information
      let sector = 'Miscellaneous';
      
      // Map ratings to sectors as a fallback if no industry data
      if (stock.overall_rating) {
        if (stock.overall_rating.includes('Bullish')) {
          sector = 'Technology';
        } else if (stock.overall_rating.includes('Bearish')) {
          sector = 'Consumer Services';
        } else {
          sector = 'Financial';
        }
      }
      
      return {
        id: symbol,
        symbol: symbol,
        name: stock.company || symbol,
        price: price,
        previousPrice: previousPrice,
        change: change,
        changePercent: changePercent,
        marketCap: volume * price, // Estimating market cap as volume * price
        volume: volume,
        sector: sector
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
    // Endpoint not currently available, so we'll attempt but have fallbacks
    const indicesResponse = await makeApiRequest('/NSE_indices');
    
    console.log("Indices Response:", indicesResponse);
    
    if (!indicesResponse || !Array.isArray(indicesResponse)) {
      throw new Error("Invalid indices response format from API");
    }
    
    // Extract the main indices from the response
    const mainIndices = [
      'NIFTY 50',
      'NIFTY BANK',
      'NIFTY IT',
      'INDIA VIX'
    ];
    
    const result = indicesResponse
      .filter((index: any) => mainIndices.includes(index.name))
      .map((index: any) => {
        const value = parseFloat(index.lastPrice) || 0;
        const previousValue = parseFloat(index.previousClose) || value;
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
    // Endpoint not currently available, so we'll attempt but have fallbacks
    const sectorsResponse = await makeApiRequest('/NSE_sectors');
    
    console.log("Sectors Response:", sectorsResponse);
    
    if (!sectorsResponse || !Array.isArray(sectorsResponse)) {
      throw new Error("Invalid sectors response format from API");
    }
    
    const result = sectorsResponse.slice(0, 10).map((sector: any) => {
      const changePercent = parseFloat(sector.percentChange) || 0;
      
      return {
        name: sector.sectorName || 'Unknown Sector',
        changePercent: changePercent,
        marketCap: parseFloat(sector.marketCap) || 1000000000
      };
    });
    
    return result;
  } catch (error) {
    console.error("Error fetching sector performance from Indian Stock Market API:", error);
    throw error;
  }
};
