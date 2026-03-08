import React, { useEffect, useRef, useState } from 'react';

const ConceptGraph = ({ data }) => {
    const canvasRef = useRef(null);
    const [nodes, setNodes] = useState([]);
    const [links, setLinks] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!data) {
            generateDummyGraph();
            return;
        }

        // Check if data is graph format or concepts format
        if (data.nodes && Array.isArray(data.nodes)) {
            // It's already graph format
            const processedNodes = data.nodes.map((node, i) => ({
                ...node,
                x: Math.random() * 600 + 100,
                y: Math.random() * 400 + 100,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: 30 + (node.size || 10) * 0.5
            }));
            
            setNodes(processedNodes);
            setLinks(data.links || []);
        } else if (Array.isArray(data)) {
            // It's a concepts array - convert to graph format
            const concepts = data;
            
            // Generate nodes
            const nodes = concepts.map((concept, index) => ({
                id: index.toString(),
                label: concept.name,
                name: concept.name,
                category: concept.category,
                confidence: concept.confidence || 0.5,
                description: concept.description || '',
                size: 20 + ((concept.confidence || 0.5) * 40),
                x: Math.random() * 600 + 100,
                y: Math.random() * 400 + 100,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: 30 + ((20 + ((concept.confidence || 0.5) * 40)) * 0.5)
            }));

            // Generate links based on categories
            const links = [];
            const categoryGroups = {};
            
            concepts.forEach((concept, index) => {
                if (!categoryGroups[concept.category]) {
                    categoryGroups[concept.category] = [];
                }
                categoryGroups[concept.category].push(index.toString());
            });

            Object.values(categoryGroups).forEach(group => {
                for (let i = 0; i < group.length - 1; i++) {
                    links.push({
                        source: group[i],
                        target: group[i + 1]
                    });
                }
            });

            // Also connect related concepts
            concepts.forEach((concept, index) => {
                if (concept.relatedConcepts && Array.isArray(concept.relatedConcepts)) {
                    concept.relatedConcepts.forEach(relatedConceptName => {
                        const relatedIndex = concepts.findIndex(c => 
                            c.name.toLowerCase() === relatedConceptName.toLowerCase()
                        );
                        if (relatedIndex !== -1 && relatedIndex !== index) {
                            links.push({
                                source: index.toString(),
                                target: relatedIndex.toString()
                            });
                        }
                    });
                }
            });

            setNodes(nodes);
            setLinks(links);
        } else {
            generateDummyGraph();
        }
    }, [data]);

    const generateDummyGraph = () => {
        const dummyNodes = [
            { id: '0', label: 'Binary Search', category: 'algorithm', size: 3 },
            { id: '1', label: 'Array', category: 'data_structure', size: 4 },
            { id: '2', label: 'Stack', category: 'data_structure', size: 3 },
            { id: '3', label: 'OOP', category: 'paradigm', size: 5 },
            { id: '4', label: 'Recursion', category: 'algorithm', size: 2 },
            { id: '5', label: 'Encapsulation', category: 'programming_concept', size: 2 },
            { id: '6', label: 'Class', category: 'programming_concept', size: 3 }
        ];

        const dummyLinks = [
            { source: '0', target: '1' },
            { source: '0', target: '4' },
            { source: '1', target: '2' },
            { source: '2', target: '3' },
            { source: '3', target: '5' },
            { source: '3', target: '6' },
            { source: '5', target: '6' }
        ];

        // Create connections map
        const connections = {};
        dummyLinks.forEach(link => {
            if (!connections[link.source]) connections[link.source] = [];
            if (!connections[link.target]) connections[link.target] = [];
            connections[link.source].push(link.target);
            connections[link.target].push(link.source);
        });

        const processedNodes = dummyNodes.map((node, i) => {
            const angle = (i / dummyNodes.length) * Math.PI * 2;
            const radius = 200;
            return {
                ...node,
                x: 400 + Math.cos(angle) * radius,
                y: 300 + Math.sin(angle) * radius,
                vx: 0,
                vy: 0,
                radius: 30 + node.size * 8,
                connections: connections[node.id] || []
            };
        });

        setNodes(processedNodes);
        setLinks(dummyLinks);
    };

    // ADD THIS SIMULATION FUNCTION - You're missing it!
    useEffect(() => {
        if (!canvasRef.current || nodes.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width;
        canvas.height = rect.height;

        const categoryColors = {
            data_structure: '#10b981',
            algorithm: '#3b82f6',
            design_pattern: '#9c27b0',
            architecture: '#f59e0b',
            paradigm: '#ec4899',
            programming_concept: '#06b6d4'
        };

        const simulate = () => {
            const newNodes = [...nodes];

            for (let i = 0; i < newNodes.length; i++) {
                const node = newNodes[i];

                // Center attraction
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const dx = centerX - node.x;
                const dy = centerY - node.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    node.vx += (dx / dist) * 0.01;
                    node.vy += (dy / dist) * 0.01;
                }

                // Repulsion
                for (let j = i + 1; j < newNodes.length; j++) {
                    const other = newNodes[j];
                    const dx = other.x - node.x;
                    const dy = other.y - node.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150 && dist > 0) {
                        const force = (150 - dist) / 150;
                        node.vx -= (dx / dist) * force * 0.5;
                        node.vy -= (dy / dist) * force * 0.5;
                        other.vx += (dx / dist) * force * 0.5;
                        other.vy += (dy / dist) * force * 0.5;
                    }
                }

                // Connection attraction
                if (node.connections && node.connections.length > 0) {
                    node.connections.forEach(connId => {
                        const connected = newNodes.find(n => n.id === connId);
                        if (connected) {
                            const dx = connected.x - node.x;
                            const dy = connected.y - node.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist > 0) {
                                node.vx += (dx / dist) * 0.05;
                                node.vy += (dy / dist) * 0.05;
                            }
                        }
                    });
                }

                node.vx *= 0.85;
                node.vy *= 0.85;
                node.x += node.vx;
                node.y += node.vy;

                if (node.x < node.radius) node.x = node.radius;
                if (node.x > canvas.width - node.radius) node.x = canvas.width - node.radius;
                if (node.y < node.radius) node.y = node.radius;
                if (node.y > canvas.height - node.radius) node.y = canvas.height - node.radius;
            }

            setNodes(newNodes);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            
            links.forEach(link => {
                const source = newNodes.find(n => n.id === link.source);
                const target = newNodes.find(n => n.id === link.target);
                
                if (source && target) {
                    ctx.beginPath();
                    ctx.moveTo(source.x, source.y);
                    ctx.lineTo(target.x, target.y);
                    ctx.stroke();
                }
            });

            // Draw nodes
            newNodes.forEach(node => {
                const color = categoryColors[node.category] || '#64748b';
                
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius - 4, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;

                ctx.fillStyle = '#e2e8f0';
                ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                const words = node.label.split(' ');
                const maxWidth = node.radius * 1.6;
                let line = '';
                let y = node.y;
                
                if (words.length > 1) y -= 6;
                
                words.forEach((word, i) => {
                    const testLine = line + word + ' ';
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth && i > 0) {
                        ctx.fillText(line.trim(), node.x, y);
                        line = word + ' ';
                        y += 13;
                    } else {
                        line = testLine;
                    }
                });
                ctx.fillText(line.trim(), node.x, y);
            });

            animationRef.current = requestAnimationFrame(simulate);
        };

        simulate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [nodes, links]);

    const handleCanvasClick = (e) => {
        if (!canvasRef.current) return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const clicked = nodes.find(node => {
            const dx = x - node.x;
            const dy = y - node.y;
            return Math.sqrt(dx * dx + dy * dy) <= node.radius;
        });

        setSelectedNode(clicked || null);
    };

    if (!nodes || nodes.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <span className="text-6xl mb-4 block">🕸️</span>
                    <p className="text-gray-500">No graph data available</p>
                    <p className="text-gray-600 text-sm mt-2">Extract concepts from code to see relationships</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-slate-950">
            <div className="px-6 py-3 bg-slate-900/50 border-b border-slate-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Click nodes to view details • Drag to explore</span>
                    </div>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30">
                        {nodes.length} concepts • {links.length} connections
                    </span>
                </div>
            </div>

            <div className="flex-1 relative">
                <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="w-full h-full cursor-pointer"
                />

                {selectedNode && (
                    <div className="absolute top-4 right-4 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 p-4 max-w-xs">
                        <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-white">{selectedNode.label}</h4>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="text-gray-500 hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">
                            Category: <span className="font-medium text-cyan-400">{selectedNode.category?.replace('_', ' ')}</span>
                        </p>
                        {selectedNode.description && (
                            <p className="text-xs text-gray-300 mb-3">{selectedNode.description}</p>
                        )}
                        {selectedNode.connections && selectedNode.connections.length > 0 && (
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Connected to {selectedNode.connections.length} concepts:</p>
                                <div className="flex flex-wrap gap-1">
                                    {selectedNode.connections.slice(0, 5).map(connId => {
                                        const conn = nodes.find(n => n.id === connId);
                                        return conn ? (
                                            <span key={connId} className="px-2 py-1 bg-slate-800 text-cyan-300 rounded text-xs border border-slate-700">
                                                {conn.label}
                                            </span>
                                        ) : null;
                                    })}
                                    {selectedNode.connections.length > 5 && (
                                        <span className="px-2 py-1 text-gray-500 text-xs">
                                            +{selectedNode.connections.length - 5} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800">
                <div className="flex flex-wrap gap-4 justify-center">
                    {[
                        { category: 'data_structure', color: '#10b981', label: 'Data Structure' },
                        { category: 'algorithm', color: '#3b82f6', label: 'Algorithm' },
                        { category: 'paradigm', color: '#ec4899', label: 'Paradigm' },
                        { category: 'programming_concept', color: '#06b6d4', label: 'Concept' }
                    ].map(item => (
                        <div key={item.category} className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded-full border-2 border-slate-700 shadow-sm"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs text-gray-400">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ConceptGraph;