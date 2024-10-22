import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PlayerData } from '../types';

interface HandRangeChartProps {
  onHandSelection: (hands: string[]) => void;
  selectedAction: string | null;
  selectedPosition: string | null;
  existingRanges: PlayerData['actions'];
  onSave: () => void;
}

const HandRangeChart: React.FC<HandRangeChartProps> = ({
  onHandSelection,
  selectedAction,
  selectedPosition,
  existingRanges,
  onSave,
}) => {
  const [selectedHands, setSelectedHands] = useState<string[]>([]);

  const existingHandsForCurrentAction = useMemo(() => {
    if (selectedAction && selectedPosition) {
      return existingRanges
        .filter(range => range.action === selectedAction && range.position === selectedPosition)
        .flatMap(range => range.hands);
    }
    return [];
  }, [selectedAction, selectedPosition, existingRanges]);

  useEffect(() => {
    setSelectedHands(existingHandsForCurrentAction);
  }, [existingHandsForCurrentAction]);

  const toggleHand = useCallback((hand: string) => {
    setSelectedHands(prev => 
      prev.includes(hand) ? prev.filter(h => h !== hand) : [...prev, hand]
    );
  }, []);

  const handleSubmit = useCallback(() => {
    onHandSelection(selectedHands);
    onSave();
  }, [onHandSelection, selectedHands, onSave]);

  const getHighlightColor = useCallback(() => {
    switch (selectedAction) {
      case 'OPEN': return 'bg-blue-500';
      case 'CALL on IP': return 'bg-green-500';
      case 'CALL on OOP': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  }, [selectedAction]);

  const getBackgroundColor = useMemo(() => {
    return (row: string, col: string, hand: string) => {
      if (selectedHands.includes(hand)) {
        return getHighlightColor();
      }
      if (row === col) return 'bg-red-200'; // Pocket pairs
      if (ranks.indexOf(row) < ranks.indexOf(col)) return 'bg-blue-200'; // Suited hands
      return 'bg-green-200'; // Offsuit hands
    };
  }, [selectedHands, getHighlightColor]);

  const ranks = useMemo(() => ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'], []);

  return (
    <div className="mt-6">
      <div className="grid grid-cols-13 gap-1 mb-4">
        {ranks.map((row, i) =>
          ranks.map((col, j) => {
            const hand = i <= j ? `${row}${col}s` : `${col}${row}o`;
            const isSelected = selectedHands.includes(hand);
            const baseClass = getBackgroundColor(row, col, hand);
            return (
              <button
                key={hand}
                className={`w-8 h-8 text-xs font-bold rounded ${baseClass} ${
                  isSelected ? 'text-white' : 'text-gray-700'
                } hover:opacity-80 transition-opacity duration-200`}
                onClick={() => toggleHand(hand)}
              >
                {hand}
              </button>
            );
          })
        )}
      </div>
      <button
        className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 transition-colors duration-200"
        onClick={handleSubmit}
      >
        Submit Selection
      </button>
    </div>
  );
};

export default HandRangeChart;