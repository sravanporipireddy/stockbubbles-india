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
  
  const [containerDimensions, setContainerDimensions] = useState({
    width: Math.min(window.innerWidth * 0.9, 1200),
    height: 800
  });
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setContainerDimensions({
        width: Math.min(window.innerWidth * 0.9, 1200),
        height: 800
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize or update simulation when stocks change
  useEffect(() => {
    if (stocks.length === 0) {
      setNodes([]);
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

    const simulation = d3.forceSimulation<NodeDatum>()
      .nodes(newNodes)
      // Center force pulls bubbles toward the center
      .force('center', d3.forceCenter<NodeDatum>(centerX, centerY))
      // Collision force prevents bubbles from overlapping
      .force('collision', d3.forceCollide<NodeDatum>().radius(d => d.r + 5).strength(0.8))
      // Charge force creates repulsion between bubbles
      .force('charge', d3.forceManyBody().strength(d => -Math.pow(d.r, 2) * 0.1))
      // X force keeps bubbles within container width
      .force('x', d3.forceX<NodeDatum>(centerX).strength(0.05))
      // Y force keeps bubbles within container height
      .force('y', d3.forceY<NodeDatum>(centerY).strength(0.05));

    // Update node positions on each tick
    simulation.on('tick', () => {
      setNodes([...simulation.nodes()]);
    });

    // Stop simulation after a certain number of iterations for performance
    simulation.alpha(1).restart();
    
    // Store simulation in ref to control it later
    simulationRef.current = simulation;

    // Clean up simulation on unmount
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [stocks, maxMarketCap, containerDimensions]);

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
