import React, { useState, useEffect } from 'react';
import PlayerSelection from './PlayerSelection';
import PlayerAction from './PlayerAction';
import { PlayerData } from '../types';

interface GameTrackerProps {
  selectedSeat: number;
  playerData: Record<number, PlayerData>;
  savePlayerData: (newPlayerData: Record<number, PlayerData>) => void;
  onBackToSeatSelection: () => void;
  selectedPlayer: number | null;
  onEditRange: (seat: number) => void;
  onRemovePlayer: (seat: number) => void;
}

const GameTracker: React.FC<GameTrackerProps> = ({
  selectedSeat,
  playerData,
  savePlayerData,
  onBackToSeatSelection,
  selectedPlayer,
  onEditRange,
  onRemovePlayer,
}) => {
  const [activePlayer, setActivePlayer] = useState<number | null>(selectedPlayer);

  useEffect(() => {
    setActivePlayer(selectedPlayer);
  }, [selectedPlayer]);

  const handleActionUpdate = (seat: number, action: string, position: string | null, hands: string[]) => {
    const updatedPlayerData = {
      ...playerData,
      [seat]: {
        ...playerData[seat],
        actions: [...(playerData[seat]?.actions || []), { action, position, hands }],
      },
    };
    savePlayerData(updatedPlayerData);
  };

  const handleMemoUpdate = (seat: number | null, playerName: string, memo: string, handRanges: PlayerData['actions']) => {
    if (seat === null) return;
    const existingPlayer = playerData[seat];
    const updatedPlayerData = {
      ...playerData,
      [seat]: {
        ...existingPlayer,
        name: playerName,
        actions: handRanges,
        memos: [
          ...(existingPlayer?.memos || []),
          { text: memo, handRanges },
        ],
      },
    };
    savePlayerData(updatedPlayerData);
  };

  const handlePlayerSelect = (seat: number) => {
    setActivePlayer(seat);
    onEditRange(seat);
  };

  const handleBackToSelection = () => {
    setActivePlayer(null);
    onBackToSeatSelection();
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Game Tracker</h1>
        <p className="text-lg text-gray-600 mt-2">Your seat: {selectedSeat}</p>
      </div>
      {activePlayer === null ? (
        <PlayerSelection
          selectedSeat={selectedSeat}
          onPlayerSelect={handlePlayerSelect}
          playerData={playerData}
          onEditRange={onEditRange}
          onRemovePlayer={onRemovePlayer}
        />
      ) : (
        <PlayerAction
          seat={activePlayer}
          onActionUpdate={handleActionUpdate}
          onMemoUpdate={handleMemoUpdate}
          onBack={handleBackToSelection}
          onRemovePlayer={onRemovePlayer}
          savedPlayers={playerData}
          allPlayers={{}}
          editingPlayer={playerData[activePlayer]}
        />
      )}
    </div>
  );
};

export default GameTracker;