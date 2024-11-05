import styles from './styles.module.scss';

import ExportButton from './export-button';
import ImportButton from './import-button';

import EdgeTypeSelector from './edge-type-selector';
import ResetControls from './reset-controls';

import useBoardStore from '../../store';

export default function TopBar() {
  const { nodes } = useBoardStore();

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
          Rendered nodes: {nodes.length}
        </div>
      </div>
      <ResetControls />
    </div>
  );
}
