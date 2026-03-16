import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Settings, Play, Info, BarChart2, ChevronLeft, Lock, Star } from 'lucide-react';
import { useGame } from './useGame';
import { GameCanvas } from './components/GameCanvas';
import { LEVELS, COLORS } from './constants';
import { Direction } from './types';

type Screen = 'MENU' | 'LEVEL_SELECT' | 'GAME' | 'SETTINGS' | 'STATS';

export default function App() {
  const [screen, setScreen] = useState<Screen>('MENU');
  const { gameState, setGameState, startGame, playerData, setPlayerData } = useGame();

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
                className="text-8xl font-black tracking-tighter bg-gradient-to-b from-emerald-400 to-emerald-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(52,211,153,0.3)]"
              >
                SNAKU
              </motion.h1>
              <p className="text-emerald-400/60 font-medium tracking-widest uppercase text-sm mt-2">Snake Manzia Edition</p>
            </div>

            <div className="flex flex-col gap-4 w-64">
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
            className="relative z-10 w-full max-w-4xl"
          >
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => setScreen('MENU')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ChevronLeft size={32} />
              </button>
              <h2 className="text-4xl font-bold">LEVEL SELECT</h2>
              <div className="w-10" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {LEVELS.map(level => {
                const isUnlocked = playerData.unlockedLevels.includes(level.id);
                const bestScore = playerData.levelBestScores[level.id] || 0;
                return (
                  <motion.div
                    key={level.id}
                    whileHover={isUnlocked ? { scale: 1.05 } : {}}
                    whileTap={isUnlocked ? { scale: 0.95 } : {}}
                    onClick={() => handleLevelSelect(level.id)}
                    className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 ${
                      isUnlocked 
                        ? 'bg-white/5 border-white/10 hover:border-emerald-500/50' 
                        : 'bg-black/40 border-white/5 opacity-60'
                    }`}
                  >
                    {!isUnlocked && <Lock className="absolute top-4 right-4 text-white/20" size={20} />}
                    <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Level {level.id}</span>
                    <h3 className="text-xl font-bold leading-tight">{level.name}</h3>
                    <div className="flex gap-1 mt-auto pt-4">
                      {[1, 2, 3].map(s => (
                        <Star key={s} size={14} className={bestScore >= level.unlockPoints * (s * 0.5) ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'} />
                      ))}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">
                      {isUnlocked ? `Best: ${bestScore}` : `Unlock: ${level.unlockPoints} pts`}
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
            className="relative z-10 flex flex-col items-center gap-6"
          >
            {/* HUD */}
            <div className="w-full flex justify-between items-center bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 min-w-[600px]">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Level {gameState.level}</span>
                <span className="text-xl font-black">{currentLevelDef.name}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Current Score</span>
                <motion.span 
                  key={gameState.score}
                  initial={{ scale: 1.2, color: '#10b981' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  className="text-4xl font-black tabular-nums"
                >
                  {gameState.score}
                </motion.span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">High Score</span>
                <span className="text-xl font-black tabular-nums">{playerData.highScore}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (gameState.score / (LEVELS[gameState.level]?.unlockPoints || 1000)) * 100)}%` }}
              />
            </div>

            {/* Game Area */}
            <div className="relative">
              <GameCanvas gameState={gameState} width={currentLevelDef.width} height={currentLevelDef.height} />
              
              {/* Overlays */}
              <AnimatePresence>
                {gameState.isPaused && !gameState.isGameOver && !gameState.isLevelUp && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-20"
                  >
                    <h2 className="text-6xl font-black mb-8">PAUSED</h2>
                    <div className="flex flex-col gap-4 w-48">
                      <MenuButton label="RESUME" color="bg-emerald-500" onClick={() => setGameState(p => ({ ...p, isPaused: false }))} />
                      <MenuButton label="QUIT" color="bg-red-500" onClick={() => setScreen('MENU')} />
                    </div>
                  </motion.div>
                )}

                {gameState.isLevelUp && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                    className="absolute inset-0 bg-emerald-500/20 backdrop-blur-md flex flex-col items-center justify-center rounded-lg z-30 p-8 text-center border-4 border-emerald-500/50"
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: 3 }}
                    >
                      <Star size={80} className="text-yellow-400 fill-yellow-400 mb-4" />
                    </motion.div>
                    <h2 className="text-6xl font-black mb-2 text-emerald-400">LEVEL UP!</h2>
                    <p className="text-white/80 mb-8 uppercase tracking-widest font-bold">New Level Unlocked: {LEVELS.find(l => l.id === gameState.level + 1)?.name || 'Next'}</p>
                    
                    <div className="flex flex-col gap-4 w-64">
                      <MenuButton label="CONTINUE" color="bg-emerald-500" onClick={() => setGameState(p => ({ ...p, isLevelUp: false }))} />
                      <MenuButton label="NEXT LEVEL" color="bg-blue-500" onClick={() => { setGameState(p => ({ ...p, isLevelUp: false })); startGame(gameState.level + 1); }} />
                    </div>
                  </motion.div>
                )}

                {gameState.isGameOver && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-red-950/80 backdrop-blur-md flex flex-col items-center justify-center rounded-lg z-20 p-8 text-center"
                  >
                    <h2 className="text-6xl font-black mb-2 text-red-500">GAME OVER</h2>
                    <p className="text-white/60 mb-8 uppercase tracking-widest font-bold">You hit something!</p>
                    
                    <div className="grid grid-cols-2 gap-8 mb-12">
                      <div>
                        <div className="text-xs font-bold text-white/40 uppercase mb-1">Final Score</div>
                        <div className="text-3xl font-black">{gameState.score}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white/40 uppercase mb-1">Snake Size</div>
                        <div className="text-3xl font-black">{gameState.snake.length}</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 w-64">
                      <MenuButton label="RETRY" color="bg-emerald-500" onClick={() => startGame(gameState.level)} />
                      <MenuButton label="LEVEL SELECT" color="bg-blue-500" onClick={() => setScreen('LEVEL_SELECT')} />
                      <MenuButton label="MAIN MENU" color="bg-white/10" onClick={() => setScreen('MENU')} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Controls */}
            <div className="md:hidden grid grid-cols-3 gap-2 mt-4">
              <div />
              <ControlButton icon="▲" onClick={() => setGameState(p => ({ ...p, nextDirection: Direction.UP }))} />
              <div />
              <ControlButton icon="◀" onClick={() => setGameState(p => ({ ...p, nextDirection: Direction.LEFT }))} />
              <ControlButton icon="▼" onClick={() => setGameState(p => ({ ...p, nextDirection: Direction.DOWN }))} />
              <ControlButton icon="▶" onClick={() => setGameState(p => ({ ...p, nextDirection: Direction.RIGHT }))} />
            </div>

            {/* Footer Stats */}
            <div className="flex gap-12 text-white/40 font-bold uppercase tracking-widest text-xs">
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
          </motion.div>
        )}

        {screen === 'SETTINGS' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">SETTINGS</h2>
              <button onClick={() => setScreen('MENU')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <SettingItem label="Master Volume" value={playerData.settings.masterVolume} onChange={(v) => setPlayerData(p => ({ ...p, settings: { ...p.settings, masterVolume: v } }))} />
              <ToggleItem label="Music Enabled" active={playerData.settings.musicEnabled} onToggle={() => setPlayerData(p => ({ ...p, settings: { ...p.settings, musicEnabled: !p.settings.musicEnabled } }))} />
              <ToggleItem label="SFX Enabled" active={playerData.settings.sfxEnabled} onToggle={() => setPlayerData(p => ({ ...p, settings: { ...p.settings, sfxEnabled: !p.settings.sfxEnabled } }))} />
              <ToggleItem label="Particle Effects" active={playerData.settings.particlesEnabled} onToggle={() => setPlayerData(p => ({ ...p, settings: { ...p.settings, particlesEnabled: !p.settings.particlesEnabled } }))} />
              <ToggleItem label="Show Grid" active={playerData.settings.gridVisible} onToggle={() => setPlayerData(p => ({ ...p, settings: { ...p.settings, gridVisible: !p.settings.gridVisible } }))} />
              
              <button 
                onClick={() => {
                  if(confirm('Are you sure you want to reset all progress?')) {
                    localStorage.removeItem('snaku_playerData');
                    window.location.reload();
                  }
                }}
                className="mt-4 p-4 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-colors"
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
            className="relative z-10 w-full max-w-2xl bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">STATISTICS</h2>
              <button onClick={() => setScreen('MENU')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

function ControlButton({ icon, onClick }: { icon: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-2xl font-bold active:bg-white/20 active:scale-95 transition-all"
    >
      {icon}
    </button>
  );
}
