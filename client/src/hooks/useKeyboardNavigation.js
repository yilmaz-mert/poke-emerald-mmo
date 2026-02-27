import { useState, useEffect } from 'react';

export const useKeyboardNavigation = (itemsCount, gridCols, onSelect) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowRight':
          setSelectedIndex((prev) => (prev + 1) % itemsCount);
          break;
        case 'ArrowLeft':
          setSelectedIndex((prev) => (prev - 1 + itemsCount) % itemsCount);
          break;
        case 'ArrowDown':
          setSelectedIndex((prev) => (prev + gridCols < itemsCount ? prev + gridCols : prev % gridCols));
          break;
        case 'ArrowUp':
          setSelectedIndex((prev) => (prev - gridCols >= 0 ? prev - gridCols : (Math.floor((itemsCount - 1) / gridCols) * gridCols) + (prev % gridCols)));
          break;
        case 'Enter':
          if (onSelect) onSelect(selectedIndex);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [itemsCount, gridCols, onSelect, selectedIndex]);

  return selectedIndex;
};