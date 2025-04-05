import React, { useState, useEffect, useRef } from 'react';
import { Stock } from '@/lib/mockData';
import { getMaxMarketCap, getBubbleSize } from '@/lib/visualUtils';
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
  const previousNodesRef = useRef<Map<string, NodeDatum>>(new Map());
  
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

  // Save previous node positions when nodes are updated
  useEffect(() => {
    if (nodes.length > 0) {
      const nodeMap = new Map<string, NodeDatum>();
      nodes.forEach(node => {
        nodeMap.set(node.id, node);
      });
      previousNodesRef.current = nodeMap;
    }
  }, [nodes]);

  // Create and run the simulation only once on initial render,
  // or when stocks array changes significantly in size
  useEffect(() => {
    // Skip if no stocks or if just updating stock data without changing count
    if (stocks.length === 0) {
      setNodes([]);
      return;
    }

    // Check if we just need to update existing nodes rather than recreate simulation
    if (initialLayoutComplete && Math.abs(stocks.length - nodes.length) < 5) {
      // Update existing nodes with new stock data but keep positions
      const updatedNodes = stocks.map((stock, index) => {
        const r = getBubbleSize(stock.marketCap, maxMarketCap) / 2;
        const existingNode = previousNodesRef.current.get(stock.id);
        
        // If this stock existed before, maintain its position
        if (existingNode) {
          return {
            ...existingNode,
            stock,
            r,
            index
          };
        }
        
        // For new stocks, place them near the center with some randomness
        return {
          id: stock.id,
          index,
          r,
          stock,
          x: containerDimensions.width / 2 + (Math.random() - 0.5) * 100,
          y: containerDimensions.height / 2 + (Math.random() - 0.5) * 100
        };
      });
      
      setNodes(updatedNodes);
      return;
    }

    // Create nodes from stocks
    const newNodes: NodeDatum[] = stocks.map((stock, index) => {
      const r = getBubbleSize(stock.marketCap, maxMarketCap) / 2; // Divide by 2 to convert diameter to radius for d3
      const existingNode = previousNodesRef.current.get(stock.id);
      
      // If this stock existed before, maintain its position
      if (existingNode && existingNode.x !== undefined && existingNode.y !== undefined) {
        return {
          ...existingNode,
          stock,
          r,
          index
        };
      }
      
      return {
        id: stock.id,
        index,
        r,
        stock,
        // Initialize with positions spread throughout container, not just top-left
        x: Math.random() * containerDimensions.width,
        y: Math.random() * containerDimensions.height
      };
    });

    // Use a much stronger collision force to ensure bubbles don't overlap
    const simulation = d3.forceSimulation<NodeDatum>()
      .nodes(newNodes)
      .alpha(0.9) // Higher alpha for more energy
      .alphaDecay(0.03) // Slower decay for better placement
      .velocityDecay(0.4) // Add some friction
      .force('center', d3.forceCenter(containerDimensions.width / 2, containerDimensions.height / 2))
      .force('charge', d3.forceManyBody().strength(-20))
      // Much stronger collision detection with higher padding
      .force('collide', d3.forceCollide<NodeDatum>()
        .radius(d => d.r + 15) // Add extra padding
        .strength(1) // Maximum strength
        .iterations(5)) // More iterations for better accuracy
      .force('x', d3.forceX(containerDimensions.width / 2).strength(0.07))
      .force('y', d3.forceY(containerDimensions.height / 2).strength(0.07));

    // Update nodes on each tick to see the simulation in progress
    simulation.on('tick', () => {
      // Ensure nodes stay within container bounds with extra padding for collision
      simulation.nodes().forEach(node => {
        // Padding to keep bubbles from touching the edge
        const padding = 10;
        node.x = Math.max(node.r + padding, Math.min(containerDimensions.width - node.r - padding, node.x || 0));
        node.y = Math.max(node.r + padding, Math.min(containerDimensions.height - node.r - padding, node.y || 0));
      });
      
      setNodes([...simulation.nodes()]);
    });

    // Store simulation reference
    simulationRef.current = simulation;
    
    // Let simulation run for fixed duration then stop it completely
    const timer = setTimeout(() => {
      if (simulationRef.current) {
        simulationRef.current.stop();
        console.log("info: Simulation stopped permanently - positions fixed");
        setInitialLayoutComplete(true);
      }
    }, 2000); // Let simulation run for 2 seconds then stop
    
    return () => {
      clearTimeout(timer);
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [stocks.length, maxMarketCap, containerDimensions, initialLayoutComplete, nodes.length]);

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
