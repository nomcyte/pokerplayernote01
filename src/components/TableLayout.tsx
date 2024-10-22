import React, { useState } from 'react';
import { PlayerData } from '../types';
import { Edit, LogOut } from 'lucide-react';

interface TableLayoutProps {
  seatPositions: { x: number; y: number }[];
  playerData: Record<number, PlayerData>;
  selectedSeat: number | null;
  onSeatClick: (seat: number) => void;
  onEditRange: (seat: number) => void;
  onRemovePlayer: (seat: number) => void;
}

const TableLayout: React.FC<TableLayoutProps> = ({
  seatPositions,
  playerData,
  selectedSeat,
  onSeatClick,
  onEditRange,
  onRemovePlayer,
}) => {
  const [activePlayer, setActivePlayer] = useState<number | null>(null);

  return (
    <div className="relative w-96 h-64 mx-auto mb-8">
      <div className="absolute inset-0 bg-green-600 rounded-full transform scale-x-[1.44] scale-y-[1.04] shadow-inner"></div>
      {seatPositions.map((position, index) => {
        const seat = index + 1;
        const player = playerData[seat];
        return (
          <React.Fragment key={seat}>
            {activePlayer === seat && player && (
              <div
                className="absolute flex flex-col gap-2 w-28 z-10"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y - 20}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <button
  className="bg-blue-500 text-white px-3 py-2 rounded-md flex items-center justify-center text-sm shadow-md hover:bg-blue-600 transition-colors duration-200"
  onClick={(e) => {
    e.stopPropagation();
    onEditRange(seat);
  }}
  aria-label={`プレイヤー${seat}のレンジを編集`}
>
  <Edit size={16} className="mr-2" /> レンジ編集
</button>
                <button
                  className="bg-red-500 text-white px-3 py-2 rounded-md flex items-center justify-center text-sm shadow-md hover:bg-red-600 transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePlayer(seat);
                  }}
                  aria-label={`プレイヤー${seat}を退席させる`}
                >
                  <LogOut size={16} className="mr-2" /> 退席
                </button>
              </div>
            )}
            <button
              className={`absolute w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold transition-all duration-200 shadow-md ${
                selectedSeat === seat
                  ? 'bg-blue-500 text-white ring-4 ring-blue-300'
                  : player
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-800'
              }`}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => {
                onSeatClick(seat);
                setActivePlayer(activePlayer === seat ? null : seat);
              }}
            >
              {player ? player.name.charAt(0).toUpperCase() : seat}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default TableLayout;
