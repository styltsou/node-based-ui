import { MouseInfoProvider } from '@faceless-ui/mouse-info';
import InfiniteCanvas from './components/infinite-canvas';
import Toolbar from './components/toolbar';
import ViewControls from './components/view-controls';

function App() {
  return (
    <MouseInfoProvider>
      {/* <main> */}
      <InfiniteCanvas />
      <Toolbar />
      <ViewControls />
      {/* </main> */}
    </MouseInfoProvider>
  );
}

export default App;
