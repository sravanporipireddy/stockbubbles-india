import { Stock } from './mockData';
import { NseIndia } from 'stock-nse-india';
import '../lib/polyfills';

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

// Create an instance of the NSE India API client
const nseApi = new NseIndia();

// Function to fetch all stock data from NSE
export const fetchNseStocks = async (): Promise<Stock[]> => {
  try {
    // Get all stocks - using the available method from the stock-nse-india package
    const equities = await nseApi.getAllStockSymbols();
    
    // Create a set of stock symbols for which we need detailed data
    const stockSymbols = equities.slice(0, 100);
    
    // Get sector information
    const sectorMap = new Map<string, string>();
    const indices = await nseApi.getIndicesStocksList();
    
    // We'll use Nifty sectoral indices to determine sectors when possible
    for (const index of indices) {
      if (index.index.includes("NIFTY") && index.index.includes("SECTOR")) {
        const sectorName = index.index.replace("NIFTY ", "").replace(" SECTOR", "");
        try {
          // Assign a default sector based on the index name for now
          stockSymbols.forEach(stock => {
            // Only set if not already set
            if (!sectorMap.has(stock)) {
              // We'll assign some random stocks to each sector for demo
              if (Math.random() > 0.8) {
                sectorMap.set(stock, sectorName);
              }
            }
          });
        } catch (error) {
          console.error(`Error processing sector ${sectorName}:`, error);
        }
      }
    }
    
    // Fetch detailed stock data for each symbol (in batches to avoid rate limiting)
    const batchSize = 10; // Process 10 stocks at a time
    const allStocks: Stock[] = [];
    
    for (let i = 0; i < stockSymbols.length; i += batchSize) {
      const batch = stockSymbols.slice(i, i + batchSize);
      const batchPromises = batch.map(async (symbol) => {
        try {
          const stockDetails = await nseApi.getStockDetails(symbol);
          // Use getStockQuote instead of getEquityQuote
          const quote = await nseApi.getStockQuote(symbol);
          
          if (stockDetails && quote) {
            // Create a stock object that matches the Stock type from mockData
            const stock: Stock = {
              id: symbol,
              symbol: symbol,
              name: stockDetails.info?.companyName || symbol,
              price: quote.priceInfo?.lastPrice || 0,
              previousPrice: quote.priceInfo?.previousClose || 0,
              change: quote.priceInfo?.change || 0,
              changePercent: quote.priceInfo?.pChange || 0,
              marketCap: (quote.securityInfo?.issuedSize || 0) * (quote.priceInfo?.lastPrice || 0),
              volume: quote.priceInfo?.totalTradedVolume || 0,
              sector: sectorMap.get(symbol) || "Other",
              high52: quote.priceInfo?.weekHighLow?.yearHigh || 0,
              low52: quote.priceInfo?.weekHighLow?.yearLow || 0
            };
            return stock;
          }
          return null;
        } catch (error) {
          console.error(`Error fetching details for ${symbol}:`, error);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      allStocks.push(...batchResults.filter(Boolean) as Stock[]);
      
      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < stockSymbols.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return allStocks.length > 0 ? allStocks : [];
  } catch (error) {
    console.error("Error fetching NSE stocks:", error);
    throw error;
  }
};

// Function to fetch key indices data
export const fetchNseIndices = async () => {
  try {
    const indices = await nseApi.getIndicesStocksList();
    return indices
      .filter(index => 
        ["NIFTY 50", "NIFTY BANK", "NIFTY NEXT 50", "INDIA VIX"].includes(index.index)
      )
      .map(index => ({
        name: index.index,
        value: index.last,
        changePercent: index.percentChange
      }));
  } catch (error) {
    console.error("Error fetching NSE indices:", error);
    throw error;
  }
};

// Function to fetch sector performance - ensuring it returns data with the same structure
export const fetchNseSectorPerformance = async () => {
  try {
    const indices = await nseApi.getIndicesStocksList();
    return indices
      .filter(index => 
        index.index.includes("NIFTY") && index.index.includes("SECTOR")
      )
      .map(index => {
        const sectorName = index.index.replace("NIFTY ", "").replace(" SECTOR", "");
        return {
          name: sectorName,
          performance: index.percentChange,
          changePercent: index.percentChange,
          marketCap: index.totalMarketCap || 0
        };
      });
  } catch (error) {
    console.error("Error fetching NSE sector performance:", error);
    throw error;
  }
};
