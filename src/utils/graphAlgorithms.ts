import { MarkerType, type Node, type Edge } from 'reactflow';
import { CSV_COLUMNS } from '../constants';

export const getAvatarFallback = (gender: string) => {
  const isFemale = gender && gender.trim().toLowerCase() === 'female';
  return isFemale ? '/female.svg' : '/male.svg';
};



const computeDepths = (people: any[]): Map<string, number> => {
  const depths = new Map<string, number>();
  
  people.forEach(p => {
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

      const parentEmail = p[CSV_COLUMNS.PARENT_EMAIL];
      if (parentEmail && parentEmail !== 'NULL' && depths.has(parentEmail)) {
        const pDepth = depths.get(parentEmail)!;
        if (pDepth + 1 > currentDepth) {
          currentDepth = pDepth + 1;
          depths.set(email, currentDepth);
          changed = true;
        }
      }

      const spouseEmail = p[CSV_COLUMNS.SPOUSE_EMAIL];
      if (spouseEmail && spouseEmail !== 'NULL' && depths.has(spouseEmail)) {
        const sDepth = depths.get(spouseEmail)!;
        if (sDepth > currentDepth) {
          currentDepth = sDepth;
          depths.set(email, currentDepth);
          changed = true;
        }
      }

      // Push UP to parent
      if (parentEmail && parentEmail !== 'NULL' && depths.has(parentEmail)) {
        const expectedParentDepth = currentDepth - 1;
        if (expectedParentDepth > depths.get(parentEmail)!) {
          depths.set(parentEmail, expectedParentDepth);
          changed = true;
        }
      }
    });
  }

  let minD = Infinity;
  depths.forEach(d => { if (d < minD) minD = d; });
  if (minD < 0) {
    depths.forEach((d, k) => depths.set(k, d - minD));
  }

  return depths;
};

