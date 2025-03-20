
import React from 'react';
import { Stock } from '@/lib/mockData';
import { SortCriteria, SortDirection, formatPercentage, formatPrice, formatCurrency, getTextColor } from '@/lib/stockUtils';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface StockTableProps {
  stocks: Stock[];
  sortBy: SortCriteria;
  sortDirection: SortDirection;
  onSort: (criteria: SortCriteria) => void;
  onStockClick: (stock: Stock) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const StockTable: React.FC<StockTableProps> = ({
  stocks,
  sortBy,
  sortDirection,
  onSort,
  onStockClick,
  currentPage,
  setCurrentPage
}) => {
  const itemsPerPage = 10;
  const totalPages = Math.ceil(stocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleStocks = stocks.slice(startIndex, startIndex + itemsPerPage);

  const renderSortIcon = (column: SortCriteria) => {
    if (sortBy !== column) return <ArrowUpDown size={16} className="ml-1 opacity-50" />;
    return sortDirection === 'desc' 
      ? <ArrowDown size={16} className="ml-1" /> 
      : <ArrowUp size={16} className="ml-1" />;
  };

  return (
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
                  onClick={() => onSort('name')}
                >
                  <div className="flex items-center">
                    Symbol
                    {renderSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead 
                  className="cursor-pointer text-right"
                  onClick={() => onSort('price')}
                >
                  <div className="flex items-center justify-end">
                    Price (₹)
                    {renderSortIcon('price')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer text-right"
                  onClick={() => onSort('changePercent')}
                >
                  <div className="flex items-center justify-end">
                    24h Change
                    {renderSortIcon('changePercent')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer text-right hidden md:table-cell"
                  onClick={() => onSort('marketCap')}
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
                  onClick={() => onStockClick(stock)}
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
  );
};

export default StockTable;
