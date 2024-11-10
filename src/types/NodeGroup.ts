export interface NodeGroup {
  id: string;
  label: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  nodeIds: string[];
  color: string;
  isLocked: boolean;
}