export const calculateGraph = (people: any[], personA: any, personB: any, viewMode: string, onInfoClick: (data: any) => void) => {
  if (!personA || !personB) return { nodes: [], edges: [] };

  const peopleMap = new Map();
  people.forEach(p => peopleMap.set(p[CSV_COLUMNS.EMAIL], p));

  // Fix missing reciprocal spouse links
  peopleMap.forEach((p, email) => {
    const spouseEmail = p[CSV_COLUMNS.SPOUSE_EMAIL];
    if (spouseEmail && spouseEmail !== 'NULL') {
      const spouse = peopleMap.get(spouseEmail);
      if (spouse && (!spouse[CSV_COLUMNS.SPOUSE_EMAIL] || spouse[CSV_COLUMNS.SPOUSE_EMAIL] === 'NULL')) {
        spouse[CSV_COLUMNS.SPOUSE_EMAIL] = email;
      }
    }
  });
  const depths = computeDepths(people);

  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];
  const renderedNodes = new Set<string>();
  const personToNodeId = new Map<string, string>();

  const createNodeData = (p: any, includeSpouse: boolean) => {
    const email = p[CSV_COLUMNS.EMAIL];

    const nodeData: any = {
      name: p[CSV_COLUMNS.NAME],
      image: p[CSV_COLUMNS.IMAGE] ? `/${p[CSV_COLUMNS.IMAGE].replace('public/', '')}` : getAvatarFallback(p[CSV_COLUMNS.GENDER]),
      fallbackImage: getAvatarFallback(p[CSV_COLUMNS.GENDER]),
      isEndpoint: email === personA[CSV_COLUMNS.EMAIL] || email === personB[CSV_COLUMNS.EMAIL],
      isInPath: pathFound.includes(email),
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
            raw: spouse,
            isDummy: false,
            isEndpoint: spouseEmail === personA[CSV_COLUMNS.EMAIL] || spouseEmail === personB[CSV_COLUMNS.EMAIL],
            isInPath: pathFound.includes(spouseEmail)
          };
        }
      }
    }

    return nodeData;
  };

  const addNode = (email: string, includeSpouse: boolean, isPathPeak: boolean = false) => {
    if (renderedNodes.has(email)) return;
    const p = peopleMap.get(email);
    if (!p) return;
    
    const spouseEmail = p[CSV_COLUMNS.SPOUSE_EMAIL];
    const hasSpouse = spouseEmail && spouseEmail !== 'NULL' && peopleMap.has(spouseEmail);
    const willIncludeSpouse = includeSpouse && hasSpouse;

    initialNodes.push({
      id: email,
      type: 'person',
      data: { ...createNodeData(p, willIncludeSpouse), isPathPeak },
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
      
      const parentObj = peopleMap.get(parent);
      if (parentObj) {
        const otherParent = parentObj[CSV_COLUMNS.SPOUSE_EMAIL];
        if (otherParent && otherParent !== 'NULL') {
          if (!adjList.has(otherParent)) adjList.set(otherParent, new Set());
          adjList.get(email)!.add(otherParent);
          adjList.get(otherParent)!.add(email);
        }
      }
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
      
      let handledByOther = false;
      emailsToRender.forEach(otherEmail => {
        if (otherEmail !== email && !renderedNodes.has(otherEmail)) {
          const otherP = peopleMap.get(otherEmail);
          if (otherP && otherP[CSV_COLUMNS.SPOUSE_EMAIL] === email) {
            const myP = peopleMap.get(email);
            if (myP && myP[CSV_COLUMNS.SPOUSE_EMAIL] === otherEmail) {
              if (otherEmail < email) handledByOther = true;
            } else {
              handledByOther = true;
            }
          }
        }
      });
      
      if (handledByOther) return;

      const p = peopleMap.get(email);
      const spouseEmail = p?.[CSV_COLUMNS.SPOUSE_EMAIL];
      
      const nodeDepth = depths.get(email) ?? 0;
      const isTopMost = nodeDepth === minDepth;
      const isEndpoint = email === personA[CSV_COLUMNS.EMAIL] || email === personB[CSV_COLUMNS.EMAIL];
      
      let includeSpouse = false;
      if (viewMode === 'spouse' || viewMode === 'all' || (isTopMost && !isEndpoint)) {
        includeSpouse = true;
      } else if (spouseEmail && spouseEmail !== 'NULL') {
        if (emailsToRender.has(spouseEmail) || spouseEmail === personA[CSV_COLUMNS.EMAIL] || spouseEmail === personB[CSV_COLUMNS.EMAIL]) {
          includeSpouse = true;
        }
      }

      addNode(email, includeSpouse, isTopMost);
    }
  });

  const activeEdgeIds = new Set<string>();
  const edgeAnimDirection = new Map<string, boolean>();
  
  for (let i = 0; i < pathFound.length - 1; i++) {
    const idFrom = personToNodeId.get(pathFound[i]);
    const idTo = personToNodeId.get(pathFound[i+1]);
    if (idFrom && idTo && idFrom !== idTo) {
      activeEdgeIds.add(`e-${idFrom}-${idTo}`);
      activeEdgeIds.add(`e-${idTo}-${idFrom}`);
      
      // If the actual edge is drawn idTo -> idFrom, it means it's flowing UP the visual tree.
      // So relative to the SVG line (which always draws source->target, i.e. top->bottom),
      // the animation needs to flow backwards (reverse).
      edgeAnimDirection.set(`e-${idTo}-${idFrom}`, true);
      edgeAnimDirection.set(`e-${idFrom}-${idTo}`, false);
    }
  }

  const depthCounters = new Map<number, number>();
  const sourceToOffset = new Map<string, number>();

  people.forEach(child => {
    const childEmail = child[CSV_COLUMNS.EMAIL];
    const parentEmail = child[CSV_COLUMNS.PARENT_EMAIL];
    
    if (parentEmail && parentEmail !== 'NULL') {
      let sourceId = personToNodeId.get(parentEmail);
      
      if (!sourceId) {
        const parentObj = peopleMap.get(parentEmail);
        if (parentObj) {
          const spouseEmail = parentObj[CSV_COLUMNS.SPOUSE_EMAIL];
          if (spouseEmail && spouseEmail !== 'NULL') {
            sourceId = personToNodeId.get(spouseEmail);
          }
        }
      }
      
      const targetId = personToNodeId.get(childEmail);
      
      if (sourceId && targetId && sourceId !== targetId) {
        if (!sourceToOffset.has(sourceId)) {
          const depth = depths.get(sourceId) ?? 0;
          const currentCounter = depthCounters.get(depth) ?? 0;
          
          let offsetLevel = 0;
          if (currentCounter > 0) {
            offsetLevel = currentCounter % 2 === 1 ? Math.ceil(currentCounter / 2) : -Math.ceil(currentCounter / 2);
          }
          
          sourceToOffset.set(sourceId, offsetLevel);
          depthCounters.set(depth, currentCounter + 1);
        }
        
        const offsetLevel = sourceToOffset.get(sourceId)!;
        const edgeId = `e-${sourceId}-${targetId}`;
        const isActive = activeEdgeIds.has(edgeId) || activeEdgeIds.has(`e-${targetId}-${sourceId}`);
        const isReverse = edgeAnimDirection.get(edgeId) === true;
        
        if (!initialEdges.some(e => e.id === edgeId)) {
          initialEdges.push({
            id: edgeId,
            source: sourceId,
            target: targetId,
            targetHandle: `target-${childEmail}`,
            type: 'custom',
            animated: viewMode === 'all' ? false : isActive,
            zIndex: isActive ? 10 : 0,
            markerEnd: { type: MarkerType.ArrowClosed },
            data: { isBlue: isActive, offsetLevel, isReverse }
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
    const isLeaf = !hasOutgoing.has(node.id);
    const isRoot = !hasIncoming.has(node.id);
    node.data.isRoot = isRoot;
    node.data.isLeaf = isLeaf;
    
    const generateRole = (rawPerson: any, hasSpouse: boolean) => {
      const isFemale = rawPerson[CSV_COLUMNS.GENDER]?.toLowerCase() === 'female';
      if (!isLeaf) {
        return isFemale ? 'Mother' : 'Father';
      } else if (hasSpouse) {
        return isFemale ? 'Wife' : 'Husband';
      } else if (isRoot) {
        return isFemale ? 'Female' : 'Male';
      } else {
        return isFemale ? 'Daughter' : 'Son';
      }
    };

    node.data.role = generateRole(node.data.raw, !!node.data.spouse);
    if (node.data.spouse) {
      node.data.spouse.role = generateRole(node.data.spouse.raw, true);
    }
  });

  return { nodes: initialNodes, edges: initialEdges };
};
