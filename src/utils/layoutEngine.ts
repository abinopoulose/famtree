import dagre from 'dagre';
import { Position, type Node, type Edge } from 'reactflow';

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 150 });

  nodes.forEach((node) => {
    const width = node.data.spouse ? 632 : 300;
    dagreGraph.setNode(node.id, { width, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const width = node.data.spouse ? 632 : 300;
    const x = nodeWithPosition.x - width / 2;
    
    // STRICT Y-AXIS ALIGNMENT (Aligned to exact generations)
    const depth = typeof node.data.depth === 'number' ? node.data.depth : 0;
    const y = depth * 350; // Increased spacing for cleaner edges

    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + width > maxX) maxX = x + width;
    if (y + 100 > maxY) maxY = y + 100;

    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: { x, y },
    };
  });

  // COMPLEX OVERLAP LOGIC
  const getNodeCenterX = (nodeId: string) => {
    const node = newNodes.find(n => n.id === nodeId);
    if (!node) return 0;
    const width = node.data.spouse ? 632 : 300;
    return node.position.x + width / 2;
  };

  const edgesBySource = new Map<string, Edge[]>();
  edges.forEach(edge => {
    if (!edgesBySource.has(edge.source)) edgesBySource.set(edge.source, []);
    edgesBySource.get(edge.source)!.push(edge);
  });

  const sourceSpans: { source: string; depth: number; start: number; end: number }[] = [];
  
  for (const [source, sourceEdges] of edgesBySource.entries()) {
    const sourceNode = newNodes.find(n => n.id === source);
    if (!sourceNode) continue;
    
    const sourceX = getNodeCenterX(source);
    let minSpanX = sourceX;
    let maxSpanX = sourceX;
    
    sourceEdges.forEach(edge => {
      const targetX = getNodeCenterX(edge.target);
      if (targetX < minSpanX) minSpanX = targetX;
      if (targetX > maxSpanX) maxSpanX = targetX;
    });
    
    const depth = typeof sourceNode.data.depth === 'number' ? sourceNode.data.depth : 0;
    // Add padding to span to avoid visual crowding
    sourceSpans.push({ source, depth, start: minSpanX - 30, end: maxSpanX + 30 });
  }

  const spansByDepth = new Map<number, typeof sourceSpans>();
  sourceSpans.forEach(span => {
    if (!spansByDepth.has(span.depth)) spansByDepth.set(span.depth, []);
    spansByDepth.get(span.depth)!.push(span);
  });

  const sourceToOffset = new Map<string, number>();

  for (const spans of spansByDepth.values()) {
    spans.sort((a, b) => a.start - b.start);
    const assignedLevels = new Map<number, typeof sourceSpans>();
    
    const levelOrder = [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 7, -7];
    
    for (const span of spans) {
      let assigned = false;
      for (const level of levelOrder) {
        const levelSpans = assignedLevels.get(level) || [];
        const overlap = levelSpans.some(s => !(span.end < s.start || span.start > s.end));
        if (!overlap) {
          levelSpans.push(span);
          assignedLevels.set(level, levelSpans);
          sourceToOffset.set(span.source, level);
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        // Fallback
        sourceToOffset.set(span.source, 8); 
      }
    }
  }

  const newEdges = edges.map(edge => {
    const offsetLevel = sourceToOffset.get(edge.source) || 0;
    return {
      ...edge,
      data: { ...edge.data, offsetLevel }
    };
  });

  const bounds = minX === Infinity ? undefined : [[minX - 500, minY - 500], [maxX + 500, maxY + 500]];

  return { nodes: newNodes, edges: newEdges, bounds };
};
