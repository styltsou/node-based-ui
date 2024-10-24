import { MouseInfoProvider } from '@faceless-ui/mouse-info';
import { Toaster } from 'sonner';

import InfiniteCanvas from './components/infinite-canvas';
import TopBar from './components/top-bar';
import ViewControls from './components/view-controls';

import VisualizationControls from './components/edge-routing-visualization/controls';

function App() {
  return (
    <MouseInfoProvider>
      <Toaster position="top-center" />
      <TopBar />
      <InfiniteCanvas />
      <ViewControls />
      <VisualizationControls />
    </MouseInfoProvider>
  );
}

export default App;
