import { create } from 'zustand';

const useGameStore = create((set) => ({
  // UI state
  ui: {
    isPokedexOpen: false,
    isBagOpen: false,
    isDetailOpen: false,
    selectedPokemon: null,
  },

  // Actions
  togglePokedex: () => set((state) => ({ ui: { ...state.ui, isPokedexOpen: !state.ui.isPokedexOpen } })),

  openDetail: (pokemon) => set((state) => ({ ui: { ...state.ui, isDetailOpen: true, selectedPokemon: pokemon } })),

  closeDetail: () => set((state) => ({ ui: { ...state.ui, isDetailOpen: false, selectedPokemon: null } })),

  closeAllUI: () => set((state) => ({ ui: { ...state.ui, isPokedexOpen: false, isBagOpen: false, isDetailOpen: false } })),
}));

export default useGameStore;