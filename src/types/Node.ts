export interface Node {
  id: string;
  type: string;
  isLocked: boolean;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  data?: Record<string, unknown>;
}
