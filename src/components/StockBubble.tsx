
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';
import { 
  getBubbleColor, 
  getBubbleSize, 
  formatPrice,
  formatPercentage
} from '@/lib/stockUtils';
import { Stock } from '@/lib/mockData';

interface StockBubbleProps {
  stock: Stock;
  maxMarketCap: number;
  onClick: (stock: Stock) => void;
}

const StockBubble: React.FC<StockBubbleProps> = ({ stock, maxMarketCap, onClick }) => {
  const [isHovering, setIsHovering] = useState(false);
  
  const bubbleSize = getBubbleSize(stock.marketCap, maxMarketCap);
  const bubbleColor = getBubbleColor(stock.changePercent);
  const isPositive = stock.changePercent > 0;
  
  return (
    <motion.div
      className="relative cursor-pointer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ width: bubbleSize, height: bubbleSize }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => onClick(stock)}
      whileHover={{ scale: 1.1, zIndex: 10 }}
    >
      <motion.div 
        className={`absolute inset-0 rounded-full shadow-subtle flex flex-col items-center justify-center overflow-hidden bg-${bubbleColor}`}
        animate={{ 
          boxShadow: isHovering 
            ? '0 0 0 2px rgba(255,255,255,0.8), 0 8px 20px rgba(0,0,0,0.2)' 
            : '0 4px 8px rgba(0,0,0,0.1)'
        }}
      >
        <span className="font-bold text-white text-center px-1 text-sm sm:text-base">
          {stock.symbol}
        </span>
        
        <div className="flex items-center justify-center space-x-1 text-white font-semibold">
          <IndianRupee size={12} />
          <span className="text-xs">{formatPrice(stock.price)}</span>
        </div>
        
        <div className={`flex items-center mt-1 text-xs font-medium ${isPositive ? 'text-white' : 'text-white'}`}>
          {isPositive ? (
            <TrendingUp size={10} className="mr-0.5" />
          ) : (
            <TrendingDown size={10} className="mr-0.5" />
          )}
          <span>{formatPercentage(stock.changePercent)}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StockBubble;
