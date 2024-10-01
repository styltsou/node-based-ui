import { useEffect } from 'react';

export const useCustomZoom = (callback: (e: WheelEvent) => void) => {
  function mouseWheelHandler(e: WheelEvent) {
    if (e.ctrlKey == true) {
      e.preventDefault();
      callback(e);
    }
  }

  useEffect(() => {
    document.addEventListener('wheel', mouseWheelHandler, { passive: false });
    return () => document.removeEventListener('wheel', mouseWheelHandler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
