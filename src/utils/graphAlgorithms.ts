import { MarkerType, type Node, type Edge } from 'reactflow';
import { CSV_COLUMNS } from '../constants';

export const getAvatarFallback = (gender: string) => {
  const isFemale = gender && gender.trim().toLowerCase() === 'female';
  return isFemale 
    ? 'https://api.dicebear.com/7.x/adventurer/svg?seed=female&backgroundColor=b6e3f4' 
    : 'https://api.dicebear.com/7.x/adventurer/svg?seed=male&backgroundColor=c0aede';
};

const getRole = (p: any) => {
  return p[CSV_COLUMNS.NAME];
};

const computeDepths = (people: any[]): Map<string, number> => {
  const depths = new Map<string, number>();
  const peopleMap = new Map<string, any>();
  
  people.forEach(p => {
    peopleMap.set(p[CSV_COLUMNS.EMAIL], p);
    depths.set(p[CSV_COLUMNS.EMAIL], 0);
  });

  let changed = true;
  let iterations = 0;
  
  while (changed && iterations < 100) {
    changed = false;
    iterations++;

    people.forEach(p => {
      const email = p[CSV_COLUMNS.EMAIL];
      let currentDepth = depths.get(email)!;
      let newDepth = currentDepth;

      const parentEmail = p[CSV_COLUMNS.PARENT_EMAIL];
      if (parentEmail && parentEmail !== 'NULL' && depths.has(parentEmail)) {
        const expectedFromParent = depths.get(parentEmail)! + 1;
        if (expectedFromParent > newDepth) {
          newDepth = expectedFromParent;
        }
      }

      const spouseEmail = p[CSV_COLUMNS.SPOUSE_EMAIL];
      if (spouseEmail && spouseEmail !== 'NULL' && depths.has(spouseEmail)) {
        const expectedFromSpouse = depths.get(spouseEmail)!;
        if (expectedFromSpouse > newDepth) {
          newDepth = expectedFromSpouse;
        }
      }

      if (newDepth !== currentDepth) {
        depths.set(email, newDepth);
        changed = true;
      }
    });
  }

  return depths;
};

