import React from 'react';
import styles from './styles.module.scss';

import ExportButton from './export-button';
import ImportButton from './import-button';

import EdgeTypeSelector from './edge-type-selector';
import ResetControls from './reset-controls';
const TopBar: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <ImportButton />
        <ExportButton />
        <EdgeTypeSelector />
      </div>
      <ResetControls />
    </div>
  );
};

export default TopBar;
