"use client";

import {
  Component,
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { supportsWebGL, maxDpr } from "./three-utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const emptySubscribe = () => () => {};

/** null during SSR, then a stable boolean on the client. */
function useWebGLSupport(): boolean | null {
  return useSyncExternalStore(emptySubscribe, supportsWebGL, () => null);
}

/* ——— Idle preloading ———
 * Mounting a scene (WebGL context, shader programs, texture uploads) blocks the
 * main thread for 100+ ms. Scenes below the fold are mounted one at a time in
 * idle time after the page has loaded, so that cost lands while the visitor is
 * reading the hero rather than in the middle of a scroll.
 */
const preloadQueue: Array<() => void> = [];
let preloadBusy = false;

function pumpPreload() {
  if (preloadBusy || preloadQueue.length === 0 || typeof window === "undefined") return;
  preloadBusy = true;
  const run = () => {
    const job = preloadQueue.shift();
    if (job) job();
    else preloadBusy = false;
  };
  const schedule = () => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 3000 });
    else setTimeout(run, 300);
  };
  if (document.readyState === "complete") setTimeout(schedule, 800);
  else window.addEventListener("load", () => setTimeout(schedule, 800), { once: true });
}

function finishPreload() {
  preloadBusy = false;
  pumpPreload();
}

/* ——— Warm-up ———
 * Scene components render <SceneWarmup /> as their last child. Its effect runs
 * once the whole scene graph is attached: shaders compile in parallel through
 * KHR_parallel_shader_compile, then one render uploads anything left. Only then
 * does the canvas start its render loop, so the first visible frame never stalls.
 */
const WarmupContext = createContext<(() => void) | null>(null);

export function SceneWarmup() {
  const onReady = useContext(WarmupContext);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    let alive = true;
    gl.compileAsync(scene, camera)
      .then(() => {
        if (!alive) return;
        gl.render(scene, camera);
        onReady?.();
      })
      .catch(() => {
        if (alive) onReady?.();
      });
    return () => {
      alive = false;
    };
  }, [gl, scene, camera, onReady]);

  return null;
}

/**
 * Shared wrapper for every 3D moment on the site:
 * - mounts the canvas when near the viewport, or earlier in idle time,
 * - renders frames only while the canvas is on screen and not covered,
 * - warms shaders and textures up before the first visible frame,
 * - caps device pixel ratio,
 * - renders a graceful static fallback when WebGL is unavailable or the
 *   visitor prefers reduced motion,
 * - never blocks the shopping journey on 3D.
 */
export function SceneShell({
  children,
  fallback,
  className = "",
  camera,
  eager = false,
  forceFallback = false,
  paused = false,
  label,
}: {
  children: ReactNode;
  fallback: ReactNode;
  className?: string;
  camera?: { position: [number, number, number]; fov?: number };
  eager?: boolean;
  forceFallback?: boolean;
  /** Stop rendering while something opaque covers the canvas. */
  paused?: boolean;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(eager);
  const [visible, setVisible] = useState(false);
  const [warm, setWarm] = useState(false);
  const [failed, setFailed] = useState(false);
  const canRender = useWebGLSupport();
  const reducedMotion = useReducedMotion();
  const holdsPreloadSlot = useRef(false);
  const warmRef = useRef(false);

  const useFallback = forceFallback || failed || reducedMotion || canRender === false;
  const willRender = !useFallback && canRender === true;

  const releasePreloadSlot = useCallback(() => {
    if (holdsPreloadSlot.current) {
      holdsPreloadSlot.current = false;
      finishPreload();
    }
  }, []);

  const onWarm = useCallback(() => {
    warmRef.current = true;
    setWarm(true);
    releasePreloadSlot();
  }, [releasePreloadSlot]);

  // Mount early in idle time (below-the-fold scenes only).
  useEffect(() => {
    if (eager || !willRender) return;
    let done = false;
    const job = () => {
      // Already warmed because the visitor scrolled here first: nothing to do.
      if (done || warmRef.current) return finishPreload();
      holdsPreloadSlot.current = true;
      setMounted(true);
    };
    preloadQueue.push(job);
    pumpPreload();
    return () => {
      done = true;
      const i = preloadQueue.indexOf(job);
      if (i >= 0) preloadQueue.splice(i, 1);
      releasePreloadSlot();
    };
  }, [eager, willRender, releasePreloadSlot]);

  // A scene that fails or falls back must not keep the queue waiting.
  useEffect(() => {
    if (useFallback) releasePreloadSlot();
  }, [useFallback, releasePreloadSlot]);

  // Mount anyway if the visitor reaches the scene before idle time came.
  useEffect(() => {
    if (mounted) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted]);

  // Render only while on screen (with a small margin so the first frame is ready).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setVisible(entries[entries.length - 1].isIntersecting),
      { rootMargin: "300px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const frameloop = warm && visible && !paused ? "always" : "never";

  return (
    <div ref={ref} className={`relative ${className}`} aria-label={label} role={label ? "img" : undefined}>
      {useFallback ? (
        fallback
      ) : mounted && canRender ? (
        <ErrorCatcher onError={() => setFailed(true)}>
          <WarmupContext.Provider value={onWarm}>
            <Canvas
              frameloop={frameloop}
              dpr={[1, maxDpr()]}
              camera={camera ?? { position: [0, 1.4, 7], fov: 42 }}
              gl={{ antialias: true, powerPreference: "high-performance" }}
              onCreated={({ gl }) => {
                gl.domElement.addEventListener(
                  "webglcontextlost",
                  (e) => {
                    e.preventDefault();
                    setFailed(true);
                  },
                  { once: true }
                );
              }}
              style={{ position: "absolute", inset: 0 }}
            >
              <Suspense fallback={null}>{children}</Suspense>
            </Canvas>
          </WarmupContext.Provider>
        </ErrorCatcher>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="label opacity-30 animate-pulse">Loading scene…</span>
        </div>
      )}
    </div>
  );
}

class ErrorCatcher extends Component<{ children: ReactNode; onError: () => void }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
