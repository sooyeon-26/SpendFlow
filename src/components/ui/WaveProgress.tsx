import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { clamp } from "../../utils/format";

type WaveProgressProps = {
  percentage: number;
};

export type WaveImpulse = {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  force?: number;
  mode?: "press" | "drag" | "release";
};

export type WaveProgressHandle = {
  disturb: (impulse: WaveImpulse) => void;
  release: (impulse?: WaveImpulse) => void;
};

type Droplet = {
  x: number;
  y: number;
  radius: number;
  age: number;
  life: number;
  force: number;
};

const POINT_COUNT = 78;
const DPR_LIMIT = 2;
const WATER_IDLE_AMPLITUDE = 0.55;
const WATER_ACTIVE_AMPLITUDE = 2.8;
const WATER_IDLE_SPEED = 0.00008;
const WATER_ACTIVE_SPEED = 0.00028;
const REFLECTION_IDLE_OPACITY = 0.012;
const REFLECTION_ACTIVE_OPACITY = 0.045;
const SURFACE_IDLE_OPACITY = 0.045;
const SURFACE_ACTIVE_OPACITY = 0.07;
const RIPPLE_DAMPING = 0.9;
const HEIGHT_IDLE_DAMPING = 0.94;
const REDUCED_MOTION_SCALE = 0.28;

