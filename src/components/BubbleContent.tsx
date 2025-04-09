
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Stock } from '@/lib/mockData';
import { formatPrice, formatPercentage } from '@/lib/formatUtils';

interface BubbleContentProps {
  stock: Stock;
}

const BubbleContent: React.FC<BubbleContentProps> = ({ stock }) => {
  if (!stock) return null;
  
  const isPositive = stock.changePercent > 0;
  
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <span className="font-bold text-white text-center px-1 text-xs sm:text-sm md:text-base truncate w-full">
        {stock.symbol}
      </span>
      
      <div className="flex items-center justify-center gap-1 text-white font-medium mt-1">
        <span className="text-xs sm:text-sm whitespace-nowrap">₹{formatPrice(stock.price)}</span>
      </div>
      
      <div className={`flex items-center justify-center text-xs font-semibold mt-0.5 ${isPositive ? 'text-emerald-100' : 'text-red-100'}`}>
        {isPositive ? (
          <TrendingUp size={12} className="mr-0.5" />
        ) : (
          <TrendingDown size={12} className="mr-0.5" />
        )}
        <span>{formatPercentage(stock.changePercent)}</span>
      </div>
    </div>
  );
};

export default BubbleContent;
