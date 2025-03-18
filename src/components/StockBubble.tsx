
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
  index: number; // Added index prop for staggered animation
}

const StockBubble: React.FC<StockBubbleProps> = ({ stock, maxMarketCap, onClick, index }) => {
  const [isHovering, setIsHovering] = useState(false);
  
  // Get a proper random seed from stock ID
  const randomSeed = parseInt(stock.id.substring(0, 8), 16);
  
  // Adjust bubble size calculation for better visual appearance
  const bubbleSize = getBubbleSize(stock.marketCap, maxMarketCap);
  const bubbleColor = getBubbleColor(stock.changePercent);
  const isPositive = stock.changePercent > 0;
  
  // Create more varied starting positions to pack bubbles closer together
  // Use stock id plus index to create more variation
  const posX = ((randomSeed % 140) - 70) * 1.1; // Wider range: -77px to +77px
  const posY = ((randomSeed % 120) - 60) * 1.1; // Higher range: -66px to +66px
  
  // Create more varied floating animations
  const floatAmplitude = 6 + (randomSeed % 10); // 6-15px movement range
  const floatDuration = 2 + (randomSeed % 3) + (randomSeed % 10) / 10; // 2-4.9 seconds
  const floatDelay = (randomSeed % 20) / 10; // 0-1.9 second delay
  
  // Multiple float directions with different timing
  const floatX1 = ((randomSeed % 14) - 7) * 0.9; // More horizontal movement
  const floatX2 = ((randomSeed % 20) - 10) * 0.7; // More horizontal variety
  const floatY1 = floatAmplitude * -1; // Always float upward slightly
  const floatY2 = floatAmplitude * -0.8; // Secondary smaller upward float
  
  // Create smooth transitions with custom easing
  const customEase = [0.4, 0, 0.6, 1]; // Smoother motion curve
  
  return (
    <motion.div
      className="absolute cursor-pointer"
      initial={{ 
        scale: 0,
        opacity: 0,
        x: posX - 10,
        y: posY - 10
      }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: [posX + floatX1, posX + floatX2, posX],
        y: [posY, posY + floatY1, posY + floatY2]
      }}
      transition={{ 
        type: "tween",
        duration: 0.6,
        delay: 0.05 * (index % 20), // Staggered appearance
        x: {
          repeat: Infinity,
          duration: floatDuration * 1.3,
          ease: customEase,
          repeatType: "reverse",
          delay: floatDelay
        },
        y: {
          repeat: Infinity,
          duration: floatDuration,
          ease: customEase,
          repeatType: "reverse",
          delay: floatDelay * 0.7
        }
      }}
      exit={{ scale: 0, opacity: 0 }}
      style={{ 
        width: bubbleSize, 
        height: bubbleSize,
        zIndex: isHovering ? 50 : 1
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => onClick(stock)}
      whileHover={{ 
        scale: 1.15, 
        zIndex: 50, 
        transition: { duration: 0.2 } 
      }}
    >
      <motion.div 
        className={`absolute inset-0 rounded-full flex flex-col items-center justify-center overflow-hidden ${bubbleColor} p-2`}
        animate={{ 
          boxShadow: isHovering 
            ? '0 0 0 3px rgba(255,255,255,0.6), 0 8px 25px rgba(0,0,0,0.3)' 
            : '0 4px 10px rgba(0,0,0,0.15)'
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