function drawSmoothSurface(ctx: CanvasRenderingContext2D, points: ArrayLike<number>, surfaceY: number, width: number, height: number, scale: number, phase: number, fill: CanvasGradient, alpha: number, idleWave: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  const step = width / (POINT_COUNT - 1);
  const yAt = (index: number) => surfaceY + points[index] * scale + Math.sin(index * 0.44 + phase) * idleWave * scale;

  ctx.moveTo(0, yAt(0));
  for (let index = 0; index < POINT_COUNT - 1; index += 1) {
    const x0 = index * step;
    const x1 = (index + 1) * step;
    const midX = (x0 + x1) / 2;
    const midY = (yAt(index) + yAt(index + 1)) / 2;
    ctx.quadraticCurveTo(x0, yAt(index), midX, midY);
  }
  ctx.quadraticCurveTo(width, yAt(POINT_COUNT - 1), width, yAt(POINT_COUNT - 1));
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function drawSurfaceLine(ctx: CanvasRenderingContext2D, points: ArrayLike<number>, surfaceY: number, width: number, phase: number, energy: number, reducedMotion: boolean) {
  ctx.save();
  ctx.beginPath();
  const step = width / (POINT_COUNT - 1);
  const motionScale = reducedMotion ? REDUCED_MOTION_SCALE : 1;
  const yAt = (index: number) => surfaceY + points[index] * 0.42 * motionScale + Math.sin(index * 0.44 + phase) * (0.08 + energy * 0.36) * motionScale;

  ctx.moveTo(0, yAt(0));
  for (let index = 0; index < POINT_COUNT - 1; index += 1) {
    const x0 = index * step;
    const x1 = (index + 1) * step;
    const midX = (x0 + x1) / 2;
    const midY = (yAt(index) + yAt(index + 1)) / 2;
    ctx.quadraticCurveTo(x0, yAt(index), midX, midY);
  }
  ctx.strokeStyle = `rgba(255,255,255,${SURFACE_IDLE_OPACITY + energy * SURFACE_ACTIVE_OPACITY})`;
  ctx.lineWidth = 0.55 + energy * 0.3;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.restore();
}

export const WaveProgress = forwardRef<WaveProgressHandle, WaveProgressProps>(function WaveProgress({ percentage }, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heightsRef = useRef(new Float32Array(POINT_COUNT));
  const velocityRef = useRef(new Float32Array(POINT_COUNT));
  const dropletsRef = useRef<Droplet[]>([]);
  const pointerRef = useRef({ x: 0.5, y: 0.5, active: false });
  const energyRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  const injectImpulse = (impulse: WaveImpulse) => {
    const heights = heightsRef.current;
    const velocity = velocityRef.current;
    const x = clamp(impulse.x, 0, 1);
    const y = clamp(impulse.y, 0, 1);
    const center = x * (POINT_COUNT - 1);
    const speed = Math.hypot(impulse.vx ?? 0, impulse.vy ?? 0);
    const motionScale = reducedMotionRef.current ? REDUCED_MOTION_SCALE : 1;
    const baseForce = (impulse.force ?? 1) * motionScale;
    const pressForce = impulse.mode === "press" ? 6 : impulse.mode === "release" ? 3 : 4.5;
    const direction = impulse.mode === "release" ? -1 : 1;
    const verticalBias = clamp((impulse.vy ?? 0) * 4, -4, 4);
    const radius = impulse.mode === "press" ? 10 : 8 + Math.min(6, speed * 4);

    pointerRef.current = { x, y, active: impulse.mode !== "release" };
    energyRef.current = Math.min(1, Math.max(energyRef.current, (impulse.mode === "press" ? 0.42 : impulse.mode === "release" ? 0.18 : 0.28 + speed * 0.14) * motionScale));

    for (let index = 0; index < POINT_COUNT; index += 1) {
      const distance = Math.abs(index - center);
      const influence = Math.exp(-(distance * distance) / (radius * radius));
      const displacement = (pressForce * baseForce + Math.min(20, speed * 28)) * influence * direction;
      heights[index] += displacement * 0.035;
      velocity[index] += (displacement + verticalBias * influence) * 0.08;
    }

    dropletsRef.current = [
      ...dropletsRef.current.slice(-5),
      {
        x,
        y,
        radius: impulse.mode === "press" ? 8 : 5,
        age: 0,
        life: impulse.mode === "release" ? 920 : 720,
        force: Math.min(0.62, 0.18 + baseForce * 0.14 + speed * 0.12)
      }
    ];
  };

  useImperativeHandle(ref, () => ({
    disturb: injectImpulse,
    release: (impulse = { x: pointerRef.current.x, y: pointerRef.current.y, mode: "release", force: 0.8 }) => {
      pointerRef.current.active = false;
      injectImpulse({ ...impulse, mode: "release" });
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = reducedMotionQuery.matches;
    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
    };
    reducedMotionQuery.addEventListener?.("change", handleMotionChange);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const tick = (time: number) => {
      const delta = Math.min(32, time - (lastTimeRef.current || time));
      lastTimeRef.current = time;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const level = clamp(percentage, 0, 110);
      const fill = clamp(level, 0, 100);
      const surfaceY = height * ((100 - fill) / 100);
      const reducedMotion = reducedMotionRef.current;
      const heights = heightsRef.current;
      const velocity = velocityRef.current;
      energyRef.current *= pointerRef.current.active ? 0.982 : 0.91;
      const energy = energyRef.current;
      const phase = time * (reducedMotion ? WATER_IDLE_SPEED * 0.18 : WATER_IDLE_SPEED + energy * WATER_ACTIVE_SPEED);
      const motionScale = reducedMotion ? REDUCED_MOTION_SCALE : 1;
      const idleWave = (WATER_IDLE_AMPLITUDE + energy * WATER_ACTIVE_AMPLITUDE) * motionScale;

      for (let index = 0; index < POINT_COUNT; index += 1) {
        const left = heights[Math.max(0, index - 1)];
        const right = heights[Math.min(POINT_COUNT - 1, index + 1)];
        const laplace = left + right - heights[index] * 2;
        const idle = Math.sin(index * 0.32 + phase) * (reducedMotion ? 0.00001 : 0.000025 + energy * 0.0008);
        velocity[index] += laplace * 0.12 - heights[index] * 0.035 + idle;
        velocity[index] *= pointerRef.current.active ? 0.935 : RIPPLE_DAMPING;
        heights[index] += velocity[index] * (delta / 16.67);
        heights[index] *= pointerRef.current.active ? 0.975 : HEIGHT_IDLE_DAMPING;
      }

      ctx.clearRect(0, 0, width, height);

      const air = ctx.createLinearGradient(0, 0, 0, height);
      air.addColorStop(0, "rgba(255,255,255,0.7)");
      air.addColorStop(0.45, "rgba(235,250,255,0.32)");
      air.addColorStop(1, "rgba(255,255,255,0.02)");
      ctx.fillStyle = air;
      ctx.fillRect(0, 0, width, height);

      const fillBack = ctx.createLinearGradient(0, surfaceY - 30, 0, height);
      fillBack.addColorStop(0, "rgba(105,218,238,0.24)");
      fillBack.addColorStop(0.46, "rgba(65,190,235,0.42)");
      fillBack.addColorStop(1, "rgba(104,229,211,0.58)");
      drawSmoothSurface(ctx, heights, surfaceY + 8, width, height, 0.18, phase + 0.8, fillBack, 0.58, idleWave * 0.42);

      const fillMid = ctx.createLinearGradient(0, surfaceY - 26, 0, height);
      fillMid.addColorStop(0, "rgba(255,255,255,0.2)");
      fillMid.addColorStop(0.2, "rgba(80,211,240,0.46)");
      fillMid.addColorStop(1, "rgba(90,225,212,0.7)");
      drawSmoothSurface(ctx, heights, surfaceY + 2, width, height, 0.32, phase + 0.35, fillMid, 0.68, idleWave * 0.58);

      const fillFront = ctx.createLinearGradient(0, surfaceY - 20, 0, height);
      fillFront.addColorStop(0, "rgba(255,255,255,0.32)");
      fillFront.addColorStop(0.18, "rgba(70,204,238,0.56)");
      fillFront.addColorStop(1, "rgba(93,224,212,0.82)");
      drawSmoothSurface(ctx, heights, surfaceY, width, height, 0.48, phase, fillFront, 0.8, idleWave * 0.72);

      drawSurfaceLine(ctx, heights, surfaceY, width, phase, energy, reducedMotion);

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.strokeStyle = `rgba(255,255,255,${REFLECTION_IDLE_OPACITY + energy * REFLECTION_ACTIVE_OPACITY})`;
      ctx.lineWidth = 0.45;
      for (let row = 0; row < 2; row += 1) {
        const y = surfaceY + 96 + row * 92 + Math.sin(phase + row) * (0.12 + energy * 0.75) * motionScale;
        ctx.beginPath();
        for (let x = -20; x <= width + 20; x += 24) {
          const curveY = y + Math.sin(x * 0.018 + phase * 0.35 + row) * (0.18 + energy * 0.8) * motionScale;
          if (x === -20) ctx.moveTo(x, curveY);
          else ctx.lineTo(x, curveY);
        }
        ctx.stroke();
      }
      ctx.restore();

      dropletsRef.current = dropletsRef.current
        .map((drop) => ({ ...drop, age: drop.age + delta, radius: drop.radius + delta * 0.045 }))
        .filter((drop) => drop.age < drop.life);

      dropletsRef.current.forEach((drop) => {
        const progress = drop.age / drop.life;
        ctx.save();
        ctx.globalAlpha = (1 - progress) * 0.18 * drop.force * motionScale;
        ctx.beginPath();
        ctx.arc(drop.x * width, drop.y * height, drop.radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.68)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      resizeObserver.disconnect();
      reducedMotionQuery.removeEventListener?.("change", handleMotionChange);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [percentage]);

  return (
    <div className="wave-progress" aria-label={`예산 사용률 ${Math.round(percentage)}%`}>
      <canvas ref={canvasRef} className="wave-canvas" aria-hidden="true" />
      <div className="wave-caustics" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
});
