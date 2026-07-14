import { calculateAncestorsGraph } from './src/utils/ancestorAlgorithms.ts';
import fs from 'fs';
import Papa from 'papaparse';

const csv = fs.readFileSync('./public/data.csv', 'utf-8');
const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true }).data;

// Pick a person, e.g. "Sophia White"
const person = parsed.find((p: any) => p.Name === 'Sophia White');
if (!person) {
  console.log('Person not found');
  process.exit(1);
}

const { nodes, edges } = calculateAncestorsGraph(parsed, person, () => {});
console.log('NODES:', nodes.length);
console.log('EDGES:', edges.length);
nodes.forEach(n => console.log('Node:', n.id, n.data.name, 'Depth:', n.data.depth));
edges.forEach(e => console.log('Edge:', e.source, '->', e.target));
