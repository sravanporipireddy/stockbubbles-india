import React, { useState, useEffect, useRef } from 'react';
import { Stock } from '@/lib/mockData';
import { getMaxMarketCap, getBubbleSize } from '@/lib/visualUtils';
import StockBubble from './StockBubble';
import * as d3 from 'd3';

interface BubbleContainerProps {
  stocks: Stock[];
  onStockClick: (stock: Stock) => void;
}

interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  index: number;
  r: number;
  x?: number;
  y?: number;
  stock: Stock;
}

const BubbleContainer: React.FC<BubbleContainerProps> = ({ stocks, onStockClick }) => {
  const [visibleStocks, setVisibleStocks] = useState<Stock[]>([]);
  const [nodePositions, setNodePositions] = useState<Map<string, {x: number, y: number}>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<NodeDatum, undefined> | null>(null);
  const hasInitializedRef = useRef(false);
  const nodesRef = useRef<NodeDatum[]>([]);
  const [maxMarketCap, setMaxMarketCap] = useState(0);
  
  const [containerDimensions, setContainerDimensions] = useState({
    width: Math.min(window.innerWidth * 0.9, 1200),
    height: 800
  });
  
  // Handle container resizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setContainerDimensions({
          width,
          height: 800
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keep a persistent simulation that can be updated
  useEffect(() => {
    if (!simulationRef.current && containerDimensions.width > 0) {
      simulationRef.current = d3.forceSimulation<NodeDatum>()
        .alpha(0.8)
        .alphaDecay(0.03)
        .velocityDecay(0.4)
        .force('center', d3.forceCenter(containerDimensions.width / 2, containerDimensions.height / 2))
        .force('charge', d3.forceManyBody().strength(-20))
        .force('collide', d3.forceCollide<NodeDatum>()
          .radius(d => d.r + 15)
          .strength(1)
          .iterations(5))
        .force('x', d3.forceX(containerDimensions.width / 2).strength(0.07))
        .force('y', d3.forceY(containerDimensions.height / 2).strength(0.07));
      
      simulationRef.current.on('tick', () => {
        const simulation = simulationRef.current;
        if (!simulation) return;
        
        // Update positions in the Map
        const newPositions = new Map<string, {x: number, y: number}>();
        
        simulation.nodes().forEach(node => {
          // Constrain positions within bounds
          const padding = 10;
          node.x = Math.max(node.r + padding, Math.min(containerDimensions.width - node.r - padding, node.x || 0));
          node.y = Math.max(node.r + padding, Math.min(containerDimensions.height - node.r - padding, node.y || 0));
          
          newPositions.set(node.id, {x: node.x, y: node.y});
        });
        
        setNodePositions(newPositions);
      });
    }
    
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [containerDimensions]);

  // Update data without fully replacing the bubbles
  useEffect(() => {
    // Only proceed if we have stocks or already have visible stocks
    if (stocks.length === 0 && visibleStocks.length === 0) return;
    
    if (stocks.length > 0) {
      // Set the maximum market cap for consistent sizing
      const newMaxMarketCap = getMaxMarketCap(stocks);
      setMaxMarketCap(newMaxMarketCap);
      
      // We'll reuse visible stocks when updating to maintain state
      setVisibleStocks(stocks);
      
      // Update nodes with new stock data or add new nodes
      updateSimulationNodes(stocks, newMaxMarketCap);
    }
  }, [stocks]);

  const updateSimulationNodes = (newStocks: Stock[], newMaxMarketCap: number) => {
    if (!simulationRef.current) return;
    
    // Get current simulation nodes
    const currentNodes = simulationRef.current.nodes();
    const existingNodeMap = new Map<string, NodeDatum>();
    
    // Map current nodes by ID for quick lookup
    currentNodes.forEach(node => {
      existingNodeMap.set(node.id, node);
    });
    
    // Create updated nodes list, preserving positions for existing nodes
    const updatedNodes: NodeDatum[] = newStocks.map((stock, index) => {
      const radius = getBubbleSize(stock.marketCap, newMaxMarketCap) / 2;
      const existing = existingNodeMap.get(stock.id);
      
      if (existing) {
        // Update existing node but keep its position
        return {
          ...existing,
          stock,
          r: radius,
          index
        };
      }
      
      // Create new node near the center with small random offset for natural appearance
      return {
        id: stock.id,
        index,
        r: radius,
        stock,
        x: containerDimensions.width / 2 + (Math.random() - 0.5) * 20,
        y: containerDimensions.height / 2 + (Math.random() - 0.5) * 20
      };
    });
    
    // Save reference to current nodes
    nodesRef.current = updatedNodes;
    
    // Stop current simulation temporally
    simulationRef.current.stop();
    
    // Update with new nodes
    simulationRef.current.nodes(updatedNodes);
    
    // Restart with a small alpha to adjust positions gently
    simulationRef.current
      .alpha(hasInitializedRef.current ? 0.5 : 0.8)
      .restart();
    
    hasInitializedRef.current = true;
  };

  // Determine if we should show "No stocks" message
  const showNoStocksMessage = visibleStocks.length === 0;

  return (
    <div 
      ref={containerRef}
      className="relative h-[800px] max-w-6xl mx-auto z-30 mt-12 mb-16 border-transparent bubble-container"
    >
      {showNoStocksMessage ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium">No stocks found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 rounded-lg opacity-10 bg-gradient-to-br from-background to-primary/10" />
          {visibleStocks.map((stock, index) => {
            const position = nodePositions.get(stock.id);
            
            // Only render bubbles that have a position calculated
            if (!position) return null;
            
            return (
              <StockBubble
                key={stock.id}
                stock={stock}
                maxMarketCap={maxMarketCap}
                onClick={onStockClick}
                index={index}
                allStocks={visibleStocks}
                position={position}
              />
            );
          })}
        </>
      )}
    </div>
  );
};

export default BubbleContainer;
