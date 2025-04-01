
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
  const [layoutComplete, setLayoutComplete] = useState(false);
  
  const [containerDimensions, setContainerDimensions] = useState({
    width: Math.min(window.innerWidth * 0.9, 1200),
    height: 800
  });
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Only update dimensions if layout is not complete to prevent re-positioning
      if (!layoutComplete) {
        setContainerDimensions({
          width: Math.min(window.innerWidth * 0.9, 1200),
          height: 800
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layoutComplete]);

  // Initialize simulation when stocks change and layout is not complete
  useEffect(() => {
    // Skip simulation if layout is already complete or no stocks
    if (layoutComplete || stocks.length === 0) {
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
        // Initialize with random positions to avoid all starting at center
        x: Math.random() * containerDimensions.width,
        y: Math.random() * containerDimensions.height
      };
    });

    // Set up the simulation
    const centerX = containerDimensions.width / 2;
    const centerY = containerDimensions.height / 2;

    // Create a fixed positions simulation that won't run continuously
    const simulation = d3.forceSimulation<NodeDatum>()
      .nodes(newNodes)
      .force('center', d3.forceCenter<NodeDatum>(centerX, centerY))
      .force('collision', d3.forceCollide<NodeDatum>()
        .radius(d => d.r + 20) // Increased padding between bubbles
        .strength(1)           // Maximum strength for collision prevention
        .iterations(5))        // More iterations for better collision resolution
      .force('charge', d3.forceManyBody()
        .strength(d => -Math.pow(d.r, 2) * 1)) // Strong repulsion
      .force('x', d3.forceX<NodeDatum>(centerX).strength(0.1))
      .force('y', d3.forceY<NodeDatum>(centerY).strength(0.1));

    // Higher alpha and slower decay for better placement
    simulation.alpha(0.9).alphaDecay(0.01);
    
    // Get the final positions once and stop
    simulation.on('tick', () => {
      // Apply boundary constraints to keep nodes within the container
      simulation.nodes().forEach(node => {
        node.x = Math.max(node.r, Math.min(containerDimensions.width - node.r, node.x || 0));
        node.y = Math.max(node.r, Math.min(containerDimensions.height - node.r, node.y || 0));
      });
      
      setNodes([...simulation.nodes()]);
    });
    
    // Store simulation in ref to control it later
    simulationRef.current = simulation;
    
    // Run simulation intensely at first, then cool it down and stop completely
    const runSimulation = async () => {
      // First phase: High energy layout (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (simulationRef.current) {
        // Second phase: Finalize positions (1 second)
        simulationRef.current.alpha(0.1).alphaTarget(0).restart();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Stop simulation entirely
        if (simulationRef.current) {
          simulationRef.current.stop();
          console.log("Simulation stopped permanently - positions fixed");
          setLayoutComplete(true); // Mark layout as complete to never run again
        }
      }
    };
    
    runSimulation();
    
    // Clean up simulation on unmount
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [stocks, maxMarketCap, containerDimensions, layoutComplete]);

  return (
    <motion.div 
      ref={containerRef}
      className="relative h-[800px] max-w-6xl mx-auto animate-fade-in z-30 mt-12 mb-16 border-transparent bubble-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ width: containerDimensions.width, height: containerDimensions.height }}
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
