import dagre from 'dagre';
import { Position, type Node, type Edge } from 'reactflow';

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 150 });

  nodes.forEach((node) => {
    const width = node.data.spouse ? 510 : 270;
    dagreGraph.setNode(node.id, { width, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const width = node.data.spouse ? 510 : 270;
    const x = nodeWithPosition.x - width / 2;
    
    // STRICT Y-AXIS ALIGNMENT:
    const depth = typeof node.data.depth === 'number' ? node.data.depth : 0;
    const y = depth * 250;

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

  const bounds = minX === Infinity ? undefined : [[minX - 500, minY - 500], [maxX + 500, maxY + 500]];

  return { nodes: newNodes, edges, bounds };
};
