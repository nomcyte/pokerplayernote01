import React, { useState, useMemo, useEffect, useCallback } from 'react';
import HandRangeChart from './HandRangeChart';
import { PlayerData } from '../types';
import { formatRanges } from '../utils/handRangeUtils';
import { LogOut, Users } from 'lucide-react';

interface PlayerActionProps {
  seat: number | null;
  onActionUpdate: (seat: number, action: string, position: string | null, hands: string[]) => void;
  onMemoUpdate: (seat: number | null, playerName: string, memo: string, handRanges: PlayerData['actions']) => void;
  onBack: () => void;
  onRemovePlayer: (seat: number) => void;
  savedPlayers: Record<number, PlayerData>;
  allPlayers: Record<string, PlayerData>;
  editingPlayer: PlayerData | null;
}

const PlayerAction: React.FC<PlayerActionProps> = ({
  seat,
  onActionUpdate,
  onMemoUpdate,
  onBack,
  onRemovePlayer,
  savedPlayers,
  allPlayers,
  editingPlayer,
}) => {
  const player = useMemo(() => (seat !== null ? savedPlayers[seat] || editingPlayer : null), [seat, savedPlayers, editingPlayer]);

  const [playerName, setPlayerName] = useState(player?.name || '');
  const [memo, setMemo] = useState('');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [handRanges, setHandRanges] = useState<PlayerData['actions']>(player?.actions || []);
  const [saveMessage, setSaveMessage] = useState('');
  const [showRegisteredPlayers, setShowRegisteredPlayers] = useState(false);

  useEffect(() => {
    if (player) {
      setPlayerName(player.name || '');
      setHandRanges(player.actions || []);
      setMemo(player.memos?.[player.memos.length - 1]?.text || '');
    } else {
      setPlayerName('');
      setHandRanges([]);
      setMemo('');
    }
  }, [player]);

  const handleActionSelect = useCallback((action: string) => {
    setSelectedAction(action);
    setSelectedPosition(null);
  }, []);

  const handlePositionSelect = useCallback((position: string) => {
    setSelectedPosition(position);
  }, []);

  const handleHandSelection = useCallback((hands: string[]) => {
    if (selectedAction && selectedPosition && seat !== null) {
      setHandRanges(prevRanges => {
        const updatedRanges = prevRanges.filter(
          range => range.action !== selectedAction || range.position !== selectedPosition
        );
        return [...updatedRanges, { action: selectedAction, position: selectedPosition, hands }];
      });
      onActionUpdate(seat, selectedAction, selectedPosition, hands);
      setSelectedAction(null);
      setSelectedPosition(null);
    }
  }, [selectedAction, selectedPosition, onActionUpdate, seat]);

  const handleSubmit = useCallback(() => {
    if (seat !== null) {
      onMemoUpdate(seat, playerName, memo, handRanges);
      setSaveMessage('データが保存されました');
      setTimeout(() => {
        setSaveMessage('');
      }, 1500);
    }
  }, [seat, playerName, memo, handRanges, onMemoUpdate]);

  const handleSave = useCallback(() => {
    if (!playerName.trim()) {
      setSaveMessage('プレイヤー名を入力してください');
      return;
    }
    if (seat !== null) {
      onMemoUpdate(seat, playerName, memo, handRanges);
    }
    setSaveMessage('データが保存されました');
    setTimeout(() => {
      setSaveMessage('');
      onBack(); // 保存完了後に相手プレイヤーのシート選択画面に遷移
    }, 1500);
  }, [seat, playerName, memo, handRanges, onMemoUpdate, onBack]);

  const handleRegisteredPlayerSelect = useCallback((selectedPlayer: PlayerData) => {
    setPlayerName(selectedPlayer.name);
    setHandRanges(selectedPlayer.actions || []);
    setMemo(selectedPlayer.memos?.[selectedPlayer.memos.length - 1]?.text || '');
    setShowRegisteredPlayers(false);
  }, []);

  const formattedRanges = useMemo(() => formatRanges(handRanges), [handRanges]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {player ? 'プレイヤー編集' : '新規プレイヤー登録'}
        </h2>
        <button
          onClick={onBack}
          className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
        >
          戻る
        </button>
      </div>
      <div className="mb-4">
        <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">
          プレイヤー名
        </label>
        <div className="flex">
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
          <button
            onClick={() => setShowRegisteredPlayers(true)}
            className="ml-2 bg-blue-500 text-white px-3 py-2 rounded-md flex items-center justify-center text-sm shadow-md hover:bg-blue-600 transition-colors duration-200"
          >
            <Users size={16} className="mr-2" /> 登録済みプレイヤー
          </button>
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
          メモ
        </label>
        <textarea
          id="memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          rows={3}
        ></textarea>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">アクション選択</h3>
        <div className="flex space-x-2">
          {['OPEN', 'CALL on IP', 'CALL on OOP'].map((action) => (
            <button
              key={action}
              onClick={() => handleActionSelect(action)}
              className={`px-4 py-2 rounded-md ${
                selectedAction === action
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              } transition-colors duration-200`}
            >
              {action}
            </button>
          ))}
        </div>
      </div>
      {selectedAction && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">ポジション選択</h3>
          <div className="grid grid-cols-3 gap-2">
            {['UTG', 'UTG+1', 'UTG+2', 'HJ', 'LJ', 'CO', 'BTN', 'SB', 'BB'].map((position) => (
              <button
                key={position}
                onClick={() => handlePositionSelect(position)}
                className={`px-4 py-2 rounded-md ${
                  selectedPosition === position
                    ? 'bg-purple-500 text-white'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                } transition-colors duration-200`}
              >
                {position}
              </button>
            ))}
          </div>
        </div>
      )}
      {selectedAction && selectedPosition && (
        <HandRangeChart
          onHandSelection={handleHandSelection}
          selectedAction={selectedAction}
          selectedPosition={selectedPosition}
          existingRanges={handRanges}
          onSave={handleSubmit}
        />
      )}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">現在のハンドレンジ</h3>
        <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md" dangerouslySetInnerHTML={{ __html: formattedRanges }}></div>
      </div>
      <div className="mt-6">
        <button
          onClick={handleSave}
          className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 transition-colors duration-200"
        >
          保存
        </button>
        {saveMessage && (
          <p className={`mt-2 text-sm ${saveMessage.includes('エラー') ? 'text-red-600' : 'text-green-600'}`}>
            {saveMessage}
          </p>
        )}
      </div>
      {seat !== null && (
        <button
          onClick={() => onRemovePlayer(seat)}
          className="absolute top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-md flex items-center justify-center text-sm shadow-md hover:bg-red-600 transition-colors duration-200"
        >
          <LogOut size={16} className="mr-2" /> シートを退席
        </button>
      )}
      {showRegisteredPlayers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">登録済みプレイヤー</h3>
            <div className="space-y-2">
              {Object.values(allPlayers || {}).map((player, index) => (
                <button
                  key={index}
                  onClick={() => handleRegisteredPlayerSelect(player)}
                  className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                >
                  {player.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowRegisteredPlayers(false)}
              className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerAction;