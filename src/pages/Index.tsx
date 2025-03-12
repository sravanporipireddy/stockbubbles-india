
import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import StockBubble from '@/components/StockBubble';
import InfoPanel from '@/components/InfoPanel';
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
  
  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-background">
      <Header toggleSidebar={toggleSidebar} />
      
      <main className="flex-1 pt-24 px-4 md:px-8 pb-8 mx-auto w-full max-w-7xl">
        <div className="flex flex-col items-center mb-6 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-3">
            Indian Stock Market Visualization
          </h1>
          <p className="text-muted-foreground text-center max-w-2xl mb-6">
            Explore the Indian stock market with interactive bubbles. Size represents market cap, 
            while color indicates performance.
          </p>
          
          <div className="w-full max-w-md mb-8">
            <SearchBar onSearch={handleSearch} />
          </div>
          
          <div className="w-full">
            <FilterBar
              onSectorChange={handleSectorChange}
              selectedSector={selectedSector}
            />
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
              <div className="flex flex-wrap justify-center gap-3 py-4 animate-fade-in">
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
      </main>
      
      <AnimatePresence>
        {selectedStock && (
          <InfoPanel 
            stock={selectedStock} 
            onClose={handleCloseInfoPanel} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
