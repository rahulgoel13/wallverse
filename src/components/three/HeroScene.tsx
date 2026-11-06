"use client";

import { useRef, useState, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { useWallpaperTexture } from "./useWallpaperTexture";
import { placeholderTexture, qualityTier, settle, useResumeDetector } from "./three-utils";
import { SceneWarmup } from "./SceneShell";
import type { ProductDTO } from "@/types";

const lerp = THREE.MathUtils.lerp;
const clamp01 = (v: number) => THREE.MathUtils.clamp(v, 0, 1);
/** Progress of p within [a, b]. */
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const ease = (t: number) => t * t * (3 - 2 * t);

function WallSurface({
  texture,
  width,
  height,
  position,
  rotation,
}: {
  texture: string;
  width: number;
  height: number;
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const map = useWallpaperTexture(texture, width / 0.8, height / 0.8);
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        map={map ?? placeholderTexture()}
        color={map ? "#ffffff" : "#2a2a28"}
        roughness={0.92}
        metalness={0.04}
      />
    </mesh>
  );
}

/** The unrolling wallpaper: a roll travels down a blank wall, covering it. */
function UnrollingWall({
  texture,
  progressRef,
  width,
  height,
  position,
  rotation,
}: {
  texture: string;
  progressRef: MutableRefObject<number>;
  width: number;
  height: number;
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const map = useWallpaperTexture(texture, width / 0.8, height / 0.8);
  const rollMap = useWallpaperTexture(texture, 4, 1);
  const paper = useRef<THREE.Mesh>(null);
  const roll = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const p = ease(seg(progressRef.current, 0.42, 0.82));
    const u = Math.max(p, 0.001);
    if (paper.current) {
      paper.current.scale.y = u;
      paper.current.position.y = (height / 2) * (1 - u);
      const mat = paper.current.material as THREE.MeshStandardMaterial;
      if (mat.map && mat.map !== placeholderTexture()) {
        mat.map.repeat.y = (height / 0.8) * u;
        mat.map.offset.y = 1 - u * (height / 0.8) + Math.floor(u * (height / 0.8));
      }
    }
    if (roll.current) {
      roll.current.position.y = height / 2 - height * p;
      roll.current.rotation.x = p * Math.PI * 6;
      roll.current.visible = p < 0.995;
      const s = lerp(1, 0.4, p); // roll thins as paper is spent
      roll.current.scale.set(s, 1, s);
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* blank architectural surface underneath */}
      <mesh position={[0, 0, -0.012]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#201f1d" roughness={0.95} />
      </mesh>
      {/* the paper, anchored to the top edge */}
      <mesh ref={paper} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={map ?? placeholderTexture()} color={map ? "#ffffff" : "#444"} roughness={0.9} />
      </mesh>
      {/* the roll */}
      <mesh ref={roll} position={[0, height / 2, 0.14]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, width * 1.01, 24]} />
        <meshStandardMaterial map={rollMap ?? placeholderTexture()} color={rollMap ? "#ffffff" : "#d9d0c1"} roughness={0.7} />
      </mesh>
    </group>
  );
}

function FloatingSwatch({
  product,
  basePosition,
  phase,
  progressRef,
  onNavigate,
}: {
  product: ProductDTO;
  basePosition: [number, number, number];
  phase: number;
  progressRef: MutableRefObject<number>;
  onNavigate: (slug: string) => void;
}) {
  const map = useWallpaperTexture(product.texture, 1.4, 1.9);
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    const p = progressRef.current;
    const spread = 1 + ease(seg(p, 0, 0.5)) * 1.6; // swatches drift outward as camera dives
    group.current.position.set(
      basePosition[0] * spread,
      basePosition[1] + Math.sin(t * 0.6 + phase) * 0.12,
      basePosition[2] - ease(seg(p, 0, 0.5)) * 1.5
    );
    group.current.rotation.y = Math.sin(t * 0.3 + phase) * 0.18;
    group.current.rotation.x = Math.cos(t * 0.24 + phase) * 0.08;
    const target = hovered ? 1.12 : 1;
    group.current.scale.setScalar(lerp(group.current.scale.x, target, 0.12));
  });

  return (
    <group ref={group} position={basePosition}>
      <mesh
        castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(product.slug);
        }}
      >
        <boxGeometry args={[0.72, 0.96, 0.02]} />
        <meshStandardMaterial map={map ?? placeholderTexture()} color={map ? "#ffffff" : "#555"} roughness={0.85} />
      </mesh>
      {hovered ? (
        <Html position={[0, -0.64, 0]} center zIndexRange={[40, 0]}>
          <div className="pointer-events-none whitespace-nowrap bg-ink/90 border border-ivory/20 px-3 py-1.5 text-center">
            <p className="text-ivory text-xs font-serif">{product.name}</p>
            <p className="label text-[0.5rem] text-ivory/60">{product.collectionName}</p>
          </div>
        </Html>
      ) : null}
    </group>
  );
}

