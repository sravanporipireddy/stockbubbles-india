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
  
  const BUBBLE_COUNT = 50;
  
  const [containerDimensions, setContainerDimensions] = useState({
    width: 1000,
    height: 800
  });
  
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setContainerDimensions({
          width: width || 1000,
          height: 800
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 100);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!simulationRef.current && containerDimensions.width > 0) {
      console.log("Initializing simulation with dimensions:", containerDimensions);
      
      const initialNodes: NodeDatum[] = Array.from({ length: BUBBLE_COUNT }).map((_, index) => {
        const id = `placeholder-${index}`;
        const stock = createPlaceholderStock(id);
        const size = 20 + Math.random() * 60;
        
        return {
          id,
          index,
          r: size / 2,
          stock: stock,
          x: containerDimensions.width * 0.5 + (Math.random() - 0.5) * containerDimensions.width * 0.8,
          y: containerDimensions.height * 0.5 + (Math.random() - 0.5) * containerDimensions.height * 0.8
        };
      });
      
      nodesRef.current = initialNodes;
      
      simulationRef.current = d3.forceSimulation<NodeDatum>(initialNodes)
        .alpha(0.8)
        .alphaDecay(0.03)
        .velocityDecay(0.4)
        .force('center', d3.forceCenter(containerDimensions.width / 2, containerDimensions.height / 2))
        .force('charge', d3.forceManyBody().strength(-20))
        .force('collide', d3.forceCollide<NodeDatum>()
          .radius(d => d.r + 10)
          .strength(0.9)
          .iterations(3))
        .force('x', d3.forceX(containerDimensions.width / 2).strength(0.07))
        .force('y', d3.forceY(containerDimensions.height / 2).strength(0.07));
      
      simulationRef.current.on('tick', () => {
        const simulation = simulationRef.current;
        if (!simulation) return;
        
        const newPositions = new Map<string, {x: number, y: number}>();
        
        simulation.nodes().forEach(node => {
          const padding = node.r || 20;
          node.x = Math.max(padding, Math.min(containerDimensions.width - padding, node.x || containerDimensions.width/2));
          node.y = Math.max(padding, Math.min(containerDimensions.height - padding, node.y || containerDimensions.height/2));
          
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
      
      for (let i = 0; i < 20; i++) {
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
        node.r = 15 + Math.random() * 30;
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
      className="relative h-[800px] max-w-6xl mx-auto z-30 mt-12 mb-16 border-transparent bubble-container"
      style={{
        border: '1px solid rgba(0,0,0,0.1)',
      }}
    >
      <div className="absolute inset-0 rounded-lg opacity-10 bg-gradient-to-br from-background to-primary/10" />
      <div className="debug-info absolute top-2 left-2 text-xs text-gray-400">
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
