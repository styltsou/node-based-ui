import React, { useState, ReactNode } from 'react';
import ReactDOM from 'react-dom';

const Portal = ({ id, children }: { id: string; children: ReactNode }) => {
  const [hostElement, setHostElement] = useState<HTMLElement | null>(null);

  React.useEffect(() => {
    const elm: HTMLElement | null = id
      ? document.querySelector(`#${id}`)
      : document.createElement('div');

    if (!elm) {
      return;
    }

    setHostElement(elm);

    if (!id) {
      document.body.appendChild(elm);
    }

    return () => {
      if (!id) {
        // In development, this error often masks other errors when a
        // hot reload occurs. We can safely ignore this.
        try {
          document.body.removeChild(elm);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
        } catch (err: unknown) {}
      }
    };
  }, [id]);

  if (!hostElement) {
    return null;
  }

  return ReactDOM.createPortal(children, hostElement);
};

export default Portal;
