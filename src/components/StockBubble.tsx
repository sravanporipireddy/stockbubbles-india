
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
  
  // Generate a unique number from stock ID for consistent positioning
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  
  const idHash = hashCode(stock.id);
  
  // Adjust bubble size calculation for better visual appearance
  const bubbleSize = getBubbleSize(stock.marketCap, maxMarketCap);
  const bubbleColor = getBubbleColor(stock.changePercent);
  const isPositive = stock.changePercent > 0;
  
  // Create more distributed initial positions
  const containerWidth = window.innerWidth * 0.9; // 90% of window width
  const containerHeight = 600; // Height of the container
  
  // Use the hash and some math to distribute bubbles throughout the container
  // This creates a pseudorandom but deterministic distribution
  const baseX = (idHash % 100) / 100; // Value between 0-1
  const baseY = ((idHash >> 10) % 100) / 100; // Different bit range for Y
  
  // Calculate position as percentage of container
  const posXPercent = baseX * 0.8 + 0.1; // 10% to 90% of width
  const posYPercent = baseY * 0.8 + 0.1; // 10% to 90% of height
  
  // Convert to pixels
  const posX = (posXPercent * containerWidth) - (containerWidth / 2);
  const posY = (posYPercent * containerHeight) - (containerHeight / 2);
  
  // Create varied floating animations
  const floatXAmp = ((idHash % 30) - 15) * 0.7; // -10.5 to 10.5px horizontal float
  const floatYAmp = ((idHash % 40) - 20) * 0.6; // -12 to 12px vertical float
  
  // Animation durations and delays (in seconds)
  const floatDuration = 2 + ((idHash % 25) / 10); // 2-4.5s
  const floatDelay = (idHash % 20) / 10; // 0-1.9s delay
  
  // Custom ease curve for more organic movement
  const customEase = [0.4, 0, 0.6, 1];
  
  return (
    <motion.div
      className="absolute cursor-pointer"
      initial={{ 
        scale: 0,
        opacity: 0,
        x: posX,
        y: posY
      }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: [posX, posX + floatXAmp, posX],
        y: [posY, posY + floatYAmp, posY]
      }}
      transition={{ 
        type: "spring",
        stiffness: 50,
        damping: 20,
        delay: 0.02 * index, // Staggered appearance
        x: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: floatDuration,
          ease: customEase,
          delay: floatDelay
        },
        y: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: floatDuration * 1.2,
          ease: customEase,
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
