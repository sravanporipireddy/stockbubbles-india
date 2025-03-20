
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';
import { 
  getBubbleColor, 
  getBubbleSize, 
  formatPrice,
  formatPercentage,
  generateBubblePosition
} from '@/lib/stockUtils';
import { Stock } from '@/lib/mockData';

interface StockBubbleProps {
  stock: Stock;
  maxMarketCap: number;
  onClick: (stock: Stock) => void;
  index: number; // For staggered animation
  allStocks: Stock[]; // All stocks for collision detection
}

const StockBubble: React.FC<StockBubbleProps> = ({ 
  stock, 
  maxMarketCap, 
  onClick, 
  index, 
  allStocks 
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  
  // Calculate bubble size based on market cap
  const bubbleSize = getBubbleSize(stock.marketCap, maxMarketCap);
  const bubbleColor = getBubbleColor(stock.changePercent);
  const isPositive = stock.changePercent > 0;
  
  // Define container dimensions
  const containerWidth = Math.min(window.innerWidth * 0.9, 1200);
  const containerHeight = 700; // Increased height for more space

  // Generate a position using the improved spiral algorithm
  const position = generateBubblePosition(
    index,
    allStocks.length,
    containerWidth,
    containerHeight,
    bubbleSize
  );
  
  // Create subtle floating animations for natural movement
  // Using index to create deterministic but varied animations
  const floatDuration = 3 + (index % 5); // 3-7s duration
  const floatDelay = (index % 10) * 0.2; // 0-1.8s delay
  
  // Much smaller floating distance
  const floatDistance = 3 + (index % 3); // 3-5px maximum movement
  
  return (
    <motion.div
      ref={bubbleRef}
      className="absolute cursor-pointer stock-bubble"
      initial={{ 
        scale: 0,
        opacity: 0,
      }}
      animate={{ 
        scale: 1, 
        opacity: 1,
      }}
      transition={{ 
        type: "spring",
        stiffness: 50,
        damping: 20,
        delay: 0.01 * index, // Staggered appearance
      }}
      exit={{ scale: 0, opacity: 0 }}
      style={{ 
        width: bubbleSize, 
        height: bubbleSize,
        zIndex: isHovering ? 100 : 50,
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%)` // Center the bubble
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => onClick(stock)}
      whileHover={{ 
        scale: 1.15, 
        zIndex: 100, 
        transition: { duration: 0.2 } 
      }}
    >
      <motion.div 
        className={`absolute inset-0 rounded-full flex flex-col items-center justify-center overflow-hidden ${bubbleColor} p-2 shadow-lg`}
        animate={{ 
          boxShadow: isHovering 
            ? '0 0 0 3px rgba(255,255,255,0.6), 0 8px 25px rgba(0,0,0,0.3)' 
            : '0 4px 10px rgba(0,0,0,0.15)',
          y: [0, floatDistance / 2, 0, -floatDistance / 2, 0],
        }}
        transition={{
          y: {
            repeat: Infinity,
            repeatType: "loop",
            duration: floatDuration,
            ease: "easeInOut",
            delay: floatDelay,
            times: [0, 0.25, 0.5, 0.75, 1]
          }
        }}
      >
        <span className="font-bold text-white text-center px-1 text-xs sm:text-sm truncate w-full">
          {stock.symbol}
        </span>
        
        <div className="flex items-center justify-center gap-1 text-white font-medium mt-1">
          <IndianRupee size={10} />
          <span className="text-xs">{formatPrice(stock.price)}</span>
        </div>
        
        <div className="flex items-center justify-center text-xs font-medium text-white mt-0.5">
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