export function HeroScene({
  products,
  progressRef,
}: {
  products: ProductDTO[];
  progressRef: MutableRefObject<number>;
}) {
  const router = useRouter();
  const { camera, pointer } = useThree();
  const room = useRef<THREE.Group>(null);
  const dust = useRef<THREE.Points>(null);
  const tier = qualityTier();

  const [wallA, wallB, wallFloor] = [
    products[0]?.texture ?? "/textures/midnight-garden.svg",
    products[1]?.texture ?? "/textures/golden-geometry.svg",
    products[2]?.texture ?? "/textures/celestial-marble.svg",
  ];

  const swatches = products.slice(0, tier === "low" ? 4 : 6);
  const positions: [number, number, number][] = [
    [-3.4, 1.9, 1.2],
    [3.3, 2.3, 0.6],
    [-2.9, -0.7, 2.0],
    [3.1, -0.4, 1.8],
    [-4.1, 0.8, -0.6],
    [4.2, 0.9, -1.0],
  ];

  const resumedAt = useResumeDetector();

  useFrame(({ clock }) => {
    const p = progressRef.current;
    const t = clock.elapsedTime;
    const resumed = resumedAt(t);

    // Camera choreography: drift in (ch.1), hold for the unroll (ch.2), push through the doorway.
    const dive = ease(seg(p, 0, 0.45));
    const push = ease(seg(p, 0.86, 1));
    const z = lerp(lerp(9.2, 6.0, dive), 1.6, push);
    const y = lerp(lerp(1.5, 1.1, dive), 0.9, push);
    const x = lerp(0, -0.6, push);
    camera.position.x = lerp(camera.position.x, x + pointer.x * 0.5, settle(0.06, resumed));
    camera.position.y = lerp(camera.position.y, y + pointer.y * 0.25, settle(0.06, resumed));
    camera.position.z = lerp(camera.position.z, z, settle(0.08, resumed));
    camera.lookAt(0, 0.6, 0);

    if (room.current) {
      room.current.rotation.y = lerp(-0.22, 0.06, dive) + Math.sin(t * 0.18) * 0.015;
      room.current.position.y = Math.sin(t * 0.4) * 0.05;
    }
    if (dust.current) {
      dust.current.rotation.y = t * 0.012;
    }
  });

  return (
    <>
      <fog attach="fog" args={["#10100f", 12, 28]} />
      <ambientLight intensity={0.55} color="#f4f0e8" />
      <spotLight
        position={[6, 8, 6]}
        angle={0.5}
        penumbra={0.7}
        intensity={140}
        color="#f2e8d0"
        castShadow={tier === "high"}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-5, 2, 4]} intensity={18} color="#d6ff72" />
      <pointLight position={[0, -3, 5]} intensity={10} color="#b99a6a" />

      {/* The floating monolith room */}
      <group ref={room}>
        {/* back wall */}
        <WallSurface texture={wallA} width={6.4} height={4.2} position={[0, 0.9, -2.2]} />
        {/* right wall — starts blank, receives the unrolling paper */}
        <UnrollingWall
          texture={wallB}
          progressRef={progressRef}
          width={4.4}
          height={4.2}
          position={[3.2, 0.9, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        {/* left wall */}
        <WallSurface
          texture={wallFloor}
          width={4.4}
          height={4.2}
          position={[-3.2, 0.9, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />
        {/* floor slab */}
        <mesh position={[0, -1.33, 0]} receiveShadow>
          <boxGeometry args={[6.6, 0.22, 4.6]} />
          <meshStandardMaterial color="#d9d0c1" roughness={0.75} />
        </mesh>
        {/* champagne edge trims */}
        <mesh position={[0, 3.04, -2.19]}>
          <boxGeometry args={[6.44, 0.07, 0.07]} />
          <meshStandardMaterial color="#b99a6a" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0, -1.2, 2.32]}>
          <boxGeometry args={[6.64, 0.05, 0.05]} />
          <meshStandardMaterial color="#b99a6a" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* a low plinth with a wallpaper roll resting on it */}
        <mesh position={[-1.6, -0.82, 0.9]} castShadow>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#181817" roughness={0.6} />
        </mesh>
        <mesh position={[-1.6, -0.28, 0.9]} rotation={[0, 0, Math.PI / 2.3]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 1.1, 20]} />
          <meshStandardMaterial color="#f4f0e8" roughness={0.6} />
        </mesh>
      </group>

      {/* Floating product swatches — each is a real, clickable product */}
      {swatches.map((p, i) => (
        <FloatingSwatch
          key={p.slug}
          product={p}
          basePosition={positions[i % positions.length]}
          phase={i * 1.7}
          progressRef={progressRef}
          onNavigate={(slug) => router.push(`/product/${slug}`)}
        />
      ))}

      {/* drifting dust */}
      <Dust ref={dust} count={tier === "low" ? 80 : 220} />

      <SceneWarmup />
    </>
  );
}

import { forwardRef, useMemo } from "react";

const Dust = forwardRef<THREE.Points, { count: number }>(function Dust({ count }, ref) {
  const positions = useMemo(() => {
    // deterministic scatter (mulberry32) — keeps render pure and stable
    let seed = 1337;
    const rng = () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rng() - 0.5) * 18;
      arr[i * 3 + 1] = (rng() - 0.5) * 10;
      arr[i * 3 + 2] = (rng() - 0.5) * 12;
    }
    return arr;
  }, [count]);
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#d9d0c1" transparent opacity={0.45} sizeAttenuation />
    </points>
  );
});
