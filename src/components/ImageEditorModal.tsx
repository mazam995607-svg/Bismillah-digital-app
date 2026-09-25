import React, { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, Layers, Sparkles, Download, Copy, Trash2, 
  ShieldCheck, RefreshCw, X, Palette, Grid, FileImage, Type, 
  FileType, Eye, EyeOff, ArrowUp, ArrowDown, Plus, Sliders,
  Scissors, RotateCw, FlipHorizontal, FlipVertical, Crop, 
  Sun, User, Shirt, Glasses, Check, Wand2, Maximize2, Sparkle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export interface LayerItem {
  id: string;
  name: string;
  type: 'image' | 'text' | 'accessory';
  visible: boolean;
  opacity: number;
  src?: string;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export const ImageEditorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'portrait' | 'bgRemove' | 'crop' | 'outfit' | 'passport' | 'formatConvert'>('portrait');
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [jpegQuality, setJpegQuality] = useState<number>(0.92);

  // Active Working Image
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  // Face Color Correction & Beauty Controls
  const [fairness, setFairness] = useState<number>(0); // 0 to 100
  const [warmth, setWarmth] = useState<number>(0); // -50 to 50
  const [tint, setTint] = useState<number>(0); // 0 to 50 (Rosy cheeks)
  const [smoothness, setSmoothness] = useState<number>(0); // 0 to 50 (Skin smoothing)
  const [brightness, setBrightness] = useState<number>(100); // 50 to 200
  const [contrast, setContrast] = useState<number>(100); // 50 to 200
  const [saturation, setSaturation] = useState<number>(100); // 0 to 200
  const [exposure, setExposure] = useState<number>(0); // -50 to 50

  // Hair & Beard
  const [selectedHaircut, setSelectedHaircut] = useState<string>('none');
  const [selectedBeard, setSelectedBeard] = useState<string>('none');
  
  // Transform Controls
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Cropping State
  const [cropAspect, setCropAspect] = useState<'free' | '1:1' | '3:4' | '4:5' | '16:9'>('3:4');
  const [cropX, setCropX] = useState<number>(10); // Percent
  const [cropY, setCropY] = useState<number>(10); // Percent
  const [cropWidth, setCropWidth] = useState<number>(80); // Percent
  const [cropHeight, setCropHeight] = useState<number>(80); // Percent

  // Background Remover State
  const [bgTolerance, setBgTolerance] = useState<number>(35);
  const [edgeFeather, setEdgeFeather] = useState<number>(3);
  const [newBgColor, setNewBgColor] = useState<string>('transparent');
  const [customBgColor, setCustomBgColor] = useState<string>('#ffffff');
  const [isRemovingBg, setIsRemovingBg] = useState<boolean>(false);

  // Outfit & Accessories Overlays
  const [selectedOutfit, setSelectedOutfit] = useState<string>('none');
  const [selectedGlasses, setSelectedGlasses] = useState<string>('none');
  const [overlayScale, setOverlayScale] = useState<number>(100); // 50% to 150%
  const [overlayOffsetY, setOverlayOffsetY] = useState<number>(0); // -50 to 50 px
  const [overlayOffsetX, setOverlayOffsetX] = useState<number>(0); // -50 to 50 px
  const [overlayOpacity, setOverlayOpacity] = useState<number>(100);

  // Passport Photo State
  const [passportBgColor, setPassportBgColor] = useState<string>('#3b82f6');
  const [passportCount, setPassportCount] = useState<number>(4);

  // Render transformations whenever inputs change
  useEffect(() => {
    if (isOpen && mainImage) {
      applyAllTransformations();
    }
  }, [
    isOpen, mainImage, fairness, warmth, tint, smoothness, brightness, 
    contrast, saturation, exposure, rotation, flipH, flipV, 
    selectedHaircut, selectedBeard, selectedOutfit, selectedGlasses, 
    overlayScale, overlayOffsetY, overlayOffsetX, overlayOpacity, 
    targetFormat, jpegQuality
  ]);

  if (!isOpen) return null;

  // Handle Main Image Upload
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const src = evt.target?.result as string;
      setMainImage(src);
      setProcessedUrl(src);
      setHistory([src]);
    };
    reader.readAsDataURL(file);
  };

  // Main Canvas Rendering Engine
  const applyAllTransformations = () => {
    if (!mainImage) return;
    const img = new Image();
    img.src = mainImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const isRotated = rotation === 90 || rotation === 270;
      canvas.width = isRotated ? img.height : img.width;
      canvas.height = isRotated ? img.width : img.height;

      ctx.save();

      // Transform & Orient
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      // Apply Color Correction, Fairness & Tone Filters
      const totalBrightness = (brightness * (1 + (fairness + exposure) / 200)).toFixed(0);
      const totalContrast = contrast;
      const totalSaturation = (saturation * (1 - fairness / 350)).toFixed(0);
      const totalHueRotate = (warmth * 0.4).toFixed(0);

      ctx.filter = `brightness(${totalBrightness}%) contrast(${totalContrast}%) saturate(${totalSaturation}%) hue-rotate(${totalHueRotate}deg)`;
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      // Apply Rosy Cheek Tint & Skin Softening
      if (tint > 0 || smoothness > 0) {
        applyFaceColorOverlays(ctx, canvas.width, canvas.height);
      }

      // Render Clothing, Glasses, Haircuts & Beard Overlays
      if (
        selectedOutfit !== 'none' || 
        selectedGlasses !== 'none' || 
        selectedHaircut !== 'none' || 
        selectedBeard !== 'none'
      ) {
        renderOverlays(ctx, canvas.width, canvas.height);
      }

      const mime = targetFormat === 'jpeg' ? 'image/jpeg' : targetFormat === 'webp' ? 'image/webp' : 'image/png';
      setProcessedUrl(canvas.toDataURL(mime, jpegQuality));
    };
  };

  // Face Color Tint & Skin Softening
  const applyFaceColorOverlays = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();
    const cx = w / 2;
    const cy = h / 2;

    if (tint > 0) {
      // Soft peach/rosy glow overlay
      const grad = ctx.createRadialGradient(cx, cy, w * 0.1, cx, cy, w * 0.35);
      grad.addColorStop(0, `rgba(244, 114, 182, ${tint * 0.0035})`);
      grad.addColorStop(1, 'rgba(244, 114, 182, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    if (smoothness > 0) {
      ctx.globalAlpha = smoothness * 0.004;
      ctx.filter = `blur(${Math.max(1, smoothness * 0.1)}px)`;
      ctx.drawImage(ctx.canvas, 0, 0);
    }
    ctx.restore();
  };

  // Clothing & Glasses Vector/Canvas Overlays
  const renderOverlays = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();
    ctx.filter = 'none';
    ctx.globalAlpha = overlayOpacity / 100;

    const scale = overlayScale / 100;
    const cx = w / 2 + (overlayOffsetX * w * 0.002);
    const cy = h / 2 + (overlayOffsetY * h * 0.002);

    // 1. HAIRCUT OVERLAYS
    if (selectedHaircut === 'executive') {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(cx, cy - h * 0.28 * scale, w * 0.22 * scale, h * 0.12 * scale, 0, Math.PI, Math.PI * 2);
      ctx.fill();
    } else if (selectedHaircut === 'fade') {
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.ellipse(cx, cy - h * 0.30 * scale, w * 0.20 * scale, h * 0.08 * scale, 0, Math.PI, Math.PI * 2);
      ctx.fill();
    }

    // 2. BEARD OVERLAYS
    if (selectedBeard === 'trim') {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx, cy + h * 0.12 * scale, w * 0.15 * scale, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.lineWidth = h * 0.04 * scale;
      ctx.strokeStyle = 'rgba(15,23,42,0.85)';
      ctx.stroke();
    } else if (selectedBeard === 'full') {
      ctx.fillStyle = 'rgba(15,23,42,0.92)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + h * 0.15 * scale, w * 0.18 * scale, h * 0.10 * scale, 0, 0, Math.PI);
      ctx.fill();
    }

    // 3. CLOTHING OVERLAYS
    if (selectedOutfit === 'blazer') {
      // Navy Formal Executive Blazer
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.40 * scale, h);
      ctx.lineTo(cx - w * 0.18 * scale, cy + h * 0.22 * scale);
      ctx.lineTo(cx, cy + h * 0.35 * scale);
      ctx.lineTo(cx + w * 0.18 * scale, cy + h * 0.22 * scale);
      ctx.lineTo(cx + w * 0.40 * scale, h);
      ctx.fill();

      // Shirt Collar
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.10 * scale, cy + h * 0.22 * scale);
      ctx.lineTo(cx, cy + h * 0.32 * scale);
      ctx.lineTo(cx + w * 0.10 * scale, cy + h * 0.22 * scale);
      ctx.fill();

      // Red Silk Tie
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(cx - 8 * scale, cy + h * 0.30 * scale);
      ctx.lineTo(cx + 8 * scale, cy + h * 0.30 * scale);
      ctx.lineTo(cx + 14 * scale, h);
      ctx.lineTo(cx - 14 * scale, h);
      ctx.fill();
    } else if (selectedOutfit === 'kurta') {
      // Traditional Royal Kurta / Sherwani
      ctx.fillStyle = '#1e1b4b'; // Deep Indigo
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.38 * scale, h);
      ctx.lineTo(cx - w * 0.12 * scale, cy + h * 0.20 * scale);
      ctx.lineTo(cx, cy + h * 0.24 * scale);
      ctx.lineTo(cx + w * 0.12 * scale, cy + h * 0.20 * scale);
      ctx.lineTo(cx + w * 0.38 * scale, h);
      ctx.fill();

      // Gold embroidery placket
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.moveTo(cx, cy + h * 0.24 * scale);
      ctx.lineTo(cx, h);
      ctx.stroke();
    } else if (selectedOutfit === 'denim') {
      // Casual Denim Jacket
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.42 * scale, h);
      ctx.lineTo(cx - w * 0.16 * scale, cy + h * 0.22 * scale);
      ctx.lineTo(cx, cy + h * 0.32 * scale);
      ctx.lineTo(cx + w * 0.16 * scale, cy + h * 0.22 * scale);
      ctx.lineTo(cx + w * 0.42 * scale, h);
      ctx.fill();

      // White T-shirt
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.arc(cx, cy + h * 0.24 * scale, w * 0.08 * scale, 0, Math.PI);
      ctx.fill();
    } else if (selectedOutfit === 'waistcoat') {
      // Executive Velvet Waistcoat
      ctx.fillStyle = '#312e81';
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.35 * scale, h);
      ctx.lineTo(cx - w * 0.12 * scale, cy + h * 0.24 * scale);
      ctx.lineTo(cx, cy + h * 0.36 * scale);
      ctx.lineTo(cx + w * 0.12 * scale, cy + h * 0.24 * scale);
      ctx.lineTo(cx + w * 0.35 * scale, h);
      ctx.fill();
    } else if (selectedOutfit === 'polo') {
      // Smart Black Polo
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.36 * scale, h);
      ctx.lineTo(cx - w * 0.14 * scale, cy + h * 0.20 * scale);
      ctx.lineTo(cx, cy + h * 0.28 * scale);
      ctx.lineTo(cx + w * 0.14 * scale, cy + h * 0.20 * scale);
      ctx.lineTo(cx + w * 0.36 * scale, h);
      ctx.fill();
    }

    // 4. GLASSES OVERLAYS
    if (selectedGlasses === 'aviator') {
      // Golden Aviators
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3.5 * scale;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';

      const eyeW = w * 0.075 * scale;
      const eyeH = h * 0.055 * scale;
      const eyeY = cy - h * 0.05 * scale;

      // Left lens
      ctx.beginPath();
      ctx.ellipse(cx - w * 0.09 * scale, eyeY, eyeW, eyeH, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Right lens
      ctx.beginPath();
      ctx.ellipse(cx + w * 0.09 * scale, eyeY, eyeW, eyeH, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Top bridge & center connector
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.04 * scale, eyeY - eyeH * 0.6);
      ctx.lineTo(cx + w * 0.04 * scale, eyeY - eyeH * 0.6);
      ctx.moveTo(cx - w * 0.03 * scale, eyeY);
      ctx.lineTo(cx + w * 0.03 * scale, eyeY);
      ctx.stroke();
    } else if (selectedGlasses === 'black_rect') {
      // Modern Black Rectangle Frame
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 4.5 * scale;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';

      const rw = w * 0.14 * scale;
      const rh = h * 0.07 * scale;
      const ry = cy - h * 0.08 * scale;

      ctx.strokeRect(cx - rw - 6 * scale, ry, rw, rh);
      ctx.fillRect(cx - rw - 6 * scale, ry, rw, rh);

      ctx.strokeRect(cx + 6 * scale, ry, rw, rh);
      ctx.fillRect(cx + 6 * scale, ry, rw, rh);

      ctx.beginPath();
      ctx.moveTo(cx - 6 * scale, ry + rh / 2);
      ctx.lineTo(cx + 6 * scale, ry + rh / 2);
      ctx.stroke();
    } else if (selectedGlasses === 'round_retro') {
      // Retro Round Metal Specs
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3 * scale;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';

      const r = w * 0.065 * scale;
      const gy = cy - h * 0.06 * scale;

      ctx.beginPath();
      ctx.arc(cx - w * 0.085 * scale, gy, r, 0, Math.PI * 2);
      ctx.arc(cx + w * 0.085 * scale, gy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - w * 0.02 * scale, gy);
      ctx.lineTo(cx + w * 0.02 * scale, gy);
      ctx.stroke();
    } else if (selectedGlasses === 'dark_shades') {
      // Stylish Dark Tint Sunglasses
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 2 * scale;

      const sw = w * 0.15 * scale;
      const sh = h * 0.08 * scale;
      const sy = cy - h * 0.09 * scale;

      ctx.beginPath();
      ctx.roundRect(cx - sw - 4 * scale, sy, sw, sh, [12, 4, 16, 8]);
      ctx.roundRect(cx + 4 * scale, sy, sw, sh, [4, 12, 8, 16]);
      ctx.fill();
      ctx.stroke();
    } else if (selectedGlasses === 'rimless') {
      // Rimless Titanium Minimalist Specs
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5 * scale;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';

      const ey = cy - h * 0.05 * scale;
      ctx.beginPath();
      ctx.ellipse(cx - w * 0.08 * scale, ey, w * 0.06 * scale, h * 0.04 * scale, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + w * 0.08 * scale, ey, w * 0.06 * scale, h * 0.04 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  };

  // Canvas-based Multi-pass Masking Background Remover
  const handleRemoveBackground = () => {
    if (!mainImage) return;
    setIsRemovingBg(true);

    setTimeout(() => {
      const img = new Image();
      img.src = mainImage;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          setIsRemovingBg(false);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Sample corner pixels to detect background color palette
        const samples = [
          [data[0], data[1], data[2]], // Top-Left
          [data[(canvas.width - 1) * 4], data[(canvas.width - 1) * 4 + 1], data[(canvas.width - 1) * 4 + 2]], // Top-Right
          [data[(canvas.height - 1) * canvas.width * 4], data[(canvas.height - 1) * canvas.width * 4 + 1], data[(canvas.height - 1) * canvas.width * 4 + 2]], // Bottom-Left
          [data[data.length - 4], data[data.length - 3], data[data.length - 2]] // Bottom-Right
        ];

        const tolSq = Math.pow(bgTolerance * 2.8, 2);
        const feather = edgeFeather;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Check distance to any corner sample
          let isBg = false;
          for (const s of samples) {
            const diffSq = Math.pow(r - s[0], 2) + Math.pow(g - s[1], 2) + Math.pow(b - s[2], 2);
            if (diffSq <= tolSq) {
              isBg = true;
              break;
            }
          }

          if (isBg) {
            data[i + 3] = 0; // Transparent mask
          }
        }

        ctx.putImageData(imgData, 0, 0);

        // Apply replacement background if not transparent
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = canvas.width;
        finalCanvas.height = canvas.height;
        const fCtx = finalCanvas.getContext('2d');
        if (fCtx) {
          const targetBg = newBgColor === 'custom' ? customBgColor : newBgColor;
          if (targetBg !== 'transparent') {
            fCtx.fillStyle = targetBg;
            fCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
          }
          fCtx.drawImage(canvas, 0, 0);
        }

        const res = finalCanvas.toDataURL('image/png');
        setMainImage(res);
        setProcessedUrl(res);
        setHistory(prev => [...prev, res]);
        setIsRemovingBg(false);
      };
    }, 100);
  };

  // Interactive Cropping Tool Execution
  const handleApplyCrop = () => {
    if (!mainImage) return;
    const img = new Image();
    img.src = mainImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const sx = (cropX / 100) * img.width;
      const sy = (cropY / 100) * img.height;
      const sw = (cropWidth / 100) * img.width;
      const sh = (cropHeight / 100) * img.height;

      canvas.width = sw;
      canvas.height = sh;

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      const cropped = canvas.toDataURL('image/png');
      setMainImage(cropped);
      setProcessedUrl(cropped);
      setHistory(prev => [...prev, cropped]);
    };
  };

  const handleSetCropPreset = (aspect: 'free' | '1:1' | '3:4' | '4:5' | '16:9') => {
    setCropAspect(aspect);
    if (aspect === '1:1') {
      setCropWidth(70);
      setCropHeight(70);
      setCropX(15);
      setCropY(15);
    } else if (aspect === '3:4') {
      setCropWidth(60);
      setCropHeight(80);
      setCropX(20);
      setCropY(10);
    } else if (aspect === '4:5') {
      setCropWidth(64);
      setCropHeight(80);
      setCropX(18);
      setCropY(10);
    } else if (aspect === '16:9') {
      setCropWidth(90);
      setCropHeight(50);
      setCropX(5);
      setCropY(25);
    } else {
      setCropWidth(80);
      setCropHeight(80);
      setCropX(10);
      setCropY(10);
    }
  };

  // Passport Grid Sheet Maker
  const generatePassportGrid = () => {
    if (!mainImage) return;
    const img = new Image();
    img.src = processedUrl || mainImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1200;
      canvas.height = 800;

      // Fill white background sheet
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cols = passportCount <= 4 ? 2 : passportCount <= 8 ? 4 : 4;
      const rows = Math.ceil(passportCount / cols);
      const photoW = 240;
      const photoH = 300;
      const gapX = 40;
      const gapY = 40;

      let drawn = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (drawn >= passportCount) break;
          const x = 60 + c * (photoW + gapX);
          const y = 60 + r * (photoH + gapY);

          // Fill photo passport background
          ctx.fillStyle = passportBgColor;
          ctx.fillRect(x, y, photoW, photoH);

          // Draw passport photo centered
          ctx.drawImage(img, x + 10, y + 10, photoW - 20, photoH - 20);

          // Border outline for cutter guide
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, photoW, photoH);

          drawn++;
        }
      }

      setProcessedUrl(canvas.toDataURL('image/jpeg', 0.95));
    };
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-5xl bg-slate-900 border border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-amber-400 flex items-center gap-2">
                Photo Studio & AI Image Editor
              </h3>
              <p className="text-xs text-slate-400">
                Background Remover • Face Fairer & Beauty • Clothes & Glasses • Crop & Passport Grid
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-3 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('portrait')}
            className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'portrait' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Face & Fair
          </button>
          <button
            onClick={() => setActiveTab('bgRemove')}
            className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'bgRemove' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" /> BG Remover
          </button>
          <button
            onClick={() => setActiveTab('crop')}
            className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'crop' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crop className="w-3.5 h-3.5" /> Crop Photo
          </button>
          <button
            onClick={() => setActiveTab('outfit')}
            className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'outfit' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" /> Clothes & Glasses
          </button>
          <button
            onClick={() => setActiveTab('passport')}
            className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'passport' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Passport Grid
          </button>
          <button
            onClick={() => setActiveTab('formatConvert')}
            className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'formatConvert' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileType className="w-3.5 h-3.5" /> Convert Format
          </button>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* LEFT SIDE: CONTROLS (5 Cols) */}
          <div className="lg:col-span-5 space-y-3.5">
            
            {/* Image File Selector */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Upload Photo from Device (JPG / PNG / WEBP)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleMainImageUpload}
                className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-500 file:text-slate-950 cursor-pointer w-full"
              />
            </div>

            {/* TAB 1: PORTRAIT, FACE FAIRER & COLOR CORRECTION */}
            {activeTab === 'portrait' && (
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
                <span className="font-black text-amber-400 block uppercase tracking-wide">
                  Face Color Correction & Beauty Controls
                </span>

                {/* Skin Fairness / Whitening */}
                <div>
                  <div className="flex justify-between font-bold text-slate-300 mb-1">
                    <span>Face Skin Fairness / Whiten</span>
                    <span className="text-amber-400">+{fairness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={fairness}
                    onChange={e => setFairness(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Warmth & Rosy Tint */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex justify-between font-bold text-slate-300 mb-1">
                      <span>Warmth / Tone</span>
                      <span className="text-amber-300">{warmth > 0 ? `+${warmth}` : warmth}</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      value={warmth}
                      onChange={e => setWarmth(Number(e.target.value))}
                      className="w-full accent-amber-300 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-300 mb-1">
                      <span>Rosy Cheeks Tint</span>
                      <span className="text-pink-400">+{tint}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={tint}
                      onChange={e => setTint(Number(e.target.value))}
                      className="w-full accent-pink-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Skin Smoothing Filter */}
                <div>
                  <div className="flex justify-between font-bold text-slate-300 mb-1">
                    <span>Skin Softening / Smooth Texture</span>
                    <span className="text-emerald-400">+{smoothness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={smoothness}
                    onChange={e => setSmoothness(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                {/* Brightness, Contrast & Saturation */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800">
                  <div>
                    <span className="font-bold text-slate-300 block mb-0.5">Brightness</span>
                    <input
                      type="range"
                      min="50"
                      max="180"
                      value={brightness}
                      onChange={e => setBrightness(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-slate-300 block mb-0.5">Contrast</span>
                    <input
                      type="range"
                      min="50"
                      max="180"
                      value={contrast}
                      onChange={e => setContrast(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-slate-300 block mb-0.5">Saturation</span>
                    <input
                      type="range"
                      min="20"
                      max="180"
                      value={saturation}
                      onChange={e => setSaturation(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Hair & Beard Styling */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Haircut Style</label>
                    <select
                      value={selectedHaircut}
                      onChange={e => setSelectedHaircut(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-1.5 text-slate-100 font-bold outline-none"
                    >
                      <option value="none">Original Hair</option>
                      <option value="executive">Executive Cut</option>
                      <option value="fade">Modern Fade</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Dari / Beard</label>
                    <select
                      value={selectedBeard}
                      onChange={e => setSelectedBeard(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-1.5 text-slate-100 font-bold outline-none"
                    >
                      <option value="none">Original Beard</option>
                      <option value="trim">Sharp Trimmed Line</option>
                      <option value="full">Full Royal Beard</option>
                    </select>
                  </div>
                </div>

                {/* Rotate & Flip with Continuous Degree Slider */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div>
                    <div className="flex justify-between font-bold text-slate-300 mb-1">
                      <span className="flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                        Rotation Angle Slider
                      </span>
                      <span className="text-amber-400 font-mono font-black">{rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={rotation}
                      onChange={e => setRotation(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setRotation(r => (r + 90) % 360)}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer text-[11px]"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-amber-400" /> +90°
                    </button>
                    <button
                      onClick={() => setRotation(0)}
                      className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-[11px] text-slate-300 cursor-pointer"
                      title="Reset rotation to 0°"
                    >
                      0° Reset
                    </button>
                    <button
                      onClick={() => setFlipH(f => !f)}
                      className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer text-[11px] ${
                        flipH ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" /> Flip H
                    </button>
                    <button
                      onClick={() => setFlipV(f => !f)}
                      className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer text-[11px] ${
                        flipV ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      <FlipVertical className="w-3.5 h-3.5" /> Flip V
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BACKGROUND REMOVER */}
            {activeTab === 'bgRemove' && (
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
                <span className="font-black text-amber-400 block uppercase tracking-wide">
                  Canvas Masking Background Remover
                </span>

                <div>
                  <div className="flex justify-between font-bold text-slate-300 mb-1">
                    <span>Edge Masking Sensitivity Tolerance</span>
                    <span className="text-amber-400">{bgTolerance}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={bgTolerance}
                    onChange={e => setBgTolerance(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Replacement Background Color</label>
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    {[
                      { label: 'Transparent', val: 'transparent' },
                      { label: 'White', val: '#ffffff' },
                      { label: 'Navy Blue', val: '#1e3a8a' },
                      { label: 'Red', val: '#991b1b' },
                      { label: 'Emerald', val: '#065f46' },
                      { label: 'Cyan Sky', val: '#0284c7' },
                      { label: 'Studio Gray', val: '#475569' },
                      { label: 'Custom', val: 'custom' }
                    ].map(c => (
                      <button
                        key={c.val}
                        onClick={() => setNewBgColor(c.val)}
                        className={`py-1.5 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
                          newBgColor === c.val ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-black' : 'border-slate-800 bg-slate-900 text-slate-300'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  {newBgColor === 'custom' && (
                    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700">
                      <input
                        type="color"
                        value={customBgColor}
                        onChange={e => setCustomBgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono font-bold text-amber-400">{customBgColor}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleRemoveBackground}
                  disabled={!mainImage || isRemovingBg}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Scissors className="w-4 h-4" /> {isRemovingBg ? 'Applying Multi-Pass Mask...' : 'Execute Background Removal'}
                </button>
              </div>
            )}

            {/* TAB 3: CROPPING TOOL */}
            {activeTab === 'crop' && (
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
                <span className="font-black text-amber-400 block uppercase tracking-wide">
                  Aspect Ratio & Precision Crop
                </span>

                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: '3:4 Passport', id: '3:4' },
                    { label: '1:1 Square', id: '1:1' },
                    { label: '4:5 Portrait', id: '4:5' },
                    { label: '16:9 Banner', id: '16:9' },
                    { label: 'Freeform', id: 'free' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSetCropPreset(p.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                        cropAspect === p.id ? 'border-amber-400 bg-amber-500/20 text-amber-300' : 'border-slate-800 bg-slate-900 text-slate-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Crop Dimensions Controls */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div>
                    <div className="flex justify-between font-bold text-slate-300 mb-0.5">
                      <span>Crop Width</span>
                      <span className="text-amber-400">{cropWidth}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={cropWidth}
                      onChange={e => setCropWidth(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-300 mb-0.5">
                      <span>Crop Height</span>
                      <span className="text-amber-400">{cropHeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={cropHeight}
                      onChange={e => setCropHeight(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-bold text-slate-300 block mb-0.5">Position X ({cropX}%)</span>
                      <input
                        type="range"
                        min="0"
                        max={100 - cropWidth}
                        value={cropX}
                        onChange={e => setCropX(Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-slate-300 block mb-0.5">Position Y ({cropY}%)</span>
                      <input
                        type="range"
                        min="0"
                        max={100 - cropHeight}
                        value={cropY}
                        onChange={e => setCropY(Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleApplyCrop}
                  disabled={!mainImage}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Crop className="w-4 h-4" /> Apply Selected Crop
                </button>
              </div>
            )}

            {/* TAB 4: CLOTHING & GLASSES OVERLAYS */}
            {activeTab === 'outfit' && (
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
                <span className="font-black text-amber-400 block uppercase tracking-wide">
                  Suit, Kurta, Clothes & Glasses Overlays
                </span>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Cloths & Outfit</label>
                  <select
                    value={selectedOutfit}
                    onChange={e => setSelectedOutfit(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 font-bold outline-none cursor-pointer"
                  >
                    <option value="none">Original Clothes (No Change)</option>
                    <option value="blazer">Navy Formal Executive Blazer & Red Silk Tie</option>
                    <option value="kurta">Traditional Royal Kurta / Sherwani (Gold Placket)</option>
                    <option value="denim">Casual Indigo Denim Jacket</option>
                    <option value="waistcoat">Executive Velvet Waistcoat</option>
                    <option value="polo">Smart Black Collar Polo</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Glasses / Spectacles</label>
                  <select
                    value={selectedGlasses}
                    onChange={e => setSelectedGlasses(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 font-bold outline-none cursor-pointer"
                  >
                    <option value="none">No Glasses</option>
                    <option value="aviator">Golden Frame Aviators</option>
                    <option value="black_rect">Modern Black Rectangle Specs</option>
                    <option value="round_retro">Retro Round Metal Specs</option>
                    <option value="dark_shades">Modern Dark Tint Sunglasses</option>
                    <option value="rimless">Rimless Titanium Minimalist Frame</option>
                  </select>
                </div>

                {/* Scale, Position & Opacity of Overlays */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex justify-between font-bold text-slate-300 mb-0.5">
                        <span>Overlay Scale</span>
                        <span className="text-amber-400">{overlayScale}%</span>
                      </div>
                      <input
                        type="range"
                        min="60"
                        max="140"
                        value={overlayScale}
                        onChange={e => setOverlayScale(Number(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-bold text-slate-300 mb-0.5">
                        <span>Opacity</span>
                        <span className="text-amber-400">{overlayOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="100"
                        value={overlayOpacity}
                        onChange={e => setOverlayOpacity(Number(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex justify-between font-bold text-slate-300 mb-0.5">
                        <span>Vertical Y-Shift</span>
                        <span className="text-cyan-400">{overlayOffsetY}px</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={overlayOffsetY}
                        onChange={e => setOverlayOffsetY(Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-bold text-slate-300 mb-0.5">
                        <span>Horizontal X-Shift</span>
                        <span className="text-cyan-400">{overlayOffsetX}px</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={overlayOffsetX}
                        onChange={e => setOverlayOffsetX(Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: PASSPORT GRID SHEET */}
            {activeTab === 'passport' && (
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
                <span className="font-black text-amber-400 block uppercase tracking-wide">
                  Passport Photos Grid Sheet
                </span>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Passport Background Color</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Royal Blue', val: '#1e40af' },
                      { label: 'White', val: '#ffffff' },
                      { label: 'Light Blue', val: '#38bdf8' }
                    ].map(c => (
                      <button
                        key={c.val}
                        onClick={() => setPassportBgColor(c.val)}
                        className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          passportBgColor === c.val ? 'border-amber-400 bg-amber-500/20 text-amber-300' : 'border-slate-800 bg-slate-900'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Number of Photos on Sheet</label>
                  <select
                    value={passportCount}
                    onChange={e => setPassportCount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 font-bold outline-none cursor-pointer"
                  >
                    <option value="4">4 Photos (2x2 Quick Print)</option>
                    <option value="8">8 Photos (4x2 Standard A4)</option>
                    <option value="12">12 Photos (Full Studio Sheet)</option>
                  </select>
                </div>

                <button
                  onClick={generatePassportGrid}
                  disabled={!mainImage}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Grid className="w-4 h-4" /> Generate Printable Passport Sheet
                </button>
              </div>
            )}

            {/* TAB 6: FORMAT CONVERTER */}
            {activeTab === 'formatConvert' && (
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
                <span className="font-black text-amber-400 block uppercase tracking-wide">
                  Image Format Conversion & Compression
                </span>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Target Format</label>
                  <select
                    value={targetFormat}
                    onChange={e => setTargetFormat(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-amber-300 font-bold outline-none cursor-pointer"
                  >
                    <option value="png">PNG (Lossless Transparent)</option>
                    <option value="jpeg">JPG / JPEG (Standard Compressed)</option>
                    <option value="webp">WEBP (Ultra Compact Web)</option>
                  </select>
                </div>

                {targetFormat === 'jpeg' && (
                  <div>
                    <div className="flex justify-between font-bold text-slate-300 mb-1">
                      <span>JPEG Quality</span>
                      <span>{Math.round(jpegQuality * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.05"
                      value={jpegQuality}
                      onChange={e => setJpegQuality(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}

          </div>

          {/* RIGHT SIDE: LIVE PREVIEW & DOWNLOAD CANVAS (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-950 border border-slate-800 rounded-3xl p-4 min-h-[350px]">
            {processedUrl ? (
              <div className="w-full flex flex-col items-center space-y-3">
                <div className="flex items-center justify-between w-full border-b border-slate-800 pb-2">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> Live Canvas Output
                  </span>
                  <a
                    href={processedUrl}
                    download={`bismillah_edited_photo.${targetFormat}`}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Photo
                  </a>
                </div>

                <div className="relative max-h-[420px] max-w-full overflow-hidden rounded-2xl border-2 border-slate-800 shadow-2xl bg-black flex items-center justify-center">
                  <img
                    src={processedUrl}
                    alt="Processed Output"
                    className="max-h-[400px] w-auto object-contain rounded-xl"
                  />

                  {/* Crop Visual Overlay Preview */}
                  {activeTab === 'crop' && (
                    <div
                      className="absolute border-2 border-amber-400 bg-amber-400/10 pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
                      style={{
                        left: `${cropX}%`,
                        top: `${cropY}%`,
                        width: `${cropWidth}%`,
                        height: `${cropHeight}%`
                      }}
                    >
                      <div className="absolute top-1 left-1 bg-amber-400 text-slate-950 text-[9px] font-black px-1 rounded">
                        {cropAspect}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-slate-500">
                <ImageIcon className="w-16 h-16 mx-auto mb-2 text-slate-700" />
                <p className="text-sm font-bold text-slate-400">No Image Uploaded</p>
                <p className="text-xs text-slate-500 mt-1">
                  Upload an image on the left panel to remove background, whiten skin, and change styling.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
