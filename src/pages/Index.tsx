
import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import InfoPanel from '@/components/InfoPanel';
import Footer from '@/components/Footer';
import BubbleContainer from '@/components/BubbleContainer';
import StockTable from '@/components/StockTable';
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
  sortStocks,
  SortCriteria,
  SortDirection
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
  
  const [sortBy, setSortBy] = useState<SortCriteria>('marketCap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  
  const updateIntervalRef = useRef<number | null>(null);
  
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
    setCurrentPage(1);
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
  
  const handleSort = (criteria: SortCriteria) => {
    if (sortBy === criteria) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criteria);
      setSortDirection('desc');
    }
  };
  
  const indexData = [
    { name: 'NIFTY 50', value: 22341.65, changePercent: 0.82 },
    { name: 'SENSEX', value: 73354.12, changePercent: 0.76 },
    { name: 'NIFTY BANK', value: 48165.30, changePercent: 0.45 },
    { name: 'INDIA VIX', value: 13.86, changePercent: -2.34 },
  ];
  
  const sortedStocks = sortStocks(filteredStocks, sortBy, sortDirection);
  const sectorPerformance = getSectorPerformance(stocks);
  
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-background">
      <Header toggleSidebar={toggleSidebar} />
      
      <main className="flex-1 pt-32 pb-20 relative min-h-[calc(100vh-64px)]">
        <div className="sticky top-20 z-40 bg-background/80 backdrop-blur-sm pt-4 pb-4 px-2 md:px-4 mb-8">
          <div className="flex flex-col items-center animate-fade-in">
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
          <BubbleContainer 
            stocks={filteredStocks} 
            onStockClick={handleStockClick} 
          />
        )}
        
        <StockTable 
          stocks={sortedStocks}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onStockClick={handleStockClick}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        
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
      </main>
      
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
