
import React from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  BarChart4, 
  Activity, 
  DollarSign,
  Info,
  Building2 
} from 'lucide-react';
import { formatCurrency, formatPercentage, getTextColor } from '@/lib/stockUtils';
import { Stock } from '@/lib/mockData';
import { motion } from 'framer-motion';

interface InfoPanelProps {
  stock: Stock | null;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ stock, onClose }) => {
  if (!stock) return null;
  
  const isPositive = stock.changePercent > 0;
  const changeTextColor = getTextColor(stock.changePercent);
  
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-elevation-2 overflow-hidden"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="relative p-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-start mb-6">
            <div className={`p-3 rounded-lg mr-4 ${isPositive ? 'bg-profit/10' : 'bg-loss/10'}`}>
              {isPositive ? (
                <TrendingUp size={24} className="text-profit" />
              ) : (
                <TrendingDown size={24} className="text-loss" />
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold">{stock.symbol}</h2>
              <p className="text-muted-foreground">{stock.name}</p>
              <div className="flex items-baseline mt-1">
                <span className="text-xl font-semibold flex items-center">
                  <DollarSign size={18} />
                  {stock.price.toFixed(2)}
                </span>
                <span className={`ml-2 ${changeTextColor}`}>
                  {formatPercentage(stock.changePercent)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-secondary p-4 rounded-lg">
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <BarChart4 size={14} className="mr-1" />
                <span>Market Cap</span>
              </div>
              <div className="font-semibold">{formatCurrency(stock.marketCap)}</div>
            </div>
            
            <div className="bg-secondary p-4 rounded-lg">
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <Activity size={14} className="mr-1" />
                <span>Volume</span>
              </div>
              <div className="font-semibold">{stock.volume.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <Building2 size={16} className="text-muted-foreground mr-2" />
              <span className="text-sm font-medium mr-2">Sector:</span>
              <span className="text-sm">{stock.sector}</span>
            </div>
            
            <div className="flex items-center">
              <Info size={16} className="text-muted-foreground mr-2" />
              <span className="text-sm font-medium mr-2">Change:</span>
              <span className={`text-sm ${changeTextColor}`}>
                {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({formatPercentage(stock.changePercent)})
              </span>
            </div>
          </div>
          
          <button className="w-full mt-6 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            View Detailed Analysis
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InfoPanel;
