import { Toaster } from 'sonner';

import { ModalProvider } from './components/primitives/modal/context';
import { ConfirmationDialogProvider } from './components/confirmation-dialog';

import InfiniteCanvas from './components/infinite-canvas';
import TopBar from './components/top-bar';
import ViewControls from './components/view-controls';
import VisualizationControls from './components/edge-routing-visualization/controls';

function App() {
  return (
    <ModalProvider>
      <ConfirmationDialogProvider>
        <Toaster
          position="top-center"
          duration={2500}
          offset={22}
          closeButton
          pauseWhenPageIsHidden={true}
          toastOptions={{
            classNames: {
              toast: 'toast',
              error: 'toast-error',
              actionButton: 'toast-action-button',
              closeButton: 'toast-close-button',
            },
          }}
        />
        <TopBar />
        <InfiniteCanvas />
        <ViewControls />
        <VisualizationControls />
      </ConfirmationDialogProvider>
    </ModalProvider>
  );
}

export default App;
