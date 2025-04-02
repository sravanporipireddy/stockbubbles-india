
// Import polyfills first
import '@/lib/polyfills';

import React, { useState, useEffect, useRef } from 'react';

import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import InfoPanel from '@/components/InfoPanel';
import Footer from '@/components/Footer';
import BubbleContainer from '@/components/BubbleContainer';
import StockTable from '@/components/StockTable';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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
  SortDirection,
  fetchStocks,
  fetchIndices,
  fetchSectorPerformance
} from '@/lib/stockUtils';
import { AlertCircle, RefreshCcw } from 'lucide-react';

const Index = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const [usingRealData, setUsingRealData] = useState(false);
  const [dataSource, setDataSource] = useState<'Finnhub' | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [sortBy, setSortBy] = useState<SortCriteria>('marketCap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [indexData, setIndexData] = useState([
    { name: 'S&P 500', value: 4587.65, changePercent: 0.82 },
    { name: 'Dow Jones', value: 38060.42, changePercent: 0.76 },
    { name: 'NASDAQ', value: 16156.33, changePercent: 0.95 },
    { name: 'VIX', value: 13.86, changePercent: -2.34 },
  ]);
  const [sectorPerformance, setSectorPerformance] = useState<{
    name: string;
    changePercent: number;
    marketCap: number;
  }[]>([]);
  
  const updateIntervalRef = useRef<number | null>(null);
  
  const loadRealTimeData = async () => {
    setLoading(true);
    setApiError(null);
    setIsRefreshing(true);
    
    try {
      const realTimeStocks = await fetchStocks();
      if (realTimeStocks.length > 0) {
        setStocks(realTimeStocks);
        setUsingRealData(true);
        setDataSource('Finnhub');
        
        try {
          const indices = await fetchIndices();
          if (indices && indices.length > 0) {
            setIndexData(indices);
          }
        } catch (indexError) {
          console.error("Failed to load index data:", indexError);
        }
        
        try {
          const sectorData = await fetchSectorPerformance();
          if (sectorData && sectorData.length > 0) {
            setSectorPerformance(sectorData);
          }
        } catch (sectorError) {
          console.error("Failed to load sector data:", sectorError);
        }
        
        toast.success("Using real-time Finnhub data", {
          description: `Loaded ${realTimeStocks.length} stocks from Finnhub`,
        });
      } else {
        throw new Error("No stocks returned from API");
      }
    } catch (error) {
      console.error("Failed to load real-time data:", error);
      setApiError(error instanceof Error ? error.message : "Failed to connect to Finnhub API");
      
      const initialStocks = generateInitialStocks();
      setStocks(initialStocks);
      setUsingRealData(false);
      setDataSource(null);
      
      const mockSectorPerf = getSectorPerformance(initialStocks);
      setSectorPerformance(mockSectorPerf.map(item => ({
        name: item.name,
        changePercent: item.changePercent,
        marketCap: 1000000000 * (Math.random() * 10 + 1)
      })));
      
      toast.error("Using mock data", {
        description: "Couldn't connect to API. Using simulated data instead.",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    if (!isRefreshing) {
      loadRealTimeData();
    }
  };
  
  useEffect(() => {
    loadRealTimeData();
    
    updateIntervalRef.current = window.setInterval(() => {
      if (usingRealData) {
        loadRealTimeData();
        console.log("Refreshed real-time data from Finnhub");
      } else {
        setStocks(prev => updateStockPrices(prev));
      }
    }, usingRealData ? 60000 : 8000); // Refresh every minute for real data or 8 seconds for mock
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [usingRealData]);
  
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
  
  const sortedStocks = sortStocks(filteredStocks, sortBy, sortDirection);
  
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-background">
      <Header toggleSidebar={toggleSidebar} />
      
      <main className="flex-1 pt-32 pb-20 relative min-h-[calc(100vh-64px)]">
        <div className="sticky top-20 z-40 bg-background/80 backdrop-blur-sm pt-4 pb-4 px-2 md:px-4 mb-8">
          <div className="flex flex-col items-center animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-3">
              Stock Market Visualization
              {usingRealData && (
                <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {dataSource} Live Data
                </span>
              )}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-4">
              Explore the stock market with interactive bubbles. Size represents market cap, 
              while color indicates performance.
            </p>
            
            {apiError && (
              <Alert variant="destructive" className="mb-4 max-w-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>API Connection Error</AlertTitle>
                <AlertDescription className="flex flex-col gap-2">
                  <div>{apiError}</div>
                  <div className="text-xs">
                    Using simulated data instead. You can try refreshing to connect to Finnhub again.
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button 
                      onClick={handleRefresh}
                      className="flex items-center gap-1 text-xs bg-white hover:bg-gray-100 text-gray-800 py-1 px-3 rounded w-fit"
                      disabled={isRefreshing}
                    >
                      <RefreshCcw size={12} className={isRefreshing ? "animate-spin" : ""} />
                      {isRefreshing ? "Refreshing..." : "Refresh Data"}
                    </button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
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
                usingRealData={usingRealData}
                dataSource={dataSource || undefined}
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
