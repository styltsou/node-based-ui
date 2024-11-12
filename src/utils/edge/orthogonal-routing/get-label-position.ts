import { Point } from '../../../types';

type Segment = { start: Point; end: Point; length: number };

const MIN_ACCEPTABLE_LENGTH = 25; // Adjust this threshold as needed

export default function getLabelPosition(points: Point[]): Point {
  if (points.length < 2) {
    throw new Error('Need at least 2 points');
  }

  // First convert points into segments
  const segments: Segment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    const length = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );
    segments.push({ start, end, length });
  }

  if (segments.length % 2 === 1) {
    // Odd number of segments
    const middleSegmentIndex = Math.floor(segments.length / 2);
    const middleSegment = segments[middleSegmentIndex];

    if (middleSegment.length >= MIN_ACCEPTABLE_LENGTH) {
      return {
        x: (middleSegment.start.x + middleSegment.end.x) / 2,
        y: (middleSegment.start.y + middleSegment.end.y) / 2,
      };
    }
  } else {
    // Even number of segments
    const middleIndex1 = segments.length / 2 - 1;
    const middleIndex2 = segments.length / 2;

    const segment1 = segments[middleIndex1];
    const segment2 = segments[middleIndex2];

    const chosenSegment =
      segment1.length >= segment2.length ? segment1 : segment2;

    if (chosenSegment.length >= MIN_ACCEPTABLE_LENGTH) {
      return {
        x: (chosenSegment.start.x + chosenSegment.end.x) / 2,
        y: (chosenSegment.start.y + chosenSegment.end.y) / 2,
      };
    }
  }

  // Fallback to longest segment if middle segment(s) are too small
  const longestSegment = segments.reduce(
    (max, segment) => (segment.length > max.length ? segment : max),
    segments[0]
  );

  return {
    x: (longestSegment.start.x + longestSegment.end.x) / 2,
    y: (longestSegment.start.y + longestSegment.end.y) / 2,
  };
}
