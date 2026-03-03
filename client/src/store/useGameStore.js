import { create } from 'zustand';

const useGameStore = create((set) => ({
  // --- OYUNCU KONUMU (Eksik olan kısım buydu) ---
  posX: 380, // Littleroot Town başlangıç X (Tiled'dan bakabilirsin)
  posY: 300, // Littleroot Town başlangıç Y
  
  setPosition: (x, y) => set({ posX: x, posY: y }),

  // --- ARAYÜZ (UI) STATE ---
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