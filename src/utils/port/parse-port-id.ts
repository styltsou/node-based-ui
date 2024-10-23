import { PortPlacement } from '../../types';

// Port ids have the following format: port-nodeId-placement
export default function parsePortId(portId: string): {
  nodeId: string;
  portPlacement: PortPlacement;
} {
  const portPlacement = portId.split('-')[portId.split('-').length - 1];

  const nodeId = portId.replace(`-${portPlacement}`, '').replace('port-', '');

  return { nodeId, portPlacement: portPlacement as PortPlacement };
}
