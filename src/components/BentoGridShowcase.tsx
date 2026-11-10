import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, Plus, X, RotateCcw, LayoutGrid } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';
import { NoteItem } from '../types';

interface BentoGridShowcaseProps {
  bentoNotes: NoteItem[];
  allNotes: NoteItem[];
  onCopy: (text: string, title?: string) => void;
  onRemoveFromBento: (id: string) => void;
  onAddToBento: (id: string) => void;
  onOpenComposer: () => void;
  onResetBento: () => void;
}

interface AntigravityParticle {
  ringRadius: number;
  baseAngle: number;
  angularSpeed: number;
  eccentricity: number;
  wanderSpeed: number;
  wanderRadius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  length: number;
  thickness: number;
  color: string;
  baseAlpha: number;
  phase: number;
}

const ANTIGRAVITY_COLORS = [
  '#3b82f6', // Electric Blue
  '#60a5fa', // Soft Sky Blue
  '#6366f1', // Vibrant Indigo
  '#818cf8', // Luminous Indigo
  '#4f46e5', // Cosmic Indigo
  '#a78bfa', // Soft Violet Accent
];

export const BentoGridShowcase: React.FC<BentoGridShowcaseProps> = ({
  bentoNotes,
  allNotes,
  onCopy,
  onRemoveFromBento,
  onAddToBento,
  onOpenComposer,
  onResetBento,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Refs for Antigravity Particle Field Canvas
  const gridWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = gridWrapperRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let particles: AntigravityParticle[] = [];

    // Fluid spring-smoothed gravity attractor
    const attractor = { x: 0, y: 0, vx: 0, vy: 0 };

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const initParticles = (w: number, h: number) => {
      const maxRadius = Math.hypot(w, h) * 0.58;
      const minRadius = 42;
      // Reduced ring count & density so radial objects feel airy and uncluttered
      const ringCount = 10;
      const newParticles: AntigravityParticle[] = [];

      for (let rIdx = 0; rIdx < ringCount; rIdx++) {
        const t = rIdx / (ringCount - 1);
        const baseRingRadius =
          minRadius + Math.pow(t, 1.05) * (maxRadius - minRadius);
        const countInRing = Math.floor(8 + rIdx * 1.4);

        for (let i = 0; i < countInRing; i++) {
          // Organic angular & radial jitter so particles don't look locked in stiff concentric wheels
          const angle =
            (i / countInRing) * Math.PI * 2 +
            rIdx * 0.45 +
            (Math.random() - 0.5) * 0.32;
          const radiusJitter = (Math.random() - 0.5) * 28;
          const radius = Math.max(24, baseRingRadius + radiusJitter);

          const px = w / 2 + Math.cos(angle) * radius;
          const py = h / 2 + Math.sin(angle) * radius;

          newParticles.push({
            ringRadius: radius,
            baseAngle: angle,
            angularSpeed:
              (0.00045 + (1 - t) * 0.00075) *
              (rIdx % 3 === 0 ? -0.75 : 1) *
              (0.8 + Math.random() * 0.4),
            eccentricity: 0.88 + Math.random() * 0.24,
            wanderSpeed: 0.4 + Math.random() * 0.7,
            wanderRadius: 12 + Math.random() * 20,
            x: px,
            y: py,
            vx: 0,
            vy: 0,
            angle: angle + Math.PI * 0.5,
            length: 4.5 + Math.random() * 4.5 + t * 2.5,
            thickness: 1.8 + Math.random() * 1.2,
            color:
              ANTIGRAVITY_COLORS[
                Math.floor(Math.random() * ANTIGRAVITY_COLORS.length)
              ],
            baseAlpha: 0.32 + Math.random() * 0.45,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
      particles = newParticles;
    };

    const updateCanvasSize = () => {
      if (!wrapper || !canvas) return;
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (attractor.x === 0 && attractor.y === 0) {
        attractor.x = width * 0.5;
        attractor.y = height * 0.5;
      }
      initParticles(width, height);
    };

    updateCanvasSize();
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(wrapper);

    let time = 0;

    // Helper for smooth shortest-angle interpolation
    const lerpAngle = (current: number, target: number, factor: number) => {
      const diff =
        ((target - current + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      return current + diff * factor;
    };

    const renderFrame = () => {
      time += 0.012;
      ctx.clearRect(0, 0, width, height);

      // Smoothly move gravity attractor with inertia so cursor transitions are liquid, never jerky
      const targetX = pointerRef.current.active
        ? pointerRef.current.x
        : width * 0.5 +
          Math.sin(time * 0.55) * (width * 0.14) +
          Math.cos(time * 0.31) * 28;
      const targetY = pointerRef.current.active
        ? pointerRef.current.y
        : height * 0.5 +
          Math.cos(time * 0.43) * (height * 0.12) +
          Math.sin(time * 0.27) * 20;

      const springStrength = pointerRef.current.active ? 0.018 : 0.008;
      attractor.vx =
        (attractor.vx + (targetX - attractor.x) * springStrength) * 0.86;
      attractor.vy =
        (attractor.vy + (targetY - attractor.y) * springStrength) * 0.86;
      attractor.x += attractor.vx;
      attractor.y += attractor.vy;

      // --- LAYER 1: FLUID AURORA / LIQUID NEBULA BACKGROUND ---
      const maxDim = Math.max(width, height, 400);

      // Fluid Blob 1: Deep Sapphire wave drifting across top-left / cursor
      const blob1X =
        width * 0.35 +
        Math.sin(time * 0.48) * (width * 0.22) +
        (attractor.x - width * 0.5) * 0.28;
      const blob1Y =
        height * 0.4 +
        Math.cos(time * 0.37) * (height * 0.22) +
        (attractor.y - height * 0.5) * 0.28;
      const grad1 = ctx.createRadialGradient(
        blob1X,
        blob1Y,
        10,
        blob1X,
        blob1Y,
        maxDim * 0.58
      );
      grad1.addColorStop(0, 'rgba(37, 99, 235, 0.16)');
      grad1.addColorStop(0.5, 'rgba(29, 78, 216, 0.06)');
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Fluid Blob 2: Cosmic Indigo-Violet counter-flowing wave
      const blob2X =
        width * 0.68 +
        Math.cos(time * 0.41 + 1.4) * (width * 0.24) -
        (attractor.x - width * 0.5) * 0.18;
      const blob2Y =
        height * 0.62 +
        Math.sin(time * 0.52 + 0.9) * (height * 0.2) -
        (attractor.y - height * 0.5) * 0.18;
      const grad2 = ctx.createRadialGradient(
        blob2X,
        blob2Y,
        10,
        blob2X,
        blob2Y,
        maxDim * 0.54
      );
      grad2.addColorStop(0, 'rgba(99, 102, 241, 0.14)');
      grad2.addColorStop(0.55, 'rgba(109, 40, 217, 0.05)');
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Fluid Blob 3: Interactive Cursor / Attractor Core Glow
      const grad3 = ctx.createRadialGradient(
        attractor.x,
        attractor.y,
        5,
        attractor.x,
        attractor.y,
        maxDim * 0.42
      );
      grad3.addColorStop(
        0,
        pointerRef.current.active
          ? 'rgba(59, 130, 246, 0.18)'
          : 'rgba(56, 189, 248, 0.08)'
      );
      grad3.addColorStop(0.45, 'rgba(79, 70, 229, 0.05)');
      grad3.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, width, height);

      // --- LAYER 2: SILKY ZERO-GRAVITY RADIAL & FLUID PARTICLES ---
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.baseAngle += p.angularSpeed;
        }

        // Organic fluid breathing & curl-like wandering offset
        const breathWave =
          Math.sin(time * 0.95 + p.phase + p.ringRadius * 0.008) * 18;
        const wanderX =
          Math.cos(time * p.wanderSpeed + p.phase) * p.wanderRadius;
        const wanderY =
          Math.sin(time * (p.wanderSpeed * 0.85) + p.phase * 1.3) *
          p.wanderRadius;

        const effectiveRadius = Math.max(24, p.ringRadius + breathWave);

        // Softly shift orbital center toward the fluid attractor
        const centerMix = pointerRef.current.active ? 0.38 : 0.18;
        const originX =
          width * 0.5 * (1 - centerMix) + attractor.x * centerMix;
        const originY =
          height * 0.5 * (1 - centerMix) + attractor.y * centerMix;

        const homeX =
          originX +
          Math.cos(p.baseAngle) * effectiveRadius +
          wanderX;
        const homeY =
          originY +
          Math.sin(p.baseAngle) * (effectiveRadius * p.eccentricity) +
          wanderY;

        // Very gentle elastic tether so particles float freely instead of snapping rigidly
        const dxHome = homeX - p.x;
        const dyHome = homeY - p.y;
        p.vx += dxHome * 0.013;
        p.vy += dyHome * 0.013;

        // Continuous ambient fluid current across the canvas
        const flowAngle =
          Math.sin(p.x * 0.004 + time * 0.6) +
          Math.cos(p.y * 0.004 - time * 0.5);
        p.vx += Math.cos(flowAngle) * 0.025;
        p.vy += Math.sin(flowAngle) * 0.025;

        // Smooth radial gravity & silky orbital vortex around cursor
        const dxCursor = attractor.x - p.x;
        const dyCursor = attractor.y - p.y;
        const distToCursor = Math.hypot(dxCursor, dyCursor) || 1;

        if (
          pointerRef.current.active &&
          distToCursor < 380 &&
          !prefersReducedMotion
        ) {
          // Smooth cubic falloff so entry/exit into cursor field is velvety
          const normDist = 1 - distToCursor / 380;
          const pullStrength = normDist * normDist * 0.28;
          const nx = dxCursor / distToCursor;
          const ny = dyCursor / distToCursor;

          // Gentle inner cushion so particles swirl around the cursor rather than bunching stiffly
          const radialDir = distToCursor < 68 ? -0.45 : 0.42;
          const swirlStrength = 0.52;

          p.vx += (nx * radialDir - ny * swirlStrength) * pullStrength;
          p.vy += (ny * radialDir + nx * swirlStrength) * pullStrength;
        }

        // High fluid damping for silky, weightless momentum
        p.vx *= 0.92;
        p.vy *= 0.92;

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
        } else {
          p.x = homeX;
          p.y = homeY;
        }

        // Smoothly orient capsule along a blend of radial tangent & actual velocity vector
        const angleToAttractor = Math.atan2(
          p.y - attractor.y,
          p.x - attractor.x
        );
        const speed = Math.hypot(p.vx, p.vy);
        const velocityAngle =
          speed > 0.15 ? Math.atan2(p.vy, p.vx) : angleToAttractor + 0.45;
        const targetRotation = lerpAngle(
          angleToAttractor + 0.42,
          velocityAngle,
          Math.min(0.65, speed * 0.22)
        );
        p.angle = lerpAngle(p.angle, targetRotation, 0.08);

        const stretch = Math.min(7, speed * 1.6);
        const drawLen = p.length + stretch;

        const proximityBoost =
          pointerRef.current.active && distToCursor < 300
            ? (1 - distToCursor / 300) * 0.3
            : 0;
        const alpha = Math.min(
          0.95,
          p.baseAlpha +
            Math.sin(time * 1.4 + p.phase) * 0.1 +
            proximityBoost
        );

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.beginPath();
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = Math.max(0.12, alpha);
        ctx.lineWidth = p.thickness;
        ctx.lineCap = 'round';
        ctx.moveTo(-drawLen * 0.5, 0);
        ctx.lineTo(drawLen * 0.5, 0);
        ctx.stroke();
        ctx.restore();
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [bentoNotes.length]);

  const handleGridMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gridWrapperRef.current) return;
    const rect = gridWrapperRef.current.getBoundingClientRect();
    pointerRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  };

  const handleGridMouseLeave = () => {
    pointerRef.current.active = false;
  };

  const handleQuickCopy = (key: string, text: string, title?: string) => {
    onCopy(text, title);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Notes not currently in Bento Grid
  const availableToAdd = allNotes.filter(
    (n) =>
      !bentoNotes.some((b) => b.id === n.id) &&
      (n.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        n.content.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Section Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
            <div className="relative flex h-5 w-5 items-center justify-center">
              <div className="absolute inset-0 rounded-md gemini-gradient-glow blur-[3px] opacity-75" />
              <div className="relative flex h-full w-full items-center justify-center rounded-md gemini-gradient-bg p-[1px] overflow-hidden">
                <img
                  src="/assets/aistudio/bento_logo_clean.png"
                  alt="Bento"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
            <span>INTERACTIVE BENTO GRID (KUSTOMISASI BEBAS)</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Kartu Bento Cepat Siap Salin
            </span>
          </h2>
          <p className="mt-1.5 text-xs text-zinc-400 max-w-xl">
            Tambah atau hilangkan kartu di Bento Grid ini dengan tombol <span className="text-rose-400 font-semibold">[✕]</span> pada setiap kartu, atau tombol <span className="text-indigo-400 font-semibold">[+ Tambah Kartu]</span> di bawah.
          </p>
        </div>

        {/* Action Controls for Bento Grid */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:opacity-95 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Tambah Kartu ke Bento</span>
          </button>

          <button
            onClick={onResetBento}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Kembalikan susunan kartu Bento ke default"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset Susunan</span>
          </button>
        </div>
      </div>

      {/* Bento Grid: Unified Google Antigravity Particle Field + Translucent Glass Cards */}
      {bentoNotes.length > 0 ? (
        <div
          ref={gridWrapperRef}
          onMouseMove={handleGridMouseMove}
          onMouseLeave={handleGridMouseLeave}
          className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-[#030307] p-5 sm:p-6 shadow-[0_0_50px_-12px_rgba(59,130,246,0.22)] grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {/* Layer 0: Google Antigravity Radial Particle Field Canvas */}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
          />

          {/* Subtle vignette ring so edges blend seamlessly */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 rounded-3xl shadow-[inset_0_0_60px_rgba(3,3,7,0.75)]"
          />

          {/* Layer 1: Translucent Glass Bento Cards */}
          {bentoNotes.map((note, index) => {
            const isFirst = index === 0;
            const slotNum = index + 1;

            return (
              <SpotlightCard
                key={note.id}
                spotlightColor="rgba(59, 130, 246, 0.24)"
                className={`${
                  isFirst ? 'md:col-span-2' : 'col-span-1'
                } relative z-10 min-h-[200px] group/card !bg-[#080811]/45 !backdrop-blur-[5px] border-white/15 hover:border-blue-400/50`}
              >
                {/* Header: Slot Badge & Remove Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded border border-blue-500/35 bg-blue-500/15 px-2 py-0.5 font-mono text-[11px] text-blue-300 font-bold">
                      Slot [{slotNum}]
                    </span>
                    <span className="text-xs font-medium text-zinc-300">{note.folder}</span>
                  </div>

                  {/* Ultra-easy remove button [X] */}
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs text-zinc-400 tabular-nums">
                      {note.copyCount}x
                    </span>
                    <button
                      onClick={() => onRemoveFromBento(note.id)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors cursor-pointer"
                      title="Hilangkan kartu ini dari Bento Grid"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Note Title */}
                <h3 className="mt-3 text-base md:text-lg font-bold text-white tracking-tight line-clamp-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                  {note.title}
                </h3>

                {/* Note Content */}
                <p className="mt-2 text-xs md:text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap line-clamp-4 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
                  {note.content}
                </p>

                {/* Bottom Bar: 1-Click Copy */}
                <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">
                    Tekan <kbd className="font-mono text-blue-300 font-semibold">[{slotNum}]</kbd> untuk salin
                  </span>

                  <button
                    onClick={() => handleQuickCopy(`slot-${note.id}`, note.content, note.title)}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                      copiedKey === `slot-${note.id}`
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-600/30 hover:opacity-95'
                    }`}
                  >
                    {copiedKey === `slot-${note.id}` ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Salin [{slotNum}]</span>
                      </>
                    )}
                  </button>
                </div>
              </SpotlightCard>
            );
          })}

          {/* Quick Add Slot Card inside Grid */}
          <div
            onClick={() => setIsAddModalOpen(true)}
            className="relative z-10 flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-[#080811]/40 backdrop-blur-[4px] p-6 text-center transition-all hover:border-blue-400/50 hover:bg-blue-500/[0.08] cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/15 text-blue-400 group-hover:scale-110 transition-transform">
              <Plus className="h-5 w-5" />
            </div>
            <h4 className="mt-3 text-sm font-semibold text-white">Tambah Kartu Bento</h4>
            <p className="mt-1 text-xs text-zinc-400 max-w-[200px]">
              Klik untuk memilih catatan Anda yang ingin dimunculkan di Bento Grid
            </p>
          </div>
        </div>
      ) : (
        /* Empty State if user removed all cards */
        <div
          ref={gridWrapperRef}
          onMouseMove={handleGridMouseMove}
          onMouseLeave={handleGridMouseLeave}
          className="relative overflow-hidden flex flex-col items-center justify-center rounded-3xl border border-indigo-500/25 bg-[#030307] p-12 text-center shadow-[0_0_50px_-12px_rgba(59,130,246,0.22)]"
        >
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
          />
          <div className="relative z-10 flex flex-col items-center">
            <LayoutGrid className="h-10 w-10 text-blue-400 mb-3" />
            <h3 className="text-base font-semibold text-white">Bento Grid Sedang Kosong</h3>
            <p className="mt-1 text-xs text-zinc-300 max-w-sm">
              Semua kartu telah dihilangkan dari Bento Grid. Anda bisa menambahkan kartu pilihan Anda atau mereset ke susunan awal.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Pilih Catatan untuk Bento</span>
              </button>
              <button
                onClick={onResetBento}
                className="rounded-xl border border-white/15 bg-black/50 backdrop-blur-md px-4 py-2 text-xs font-medium text-zinc-200 hover:text-white cursor-pointer"
              >
                Kembalikan Default
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah Kartu ke Bento Grid Mudah & Tanpa Ribet */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#121215] p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Kelola Kartu Bento Grid</h3>
                  <p className="text-xs text-zinc-400">Pilih catatan yang ingin dimunculkan pada grid cepat</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search filter for notes */}
            <div className="my-4">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Cari catatan yang ingin dimasukkan..."
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/50 focus:outline-none"
              />
            </div>

            {/* List of Available Notes */}
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {availableToAdd.length > 0 ? (
                availableToAdd.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-indigo-400">{note.folder}</span>
                        <span className="text-xs font-semibold text-white truncate">{note.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-400 truncate">{note.content}</p>
                    </div>

                    <button
                      onClick={() => {
                        onAddToBento(note.id);
                        setIsAddModalOpen(false);
                      }}
                      className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500">
                  {allNotes.length === bentoNotes.length
                    ? 'Semua catatan Anda sudah ada di dalam Bento Grid!'
                    : 'Tidak ada catatan yang cocok dengan pencarian.'}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  onOpenComposer();
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Catatan Baru untuk Bento</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
