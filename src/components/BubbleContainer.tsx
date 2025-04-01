
import React, { useState, useEffect, useRef } from 'react';
import { Stock } from '@/lib/mockData';
import { getMaxMarketCap, getBubbleSize } from '@/lib/stockUtils';
import StockBubble from './StockBubble';
import { motion } from 'framer-motion';
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
  const maxMarketCap = getMaxMarketCap(stocks);
  const [nodes, setNodes] = useState<NodeDatum[]>([]);
  const simulationRef = useRef<d3.Simulation<NodeDatum, undefined> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [initialLayoutComplete, setInitialLayoutComplete] = useState(false);
  
  const [containerDimensions, setContainerDimensions] = useState({
    width: Math.min(window.innerWidth * 0.9, 1200),
    height: 800
  });
  
  // Handle window resize
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

  // Create and run the simulation only once on initial render
  useEffect(() => {
    if (initialLayoutComplete || stocks.length === 0) {
      if (stocks.length === 0) {
        setNodes([]);
      }
      return;
    }

    // Create nodes from stocks
    const newNodes: NodeDatum[] = stocks.map((stock, index) => {
      const r = getBubbleSize(stock.marketCap, maxMarketCap) / 2; // Divide by 2 to convert diameter to radius for d3
      return {
        id: stock.id,
        index,
        r,
        stock,
        // Initialize with random positions within container
        x: Math.random() * containerDimensions.width,
        y: Math.random() * containerDimensions.height
      };
    });

    // Set up the simulation configuration (similar to @testboxlab/react-bubble-chart-d3)
    const simulation = d3.forceSimulation<NodeDatum>()
      .nodes(newNodes)
      .alpha(1) // Start with high energy
      .alphaDecay(0.02) // Slower decay for better placement
      .velocityDecay(0.4) // Add some friction
      .force('center', d3.forceCenter(containerDimensions.width / 2, containerDimensions.height / 2))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('collide', d3.forceCollide<NodeDatum>().radius(d => d.r + 10).strength(0.9).iterations(4))
      .force('x', d3.forceX(containerDimensions.width / 2).strength(0.05))
      .force('y', d3.forceY(containerDimensions.height / 2).strength(0.05));

    // Update nodes on each tick to see the simulation in progress
    simulation.on('tick', () => {
      simulation.nodes().forEach(node => {
        // Ensure nodes stay within container bounds
        node.x = Math.max(node.r, Math.min(containerDimensions.width - node.r, node.x || 0));
        node.y = Math.max(node.r, Math.min(containerDimensions.height - node.r, node.y || 0));
      });
      
      setNodes([...simulation.nodes()]);
    });

    // Store simulation reference
    simulationRef.current = simulation;
    
    // Run simulation for fixed duration then stop it completely
    const timer = setTimeout(() => {
      if (simulationRef.current) {
        simulationRef.current.stop();
        console.log("Simulation completed and positions fixed");
        setInitialLayoutComplete(true);
      }
    }, 2000); // Let simulation run for 2 seconds then stop
    
    return () => {
      clearTimeout(timer);
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [stocks.length, maxMarketCap, containerDimensions, initialLayoutComplete]);

  return (
    <motion.div 
      ref={containerRef}
      className="relative h-[800px] max-w-6xl mx-auto animate-fade-in z-30 mt-12 mb-16 border-transparent bubble-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {stocks.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium">No stocks found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 rounded-lg opacity-10 bg-gradient-to-br from-background to-primary/10" />
          {nodes.map((node) => (
            <StockBubble
              key={node.id}
              stock={node.stock}
              maxMarketCap={maxMarketCap}
              onClick={onStockClick}
              index={node.index}
              allStocks={stocks}
              position={{ x: node.x || 0, y: node.y || 0 }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
};

export default BubbleContainer;
