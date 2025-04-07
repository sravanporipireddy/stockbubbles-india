
import React, { useState } from 'react';
import { Stock } from '@/lib/mockData';
import BubbleContent from './BubbleContent';
import { 
  getBubbleColor, 
  getBubbleSize
} from '@/lib/visualUtils';

interface StockBubbleProps {
  stock: Stock;
  maxMarketCap: number;
  onClick: (stock: Stock) => void;
  index: number;
  allStocks: Stock[];
  position: { x: number, y: number };
}

const StockBubble: React.FC<StockBubbleProps> = ({ 
  stock, 
  maxMarketCap, 
  onClick, 
  index,
  position
}) => {
  const [isHovering, setIsHovering] = useState(false);
  
  // Calculate bubble size based on market cap
  const bubbleSize = getBubbleSize(stock.marketCap, maxMarketCap);
  const bubbleColor = getBubbleColor(stock.changePercent);
  
  return (
    <div
      className="absolute cursor-pointer stock-bubble"
      style={{ 
        width: bubbleSize, 
        height: bubbleSize,
        zIndex: isHovering ? 100 : 50,
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translate(${position.x - bubbleSize/2}px, ${position.y - bubbleSize/2}px)`,
        // Remove all transition animations to prevent flicker
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => onClick(stock)}
    >
      <div 
        className={`absolute inset-0 rounded-full flex flex-col items-center justify-center overflow-hidden ${bubbleColor} p-2 shadow-lg`}
        style={{
          boxShadow: isHovering 
            ? '0 0 0 3px rgba(255,255,255,0.6), 0 8px 25px rgba(0,0,0,0.3)' 
            : '0 4px 10px rgba(0,0,0,0.15)'
        }}
      >
        <BubbleContent stock={stock} />
      </div>
    </div>
  );
};

export default StockBubble;
