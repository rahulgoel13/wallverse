"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useWallpaperTexture } from "./useWallpaperTexture";
import { placeholderTexture } from "./three-utils";
import { SceneWarmup } from "./SceneShell";
import type { ProductDTO } from "@/types";

const lerp = THREE.MathUtils.lerp;

function Swatch({
  product,
  position,
  phase,
  onPick,
}: {
  product: ProductDTO;
  position: [number, number, number];
  phase: number;
  onPick: (product: ProductDTO, clientX: number, clientY: number) => void;
}) {
  const map = useWallpaperTexture(product.texture, 1.3, 1.7);
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock, pointer }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.position.y = position[1] + Math.sin(t * 0.7 + phase) * 0.07;
    group.current.position.z = position[2] + (hovered ? 0.5 : Math.sin(t * 0.5 + phase * 2) * 0.08);
    // the sample leans toward the cursor
    const targetRotY = hovered ? pointer.x * 0.45 : Math.sin(t * 0.35 + phase) * 0.1;
    const targetRotX = hovered ? -pointer.y * 0.35 : Math.cos(t * 0.3 + phase) * 0.06;
    group.current.rotation.y = lerp(group.current.rotation.y, targetRotY, 0.1);
    group.current.rotation.x = lerp(group.current.rotation.x, targetRotX, 0.1);
    group.current.scale.setScalar(lerp(group.current.scale.x, hovered ? 1.14 : 1, 0.12));
  });

  return (
    <group ref={group} position={position}>
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
          onPick(product, e.nativeEvent.clientX, e.nativeEvent.clientY);
        }}
      >
        <boxGeometry args={[1.05, 1.4, 0.03]} />
        <meshStandardMaterial map={map ?? placeholderTexture()} color={map ? "#ffffff" : "#555"} roughness={0.85} />
      </mesh>
      {/* citron highlight edge on hover — always mounted so its shader is
          compiled during warm-up rather than on the first hover */}
      <mesh position={[0, 0, -0.022]} visible={hovered}>
        <boxGeometry args={[1.12, 1.47, 0.005]} />
        <meshBasicMaterial color={product.accent} />
      </mesh>
      {hovered ? (
        <Html position={[0, -0.95, 0]} center zIndexRange={[40, 0]}>
          <div className="pointer-events-none whitespace-nowrap bg-ink/90 border border-ivory/20 px-3 py-1.5 text-center">
            <p className="text-ivory text-xs font-serif">{product.name}</p>
            <p className="label text-[0.5rem] text-ivory/60">{product.collectionName} · click to take over</p>
          </div>
        </Html>
      ) : null}
    </group>
  );
}

export function TakeoverScene({
  products,
  onPick,
}: {
  products: ProductDTO[];
  onPick: (product: ProductDTO, clientX: number, clientY: number) => void;
}) {
  const cols = 4;
  const gapX = 1.55;
  const gapY = 1.95;
  const rows = Math.ceil(products.length / cols);

  return (
    <>
      <fog attach="fog" args={["#10100f", 9, 18]} />
      <ambientLight intensity={0.8} />
      <spotLight position={[4, 6, 6]} angle={0.6} penumbra={0.8} intensity={120} color="#f2e8d0" />
      <pointLight position={[-4, -2, 4]} intensity={14} color="#d6ff72" />
      {products.map((p, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = (col - (cols - 1) / 2) * gapX;
        const y = ((rows - 1) / 2 - row) * gapY;
        return (
          <Swatch
            key={p.slug}
            product={p}
            position={[x, y, (i % 3) * 0.15]}
            phase={i * 1.3}
            onPick={onPick}
          />
        );
      })}

      <SceneWarmup />
    </>
  );
}
