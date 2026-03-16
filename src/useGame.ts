import { useState, useEffect, useCallback, useRef } from 'react';
import { Point, Direction, GameState, FoodInstance, FoodType, LevelDef, PlayerData } from './types';
import { LEVELS, FOOD_DEFS, CELL_SIZE, KEY_MAP } from './constants';

import { sounds } from './sounds';

const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 7 },
  { x: 9, y: 7 },
  { x: 8, y: 7 },
];

export function useGame() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    highScore: 0,
    level: 1,
    snake: INITIAL_SNAKE,
    direction: Direction.RIGHT,
    nextDirection: Direction.RIGHT,
    food: [],
    obstacles: [],
    isPaused: true,
    isGameOver: false,
    isLevelUp: false,
    combo: 1,
    comboTimer: 0,
    totalPoints: 0,
    unlockedLevels: [1],
    snakeColor: '#00FF00',
    rainbowTimer: 0,
    foodEatenCount: 0,
  });

  const [playerData, setPlayerData] = useState<PlayerData>(() => {
    const saved = localStorage.getItem('snaku_playerData');
    if (saved) return JSON.parse(saved);
    return {
      highScore: 0,
      totalPoints: 0,
      unlockedLevels: [1],
      levelBestScores: {},
      settings: {
        masterVolume: 80,
        musicEnabled: true,
        sfxEnabled: true,
        particlesEnabled: true,
        gridVisible: false,
        gameSpeed: 1.0,
      },
    };
  });

  const gameLoopRef = useRef<number | null>(null);
  const lastMoveTimeRef = useRef<number>(0);

  const currentLevelDef = LEVELS.find(l => l.id === gameState.level) || LEVELS[0];

  const spawnFood = useCallback((snake: Point[], obstacles: Point[], levelDef: LevelDef): FoodInstance[] => {
    const newFood: FoodInstance[] = [];
    const count = 1; // Standard is 1 food at a time

    for (let i = 0; i < count; i++) {
      let x, y;
      let isValid = false;
      let attempts = 0;

      while (!isValid && attempts < 100) {
        x = Math.floor(Math.random() * levelDef.width);
        y = Math.floor(Math.random() * levelDef.height);
        
        const onSnake = snake.some(s => s.x === x && s.y === y);
        const onObstacle = obstacles.some(o => o.x === x && o.y === y);
        const onOtherFood = newFood.some(f => f.x === x && f.y === y);
        
        if (!onSnake && !onObstacle && !onOtherFood) {
          isValid = true;
        }
        attempts++;
      }

      if (isValid && x !== undefined && y !== undefined) {
        // Determine food type based on rarity and level
        const availableTypes = Object.values(FoodType).filter(type => {
          if (type === FoodType.POISON_FRUIT && !levelDef.poison) return false;
          if (type === FoodType.TIME_FRUIT && !levelDef.timeFruits) return false;
          if (type === FoodType.PORTAL_GEM && !levelDef.portals) return false;
          return true;
        });

        // Simple weighted random
        const totalFreq = availableTypes.reduce((sum, type) => sum + FOOD_DEFS[type].spawnFreq, 0);
        let rand = Math.random() * totalFreq;
        let selectedType = FoodType.APPLE;
        for (const type of availableTypes) {
          rand -= FOOD_DEFS[type].spawnFreq;
          if (rand <= 0) {
            selectedType = type;
            break;
          }
        }

        newFood.push({ x, y, type: selectedType });
      }
    }
    return newFood;
  }, []);

  const getObstaclePercentage = useCallback((level: number) => {
    if (level < 4) return 0;
    const maxLevels = LEVELS.length;
    // Progressive scaling from 1% at level 4 to 5% at level 12
    return 1 + ((level - 4) * (4 / (maxLevels - 4)));
  }, []);

  const generateObstacles = useCallback((levelDef: LevelDef): Point[] => {
    const percentage = getObstaclePercentage(levelDef.id);
    if (percentage === 0) return [];

    const obstacles: Point[] = [];
    const terrainCells = levelDef.width * levelDef.height;
    const count = Math.ceil(terrainCells * (percentage / 100));

    const startY = Math.floor(levelDef.height / 2);

    for (let i = 0; i < count; i++) {
      let x, y;
      let isValid = false;
      let attempts = 0;
      while (!isValid && attempts < 100) {
        x = Math.floor(Math.random() * levelDef.width);
        y = Math.floor(Math.random() * levelDef.height);
        
        // Avoid starting line (the horizontal line the snake starts on)
        const onStartLine = y === startY;
        
        const alreadyExists = obstacles.some(o => o.x === x && o.y === y);
        
        if (!onStartLine && !alreadyExists) isValid = true;
        attempts++;
      }
      if (isValid && x !== undefined && y !== undefined) obstacles.push({ x, y });
    }
    return obstacles;
  }, []);

  const startGame = useCallback((levelId: number) => {
    const levelDef = LEVELS.find(l => l.id === levelId) || LEVELS[0];
    const obstacles = generateObstacles(levelDef);
    const initialSnake = [
        { x: Math.floor(levelDef.width / 2), y: Math.floor(levelDef.height / 2) },
        { x: Math.floor(levelDef.width / 2) - 1, y: Math.floor(levelDef.height / 2) },
        { x: Math.floor(levelDef.width / 2) - 2, y: Math.floor(levelDef.height / 2) },
    ];
    
    setGameState(prev => ({
      ...prev,
      level: levelId,
      score: 0,
      snake: initialSnake,
      direction: Direction.RIGHT,
      nextDirection: Direction.RIGHT,
      obstacles,
      food: spawnFood(initialSnake, obstacles, levelDef),
      isPaused: false,
      isGameOver: false,
      isLevelUp: false,
      combo: 1,
      comboTimer: 0,
      snakeColor: '#00FF00',
      rainbowTimer: 0,
      foodEatenCount: 0,
    }));
  }, [generateObstacles, spawnFood]);

  const moveSnake = useCallback(() => {
    setGameState(prev => {
      if (prev.isPaused || prev.isGameOver) return prev;

      const head = prev.snake[0];
      const newHead = { ...head };

      switch (prev.nextDirection) {
        case Direction.UP: newHead.y -= 1; break;
        case Direction.DOWN: newHead.y += 1; break;
        case Direction.LEFT: newHead.x -= 1; break;
        case Direction.RIGHT: newHead.x += 1; break;
      }

      // Wrap around walls
      if (newHead.x < 0) newHead.x = currentLevelDef.width - 1;
      else if (newHead.x >= currentLevelDef.width) newHead.x = 0;
      
      if (newHead.y < 0) newHead.y = currentLevelDef.height - 1;
      else if (newHead.y >= currentLevelDef.height) newHead.y = 0;

      // Obstacle collision
      if (prev.obstacles.some(o => o.x === newHead.x && o.y === newHead.y)) {
        if (playerData.settings.sfxEnabled) {
          sounds.playDeath();
        }
        return { ...prev, isGameOver: true };
      }

      // Self collision
      if (prev.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
        if (playerData.settings.sfxEnabled) {
          sounds.playDeath();
        }
        return { ...prev, isGameOver: true };
      }

      const newSnake = [newHead, ...prev.snake];
      let newFood = [...prev.food];
      let newScore = prev.score;
      let newTotalPoints = prev.totalPoints;
      let newCombo = prev.combo;
      let newComboTimer = prev.comboTimer - (1000 / currentLevelDef.speed);
      let newSnakeColor = prev.snakeColor;
      let newRainbowTimer = Math.max(0, prev.rainbowTimer - (1000 / currentLevelDef.speed));
      let newFoodEatenCount = prev.foodEatenCount;
      
      const foodIndex = newFood.findIndex(f => f.x === newHead.x && f.y === newHead.y);
      
      if (foodIndex !== -1) {
        const eatenFood = newFood[foodIndex];
        const foodDef = FOOD_DEFS[eatenFood.type];
        
        if (playerData.settings.sfxEnabled) {
          sounds.playEat();
        }
        
        // Update snake color to food color
        newSnakeColor = foodDef.color;
        newFoodEatenCount += 1;

        // Check for rainbow mode (every 5 fruits)
        if (newFoodEatenCount % 5 === 0) {
          newRainbowTimer = 5000; // 5 seconds
        }

        // Update score with combo
        const pointsGained = Math.max(0, Math.floor(foodDef.points * prev.combo));
        newScore += pointsGained;
        newTotalPoints += pointsGained;
        
        // Update combo
        newCombo = Math.min(2.0, prev.combo + 0.25);
        newComboTimer = 5000; // 5 seconds

        // Handle growth/shrink
        if (foodDef.growth > 0) {
          // Keep the tail (already added head, so just don't pop)
          // For growth > 1, we might need to add more segments later or just handle it here
          // Simple way: if growth is 3, we don't pop for the next 2 moves as well?
          // Actually, standard snake: eat 1 food, grow 1. If food gives +3, we just don't pop for 3 moves.
          // Let's use a "pendingGrowth" state if we want multi-segment growth.
          // For now, let's just not pop the tail if growth > 0.
        } else if (foodDef.growth < 0) {
          // Shrink: pop twice or more
          const shrinkAmount = Math.abs(foodDef.growth);
          for(let i=0; i < shrinkAmount + 1; i++) {
             if (newSnake.length > 3) newSnake.pop();
          }
        }

        newFood = spawnFood(newSnake, prev.obstacles, currentLevelDef);
      } else {
        newSnake.pop();
        if (newComboTimer <= 0) {
          newCombo = 1;
        }
      }

      // Check level up
      const nextLevelDef = LEVELS.find(l => l.id === prev.level + 1);
      let isLevelUp = false;
      let unlockedLevels = [...prev.unlockedLevels];

      if (newScore >= currentLevelDef.pointsToPass && !prev.isLevelUp) {
        isLevelUp = true;
        if (nextLevelDef && !unlockedLevels.includes(nextLevelDef.id)) {
          unlockedLevels.push(nextLevelDef.id);
        }
        if (playerData.settings.sfxEnabled) {
          sounds.playLevelUp();
        }
        return {
          ...prev,
          score: newScore,
          totalPoints: newTotalPoints,
          isLevelUp: true,
          isPaused: true,
          unlockedLevels,
          snakeColor: newSnakeColor,
          rainbowTimer: newRainbowTimer,
          foodEatenCount: newFoodEatenCount,
        };
      }

      return {
        ...prev,
        snake: newSnake,
        food: newFood,
        score: newScore,
        totalPoints: newTotalPoints,
        direction: prev.nextDirection,
        combo: newCombo,
        comboTimer: newComboTimer,
        isLevelUp,
        unlockedLevels,
        snakeColor: newSnakeColor,
        rainbowTimer: newRainbowTimer,
        foodEatenCount: newFoodEatenCount,
      };
    });
  }, [currentLevelDef, spawnFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const dir = KEY_MAP[e.key];
      if (dir) {
        setGameState(prev => {
          // Prevent 180 turns
          if (dir === Direction.UP && prev.direction === Direction.DOWN) return prev;
          if (dir === Direction.DOWN && prev.direction === Direction.UP) return prev;
          if (dir === Direction.LEFT && prev.direction === Direction.RIGHT) return prev;
          if (dir === Direction.RIGHT && prev.direction === Direction.LEFT) return prev;
          return { ...prev, nextDirection: dir };
        });
      }
      if (e.key === ' ' || e.key === 'p') {
        setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameState.isPaused || gameState.isGameOver) return;

    const tick = (time: number) => {
      const baseSpeed = currentLevelDef.speed * (playerData.settings.gameSpeed || 1.0);
      const speedMs = 1000 / baseSpeed;
      if (time - lastMoveTimeRef.current >= speedMs) {
        moveSnake();
        lastMoveTimeRef.current = time;
      }
      gameLoopRef.current = requestAnimationFrame(tick);
    };

    gameLoopRef.current = requestAnimationFrame(tick);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState.isPaused, gameState.isGameOver, currentLevelDef.speed, moveSnake]);

  // Persist data
  useEffect(() => {
    const data: PlayerData = {
      highScore: Math.max(playerData.highScore, gameState.score),
      totalPoints: gameState.totalPoints,
      unlockedLevels: gameState.unlockedLevels,
      levelBestScores: {
        ...playerData.levelBestScores,
        [gameState.level]: Math.max(playerData.levelBestScores[gameState.level] || 0, gameState.score),
      },
      settings: playerData.settings,
    };
    setPlayerData(data);
    localStorage.setItem('snaku_playerData', JSON.stringify(data));
  }, [gameState.score, gameState.totalPoints, gameState.unlockedLevels, gameState.level]);

  return {
    gameState,
    setGameState,
    startGame,
    playerData,
    setPlayerData,
    getObstaclePercentage,
  };
}
