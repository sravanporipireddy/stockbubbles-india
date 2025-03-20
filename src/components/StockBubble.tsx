
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Stock } from '@/lib/mockData';
import BubbleContent from './BubbleContent';
import { 
  getBubbleColor, 
  getBubbleSize, 
  generateBubblePosition
} from '@/lib/stockUtils';

interface StockBubbleProps {
  stock: Stock;
  maxMarketCap: number;
  onClick: (stock: Stock) => void;
  index: number;
  allStocks: Stock[];
}

const StockBubble: React.FC<StockBubbleProps> = ({ 
  stock, 
  maxMarketCap, 
  onClick, 
  index, 
  allStocks 
}) => {
  const [isHovering, setIsHovering] = useState(false);
  
  // Calculate bubble size based on market cap
  const bubbleSize = getBubbleSize(stock.marketCap, maxMarketCap);
  const bubbleColor = getBubbleColor(stock.changePercent);
  
  // Define container dimensions
  const containerWidth = Math.min(window.innerWidth * 0.9, 1200);
  const containerHeight = 700;

  // Generate a position using the improved algorithm
  const position = generateBubblePosition(
    index,
    allStocks.length,
    containerWidth,
    containerHeight,
    bubbleSize
  );
  
  // Create subtle floating animations for natural movement
  const floatDuration = 4 + (index % 3); // 4-6s duration, reduced variance
  const floatDelay = (index % 5) * 0.2; // 0-0.8s delay, reduced variance
  const floatDistance = 2 + (index % 2); // 2-3px maximum movement, reduced range
  
  return (
    <motion.div
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
        <BubbleContent stock={stock} />
      </motion.div>
    </motion.div>
  );
};

export default StockBubble;
