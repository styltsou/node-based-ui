import { v4 as uuidv4 } from 'uuid';
import useBoardStore from '../../store';
import AlignmentGuide from './guide';

export default function AlignmentGuides() {
  const alignmentGuides = useBoardStore(state => state.alignmentGuides);

  return (
    alignmentGuides.length !== 0 &&
    alignmentGuides.map(guide => (
      <AlignmentGuide
        key={uuidv4()}
        position={guide.position}
        orientation={guide.orientation}
      />
    ))
  );
}
