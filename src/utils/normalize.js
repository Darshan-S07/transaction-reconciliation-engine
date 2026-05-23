export const ASSET_MAP = {
  BTC: 'BTC',
  BITCOIN: 'BTC',
  ETH: 'ETH',
  ETHEREUM: 'ETH'
};

export const TYPE_MAP = {
  TRANSFER_IN: 'TRANSFER',
  TRANSFER_OUT: 'TRANSFER',
  BUY: 'BUY',
  SELL: 'SELL'
};

export function normalizeAsset(asset) {
  if (!asset) return null;
  return ASSET_MAP[asset.toUpperCase()] || asset.toUpperCase();
}

export function normalizeType(type) {
  if (!type) return null;
  return TYPE_MAP[type.toUpperCase()] || type.toUpperCase();
}

export function normalizeTimestamp(ts) {
  const date = new Date(ts);
  return isNaN(date) ? null : date;
}

export function normalizeQuantity(qty) {
  const num = parseFloat(qty);
  return isNaN(num) ? null : num;
}