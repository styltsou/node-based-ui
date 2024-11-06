import styles from './styles.module.scss';

import ExportButton from './export-button';
import ImportButton from './import-button';

import EdgeTypeSelector from './edge-type-selector';
import ResetControls from './reset-controls';

import useBoardStore from '../../store';

export default function TopBar() {
  const nodes = useBoardStore(s => s.nodes);
  const renderedNodes = useBoardStore(s => s.renderedNodes);
  const edges = useBoardStore(s => s.edges);
  const renderedEdges = useBoardStore(s => s.renderedEdges);

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <ImportButton />
        <ExportButton />
        <EdgeTypeSelector />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          Total nodes: {nodes.length}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          Rendered nodes: {renderedNodes.length}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          Total edges: {edges.length}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          Rendered edges: {renderedEdges.length}
        </div>
      </div>
      <ResetControls />
    </div>
  );
}
