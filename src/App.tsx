import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Settings, Play, Info, BarChart2, ChevronLeft, Lock, Star, MoreVertical, Volume2, VolumeX, RotateCcw, Home } from 'lucide-react';
import { useGame } from './useGame';
import { GameCanvas } from './components/GameCanvas';
import { LEVELS, COLORS } from './constants';
import { Direction } from './types';

type Screen = 'MENU' | 'LEVEL_SELECT' | 'GAME' | 'SETTINGS' | 'STATS';

export default function App() {
  const [screen, setScreen] = useState<Screen>('MENU');
  const [isKebabMenuOpen, setIsKebabMenuOpen] = useState(false);
  const { gameState, setGameState, startGame, playerData, setPlayerData, getObstaclePercentage } = useGame();

  const toggleKebabMenu = () => {
    const newState = !isKebabMenuOpen;
    setIsKebabMenuOpen(newState);
    // Only pause if we are in the game screen and not already game over/level up
    if (screen === 'GAME' && !gameState.isGameOver && !gameState.isLevelUp) {
      setGameState(p => ({ ...p, isPaused: newState }));
    }
  };

  const currentLevelDef = LEVELS.find(l => l.id === gameState.level) || LEVELS[0];

  const handleLevelSelect = (id: number) => {
    if (playerData.unlockedLevels.includes(id)) {
      startGame(id);
      setScreen('GAME');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white font-sans selection:bg-emerald-500/30 overflow-hidden flex flex-col items-center justify-center p-4">
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {screen === 'MENU' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 flex flex-col items-center gap-8"
          >
            <div className="text-center">
              <motion.h1 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl md:text-8xl font-black tracking-tighter bg-gradient-to-b from-emerald-400 to-emerald-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(52,211,153,0.3)]"
              >
                SNAKU
              </motion.h1>
              <p className="text-emerald-400/60 font-medium tracking-widest uppercase text-xs md:text-sm mt-2">Snake Manzia Edition</p>
            </div>

            <div className="flex flex-col gap-3 md:gap-4 w-full max-w-[280px]">
              <MenuButton icon={<Play size={20} />} label="PLAY" color="bg-emerald-500" onClick={() => { startGame(playerData.unlockedLevels[playerData.unlockedLevels.length - 1]); setScreen('GAME'); }} />
              <MenuButton icon={<Trophy size={20} />} label="LEVEL SELECT" color="bg-blue-500" onClick={() => setScreen('LEVEL_SELECT')} />
              <MenuButton icon={<Settings size={20} />} label="SETTINGS" color="bg-orange-500" onClick={() => setScreen('SETTINGS')} />
              <MenuButton icon={<BarChart2 size={20} />} label="STATISTICS" color="bg-purple-500" onClick={() => setScreen('STATS')} />
            </div>
          </motion.div>
        )}

        {screen === 'LEVEL_SELECT' && (
          <motion.div
            key="levels"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="relative z-10 w-full max-w-6xl px-4"
          >
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <button onClick={() => setScreen('MENU')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ChevronLeft size={24} className="md:w-8 md:h-8" />
              </button>
              <h2 className="text-2xl md:text-4xl font-bold">LEVEL SELECT</h2>
              <div className="w-10" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar pb-8">
              {LEVELS.map(level => {
                const isUnlocked = playerData.unlockedLevels.includes(level.id);
                const bestScore = playerData.levelBestScores[level.id] || 0;
                return (
                  <motion.div
                    key={level.id}
                    whileHover={isUnlocked ? { scale: 1.02 } : {}}
                    whileTap={isUnlocked ? { scale: 0.98 } : {}}
                    onClick={() => handleLevelSelect(level.id)}
                    className={`relative p-5 md:p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 ${
                      isUnlocked 
                        ? 'bg-white/5 border-white/10 hover:border-emerald-500/50' 
                        : 'bg-black/40 border-white/5 opacity-60'
                    }`}
                  >
                    {!isUnlocked && <Lock className="absolute top-4 right-4 text-white/20" size={18} />}
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Level {level.id}</span>
                    <h3 className="text-lg md:text-xl font-bold leading-tight">{level.name}</h3>
                    <div className="flex gap-1 mt-auto pt-4">
                      {[1, 2, 3].map(s => (
                        <Star key={s} size={12} className={bestScore >= level.pointsToPass * (s * 0.33) ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'} />
                      ))}
                    </div>
                    <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">
                      {isUnlocked ? `Best: ${bestScore} / Goal: ${level.pointsToPass}` : `Unlock: ${level.unlockPoints} Total Pts`}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {screen === 'GAME' && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 flex flex-col items-center gap-4 md:gap-6 w-full max-w-4xl h-full max-h-screen"
          >
            {/* HUD */}
            <div className="w-full flex justify-between items-center bg-black/40 backdrop-blur-md p-3 md:p-4 rounded-2xl border border-white/10 relative">
              <div className="flex flex-col">
                <span className="text-[10px] md:text-xs font-bold text-white/40 uppercase tracking-widest">Level {gameState.level}</span>
                <span className="text-sm md:text-xl font-black truncate max-w-[80px] md:max-w-none">{currentLevelDef.name}</span>
                {getObstaclePercentage(gameState.level) > 0 && (
                  <span className="text-[8px] md:text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    {getObstaclePercentage(gameState.level).toFixed(1)}% Obstacles
                  </span>
                )}
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-[10px] md:text-xs font-bold text-white/40 uppercase tracking-widest">Score / Target</span>
                <div className="flex items-baseline gap-1 md:gap-2">
                  <motion.span 
                    key={gameState.score}
                    initial={{ scale: 1.2, color: '#10b981' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    className="text-2xl md:text-4xl font-black tabular-nums"
                  >
                    {gameState.score}
                  </motion.span>
                  <span className="text-sm md:text-xl font-bold text-white/20">/ {currentLevelDef.pointsToPass}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] md:text-xs font-bold text-white/40 uppercase tracking-widest">High Score</span>
                  <span className="text-sm md:text-xl font-black tabular-nums">{playerData.highScore}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setPlayerData(p => ({ 
                      ...p, 
                      settings: { 
                        ...p.settings, 
                        musicEnabled: !p.settings.musicEnabled,
                        sfxEnabled: !p.settings.sfxEnabled 
                      } 
                    }))}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                  >
                    {playerData.settings.sfxEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </button>

                  <button 
                    onClick={toggleKebabMenu}
                    className="p-3 bg-emerald-500 hover:bg-emerald-400 border-2 border-white/40 rounded-full transition-all text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] z-[10000] active:scale-90 flex items-center justify-center"
                    title="Open Menu"
                  >
                    <MoreVertical size={28} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full flex flex-col gap-1 px-2">
              <div className="flex justify-between text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest">
                <span>Progress</span>
                <span>{Math.floor(Math.min(100, (gameState.score / currentLevelDef.pointsToPass) * 100))}%</span>
              </div>
              <div className="w-full h-2 md:h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (gameState.score / currentLevelDef.pointsToPass) * 100)}%` }}
                />
              </div>
            </div>

            {/* Game Area */}
            <div className="relative flex-grow w-full flex items-center justify-center min-h-0 overflow-hidden">
              <GameCanvas gameState={gameState} width={currentLevelDef.width} height={currentLevelDef.height} />
              
              {/* Overlays */}
              <AnimatePresence>
                {gameState.isPaused && !gameState.isGameOver && !gameState.isLevelUp && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-20"
                  >
                    <h2 className="text-4xl md:text-6xl font-black mb-8">PAUSED</h2>
                    <div className="flex flex-col gap-4 w-48">
                      <MenuButton label="RESUME" color="bg-emerald-500" onClick={() => { setGameState(p => ({ ...p, isPaused: false })); setIsKebabMenuOpen(false); }} />
                      <MenuButton label="QUIT" color="bg-red-500" onClick={() => setScreen('MENU')} />
                    </div>
                  </motion.div>
                )}

                {gameState.isLevelUp && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-30 p-2 sm:p-4 md:p-8"
                  >
                    <motion.div
                      initial={{ scale: 0.8, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      className="bg-[#111827] border-2 border-emerald-500/50 rounded-2xl p-4 sm:p-8 md:p-10 flex flex-col items-center shadow-[0_0_50px_rgba(16,185,129,0.2)] w-full max-w-[95%] sm:max-w-[80%] md:max-w-2xl lg:max-w-3xl overflow-y-auto max-h-[95%]"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5, repeat: 3 }}
                      >
                        <Star size={40} className="md:w-16 md:h-16 text-yellow-400 fill-yellow-400 mb-3 md:mb-6" />
                      </motion.div>
                      
                      <div className="text-center mb-6 md:mb-10">
                        <h2 className="text-xl sm:text-3xl md:text-5xl font-black text-emerald-400 uppercase tracking-tighter mb-1">MISSION COMPLETE!</h2>
                        <p className="text-[10px] sm:text-xs md:text-sm text-white/60 uppercase tracking-widest font-bold">Level {gameState.level} Cleared Successfully</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 w-full">
                        <div className="sm:col-span-2">
                          <MenuButton label="NEXT LEVEL" color="bg-emerald-500" onClick={() => { setGameState(p => ({ ...p, isLevelUp: false })); startGame(gameState.level + 1); }} />
                        </div>
                        <MenuButton label="REPLAY" color="bg-white/5" onClick={() => startGame(gameState.level)} />
                        <MenuButton label="LEVEL SELECT" color="bg-white/5" onClick={() => setScreen('LEVEL_SELECT')} />
                        <div className="sm:col-span-2">
                          <MenuButton label="MAIN MENU" color="bg-white/5" onClick={() => setScreen('MENU')} />
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {gameState.isGameOver && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20 p-2 sm:p-4 md:p-8"
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      className="bg-[#111827] border-2 border-red-500/50 rounded-2xl p-4 sm:p-8 md:p-10 flex flex-col items-center shadow-[0_0_50px_rgba(239,68,68,0.2)] w-full max-w-[95%] sm:max-w-[80%] md:max-w-2xl lg:max-w-3xl overflow-y-auto max-h-[95%]"
                    >
                      <div className="text-center mb-6 md:mb-10">
                        <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-red-500 uppercase tracking-tighter mb-1">GAME OVER</h2>
                        <p className="text-[10px] sm:text-xs md:text-sm text-white/40 uppercase tracking-widest font-bold">The snake has fallen. Try again!</p>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6 mb-8 md:mb-12 w-full">
                        <StatBox label="Score" value={gameState.score} />
                        <StatBox label="Size" value={gameState.snake.length} />
                        <StatBox label="Combo" value={`x${gameState.combo.toFixed(1)}`} />
                        <StatBox label="Level" value={gameState.level} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 w-full">
                        <div className="sm:col-span-3">
                          <MenuButton label="TRY AGAIN" color="bg-emerald-500" onClick={() => startGame(gameState.level)} />
                        </div>
                        <MenuButton label="LEVEL SELECT" color="bg-white/5" onClick={() => setScreen('LEVEL_SELECT')} />
                        <MenuButton label="SETTINGS" color="bg-white/5" onClick={() => setScreen('SETTINGS')} />
                        <MenuButton label="MAIN MENU" color="bg-white/5" onClick={() => setScreen('MENU')} />
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Controls */}
            <div className="md:hidden grid grid-cols-3 gap-3 p-4 bg-black/20 rounded-3xl backdrop-blur-sm border border-white/5 mb-4">
              <div />
              <ControlButton icon="▲" onClick={() => setGameState(p => ({ ...p, nextDirection: Direction.UP }))} />
              <div />
              <ControlButton icon="◀" onClick={() => setGameState(p => ({ ...p, nextDirection: Direction.LEFT }))} />
              <ControlButton icon="▼" onClick={() => setGameState(p => ({ ...p, nextDirection: Direction.DOWN }))} />
              <ControlButton icon="▶" onClick={() => setGameState(p => ({ ...p, nextDirection: Direction.RIGHT }))} />
            </div>

            {/* Footer Stats */}
            <div className="hidden md:flex gap-12 text-white/40 font-bold uppercase tracking-widest text-xs pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: gameState.rainbowTimer > 0 ? 'white' : gameState.snakeColor }} />
                {gameState.rainbowTimer > 0 ? 'RAINBOW MODE' : 'Snake Color'}
              </div>
              <div>Combo: ×{gameState.combo.toFixed(2)}</div>
              <div>Size: {gameState.snake.length}</div>
              {gameState.rainbowTimer > 0 && (
                <div className="text-emerald-400 animate-pulse">
                  RAINBOW: {(gameState.rainbowTimer / 1000).toFixed(1)}s
                </div>
              )}
            </div>

            {/* Kebab Menu Dropdown - Moved to root of GAME screen for absolute top-level stacking */}
            <AnimatePresence>
              {isKebabMenuOpen && (
                <>
                  {/* Ultra-high priority backdrop */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={toggleKebabMenu}
                    className="fixed inset-0 z-[99998] bg-black/60 backdrop-blur-md"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className="fixed top-24 right-4 md:right-12 w-72 bg-[#0f172a] border-2 border-emerald-500 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.9)] z-[99999] overflow-hidden"
                  >
                    <div className="p-4 flex flex-col gap-2">
                      <div className="px-4 py-3 mb-2 border-b border-white/10 flex justify-between items-center">
                        <span className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em]">Game Menu</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <button 
                        onClick={() => { startGame(gameState.level); setIsKebabMenuOpen(false); }}
                        className="flex items-center gap-4 w-full p-5 hover:bg-emerald-500/10 rounded-2xl transition-all text-lg font-black group text-white hover:text-emerald-400"
                      >
                        <RotateCcw size={24} className="text-emerald-400 group-hover:rotate-[-45deg] transition-transform" />
                        RESTART LEVEL
                      </button>
                      <button 
                        onClick={() => { setScreen('SETTINGS'); setIsKebabMenuOpen(false); }}
                        className="flex items-center gap-4 w-full p-5 hover:bg-orange-500/10 rounded-2xl transition-all text-lg font-black group text-white hover:text-orange-400"
                      >
                        <Settings size={24} className="text-orange-400 group-hover:rotate-90 transition-transform" />
                        SETTINGS
                      </button>
                      <button 
                        onClick={() => { setScreen('MENU'); setIsKebabMenuOpen(false); }}
                        className="flex items-center gap-4 w-full p-5 hover:bg-blue-500/10 rounded-2xl transition-all text-lg font-black group text-white hover:text-blue-400"
                      >
                        <Home size={24} className="text-blue-400 group-hover:scale-110 transition-transform" />
                        MAIN MENU
                      </button>
                      <div className="h-px bg-white/10 my-3 mx-2" />
                      <button 
                        onClick={toggleKebabMenu}
                        className="flex items-center justify-center w-full p-5 bg-emerald-500 hover:bg-emerald-400 rounded-2xl text-white text-sm font-black uppercase tracking-[0.4em] transition-all shadow-lg active:scale-95"
                      >
                        Resume Game
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {screen === 'SETTINGS' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 mx-auto mt-20"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">SETTINGS</h2>
              <button onClick={() => setScreen('MENU')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-4 md:gap-6">
              <SettingItem label="Master Volume" value={playerData.settings.masterVolume} onChange={(v) => setPlayerData(p => ({ ...p, settings: { ...p.settings, masterVolume: v } }))} />
              <ToggleItem label="Music Enabled" active={playerData.settings.musicEnabled} onToggle={() => setPlayerData(p => ({ ...p, settings: { ...p.settings, musicEnabled: !p.settings.musicEnabled } }))} />
              <ToggleItem label="SFX Enabled" active={playerData.settings.sfxEnabled} onToggle={() => setPlayerData(p => ({ ...p, settings: { ...p.settings, sfxEnabled: !p.settings.sfxEnabled } }))} />
              <ToggleItem label="Particle Effects" active={playerData.settings.particlesEnabled} onToggle={() => setPlayerData(p => ({ ...p, settings: { ...p.settings, particlesEnabled: !p.settings.particlesEnabled } }))} />
              <ToggleItem label="Show Grid" active={playerData.settings.gridVisible} onToggle={() => setPlayerData(p => ({ ...p, settings: { ...p.settings, gridVisible: !p.settings.gridVisible } }))} />
              <SpeedSettingItem value={playerData.settings.gameSpeed || 1.0} onChange={(v) => setPlayerData(p => ({ ...p, settings: { ...p.settings, gameSpeed: v } }))} />
              
              <button 
                onClick={() => {
                  if(window.confirm('Are you sure you want to reset all progress?')) {
                    localStorage.removeItem('snaku_playerData');
                    window.location.reload();
                  }
                }}
                className="mt-2 md:mt-4 p-3 md:p-4 rounded-xl bg-red-500/10 text-red-500 text-sm md:text-base font-bold hover:bg-red-500/20 transition-colors"
              >
                RESET ALL PROGRESS
              </button>
            </div>
          </motion.div>
        )}

        {screen === 'STATS' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="relative z-10 w-full max-w-2xl bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 mx-auto mt-20"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">STATISTICS</h2>
              <button onClick={() => setScreen('MENU')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <StatCard label="All-Time High Score" value={playerData.highScore} />
              <StatCard label="Total Points Earned" value={playerData.totalPoints} />
              <StatCard label="Levels Unlocked" value={`${playerData.unlockedLevels.length}/12`} />
              <StatCard label="Best Level" value={Object.entries(playerData.levelBestScores).sort((a,b) => (b[1] as number) - (a[1] as number))[0]?.[0] || '-'} />
            </div>

            <div className="mt-8">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Level Best Scores</h3>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {LEVELS.map(l => (
                  <div key={l.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="font-bold">{l.name}</span>
                    <span className="tabular-nums text-emerald-400">{playerData.levelBestScores[l.id] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuButton({ icon, label, color, onClick }: { icon?: React.ReactNode, label: string, color: string, onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center justify-center gap-3 p-4 rounded-xl ${color} font-black tracking-widest text-sm shadow-lg shadow-black/20`}
    >
      {icon}
      {label}
    </motion.button>
  );
}

function ControlButton({ icon, onClick }: { icon: string, onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="w-14 h-14 md:w-16 md:h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-xl md:text-2xl font-bold border border-white/10 shadow-xl active:bg-emerald-500/20 active:border-emerald-500/50 transition-colors"
    >
      {icon}
    </motion.button>
  );
}

function SettingItem({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-white/60">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <input 
        type="range" min="0" max="100" value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
      />
    </div>
  );
}

function SpeedSettingItem({ value, onChange }: { value: number, onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-white/60">
        <span>Game Speed</span>
        <span>{value.toFixed(1)}x</span>
      </div>
      <input 
        type="range" min="0.5" max="2.0" step="0.1" value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
      />
    </div>
  );
}

function ToggleItem({ label, active, onToggle }: { label: string, active: boolean, onToggle: () => void }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-bold uppercase tracking-widest text-white/60">{label}</span>
      <button 
        onClick={onToggle}
        className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-emerald-500' : 'bg-white/10'}`}
      >
        <motion.div 
          animate={{ x: active ? 26 : 2 }}
          className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-md"
        />
      </button>
    </div>
  );
}

function StatCard({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
      <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-2xl font-black tabular-nums">{value}</div>
    </div>
  );
}

function StatBox({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl border border-white/5">
      <div className="text-[8px] sm:text-[10px] font-bold text-white/30 uppercase mb-1">{label}</div>
      <div className="text-lg sm:text-2xl md:text-3xl font-black tabular-nums">{value}</div>
    </div>
  );
}


