import { MouseInfoProvider } from '@faceless-ui/mouse-info';
import InfiniteCanvas from './components/infinite-canvas';
import Toolbar from './components/toolbar';

function App() {
  return (
    <MouseInfoProvider>
      <main>
        <InfiniteCanvas />
        <Toolbar />
      </main>
    </MouseInfoProvider>
  );
}

export default App;
