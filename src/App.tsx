/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowRightLeft, 
  ShoppingBag, 
  LogOut, 
  Plus, 
  X,
  Bitcoin,
  Coins,
  Euro,
  DollarSign,
  History,
  LayoutDashboard,
  LayoutGrid,
  Settings,
  Zap,
  Sparkles,
  Clock,
  Gift,
  Package,
} from 'lucide-react';
import { useRogramState } from './hooks/useRogramState';
import { AssetId, Asset } from './types';

const ASSET_ICONS: Record<AssetId, any> = {
  BTC: Bitcoin,
  TON: Coins,
  EUR: Euro,
  USD: DollarSign,
};

export default function App() {
  const { 
    user, 
    assets, 
    listings, 
    adminSettings,
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
    gifts,
    allUsers,
    onlineCount,
    buyGift,
  } = useRogramState();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'exchange' | 'market' | 'inventory' | 'history' | 'admin' | 'usernames'>('exchange');
  const [marketSubTab, setMarketSubTab] = useState<'p2p' | 'gifts'>('p2p');
  const [selectedAsset, setSelectedAsset] = useState<AssetId>('TON');
  const [amount, setAmount] = useState<string>('');
  const [marketPrice, setMarketPrice] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedAssetForDetails, setSelectedAssetForDetails] = useState<AssetId | null>(null);
  const [selectedUserGiftId, setSelectedUserGiftId] = useState<string | null>(null);
  const [adminPercentage, setAdminPercentage] = useState<string>('10');
  const [mysteryTimer, setMysteryTimer] = useState<number>(900); // 15 mins
  const [mysteryRevealed, setMysteryRevealed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setMysteryTimer(prev => {
        if (prev <= 1) {
          setMysteryRevealed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (authMode === 'register') {
        register(email, password, confirmPassword);
      } else {
        loginWithPassword(email, password);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExchange = (type: 'buy' | 'sell') => {
    setError(null);
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Некорректная сумма');
      return;
    }

    try {
      if (type === 'buy') {
        buyFromSystem(selectedAsset, numAmount);
      } else {
        sellToSystem(selectedAsset, numAmount);
      }
      setAmount('');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleCreateListing = (e: FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const numPrice = parseFloat(marketPrice);

    if (isNaN(numAmount) || numAmount <= 0 || isNaN(numPrice) || numPrice <= 0) {
      setNotification({ message: 'Некорректная сумма или цена', type: 'error' });
      return;
    }

    try {
      createListing(selectedAsset, numAmount, numPrice);
      setAmount('');
      setMarketPrice('');
      setNotification({ message: 'Ордер успешно размещен на рынке', type: 'success' });
    } catch (e: any) {
      setNotification({ message: e.message, type: 'error' });
    }
  };

  const handleCancelListing = (id: string) => {
    try {
      cancelListing(id);
      setNotification({ message: 'Ордер успешно отозван', type: 'success' });
    } catch (e: any) {
      setNotification({ message: e.message, type: 'error' });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 font-sans selection:bg-white selection:text-black">
        {/* Ambient Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/5 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white/5 blur-[120px]"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#141414] p-12 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-full max-md border border-white/5 relative z-10"
        >
          <div className="flex flex-col items-center mb-12">
            <motion.div 
              initial={{ rotate: -45, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
              className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-8 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
            >
              <ArrowRightLeft className="text-black w-12 h-12" />
            </motion.div>
            <h1 className="text-5xl font-black tracking-tighter text-white mb-2 font-serif italic">ROGRAM</h1>
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-white/20"></div>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-mono font-bold">Terminal v4.0</p>
              <div className="h-px w-8 bg-white/20"></div>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-white/30 font-black ml-1">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@terminal.com"
                  className="w-full px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/10 focus:bg-white/[0.05] focus:border-white/20 focus:ring-4 focus:ring-white/5 transition-all outline-none font-mono text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-white/30 font-black ml-1">Пароль</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/10 focus:bg-white/[0.05] focus:border-white/20 focus:ring-4 focus:ring-white/5 transition-all outline-none font-mono text-sm"
                  required
                />
              </div>

              {authMode === 'register' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-white/30 font-black ml-1">Повторите пароль</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/10 focus:bg-white/[0.05] focus:border-white/20 focus:ring-4 focus:ring-white/5 transition-all outline-none font-mono text-sm"
                    required
                  />
                </motion.div>
              )}
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-[10px] font-bold text-center uppercase tracking-widest"
              >
                {error}
              </motion.div>
            )}

            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: '#FFFFFF', color: '#000000' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full bg-white/90 text-black py-5 rounded-2xl font-black text-lg shadow-xl transition-all uppercase tracking-widest ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Обработка...' : authMode === 'login' ? 'Войти в Терминал' : 'Создать Аккаунт'}
            </motion.button>

            <button 
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="w-full text-[10px] text-white/40 uppercase tracking-widest font-black hover:text-white/60 transition-colors"
            >
              {authMode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
            </button>
          </form>

          <div className="mt-12 flex items-center justify-between opacity-20">
            <span className="text-[9px] font-mono uppercase tracking-widest text-white">Encrypted Session</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-1 h-1 bg-white rounded-full"></div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans selection:bg-white selection:text-black">
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            key="notification-toast"
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-6"
          >
            <div className={`p-6 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center justify-between ${
              notification.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
              notification.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              'bg-white/10 border-white/20 text-white'
            }`}>
              <div className="flex items-center gap-4">
                {notification.type === 'success' && <Zap className="w-5 h-5" />}
                {notification.type === 'error' && <X className="w-5 h-5" />}
                {notification.type === 'info' && <Sparkles className="w-5 h-5" />}
                <span className="text-xs font-black uppercase tracking-widest">{notification.message}</span>
              </div>
              <button onClick={() => setNotification(null)}>
                <X className="w-4 h-4 opacity-40 hover:opacity-100" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Luck Event Banner */}
      <AnimatePresence>
        {adminSettings.luckEvent && (
          <motion.div 
            key="luck-event-banner"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white text-black py-4 px-10 relative z-[100] overflow-hidden"
          >
            <motion.div 
              animate={{ x: [0, -1000] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="flex whitespace-nowrap gap-20 items-center"
            >
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-6">
                  <Sparkles className="w-6 h-6" />
                  <span className="text-sm font-black uppercase tracking-[0.4em]">ГЛОБАЛЬНЫЙ ИВЕНТ: 2X УДАЧА АКТИВИРОВАНА • ЦЕНЫ РАСТУТ • ГЛОБАЛЬНЫЙ ИВЕНТ: 2X УДАЧА АКТИВИРОВАНА • ЦЕНЫ РАСТУТ</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-[#141414]/80 backdrop-blur-xl border-b border-white/5 px-10 py-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 90 }}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-white/5 cursor-pointer"
          >
            <ArrowRightLeft className="text-black w-6 h-6" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none font-serif italic">ROGRAM</h1>
            <div className="flex items-center gap-4 mt-1.5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="text-[9px] text-white/30 font-mono uppercase tracking-[0.2em] leading-none font-bold">Система Активна</span>
              </div>
              <div className="w-px h-2 bg-white/10"></div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-white/60 font-mono uppercase tracking-[0.2em] leading-none font-black">{onlineCount}</span>
                <span className="text-[9px] text-white/20 font-mono uppercase tracking-[0.2em] leading-none font-bold">Online</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] mb-1">Авторизован как</span>
            <span className="text-xs font-bold font-mono text-white/70">{user.email}</span>
          </div>
          <div className="h-10 w-px bg-white/5 hidden lg:block"></div>
          <motion.button 
            whileHover={{ scale: 1.1, color: '#FF4444' }}
            whileTap={{ scale: 0.9 }}
            onClick={logout}
            className="p-3 rounded-xl transition-colors text-white/20"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Stats & Balance */}
        <div className="lg:col-span-4 space-y-10">
          {/* Balance Card */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#1A1A1A] text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/5"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 opacity-30">
                <Wallet className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-black">Ликвидные Активы</span>
              </div>
              <div className="text-6xl font-black tracking-tighter mb-10 flex items-baseline gap-3">
                {user.balance.toLocaleString()} <span className="text-xl font-mono opacity-20">RUB</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {(Object.values(assets) as Asset[]).map(asset => (
                  <motion.div 
                    key={asset.id} 
                    whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 transition-all"
                  >
                    <div className="text-[9px] uppercase tracking-widest opacity-20 font-black mb-2">{asset.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-lg leading-none">{user.holdings[asset.id].toFixed(2)}</span>
                      <span className="text-[9px] opacity-20 font-mono font-bold">{asset.id}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Subtle Gradient Glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-[80px]"></div>
          </motion.section>

          {/* Asset Prices */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#141414] p-10 rounded-[3rem] border border-white/5 shadow-xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <h2 className="font-serif italic text-2xl text-white/90">Отслеживание</h2>
                <div className="flex items-center gap-2 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Онлайн</span>
                </div>
              </div>
              <div className="flex items-center gap-3 px-3 py-1 bg-white/5 rounded-full">
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">Live</span>
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-3">
              {(Object.values(assets) as Asset[]).map(asset => {
                const Icon = ASSET_ICONS[asset.id];
                const isUp = asset.price >= asset.initialPrice;
                return (
                  <motion.div 
                    key={asset.id} 
                    layout
                    onClick={() => {
                      setSelectedAsset(asset.id);
                      setSelectedAssetForDetails(asset.id);
                    }}
                    className={`flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all border ${selectedAsset === asset.id ? 'border-white/40 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] scale-[1.02]' : 'border-transparent hover:bg-white/[0.02]'}`}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden" style={{ backgroundColor: `${asset.color}10`, color: asset.color }}>
                        <Icon className="w-7 h-7 relative z-10" />
                        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white to-transparent"></div>
                      </div>
                      <div>
                        <div className="font-black text-base tracking-tight text-white/90">{asset.name}</div>
                        <div className="text-[9px] text-white/20 font-mono uppercase tracking-widest font-bold mt-0.5">Резерв: {asset.supply.toFixed(0)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-lg text-white">{asset.price.toFixed(2)} <span className="text-[10px] opacity-20">₽</span></div>
                      <div className={`text-[10px] font-black flex items-center justify-end gap-1.5 mt-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                        {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {Math.abs(((asset.price - asset.initialPrice) / asset.initialPrice) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        </div>

        {/* Right Column: Main Content */}
        <div className="lg:col-span-8 space-y-10">
          {/* Navigation Tabs */}
          <nav className="flex gap-2 p-2 bg-[#141414] rounded-2xl border border-white/5 w-fit shadow-xl">
            {[
              { id: 'exchange', label: 'Терминал', icon: ArrowRightLeft },
              { id: 'market', label: 'Рынок', icon: ShoppingBag },
              { id: 'inventory', label: 'Инвентарь', icon: Package },
              { id: 'usernames', label: 'Юзернеймы', icon: LayoutGrid, soon: true },
              { id: 'history', label: `Мои Ордера ${listings.filter(l => l.sellerId === user.id).length > 0 ? `(${listings.filter(l => l.sellerId === user.id).length})` : ''}`, icon: History },
              ...(user.email === 'masterskaaviksi7@gmail.com' ? [{ id: 'admin', label: 'Админ', icon: Settings }] : []),
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedUserGiftId(null);
                }}
                className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-[0_10px_20px_rgba(255,255,255,0.1)]' : 'text-white/30 hover:bg-white/5 hover:text-white/60'} relative`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {('soon' in tab) && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-white/10 text-[6px] font-black rounded-full border border-white/10 text-white/40">SOON</span>
                )}
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-[600px]"
            >
              {activeTab === 'exchange' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                  {/* Exchange Form */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#141414] p-10 rounded-[3rem] border border-white/5 shadow-2xl space-y-10"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-black tracking-tighter text-white font-serif italic">Обмен</h2>
                      <div className="px-4 py-1.5 bg-white/5 text-white/40 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/5">Ликвидность</div>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="block text-[10px] uppercase tracking-[0.3em] text-white/20 font-black ml-1">Актив</label>
                        <div className="grid grid-cols-4 gap-3">
                          {(Object.values(assets) as Asset[]).map(asset => (
                            <motion.button
                              key={asset.id}
                              whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.05)' }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedAsset(asset.id)}
                              className={`py-5 rounded-2xl border transition-all flex flex-col items-center gap-1.5 ${selectedAsset === asset.id ? 'border-white/40 bg-white text-black shadow-[0_15px_30px_rgba(255,255,255,0.2)] scale-105' : 'border-white/5 bg-white/[0.02] text-white/40'}`}
                            >
                              <span className="text-xs font-black font-mono">{asset.id}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-[10px] uppercase tracking-[0.3em] text-white/20 font-black ml-1">Объем</label>
                        <div className="relative group">
                          <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-8 py-8 bg-white/[0.02] rounded-[2rem] border border-white/5 focus:border-white/20 focus:bg-white/[0.04] transition-all text-4xl font-mono font-black outline-none text-white placeholder:text-white/5"
                          />
                          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-white/10 font-black text-2xl group-focus-within:text-white/40 transition-colors">{selectedAsset}</div>
                        </div>
                      </div>

                      <div className="bg-white/[0.02] p-8 rounded-[2rem] space-y-5 border border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black">Курс Системы</span>
                          <span className="font-mono font-black text-sm text-white/60">{assets[selectedAsset].price.toFixed(2)} RUB</span>
                        </div>
                        <div className="h-px bg-white/5"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black">Итого</span>
                          <span className="font-mono font-black text-2xl text-white">{(parseFloat(amount || '0') * assets[selectedAsset].price).toLocaleString()} <span className="text-sm opacity-20">RUB</span></span>
                        </div>
                      </div>

                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-5 bg-red-500/10 text-red-400 text-[11px] font-black rounded-2xl border border-red-500/20 flex items-center gap-4"
                        >
                          <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                            <X className="w-4 h-4" />
                          </div>
                          {error}
                        </motion.div>
                      )}

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <motion.button 
                          whileHover={{ scale: 1.02, y: -2, backgroundColor: '#FFFFFF', color: '#000000' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleExchange('buy')}
                          className="bg-white/90 text-black py-6 rounded-3xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                        >
                          <TrendingDown className="w-5 h-5" /> Купить
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02, y: -2, borderColor: '#FFFFFF', color: '#FFFFFF' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleExchange('sell')}
                          className="bg-transparent text-white/60 border border-white/10 py-6 rounded-3xl font-black text-lg hover:border-white/40 hover:text-white transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                        >
                          <TrendingUp className="w-5 h-5" /> Продать
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Market Info */}
                  <div className="space-y-10">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-[#141414] p-10 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col justify-between h-full relative overflow-hidden"
                    >
                      <div className="relative z-10">
                        <h3 className="text-2xl font-black tracking-tighter mb-8 text-white font-serif italic">Механика Рынка</h3>
                        <p className="text-sm text-white/40 leading-relaxed mb-10 font-medium">
                          ROGRAM использует алгоритмическую модель ценообразования. Покупка активов у системы <span className="text-red-400 font-black">снижает</span> котировку, а продажа — <span className="text-green-400 font-black">повышает</span> её. Это создает саморегулируемую экосистему.
                        </p>
                        
                        <div className="space-y-4">
                          <div className="flex items-center gap-6 p-5 rounded-[2rem] bg-white/[0.02] border border-white/5">
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 border border-red-500/10">
                              <TrendingDown className="w-8 h-8" />
                            </div>
                            <div>
                              <div className="text-sm font-black uppercase tracking-tight text-white/80">Покупка = Снижение</div>
                              <div className="text-[10px] text-white/20 font-mono uppercase tracking-widest font-bold mt-1">Дефицит предложения</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 p-5 rounded-[2rem] bg-white/[0.02] border border-white/5">
                            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-400 border border-green-500/10">
                              <TrendingUp className="w-8 h-8" />
                            </div>
                            <div>
                              <div className="text-sm font-black uppercase tracking-tight text-white/80">Продажа = Рост</div>
                              <div className="text-[10px] text-white/20 font-mono uppercase tracking-widest font-bold mt-1">Пополнение резервов</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-12 p-8 border border-white/5 bg-white/[0.01] rounded-[2.5rem] flex items-center justify-between relative z-10">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black mb-2">Статус Ноды</div>
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.8)]"></div>
                            <span className="text-xs font-mono font-black text-white/60 tracking-widest">ONLINE • 0.001ms</span>
                          </div>
                        </div>
                        <LayoutDashboard className="w-10 h-10 text-white/5" />
                      </div>

                      {/* Decorative background */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                    </motion.div>
                  </div>
                </div>
              )}

              {activeTab === 'market' && (
                <div className="space-y-10">
                  {/* Market Sub-tabs */}
                  <div className="flex gap-4 p-1.5 bg-white/5 rounded-2xl w-fit">
                    {[
                      { id: 'p2p', label: 'P2P Рынок' },
                      { id: 'gifts', label: 'Сток Подарков' },
                    ].map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => setMarketSubTab(sub.id as any)}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${marketSubTab === sub.id ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>

                  {marketSubTab === 'p2p' && (
                    <div className="space-y-10">
                       {/* Create Listing Form */}
                       <motion.div 
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="bg-[#141414] p-10 rounded-[3rem] border border-white/5 shadow-2xl"
                       >
                         <div className="flex items-center justify-between mb-8">
                           <h2 className="text-2xl font-black tracking-tighter text-white font-serif italic">Разместить Ордер</h2>
                           <div className="text-[10px] font-black uppercase tracking-widest text-white/20">
                             Доступно: <span className="text-white">{user.holdings[selectedAsset].toFixed(2)} {selectedAsset}</span>
                           </div>
                         </div>
                         <form onSubmit={handleCreateListing} className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
                           <div className="space-y-3">
                             <label className="block text-[10px] uppercase tracking-widest text-white/20 font-black ml-1">Актив</label>
                             <select 
                               value={selectedAsset}
                               onChange={(e) => setSelectedAsset(e.target.value as AssetId)}
                               className="w-full px-6 py-5 bg-white/[0.02] rounded-2xl border border-white/5 focus:border-white/20 outline-none text-sm font-black font-mono text-white appearance-none"
                             >
                               {(Object.values(assets) as Asset[]).map(a => <option key={a.id} value={a.id}>{a.id} — {a.name}</option>)}
                             </select>
                           </div>
                           <div className="space-y-3">
                             <label className="block text-[10px] uppercase tracking-widest text-white/20 font-black ml-1">Количество</label>
                             <div className="relative">
                               <input 
                                 type="number" 
                                 value={amount}
                                 onChange={(e) => setAmount(e.target.value)}
                                 placeholder="0.00"
                                 className="w-full px-6 py-5 bg-white/[0.02] rounded-2xl border border-white/5 focus:border-white/20 outline-none text-sm font-mono font-black text-white placeholder:text-white/5"
                               />
                               <button 
                                 type="button"
                                 onClick={() => setAmount(user.holdings[selectedAsset].toString())}
                                 className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-white/20 hover:text-white transition-colors"
                               >
                                 MAX
                               </button>
                             </div>
                           </div>
                           <div className="space-y-3">
                             <label className="block text-[10px] uppercase tracking-widest text-white/20 font-black ml-1">Цена (RUB)</label>
                             <input 
                               type="number" 
                               value={marketPrice}
                               onChange={(e) => setMarketPrice(e.target.value)}
                               placeholder="0.00"
                               className="w-full px-6 py-5 bg-white/[0.02] rounded-2xl border border-white/5 focus:border-white/20 outline-none text-sm font-mono font-black text-white placeholder:text-white/5"
                             />
                           </div>
                           <motion.button 
                             whileHover={{ scale: 1.02, backgroundColor: '#FFFFFF', color: '#000000' }}
                             whileTap={{ scale: 0.98 }}
                             type="submit"
                             className="bg-white/90 text-black py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3"
                           >
                             <Plus className="w-5 h-5" /> Создать Лот
                           </motion.button>
                         </form>
                       </motion.div>

                       {/* Listings Grid */}
                       {listings.filter(l => l.sellerId === user.id).length > 0 && (
                         <motion.div 
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between mb-10"
                         >
                           <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                               <History className="w-5 h-5 text-white/60" />
                             </div>
                             <p className="text-sm font-serif italic text-white/60">
                               У вас есть <span className="text-white font-black">{listings.filter(l => l.sellerId === user.id).length}</span> активных ордеров. 
                               Они не отображаются в общем списке, но доступны во вкладке <span className="text-white font-black">"Мои Ордера"</span>.
                             </p>
                           </div>
                           <button 
                             onClick={() => setActiveTab('history')}
                             className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white/80 transition-all"
                           >
                             Перейти
                           </button>
                         </motion.div>
                       )}
                       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                         {listings.filter(l => l.sellerId !== user.id).length === 0 ? (
                           <motion.div 
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             className="col-span-full py-40 text-center bg-[#141414] rounded-[3rem] border border-dashed border-white/5"
                           >
                             <ShoppingBag className="w-24 h-24 text-white/5 mx-auto mb-8" />
                             <p className="text-white/20 font-serif italic text-2xl">Рынок пуст. Ожидание ликвидности...</p>
                           </motion.div>
                         ) : (
                           listings.filter(l => l.sellerId !== user.id).map((listing, idx) => (
                             <motion.div 
                               key={listing.id} 
                               initial={{ opacity: 0, y: 20 }}
                               animate={{ opacity: 1, y: 0 }}
                               transition={{ delay: idx * 0.05 }}
                               whileHover={{ y: -8 }}
                               className="bg-[#141414] p-10 rounded-[3rem] border border-white/5 shadow-xl hover:shadow-2xl hover:shadow-white/5 transition-all group relative overflow-hidden"
                             >
                               <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.01] rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000"></div>
                               
                               <div className="flex items-center justify-between mb-10 relative z-10">
                                 <div className="flex items-center gap-5">
                                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-white/5">
                                     {(() => {
                                       const Icon = ASSET_ICONS[listing.assetId];
                                       return <Icon className="text-black w-8 h-8" />;
                                     })()}
                                   </div>
                                   <div>
                                     <div className="text-base font-black uppercase tracking-widest font-mono text-white">{listing.assetId}</div>
                                     <div className="text-[10px] text-white/20 font-bold truncate max-w-[120px] mt-1">{listing.sellerEmail}</div>
                                   </div>
                                 </div>
                                 <div className="text-right">
                                   <div className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-1.5">Цена</div>
                                   <div className="font-mono font-black text-2xl tracking-tighter text-white">{listing.pricePerUnit.toFixed(2)}</div>
                                 </div>
                               </div>
                               
                               <div className="flex items-center justify-between p-6 bg-white/[0.02] rounded-[2rem] mb-10 relative z-10 border border-white/5">
                                 <div className="space-y-1.5">
                                   <div className="text-white/20 uppercase tracking-widest text-[9px] font-black">Доступно</div>
                                   <div className="font-black text-base text-white/80">{listing.amount} {listing.assetId}</div>
                                 </div>
                                 <div className="h-10 w-px bg-white/5"></div>
                                 <div className="text-right space-y-1.5">
                                   <div className="text-white/20 uppercase tracking-widest text-[9px] font-black">Сумма</div>
                                   <div className="font-black text-base text-white/80">{(listing.amount * listing.pricePerUnit).toLocaleString()} ₽</div>
                                 </div>
                               </div>

                               <motion.button 
                                 whileHover={{ scale: 1.02, backgroundColor: '#FFFFFF', color: '#000000' }}
                                 whileTap={{ scale: 0.98 }}
                                 onClick={() => buyFromMarket(listing.id)}
                                 className="w-full bg-white/5 text-white/60 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-white/5 hover:border-white/20 transition-all relative z-10"
                               >
                                 Исполнить Ордер
                               </motion.button>
                             </motion.div>
                           ))
                         )}
                       </div>
                    </div>
                  )}

                  {marketSubTab === 'gifts' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-10"
                    >
                      {/* Mystery Puzzle Card */}
                      <motion.div 
                        whileHover={{ scale: 1.01 }}
                        className="bg-gradient-to-br from-purple-900/40 to-black p-12 rounded-[3rem] border border-purple-500/20 shadow-2xl relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                          <div className="space-y-4 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 rounded-full border border-purple-500/20">
                              <Sparkles className="w-4 h-4 text-purple-400" />
                              <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Секретный Дроп</span>
                            </div>
                            <h2 className="text-5xl font-black tracking-tighter text-white font-serif italic">
                              {mysteryRevealed ? 'NFT РАЗБЛОКИРОВАН' : 'NFT ПОД ЗАГАДКОЙ'}
                            </h2>
                            <p className="text-white/40 font-serif italic text-lg max-w-md">
                              {mysteryRevealed 
                                ? 'Уникальный цифровой артефакт теперь доступен для самых быстрых.' 
                                : 'Что-то легендарное готовится к выходу. Будьте готовы к моменту истины.'}
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-center gap-6">
                            {!mysteryRevealed ? (
                              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 text-center min-w-[240px] shadow-2xl">
                                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">До раскрытия</div>
                                <div className="text-6xl font-mono font-black text-white tracking-tighter tabular-nums">
                                  {formatTime(mysteryTimer)}
                                </div>
                              </div>
                            ) : (
                              <motion.button
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(168, 85, 247, 0.4)' }}
                                className="bg-white text-black px-12 py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-sm shadow-2xl"
                              >
                                ЗАБРАТЬ NFT
                              </motion.button>
                            )}
                          </div>
                        </div>
                        
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:bg-purple-500/20 transition-colors"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/5 rounded-full blur-[100px] -ml-32 -mb-32"></div>
                      </motion.div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {gifts.map(gift => (
                          <motion.div 
                            key={gift.id}
                            whileHover={{ y: -5 }}
                            className="bg-[#141414] p-8 rounded-[3rem] border border-white/5 shadow-xl hover:shadow-2xl hover:shadow-white/5 transition-all group relative overflow-hidden"
                          >
                            <div className="aspect-square relative rounded-[2rem] overflow-hidden mb-8">
                              <img 
                                src={gift.imageUrl} 
                                alt={gift.name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                              <div className="absolute top-4 right-4 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Stock: {gift.stock}</span>
                              </div>
                            </div>
                            <div className="space-y-6">
                              <div>
                                <h3 className="text-2xl font-black tracking-tighter text-white font-serif italic">{gift.name}</h3>
                                <p className="text-xs text-white/20 font-serif italic mt-1">Эксклюзивный подарок</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-2xl font-mono font-black text-white">{gift.price} <span className="text-sm opacity-20">₽</span></div>
                                <motion.button
                                  whileHover={{ scale: 1.05, backgroundColor: '#FFFFFF', color: '#000000' }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    try {
                                      buyGift(gift.id);
                                      setNotification({ message: `Вы успешно купили ${gift.name}!`, type: 'success' });
                                    } catch (e: any) {
                                      setNotification({ message: e.message, type: 'error' });
                                    }
                                  }}
                                  disabled={gift.stock <= 0}
                                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${gift.stock > 0 ? 'bg-white/10 text-white border border-white/10' : 'bg-white/5 text-white/10 cursor-not-allowed'}`}
                                >
                                  {gift.stock > 0 ? 'Купить' : 'Sold Out'}
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {activeTab === 'inventory' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-10"
                >
                  {/* Inventory Header */}
                  <div className="bg-[#141414] p-12 rounded-[3rem] border border-white/5 shadow-2xl flex items-center justify-between">
                    <div>
                      <h2 className="text-4xl font-black tracking-tighter text-white font-serif italic">Ваш Инвентарь</h2>
                      <p className="text-white/20 font-serif italic text-lg mt-2">Все ваши цифровые активы в одном месте</p>
                    </div>
                    <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/5">
                      <Package className="w-10 h-10 text-white/20" />
                    </div>
                  </div>

                  {/* Gifts Section */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 px-2">
                      <h3 className="text-2xl font-black tracking-tighter text-white/40 font-serif italic">Подарки</h3>
                      <div className="h-px flex-1 bg-white/5"></div>
                    </div>
                    
                    {user.gifts && user.gifts.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {user.gifts.map((ug, idx) => {
                          const giftInfo = gifts.find(g => g.id === ug.giftId);
                          return (
                            <motion.div 
                              key={ug.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.05 }}
                              onClick={() => setSelectedUserGiftId(ug.id)}
                              className={`bg-[#141414] rounded-3xl border p-5 space-y-4 group hover:border-white/20 transition-all cursor-pointer ${selectedUserGiftId === ug.id ? 'border-white/40 ring-1 ring-white/40' : 'border-white/5'}`}
                            >
                              <div className="aspect-square rounded-2xl overflow-hidden relative">
                                <img 
                                  src={giftInfo?.imageUrl} 
                                  alt={giftInfo?.name} 
                                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-black text-white tracking-tight">{giftInfo?.name}</div>
                                <div className="text-[9px] text-white/20 font-mono mt-1 uppercase tracking-widest">{new Date(ug.purchaseDate).toLocaleDateString()}</div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-white/[0.02] rounded-[2rem] border border-white/5 p-12 text-center">
                        <Gift className="w-12 h-12 text-white/5 mx-auto mb-4" />
                        <p className="text-white/20 font-serif italic">У вас пока нет подарков.</p>
                      </div>
                    )}
                  </div>

                  {/* Action Card Modal */}
                  <AnimatePresence>
                    {selectedUserGiftId && (
                      <motion.div 
                        key="gift-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedUserGiftId(null)}
                      >
                        <motion.div 
                          key="gift-modal-content"
                          initial={{ scale: 0.9, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0.9, y: 20 }}
                          className="bg-[#1a1a1a] w-full max-w-lg rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {(() => {
                            const ug = user.gifts.find(g => g.id === selectedUserGiftId);
                            const giftInfo = gifts.find(g => g.id === ug?.giftId);
                            if (!ug || !giftInfo) return null;
                            const upgradeCost = giftInfo.price * 0.1;

                            return (
                              <div className="p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10">
                                      <img src={ug.nftImageUrl || giftInfo.imageUrl} alt={giftInfo.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    </div>
                                    <div>
                                      <h3 className="text-2xl font-black text-white font-serif italic">{giftInfo.name}</h3>
                                      <p className="text-[10px] text-white/20 uppercase tracking-widest font-black">Обычный Подарок</p>
                                    </div>
                                  </div>
                                  <button onClick={() => setSelectedUserGiftId(null)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                                    <X className="w-5 h-5 text-white/40" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 space-y-2">
                                    <div className="text-[8px] text-white/20 uppercase tracking-widest font-black">Дата получения</div>
                                    <div className="text-sm font-mono font-black text-white">{new Date(ug.purchaseDate).toLocaleDateString()}</div>
                                  </div>
                                  <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 space-y-2">
                                    <div className="text-[8px] text-white/20 uppercase tracking-widest font-black">Статус</div>
                                    <div className="text-sm font-black text-white/60">STANDARD</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Roulette Modal */}
                  <AnimatePresence>
                  </AnimatePresence>

                  {/* Upgrade Result Modal */}
                  <AnimatePresence>
                  </AnimatePresence>
                </motion.div>
              )}

              {activeTab === 'usernames' && (
                <motion.div 
                  key="usernames"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-40 bg-[#141414] rounded-[3rem] border border-dashed border-white/5"
                >
                  <LayoutGrid className="w-24 h-24 text-white/5 mb-8" />
                  <h2 className="text-4xl font-black tracking-tighter text-white font-serif italic mb-4">Юзернеймы</h2>
                  <div className="px-6 py-2 bg-white/5 rounded-full border border-white/10">
                    <span className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Скоро в продаже</span>
                  </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#141414] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden"
                >
                  <div className="p-12 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-3xl font-black tracking-tighter text-white font-serif italic">Активные Ордера</h2>
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                      <History className="w-7 h-7 text-white/20" />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/[0.01]">
                          <th className="px-12 py-8 text-[10px] uppercase tracking-[0.3em] font-black text-white/20">Актив</th>
                          <th className="px-12 py-8 text-[10px] uppercase tracking-[0.3em] font-black text-white/20">Объем</th>
                          <th className="px-12 py-8 text-[10px] uppercase tracking-[0.3em] font-black text-white/20">Цена/Ед.</th>
                          <th className="px-12 py-8 text-[10px] uppercase tracking-[0.3em] font-black text-white/20">Всего</th>
                          <th className="px-12 py-8 text-[10px] uppercase tracking-[0.3em] font-black text-white/20 text-right">Статус</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {listings.filter(l => l.sellerId === user.id).length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-12 py-40 text-center">
                              <div className="flex flex-col items-center">
                                <History className="w-20 h-20 text-white/5 mb-6" />
                                <p className="text-white/20 font-serif italic text-xl">Нет открытых позиций в стакане.</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          listings.filter(l => l.sellerId === user.id).map(listing => (
                            <tr key={listing.id} className="hover:bg-white/[0.01] transition-colors group">
                              <td className="px-12 py-8">
                                <div className="flex items-center gap-5">
                                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/5">
                                    {(() => {
                                      const Icon = ASSET_ICONS[listing.assetId];
                                      return <Icon className="text-black w-6 h-6" />;
                                    })()}
                                  </div>
                                  <span className="font-black text-base font-mono text-white/80">{listing.assetId}</span>
                                </div>
                              </td>
                              <td className="px-12 py-8 font-mono text-sm font-bold text-white/60">{listing.amount}</td>
                              <td className="px-12 py-8 font-mono text-sm font-bold text-white/60">{listing.pricePerUnit.toFixed(2)}</td>
                              <td className="px-12 py-8 font-mono text-lg font-black text-white">{(listing.amount * listing.pricePerUnit).toLocaleString()} ₽</td>
                              <td className="px-12 py-8 text-right">
                                <motion.button 
                                  whileHover={{ scale: 1.05, color: '#ef4444' }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleCancelListing(listing.id)}
                                  className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-end gap-3 ml-auto hover:text-red-500 transition-colors"
                                >
                                  <X className="w-4 h-4" /> Отозвать
                                </motion.button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
              {activeTab === 'admin' && user.email === 'masterskaaviksi7@gmail.com' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-10"
                >
                  <div className="bg-[#141414] p-12 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 space-y-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-4xl font-black tracking-tighter text-white font-serif italic mb-2">Панель Управления</h2>
                          <p className="text-white/20 font-serif italic text-lg">Эксклюзивный доступ: {user.email}</p>
                        </div>
                        <Settings className="w-16 h-16 text-white/5" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Price Boost Toggle */}
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer flex flex-col justify-between h-64 ${adminSettings.priceBoost ? 'bg-white border-white shadow-[0_20px_40px_rgba(255,255,255,0.1)]' : 'bg-white/[0.02] border-white/5'}`}
                          onClick={togglePriceBoost}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${adminSettings.priceBoost ? 'bg-black text-white' : 'bg-white/5 text-white/40'}`}>
                              <Zap className="w-7 h-7" />
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${adminSettings.priceBoost ? 'bg-black/10 text-black' : 'bg-white/5 text-white/20'}`}>
                              {adminSettings.priceBoost ? 'ACTIVE' : 'INACTIVE'}
                            </div>
                          </div>
                          <div>
                            <div className={`text-xl font-black tracking-tight mb-2 ${adminSettings.priceBoost ? 'text-black' : 'text-white'}`}>Усиление Роста</div>
                            <p className={`text-xs font-serif italic ${adminSettings.priceBoost ? 'text-black/60' : 'text-white/20'}`}>Увеличивает шанс на подорожание всех активов в системе.</p>
                          </div>
                        </motion.div>

                        {/* Luck Event Toggle */}
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer flex flex-col justify-between h-64 ${adminSettings.luckEvent ? 'bg-white border-white shadow-[0_20px_40px_rgba(255,255,255,0.1)]' : 'bg-white/[0.02] border-white/5'}`}
                          onClick={() => adminSettings.luckEvent ? stopLuckEvent() : startLuckEvent()}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${adminSettings.luckEvent ? 'bg-black text-white' : 'bg-white/5 text-white/40'}`}>
                              <Sparkles className="w-7 h-7" />
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${adminSettings.luckEvent ? 'bg-black/10 text-black' : 'bg-white/5 text-white/20'}`}>
                              {adminSettings.luckEvent ? 'RUNNING' : 'READY'}
                            </div>
                          </div>
                          <div>
                            <div className={`text-xl font-black tracking-tight mb-2 ${adminSettings.luckEvent ? 'text-black' : 'text-white'}`}>Ивент 2х Удача</div>
                            <p className={`text-xs font-serif italic ${adminSettings.luckEvent ? 'text-black/60' : 'text-white/20'}`}>
                              {adminSettings.luckEvent ? 'Ивент активен! Нажмите, чтобы остановить.' : 'Запустить глобальный ивент на 2 минуты.'}
                            </p>
                            {adminSettings.luckEvent && adminSettings.luckEventEndTime && (
                              <div className="mt-4 h-1 w-full bg-black/10 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: '100%' }}
                                  animate={{ width: '0%' }}
                                  transition={{ duration: (adminSettings.luckEventEndTime - Date.now()) / 1000, ease: 'linear' }}
                                  className="h-full bg-black"
                                />
                              </div>
                            )}
                          </div>
                        </motion.div>

                        {/* Percentage Adjustment */}
                        <div className="p-8 rounded-[2.5rem] border bg-white/[0.02] border-white/5 md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-8">
                          <div className="space-y-2">
                            <div className="text-xl font-black tracking-tight text-white">Корректировка Цен</div>
                            <p className="text-xs font-serif italic text-white/20">Изменение стоимости всех активов на указанный процент.</p>
                          </div>
                          <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative">
                              <input 
                                type="number" 
                                value={adminPercentage}
                                onChange={(e) => setAdminPercentage(e.target.value)}
                                className="w-32 px-6 py-4 bg-white/[0.05] rounded-2xl border border-white/10 text-white font-mono font-black text-center outline-none focus:border-white/30 transition-all"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-black">%</span>
                            </div>
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: '#ef4444' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  adjustPricesByPercentage(-parseFloat(adminPercentage));
                                  setNotification({ message: `Цены снижены на ${adminPercentage}%`, type: 'info' });
                                }}
                                className="px-6 py-4 bg-red-500/20 text-red-400 border border-red-500/20 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                              >
                                -
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: '#22c55e' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  adjustPricesByPercentage(parseFloat(adminPercentage));
                                  setNotification({ message: `Цены повышены на ${adminPercentage}%`, type: 'info' });
                                }}
                                className="px-6 py-4 bg-green-500/20 text-green-400 border border-green-500/20 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                              >
                                +
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Registered Users List */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between px-4">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Зарегистрированные Пользователи ({Object.keys(allUsers).length})</h3>
                        </div>
                        <div className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-white/5">
                                  <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-white/20">Email</th>
                                  <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-white/20">Баланс</th>
                                  <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-white/20">Активы</th>
                                  <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-white/20">Подарки</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {Object.values(allUsers).map((u: any) => (
                                  <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="px-8 py-6">
                                      <div className="text-sm font-black text-white/80">{u.email}</div>
                                      <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest mt-1">ID: {u.id}</div>
                                    </td>
                                    <td className="px-8 py-6 font-mono text-sm font-bold text-white/60">{u.balance.toLocaleString()} ₽</td>
                                    <td className="px-8 py-6">
                                      <div className="flex gap-2">
                                        {Object.entries(u.holdings)
                                          .filter(([_, amount]) => (amount as number) > 0)
                                          .map(([id, amount]) => (
                                            <div key={id} className="px-2 py-1 bg-white/5 rounded text-[8px] font-mono font-bold text-white/40">
                                              {id}: {amount}
                                            </div>
                                          ))}
                                      </div>
                                    </td>
                                    <td className="px-8 py-6">
                                      <div className="text-sm font-mono font-bold text-white/60">{u.gifts?.length || 0} шт.</div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[120px] -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -ml-32 -mb-32"></div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Asset Details Modal */}
      <AnimatePresence>
        {selectedAssetForDetails && (
          <motion.div 
            key="asset-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedAssetForDetails(null)}
          >
            <motion.div 
              key="asset-modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#141414] w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden relative"
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                const asset = assets[selectedAssetForDetails];
                const Icon = ASSET_ICONS[selectedAssetForDetails];
                const isUp = asset.price >= asset.initialPrice;
                
                return (
                  <div className="p-12 space-y-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden" style={{ backgroundColor: `${asset.color}10`, color: asset.color }}>
                          <Icon className="w-10 h-10 relative z-10" />
                          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white to-transparent"></div>
                        </div>
                        <div>
                          <h2 className="text-4xl font-black tracking-tighter text-white font-serif italic">{asset.name}</h2>
                          <div className="text-xs text-white/20 font-mono uppercase tracking-widest font-bold mt-1">{selectedAssetForDetails} PROTOCOL</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedAssetForDetails(null)}
                        className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/5"
                      >
                        <X className="w-6 h-6 text-white/40" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="p-8 bg-white/[0.02] rounded-3xl border border-white/5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">Текущая Цена</div>
                        <div className="text-4xl font-mono font-black text-white">{asset.price.toFixed(2)} <span className="text-xl opacity-20">₽</span></div>
                        <div className={`text-sm font-black flex items-center gap-2 mt-3 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                          {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {Math.abs(((asset.price - asset.initialPrice) / asset.initialPrice) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-8 bg-white/[0.02] rounded-3xl border border-white/5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">Резерв Системы</div>
                        <div className="text-4xl font-mono font-black text-white">{asset.supply.toFixed(0)}</div>
                        <div className="text-xs text-white/40 font-mono mt-3 uppercase tracking-widest">Ликвидность: High</div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Быстрая Покупка</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Баланс: {user.balance.toLocaleString()} ₽</span>
                      </div>
                      <div className="flex gap-4">
                        {[1, 10, 100].map(qty => (
                          <motion.button
                            key={qty}
                            whileHover={{ scale: 1.02, backgroundColor: '#FFFFFF', color: '#000000' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              try {
                                buyFromSystem(selectedAssetForDetails, qty);
                                setNotification({ message: `Куплено ${qty} ${selectedAssetForDetails}`, type: 'success' });
                              } catch (e: any) {
                                setNotification({ message: e.message, type: 'error' });
                              }
                            }}
                            className="flex-1 bg-white/5 border border-white/5 py-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                          >
                            +{qty} {selectedAssetForDetails}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <p className="text-[10px] text-white/10 font-mono uppercase tracking-[0.3em] text-center">
                        ROGRAM TRADING PROTOCOL • SECURE DECENTRALIZED EXECUTION
                      </p>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto p-12 mt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-white/10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase">ROGRAM Global Exchange Infrastructure</span>
        </div>
        <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-center md:text-right leading-relaxed">
          &copy; 2026 ROGRAM Terminal • Децентрализованная P2P Сеть • Протокол v4.2.1 • Все права защищены
        </div>
      </footer>
    </div>
  );
}
