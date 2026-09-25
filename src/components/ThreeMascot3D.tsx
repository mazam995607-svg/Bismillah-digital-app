import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Modern THREE.Timer implementation replacing deprecated THREE.Clock
 */
export class THREETimer {
  private _previousTime: number;
  private _currentTime: number = 0;
  private _delta: number = 0;
  private _elapsed: number = 0;
  private _timescale: number = 1;

  constructor() {
    this._previousTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  public update(timestamp?: number): this {
    this._currentTime = timestamp ?? (typeof performance !== 'undefined' ? performance.now() : Date.now());
    this._delta = Math.max(0, ((this._currentTime - this._previousTime) / 1000) * this._timescale);
    this._elapsed += this._delta;
    this._previousTime = this._currentTime;
    return this;
  }

  public getDelta(): number {
    return this._delta;
  }

  public getElapsed(): number {
    return this._elapsed;
  }

  public setTimescale(timescale: number): this {
    this._timescale = timescale;
    return this;
  }
}

interface Props {
  showAvatar: boolean;
  avatarType: 'parrot' | 'rabbit';
  onTap?: () => void;
}

export const ThreeMascot3D: React.FC<Props> = ({ showAvatar, avatarType, onTap }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 20, y: window.innerHeight - 180 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 20, initialY: window.innerHeight - 180 });

  useEffect(() => {
    if (!showAvatar || !mountRef.current) return;

    const container = mountRef.current;
    const width = 120;
    const height = 120;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xf59e0b, 1.5, 10);
    pointLight.position.set(-2, 2, 4);
    scene.add(pointLight);

    // Character Group
    const mascotGroup = new THREE.Group();
    scene.add(mascotGroup);

    let leftWing: THREE.Mesh | undefined;
    let rightWing: THREE.Mesh | undefined;
    let leftEar: THREE.Group | undefined;
    let rightEar: THREE.Group | undefined;

    if (avatarType === 'parrot') {
      // --- PARROT 3D MESH ---
      // Body
      const bodyGeo = new THREE.SphereGeometry(1.1, 32, 32);
      bodyGeo.scale(0.85, 1.1, 0.85);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.25,
        metalness: 0.1,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = -0.3;
      mascotGroup.add(body);

      // Chest
      const chestGeo = new THREE.SphereGeometry(0.8, 24, 24);
      chestGeo.scale(0.7, 0.9, 0.5);
      const chestMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        roughness: 0.3,
      });
      const chest = new THREE.Mesh(chestGeo, chestMat);
      chest.position.set(0, -0.3, 0.45);
      mascotGroup.add(chest);

      // Head
      const headGeo = new THREE.SphereGeometry(0.85, 32, 32);
      const headMat = new THREE.MeshStandardMaterial({
        color: 0x059669,
        roughness: 0.2,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 0.85;
      mascotGroup.add(head);

      // Crest Feathers on Head
      const crestGeo = new THREE.ConeGeometry(0.2, 0.6, 16);
      const crestMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
      const crest1 = new THREE.Mesh(crestGeo, crestMat);
      crest1.position.set(0, 1.7, 0.1);
      crest1.rotation.x = 0.3;
      mascotGroup.add(crest1);

      const crest2 = new THREE.Mesh(crestGeo, new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      crest2.position.set(-0.15, 1.65, 0);
      crest2.rotation.z = 0.2;
      mascotGroup.add(crest2);

      // Beak
      const beakGeo = new THREE.ConeGeometry(0.3, 0.7, 16);
      const beakMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2 });
      const beak = new THREE.Mesh(beakGeo, beakMat);
      beak.position.set(0, 0.75, 0.85);
      beak.rotation.x = 1.3;
      mascotGroup.add(beak);

      // Eyes
      const eyeGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const eyeMatWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const pupilGeo = new THREE.SphereGeometry(0.1, 16, 16);
      const pupilMatBlack = new THREE.MeshBasicMaterial({ color: 0x0f172a });

      const leftEye = new THREE.Mesh(eyeGeo, eyeMatWhite);
      leftEye.position.set(-0.4, 1.0, 0.65);
      const leftPupil = new THREE.Mesh(pupilGeo, pupilMatBlack);
      leftPupil.position.set(-0.42, 1.0, 0.8);
      mascotGroup.add(leftEye);
      mascotGroup.add(leftPupil);

      const rightEye = new THREE.Mesh(eyeGeo, eyeMatWhite);
      rightEye.position.set(0.4, 1.0, 0.65);
      const rightPupil = new THREE.Mesh(pupilGeo, pupilMatBlack);
      rightPupil.position.set(0.42, 1.0, 0.8);
      mascotGroup.add(rightEye);
      mascotGroup.add(rightPupil);

      // Wings
      const wingGeo = new THREE.ConeGeometry(0.5, 1.4, 16);
      wingGeo.scale(0.3, 1, 1);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 });

      leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.set(-0.95, -0.1, 0);
      leftWing.rotation.z = 0.6;
      mascotGroup.add(leftWing);

      rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.position.set(0.95, -0.1, 0);
      rightWing.rotation.z = -0.6;
      mascotGroup.add(rightWing);

      // Tail
      const tailGeo = new THREE.ConeGeometry(0.4, 1.6, 16);
      tailGeo.scale(0.4, 1, 1);
      const tailMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4 });
      const tail = new THREE.Mesh(tailGeo, tailMat);
      tail.position.set(0, -1.2, -0.5);
      tail.rotation.x = -0.5;
      mascotGroup.add(tail);

    } else {
      // --- RABBIT 3D MESH ---
      // Body
      const bodyGeo = new THREE.SphereGeometry(1.1, 32, 32);
      bodyGeo.scale(0.9, 1.1, 0.9);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xf472b6,
        roughness: 0.3,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = -0.4;
      mascotGroup.add(body);

      // Head
      const headGeo = new THREE.SphereGeometry(0.9, 32, 32);
      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.y = 0.8;
      mascotGroup.add(head);

      // Eyes
      const eyeGeo = new THREE.SphereGeometry(0.15, 16, 16);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.35, 0.9, 0.75);
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.35, 0.9, 0.75);
      mascotGroup.add(leftEye);
      mascotGroup.add(rightEye);

      // Nose
      const noseGeo = new THREE.ConeGeometry(0.12, 0.15, 16);
      const noseMat = new THREE.MeshStandardMaterial({ color: 0xfda4af });
      const nose = new THREE.Mesh(noseGeo, noseMat);
      nose.position.set(0, 0.7, 0.85);
      nose.rotation.x = 1.5;
      mascotGroup.add(nose);

      // Ears (Groups for animation)
      const earGeo = new THREE.CylinderGeometry(0.18, 0.25, 1.8, 16);
      const innerEarGeo = new THREE.CylinderGeometry(0.1, 0.15, 1.6, 16);
      const innerEarMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8 });

      leftEar = new THREE.Group();
      const lEarMesh = new THREE.Mesh(earGeo, bodyMat);
      const lInnerMesh = new THREE.Mesh(innerEarGeo, innerEarMat);
      lInnerMesh.position.z = 0.05;
      leftEar.add(lEarMesh);
      leftEar.add(lInnerMesh);
      leftEar.position.set(-0.4, 1.8, 0);
      leftEar.rotation.z = 0.25;
      mascotGroup.add(leftEar);

      rightEar = new THREE.Group();
      const rEarMesh = new THREE.Mesh(earGeo, bodyMat);
      const rInnerMesh = new THREE.Mesh(innerEarGeo, innerEarMat);
      rInnerMesh.position.z = 0.05;
      rightEar.add(rEarMesh);
      rightEar.add(rInnerMesh);
      rightEar.position.set(0.4, 1.8, 0);
      rightEar.rotation.z = -0.25;
      mascotGroup.add(rightEar);
    }

    // Animation Loop with modern THREETimer
    let reqId: number;
    const timer = new THREETimer();

    const animate = (timestamp: number) => {
      reqId = requestAnimationFrame(animate);
      timer.update(timestamp);
      const elapsedTime = timer.getElapsed();

      // Continuous floating & y-bobbing
      mascotGroup.position.y = Math.sin(elapsedTime * 2.5) * 0.18;
      mascotGroup.rotation.y = Math.sin(elapsedTime * 1.2) * 0.35;

      // Wing or Ear twitch animations
      if (leftWing && rightWing) {
        leftWing.rotation.z = 0.6 + Math.sin(elapsedTime * 6) * 0.3;
        rightWing.rotation.z = -0.6 - Math.sin(elapsedTime * 6) * 0.3;
      }

      if (leftEar && rightEar) {
        leftEar.rotation.z = 0.25 + Math.sin(elapsedTime * 4) * 0.15;
        rightEar.rotation.z = -0.25 - Math.sin(elapsedTime * 4) * 0.15;
      }

      renderer.render(scene, camera);
    };

    animate(performance.now());

    return () => {
      cancelAnimationFrame(reqId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [showAvatar, avatarType]);

  if (!showAvatar) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: pos.x,
      initialY: pos.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({
      x: Math.max(10, Math.min(window.innerWidth - 130, dragRef.current.initialX + dx)),
      y: Math.max(10, Math.min(window.innerHeight - 130, dragRef.current.initialY + dy)),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <AnimatePresence>
      {showAvatar && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{
            opacity: 1,
            scale: isHovered ? 1.25 : 1,
            y: isDragging ? 0 : [0, -6, 0]
          }}
          exit={{ opacity: 0, scale: 0.2 }}
          transition={{
            y: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
            scale: { type: 'spring', stiffness: 300, damping: 20 },
            opacity: { duration: 0.3 }
          }}
          style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onTap}
          className="fixed z-[9999] cursor-grab active:cursor-grabbing select-none group pointer-events-auto filter drop-shadow-[0_10px_20px_rgba(16,185,129,0.5)]"
          title="3D Animated AI Mascot - Drag anywhere or tap to open AI!"
        >
          {/* Speech Bubble on Hover */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[11px] px-3 py-1 rounded-full shadow-2xl pointer-events-none border border-amber-300 flex items-center gap-1 z-10"
          >
            <span>Assalam-o-Alaikum!</span>
            <span className="text-emerald-950 font-bold">
              {avatarType === 'parrot' ? '🦜 3D Parrot AI' : '🐰 3D Rabbit AI'}
            </span>
          </motion.div>

          {/* 3D WebGL Canvas Mounting Point */}
          <div ref={mountRef} className="w-[120px] h-[120px] relative pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
