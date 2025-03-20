
import React, { useState, useEffect, useRef } from 'react';
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
  const bubbleRef = useRef<HTMLDivElement>(null);
  
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
  
  // Calculate bubble size based on market cap with more variation
  const bubbleSize = getBubbleSize(stock.marketCap, maxMarketCap);
  const bubbleColor = getBubbleColor(stock.changePercent);
  const isPositive = stock.changePercent > 0;
  
  // Define container dimensions
  const containerWidth = Math.min(window.innerWidth * 0.9, 1200);
  const containerHeight = 600; // Increased height for more space
  
  // Initial layout configuration
  useEffect(() => {
    // Creating a more organized grid-like layout to avoid overlaps
    const numColumns = Math.ceil(Math.sqrt(allStocks.length));
    const cellWidth = containerWidth / numColumns;
    const cellHeight = containerHeight / numColumns;
    
    // Calculate position based on index with some randomness from hash
    const row = Math.floor(index / numColumns);
    const col = index % numColumns;
    
    // Center of the cell with some random offset
    let x = col * cellWidth + cellWidth / 2 + ((idHash % 50) - 25);
    let y = row * cellHeight + cellHeight / 2 + ((idHash % 40) - 20);
    
    // Offset entire grid to center it
    x += (containerWidth - numColumns * cellWidth) / 2;
    y += (containerHeight - (Math.ceil(allStocks.length / numColumns)) * cellHeight) / 2;
    
    // Ensure bubbles stay within container boundaries
    x = Math.max(bubbleSize / 2, Math.min(containerWidth - bubbleSize / 2, x));
    y = Math.max(bubbleSize / 2, Math.min(containerHeight - bubbleSize / 2, y));
    
    // Allow time for DOM to update
    setTimeout(() => {
      adjustPositionToAvoidCollision(x, y);
    }, 10);
  }, [index, allStocks.length, bubbleSize, containerWidth, containerHeight, idHash]);
  
  // Collision detection and position adjustment
  const adjustPositionToAvoidCollision = (initialX: number, initialY: number) => {
    let x = initialX;
    let y = initialY;
    let attempts = 0;
    const maxAttempts = 50;
    let overlapping = true;
    
    while (overlapping && attempts < maxAttempts) {
      overlapping = false;
      
      // Check for collisions with other bubbles
      document.querySelectorAll('.stock-bubble').forEach((element) => {
        if (element !== bubbleRef.current && element instanceof HTMLElement) {
          const rect = element.getBoundingClientRect();
          const containerRect = document.querySelector('.bubble-container')?.getBoundingClientRect();
          
          if (!containerRect) return;
          
          // Get position relative to the container
          const bubbleX = rect.left + rect.width / 2 - containerRect.left;
          const bubbleY = rect.top + rect.height / 2 - containerRect.top;
          
          // Get size
          const bubbleWidth = rect.width;
          
          // Calculate distance between bubble centers
          const dx = x - bubbleX;
          const dy = y - bubbleY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // If overlapping, move away from this bubble
          const minDistance = (bubbleSize + bubbleWidth) / 2 + 10; // Add extra padding
          if (distance < minDistance) {
            overlapping = true;
            
            // Calculate direction to move (away from this bubble)
            const angle = Math.atan2(dy, dx);
            const moveDistance = (minDistance - distance) + 5;
            
            x += Math.cos(angle) * moveDistance;
            y += Math.sin(angle) * moveDistance;
            
            // Ensure we stay within container bounds
            x = Math.max(bubbleSize / 2, Math.min(containerWidth - bubbleSize / 2, x));
            y = Math.max(bubbleSize / 2, Math.min(containerHeight - bubbleSize / 2, y));
          }
        }
      });
      
      attempts++;
    }
    
    setPosition({ x, y });
  };
  
  // Create varied floating animations for natural movement
  const floatXAmp = ((idHash % 14) - 7) * 0.5; // Reduced horizontal float amplitude
  const floatYAmp = ((idHash % 16) - 8) * 0.4; // Reduced vertical float amplitude
  
  // Animation durations and delays (in seconds)
  const floatDuration = 2 + ((idHash % 20) / 10); // 2-4s
  const floatDelay = (idHash % 20) / 10; // 0-1.9s delay
  
  // Custom ease curve for more organic movement
  const customEase = [0.4, 0, 0.6, 1];
  
  return (
    <motion.div
      ref={bubbleRef}
      className="absolute cursor-pointer stock-bubble"
      initial={{ 
        scale: 0,
        opacity: 0,
        x: position.x,
        y: position.y,
      }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: position.x,
        y: position.y,
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
          y: [0, floatYAmp, 0],
          x: [0, floatXAmp, 0]
        }}
        transition={{
          y: {
            repeat: Infinity,
            repeatType: "mirror",
            duration: floatDuration * 1.2,
            ease: customEase,
            delay: floatDelay * 0.7
          },
          x: {
            repeat: Infinity,
            repeatType: "mirror",
            duration: floatDuration,
            ease: customEase,
            delay: floatDelay
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
