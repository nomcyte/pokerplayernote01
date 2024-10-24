import { useState, useEffect, useCallback } from 'react';
import SeatSelection from './components/SeatSelection';
import GameTracker from './components/GameTracker';
import PlayerAction from './components/PlayerAction';
import PlayerList from './components/PlayerList';
import { PlayerData, Screen, Action, Position } from './types';
import { saveToLocalStorage, loadFromLocalStorage } from './utils/storage';
import { usePlayerManagement } from './hooks/usePlayerManagement';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('seatSelection');
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);

  const {
    players,
    addPlayer,
    updatePlayer,
    removePlayer,
    getPlayerBySeat,
    getAllPlayers,
  } = usePlayerManagement();

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedPlayers = await loadFromLocalStorage('players', {});
        Object.entries(loadedPlayers).forEach(([seat, playerData]) => {
          addPlayer(Number(seat), playerData as PlayerData);
        });
      } catch (error) {
        console.error('データの読み込み中にエラーが発生しました:', error);
      }
    };
    loadData();
  }, [addPlayer]);

  const handleSeatSelect = useCallback((seat: number) => {
    setSelectedSeat(seat);
  }, []);

  const handleStartGame = useCallback(() => {
    if (selectedSeat !== null) {
      setCurrentScreen('gameTracker');
    }
  }, [selectedSeat]);

  const handlePlayerSelect = useCallback((seat: number) => {
    setSelectedPlayer(seat);
    setCurrentScreen('playerAction');
  }, []);

  const handleBack = useCallback(() => {
    switch (currentScreen) {
      case 'gameTracker':
        setCurrentScreen('seatSelection');
        setSelectedSeat(null);
        break;
      case 'playerAction':
        setCurrentScreen('gameTracker');
        setSelectedPlayer(null);
        break;
      case 'playerList':
        setCurrentScreen('gameTracker');
        break;
    }
  }, [currentScreen]);

  const handleEditRange = useCallback((seat: number) => {
    setSelectedPlayer(seat);
  }, []);

  const handleRemovePlayer = useCallback((seat: number) => {
    removePlayer(seat);
    saveToLocalStorage('players', getAllPlayers());
  }, [removePlayer, getAllPlayers]);

  const handleActionUpdate = useCallback((
    seat: number,
    action: Action,
    position: Position,
    hands: string[]
  ) => {
    updatePlayer(seat, (player) => ({
      ...player,
      actions: [...(player.actions || []), { action, position, hands }],
    }));
    saveToLocalStorage('players', getAllPlayers());
  }, [updatePlayer, getAllPlayers]);

  const handleMemoUpdate = useCallback((
    seat: number | null,
    playerName: string,
    memo: string,
    handRanges: PlayerData['actions']
  ) => {
    if (seat === null) return;
    updatePlayer(seat, (player) => ({
      ...player,
      name: playerName,
      actions: handRanges,
      memos: [
        ...(player.memos || []),
        { text: memo, handRanges },
      ],
    }));
    saveToLocalStorage('players', getAllPlayers());
  }, [updatePlayer, getAllPlayers]);

  const handleEditPlayer = useCallback((playerName: string) => {
    const playerToEdit = Object.values(getAllPlayers()).find(p => p.name === playerName);
    if (playerToEdit) {
      setSelectedPlayer(null);
      setCurrentScreen('playerAction');
    } else {
      console.error(`プレイヤー ${playerName} が見つかりません`);
    }
  }, [getAllPlayers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-6">
        {currentScreen === 'seatSelection' && (
          <SeatSelection
            onStartGame={handleStartGame}
            onSeatSelect={handleSeatSelect}
            onPlayerSelect={handlePlayerSelect}
            playerData={players}
            selectedSeat={selectedSeat}
            onEditRange={handleEditRange}
            onRemovePlayer={handleRemovePlayer}
          />
        )}
        {currentScreen === 'gameTracker' && selectedSeat !== null && (
          <GameTracker
            selectedSeat={selectedSeat}
            playerData={players}
            savePlayerData={updatePlayer}
            onBackToSeatSelection={handleBack}
            selectedPlayer={selectedPlayer}
            onEditRange={handleEditRange}
            onRemovePlayer={handleRemovePlayer}
          />
        )}
        {currentScreen === 'playerAction' && (
          <PlayerAction
            seat={selectedPlayer}
            onActionUpdate={handleActionUpdate}
            onMemoUpdate={handleMemoUpdate}
            onBack={handleBack}
            onRemovePlayer={handleRemovePlayer}
            savedPlayers={players}
            allPlayers={getAllPlayers()}
            editingPlayer={selectedPlayer !== null ? getPlayerBySeat(selectedPlayer) : null}
          />
        )}
        {currentScreen === 'playerList' && (
          <PlayerList
            players={getAllPlayers()}
            onEditPlayer={handleEditPlayer}
            onClose={handleBack}
          />
        )}
      </div>
    </div>
  );
}

export default App;
