
import React, { useState, useRef } from 'react';
import { Stock } from '@/lib/mockData';
import BubbleContent from './BubbleContent';
import { 
  getBubbleColor, 
  getBubbleSize,
  getBubbleGlow
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
    ? 20 + Math.random() * 10 // Smaller placeholder bubbles
    : getBubbleSize(stock.marketCap, maxMarketCap);
    
  // For placeholder bubbles, use a more subtle gradient
  const bubbleColor = isPlaceholder 
    ? 'bg-gradient-to-br from-gray-600/20 to-gray-700/20' 
    : getBubbleColor(stock.changePercent);
  
  // Add glow effect based on performance
  const glowEffect = !isPlaceholder ? getBubbleGlow(stock.changePercent) : '';
  
  // Don't attach onClick handler to placeholder bubbles
  const handleClick = isPlaceholder ? undefined : () => onClick(stock);
  
  return (
    <div
      ref={bubbleRef}
      className={`absolute cursor-pointer stock-bubble ${isPlaceholder ? 'pointer-events-none' : ''} transition-transform`}
      style={{ 
        width: bubbleSize, 
        height: bubbleSize,
        zIndex: isPlaceholder ? 10 : (isHovering ? 100 : 50),
        position: 'absolute',
        left: `${position.x - bubbleSize/2}px`,
        top: `${position.y - bubbleSize/2}px`,
        transform: isHovering ? 'scale(1.08)' : 'scale(1)', 
        transition: 'left 0.5s ease, top 0.5s ease, transform 0.2s ease, opacity 0.3s ease',
        opacity: isPlaceholder ? 0.3 : 1 // Lower opacity for placeholders to make real stocks stand out
      }}
      onMouseEnter={() => !isPlaceholder && setIsHovering(true)}
      onMouseLeave={() => !isPlaceholder && setIsHovering(false)}
      onClick={handleClick}
    >
      <div 
        className={`absolute inset-0 rounded-full flex flex-col items-center justify-center overflow-hidden ${bubbleColor} p-2 ${glowEffect}`}
        style={{
          boxShadow: isPlaceholder ? 'none' : (isHovering 
            ? '0 0 0 3px rgba(255,255,255,0.3), 0 8px 25px rgba(0,0,0,0.3)' 
            : '0 4px 10px rgba(0,0,0,0.15)'),
          transition: 'box-shadow 0.2s ease',
        }}
      >
        {/* Always show content, but different styling for placeholders */}
        {isPlaceholder ? (
          <div className="w-full h-full rounded-full opacity-20"></div>
        ) : (
          <BubbleContent stock={stock} />
        )}
      </div>
    </div>
  );
};

export default StockBubble;
