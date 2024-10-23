import { MouseInfoProvider } from '@faceless-ui/mouse-info';
import InfiniteCanvas from './components/infinite-canvas';
import TopBar from './components/top-bar';
import ViewControls from './components/view-controls';
import OrthogonalRoutingRender from './components/orthogonal-routing-render';
function App() {
  return (
    <MouseInfoProvider>
      <TopBar />
      <InfiniteCanvas />
      <OrthogonalRoutingRender />
      <ViewControls />
    </MouseInfoProvider>
  );
}

export default App;
