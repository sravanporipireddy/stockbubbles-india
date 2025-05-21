
// Function to determine bubble color based on performance
export const getBubbleColor = (changePercent: number): string => {
  // More vibrant colors with bright green for positive and red for negative
  if (changePercent > 8) return 'bg-gradient-to-br from-green-500 to-green-700 shadow-md shadow-green-600/20';
  if (changePercent > 5) return 'bg-gradient-to-br from-green-400 to-green-600 shadow-md shadow-green-500/20';
  if (changePercent > 2) return 'bg-gradient-to-br from-green-300 to-green-500 shadow-md shadow-green-400/20';
  if (changePercent > 0) return 'bg-gradient-to-br from-green-200 to-green-400 shadow-md shadow-green-300/20';
  if (changePercent > -2) return 'bg-gradient-to-br from-red-200 to-red-400 shadow-md shadow-red-300/20';
  if (changePercent > -5) return 'bg-gradient-to-br from-red-300 to-red-500 shadow-md shadow-red-400/20';
  if (changePercent > -8) return 'bg-gradient-to-br from-red-400 to-red-600 shadow-md shadow-red-500/20';
  return 'bg-gradient-to-br from-red-500 to-red-700 shadow-md shadow-red-600/20';
};

// Function to determine bubble size based on market cap for better distribution
export const getBubbleSize = (marketCap: number, maxMarketCap: number): number => {
  // Adjust size range to be closer to the reference image
  const minSize = 55; // Minimum bubble size for readability
  const maxSize = 120; // Maximum bubble size for larger tokens
  
  // Apply logarithmic scaling for better distribution of sizes
  const logMarketCap = Math.log(marketCap + 1);
  const logMaxMarketCap = Math.log(maxMarketCap + 1);
  const sizeRatio = logMarketCap / logMaxMarketCap;
  
  // Slightly less variance for more consistent sizes
  const variance = (Math.random() * 0.12 + 0.94); // 0.94 to 1.06 multiplier
  
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

// Get bubble glow based on performance (NEW)
export const getBubbleGlow = (changePercent: number): string => {
  if (changePercent > 8) return 'shadow-[0_0_15px_rgba(34,197,94,0.5)]';
  if (changePercent > 5) return 'shadow-[0_0_12px_rgba(34,197,94,0.4)]';
  if (changePercent > 2) return 'shadow-[0_0_10px_rgba(34,197,94,0.3)]';
  if (changePercent > 0) return 'shadow-[0_0_8px_rgba(34,197,94,0.2)]';
  if (changePercent > -2) return 'shadow-[0_0_8px_rgba(239,68,68,0.2)]';
  if (changePercent > -5) return 'shadow-[0_0_10px_rgba(239,68,68,0.3)]';
  if (changePercent > -8) return 'shadow-[0_0_12px_rgba(239,68,68,0.4)]';
  return 'shadow-[0_0_15px_rgba(239,68,68,0.5)]';
};
