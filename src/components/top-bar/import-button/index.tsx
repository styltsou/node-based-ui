import React, { useRef } from 'react';
import { z } from 'zod';
import { IconUpload } from '@tabler/icons-react';
import { toast } from 'sonner';

import { ImportSchema } from '../../../schemas';
import useBoardStore from '../../../store';
import useEdgeVisualizationStore from '../../../store/edgeVisualizationStore';

//  TODO: This is bad, create  reusable styled buttons
import styles from './styles.module.scss'; // Use the same styles as ExportButton

const ImportButton: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const zoom = useBoardStore(s => s.zoom);
  const position = useBoardStore(s => s.position);
  const nodes = useBoardStore(s => s.nodes);
  const edges = useBoardStore(s => s.edges);
  const importData = useBoardStore(s => s.importData);

  const isEdgeVisualizationActive = !!useEdgeVisualizationStore(
    s => s.selectedEdgeId
  );

  const previousDataRef = useRef<z.infer<typeof ImportSchema> | null>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const jsonContent = JSON.parse(e.target?.result as string);
          const validatedData = ImportSchema.parse(jsonContent);

          previousDataRef.current = {
            position,
            zoom,
            nodes,
            edges,
          };

          importData(validatedData);

          toast.success('Imported data successfully', {
            action: {
              label: 'Undo',
              onClick: () => {
                if (previousDataRef.current) {
                  importData(previousDataRef.current);
                  previousDataRef.current = null;
                }
              },
            },
          });
        } catch (error) {
          if (error instanceof z.ZodError) {
            toast.error('Invalid import data');
          } else {
            toast.error('Error parsing JSON file');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <button
        className={styles.importButton}
        onClick={handleImportClick}
        disabled={isEdgeVisualizationActive}
      >
        Import
        <IconUpload size={18} stroke={1.5} />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="application/json"
        onChange={handleFileChange}
      />
    </>
  );
};

export default ImportButton;
