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
  
  const BUBBLE_COUNT = 100;
  
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
      
      const initialNodes: NodeDatum[] = Array.from({ length: BUBBLE_COUNT }).map((_, index) => {
        const id = `placeholder-${index}`;
        const stock = createPlaceholderStock(id);
        const size = 20 + Math.random() * 70;
        
        return {
          id,
          index,
          r: size / 2,
          stock: stock,
          x: Math.random() * containerDimensions.width,
          y: Math.random() * containerDimensions.height
        };
      });
      
      nodesRef.current = initialNodes;
      
      simulationRef.current = d3.forceSimulation<NodeDatum>(initialNodes)
        .alpha(0.8)
        .alphaDecay(0.02)
        .velocityDecay(0.3)
        .force('charge', d3.forceManyBody().strength(-30))
        .force('collide', d3.forceCollide<NodeDatum>()
          .radius(d => d.r + 5)
          .strength(0.8)
          .iterations(4))
        .force('x', d3.forceX(containerDimensions.width / 2).strength(0.03))
        .force('y', d3.forceY(containerDimensions.height / 2).strength(0.03))
        .force('boundaryX', d3.forceX().x(d => {
          return Math.max(d.r || 0, Math.min(containerDimensions.width - (d.r || 0), d.x || 0));
        }).strength(0.2))
        .force('boundaryY', d3.forceY().y(d => {
          return Math.max(d.r || 0, Math.min(containerDimensions.height - (d.r || 0), d.y || 0));
        }).strength(0.2));
      
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
      
      for (let i = 0; i < 50; i++) {
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
    
    let placeholderIndex = 0;
    currentNodes.forEach(node => {
      if (node.stock?.isPlaceholder && stocksToAssign.length > 0) {
        const stock = stocksToAssign.shift();
        if (stock) {
          node.stock = stock;
          node.id = stock.id;
          node.r = getBubbleSize(stock.marketCap, newMaxMarketCap) / 2;
        }
      } else if (placeholderIndex >= BUBBLE_COUNT - stocks.length) {
        node.r = 15 + Math.random() * 35;
      }
      placeholderIndex++;
    });
    
    simulationRef.current
      .nodes(currentNodes)
      .alpha(0.3)
      .restart();
    
    for (let i = 0; i < 5; i++) {
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
      className="relative w-full h-[calc(100vh-320px)] min-h-[400px] overflow-hidden bubble-container"
      style={{
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '8px'
      }}
    >
      <div className="absolute inset-0 z-0" />
      <div className="debug-info absolute top-2 left-2 text-xs text-gray-400 z-50">
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
