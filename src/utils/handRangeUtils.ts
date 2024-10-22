export const formatRanges = (actions: { action: string; position: string | null; hands: string[] }[]): string => {
  const groupedActions = actions.reduce((acc, action) => {
    const key = `${action.action} ${action.position || ''}`;
    if (!acc[key]) {
      acc[key] = new Set();
    }
    action.hands.forEach(hand => acc[key].add(hand));
    return acc;
  }, {} as Record<string, Set<string>>);

  const sortActions = (a: string, b: string): number => {
    if (a.startsWith('OPEN') && !b.startsWith('OPEN')) return -1;
    if (!a.startsWith('OPEN') && b.startsWith('OPEN')) return 1;
    return a.localeCompare(b);
  };

  return Object.entries(groupedActions)
    .sort(([keyA], [keyB]) => sortActions(keyA, keyB))
    .map(([key, handsSet]) => {
      const hands = Array.from(handsSet);
      const { pairs, suited, offsuit } = categorizeHands(hands);
      const compressedPairs = compressHandRange(pairs);
      const compressedSuited = compressHandRange(suited).map(hand => hand + 's');
      const compressedOffsuit = compressHandRange(offsuit).map(hand => hand + 'o');

      const formattedRanges = [
        compressedPairs.length > 0 ? `Pairs: <span style="color: black">${compressedPairs.join(', ')}</span>` : '',
        compressedSuited.length > 0 ? `Suited: <span style="color: black">${compressedSuited.join(', ')}</span>` : '',
        compressedOffsuit.length > 0 ? `Offsuit: <span style="color: black">${compressedOffsuit.join(', ')}</span>` : '',
      ].filter(Boolean).join(' | ');

      const color = getActionColor(key);
      return `<div style="color: ${color}">${key}:<br>${formattedRanges}</div>`;
    })
    .join('<br>');
};

export const categorizeHands = (hands: string[]): { pairs: string[], suited: string[], offsuit: string[] } => {
  const pairs: string[] = [];
  const suited: string[] = [];
  const offsuit: string[] = [];

  hands.forEach(hand => {
    if (hand[0] === hand[1]) {
      pairs.push(hand.slice(0, 2));
    } else if (hand.endsWith('s')) {
      suited.push(hand.slice(0, 2));
    } else {
      offsuit.push(hand.slice(0, 2));
    }
  });

  return { pairs, suited, offsuit };
};

export const compressHandRange = (hands: string[]): string[] => {
  if (hands.length === 0) return [];

  const rankOrder = '23456789TJQKA';
  const sortedHands = [...new Set(hands)].sort((a, b) => {
    const aRank1 = rankOrder.indexOf(a[0]);
    const bRank1 = rankOrder.indexOf(b[0]);
    if (aRank1 !== bRank1) return bRank1 - aRank1;
    return rankOrder.indexOf(b[1]) - rankOrder.indexOf(a[1]);
  });

  const compressed: string[] = [];
  let start = sortedHands[0];
  let prev = start;

  for (let i = 1; i <= sortedHands.length; i++) {
    const current = sortedHands[i];
    if (current && current[0] === prev[0] && rankOrder.indexOf(current[1]) === rankOrder.indexOf(prev[1]) - 1) {
      prev = current;
    } else {
      compressed.push(start === prev ? start : `${start}-${prev}`);
      start = current;
      prev = current;
    }
  }

  return compressed;
};

export const getActionColor = (action: string): string => {
  if (action.startsWith('OPEN')) return 'blue';
  if (action.startsWith('CALL on IP')) return 'green';
  if (action.startsWith('CALL on OOP')) return 'orange';
  return 'black';
};