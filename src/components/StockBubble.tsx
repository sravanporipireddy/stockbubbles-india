
import React, { useState, useEffect } from 'react';
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
  index: number; // For staggered animation
  allStocks: Stock[]; // All stocks for collision detection
}

const StockBubble: React.FC<StockBubbleProps> = ({ stock, maxMarketCap, onClick, index, allStocks }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
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
  
  // Calculate bubble size based on market cap
  const bubbleSize = getBubbleSize(stock.marketCap, maxMarketCap);
  const bubbleColor = getBubbleColor(stock.changePercent);
  const isPositive = stock.changePercent > 0;
  
  // Define container dimensions
  const containerWidth = Math.min(window.innerWidth * 0.8, 1200);
  const containerHeight = 450;
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  
  // Generate initial position using golden ratio distribution for better spacing
  useEffect(() => {
    const goldenRatio = 1.618033988749895;
    const goldenAngle = Math.PI * 2 * (1 - 1 / goldenRatio);
    
    // Start with a spiral layout based on index
    const radius = Math.sqrt(index + 1) * 25;
    const angle = index * goldenAngle;
    
    // Calculate initial position in a spiral pattern
    let x = centerX + radius * Math.cos(angle);
    let y = centerY + radius * Math.sin(angle);
    
    // Add slight randomness to break perfect patterns
    x += ((idHash % 20) - 10) * 2;
    y += ((idHash >> 4) % 20 - 10) * 2;
    
    // Ensure bubbles stay within container boundaries
    x = Math.max(bubbleSize / 2, Math.min(containerWidth - bubbleSize / 2, x));
    y = Math.max(bubbleSize / 2, Math.min(containerHeight - bubbleSize / 2, y));
    
    setPosition({ x, y });
  }, [index, idHash, bubbleSize, centerX, centerY, containerWidth, containerHeight]);
  
  // Create varied floating animations for natural movement
  const floatXAmp = ((idHash % 16) - 8) * 0.7; // Reduced horizontal float amplitude
  const floatYAmp = ((idHash % 20) - 10) * 0.6; // Reduced vertical float amplitude
  
  // Animation durations and delays (in seconds)
  const floatDuration = 2 + ((idHash % 20) / 10); // 2-4s
  const floatDelay = (idHash % 20) / 10; // 0-1.9s delay
  
  // Custom ease curve for more organic movement
  const customEase = [0.4, 0, 0.6, 1];
  
  return (
    <motion.div
      className="absolute cursor-pointer"
      initial={{ 
        scale: 0,
        opacity: 0,
        x: position.x,
        y: position.y
      }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: [position.x, position.x + floatXAmp, position.x],
        y: [position.y, position.y + floatYAmp, position.y]
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
        zIndex: isHovering ? 100 : 50,
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
