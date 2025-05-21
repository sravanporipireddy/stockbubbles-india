
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
  stock: Stock | null;
}

const createPlaceholderStock = (id: string): Stock => ({
  id,
  symbol: '',
  name: '',
  price: 0,
  previousPrice: 0,
  change: 0,
  changePercent: 0,
  marketCap: Math.random() * 1000000000,
  volume: 0,
  sector: '',
  isPlaceholder: true
});

const BubbleContainer: React.FC<BubbleContainerProps> = ({ stocks, onStockClick }) => {
  const [nodePositions, setNodePositions] = useState<Map<string, {x: number, y: number}>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<NodeDatum, undefined> | null>(null);
  const nodesRef = useRef<NodeDatum[]>([]);
  const [maxMarketCap, setMaxMarketCap] = useState(1000000000);
  const [displayNodes, setDisplayNodes] = useState<{ id: string, stock: Stock | null, position: { x: number, y: number } }[]>([]);
  
  // Increase bubble count for better coverage - MORE BUBBLES as requested
  const BUBBLE_COUNT = 300;
  
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0
  });
  
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };
    
    updateContainerSize();
    const resizeObserver = new ResizeObserver(updateContainerSize);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    window.addEventListener('resize', updateContainerSize);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      window.removeEventListener('resize', updateContainerSize);
    };
  }, []);

  useEffect(() => {
    if (!simulationRef.current && containerDimensions.width > 0 && containerDimensions.height > 0) {
      console.log("Initializing simulation with dimensions:", containerDimensions);
      
      // Create nodes that cover the entire area with better distribution
      const initialNodes: NodeDatum[] = Array.from({ length: BUBBLE_COUNT }).map((_, index) => {
        const id = `placeholder-${index}`;
        const stock = createPlaceholderStock(id);
        
        // Randomize size with better distribution
        const size = 40 + Math.random() * 40;
        
        // Use a more hexagonal packing approach for better distribution
        // This creates a honeycomb-like pattern similar to the reference image
        const cols = Math.ceil(Math.sqrt(BUBBLE_COUNT * containerDimensions.width / containerDimensions.height));
        const rows = Math.ceil(BUBBLE_COUNT / cols);
        
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        // Stagger rows for a more hexagonal packing
        const isEvenRow = row % 2 === 0;
        const xOffset = isEvenRow ? 0 : containerDimensions.width / cols / 2;
        
        // Use pixel positions based on container size
        const baseX = (containerDimensions.width / cols) * col + xOffset;
        const baseY = (containerDimensions.height / rows) * row;
        
        // Add some randomness to positions to avoid a perfect grid
        const randX = (Math.random() - 0.5) * containerDimensions.width / cols * 0.7;
        const randY = (Math.random() - 0.5) * containerDimensions.height / rows * 0.7;
        
        return {
          id,
          index,
          r: size / 2,
          stock: stock,
          x: baseX + randX, 
          y: baseY + randY
        };
      });
      
      nodesRef.current = initialNodes;
      
      simulationRef.current = d3.forceSimulation<NodeDatum>(initialNodes)
        .alpha(0.9)
        .alphaDecay(0.008)  // Slower decay for better settling
        .velocityDecay(0.25)  // Adjusted for more natural movement
        .force('charge', d3.forceManyBody().strength(-15))  // Reduced repulsion
        .force('collide', d3.forceCollide<NodeDatum>()
          .radius(d => d.r + 1)  // Minimal padding for tighter packing
          .strength(0.7)
          .iterations(4))
        .force('x', d3.forceX().x(d => Math.random() * containerDimensions.width).strength(0.02))
        .force('y', d3.forceY().y(d => Math.random() * containerDimensions.height).strength(0.02))
        .force('boundaryX', d3.forceX().x(d => {
          return Math.max(d.r || 0, Math.min(containerDimensions.width - (d.r || 0), d.x || 0));
        }).strength(0.1))
        .force('boundaryY', d3.forceY().y(d => {
          return Math.max(d.r || 0, Math.min(containerDimensions.height - (d.r || 0), d.y || 0));
        }).strength(0.1));
      
      simulationRef.current.on('tick', () => {
        const simulation = simulationRef.current;
        if (!simulation) return;
        
        const newPositions = new Map<string, {x: number, y: number}>();
        
        simulation.nodes().forEach(node => {
          const padding = node.r || 20;
          node.x = Math.max(padding, Math.min(containerDimensions.width - padding, node.x || 0));
          node.y = Math.max(padding, Math.min(containerDimensions.height - padding, node.y || 0));
          
          newPositions.set(node.id, {x: node.x, y: node.y});
        });
        
        setNodePositions(newPositions);
        
        const newDisplayNodes = simulation.nodes().map(node => ({
          id: node.id,
          stock: node.stock,
          position: { x: node.x || 0, y: node.y || 0 }
        }));
        
        setDisplayNodes(newDisplayNodes);
      });
      
      // Run more initial ticks to help position bubbles
      for (let i = 0; i < 100; i++) {
        simulationRef.current.tick();
      }
    }
    
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [containerDimensions]);

  useEffect(() => {
    if (!simulationRef.current || stocks.length === 0) return;
    
    console.log("Updating bubbles with real stock data, count:", stocks.length);
    
    const currentNodes = simulationRef.current.nodes();
    
    const newMaxMarketCap = getMaxMarketCap(stocks);
    setMaxMarketCap(newMaxMarketCap);
    
    const stocksToAssign = [...stocks];
    
    // Keep real stock data on nodes that already have it
    currentNodes.forEach(node => {
      if (!node.stock?.isPlaceholder) {
        const stockIndex = stocksToAssign.findIndex(s => s.id === node.stock?.id);
        if (stockIndex !== -1) {
          const stock = stocksToAssign[stockIndex];
          node.stock = stock;
          node.r = getBubbleSize(stock.marketCap, newMaxMarketCap) / 2;
          
          stocksToAssign.splice(stockIndex, 1);
        }
      }
    });
    
    // Assign remaining stocks to placeholder nodes
    let placeholderIndex = 0;
    currentNodes.forEach(node => {
      if (node.stock?.isPlaceholder && stocksToAssign.length > 0) {
        const stock = stocksToAssign.shift();
        if (stock) {
          node.stock = stock;
          node.id = stock.id;
          node.r = getBubbleSize(stock.marketCap, newMaxMarketCap) / 2;
        }
      } else if (node.stock?.isPlaceholder) {
        // Resize remaining placeholder nodes for visual variety
        node.r = (20 + Math.random() * 15) / 2;
      }
      placeholderIndex++;
    });
    
    simulationRef.current
      .nodes(currentNodes)
      .alpha(0.3)
      .restart();
    
    // Run a few more ticks to help reposition
    for (let i = 0; i < 10; i++) {
      simulationRef.current.tick();
    }
    
    const newDisplayNodes = currentNodes.map(node => ({
      id: node.id,
      stock: node.stock,
      position: { x: node.x || 0, y: node.y || 0 }
    }));
    
    setDisplayNodes(newDisplayNodes);
  }, [stocks]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[calc(100vh-320px)] min-h-[400px] overflow-hidden bubble-container bg-[#121212]"
      style={{
        background: '#121212', // Dark background like the reference image
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '4px'
      }}
    >
      <div className="absolute inset-0 z-0" />
      <div className="debug-info absolute top-2 left-2 text-xs text-gray-400 z-50 opacity-50">
        Dimensions: {containerDimensions.width}x{containerDimensions.height} | 
        Bubbles: {displayNodes.length} | 
        Real Stocks: {stocks.length}
      </div>
      
      {displayNodes.map(node => {
        if (!node.position || isNaN(node.position.x) || isNaN(node.position.y)) {
          return null;
        }
        
        return (
          <StockBubble
            key={node.id}
            stock={node.stock}
            isPlaceholder={node.stock?.isPlaceholder}
            maxMarketCap={maxMarketCap}
            onClick={onStockClick}
            index={0}
            allStocks={stocks}
            position={node.position}
          />
        );
      })}
    </div>
  );
};

export default BubbleContainer;
