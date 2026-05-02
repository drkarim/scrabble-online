export const BOARD_SIZE = 15;

const TW = new Set(['0,0','0,7','0,14','7,0','7,14','14,0','14,7','14,14']);
const DW = new Set(['1,1','2,2','3,3','4,4','7,7','10,10','11,11','12,12','13,13','1,13','2,12','3,11','4,10','10,4','11,3','12,2','13,1']);
const TL = new Set(['1,5','1,9','5,1','5,5','5,9','5,13','9,1','9,5','9,9','9,13','13,5','13,9']);
const DL = new Set(['0,3','0,11','2,6','2,8','3,0','3,7','3,14','6,2','6,6','6,8','6,12','7,3','7,11','8,2','8,6','8,8','8,12','11,0','11,7','11,14','12,6','12,8','14,3','14,11']);

export function getSquareType(row, col) {
  const key = `${row},${col}`;
  if (TW.has(key)) return 'TW';
  if (DW.has(key)) return 'DW';
  if (TL.has(key)) return 'TL';
  if (DL.has(key)) return 'DL';
  return null;
}

export const SQUARE_LABELS = { TW: 'TW', DW: 'DW', TL: 'TL', DL: 'DL' };
export const SQUARE_COLORS = {
  TW: { bg: '#8b0000', text: '#ffaaaa', label: 'Triple Word' },
  DW: { bg: '#7b4066', text: '#f0c0d8', label: 'Double Word' },
  TL: { bg: '#1a3a6b', text: '#aaccff', label: 'Triple Letter' },
  DL: { bg: '#1a5c5c', text: '#aaeedd', label: 'Double Letter' },
};

export const TILE_VALUES = {
  A:1, B:3, C:3, D:2, E:1, F:4, G:2, H:4, I:1, J:8, K:5, L:1, M:3,
  N:1, O:1, P:3, Q:10, R:1, S:1, T:1, U:1, V:4, W:4, X:8, Y:4, Z:10, '?':0,
};

export const COL_LABELS = 'ABCDEFGHIJKLMNO'.split('');
