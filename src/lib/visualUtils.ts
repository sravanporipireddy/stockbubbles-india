
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

// Function to determine the max market cap in the stock list
export const getMaxMarketCap = (stocks: any[]): number => {
  if (!stocks || stocks.length === 0) return 1000000000; // Default if no stocks
  return Math.max(...stocks.map(stock => stock.marketCap));
};
