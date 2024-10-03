import type { Edge } from '../../types';
import styles from './styles.module.scss';
// import useBoardStore from '../../store';

export default function Edge({ edge }: { edge: Edge }) {
  console.log(edge);

  const d = '';

  return (
    <svg className={styles.svg}>
      <path className={styles.path} d={d} />
    </svg>
  );
}
