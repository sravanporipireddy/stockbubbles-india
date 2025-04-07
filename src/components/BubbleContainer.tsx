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
  const previousStocksRef = useRef<Stock[]>([]);
  const maxMarketCap = getMaxMarketCap(stocks.length > 0 ? stocks : previousStocksRef.current);
  const [nodes, setNodes] = useState<NodeDatum[]>([]);
  const [displayNodes, setDisplayNodes] = useState<NodeDatum[]>([]);
  const simulationRef = useRef<d3.Simulation<NodeDatum, undefined> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [initialLayoutComplete, setInitialLayoutComplete] = useState(false);
  const previousNodesRef = useRef<Map<string, NodeDatum>>(new Map());
  const dataUpdatePendingRef = useRef(false);
  const isFirstRenderRef = useRef(true);
  
  const [containerDimensions, setContainerDimensions] = useState({
    width: Math.min(window.innerWidth * 0.9, 1200),
    height: 800
  });
  
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

  useEffect(() => {
    if (nodes.length > 0) {
      const nodeMap = new Map<string, NodeDatum>();
      nodes.forEach(node => {
        nodeMap.set(node.id, node);
      });
      previousNodesRef.current = nodeMap;
    }
  }, [nodes]);

  useEffect(() => {
    if (nodes.length > 0 || dataUpdatePendingRef.current) {
      setDisplayNodes(prevDisplayNodes => {
        return nodes.length > 0 ? nodes : prevDisplayNodes;
      });
      
      if (nodes.length > 0) {
        dataUpdatePendingRef.current = false;
      }
    }
  }, [nodes]);

  useEffect(() => {
    if (stocks.length > 0) {
      previousStocksRef.current = stocks;
    }
  }, [stocks]);

  useEffect(() => {
    dataUpdatePendingRef.current = true;
    
    const stocksToUse = stocks.length > 0 ? stocks : previousStocksRef.current;
    
    if (stocksToUse.length === 0) {
      if (isFirstRenderRef.current) {
        setNodes([]);
        isFirstRenderRef.current = false;
      }
      return;
    }

    const updatedNodes = stocksToUse.map((stock, index) => {
      const r = getBubbleSize(stock.marketCap, maxMarketCap) / 2;
      const existingNode = previousNodesRef.current.get(stock.id);
      
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
        x: containerDimensions.width / 2 + (Math.random() - 0.5) * 20,
        y: containerDimensions.height / 2 + (Math.random() - 0.5) * 20
      };
    });
    
    if (!initialLayoutComplete) {
      runSimulation(updatedNodes);
    } else {
      setNodes(updatedNodes);
    }
    
    isFirstRenderRef.current = false;
  }, [stocks, maxMarketCap, containerDimensions, initialLayoutComplete]);

  const runSimulation = (nodesToSimulate: NodeDatum[]) => {
    const simulation = d3.forceSimulation<NodeDatum>()
      .nodes(nodesToSimulate)
      .alpha(0.9)
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

    simulation.on('tick', () => {
      simulation.nodes().forEach(node => {
        const padding = 10;
        node.x = Math.max(node.r + padding, Math.min(containerDimensions.width - node.r - padding, node.x || 0));
        node.y = Math.max(node.r + padding, Math.min(containerDimensions.height - node.r - padding, node.y || 0));
      });
      
      setNodes([...simulation.nodes()]);
    });

    simulationRef.current = simulation;
    
    const timer = setTimeout(() => {
      if (simulationRef.current) {
        simulationRef.current.stop();
        console.log("info: Simulation stopped permanently - positions fixed");
        setInitialLayoutComplete(true);
      }
    }, 2000);
    
    return () => {
      clearTimeout(timer);
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  };

  const showNoStocksMessage = stocks.length === 0 && displayNodes.length === 0 && previousStocksRef.current.length === 0;

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
          {displayNodes.map((node) => (
            <StockBubble
              key={node.id}
              stock={node.stock}
              maxMarketCap={maxMarketCap}
              onClick={onStockClick}
              index={node.index}
              allStocks={stocks.length > 0 ? stocks : previousStocksRef.current}
              position={{ x: node.x || 0, y: node.y || 0 }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default BubbleContainer;
