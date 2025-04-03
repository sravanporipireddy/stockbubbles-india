import React from 'react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { formatPercentage, formatNumber } from '@/lib/formatUtils';

interface FooterProps {
  sectorPerformance: {
    name: string;
    changePercent: number;
    marketCap: number;
  }[];
  indexData: {
    name: string;
    value: number;
    changePercent: number;
  }[];
  usingRealData: boolean;
  dataSource?: string;
}

const Footer: React.FC<FooterProps> = ({ 
  sectorPerformance, 
  indexData, 
  usingRealData,
  dataSource = "IndianAPI.in" 
}) => {
  return (
    <motion.footer 
      className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 py-4 px-4 md:px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Market Indices */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Market Indices</h3>
            <div className="grid grid-cols-2 gap-4">
              {indexData.map((index) => (
                <div 
                  key={index.name}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-subtle"
                >
                  <div>
                    <h4 className="font-medium">{index.name}</h4>
                    <div className="flex items-center mt-1 text-sm">
                      <span>₹{index.value.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className={`flex items-center ${index.changePercent >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {index.changePercent >= 0 ? (
                      <TrendingUp size={16} className="mr-1" />
                    ) : (
                      <TrendingDown size={16} className="mr-1" />
                    )}
                    <span>{formatPercentage(index.changePercent)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Sector Performance */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Sector Performance</h3>
            <ScrollArea className="h-52">
              <div className="space-y-2 pr-4">
                {sectorPerformance.map((sector) => (
                  <div 
                    key={sector.name}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-subtle"
                  >
                    <div>
                      <h4 className="font-medium">{sector.name}</h4>
                      <div className="text-xs text-muted-foreground mt-1">
                        Market Cap: ₹{formatNumber(sector.marketCap)}
                      </div>
                    </div>
                    <div className={`flex items-center ${sector.changePercent >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {sector.changePercent >= 0 ? (
                        <TrendingUp size={16} className="mr-1" />
                      ) : (
                        <TrendingDown size={16} className="mr-1" />
                      )}
                      <span>{formatPercentage(sector.changePercent)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        <div className="flex justify-center mt-6 text-sm text-muted-foreground">
          <p>{!usingRealData ? "Data is simulated for demonstration purposes" : `Data from ${dataSource}`}</p>
          {usingRealData && dataSource === "IndianAPI.in" && (
            <a 
              href="https://indianapi.in/indian-stock-market/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center ml-4 text-primary hover:underline"
            >
              Indian Stock Market API <ExternalLink size={12} className="ml-1" />
            </a>
          )}
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
