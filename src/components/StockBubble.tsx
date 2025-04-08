
import React, { useState, useEffect, useRef } from 'react';
import { Stock } from '@/lib/mockData';
import BubbleContent from './BubbleContent';
import { 
  getBubbleColor, 
  getBubbleSize
} from '@/lib/visualUtils';

interface StockBubbleProps {
  stock: Stock | null;
  isPlaceholder?: boolean;
  maxMarketCap: number;
  onClick: (stock: Stock) => void;
  index: number;
  allStocks: Stock[];
  position: { x: number, y: number };
}

const StockBubble: React.FC<StockBubbleProps> = ({ 
  stock, 
  isPlaceholder = false,
  maxMarketCap, 
  onClick, 
  position
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  
  if (!stock) return null;
  
  // Calculate bubble size based on market cap
  const bubbleSize = isPlaceholder 
    ? 30 + Math.random() * 50 // Random size for placeholders
    : getBubbleSize(stock.marketCap, maxMarketCap);
    
  // For placeholder bubbles, use a neutral color
  const bubbleColor = isPlaceholder 
    ? 'bg-gradient-to-br from-gray-300 to-gray-400 opacity-30'
    : getBubbleColor(stock.changePercent);
  
  // Don't attach onClick handler to placeholder bubbles
  const handleClick = isPlaceholder ? undefined : () => onClick(stock);
  
  return (
    <div
      ref={bubbleRef}
      className={`absolute cursor-pointer stock-bubble ${isPlaceholder ? 'pointer-events-none' : ''}`}
      style={{ 
        width: bubbleSize, 
        height: bubbleSize,
        zIndex: isPlaceholder ? 10 : (isHovering ? 100 : 50),
        position: 'absolute',
        left: `${position.x - bubbleSize/2}px`,
        top: `${position.y - bubbleSize/2}px`,
        transform: 'none', // Remove transform to avoid rendering issues
        transition: 'left 0.5s ease, top 0.5s ease, width 0.5s ease, height 0.5s ease, opacity 0.3s ease',
        opacity: isPlaceholder ? 0.6 : 1
      }}
      onMouseEnter={() => !isPlaceholder && setIsHovering(true)}
      onMouseLeave={() => !isPlaceholder && setIsHovering(false)}
      onClick={handleClick}
    >
      <div 
        className={`absolute inset-0 rounded-full flex flex-col items-center justify-center overflow-hidden ${bubbleColor} p-2 shadow-lg`}
        style={{
          boxShadow: isPlaceholder ? 'none' : (isHovering 
            ? '0 0 0 3px rgba(255,255,255,0.6), 0 8px 25px rgba(0,0,0,0.3)' 
            : '0 4px 10px rgba(0,0,0,0.15)'),
          transition: 'box-shadow 0.2s ease',
        }}
      >
        {!isPlaceholder && <BubbleContent stock={stock} />}
      </div>
    </div>
  );
};

export default StockBubble;
