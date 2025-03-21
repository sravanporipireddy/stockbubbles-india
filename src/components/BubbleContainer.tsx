
import React, { useState, useEffect } from 'react';
import { Stock } from '@/lib/mockData';
import { getMaxMarketCap } from '@/lib/stockUtils';
import StockBubble from './StockBubble';
import { motion } from 'framer-motion';

interface BubbleContainerProps {
  stocks: Stock[];
  onStockClick: (stock: Stock) => void;
}

const BubbleContainer: React.FC<BubbleContainerProps> = ({ stocks, onStockClick }) => {
  const maxMarketCap = getMaxMarketCap(stocks);
  const [containerDimensions, setContainerDimensions] = useState({
    width: Math.min(window.innerWidth * 0.9, 1200),
    height: 800 // Increased from 700 to provide more space
  });
  
  // Handle window resize to maintain responsive layout
  useEffect(() => {
    const handleResize = () => {
      setContainerDimensions({
        width: Math.min(window.innerWidth * 0.9, 1200),
        height: 800 // Increased height
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <motion.div 
      className="relative h-[800px] max-w-6xl mx-auto animate-fade-in z-30 mt-12 mb-16 border-transparent bubble-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {stocks.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium">No stocks found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 rounded-lg opacity-10 bg-gradient-to-br from-background to-primary/10" />
          {stocks.map((stock, index) => (
            <StockBubble
              key={stock.id}
              stock={stock}
              maxMarketCap={maxMarketCap}
              onClick={onStockClick}
              index={index}
              allStocks={stocks}
            />
          ))}
        </>
      )}
    </motion.div>
  );
};

export default BubbleContainer;
