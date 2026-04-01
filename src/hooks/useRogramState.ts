import { useState, useEffect } from 'react';
import { Asset, AssetId, User, MarketListing, INITIAL_ASSETS, Gift, UserGift } from '../types';

export function useRogramState() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('rogram_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [assets, setAssets] = useState<Record<AssetId, Asset>>(() => {
    const saved = localStorage.getItem('rogram_assets');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [listings, setListings] = useState<MarketListing[]>(() => {
    const saved = localStorage.getItem('rogram_listings');
    return saved ? JSON.parse(saved) : [];
  });

  const [adminSettings, setAdminSettings] = useState(() => {
    const saved = localStorage.getItem('rogram_admin_settings');
    return saved ? JSON.parse(saved) : { priceBoost: false, luckEvent: false, luckEventEndTime: null };
  });

  const [gifts, setGifts] = useState<Gift[]>(() => {
    const saved = localStorage.getItem('rogram_gifts');
    const initialGifts: Gift[] = [
      {
        id: 'cyber_box',
        name: 'Cyber Box',
        price: 750,
        stock: 2,
        imageUrl: 'https://fbi.cults3d.com/uploaders/28846150/illustration-file/1e036844-eb6a-40c8-b22c-2e71e690cea4/cae9bc60-0d24-4e21-acc9-23da2eddfb26.png'
      }
    ];
    return saved ? JSON.parse(saved) : initialGifts;
  });

  const [allUsers, setAllUsers] = useState<Record<string, User & { password?: string }>>(() => {
    const saved = localStorage.getItem('rogram_all_users');
    return saved ? JSON.parse(saved) : {};
  });

  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const sessionId = Math.random().toString(36).substring(2, 9);
    
    const updateOnline = () => {
      const now = Date.now();
      const sessions = JSON.parse(localStorage.getItem('rogram_active_sessions') || '{}');
      
      // Update current session
      sessions[sessionId] = now;
      
      // Clean up old sessions (older than 15 seconds)
      const activeSessions: Record<string, number> = {};
      Object.entries(sessions).forEach(([id, lastSeen]) => {
        if (now - (lastSeen as number) < 15000) {
          activeSessions[id] = lastSeen as number;
        }
      });
      
      localStorage.setItem('rogram_active_sessions', JSON.stringify(activeSessions));
      
      // Base online count (e.g. 124) + number of active tabs
      const baseOnline = 124;
      const count = baseOnline + Object.keys(activeSessions).length;
      setOnlineCount(count);
      localStorage.setItem('rogram_online_count', count.toString());
    };

    updateOnline();
    const interval = setInterval(updateOnline, 5000);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'rogram_user' && e.newValue) setUser(JSON.parse(e.newValue));
      if (e.key === 'rogram_assets' && e.newValue) setAssets(JSON.parse(e.newValue));
      if (e.key === 'rogram_listings' && e.newValue) setListings(JSON.parse(e.newValue));
      if (e.key === 'rogram_gifts' && e.newValue) setGifts(JSON.parse(e.newValue));
      if (e.key === 'rogram_all_users' && e.newValue) setAllUsers(JSON.parse(e.newValue));
      if (e.key === 'rogram_online_count' && e.newValue) setOnlineCount(parseInt(e.newValue));
    };

    window.addEventListener('storage', handleStorage);
    
    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      const sessions = JSON.parse(localStorage.getItem('rogram_active_sessions') || '{}');
      delete sessions[sessionId];
      localStorage.setItem('rogram_active_sessions', JSON.stringify(sessions));
    };
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('rogram_user', JSON.stringify(user));
    localStorage.setItem('rogram_assets', JSON.stringify(assets));
    localStorage.setItem('rogram_listings', JSON.stringify(listings));
    localStorage.setItem('rogram_admin_settings', JSON.stringify(adminSettings));
    localStorage.setItem('rogram_gifts', JSON.stringify(gifts));
    localStorage.setItem('rogram_all_users', JSON.stringify(allUsers));
  }, [user, assets, listings, adminSettings, gifts, allUsers]);

  // Handle Luck Event Timer
  useEffect(() => {
    if (adminSettings.luckEvent && adminSettings.luckEventEndTime) {
      const timer = setInterval(() => {
        if (Date.now() >= adminSettings.luckEventEndTime) {
          setAdminSettings(prev => ({ ...prev, luckEvent: false, luckEventEndTime: null }));
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [adminSettings.luckEvent, adminSettings.luckEventEndTime]);

  // Deterministic global price fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prev => {
        const next = { ...prev };
        const timeStep = Math.floor(Date.now() / 5000);
        
        (Object.keys(next) as AssetId[]).forEach(id => {
          const asset = next[id];
          
          // Seeded random based on timeStep and assetId
          const seed = timeStep + id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const pseudoRandom = (Math.sin(seed) * 10000) % 1;
          
          // Base random factor [-0.5, 0.5]
          let randomFactor = pseudoRandom;
          
          // Gravity effect: if price is > 150% of initial, add downward pressure
          const priceRatio = asset.price / asset.initialPrice;
          if (priceRatio > 1.5) {
            randomFactor -= (priceRatio - 1.5) * 0.2;
          } else if (priceRatio < 0.7) {
            randomFactor += (0.7 - priceRatio) * 0.1;
          }

          if (adminSettings.priceBoost) {
            randomFactor += 0.25;
          }
          
          if (adminSettings.luckEvent) {
            randomFactor += 0.35;
          }

          const volatility = id === 'BTC' ? 2.5 : id === 'TON' ? 0.8 : 0.2;
          const change = randomFactor * volatility;
          
          const minPrice = asset.initialPrice * 0.3;
          const maxPrice = asset.initialPrice * 5.0;
          const newPrice = Math.min(maxPrice, Math.max(minPrice, asset.price + change));

          next[id] = { 
            ...asset, 
            price: newPrice
          };
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [adminSettings.priceBoost, adminSettings.luckEvent]);

  const register = (email: string, password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      throw new Error('Пароли не совпадают');
    }
    if (password.length < 6) {
      throw new Error('Пароль должен быть не менее 6 символов');
    }

    const savedUsers = JSON.parse(localStorage.getItem('rogram_all_users') || '{}');
    if (savedUsers[email]) {
      throw new Error('Пользователь с таким Email уже существует');
    }

    const newUser: User & { password?: string } = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      password, // Storing plain for demo purposes
      balance: 1000,
      holdings: { BTC: 0, TON: 0, USD: 0, EUR: 0 },
      gifts: [],
    };

    savedUsers[email] = newUser;
    setAllUsers(savedUsers);
    localStorage.setItem('rogram_all_users', JSON.stringify(savedUsers));
    setUser(newUser);
  };

  const loginWithPassword = (email: string, password: string) => {
    const savedUsers = JSON.parse(localStorage.getItem('rogram_all_users') || '{}');
    const existingUser = savedUsers[email];

    if (!existingUser || existingUser.password !== password) {
      throw new Error('Неверный Email или пароль');
    }

    setUser(existingUser);
  };

  const logout = () => {
    setUser(null);
  };

  const buyFromSystem = (assetId: AssetId, amount: number) => {
    if (!user) return;
    const asset = assets[assetId];
    const totalCost = asset.price * amount;

    if (user.balance < totalCost) throw new Error('Недостаточно средств на балансе');
    if (asset.supply < amount) throw new Error('Недостаточно предложения в системе');

    // Price impact: Price drops when buying (as requested: "падает при покупках")
    const priceImpact = 0.01; // 1% per unit or similar
    const newPrice = Math.max(asset.initialPrice * 0.5, asset.price - (amount * priceImpact));

    setAssets(prev => ({
      ...prev,
      [assetId]: { ...asset, price: newPrice, supply: asset.supply - amount }
    }));

    setUser(prev => prev ? ({
      ...prev,
      balance: prev.balance - totalCost,
      holdings: { ...prev.holdings, [assetId]: prev.holdings[assetId] + amount }
    }) : null);
  };

  const sellToSystem = (assetId: AssetId, amount: number) => {
    if (!user) return;
    const asset = assets[assetId];
    if (user.holdings[assetId] < amount) throw new Error('Недостаточно активов в портфеле');

    const totalGain = asset.price * amount;

    // Price impact: Price rises when selling (as requested: "при продажах растет но не растет сильно")
    const priceImpact = 0.005; // 0.5% per unit
    const newPrice = Math.min(asset.initialPrice * 2, asset.price + (amount * priceImpact));

    setAssets(prev => ({
      ...prev,
      [assetId]: { ...asset, price: newPrice, supply: asset.supply + amount }
    }));

    setUser(prev => prev ? ({
      ...prev,
      balance: prev.balance + totalGain,
      holdings: { ...prev.holdings, [assetId]: prev.holdings[assetId] - amount }
    }) : null);
  };

  const createListing = (assetId: AssetId, amount: number, pricePerUnit: number) => {
    if (!user) return;
    if (user.holdings[assetId] < amount) throw new Error('Недостаточно активов в портфеле');

    const newListing: MarketListing = {
      id: Math.random().toString(36).substr(2, 9),
      sellerId: user.id,
      sellerEmail: user.email,
      assetId,
      amount,
      pricePerUnit,
      createdAt: Date.now(),
    };

    setListings(prev => [...prev, newListing]);
    setUser(prev => prev ? ({
      ...prev,
      holdings: { ...prev.holdings, [assetId]: prev.holdings[assetId] - amount }
    }) : null);
  };

  const buyFromMarket = (listingId: string) => {
    if (!user) return;
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;

    const totalCost = listing.amount * listing.pricePerUnit;
    if (user.balance < totalCost) throw new Error('Недостаточно средств на балансе');

    // In a real app, we'd update the seller's balance too.
    // For this local simulation, we just remove the listing and update the buyer.
    setListings(prev => prev.filter(l => l.id !== listingId));
    setUser(prev => prev ? ({
      ...prev,
      balance: prev.balance - totalCost,
      holdings: { ...prev.holdings, [listing.assetId]: prev.holdings[listing.assetId] + listing.amount }
    }) : null);
  };

  const cancelListing = (listingId: string) => {
    if (!user) return;
    const listing = listings.find(l => l.id === listingId);
    if (!listing || listing.sellerId !== user.id) return;

    setListings(prev => prev.filter(l => l.id !== listingId));
    setUser(prev => prev ? ({
      ...prev,
      holdings: { ...prev.holdings, [listing.assetId]: prev.holdings[listing.assetId] + listing.amount }
    }) : null);
  };

  const togglePriceBoost = () => {
    setAdminSettings(prev => ({ ...prev, priceBoost: !prev.priceBoost }));
  };

  const startLuckEvent = () => {
    setAdminSettings(prev => ({
      ...prev,
      luckEvent: true,
      luckEventEndTime: Date.now() + 120000 // 2 minutes
    }));
  };

  const stopLuckEvent = () => {
    setAdminSettings(prev => ({
      ...prev,
      luckEvent: false,
      luckEventEndTime: null
    }));
  };

  const adjustPricesByPercentage = (percentage: number) => {
    setAssets(prev => {
      const next = { ...prev };
      (Object.keys(next) as AssetId[]).forEach(id => {
        const asset = next[id];
        const multiplier = 1 + (percentage / 100);
        next[id] = {
          ...asset,
          price: Math.max(asset.initialPrice * 0.1, asset.price * multiplier)
        };
      });
      return next;
    });
  };

  const buyGift = (giftId: string) => {
    if (!user) return;
    const giftIndex = gifts.findIndex(g => g.id === giftId);
    if (giftIndex === -1) return;
    const gift = gifts[giftIndex];

    if (user.balance < gift.price) throw new Error('Недостаточно средств на балансе');
    if (gift.stock <= 0) throw new Error('Товар закончился в стоке');

    const newUserGift: UserGift = {
      id: Math.random().toString(36).substr(2, 9),
      giftId: gift.id,
      purchaseDate: Date.now()
    };

    setGifts(prev => {
      const next = [...prev];
      next[giftIndex] = { ...next[giftIndex], stock: next[giftIndex].stock - 1 };
      return next;
    });

    setUser(prev => prev ? ({
      ...prev,
      balance: prev.balance - gift.price,
      gifts: [...(prev.gifts || []), newUserGift]
    }) : null);
  };

  return {
    user,
    assets,
    listings,
    adminSettings,
    gifts,
    allUsers,
    onlineCount,
    register,
    loginWithPassword,
    logout,
    buyFromSystem,
    sellToSystem,
    createListing,
    buyFromMarket,
    cancelListing,
    togglePriceBoost,
    startLuckEvent,
    stopLuckEvent,
    adjustPricesByPercentage,
    buyGift,
  };
}
