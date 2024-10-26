import { useState, useRef, useEffect } from 'react';
import styles from './styles.module.scss';

import { IconDownload } from '@tabler/icons-react';

import { Modal } from '../../primitives/modal';
import { useModal } from '../../primitives/modal/use-modal';

import useBoardStore from '../../../store';
import useEdgeVisualizationStore from '../../../store/edgeVisualizationStore';
import cn from '../../../utils/cn';
import { EXPORT_FILENAME_PREFIX } from '../../../constants';

const EXPORT_MODAL_ID = 'export-modal';

export default function ExportButton() {
  const position = useBoardStore(s => s.position);
  const zoom = useBoardStore(s => s.zoom);
  const nodes = useBoardStore(s => s.nodes);
  const edges = useBoardStore(s => s.edges);

  const isEdgeVisualizationActive = !!useEdgeVisualizationStore(
    s => s.selectedEdgeId
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const { open: openModal, close: closeModal } = useModal();

  const [exportFileName, setExportFileName] = useState('');
  const [hasError, setHasError] = useState(false);

  const onModalOpen = () => {
    setExportFileName(
      `${EXPORT_FILENAME_PREFIX}-${new Date().toISOString().split('T')[0]}.json`
    );
    inputRef.current?.select();
  };

  const handleExportSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (hasError) return;

    const data = { position, zoom, nodes, edges };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFileName;
    link.click();

    closeModal(EXPORT_MODAL_ID);
    setExportFileName('');
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCancelExport = () => {
    closeModal(EXPORT_MODAL_ID);
  };

  // Handle form validation
  useEffect(() => {
    if (exportFileName.trim() === '') {
      setHasError(true);
    } else {
      setHasError(false);
    }
  }, [exportFileName]);

  return (
    <>
      <button
        className={styles.exportButton}
        onClick={() => openModal(EXPORT_MODAL_ID)}
        disabled={nodes.length === 0 || isEdgeVisualizationActive}
      >
        Export
        <IconDownload size={18} stroke={1.5} />
      </button>
      <Modal
        id={EXPORT_MODAL_ID}
        position="top"
        className={styles.modal}
        onOpen={onModalOpen}
      >
        <h1 className={styles.title}>New export</h1>
        <form className={styles.form} onSubmit={handleExportSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={exportFileName}
            onChange={e => setExportFileName(e.target.value)}
            className={cn(styles.input, hasError && styles.error)}
          />
          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleCancelExport}
              className={styles.secondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={hasError}
              className={styles.primary}
            >
              Export
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
