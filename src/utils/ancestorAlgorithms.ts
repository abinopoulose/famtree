import { MarkerType, type Node, type Edge } from 'reactflow';
import { CSV_COLUMNS } from '../constants';
import { getAvatarFallback } from './graphAlgorithms';

export const calculateAncestorsGraph = (people: any[], targetPerson: any, onInfoClick: (data: any) => void) => {
  if (!targetPerson) return { nodes: [], edges: [] };

  const peopleMap = new Map();
  people.forEach(p => peopleMap.set(p[CSV_COLUMNS.EMAIL], p));

  const ancestorEmails = new Set<string>();
  const depths = new Map<string, number>();
  const queue: [string, number][] = [[targetPerson[CSV_COLUMNS.EMAIL], 0]];

  // BFS to find all ancestors and compute generation depths
  while (queue.length > 0) {
    const [curr, depth] = queue.shift()!;
    if (ancestorEmails.has(curr)) continue;
    
    ancestorEmails.add(curr);
    depths.set(curr, depth);

    const p = peopleMap.get(curr);
    if (!p) continue;

    const parentEmail = p[CSV_COLUMNS.PARENT_EMAIL];
    if (parentEmail && parentEmail !== 'NULL') {
      queue.push([parentEmail, depth - 1]);
      const parentObj = peopleMap.get(parentEmail);
      if (parentObj) {
        const spouseEmail = parentObj[CSV_COLUMNS.SPOUSE_EMAIL];
        if (spouseEmail && spouseEmail !== 'NULL') {
          queue.push([spouseEmail, depth - 1]);
        }
      }
    }
  }
  
  console.log('[Ancestors Algorithm] BFS finished.', {
    ancestorEmails: Array.from(ancestorEmails),
    depths: Object.fromEntries(depths)
  });

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
      isEndpoint: email === targetPerson[CSV_COLUMNS.EMAIL],
      isInPath: true, // All ancestors are in the path by definition
      raw: p,
      depth: depths.get(email) ?? 0,
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
            isEndpoint: spouseEmail === targetPerson[CSV_COLUMNS.EMAIL],
            isInPath: true
          };
        }
      }
    }

    return nodeData;
  };

  const addNode = (email: string, includeSpouse: boolean) => {
    if (renderedNodes.has(email)) return;
    const p = peopleMap.get(email);
    if (!p) return;
    
    const spouseEmail = p[CSV_COLUMNS.SPOUSE_EMAIL];
    // Only include spouse if the spouse is ALSO an ancestor!
    // Since ancestors are added in pairs (the parent and the spouse), 
    // the spouse should be in ancestorEmails.
    const hasSpouse = spouseEmail && spouseEmail !== 'NULL' && peopleMap.has(spouseEmail) && ancestorEmails.has(spouseEmail);
    const willIncludeSpouse = includeSpouse && hasSpouse;

    initialNodes.push({
      id: email,
      type: 'person',
      data: createNodeData(p, willIncludeSpouse),
      position: { x: 0, y: 0 }
    });
    
    renderedNodes.add(email);
    personToNodeId.set(email, email);

    if (willIncludeSpouse) {
      renderedNodes.add(spouseEmail);
      personToNodeId.set(spouseEmail, email);
    }
  };

  // Add all ancestors to the graph
  ancestorEmails.forEach(email => {
    // We group spouses together if both are ancestors. 
    // We can always pass includeSpouse=true because it checks if spouse is in ancestorEmails
    addNode(email, true);
  });

  const sourceToOffset = new Map<string, number>();
  let currentOffset = 0;

  // Build edges
  ancestorEmails.forEach(email => {
    const child = peopleMap.get(email);
    const parentEmail = child?.[CSV_COLUMNS.PARENT_EMAIL];
    
    if (parentEmail && parentEmail !== 'NULL' && ancestorEmails.has(parentEmail)) {
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
      
      const targetId = personToNodeId.get(email);
      
      if (sourceId && targetId && sourceId !== targetId) {
        if (!sourceToOffset.has(sourceId)) {
          // Simple alternating offset since we don't calculate precise depths here
          currentOffset++;
          let offsetLevel = currentOffset % 2 === 1 ? Math.ceil(currentOffset / 2) : -Math.ceil(currentOffset / 2);
          sourceToOffset.set(sourceId, offsetLevel);
        }
        
        const offsetLevel = sourceToOffset.get(sourceId)!;
        const edgeId = `e-${sourceId}-${targetId}`;
        
        if (!initialEdges.some(e => e.id === edgeId)) {
          initialEdges.push({
            id: edgeId,
            source: sourceId,
            target: targetId,
            targetHandle: `target-${email}`,
            type: 'custom',
            animated: true,
            zIndex: 10,
            markerEnd: { type: MarkerType.ArrowClosed },
            data: { isBlue: true, offsetLevel, isReverse: false } // flow from oldest ancestor down to target
          });
        }
      }
    }
  });

  // Assign roles based on graph structure
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
