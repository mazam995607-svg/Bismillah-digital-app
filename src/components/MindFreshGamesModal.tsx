import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Sparkles, RefreshCw, Trophy, Zap, Brain, Play, ExternalLink, X, Heart, Globe, ArrowLeft, Maximize2, Volume2, VolumeX, Search, Flame, Star } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface OnlineGame {
  id: string;
  title: string;
  category: 'Arcade' | 'Action' | 'Sports' | 'Puzzle' | 'Racing' | 'Board';
  icon: string;
  url: string;
  description: string;
  tag: string;
}

export const MindFreshGamesModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [gameMode, setGameMode] = useState<'offline' | 'online'>('offline');
  const [selectedOfflineGame, setSelectedOfflineGame] = useState<string>('snake');
  const [selectedOnlineGame, setSelectedOnlineGame] = useState<OnlineGame | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // GAME 1: Tic Tac Toe State
  const [board, setBoard] = useState<string[]>(Array(9).fill(''));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [ticWinner, setTicWinner] = useState<string | null>(null);

  // GAME 2: Memory Card Match State
  const memoryIcons = ['🍎', '🍌', '🍒', '🍇', '🍉', '🍓', '🍋', '🍐'];
  const [memoryDeck, setMemoryDeck] = useState(() => [...memoryIcons, ...memoryIcons].sort(() => Math.random() - 0.5));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);

  // GAME 3: Cash Math Speed State
  const [mathScore, setMathScore] = useState(0);
  const [num1, setNum1] = useState(150);
  const [num2, setNum2] = useState(250);
  const [mathInput, setMathInput] = useState('');
  const [mathMsg, setMathMsg] = useState('');

  // GAME 4: Speed Tap Reaction State
  const [tapScore, setTapScore] = useState(0);
  const [tapTimeLeft, setTapTimeLeft] = useState(15);
  const [tapActive, setTapActive] = useState(false);

  // GAME 5: Color Match Reflex State
  const [currentColorName, setCurrentColorName] = useState('RED');
  const [currentColorClass, setCurrentColorClass] = useState('text-blue-500');
  const [colorScore, setColorScore] = useState(0);

  // GAME 6: Word Scramble State
  const words = ['PAKISTAN', 'BISMILLAH', 'TELECOM', 'EASYLOAD', 'CUSTOMER', 'COMMISSION'];
  const [wordIndex, setWordIndex] = useState(0);
  const [wordGuess, setWordGuess] = useState('');
  const [wordScore, setWordScore] = useState(0);

  // GAME 7: 2048 Grid
  const [grid2048, setGrid2048] = useState<number[]>([2, 4, 8, 16, 32, 64, 128, 256, 512]);

  // GAME 8: Snake Canvas Retro Game
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('UP');
  const [snakeScore, setSnakeScore] = useState(0);
  const [snakeGameOver, setSnakeGameOver] = useState(false);
  const [snakeRunning, setSnakeRunning] = useState(false);

  // ONLINE GAMES CATALOG
  const onlineGamesList: OnlineGame[] = [
    {
      id: 'cyber-racer',
      title: 'Cyber Car Racer 3D',
      category: 'Racing',
      icon: '🏎️',
      url: 'https://play.gamepix.com/cyber-racer-3d/embed',
      description: 'High speed futuristic 3D highway racing game!',
      tag: '🔥 Popular 3D'
    },
    {
      id: 'gangster-city-runner',
      title: '3D Gangster City Runner',
      category: 'Action',
      icon: '🚗',
      url: 'https://play.gamepix.com/gangster-hero/embed',
      description: 'Open world 3D street gangster runner game with weapons & cars!',
      tag: '💥 Action Hit'
    },
    {
      id: 'plants-vs-zombies',
      title: 'Plants vs Zombies Strategy',
      category: 'Action',
      icon: '🌻',
      url: 'https://play.gamepix.com/zombie-parade-defense/embed',
      description: 'Defend your garden against wave after wave of incoming zombies!',
      tag: '🧠 Strategy'
    },
    {
      id: 'counter-strike-3d',
      title: 'Counter Strike 3D FPS',
      category: 'Action',
      icon: '🔫',
      url: 'https://play.gamepix.com/counter-craft/embed',
      description: '3D tactical first person shooting simulation with realistic weapons.',
      tag: '🎯 FPS Shooter'
    },
    {
      id: 'pubg-freefire-survival',
      title: 'PUBG FreeFire Battle Royale',
      category: 'Action',
      icon: '🪂',
      url: 'https://play.gamepix.com/battle-royale-3d/embed',
      description: 'Parachute onto survival island, loot weapons, and be the last survivor!',
      tag: '🏆 Battle Royale'
    },
    {
      id: 'space-invaders',
      title: 'Galaxy Space Shooter',
      category: 'Arcade',
      icon: '🚀',
      url: 'https://play.gamepix.com/space-blaster/embed',
      description: 'Classic retro space alien invaders arcade game.',
      tag: 'Retro Classic'
    },
    {
      id: 'flappy-bird',
      title: 'Flappy Bird Arcade',
      category: 'Arcade',
      icon: '🩴',
      url: 'https://play.gamepix.com/flappy-bird/embed',
      description: 'Tap to fly through pipes and beat your high score!',
      tag: 'Addictive'
    },
    {
      id: 'chess-online',
      title: 'Chess Master 3D',
      category: 'Board',
      icon: '♟️',
      url: 'https://play.gamepix.com/master-chess/embed',
      description: 'Play strategic chess against smart AI grandmasters.',
      tag: 'Mind Strategy'
    },
    {
      id: 'ludo-star',
      title: 'Ludo Legend Classic',
      category: 'Board',
      icon: '🎲',
      url: 'https://play.gamepix.com/ludo-legend/embed',
      description: 'Classic multiplayer Ludo dice rolling game.',
      tag: 'Family Favorite'
    },
    {
      id: 'basketball-dunk',
      title: 'Basketball Dunk Shoot',
      category: 'Sports',
      icon: '🏀',
      url: 'https://play.gamepix.com/dunk-shot/embed',
      description: 'Aim and dunk basketballs to trigger fire streak bonuses!',
      tag: 'Sports Action'
    },
    {
      id: 'block-puzzle',
      title: 'Block Puzzle Jewel',
      category: 'Puzzle',
      icon: '🧩',
      url: 'https://play.gamepix.com/block-puzzle/embed',
      description: 'Fit colorful tetris gem blocks to clear grid rows.',
      tag: 'Brain Puzzle'
    },
    {
      id: 'archery-king',
      title: 'Archery World Champion',
      category: 'Action',
      icon: '🎯',
      url: 'https://play.gamepix.com/archery-world-tour/embed',
      description: 'Test bow precision targets across wind physics!',
      tag: 'Precision'
    },
    {
      id: 'table-tennis',
      title: 'Table Tennis Pro 3D',
      category: 'Sports',
      icon: '🏓',
      url: 'https://play.gamepix.com/table-tennis-pro/embed',
      description: 'Realistic ping pong paddle tournament matches.',
      tag: '3D Physics'
    },
    {
      id: 'bowling-club',
      title: 'Bowling Club 3D',
      category: 'Sports',
      icon: '🎳',
      url: 'https://play.gamepix.com/bowling-club/embed',
      description: 'Curve bowling balls to score double strikes!',
      tag: '3D Bowling'
    },
    {
      id: 'moto-highway',
      title: 'Highway Moto Traffic',
      category: 'Racing',
      icon: '🏍️',
      url: 'https://play.gamepix.com/moto-x3m/embed',
      description: 'Perform extreme motorcycle stunt flips across obstacle tracks!',
      tag: 'Stunt Moto'
    },
    {
      id: 'wordle-game',
      title: 'Wordle Unlimited',
      category: 'Puzzle',
      icon: '🔤',
      url: 'https://play.gamepix.com/wordle-unlimited/embed',
      description: 'Guess the hidden 5-letter word in 6 attempts.',
      tag: 'Word Master'
    }
  ];

  // Snake Game Engine Loop
  useEffect(() => {
    if (!snakeRunning || snakeGameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };

        if (direction === 'UP') head.y -= 1;
        if (direction === 'DOWN') head.y += 1;
        if (direction === 'LEFT') head.x -= 1;
        if (direction === 'RIGHT') head.x += 1;

        // Collision check with walls (20x20 grid)
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
          setSnakeGameOver(true);
          setSnakeRunning(false);
          return prevSnake;
        }

        // Self collision check
        for (let segment of prevSnake) {
          if (segment.x === head.x && segment.y === head.y) {
            setSnakeGameOver(true);
            setSnakeRunning(false);
            return prevSnake;
          }
        }

        const newSnake = [head, ...prevSnake];

        // Food collision
        if (head.x === food.x && head.y === food.y) {
          setSnakeScore(s => s + 10);
          setFood({
            x: Math.floor(Math.random() * 18) + 1,
            y: Math.floor(Math.random() * 18) + 1
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, 160);
    return () => clearInterval(interval);
  }, [snakeRunning, snakeGameOver, direction, food]);

  if (!isOpen) return null;

  // Tic Tac Toe Logic
  const handleTicClick = (idx: number) => {
    if (board[idx] || ticWinner) return;
    const newB = [...board];
    newB[idx] = turn;
    setBoard(newB);
    checkWinner(newB);
    setTurn(turn === 'X' ? 'O' : 'X');
  };

  const checkWinner = (b: string[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const [x, y, z] of lines) {
      if (b[x] && b[x] === b[y] && b[x] === b[z]) {
        setTicWinner(b[x]);
        return;
      }
    }
    if (b.every(c => c)) setTicWinner('Draw');
  };

  const resetTic = () => {
    setBoard(Array(9).fill(''));
    setTurn('X');
    setTicWinner(null);
  };

  // Memory Match Logic
  const handleCardClick = (idx: number) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx)) return;
    const nextFlipped = [...flipped, idx];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      const [f1, f2] = nextFlipped;
      if (memoryDeck[f1] === memoryDeck[f2]) {
        setMatched(prev => [...prev, f1, f2]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  // Math Game Submit
  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(mathInput) === num1 + num2) {
      setMathScore(prev => prev + 10);
      setMathMsg('Correct! +10 Points 🎉');
      setNum1(Math.floor(Math.random() * 800) + 100);
      setNum2(Math.floor(Math.random() * 800) + 100);
    } else {
      setMathMsg('Wrong answer! Try again.');
    }
    setMathInput('');
  };

  // Speed Tap Game
  const startSpeedTap = () => {
    setTapScore(0);
    setTapTimeLeft(15);
    setTapActive(true);
    const timer = setInterval(() => {
      setTapTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setTapActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Reset Snake Game
  const resetSnake = () => {
    setSnake([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]);
    setFood({ x: 5, y: 5 });
    setDirection('UP');
    setSnakeScore(0);
    setSnakeGameOver(false);
    setSnakeRunning(true);
  };

  const filteredOnlineGames = onlineGamesList.filter(g => {
    const matchesCategory = selectedCategory === 'All' || g.category === selectedCategory;
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[750px] max-h-[95vh] text-slate-100"
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner shrink-0">
                <Gamepad2 className="w-6 h-6 text-amber-300 animate-bounce" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg tracking-wide flex items-center gap-1.5">
                  Duniya Ke Har Games - Online & Offline Studio <Sparkles className="w-4 h-4 text-amber-300" />
                </h3>
                <p className="text-xs text-teal-100 font-semibold">10 Offline Mind Refresh Games + Top Instant Online Web Arcade</p>
              </div>
            </div>

            <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MAIN MODE SWITCHER (OFFLINE VS ONLINE WEB ARCADE) */}
          <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => { setGameMode('offline'); setSelectedOnlineGame(null); }}
                className={`px-4 py-2 rounded-2xl font-black text-xs transition flex items-center gap-1.5 ${
                  gameMode === 'offline'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Brain className="w-4 h-4" /> ⚡ 10 Offline Mini Games
              </button>

              <button
                onClick={() => setGameMode('online')}
                className={`px-4 py-2 rounded-2xl font-black text-xs transition flex items-center gap-1.5 ${
                  gameMode === 'online'
                    ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Globe className="w-4 h-4" /> 🌐 Duniya Ke Online Games
              </button>
            </div>

            {selectedOnlineGame && (
              <button
                onClick={() => setSelectedOnlineGame(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Arcade Catalog
              </button>
            )}
          </div>

          {/* OFFLINE GAME SELECTOR TABS */}
          {gameMode === 'offline' && (
            <div className="p-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs font-bold no-scrollbar">
              {[
                { id: 'snake', label: '🐍 1. Retro Snake' },
                { id: 'ticTacToe', label: '⭕ 2. Tic Tac Toe' },
                { id: 'memory', label: '🎴 3. Memory Cards' },
                { id: 'math', label: '🧮 4. Cash Speed Math' },
                { id: 'speedTap', label: '⚡ 5. Speed Tap' },
                { id: 'color', label: '🎨 6. Color Reflex' },
                { id: 'scramble', label: '🔤 7. Word Scramble' },
                { id: '2048', label: '🔢 8. 2048 Tiles' },
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedOfflineGame(g.id)}
                  className={`px-3 py-1.5 rounded-xl transition shrink-0 flex items-center gap-1 ${
                    selectedOfflineGame === g.id
                      ? 'bg-emerald-500 text-slate-950 font-black shadow'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          )}

          {/* CONTENT DISPLAY */}
          <div className="p-4 overflow-y-auto space-y-6 flex-grow bg-slate-950/40">
            {gameMode === 'offline' ? (
              <>
                {/* GAME 1: RETRO CANVAS SNAKE */}
                {selectedOfflineGame === 'snake' && (
                  <div className="max-w-md mx-auto text-center space-y-3">
                    <div className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-300">Score: <span className="text-amber-400 font-black text-sm">{snakeScore}</span></span>
                      </div>
                      <button
                        onClick={resetSnake}
                        className="text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl flex items-center gap-1 shadow"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> {snakeRunning ? 'Restart' : 'Start Snake'}
                      </button>
                    </div>

                    {/* Snake Play Area (20x20 Grid) */}
                    <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] mx-auto bg-slate-950 border-2 border-emerald-500/60 rounded-2xl overflow-hidden shadow-2xl">
                      {snakeGameOver && (
                        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center space-y-2 z-10">
                          <p className="text-lg font-black text-rose-400">🐍 Game Over!</p>
                          <p className="text-xs font-bold text-amber-300">Final Score: {snakeScore}</p>
                          <button
                            onClick={resetSnake}
                            className="bg-emerald-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow-lg hover:scale-105 transition"
                          >
                            Play Again
                          </button>
                        </div>
                      )}

                      {!snakeRunning && !snakeGameOver && (
                        <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center space-y-2 z-10 p-4">
                          <span className="text-3xl">🐍</span>
                          <p className="text-sm font-black text-emerald-400">Retro Nokia Snake Game</p>
                          <p className="text-[11px] text-slate-400 text-center">Use Arrow Buttons below to guide the snake and eat the red dots!</p>
                          <button
                            onClick={resetSnake}
                            className="bg-emerald-500 text-slate-950 font-black px-5 py-2 rounded-xl text-xs shadow-lg"
                          >
                            Start Game
                          </button>
                        </div>
                      )}

                      {/* Render Food */}
                      <div
                        style={{
                          left: `${(food.x / 20) * 100}%`,
                          top: `${(food.y / 20) * 100}%`,
                          width: '5%',
                          height: '5%'
                        }}
                        className="absolute bg-rose-500 rounded-full animate-ping shadow-[0_0_10px_#f43f5e]"
                      />

                      {/* Render Snake Segments */}
                      {snake.map((seg, idx) => (
                        <div
                          key={idx}
                          style={{
                            left: `${(seg.x / 20) * 100}%`,
                            top: `${(seg.y / 20) * 100}%`,
                            width: '5%',
                            height: '5%'
                          }}
                          className={`absolute rounded-sm transition-all duration-75 ${
                            idx === 0 ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b] z-10' : 'bg-emerald-500'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Touch Control Pad */}
                    <div className="max-w-[180px] mx-auto grid grid-cols-3 gap-1 pt-1">
                      <div></div>
                      <button
                        onClick={() => direction !== 'DOWN' && setDirection('UP')}
                        className="bg-slate-800 hover:bg-emerald-600 text-white font-black py-2.5 rounded-xl shadow active:scale-95 text-xs"
                      >
                        ▲
                      </button>
                      <div></div>

                      <button
                        onClick={() => direction !== 'RIGHT' && setDirection('LEFT')}
                        className="bg-slate-800 hover:bg-emerald-600 text-white font-black py-2.5 rounded-xl shadow active:scale-95 text-xs"
                      >
                        ◀
                      </button>
                      <button
                        onClick={() => direction !== 'UP' && setDirection('DOWN')}
                        className="bg-slate-800 hover:bg-emerald-600 text-white font-black py-2.5 rounded-xl shadow active:scale-95 text-xs"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => direction !== 'LEFT' && setDirection('RIGHT')}
                        className="bg-slate-800 hover:bg-emerald-600 text-white font-black py-2.5 rounded-xl shadow active:scale-95 text-xs"
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                )}

                {/* GAME 2: TIC TAC TOE */}
                {selectedOfflineGame === 'ticTacToe' && (
                  <div className="max-w-md mx-auto text-center space-y-4">
                    <div className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <span className="text-xs font-bold text-slate-300">Turn: <span className="text-amber-400 font-black">{turn}</span></span>
                      <button onClick={resetTic} className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-xl flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5" /> Restart
                      </button>
                    </div>

                    {ticWinner && (
                      <div className="p-3 bg-emerald-500/20 border border-emerald-500 text-emerald-300 rounded-2xl font-black text-sm">
                        {ticWinner === 'Draw' ? '🤝 Game Draw!' : `🎉 Winner: Player ${ticWinner}!`}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
                      {board.map((cell, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleTicClick(idx)}
                          className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-2xl font-black text-2xl flex items-center justify-center text-amber-400 hover:bg-slate-800 transition"
                        >
                          {cell}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* GAME 3: MEMORY MATCH */}
                {selectedOfflineGame === 'memory' && (
                  <div className="max-w-md mx-auto text-center space-y-4">
                    <p className="text-xs text-slate-400">Match all the card fruit pairs to test memory!</p>
                    <div className="grid grid-cols-4 gap-2.5 max-w-[280px] mx-auto">
                      {memoryDeck.map((icon, idx) => {
                        const isF = flipped.includes(idx) || matched.includes(idx);
                        return (
                          <button
                            key={idx}
                            onClick={() => handleCardClick(idx)}
                            className={`w-16 h-16 rounded-2xl text-2xl font-black flex items-center justify-center transition ${
                              isF ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-950 border border-slate-800 hover:bg-slate-800'
                            }`}
                          >
                            {isF ? icon : '❓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* GAME 4: CASH MATH SPEED */}
                {selectedOfflineGame === 'math' && (
                  <div className="max-w-md mx-auto text-center space-y-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
                    <span className="text-xs font-bold text-amber-400">Score: {mathScore} Points</span>
                    <h4 className="text-2xl font-black text-slate-100">{num1} + {num2} = ?</h4>

                    <form onSubmit={handleMathSubmit} className="flex gap-2 justify-center">
                      <input
                        type="number"
                        value={mathInput}
                        onChange={e => setMathInput(e.target.value)}
                        placeholder="Your Answer"
                        className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-center font-bold text-amber-300 outline-none"
                      />
                      <button type="submit" className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs">
                        Submit
                      </button>
                    </form>

                    {mathMsg && <p className="text-xs font-bold text-emerald-400">{mathMsg}</p>}
                  </div>
                )}

                {/* GAME 5: SPEED TAP */}
                {selectedOfflineGame === 'speedTap' && (
                  <div className="max-w-md mx-auto text-center space-y-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>Time: {tapTimeLeft}s</span>
                      <span>Score: {tapScore} Taps</span>
                    </div>

                    {tapActive ? (
                      <button
                        onClick={() => setTapScore(s => s + 1)}
                        className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-slate-950 font-black text-lg mx-auto shadow-2xl active:scale-95 transition flex items-center justify-center"
                      >
                        TAP FAST!
                      </button>
                    ) : (
                      <button
                        onClick={startSpeedTap}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3 rounded-2xl text-xs shadow-lg"
                      >
                        Start 15s Tap Challenge
                      </button>
                    )}
                  </div>
                )}

                {/* GAME 6: COLOR REFLEX */}
                {selectedOfflineGame === 'color' && (
                  <div className="max-w-md mx-auto text-center space-y-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
                    <p className="text-xs text-slate-400">Score: {colorScore}</p>
                    <h3 className={`text-3xl font-black ${currentColorClass}`}>{currentColorName}</h3>
                    <p className="text-xs text-slate-400">Does the written word match the text color?</p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => {
                          setColorScore(s => s + 10);
                          setCurrentColorName('BLUE');
                          setCurrentColorClass('text-rose-500');
                        }}
                        className="bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl text-xs"
                      >
                        YES Match
                      </button>
                      <button
                        onClick={() => {
                          setColorScore(s => Math.max(0, s - 5));
                          setCurrentColorName('GREEN');
                          setCurrentColorClass('text-green-500');
                        }}
                        className="bg-rose-600 text-white font-bold px-5 py-2 rounded-xl text-xs"
                      >
                        NO
                      </button>
                    </div>
                  </div>
                )}

                {/* GAME 7: WORD SCRAMBLE */}
                {selectedOfflineGame === 'scramble' && (
                  <div className="max-w-md mx-auto text-center space-y-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
                    <p className="text-xs text-amber-400">Unscramble the POS Shop Keyword:</p>
                    <h3 className="text-2xl font-mono font-black tracking-widest text-emerald-400">
                      {words[wordIndex].split('').sort(() => Math.random() - 0.5).join(' ')}
                    </h3>
                    <div className="flex gap-2 justify-center">
                      <input
                        type="text"
                        value={wordGuess}
                        onChange={e => setWordGuess(e.target.value)}
                        placeholder="Guess Word"
                        className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-100 outline-none uppercase"
                      />
                      <button
                        onClick={() => {
                          if (wordGuess.trim().toUpperCase() === words[wordIndex]) {
                            alert('Correct!');
                            setWordIndex((wordIndex + 1) % words.length);
                          } else {
                            alert('Try again!');
                          }
                          setWordGuess('');
                        }}
                        className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                )}

                {/* GAME 8: 2048 TILES */}
                {selectedOfflineGame === '2048' && (
                  <div className="max-w-xs mx-auto text-center space-y-3">
                    <p className="text-xs text-slate-400">Merge matching number tiles!</p>
                    <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      {grid2048.map((val, idx) => (
                        <div
                          key={idx}
                          className="w-18 h-18 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center text-amber-400 font-mono font-black text-lg shadow"
                        >
                          {val}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* ONLINE WEB ARCADE CATALOG */
              <div className="space-y-4">
                {selectedOnlineGame ? (
                  /* IN-APP GAME PLAYER FRAME */
                  <div className="flex flex-col h-[560px] bg-slate-950 rounded-2xl border border-amber-500/40 overflow-hidden shadow-2xl">
                    <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{selectedOnlineGame.icon}</span>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-100">{selectedOnlineGame.title}</h4>
                          <span className="text-[10px] text-amber-400 font-bold">{selectedOnlineGame.category} • {selectedOnlineGame.tag}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={selectedOnlineGame.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1"
                        >
                          <Maximize2 className="w-3.5 h-3.5" /> Fullscreen Tab
                        </a>
                        <button
                          onClick={() => setSelectedOnlineGame(null)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-grow bg-black relative">
                      <iframe
                        src={selectedOnlineGame.url}
                        title={selectedOnlineGame.title}
                        className="w-full h-full border-none"
                        allow="fullscreen; autoplay"
                      />
                    </div>
                  </div>
                ) : (
                  /* GAME CATALOG GRID */
                  <div className="space-y-4">
                    {/* Search & Category Filter Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-200 flex-grow max-w-sm">
                        <Search className="w-4 h-4 text-amber-400 shrink-0" />
                        <input
                          type="text"
                          placeholder="Search online games..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="bg-transparent outline-none text-xs text-slate-100 w-full font-semibold"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold no-scrollbar">
                        {['All', 'Arcade', 'Action', 'Racing', 'Sports', 'Puzzle', 'Board'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1 rounded-xl transition shrink-0 ${
                              selectedCategory === cat
                                ? 'bg-amber-400 text-slate-950 font-black shadow'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Games Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {filteredOnlineGames.map(game => (
                        <div
                          key={game.id}
                          onClick={() => setSelectedOnlineGame(game)}
                          className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-lg flex flex-col justify-between space-y-3 relative overflow-hidden"
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-3xl p-2 rounded-2xl bg-slate-950 border border-slate-800 group-hover:scale-110 transition">
                              {game.icon}
                            </span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              {game.tag}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-black text-sm text-slate-100 group-hover:text-amber-400 transition">
                              {game.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                              {game.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-400">
                            <span className="flex items-center gap-1">
                              <Play className="w-3.5 h-3.5 fill-emerald-400" /> Play Instant
                            </span>
                            <span className="text-[10px] text-slate-500">{game.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
