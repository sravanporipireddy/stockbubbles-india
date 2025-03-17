
import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import StockBubble from '@/components/StockBubble';
import InfoPanel from '@/components/InfoPanel';
import Footer from '@/components/Footer';
import { AnimatePresence } from 'framer-motion';
import { 
  generateInitialStocks, 
  updateStockPrices, 
  getSectorPerformance,
  Stock
} from '@/lib/mockData';
import { 
  filterStocksBySearch, 
  filterStocksBySector, 
  getMaxMarketCap 
} from '@/lib/stockUtils';

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
  
  // Initialize stocks
  useEffect(() => {
    const initialStocks = generateInitialStocks();
    setStocks(initialStocks);
    setFilteredStocks(initialStocks);
    setLoading(false);
    
    // Update stocks every 8 seconds
    updateIntervalRef.current = window.setInterval(() => {
      setStocks(prev => updateStockPrices(prev));
    }, 8000);
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);
  
  // Handle scroll to show/hide footer
  useEffect(() => {
    const handleScroll = () => {
      // Show footer when user scrolls down a bit
      if (window.scrollY > 300) {
        setShowFooter(true);
      } else {
        setShowFooter(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Apply filters when stocks, search term, or sector changes
  useEffect(() => {
    let result = [...stocks];
    
    // Apply sector filter
    result = filterStocksBySector(result, selectedSector);
    
    // Apply search filter
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
  
  // Sample index data for the footer
  const indexData = [
    { name: 'NIFTY 50', value: 22341.65, changePercent: 0.82 },
    { name: 'SENSEX', value: 73354.12, changePercent: 0.76 },
    { name: 'NIFTY BANK', value: 48165.30, changePercent: 0.45 },
    { name: 'INDIA VIX', value: 13.86, changePercent: -2.34 },
  ];
  
  // Get sector performance for the footer
  const sectorPerformance = getSectorPerformance(stocks);
  
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
        
        {/* Footer that appears when scrolling down */}
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
      
      {/* Add extra space at the bottom for scrolling to reveal footer */}
      <div className="h-40 md:h-60"></div>
    </div>
  );
};

export default Index;
