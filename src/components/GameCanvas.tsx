import React, { useRef, useEffect } from 'react';
import { GameState, Point, FoodType } from '../types';
import { CELL_SIZE, FOOD_DEFS, COLORS } from '../constants';

interface Props {
  gameState: GameState;
  width: number;
  height: number;
}

export const GameCanvas: React.FC<Props> = ({ gameState, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid (optional)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, height * CELL_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(width * CELL_SIZE, y * CELL_SIZE);
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
      
      const padding = 1;
      ctx.beginPath();
      if (i === 0) {
        // Head
        ctx.roundRect(
          segment.x * CELL_SIZE + padding,
          segment.y * CELL_SIZE + padding,
          CELL_SIZE - padding * 2,
          CELL_SIZE - padding * 2,
          8
        );
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 0;
        const eyeSize = 3;
        ctx.beginPath();
        ctx.arc(segment.x * CELL_SIZE + 7, segment.y * CELL_SIZE + 7, eyeSize, 0, Math.PI * 2);
        ctx.arc(segment.x * CELL_SIZE + 13, segment.y * CELL_SIZE + 7, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Body
        ctx.roundRect(
          segment.x * CELL_SIZE + padding,
          segment.y * CELL_SIZE + padding,
          CELL_SIZE - padding * 2,
          CELL_SIZE - padding * 2,
          4
        );
        ctx.fill();
      }
    });

    // Draw Food
    gameState.food.forEach(food => {
      const def = FOOD_DEFS[food.type];
      const centerX = food.x * CELL_SIZE + CELL_SIZE / 2;
      const centerY = food.y * CELL_SIZE + CELL_SIZE / 2;
      const size = CELL_SIZE / 2 - 2;

      ctx.fillStyle = def.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = def.color;

      ctx.beginPath();
      switch (food.type) {
        case FoodType.APPLE:
        case FoodType.GOLDEN_APPLE:
          // Rounded apple shape
          ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
          ctx.fill();
          // Stem
          ctx.fillStyle = '#4e342e';
          ctx.fillRect(centerX - 1, centerY - size - 2, 2, 4);
          break;
        case FoodType.BANANA:
          // Curved banana
          ctx.strokeStyle = def.color;
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.arc(centerX + 5, centerY, size, 0.8 * Math.PI, 1.4 * Math.PI);
          ctx.stroke();
          break;
        case FoodType.GRAPE:
          // Cluster of grapes
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(centerX - 3 + i * 3, centerY - 2, 3, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.beginPath();
          ctx.arc(centerX, centerY + 3, 3, 0, Math.PI * 2);
          ctx.fill();
          break;
        case FoodType.MANGO:
          // Oval mango
          ctx.ellipse(centerX, centerY, size, size * 0.7, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          break;
        case FoodType.WATERMELON:
          // Semicircle wedge
          ctx.arc(centerX, centerY, size, 0, Math.PI, false);
          ctx.closePath();
          ctx.fill();
          // Rind
          ctx.strokeStyle = '#2e7d32';
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
        case FoodType.STAR_FRUIT:
          // Star shape
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(centerX + size * Math.cos((18 + i * 72) * Math.PI / 180), centerY - size * Math.sin((18 + i * 72) * Math.PI / 180));
            ctx.lineTo(centerX + (size / 2) * Math.cos((54 + i * 72) * Math.PI / 180), centerY - (size / 2) * Math.sin((54 + i * 72) * Math.PI / 180));
          }
          ctx.closePath();
          ctx.fill();
          break;
        case FoodType.DRAGON_FRUIT:
          // Spiky oval
          ctx.ellipse(centerX, centerY, size, size * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
          // Spikes
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
          // Concentric pulsing orb
          ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case FoodType.POWER_BERRY:
          // Diamond shape
          ctx.moveTo(centerX, centerY - size);
          ctx.lineTo(centerX + size, centerY);
          ctx.lineTo(centerX, centerY + size);
          ctx.lineTo(centerX - size, centerY);
          ctx.closePath();
          ctx.fill();
          break;
        case FoodType.POISON_FRUIT:
          // Skull-like or X
          ctx.fillRect(centerX - size / 2, centerY - size / 2, size, size);
          ctx.fillStyle = 'white';
          ctx.fillRect(centerX - 3, centerY - 3, 2, 2);
          ctx.fillRect(centerX + 1, centerY - 3, 2, 2);
          break;
        case FoodType.TIME_FRUIT:
          // Hourglass
          ctx.moveTo(centerX - size, centerY - size);
          ctx.lineTo(centerX + size, centerY - size);
          ctx.lineTo(centerX - size, centerY + size);
          ctx.lineTo(centerX + size, centerY + size);
          ctx.closePath();
          ctx.fill();
          break;
        case FoodType.PORTAL_GEM:
          // Hexagon
          for (let i = 0; i < 6; i++) {
            ctx.lineTo(centerX + size * Math.cos(i * Math.PI / 3), centerY + size * Math.sin(i * Math.PI / 3));
          }
          ctx.closePath();
          ctx.fill();
          break;
        case FoodType.CHAOS_ORB:
          // Irregular polygon
          ctx.moveTo(centerX - size, centerY);
          ctx.lineTo(centerX - 2, centerY - size);
          ctx.lineTo(centerX + size, centerY - 2);
          ctx.lineTo(centerX + 2, centerY + size);
          ctx.closePath();
          ctx.fill();
          break;
        case FoodType.VOID_STAR:
          // 4-pointed star
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
      
      // Shine (common for all)
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
        obs.x * CELL_SIZE + 2,
        obs.y * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4,
        2
      );
      ctx.fill();
      // Texture
      ctx.strokeStyle = '#666666';
      ctx.strokeRect(obs.x * CELL_SIZE + 4, obs.y * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8);
    });

  }, [gameState, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width * CELL_SIZE}
      height={height * CELL_SIZE}
      className="border-4 border-white/10 rounded-lg shadow-2xl bg-black/20 backdrop-blur-sm"
    />
  );
};
