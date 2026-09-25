import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Transaction } from '../types';
import { 
  CheckSquare, Square, Printer, Trash2, ArrowLeft, QrCode, FileText, 
  ChevronDown, ChevronUp, Copy, CopyPlus, Check, Tag, Clock, Calendar
} from 'lucide-react';

interface Props {
  tx: Transaction;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onPrint: (tx: Transaction) => void;
  onMoveToRecycleBin: (tx: Transaction) => void;
  onShowQR?: (tx: Transaction) => void;
  onDuplicate?: (tx: Transaction) => void;
  onUpdateNote?: (id: string, newNote: string) => void;
}

export const SwipeableTransactionCard: React.FC<Props> = ({
  tx,
  isSelected,
  onToggleSelect,
  onPrint,
  onMoveToRecycleBin,
  onShowQR,
  onDuplicate,
  onUpdateNote,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<string>(tx.note || '');
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);

  const handleDragEnd = (_: any, info: any) => {
    // If swiped left by 80px or more
    if (info.offset.x < -80) {
      if (confirm(`Move transaction "${tx.type} - ${tx.account}" to Recycle Bin?`)) {
        onMoveToRecycleBin(tx);
      }
    }
  };

  const handleCopyInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    const infoText = `[Bismillah POS Tx]\nID: ${tx.id}\nType: ${tx.type}\nAccount: ${tx.account} (${tx.name})\nAmount: Rs. ${tx.amount.toLocaleString()}\nCommission: Rs. ${tx.comm}\nStatus: ${tx.status}\nDate/Time: ${tx.date} ${tx.time}\nNote: ${tx.note || 'None'}`;
    navigator.clipboard.writeText(infoText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy info:', err);
    });
  };

  const handleSaveNote = () => {
    if (onUpdateNote) {
      onUpdateNote(tx.id, editingNote);
    }
    setIsEditingNote(false);
  };

  const getStatusBadgeClass = () => {
    if (tx.status === 'Paid') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-900/30';
    if (tx.status === 'Pending') return 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-900/30';
    return 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-900/30';
  };

  return (
    <div className="relative overflow-hidden rounded-2xl group">
      {/* Hidden Swipe Delete Background Action */}
      <div className="absolute inset-0 bg-rose-600 rounded-2xl flex items-center justify-end px-4 gap-2 text-white font-extrabold text-xs shadow-inner">
        <span className="text-[10px] uppercase font-mono opacity-90 flex items-center gap-1">
          <ArrowLeft className="w-3 h-3 animate-pulse" /> Swipe to Recycle
        </span>
        <button
          onClick={() => onMoveToRecycleBin(tx)}
          className="p-1.5 rounded-lg bg-slate-950/40 hover:bg-slate-950 text-white transition flex items-center gap-1 text-[10px]"
        >
          <Trash2 className="w-4 h-4" /> Recycle
        </button>
      </div>

      {/* Foreground Swipeable Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.08}
        onDragEnd={handleDragEnd}
        className={`relative z-10 p-3 rounded-2xl border transition-colors ${
          isSelected
            ? 'bg-amber-500/20 border-amber-500 shadow-md'
            : tx.status === 'Pending'
            ? 'bg-amber-500/10 border-amber-500/40'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        } space-y-2 cursor-grab active:cursor-grabbing`}
      >
        {/* Main Header & Right Status Badge */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(tx.id);
              }}
              className="text-slate-400 hover:text-amber-400 transition"
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-amber-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
            </button>
            <span className="font-extrabold text-slate-100 text-xs">[{tx.type}]</span>
            {tx.network && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-bold">
                {tx.network}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-amber-400 text-xs">Rs. {tx.amount.toLocaleString()}</span>
            
            {/* Color-Coded Right Edge Status Badge */}
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-sm ${getStatusBadgeClass()}`}>
              {tx.status}
            </span>

            {/* Expand / Collapse Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
              title={isExpanded ? 'Collapse Details' : 'Expand Details'}
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Account Info & Commission */}
        <div className="flex justify-between items-center text-[11px] text-slate-400 pl-5">
          <span className="font-semibold">{tx.account} &bull; {tx.name}</span>
          <span className="text-emerald-400 font-bold">+Rs.{tx.comm} Comm</span>
        </div>

        {/* Note Editor Input Field */}
        <div className="pl-5 text-[10px] space-y-1">
          {isEditingNote ? (
            <div className="flex items-center gap-1.5 pt-1" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                value={editingNote}
                onChange={(e) => setEditingNote(e.target.value)}
                placeholder="Add/Edit transaction note..."
                className="flex-1 bg-slate-950 border border-amber-500/60 rounded-lg px-2 py-1 text-xs text-amber-200 outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveNote();
                }}
              />
              <button
                onClick={handleSaveNote}
                className="px-2 py-1 bg-amber-500 text-slate-950 rounded-lg font-bold text-[10px]"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingNote(false)}
                className="px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-[10px]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingNote(true);
              }}
              className="text-amber-300/80 italic flex items-center gap-1 font-sans cursor-pointer hover:text-amber-200 transition group/note"
              title="Click to edit note"
            >
              <FileText className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">{tx.note ? `"${tx.note}"` : '+ Add note to this transaction...'}</span>
            </div>
          )}
        </div>

        {/* EXPANDED EXTRA METADATA SECTION */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-5 pt-2 border-t border-slate-800/80 space-y-1.5 text-[10px] text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800"
          >
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-sans">Tx ID</span>
                <span className="text-cyan-300 font-bold">{tx.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-sans">Raw Timestamp</span>
                <span className="text-slate-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" /> {tx.rawDate || `${tx.date} ${tx.time}`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono pt-1">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-sans">Tag & Category</span>
                <span className="text-purple-300 font-bold flex items-center gap-1">
                  <Tag className="w-3 h-3 text-purple-400" /> {tx.tag || 'General'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-sans">Transfer Kind</span>
                <span className="text-emerald-300 font-bold">{tx.transferType || tx.kind || 'Standard'}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Controls Footer */}
        <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono pt-1 border-t border-slate-800/80 pl-5">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" /> {tx.date} {tx.time}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Copy Info Button */}
            <button
              onClick={handleCopyInfo}
              className="p-1 px-1.5 rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 transition flex items-center gap-1 font-sans text-[9px] font-bold"
              title="Copy Transaction Details"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Duplicate Button */}
            {onDuplicate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(tx);
                }}
                className="p-1 px-1.5 rounded bg-slate-800 hover:bg-purple-600 hover:text-white text-purple-300 transition flex items-center gap-1 font-sans text-[9px] font-bold"
                title="Duplicate Transaction (Today's Date)"
              >
                <CopyPlus className="w-3 h-3" />
                <span>Duplicate</span>
              </button>
            )}

            {onShowQR && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShowQR(tx);
                }}
                className="p-1 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition"
                title="Generate QR Code"
              >
                <QrCode className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrint(tx);
              }}
              className="p-1 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition"
              title="Print Receipt"
            >
              <Printer className="w-3 h-3" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveToRecycleBin(tx);
              }}
              className="p-1 rounded bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition"
              title="Move to Recycle Bin"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
