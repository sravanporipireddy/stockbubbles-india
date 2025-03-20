
import React from 'react';
import { IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';
import { Stock } from '@/lib/mockData';
import { formatPrice, formatPercentage } from '@/lib/stockUtils';

interface BubbleContentProps {
  stock: Stock;
}

const BubbleContent: React.FC<BubbleContentProps> = ({ stock }) => {
  const isPositive = stock.changePercent > 0;
  
  return (
    <>
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
    </>
  );
};

export default BubbleContent;
