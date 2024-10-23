import styles from './styles.module.scss';

export default function AlignmentGuide({
  position,
  orientation,
}: {
  position: number;
  orientation: 'horizontal' | 'vertical';
}) {
  return (
    <svg className={styles.wrapper}>
      <line
        className={styles.line}
        x1={orientation === 'vertical' ? position : 0}
        y1={orientation === 'vertical' ? 0 : position}
        x2={orientation === 'vertical' ? position : '100vw'}
        y2={orientation === 'vertical' ? '100vh' : position}
      />
    </svg>
  );
}
