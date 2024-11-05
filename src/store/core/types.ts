import { StateCreator } from 'zustand';

// Generic type for simple actions (not undoable)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Action<Args extends any[] = []> = (...args: Args) => void;

// Generic type for an undoable action
export type UndoableAction<T extends string> = {
  type: T;
  payload: ArgumentTypes<Action>;
};

// TODO: I could replace any with void as most probably all the state actions will return void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ArgumentTypes<T> = T extends (...args: infer U) => any ? U : never;

// Generic type for a state updater
export type StateUpdater<S, A extends Record<string, Action>> = <
  T extends keyof A
>(
  state: S,
  ...args: ArgumentTypes<A[T]>
) => Partial<S>;

export type UndoRedoState<T extends string, S> = {
  undoStack: { action: UndoableAction<T>; prevState: Partial<S> }[];
  redoStack: { action: UndoableAction<T>; prevState: Partial<S> }[];
};

// Type for the undo/redo methods
export type UndoRedoMethods = {
  undo: () => void;
  redo: () => void;
};

export type WithUndoRedo<T extends string, S> = S &
  UndoRedoState<T, S> &
  UndoRedoMethods;

// Middleware type

export function createUndoableSlice<
  S extends object,
  A extends Record<string, Action>
>(stateUpdater: StateUpdater<S, A>) {
  return <T extends keyof A>(
    set: (
      partial:
        | Partial<WithUndoRedo<T & string, S>>
        | ((
            state: WithUndoRedo<T & string, S>
          ) => Partial<WithUndoRedo<T & string, S>>),
      replace?: boolean
    ) => void,
    get: () => WithUndoRedo<T & string, S>
  ): A[T] =>
    ((...args: ArgumentTypes<A[T]>) => {
      const currentState = get();
      const newPartialState = stateUpdater(currentState, ...args);

      const undoableAction: UndoableAction<T & string> = {
        type: stateUpdater.name as T & string,
        payload: args,
      };

      set(state => ({
        ...state,
        ...(newPartialState as Partial<S>),
        undoStack: [
          ...state.undoStack,
          { action: undoableAction, prevState: currentState },
        ],
        redoStack: [],
      }));
    }) as A[T];
}

export type UndoRedoMiddleware = <T extends string, S extends object>(config?: {
  limit?: number;
}) => (
  f: StateCreator<WithUndoRedo<T, S>, [], []>
) => StateCreator<WithUndoRedo<T, S>, [], []>;

export const undoRedoMiddleware: UndoRedoMiddleware =
  (config = { limit: 10 }) =>
  <T extends string, S extends object>(
    f: StateCreator<WithUndoRedo<T, S>, [], []>
  ): StateCreator<WithUndoRedo<T, S>, [], []> =>
  (set, get, api) => {
    const limitStack = (stack: unknown[]) =>
      stack.slice(-(config?.limit || 10));

    return {
      ...f(
        partial => {
          const newPartial =
            typeof partial === 'function'
              ? (state: WithUndoRedo<T, S>) =>
                  partial(state) as WithUndoRedo<T, S>
              : partial;
          set(newPartial as WithUndoRedo<T, S>, false);
        },
        get,
        api
      ),
      undoStack: [],
      redoStack: [],
      undo: () => {
        const state = get();
        const { undoStack, redoStack } = state;

        if (undoStack.length === 0) return;

        const lastUndo = undoStack[undoStack.length - 1];
        const newUndoStack = undoStack.slice(0, -1);

        set({
          ...state,
          ...lastUndo.prevState,
          undoStack: newUndoStack,
          redoStack: limitStack([
            ...redoStack,
            {
              action: lastUndo.action,
              prevState: state,
            },
          ]),
        });
      },
      redo: () => {
        const state = get();
        const { undoStack, redoStack } = state;

        if (redoStack.length === 0) return;

        const lastRedo = redoStack[redoStack.length - 1];
        const newRedoStack = redoStack.slice(0, -1);

        set({
          ...state,
          ...lastRedo.prevState,
          redoStack: newRedoStack,
          undoStack: limitStack([
            ...undoStack,
            {
              action: lastRedo.action,
              prevState: state,
            },
          ]),
        });
      },
    };
  };
