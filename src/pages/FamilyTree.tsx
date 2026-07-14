import { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, { Background, Controls, ConnectionLineType, useNodesState, useEdgesState } from 'reactflow';
import { Menu } from 'lucide-react';
import 'reactflow/dist/style.css';

import PersonDropdown from '../components/PersonDropdown';
import PersonNode from '../components/PersonNode';
import InfoModal from '../components/InfoModal';
import { fetchFamilyData } from '../services/familyDataService';
import { calculateGraph } from '../utils/graphAlgorithms';
import { getLayoutedElements } from '../utils/layoutEngine';

const nodeTypes = {
  person: PersonNode,
};

export default function FamilyTree() {
  const [people, setPeople] = useState<any[]>([]);
  const [personA, setPersonA] = useState<any>(null);
  const [personB, setPersonB] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<'original' | 'spouse' | 'all'>('original');
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [bounds, setBounds] = useState<any>();
  
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as globalThis.Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchFamilyData().then(data => {
      setPeople(data);
      setLoading(false);
    });
  }, []);

  const buildGraph = useCallback(() => {
    const { nodes: initNodes, edges: initEdges } = calculateGraph(people, personA, personB, viewMode, setModalData);
    if (initNodes.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges, bounds: layoutBounds } = getLayoutedElements(initNodes, initEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setBounds(layoutBounds);
    } else {
      setNodes([]);
      setEdges([]);
      setBounds(undefined);
    }
  }, [personA, personB, people, viewMode, setNodes, setEdges]);

  useEffect(() => {
    buildGraph();
  }, [buildGraph]);

  if (loading) return <div className="h-[90dvh] flex items-center justify-center text-slate-500 font-medium tracking-wide">Loading family database...</div>;

  return (
    <div className="flex flex-col w-full bg-slate-50 dark:bg-slate-950 pb-12">
      
      <div className="flex gap-6 flex-wrap justify-center p-6 z-[60] relative shrink-0">
        <PersonDropdown label="Select Person A" people={people} selectedPerson={personA} onSelect={setPersonA} />
        <PersonDropdown label="Select Person B" people={people} selectedPerson={personB} onSelect={setPersonB} />
      </div>

      <div className="w-full flex justify-center px-4 relative">
        <div 
          className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl w-[90%] md:w-[80%] ring-1 ring-black/5 dark:ring-white/5"
          style={{ height: '90vh' }}
        >
          
          <div ref={menuRef} className="absolute top-5 right-5 z-[40]">
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 cursor-pointer text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Menu size={20} />
            </button>
            
            {menuOpen && (
              <div className="absolute top-[calc(100%+0.5rem)] right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-2 min-w-[260px] flex flex-col shadow-2xl">
                <button onClick={() => { setViewMode('original'); setMenuOpen(false); }} className={`px-4 py-3 text-left rounded-xl cursor-pointer text-sm font-semibold transition-colors ${viewMode === 'original' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>Original View (Default)</button>
                <button onClick={() => { setViewMode('spouse'); setMenuOpen(false); }} className={`px-4 py-3 text-left rounded-xl cursor-pointer text-sm font-semibold transition-colors ${viewMode === 'spouse' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>Show Spouse at All Nodes</button>
                <button onClick={() => { setViewMode('all'); setMenuOpen(false); }} className={`px-4 py-3 text-left rounded-xl cursor-pointer text-sm font-semibold transition-colors ${viewMode === 'all' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>Show all the family chain</button>
              </div>
            )}
          </div>

          {nodes.length > 0 ? (
            <ReactFlow 
              key={`${personA?.Email || ''}-${personB?.Email || ''}-${viewMode}`}
              nodes={nodes} 
              edges={edges} 
              onNodesChange={onNodesChange} 
              onEdgesChange={onEdgesChange} 
              nodeTypes={nodeTypes} 
              connectionLineType={ConnectionLineType.SmoothStep} 
              fitView 
              minZoom={0.1} 
              nodesDraggable={false} 
              translateExtent={bounds as any}
            >
              <Background color="currentColor" className="text-slate-300 dark:text-slate-700" gap={24} size={1.5} />
              <Controls className="!bg-white/80 dark:!bg-slate-900/80 backdrop-blur-md !border-slate-200 dark:!border-slate-700 !rounded-xl !overflow-hidden shadow-lg !m-6 [&>button]:!border-slate-200 dark:[&>button]:!border-slate-700 [&>button]:dark:!bg-slate-900 [&>button]:dark:!fill-slate-300" />
            </ReactFlow>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-medium">
              {personA && personB ? 'No relationship path found between the selected people.' : 'Select two people to see their relationship.'}
            </div>
          )}
        </div>
      </div>

      <InfoModal modalData={modalData} setModalData={setModalData} people={people} />
    </div>
  );
}
