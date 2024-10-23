import React, { useRef } from 'react';
import { z } from 'zod';
import { IconUpload } from '@tabler/icons-react';

import { ImportSchema } from '../../../schemas';
import useBoardStore from '../../../store';
//  TODO: This is bad, create  reusable styled buttons
import styles from '../export-button/styles.module.scss'; // Use the same styles as ExportButton

const ImportButton: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importData = useBoardStore(s => s.importData);

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

          importData(validatedData);
        } catch (error) {
          if (error instanceof z.ZodError) {
            console.error('Invalid import data:', error.errors);
            //TODO: show an error message to the user
          } else {
            console.error('Error parsing JSON file:', error);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <button className={styles.button} onClick={handleImportClick}>
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
