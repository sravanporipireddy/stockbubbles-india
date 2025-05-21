
// Function to determine bubble color based on performance
export const getBubbleColor = (changePercent: number): string => {
  if (changePercent > 5) return 'bg-gradient-to-br from-green-500 to-green-700 shadow-md shadow-green-600/20';
  if (changePercent > 2) return 'bg-gradient-to-br from-green-400 to-green-600 shadow-md shadow-green-500/20';
  if (changePercent > 0) return 'bg-gradient-to-br from-green-300 to-green-500 shadow-md shadow-green-400/20';
  if (changePercent > -2) return 'bg-gradient-to-br from-red-300 to-red-500 shadow-md shadow-red-400/20';
  if (changePercent > -5) return 'bg-gradient-to-br from-red-400 to-red-600 shadow-md shadow-red-500/20';
  return 'bg-gradient-to-br from-red-500 to-red-700 shadow-md shadow-red-600/20';
};

// Function to determine bubble size based on market cap for better distribution
export const getBubbleSize = (marketCap: number, maxMarketCap: number): number => {
  const minSize = 50; // Minimum bubble size for readability
  const maxSize = 100; // Maximum bubble size to allow proper density
  
  // Apply logarithmic scaling for better distribution of sizes
  const logMarketCap = Math.log(marketCap + 1);
  const logMaxMarketCap = Math.log(maxMarketCap + 1);
  const sizeRatio = logMarketCap / logMaxMarketCap;
  
  // Add some controlled randomness to create visual interest while maintaining relative sizes
  const variance = (Math.random() * 0.15 + 0.92); // 0.92 to 1.07 multiplier - reduced variance
  
  return Math.max(minSize, Math.min(maxSize, minSize + (maxSize - minSize) * sizeRatio * variance));
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
