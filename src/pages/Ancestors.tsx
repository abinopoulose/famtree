import { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, { Background, Controls, ConnectionLineType, useNodesState, useEdgesState } from 'reactflow';
import { Upload, RefreshCw, X } from 'lucide-react';
import 'reactflow/dist/style.css';

import PersonDropdown from '../components/PersonDropdown';
import PersonNode from '../components/PersonNode';
import CustomEdge from '../components/CustomEdge';
import InfoModal from '../components/InfoModal';
import { fetchFamilyData, parseCSVString } from '../services/familyDataService';
import { calculateAncestorsGraph } from '../utils/ancestorAlgorithms';
import { getLayoutedElements } from '../utils/layoutEngine';

const nodeTypes = {
  person: PersonNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

export default function Ancestors() {
  const [people, setPeople] = useState<any[]>([]);
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState<any>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [showDataModal, setShowDataModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFetchDefault = async () => {
    setLoading(true);
    setShowDataModal(false);
    const data = await fetchFamilyData(true);
    setPeople(data);
    setPerson(null);
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvString = event.target?.result as string;
      if (csvString) {
        setLoading(true);
        setShowDataModal(false);
        const data = await parseCSVString(csvString);
        setPeople(data);
        setPerson(null);
        setLoading(false);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    fetchFamilyData().then(data => {
      setPeople(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (showDataModal) document.body.classList.add('modal-open');
    else document.body.classList.remove('modal-open');
    return () => { document.body.classList.remove('modal-open'); };
  }, [showDataModal]);

  const buildGraph = useCallback(() => {
    console.log('[Ancestors] Building graph for:', person?.Name, person?.Email);
    const { nodes: initNodes, edges: initEdges } = calculateAncestorsGraph(people, person, setModalData);
    console.log('[Ancestors] Raw nodes from calculateAncestorsGraph:', initNodes.length, initNodes);
    console.log('[Ancestors] Raw edges from calculateAncestorsGraph:', initEdges.length, initEdges);

    if (initNodes.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initNodes, initEdges);
      console.log('[Ancestors] Layouted nodes:', layoutedNodes.length, layoutedNodes);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } else {
      console.log('[Ancestors] No nodes to display');
      setNodes([]);
      setEdges([]);
    }
  }, [people, person, setNodes, setEdges]);

  useEffect(() => {
    buildGraph();
  }, [buildGraph]);

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-12">
      <div className="flex gap-6 flex-wrap justify-center p-6 z-[60] relative shrink-0">
        <PersonDropdown 
          label="Select Person"
          people={people} 
          selectedPerson={person} 
          onSelect={setPerson} 
          placeholder="Select a person..." 
        />
      </div>

      <div className="w-full flex justify-center px-4 relative">
        <div 
          className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl w-[90%] md:w-[80%] ring-1 ring-black/5 dark:ring-white/5"
          style={{ height: '90vh' }}
        >
          <div className="absolute top-5 right-5 z-[40] flex gap-2">
            <button 
              onClick={() => setShowDataModal(true)} 
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 cursor-pointer text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Manage Data"
            >
              <Upload size={20} />
            </button>
          </div>

          {!person ? (
            <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 text-lg font-medium text-center px-6">
              Select a person to trace their lineage backwards through time.
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <ReactFlow
              key={person?.Email || 'empty'}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              connectionLineType={ConnectionLineType.SmoothStep}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.1}
              maxZoom={1.5}
              nodesDraggable={false}
              nodesConnectable={false}
              className="bg-slate-50/50 dark:bg-slate-950/50"
            >
              <Background color="#94a3b8" gap={24} size={1} />
              <Controls className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 fill-slate-700 dark:fill-slate-300" />
            </ReactFlow>
          )}
        </div>
      </div>

      {modalData && (
        <InfoModal modalData={modalData} setModalData={setModalData} people={people} />
      )}

      {showDataModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button 
              onClick={() => setShowDataModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Data Source</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">
              You can fetch the default family tree from the server or upload a custom CSV file to view your own lineage.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleFetchDefault}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-medium transition-colors cursor-pointer"
              >
                <RefreshCw size={18} />
                Fetch Default CSV
              </button>
              
              <div className="relative">
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors pointer-events-none">
                  <Upload size={18} />
                  Upload Custom CSV
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
