import styles from './styles.module.scss';
import cn from '../../utils/cn';

interface BackgroundProps {
  canvasPosition: { x: number; y: number };
  canvasZoom: number;
  type?: 'grid' | 'dots' | 'paper';
}

export default function Background({
  canvasPosition,
  canvasZoom,
  type = 'dots',
}: BackgroundProps) {
  const backgroundStyle = {
    backgroundPosition: `${canvasPosition.x}px ${canvasPosition.y}px`,
    backgroundSize: `${20 * canvasZoom}px ${20 * canvasZoom}px`,
  };

  return (
    <div
      className={cn(styles.background, type && styles[type])}
      style={backgroundStyle}
    ></div>
  );
}
