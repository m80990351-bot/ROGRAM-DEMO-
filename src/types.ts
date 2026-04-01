export type AssetId = 'BTC' | 'TON' | 'USD' | 'EUR';

export interface Asset {
  id: AssetId;
  name: string;
  price: number;
  initialPrice: number;
  supply: number;
  initialSupply: number;
  color: string;
}

export interface User {
  id: string;
  email: string;
  balance: number;
  holdings: Record<AssetId, number>;
  gifts: UserGift[];
}

export interface Gift {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export interface UserGift {
  id: string;
  giftId: string;
  purchaseDate: number;
}

export interface MarketListing {
  id: string;
  sellerId: string;
  sellerEmail: string;
  assetId: AssetId;
  amount: number;
  pricePerUnit: number;
  createdAt: number;
}

export const INITIAL_ASSETS: Record<AssetId, Asset> = {
  TON: {
    id: 'TON',
    name: 'Тонкоин',
    price: 135,
    initialPrice: 145,
    supply: 50,
    initialSupply: 50,
    color: '#0088CC',
  },
  BTC: {
    id: 'BTC',
    name: 'Биткоин',
    price: 500,
    initialPrice: 500,
    supply: 5,
    initialSupply: 5,
    color: '#F7931A',
  },
  EUR: {
    id: 'EUR',
    name: 'Евро',
    price: 125,
    initialPrice: 125,
    supply: 100,
    initialSupply: 100,
    color: '#003399',
  },
  USD: {
    id: 'USD',
    name: 'Доллар',
    price: 105,
    initialPrice: 105,
    supply: 100,
    initialSupply: 100,
    color: '#85BB65',
  },
};
