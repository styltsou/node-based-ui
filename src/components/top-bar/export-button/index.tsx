import styles from './styles.module.scss';

import { IconDownload } from '@tabler/icons-react';

import useBoardStore from '../../../store';
import { EXPORT_FILENAME_PREFIX } from '../../../constants';

export default function ExportButton() {
  const position = useBoardStore(s => s.position);
  const zoom = useBoardStore(s => s.zoom);
  const nodes = useBoardStore(s => s.nodes);
  const edges = useBoardStore(s => s.edges);

  const hasData = nodes.length > 0;

  const handleExport = () => {
    const data = { position, zoom, nodes, edges };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${EXPORT_FILENAME_PREFIX}-${
      new Date().toISOString().split('T')[0]
    }.json`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      className={styles.button}
      onClick={handleExport}
      disabled={!hasData}
    >
      Export
      <IconDownload size={18} stroke={1.5} />
    </button>
  );
}
