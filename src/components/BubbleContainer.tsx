
import React from 'react';
import { Stock } from '@/lib/mockData';
import { getMaxMarketCap } from '@/lib/stockUtils';
import StockBubble from './StockBubble';

interface BubbleContainerProps {
  stocks: Stock[];
  onStockClick: (stock: Stock) => void;
}

const BubbleContainer: React.FC<BubbleContainerProps> = ({ stocks, onStockClick }) => {
  const maxMarketCap = getMaxMarketCap(stocks);
  
  return (
    <div className="relative h-[700px] max-w-6xl mx-auto animate-fade-in z-30 mt-12 mb-16 border-transparent bubble-container">
      {stocks.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium">No stocks found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : (
        stocks.map((stock, index) => (
          <StockBubble
            key={stock.id}
            stock={stock}
            maxMarketCap={maxMarketCap}
            onClick={onStockClick}
            index={index}
            allStocks={stocks}
          />
        ))
      )}
    </div>
  );
};

export default BubbleContainer;
