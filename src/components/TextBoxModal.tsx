import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calculator, PenTool, Save, Eraser, Trash2, Flame, Sparkles, Binary, Sigma, HelpCircle, History } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  draftText: string;
  onSaveDraft: (text: string) => void;
  onSaveNote: (text: string) => void;
  onMoveToRecycle: (text: string) => void;
}

export const TextBoxModal: React.FC<Props> = ({
  isOpen,
  onClose,
  draftText,
  onSaveDraft,
  onSaveNote,
  onMoveToRecycle
}) => {
  const [text, setText] = useState(draftText || '');
  const [showClearChoice, setShowClearChoice] = useState(false);
  const [savedTag, setSavedTag] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'keypad'>('editor');
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcHistory, setCalcHistory] = useState<string[]>([]);
  const [calcMemory, setCalcMemory] = useState<number>(0);
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(draftText || '');
  }, [draftText]);

  if (!isOpen) return null;

  // Insert math symbol or snippet at current cursor position
  const insertSymbol = (symbol: string) => {
    if (!textareaRef.current) {
      setText(prev => prev + symbol);
      return;
    }

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const currentText = text;

    const newText = currentText.substring(0, start) + symbol + currentText.substring(end);
    setText(newText);
    onSaveDraft(newText);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + symbol.length, start + symbol.length);
      }
    }, 50);
  };

  // Safe Pro Scientific Math Evaluator
  const evaluateMathExpression = (expr: string): string | null => {
    try {
      let clean = expr.trim();
      if (!clean) return null;

      // Handle percentages e.g. 1000 + 10%
      clean = clean.replace(/(\d+(\.\d+)?)\s*\+\s*(\d+(\.\d+)?)%/g, '$1 + ($1 * $3 / 100)');
      clean = clean.replace(/(\d+(\.\d+)?)\s*-\s*(\d+(\.\d+)?)%/g, '$1 - ($1 * $3 / 100)');
      clean = clean.replace(/(\d+(\.\d+)?)%/g, '($1 / 100)');

      // Replace math symbols with JavaScript Math equivalents
      clean = clean.replace(/π/g, 'Math.PI');
      clean = clean.replace(/e/g, 'Math.E');
      clean = clean.replace(/α|alpha/gi, '180');
      clean = clean.replace(/β|beta/gi, '90');
      clean = clean.replace(/θ|theta/gi, '45');
      clean = clean.replace(/λ|lambda/gi, '1.618');
      clean = clean.replace(/Δ|delta/gi, '0');

      // Replace operators
      clean = clean.replace(/×/g, '*');
      clean = clean.replace(/÷/g, '/');
      clean = clean.replace(/\^/g, '**');

      // Replace functions: sin, cos, tan, sqrt, log, ln
      if (angleMode === 'DEG') {
        clean = clean.replace(/sin\(([^)]+)\)/gi, (_, val) => `Math.sin((${val}) * Math.PI / 180)`);
        clean = clean.replace(/cos\(([^)]+)\)/gi, (_, val) => `Math.cos((${val}) * Math.PI / 180)`);
        clean = clean.replace(/tan\(([^)]+)\)/gi, (_, val) => `Math.tan((${val}) * Math.PI / 180)`);
      } else {
        clean = clean.replace(/sin\(([^)]+)\)/gi, 'Math.sin($1)');
        clean = clean.replace(/cos\(([^)]+)\)/gi, 'Math.cos($1)');
        clean = clean.replace(/tan\(([^)]+)\)/gi, 'Math.tan($1)');
      }

      clean = clean.replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)');
      clean = clean.replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)');
      clean = clean.replace(/sqrt\(([^)]+)\)/gi, 'Math.sqrt($1)');

      clean = clean.replace(/log\(([^)]+)\)/gi, 'Math.log10($1)');
      clean = clean.replace(/ln\(([^)]+)\)/gi, 'Math.log($1)');

      // Remove any remaining illegal chars
      const sanitized = clean.replace(/[^0-9\.\+\-\*\/\(\)\,\sMathPIEEsqrtlogtansincos]/g, '');

      // Evaluate safely
      const fn = new Function(`return ${sanitized};`);
      const result = fn();

      if (result !== undefined && !isNaN(result) && isFinite(result)) {
        // Format decimal points neatly
        return Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(6)).toString();
      }
      return null;
    } catch {
      return null;
    }
  };

  // Auto inline math calculation on typing '='
  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const val = e.currentTarget.value;
    onSaveDraft(val);

    const lines = val.split('\n');
    let updated = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('=') && !line.split('=')[1].trim()) {
        const eq = line.split('=')[0];
        const ans = evaluateMathExpression(eq);
        if (ans !== null) {
          lines[i] = `${line} ${ans}`;
          updated = true;
          setCalcHistory(prev => [`${line.trim()} ${ans}`, ...prev.slice(0, 19)]);
        }
      }
    }

    if (updated) {
      const newText = lines.join('\n');
      setText(newText);
      onSaveDraft(newText);
    }
  };

  // Keypad button click handler
  const handleKeypadPress = (val: string) => {
    if (val === 'AC') {
      setCalcDisplay('0');
    } else if (val === '⌫') {
      setCalcDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (val === '=') {
      const ans = evaluateMathExpression(calcDisplay);
      if (ans !== null) {
        const fullEquation = `${calcDisplay} = ${ans}`;
        setCalcHistory(prev => [fullEquation, ...prev.slice(0, 19)]);
        setCalcDisplay(ans);

        // Append to text box too!
        const newText = text ? `${text}\n${fullEquation}` : fullEquation;
        setText(newText);
        onSaveDraft(newText);
      } else {
        setCalcDisplay('Error');
        setTimeout(() => setCalcDisplay('0'), 1200);
      }
    } else if (val === 'M+') {
      const current = parseFloat(calcDisplay) || 0;
      setCalcMemory(prev => prev + current);
    } else if (val === 'M-') {
      const current = parseFloat(calcDisplay) || 0;
      setCalcMemory(prev => prev - current);
    } else if (val === 'MR') {
      setCalcDisplay(calcMemory.toString());
    } else if (val === 'MC') {
      setCalcMemory(0);
    } else {
      if (calcDisplay === '0' || calcDisplay === 'Error') {
        setCalcDisplay(val);
      } else {
        setCalcDisplay(prev => prev + val);
      }
    }
  };

  const handleManualDraft = () => {
    onSaveDraft(text);
    setSavedTag(true);
    setTimeout(() => setSavedTag(false), 1800);
  };

  const handleSaveNoteSubmit = () => {
    if (!text.trim()) {
      alert('Text box is empty!');
      return;
    }
    onSaveNote(text.trim());
    setText('');
    onSaveDraft('');
    onClose();
  };

  const handleClearClick = () => {
    if (!text.trim()) {
      setText('');
      onSaveDraft('');
      return;
    }
    setShowClearChoice(true);
  };

  const handleRecycle = () => {
    if (text.trim()) {
      onMoveToRecycle(text.trim());
    }
    setText('');
    onSaveDraft('');
    setShowClearChoice(false);
  };

  const handlePermanentDelete = () => {
    setText('');
    onSaveDraft('');
    setShowClearChoice(false);
  };

  const mathSymbols = [
    { label: 'π', symbol: 'π', title: 'Pi (3.14159)' },
    { label: 'e', symbol: 'e', title: 'Euler Constant (2.718)' },
    { label: 'α', symbol: 'α', title: 'Alpha Angle' },
    { label: 'β', symbol: 'β', title: 'Beta Angle' },
    { label: 'θ', symbol: 'θ', title: 'Theta Angle' },
    { label: '√', symbol: '√()', title: 'Square Root' },
    { label: 'x²', symbol: '^2', title: 'Square' },
    { label: 'xⁿ', symbol: '^', title: 'Power' },
    { label: 'sin', symbol: 'sin()', title: 'Sine Function' },
    { label: 'cos', symbol: 'cos()', title: 'Cosine Function' },
    { label: 'tan', symbol: 'tan()', title: 'Tangent Function' },
    { label: 'log', symbol: 'log()', title: 'Base-10 Log' },
    { label: 'ln', symbol: 'ln()', title: 'Natural Log' },
    { label: '∫', symbol: '∫', title: 'Integral Symbol' },
    { label: '∑', symbol: '∑', title: 'Summation Symbol' },
    { label: 'Δ', symbol: 'Δ', title: 'Delta Symbol' },
    { label: 'λ', symbol: 'λ', title: 'Lambda Symbol' },
    { label: '±', symbol: '±', title: 'Plus-Minus' },
    { label: '∞', symbol: '∞', title: 'Infinity' },
    { label: '%', symbol: '%', title: 'Percent' },
    { label: '÷', symbol: ' ÷ ', title: 'Divide' },
    { label: '×', symbol: ' × ', title: 'Multiply' },
    { label: '(', symbol: '(', title: 'Open Bracket' },
    { label: ')', symbol: ')', title: 'Close Bracket' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col space-y-3.5 max-h-[94vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Calculator className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
                  Pro Scientific Calculator & Text Box <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-[10px] text-slate-400">Auto Math Evaluator with Alpha, Beta, Theta & Scientific Symbols</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('editor')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'editor'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" /> Text Note & Auto Math
            </button>

            <button
              onClick={() => setActiveTab('keypad')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'keypad'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Binary className="w-3.5 h-3.5" /> Scientific Keypad Pad
            </button>
          </div>

          {activeTab === 'editor' ? (
            <>
              {/* Scientific Symbols Quick Toolbar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Sigma className="w-3.5 h-3.5" /> Tap Symbol to Insert:
                  </span>
                  <span className="text-[10px] text-slate-500">Type 'sin(30) =' for instant answer</span>
                </div>

                <div className="grid grid-cols-8 sm:grid-cols-12 gap-1 bg-slate-950 p-2 rounded-2xl border border-slate-800/80 max-h-24 overflow-y-auto no-scrollbar">
                  {mathSymbols.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => insertSymbol(item.symbol)}
                      title={item.title}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-amber-300 hover:text-white font-mono font-bold text-xs transition border border-slate-700 flex items-center justify-center"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Area */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  rows={7}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyUp={handleKeyUp}
                  placeholder="Type shop notes or equations e.g.
• 1000 + 500 =
• sin(30) =
• sqrt(144) =
• 2^8 =
• 1000 + 15% ="
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-3 text-xs sm:text-sm font-mono text-slate-100 outline-none focus:border-indigo-500 resize-none shadow-inner"
                />

                {savedTag && (
                  <p className="absolute bottom-3 left-3 text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded-lg border border-emerald-500/40">
                    ✓ Auto-Saved in Drafts
                  </p>
                )}
              </div>
            </>
          ) : (
            /* Scientific Keypad Mode */
            <div className="space-y-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              {/* Display Header */}
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-right shadow-inner">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
                  <button
                    onClick={() => setAngleMode(prev => prev === 'DEG' ? 'RAD' : 'DEG')}
                    className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition"
                  >
                    {angleMode}
                  </button>
                  {calcMemory !== 0 && (
                    <span className="text-emerald-400 font-mono">M: {calcMemory}</span>
                  )}
                </div>
                <div className="text-xl sm:text-2xl font-mono font-black text-amber-300 tracking-wider truncate">
                  {calcDisplay}
                </div>
              </div>

              {/* Scientific Keypad Grid */}
              <div className="grid grid-cols-5 gap-1.5 font-mono font-bold text-xs">
                {[
                  'MC', 'MR', 'M+', 'M-', 'AC',
                  'sin', 'cos', 'tan', 'π', '⌫',
                  '√', '^', 'log', 'ln', '÷',
                  '7', '8', '9', 'α', '×',
                  '4', '5', '6', 'β', '-',
                  '1', '2', '3', 'θ', '+',
                  '0', '.', '(', ')', '='
                ].map((k, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleKeypadPress(k)}
                    className={`p-2.5 rounded-xl transition flex items-center justify-center ${
                      k === '='
                        ? 'col-span-1 bg-amber-500 text-slate-950 font-black text-sm shadow hover:bg-amber-400'
                        : k === 'AC'
                        ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white'
                        : ['+', '-', '×', '÷', '^', '√'].includes(k)
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white'
                        : ['sin', 'cos', 'tan', 'log', 'ln', 'α', 'β', 'θ', 'π'].includes(k)
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600 hover:text-white'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Equation History Drawer */}
          {calcHistory.length > 0 && (
            <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                <History className="w-3.5 h-3.5" /> Recent Math Calculations:
              </div>
              <div className="flex items-center gap-2 overflow-x-auto text-[11px] font-mono no-scrollbar">
                {calcHistory.map((item, i) => (
                  <span
                    key={i}
                    onClick={() => {
                      const ans = item.split('=')[1]?.trim();
                      if (ans) insertSymbol(ans);
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white cursor-pointer shrink-0 border border-slate-700"
                    title="Click to copy answer to note"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleManualDraft}
              className="bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <PenTool className="w-3.5 h-3.5" /> Draft
            </button>
            <button
              onClick={handleSaveNoteSubmit}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
            >
              <Save className="w-3.5 h-3.5" /> Save Note
            </button>
            <button
              onClick={handleClearClick}
              className="bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Eraser className="w-3.5 h-3.5" /> Clear
            </button>
          </div>

          {/* Clear Choice Prompt */}
          {showClearChoice && (
            <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 space-y-2">
              <p className="text-xs font-bold text-slate-200">What do you want to do with this text?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleRecycle}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold text-xs py-2 rounded-xl flex items-center justify-center gap-1 shadow"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Move to Recycle Bin
                </button>
                <button
                  onClick={handlePermanentDelete}
                  className="bg-rose-700 hover:bg-rose-600 text-white font-extrabold text-xs py-2 rounded-xl flex items-center justify-center gap-1 shadow"
                >
                  <Flame className="w-3.5 h-3.5" /> Delete Permanently
                </button>
              </div>
              <button onClick={() => setShowClearChoice(false)} className="w-full text-center text-xs text-slate-500 hover:text-slate-300 py-1">
                Cancel
              </button>
            </div>
          )}

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
