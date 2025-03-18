
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
  
  // Get a proper random seed from stock ID
  const randomSeed = parseInt(stock.id.substring(0, 8), 16);
  
  // Adjust bubble size calculation for better visual appearance
  const bubbleSize = getBubbleSize(stock.marketCap, maxMarketCap) * 0.75;
  const bubbleColor = getBubbleColor(stock.changePercent);
  const isPositive = stock.changePercent > 0;
  
  // Create true random-looking movement patterns
  const floatAmplitude = 5 + (randomSeed % 8); // 5-12px movement range
  const floatDuration = 2 + (randomSeed % 3) + (randomSeed % 10) / 10; // 2-4.9 seconds
  const floatDelay = (randomSeed % 20) / 10; // 0-1.9 second delay
  
  // Calculate a more organic starting position 
  // This creates a proper bubble cloud effect rather than a grid
  const posX = ((randomSeed % 100) - 50) * 0.8; // -40px to +40px
  const posY = ((randomSeed % 80) - 40) * 0.8; // -32px to +32px
  
  // Multiple float directions with different timing
  // This creates more organic movement like real bubbles
  const floatX1 = ((randomSeed % 10) - 5) * 0.6; // -3px to +3px
  const floatX2 = ((randomSeed % 14) - 7) * 0.4; // -2.8px to +2.8px
  const floatY1 = floatAmplitude * -1; // Always float upward slightly
  const floatY2 = floatAmplitude * -0.7; // Secondary smaller upward float
  
  // Create smooth transitions with custom easing
  const customEase = [0.4, 0, 0.6, 1]; // Smoother motion curve
  
  return (
    <motion.div
      className="relative cursor-pointer"
      initial={{ 
        scale: 0.6, 
        opacity: 0,
        x: posX - 5,
        y: posY - 5
      }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: [posX + floatX1, posX + floatX2, posX],
        y: [posY, posY + floatY1, posY + floatY2]
      }}
      transition={{ 
        type: "tween",
        duration: 0.5,
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
        zIndex: 1
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
