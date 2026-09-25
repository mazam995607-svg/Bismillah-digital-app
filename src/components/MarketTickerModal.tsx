import React from 'react';
import { MarketItem } from '../types';
import { LiveMarketWatchModal, MarketRateItem } from './LiveMarketWatchModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  marketItems?: MarketItem[];
  onRefreshRates?: () => void;
}

export const MarketTickerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  marketItems,
  onRefreshRates,
}) => {
  // Convert MarketItem[] to MarketRateItem[] if provided
  const adaptedItems: MarketRateItem[] | undefined = marketItems?.map((item, idx) => {
    const rawVal = typeof item.price === 'number' ? item.price : parseFloat(String(item.currentPrice || '').replace(/[^0-9.]/g, '')) || 100;
    const isUp = item.type === 'gainer' || item.isUp;
    const changeVal = typeof item.change === 'number' ? item.change : parseFloat(String(item.change || '0').replace(/[^0-9.-]/g, '')) || (isUp ? 10 : -10);
    const prevRate = rawVal - changeVal;

    return {
      id: item.id || `item-${idx}`,
      symbol: item.symbol || item.name || 'ASSET',
      name: item.name || 'Market Item',
      category: (item.category as any) || 'Commodity',
      currentRate: rawVal,
      previousRate: prevRate,
      unit: 'PKR',
      lastUpdated: item.updatedAt || 'Just now'
    };
  });

  return (
    <LiveMarketWatchModal
      isOpen={isOpen}
      onClose={onClose}
      items={adaptedItems}
      onRefresh={onRefreshRates}
    />
  );
};

