
import React, { useState, useEffect } from 'react';
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
  const [currentStock, setCurrentStock] = useState<Stock>(stock);
  
  // Update current stock only when the component has finished rendering
  useEffect(() => {
    // Defer state update to next tick to prevent render interruption
    const timeoutId = setTimeout(() => {
      setCurrentStock(stock);
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [stock]);
  
  // Calculate bubble size based on market cap
  const bubbleSize = getBubbleSize(currentStock.marketCap, maxMarketCap);
  const bubbleColor = getBubbleColor(currentStock.changePercent);
  
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
        transition: 'none',
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => onClick(currentStock)}
    >
      <div 
        className={`absolute inset-0 rounded-full flex flex-col items-center justify-center overflow-hidden ${bubbleColor} p-2 shadow-lg`}
        style={{
          boxShadow: isHovering 
            ? '0 0 0 3px rgba(255,255,255,0.6), 0 8px 25px rgba(0,0,0,0.3)' 
            : '0 4px 10px rgba(0,0,0,0.15)',
          transition: 'box-shadow 0.2s ease',
        }}
      >
        <BubbleContent stock={currentStock} />
      </div>
    </div>
  );
};

export default StockBubble;
