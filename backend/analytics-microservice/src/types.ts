export interface ApolloContextData {
  userId: string;
};

export interface UpdateInventoryAnalyticsArgs {
  inventoryItem: inventoryItem
}

interface inventoryItem {
  purchaseprice: number,
}

export interface FetchInventoryValueRangeArgs {
  rangeInDays: number
}