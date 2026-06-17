import type { AppState, AppStep, SlotImage, SlotTransform } from '../types';

export type Action =
  | { type: 'selectFrame'; frameId: string; slotCount: number }
  | { type: 'goto'; step: AppStep }
  | { type: 'setSlotImage'; index: number; image: SlotImage }
  | { type: 'clearSlotImage'; index: number }
  | { type: 'updateSlotTransform'; index: number; transform: SlotTransform }
  | { type: 'setActiveSlot'; index: number }
  | { type: 'reset' };

export const initialState: AppState = {
  step: 'home',
  frameId: null,
  slotImages: [],
  activeSlot: 0,
};

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'selectFrame':
      return {
        step: 'capture',
        frameId: action.frameId,
        slotImages: Array(action.slotCount).fill(null),
        activeSlot: 0,
      };

    case 'goto':
      return { ...state, step: action.step };

    case 'setSlotImage': {
      const next = state.slotImages.slice();
      next[action.index] = action.image;
      return { ...state, slotImages: next };
    }

    case 'clearSlotImage': {
      const next = state.slotImages.slice();
      next[action.index] = null;
      return { ...state, slotImages: next };
    }

    case 'updateSlotTransform': {
      const current = state.slotImages[action.index];
      if (!current) return state;
      const next = state.slotImages.slice();
      next[action.index] = { ...current, transform: action.transform };
      return { ...state, slotImages: next };
    }

    case 'setActiveSlot':
      return { ...state, activeSlot: action.index };

    case 'reset':
      return initialState;

    default:
      return state;
  }
}
