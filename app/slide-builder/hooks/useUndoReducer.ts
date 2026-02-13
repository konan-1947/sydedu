import { useReducer, useCallback, useMemo } from "react";

const MAX_HISTORY = 50;
const SKIP_ACTIONS = new Set(["SET_PHASE", "SET_ACTIVE", "RESET"]);

interface UndoState<S> {
  past: S[];
  present: S;
  future: S[];
}

type UndoAction<A> = A | { type: "__UNDO__" } | { type: "__REDO__" };

export function useUndoReducer<S, A extends { type: string }>(
  reducer: (state: S, action: A) => S,
  initialState: S
) {
  const undoReducer = useCallback(
    (state: UndoState<S>, action: UndoAction<A>): UndoState<S> => {
      if ((action as { type: string }).type === "__UNDO__") {
        if (state.past.length === 0) return state;
        const previous = state.past[state.past.length - 1];
        return {
          past: state.past.slice(0, -1),
          present: previous,
          future: [state.present, ...state.future],
        };
      }

      if ((action as { type: string }).type === "__REDO__") {
        if (state.future.length === 0) return state;
        const next = state.future[0];
        return {
          past: [...state.past, state.present],
          present: next,
          future: state.future.slice(1),
        };
      }

      const a = action as A;
      const newPresent = reducer(state.present, a);
      if (newPresent === state.present) return state;

      if (SKIP_ACTIONS.has(a.type)) {
        return { ...state, present: newPresent };
      }

      return {
        past: [...state.past.slice(-MAX_HISTORY + 1), state.present],
        present: newPresent,
        future: [],
      };
    },
    [reducer]
  );

  const [state, rawDispatch] = useReducer(undoReducer, {
    past: [],
    present: initialState,
    future: [],
  });

  const undo = useCallback(() => rawDispatch({ type: "__UNDO__" } as UndoAction<A>), []);
  const redo = useCallback(() => rawDispatch({ type: "__REDO__" } as UndoAction<A>), []);

  const dispatch = useCallback(
    (action: A) => rawDispatch(action as UndoAction<A>),
    []
  );

  const helpers = useMemo(
    () => ({
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
    }),
    [state.past.length, state.future.length]
  );

  return { state: state.present, dispatch, undo, redo, ...helpers };
}
