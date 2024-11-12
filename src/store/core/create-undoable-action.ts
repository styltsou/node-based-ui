// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { Action, UndoableAction, ArgumentTypes, StateUpdater } from './types';

// // Generic function to create an undoable action
// export function createUndoableAction<
//   State,
//   Actions extends Record<string, Action<never[]>>,
//   T extends keyof Actions
// >(stateUpdater: StateUpdater<State, Actions>) {
//   return (set: any, get: any): Actions[T] =>
//     ((...args: ArgumentTypes<Actions[T]>) => {
//       const currentState = get();
//       const newPartialState = stateUpdater(currentState, ...args);

//       const undoableAction: UndoableAction<T & string, State> = {
//         type: stateUpdater.name as T & string,
//         undo: currentState,
//         redo: newPartialState,
//       };

//       set((state: State) => ({
//         ...state,
//         ...newPartialState,
//         undoStack: [...(state as any).undoStack, undoableAction],
//         redoStack: [], // Clear redo stack when a new action is performed
//       }));
//     }) as Actions[T];
// }
