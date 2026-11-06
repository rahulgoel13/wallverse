"use client";

import { useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useWallpaperTexture } from "./useWallpaperTexture";
import { placeholderTexture, settle, useResumeDetector } from "./three-utils";
import { SceneWarmup } from "./SceneShell";

export interface CorridorItem {
  slug: string;
  name: string;
  accent: string;
  texture: string;
}

const SEGMENT_DEPTH = 13;

function CorridorSegment({ item, index }: { item: CorridorItem; index: number }) {
  const map = useWallpaperTexture(item.texture, 7, 3.4);
  const z = -index * SEGMENT_DEPTH;
  return (
    <group position={[0, 0, z]}>
      {/* side walls */}
      <mesh position={[-3.4, 1.4, -SEGMENT_DEPTH / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[SEGMENT_DEPTH, 5.4]} />
        <meshStandardMaterial map={map ?? placeholderTexture()} color={map ? "#ffffff" : "#333"} roughness={0.92} />
      </mesh>
      <mesh position={[3.4, 1.4, -SEGMENT_DEPTH / 2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[SEGMENT_DEPTH, 5.4]} />
        <meshStandardMaterial map={map ?? placeholderTexture()} color={map ? "#ffffff" : "#333"} roughness={0.92} />
      </mesh>
      {/* floor + ceiling strips */}
      <mesh position={[0, -1.3, -SEGMENT_DEPTH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.8, SEGMENT_DEPTH]} />
        <meshStandardMaterial color="#151513" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, 4.1, -SEGMENT_DEPTH / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.8, SEGMENT_DEPTH]} />
        <meshStandardMaterial color="#0c0c0b" roughness={0.9} />
      </mesh>
      {/* portal frame at the segment threshold */}
      <group>
        <mesh position={[0, 4.05, 0]}>
          <boxGeometry args={[7, 0.12, 0.12]} />
          <meshStandardMaterial color={item.accent} roughness={0.35} metalness={0.6} />
        </mesh>
        <mesh position={[-3.45, 1.4, 0]}>
          <boxGeometry args={[0.12, 5.5, 0.12]} />
          <meshStandardMaterial color={item.accent} roughness={0.35} metalness={0.6} />
        </mesh>
        <mesh position={[3.45, 1.4, 0]}>
          <boxGeometry args={[0.12, 5.5, 0.12]} />
          <meshStandardMaterial color={item.accent} roughness={0.35} metalness={0.6} />
        </mesh>
      </group>
      {/* a glowing accent per chamber */}
      <pointLight position={[0, 2.6, -SEGMENT_DEPTH / 2]} intensity={26} color={item.accent} distance={11} />
    </group>
  );
}

export function CorridorScene({
  items,
  progressRef,
}: {
  items: CorridorItem[];
  progressRef: MutableRefObject<number>;
}) {
  const { camera, pointer } = useThree();
  const endLight = useRef<THREE.PointLight>(null);
  const totalDepth = items.length * SEGMENT_DEPTH;

  const resumedAt = useResumeDetector();

  useFrame(({ clock }) => {
    const resumed = resumedAt(clock.elapsedTime);
    const p = progressRef.current;
    const z = 3 - p * (totalDepth - 4);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, z, settle(0.1, resumed));
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.7, settle(0.05, resumed));
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.2 + pointer.y * 0.35, settle(0.05, resumed));
    camera.lookAt(0, 1.1, camera.position.z - 8);
  });

  return (
    <>
      <fog attach="fog" args={["#0a0a09", 4, 26]} />
      <ambientLight intensity={0.5} />
      {items.map((item, i) => (
        <CorridorSegment key={item.slug} item={item} index={i} />
      ))}
      {/* the bright end of the corridor */}
      <mesh position={[0, 1.4, -totalDepth - 1]}>
        <planeGeometry args={[7, 6]} />
        <meshBasicMaterial color="#f4f0e8" />
      </mesh>
      <pointLight ref={endLight} position={[0, 1.4, -totalDepth + 2]} intensity={60} color="#f4f0e8" />

      <SceneWarmup />
    </>
  );
}
