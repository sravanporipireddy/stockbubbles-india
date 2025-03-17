import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import StockBubble from '@/components/StockBubble';
import InfoPanel from '@/components/InfoPanel';
import Footer from '@/components/Footer';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  generateInitialStocks, 
  updateStockPrices, 
  getSectorPerformance,
  Stock
} from '@/lib/mockData';
import { 
  filterStocksBySearch, 
  filterStocksBySector, 
  getMaxMarketCap,
  formatPercentage,
  formatCurrency
} from '@/lib/stockUtils';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const Index = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  
  const updateIntervalRef = useRef<number | null>(null);
  
  const [activeSection, setActiveSection] = useState<'sectors' | 'performance'>('sectors');
  
  useEffect(() => {
    const initialStocks = generateInitialStocks();
    setStocks(initialStocks);
    setFilteredStocks(initialStocks);
    setLoading(false);
    
    updateIntervalRef.current = window.setInterval(() => {
      setStocks(prev => updateStockPrices(prev));
    }, 8000);
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowFooter(true);
      } else {
        setShowFooter(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    let result = [...stocks];
    
    result = filterStocksBySector(result, selectedSector);
    result = filterStocksBySearch(result, searchTerm);
    
    setFilteredStocks(result);
  }, [stocks, searchTerm, selectedSector]);
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector);
  };
  
  const handleStockClick = (stock: Stock) => {
    setSelectedStock(stock);
  };
  
  const handleCloseInfoPanel = () => {
    setSelectedStock(null);
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const maxMarketCap = getMaxMarketCap(stocks);
  
  const indexData = [
    { name: 'NIFTY 50', value: 22341.65, changePercent: 0.82 },
    { name: 'SENSEX', value: 73354.12, changePercent: 0.76 },
    { name: 'NIFTY BANK', value: 48165.30, changePercent: 0.45 },
    { name: 'INDIA VIX', value: 13.86, changePercent: -2.34 },
  ];
  
  const sectorPerformance = getSectorPerformance(stocks);
  
  const sortedSectorPerformance = [...sectorPerformance].sort((a, b) => 
    activeSection === 'sectors' 
      ? b.marketCap - a.marketCap 
      : b.changePercent - a.changePercent
  );
  
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-background">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 pt-20 pb-20 relative min-h-[calc(100vh-64px)]">
        <div className="sticky top-20 z-10 bg-background/80 backdrop-blur-sm pt-4 pb-2 px-2 md:px-4">
          <div className="flex flex-col items-center mb-4 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-3">
              Indian Stock Market Visualization
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-4">
              Explore the Indian stock market with interactive bubbles. Size represents market cap, 
              while color indicates performance.
            </p>
            
            <div className="w-full max-w-md mb-4">
              <SearchBar onSearch={handleSearch} />
            </div>
            
            <div className="w-full">
              <FilterBar
                onSectorChange={handleSectorChange}
                selectedSector={selectedSector}
              />
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse-gentle w-12 h-12 rounded-full bg-primary/20"></div>
          </div>
        ) : (
          <>
            {filteredStocks.length === 0 ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium">No stocks found</h3>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-5 px-2 py-4 animate-fade-in min-h-[calc(100vh-300px)]">
                <AnimatePresence>
                  {filteredStocks.map(stock => (
                    <StockBubble
                      key={stock.id}
                      stock={stock}
                      maxMarketCap={maxMarketCap}
                      onClick={handleStockClick}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
        
        <div className="pt-10 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Market Insights</h2>
            <div className="bg-muted/50 p-1 rounded-lg flex">
              <button
                onClick={() => setActiveSection('sectors')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeSection === 'sectors' 
                    ? 'bg-background shadow-sm' 
                    : 'hover:bg-background/50'
                }`}
              >
                Sector Size
              </button>
              <button
                onClick={() => setActiveSection('performance')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeSection === 'performance' 
                    ? 'bg-background shadow-sm' 
                    : 'hover:bg-background/50'
                }`}
              >
                Performance
              </button>
            </div>
          </div>
          
          <div className="bg-muted/20 rounded-lg p-4 mb-12">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-[400px]"
            >
              <ChartContainer
                config={{
                  marketCap: { label: 'Market Cap' },
                  changePercent: { 
                    theme: { light: '#22c55e', dark: '#22c55e' }
                  }
                }}
              >
                <BarChart
                  data={sortedSectorPerformance}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 10 }}
                >
                  <XAxis 
                    type="number" 
                    hide={activeSection === 'performance'}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={90}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border rounded-md shadow-lg p-2 text-sm">
                            <p className="font-medium">{data.name}</p>
                            {activeSection === 'sectors' ? (
                              <p>Market Cap: {formatCurrency(data.marketCap)}</p>
                            ) : (
                              <div className="flex items-center">
                                <span>Performance: </span>
                                <span className={`ml-1 flex items-center ${data.changePercent >= 0 ? 'text-profit' : 'text-loss'}`}>
                                  {data.changePercent >= 0 ? (
                                    <TrendingUp size={14} className="mr-1" />
                                  ) : (
                                    <TrendingDown size={14} className="mr-1" />
                                  )}
                                  {formatPercentage(data.changePercent)}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {activeSection === 'sectors' ? (
                    <Bar 
                      dataKey="marketCap" 
                      fill="url(#marketCapGradient)" 
                      barSize={24}
                      radius={[0, 4, 4, 0]}
                    >
                      <defs>
                        <linearGradient id="marketCapGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6E59A5" />
                          <stop offset="100%" stopColor="#9b87f5" />
                        </linearGradient>
                      </defs>
                    </Bar>
                  ) : (
                    <Bar 
                      dataKey="changePercent" 
                      barSize={24}
                      radius={[0, 4, 4, 0]}
                      fill="transparent"
                    >
                      {sortedSectorPerformance.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.changePercent >= 0 ? '#22c55e' : '#ef4444'} 
                        />
                      ))}
                    </Bar>
                  )}
                </BarChart>
              </ChartContainer>
            </motion.div>
          </div>
        </div>
        
        <AnimatePresence>
          {showFooter && (
            <div className="fixed bottom-0 left-0 right-0 z-40">
              <Footer 
                sectorPerformance={sectorPerformance}
                indexData={indexData}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {selectedStock && (
          <InfoPanel 
            stock={selectedStock} 
            onClose={handleCloseInfoPanel} 
          />
        )}
      </AnimatePresence>
      
      <div className="h-40 md:h-60"></div>
    </div>
  );
};

export default Index;