export const calculateGraph = (people: any[], personA: any, personB: any, viewMode: string, onInfoClick: (data: any) => void) => {
  if (!personA || !personB) return { nodes: [], edges: [] };

  const peopleMap = new Map();
  people.forEach(p => peopleMap.set(p[CSV_COLUMNS.EMAIL], p));
  const depths = computeDepths(people);

  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];
  const renderedNodes = new Set<string>();
  const personToNodeId = new Map<string, string>();

  const createNodeData = (p: any, isEndpoint: boolean, includeSpouse: boolean) => {
    const email = p[CSV_COLUMNS.EMAIL];
    const spouseEmail = p[CSV_COLUMNS.SPOUSE_EMAIL];
    const isInPath = pathFound.includes(email) || (spouseEmail && spouseEmail !== 'NULL' && pathFound.includes(spouseEmail));

    const nodeData: any = {
      name: p[CSV_COLUMNS.NAME],
      image: p[CSV_COLUMNS.IMAGE] ? `/${p[CSV_COLUMNS.IMAGE].replace('public/', '')}` : getAvatarFallback(p[CSV_COLUMNS.GENDER]),
      fallbackImage: getAvatarFallback(p[CSV_COLUMNS.GENDER]),
      role: getRole(p),
      isEndpoint,
      isInPath,
      raw: p,
      depth: depths.get(p[CSV_COLUMNS.EMAIL]) ?? 0,
      onInfoClick
    };

    if (includeSpouse) {
      const spouseEmail = p[CSV_COLUMNS.SPOUSE_EMAIL];
      if (spouseEmail && spouseEmail !== 'NULL') {
        const spouse = peopleMap.get(spouseEmail);
        if (spouse) {
          nodeData.spouse = {
            name: spouse[CSV_COLUMNS.NAME],
            image: spouse[CSV_COLUMNS.IMAGE] ? `/${spouse[CSV_COLUMNS.IMAGE].replace('public/', '')}` : getAvatarFallback(spouse[CSV_COLUMNS.GENDER]),
            fallbackImage: getAvatarFallback(spouse[CSV_COLUMNS.GENDER]),
            role: getRole(spouse),
            raw: spouse,
            isDummy: false
          };
        }
      }
    }

    return nodeData;
  };

  const addNode = (email: string, isEndpoint: boolean, includeSpouse: boolean) => {
    if (renderedNodes.has(email)) return;
    const p = peopleMap.get(email);
    if (!p) return;
    
    const spouseEmail = p[CSV_COLUMNS.SPOUSE_EMAIL];
    const hasSpouse = spouseEmail && spouseEmail !== 'NULL' && peopleMap.has(spouseEmail);
    const willIncludeSpouse = includeSpouse && hasSpouse;

    initialNodes.push({
      id: email,
      type: 'person',
      data: createNodeData(p, isEndpoint, willIncludeSpouse),
      position: { x: 0, y: 0 }
    });
    
    renderedNodes.add(email);
    personToNodeId.set(email, email);

    if (willIncludeSpouse) {
      renderedNodes.add(spouseEmail);
      personToNodeId.set(spouseEmail, email);
    }
  };

  const adjList = new Map<string, Set<string>>();
  people.forEach(p => {
    const email = p[CSV_COLUMNS.EMAIL];
    const parent = p[CSV_COLUMNS.PARENT_EMAIL];
    const spouse = p[CSV_COLUMNS.SPOUSE_EMAIL];
    if (!adjList.has(email)) adjList.set(email, new Set());
    if (parent && parent !== 'NULL') {
      if (!adjList.has(parent)) adjList.set(parent, new Set());
      adjList.get(email)!.add(parent);
      adjList.get(parent)!.add(email);
    }
    if (spouse && spouse !== 'NULL') {
      if (!adjList.has(spouse)) adjList.set(spouse, new Set());
      adjList.get(email)!.add(spouse);
      adjList.get(spouse)!.add(email);
    }
  });

  const start = personA[CSV_COLUMNS.EMAIL];
  const target = personB[CSV_COLUMNS.EMAIL];
  
  const queuePath = [[start]];
  const visitedPath = new Set<string>();
  visitedPath.add(start);
  let pathFound: string[] = [];

  if (start === target) {
    pathFound = [start];
  } else {
    let head = 0;
    while (head < queuePath.length) {
      const path = queuePath[head++];
      const curr = path[path.length - 1];
      
      if (curr === target) {
        pathFound = path;
        break;
      }

      const neighbors = adjList.get(curr);
      if (neighbors) {
        neighbors.forEach(n => {
          if (!visitedPath.has(n)) {
            visitedPath.add(n);
            queuePath.push([...path, n]);
          }
        });
      }
    }
  }

  const emailsToRender = new Set<string>();

  if (viewMode === 'all') {
    const allEmails = new Set<string>();
    const bfsSeeds = [personA[CSV_COLUMNS.EMAIL], personB[CSV_COLUMNS.EMAIL]];
    const queue: string[] = [];
    
    bfsSeeds.forEach(seed => {
      if (!allEmails.has(seed)) {
        allEmails.add(seed);
        queue.push(seed);
      }
    });
    
    let head = 0;
    while(head < queue.length) {
      const curr = queue[head++];
      const neighbors = adjList.get(curr);
      if (neighbors) {
        neighbors.forEach(n => {
          if (!allEmails.has(n)) {
            allEmails.add(n);
            queue.push(n);
          }
        });
      }
    }
    allEmails.forEach(e => emailsToRender.add(e));
  } else {
    pathFound.forEach(e => emailsToRender.add(e));
  }

  let minDepth = Infinity;
  emailsToRender.forEach(email => {
    const d = depths.get(email) ?? 0;
    if (d < minDepth) minDepth = d;
  });

  emailsToRender.forEach(email => {
    if (!renderedNodes.has(email)) {
      const isEndpoint = email === personA[CSV_COLUMNS.EMAIL] || email === personB[CSV_COLUMNS.EMAIL];
      const p = peopleMap.get(email);
      const spouseEmail = p?.[CSV_COLUMNS.SPOUSE_EMAIL];
      
      const nodeDepth = depths.get(email) ?? 0;
      const isTopMost = nodeDepth === minDepth;
      
      let includeSpouse = false;
      if (viewMode === 'spouse' || viewMode === 'all' || isTopMost) {
        includeSpouse = true;
      } else if (spouseEmail && spouseEmail !== 'NULL') {
        if (emailsToRender.has(spouseEmail) || spouseEmail === personA[CSV_COLUMNS.EMAIL] || spouseEmail === personB[CSV_COLUMNS.EMAIL]) {
          includeSpouse = true;
        }
      }

      addNode(email, isEndpoint, includeSpouse);
    }
  });

  const activeEdgeIds = new Set<string>();
  for (let i = 0; i < pathFound.length - 1; i++) {
    const id1 = personToNodeId.get(pathFound[i]);
    const id2 = personToNodeId.get(pathFound[i+1]);
    if (id1 && id2 && id1 !== id2) {
      activeEdgeIds.add(`e-${id1}-${id2}`);
      activeEdgeIds.add(`e-${id2}-${id1}`);
    }
  }

  people.forEach(child => {
    const childEmail = child[CSV_COLUMNS.EMAIL];
    const parentEmail = child[CSV_COLUMNS.PARENT_EMAIL];
    
    if (parentEmail && parentEmail !== 'NULL') {
      const sourceId = personToNodeId.get(parentEmail);
      const targetId = personToNodeId.get(childEmail);
      
      if (sourceId && targetId && sourceId !== targetId) {
        const edgeId = `e-${sourceId}-${targetId}`;
        const isActive = activeEdgeIds.has(edgeId) || activeEdgeIds.has(`e-${targetId}-${sourceId}`);
        if (!initialEdges.some(e => e.id === edgeId)) {
          initialEdges.push({
            id: edgeId,
            source: sourceId,
            target: targetId,
            type: 'smoothstep',
            animated: isActive,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { 
              stroke: isActive ? '#2563eb' : '#94a3b8', 
              strokeWidth: isActive ? 4 : 1.5,
              filter: isActive ? 'drop-shadow(0 0 5px rgba(37, 99, 235, 0.5))' : 'none',
              transition: 'all 0.3s ease'
            }
          });
        }
      }
    }
  });

  const hasIncoming = new Set<string>();
  const hasOutgoing = new Set<string>();
  initialEdges.forEach(e => {
    hasOutgoing.add(e.source);
    hasIncoming.add(e.target);
  });

  initialNodes.forEach(node => {
    node.data.isRoot = !hasIncoming.has(node.id);
    node.data.isLeaf = !hasOutgoing.has(node.id);
  });

  return { nodes: initialNodes, edges: initialEdges };
};
