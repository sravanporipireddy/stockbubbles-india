
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
  formatCurrency,
  formatPrice,
  getTextColor,
  sortStocks,
  SortCriteria,
  SortDirection
} from '@/lib/stockUtils';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const itemsPerPage = 10;
  
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
  
  const maxMarketCap = getMaxMarketCap(stocks);
  
  const indexData = [
    { name: 'NIFTY 50', value: 22341.65, changePercent: 0.82 },
    { name: 'SENSEX', value: 73354.12, changePercent: 0.76 },
    { name: 'NIFTY BANK', value: 48165.30, changePercent: 0.45 },
    { name: 'INDIA VIX', value: 13.86, changePercent: -2.34 },
  ];
  
  const sortedStocks = sortStocks(filteredStocks, sortBy, sortDirection);
  
  const totalPages = Math.ceil(sortedStocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleStocks = sortedStocks.slice(startIndex, startIndex + itemsPerPage);
  
  const sectorPerformance = getSectorPerformance(stocks);
  
  const renderSortIcon = (column: SortCriteria) => {
    if (sortBy !== column) return <ArrowUpDown size={16} className="ml-1 opacity-50" />;
    return sortDirection === 'desc' 
      ? <ArrowDown size={16} className="ml-1" /> 
      : <ArrowUp size={16} className="ml-1" />;
  };
  
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
          <>
            {filteredStocks.length === 0 ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium">No stocks found</h3>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="relative h-[600px] max-w-6xl mx-auto animate-fade-in z-30 mt-12 mb-16 border-transparent bubble-container">
                {filteredStocks.map((stock, index) => (
                  <StockBubble
                    key={stock.id}
                    stock={stock}
                    maxMarketCap={maxMarketCap}
                    onClick={handleStockClick}
                    index={index}
                    allStocks={filteredStocks}
                  />
                ))}
              </div>
            )}
          </>
        )}
        
        <div className="pt-10 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto z-20 relative">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Stock List</h2>
            <Tabs defaultValue="all" className="w-fit">
              <TabsList>
                <TabsTrigger value="all">All Stocks</TabsTrigger>
                <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
                <TabsTrigger value="losers">Top Losers</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="border rounded-lg overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="w-[100px] cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Symbol
                        {renderSortIcon('name')}
                      </div>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead 
                      className="cursor-pointer text-right"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center justify-end">
                        Price (₹)
                        {renderSortIcon('price')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer text-right"
                      onClick={() => handleSort('changePercent')}
                    >
                      <div className="flex items-center justify-end">
                        24h Change
                        {renderSortIcon('changePercent')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer text-right hidden md:table-cell"
                      onClick={() => handleSort('marketCap')}
                    >
                      <div className="flex items-center justify-end">
                        Market Cap
                        {renderSortIcon('marketCap')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right hidden lg:table-cell">Sector</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleStocks.map((stock) => (
                    <TableRow 
                      key={stock.id}
                      className="cursor-pointer hover:bg-muted/80"
                      onClick={() => handleStockClick(stock)}
                    >
                      <TableCell className="font-medium">{stock.symbol}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{stock.name}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(stock.price)}
                      </TableCell>
                      <TableCell className={`text-right ${getTextColor(stock.changePercent)}`}>
                        <div className="flex items-center justify-end">
                          {stock.changePercent >= 0 ? (
                            <TrendingUp size={14} className="mr-1" />
                          ) : (
                            <TrendingDown size={14} className="mr-1" />
                          )}
                          {formatPercentage(stock.changePercent)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell">{formatCurrency(stock.marketCap)}</TableCell>
                      <TableCell className="text-right hidden lg:table-cell">{stock.sector}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          {totalPages > 1 && (
            <Pagination className="mb-10">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 3 + i;
                      if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                    }
                    if (pageNum > totalPages) return null;
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
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
