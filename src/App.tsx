import { MouseInfoProvider } from '@faceless-ui/mouse-info';
import InfiniteCanvas from './components/infinite-canvas';
import TopBar from './components/top-bar';
import ViewControls from './components/view-controls';

import VisualizationControls from './components/edge-routing-visualization/controls';

function App() {
  return (
    <MouseInfoProvider>
      <TopBar />
      <InfiniteCanvas />
      <ViewControls />
      <VisualizationControls />
    </MouseInfoProvider>
  );
}

export default App;
