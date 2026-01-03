/**
 * Concept Graph Component
 * Student: IT22601360
 * 
 * Displays concept relationships as an interactive graph
 * Uses simple SVG-based visualization (no external dependencies)
 */

import React, { useRef, useEffect, useState } from 'react';
import './ConceptGraph.css';

// Simple force-directed graph simulation
const useForceSimulation = (nodes, links, width, height) => {
    const [positions, setPositions] = useState([]);
    
    useEffect(() => {
        if (!nodes || nodes.length === 0) {
            setPositions([]);
            return;
        }

        // Initialize positions randomly
        const initialPositions = nodes.map((node, i) => ({
            ...node,
            x: width / 2 + (Math.random() - 0.5) * 300,
            y: height / 2 + (Math.random() - 0.5) * 200,
            vx: 0,
            vy: 0
        }));

        // Simple force simulation
        let positions = [...initialPositions];
        const iterations = 100;
        
        for (let iter = 0; iter < iterations; iter++) {
            // Repulsion between all nodes
            for (let i = 0; i < positions.length; i++) {
                for (let j = i + 1; j < positions.length; j++) {
                    const dx = positions[j].x - positions[i].x;
                    const dy = positions[j].y - positions[i].y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = 1000 / (dist * dist);
                    
                    positions[i].vx -= (dx / dist) * force;
                    positions[i].vy -= (dy / dist) * force;
                    positions[j].vx += (dx / dist) * force;
                    positions[j].vy += (dy / dist) * force;
                }
            }

            // Attraction along links
            links?.forEach(link => {
                const source = positions.find(n => n.id === link.source);
                const target = positions.find(n => n.id === link.target);
                if (source && target) {
                    const dx = target.x - source.x;
                    const dy = target.y - source.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = (dist - 100) * 0.01;
                    
                    source.vx += (dx / dist) * force;
                    source.vy += (dy / dist) * force;
                    target.vx -= (dx / dist) * force;
                    target.vy -= (dy / dist) * force;
                }
            });

            // Center gravity
            positions.forEach(node => {
                node.vx += (width / 2 - node.x) * 0.01;
                node.vy += (height / 2 - node.y) * 0.01;
            });

            // Apply velocities with damping
            positions.forEach(node => {
                node.x += node.vx * 0.1;
                node.y += node.vy * 0.1;
                node.vx *= 0.9;
                node.vy *= 0.9;
                
                // Keep within bounds
                node.x = Math.max(50, Math.min(width - 50, node.x));
                node.y = Math.max(50, Math.min(height - 50, node.y));
            });
        }

        setPositions(positions);
    }, [nodes, links, width, height]);

    return positions;
};

const ConceptGraph = ({ data }) => {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
    const [hoveredNode, setHoveredNode] = useState(null);

    // Update dimensions on resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const nodes = data?.nodes || [];
    const links = data?.links || [];
    
    const positions = useForceSimulation(
        nodes, 
        links, 
        dimensions.width, 
        dimensions.height
    );

    if (!data || nodes.length === 0) {
        return (
            <div className="concept-graph-empty">
                <p>No graph data available</p>
            </div>
        );
    }

    // Create position lookup
    const positionMap = {};
    positions.forEach(p => {
        positionMap[p.id] = p;
    });

    return (
        <div className="concept-graph" ref={containerRef}>
            <svg width={dimensions.width} height={dimensions.height}>
                {/* Links */}
                <g className="links">
                    {links.map((link, i) => {
                        const source = positionMap[link.source];
                        const target = positionMap[link.target];
                        if (!source || !target) return null;
                        
                        return (
                            <line
                                key={i}
                                x1={source.x}
                                y1={source.y}
                                x2={target.x}
                                y2={target.y}
                                stroke="#ccc"
                                strokeWidth={link.value || 1}
                                strokeOpacity={0.6}
                            />
                        );
                    })}
                </g>

                {/* Nodes */}
                <g className="nodes">
                    {positions.map((node) => (
                        <g
                            key={node.id}
                            transform={`translate(${node.x}, ${node.y})`}
                            onMouseEnter={() => setHoveredNode(node)}
                            onMouseLeave={() => setHoveredNode(null)}
                            style={{ cursor: 'pointer' }}
                        >
                            {/* Node circle */}
                            <circle
                                r={node.size || 15}
                                fill={node.color || '#666'}
                                stroke={hoveredNode?.id === node.id ? '#333' : '#fff'}
                                strokeWidth={2}
                            />
                            
                            {/* Node label */}
                            <text
                                dy={node.size + 15 || 30}
                                textAnchor="middle"
                                fontSize="11"
                                fill="#333"
                            >
                                {node.label || node.name}
                            </text>
                        </g>
                    ))}
                </g>
            </svg>

            {/* Tooltip */}
            {hoveredNode && (
                <div 
                    className="graph-tooltip"
                    style={{
                        left: hoveredNode.x + 20,
                        top: hoveredNode.y - 10
                    }}
                >
                    <strong>{hoveredNode.label || hoveredNode.name}</strong>
                    <div className="tooltip-category">{hoveredNode.category?.replace(/_/g, ' ')}</div>
                    <div className="tooltip-confidence">
                        Confidence: {Math.round((hoveredNode.confidence || 0) * 100)}%
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="graph-legend">
                <div className="legend-item">
                    <span className="legend-color" style={{ background: '#4CAF50' }}></span>
                    <span>Data Structure</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ background: '#2196F3' }}></span>
                    <span>Algorithm</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ background: '#9C27B0' }}></span>
                    <span>Design Pattern</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ background: '#FF9800' }}></span>
                    <span>Architecture</span>
                </div>
            </div>
        </div>
    );
};

export default ConceptGraph;
