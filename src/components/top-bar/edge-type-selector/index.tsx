import React from 'react';

import styles from './styles.module.scss';
import useBoardStore from '../../../store';
import { EdgeType } from '../../../types';

const EdgeTypeSelector: React.FC = () => {
  const globalEdgeType = useBoardStore(s => s.globalEdgeType);
  const setGlobalEdgeType = useBoardStore(s => s.setGlobalEdgeType);
  const saveLocalState = useBoardStore(s => s.saveLocalState);

  const edgeTypes = [
    {
      type: null,
      label: 'Default',
    },
    {
      type: EdgeType.Straight,
      label: 'Straight',
    },
    {
      type: EdgeType.Step,
      label: 'Step',
    },
    {
      type: EdgeType.SmoothStep,
      label: 'Smoothstep',
    },
    {
      type: EdgeType.Bezier,
      label: 'Bezier',
    },
  ];

  const handleEdgeTypeChange = (type: EdgeType | null) => {
    setGlobalEdgeType(type);
    saveLocalState();
  };

  return (
    <div className={styles.edgeTypeSelector}>
      {edgeTypes.map(({ type, label }) => (
        <button
          key={label}
          className={globalEdgeType === type ? styles.active : ''}
          onClick={() => handleEdgeTypeChange(type)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default EdgeTypeSelector;
