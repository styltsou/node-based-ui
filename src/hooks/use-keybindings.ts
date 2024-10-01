import { useEffect, useRef } from 'react';

interface KeyBinding {
  cmd: string[];
  callback: () => void;
  cleanup?: () => void;
}

export const useKeybindings = (props: KeyBinding[]) => {
  const currentlyPressedKeys = new Set();
  const isKeystrokeRepeat = useRef(false);

  const areAllKeyPressed = (keys: string[]) => {
    for (const key of keys) {
      if (!currentlyPressedKeys.has(key)) return false;
    }

    return true;
  };

  const bindingsKeyDown = (e: KeyboardEvent) => {
    currentlyPressedKeys.add(e.key);

    props.forEach(binding => {
      if (areAllKeyPressed(binding.cmd) && !isKeystrokeRepeat.current) {
        binding.callback();
        isKeystrokeRepeat.current = true;
      }
    });
  };

  const bindingsKeyUp = (e: KeyboardEvent) => {
    isKeystrokeRepeat.current = false;

    props.forEach(binding => {
      if (
        areAllKeyPressed(binding.cmd) &&
        typeof binding.cleanup === 'function'
      )
        binding.cleanup();

      currentlyPressedKeys.delete(e.key);
    });
  };

  useEffect(() => {
    document.addEventListener('keydown', bindingsKeyDown);
    document.addEventListener('keyup', bindingsKeyUp);
    return () => {
      isKeystrokeRepeat.current = false;
      document.removeEventListener('keydown', bindingsKeyDown);
      document.removeEventListener('keyup', bindingsKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
