import React, { useRef, useEffect, useState } from 'react';
import { GameState, Point, FoodType } from '../types';
import { FOOD_DEFS } from '../constants';

interface Props {
  gameState: GameState;
  width: number;
  height: number;
}

export const GameCanvas: React.FC<Props> = ({ gameState, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(20);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      
      // Calculate max possible cell size that fits both dimensions
      // Leave some margin for the border
      const margin = 16;
      const availableWidth = clientWidth - margin;
      const availableHeight = clientHeight - margin;
      
      const newCellSize = Math.floor(Math.min(availableWidth / width, availableHeight / height));
      setCellSize(Math.max(10, newCellSize)); // Minimum 10px cell size
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution based on cell size
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid (optional)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, height * cellSize);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(width * cellSize, y * cellSize);
      ctx.stroke();
    }

    // Get current snake color
    const isRainbow = gameState.rainbowTimer > 0;
    const snakeColor = isRainbow 
      ? `hsl(${Date.now() / 5 % 360}, 80%, 60%)` 
      : gameState.snakeColor;

    // Draw Snake
    gameState.snake.forEach((segment, i) => {
      ctx.fillStyle = i === 0 ? snakeColor : isRainbow ? `hsl(${(Date.now() / 5 + i * 10) % 360}, 80%, 60%)` : snakeColor;
      ctx.shadowBlur = i === 0 ? 15 : 0;
      ctx.shadowColor = snakeColor;
      
      const padding = Math.max(1, cellSize * 0.05);
      ctx.beginPath();
      if (i === 0) {
        // Head
        ctx.roundRect(
          segment.x * cellSize + padding,
          segment.y * cellSize + padding,
          cellSize - padding * 2,
          cellSize - padding * 2,
          cellSize * 0.4
        );
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 0;
        const eyeSize = cellSize * 0.15;
        const eyeOffset = cellSize * 0.35;
        ctx.beginPath();
        ctx.arc(segment.x * cellSize + eyeOffset, segment.y * cellSize + eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.arc(segment.x * cellSize + (cellSize - eyeOffset), segment.y * cellSize + eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Body
        ctx.roundRect(
          segment.x * cellSize + padding,
          segment.y * cellSize + padding,
          cellSize - padding * 2,
          cellSize - padding * 2,
          cellSize * 0.2
        );
        ctx.fill();
      }
    });

    // Draw Food
    gameState.food.forEach(food => {
      const def = FOOD_DEFS[food.type];
      const centerX = food.x * cellSize + cellSize / 2;
      const centerY = food.y * cellSize + cellSize / 2;
      const size = cellSize / 2 - 2;

      ctx.fillStyle = def.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = def.color;

      ctx.beginPath();
      switch (food.type) {
        case FoodType.APPLE:
        case FoodType.GOLDEN_APPLE:
          ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#4e342e';
          ctx.fillRect(centerX - 1, centerY - size - 2, 2, 4);
          break;
        case FoodType.BANANA:
          ctx.strokeStyle = def.color;
          ctx.lineWidth = cellSize * 0.2;
          ctx.lineCap = 'round';
          ctx.arc(centerX + cellSize * 0.25, centerY, size, 0.8 * Math.PI, 1.4 * Math.PI);
          ctx.stroke();
          break;
        case FoodType.GRAPE:
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(centerX - cellSize * 0.15 + i * cellSize * 0.15, centerY - cellSize * 0.1, cellSize * 0.15, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.beginPath();
          ctx.arc(centerX, centerY + cellSize * 0.15, cellSize * 0.15, 0, Math.PI * 2);
          ctx.fill();
          break;
        case FoodType.MANGO:
          ctx.ellipse(centerX, centerY, size, size * 0.7, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          break;
        case FoodType.WATERMELON:
          ctx.arc(centerX, centerY, size, 0, Math.PI, false);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#2e7d32';
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
        case FoodType.STAR_FRUIT:
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(centerX + size * Math.cos((18 + i * 72) * Math.PI / 180), centerY - size * Math.sin((18 + i * 72) * Math.PI / 180));
            ctx.lineTo(centerX + (size / 2) * Math.cos((54 + i * 72) * Math.PI / 180), centerY - (size / 2) * Math.sin((54 + i * 72) * Math.PI / 180));
          }
          ctx.closePath();
          ctx.fill();
          break;
        case FoodType.DRAGON_FRUIT:
          ctx.ellipse(centerX, centerY, size, size * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#c2185b';
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(centerX + size * Math.cos(angle), centerY + size * Math.sin(angle));
            ctx.lineTo(centerX + (size + 3) * Math.cos(angle), centerY + (size + 3) * Math.sin(angle));
            ctx.stroke();
          }
          break;
        case FoodType.MYSTICAL_ORB:
          ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case FoodType.POWER_BERRY:
          ctx.moveTo(centerX, centerY - size);
          ctx.lineTo(centerX + size, centerY);
          ctx.lineTo(centerX, centerY + size);
          ctx.lineTo(centerX - size, centerY);
          ctx.closePath();
          ctx.fill();
          break;
        case FoodType.POISON_FRUIT:
          ctx.fillRect(centerX - size / 2, centerY - size / 2, size, size);
          ctx.fillStyle = 'white';
          ctx.fillRect(centerX - cellSize * 0.15, centerY - cellSize * 0.15, cellSize * 0.1, cellSize * 0.1);
          ctx.fillRect(centerX + cellSize * 0.05, centerY - cellSize * 0.15, cellSize * 0.1, cellSize * 0.1);
          break;
        case FoodType.TIME_FRUIT:
          ctx.moveTo(centerX - size, centerY - size);
          ctx.lineTo(centerX + size, centerY - size);
          ctx.lineTo(centerX - size, centerY + size);
          ctx.lineTo(centerX + size, centerY + size);
          ctx.closePath();
          ctx.fill();
          break;
        case FoodType.PORTAL_GEM:
          for (let i = 0; i < 6; i++) {
            ctx.lineTo(centerX + size * Math.cos(i * Math.PI / 3), centerY + size * Math.sin(i * Math.PI / 3));
          }
          ctx.closePath();
          ctx.fill();
          break;
        case FoodType.CHAOS_ORB:
          ctx.moveTo(centerX - size, centerY);
          ctx.lineTo(centerX - 2, centerY - size);
          ctx.lineTo(centerX + size, centerY - 2);
          ctx.lineTo(centerX + 2, centerY + size);
          ctx.closePath();
          ctx.fill();
          break;
        case FoodType.VOID_STAR:
          for (let i = 0; i < 4; i++) {
            ctx.lineTo(centerX + size * Math.cos(i * Math.PI / 2), centerY + size * Math.sin(i * Math.PI / 2));
            ctx.lineTo(centerX + (size / 3) * Math.cos(i * Math.PI / 2 + Math.PI / 4), centerY + (size / 3) * Math.sin(i * Math.PI / 2 + Math.PI / 4));
          }
          ctx.closePath();
          ctx.fill();
          break;
        default:
          ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
          ctx.fill();
      }
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(centerX - size / 3, centerY - size / 3, size / 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Obstacles
    ctx.fillStyle = '#444444';
    ctx.shadowBlur = 0;
    gameState.obstacles.forEach(obs => {
      ctx.beginPath();
      ctx.roundRect(
        obs.x * cellSize + 2,
        obs.y * cellSize + 2,
        cellSize - 4,
        cellSize - 4,
        2
      );
      ctx.fill();
      ctx.strokeStyle = '#666666';
      ctx.strokeRect(obs.x * cellSize + 4, obs.y * cellSize + 4, cellSize - 8, cellSize - 8);
    });

  }, [gameState, width, height, cellSize]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center min-h-[300px]">
      <canvas
        ref={canvasRef}
        className="border-4 border-white/10 rounded-lg shadow-2xl bg-black/20 backdrop-blur-sm"
      />
    </div>
  );
};
