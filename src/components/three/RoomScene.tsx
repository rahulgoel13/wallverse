"use client";

import { useEffect, useMemo, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, Html, ContactShadows } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useWallpaperTexture } from "./useWallpaperTexture";
import { placeholderTexture, qualityTier, TILE_METRES } from "./three-utils";
import { SceneWarmup } from "./SceneShell";
import { WALL_LABELS, type LightingId, type RoomId, type StudioState, type WallId } from "@/components/studio/studio-types";
import type { ProductDTO } from "@/types";

const ROOM_W = 5.6;
const ROOM_D = 5.2;
const ROOM_H = 3.0;

interface WallSpec {
  id: WallId;
  width: number;
  position: [number, number, number];
  rotation: [number, number, number];
}

const WALLS: WallSpec[] = [
  { id: "back", width: ROOM_W, position: [0, ROOM_H / 2, -ROOM_D / 2], rotation: [0, 0, 0] },
  { id: "front", width: ROOM_W, position: [0, ROOM_H / 2, ROOM_D / 2], rotation: [0, Math.PI, 0] },
  { id: "left", width: ROOM_D, position: [-ROOM_W / 2, ROOM_H / 2, 0], rotation: [0, Math.PI / 2, 0] },
  { id: "right", width: ROOM_D, position: [ROOM_W / 2, ROOM_H / 2, 0], rotation: [0, -Math.PI / 2, 0] },
];

function Wall({
  spec,
  design,
  scale,
  paint,
  selected,
  onSelect,
}: {
  spec: WallSpec;
  design: ProductDTO | null;
  scale: number;
  paint: string;
  selected: boolean;
  onSelect: (id: WallId) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const tile = TILE_METRES * scale;
  const map = useWallpaperTexture(design?.texture ?? null, spec.width / tile, ROOM_H / tile);
  const outline = useMemo(() => {
    const plane = new THREE.PlaneGeometry(spec.width - 0.04, ROOM_H - 0.04);
    const edges = new THREE.EdgesGeometry(plane);
    plane.dispose();
    return edges;
  }, [spec.width]);
  useEffect(() => () => outline.dispose(), [outline]);

  return (
    <group position={spec.position} rotation={spec.rotation}>
      <mesh
        receiveShadow
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
          onSelect(spec.id);
        }}
      >
        <planeGeometry args={[spec.width, ROOM_H]} />
        <meshStandardMaterial
          map={design && map ? map : placeholderTexture()}
          color={design && map ? "#ffffff" : paint}
          roughness={0.93}
          metalness={0.02}
          emissive={hovered && !selected ? "#d6ff72" : "#000000"}
          emissiveIntensity={hovered && !selected ? 0.07 : 0}
        />
      </mesh>
      {/* selection / hover frame */}
      <lineSegments position={[0, 0, 0.012]} geometry={outline} visible={selected || hovered}>
        <lineBasicMaterial color={selected ? "#d6ff72" : "#f4f0e8"} transparent opacity={selected ? 1 : 0.5} />
      </lineSegments>
      {(selected || hovered) && (
        <Html position={[0, ROOM_H / 2 - 0.3, 0.05]} center zIndexRange={[30, 0]}>
          <div className="pointer-events-none whitespace-nowrap bg-ink/85 border border-citron/50 px-2.5 py-1">
            <p className="label text-[0.55rem] text-citron">
              {WALL_LABELS[spec.id]}
              {design ? ` · ${design.name}` : " · Paint"}
            </p>
          </div>
        </Html>
      )}
      {/* skirting */}
      <mesh position={[0, -ROOM_H / 2 + 0.06, 0.015]}>
        <boxGeometry args={[spec.width, 0.12, 0.02]} />
        <meshStandardMaterial color="#efeadd" roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ——— furniture ——— */

function Sofa({ position = [0, 0, 0.6] as [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[2.1, 0.5, 0.95]} />
        <meshStandardMaterial color="#35332c" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.62, -0.38]}>
        <boxGeometry args={[2.1, 0.55, 0.22]} />
        <meshStandardMaterial color="#3d3a32" roughness={0.9} />
      </mesh>
      {[-0.52, 0.52].map((x) => (
        <mesh key={x} castShadow position={[x, 0.56, 0.02]}>
          <boxGeometry args={[0.92, 0.16, 0.8]} />
          <meshStandardMaterial color="#45423a" roughness={0.95} />
        </mesh>
      ))}
      {[-1.12, 1.12].map((x) => (
        <mesh key={x} castShadow position={[x, 0.4, 0]}>
          <boxGeometry args={[0.18, 0.8, 0.9]} />
          <meshStandardMaterial color="#2b2923" roughness={0.9} />
        </mesh>
      ))}
      <mesh castShadow position={[-0.45, 0.62, 0.1]} rotation={[0.2, 0.3, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.12]} />
        <meshStandardMaterial color="#b99a6a" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0.5, 0.62, 0.08]} rotation={[0.15, -0.2, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.12]} />
        <meshStandardMaterial color="#777c61" roughness={0.8} />
      </mesh>
    </group>
  );
}

function CoffeeTable({ position = [0, 0, 1.7] as [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.04, 32]} />
        <meshStandardMaterial color="#8a6f4d" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.36, 12]} />
        <meshStandardMaterial color="#1a1916" roughness={0.5} />
      </mesh>
    </group>
  );
}

function FloorLamp({ position = [-2.1, 0, -1.6] as [number, number, number], lit = false }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.8, 8]} />
        <meshStandardMaterial color="#1a1916" />
      </mesh>
      <mesh position={[0, 1.82, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 0.28, 20, 1, true]} />
        <meshStandardMaterial color="#e8ddc2" side={THREE.DoubleSide} emissive={lit ? "#ffd98a" : "#000"} emissiveIntensity={lit ? 0.8 : 0} />
      </mesh>
    </group>
  );
}

/**
 * Where each room's floor lamp stands (null: no lamp). Its light lives in
 * RoomScene and is always mounted — at intensity 0 when off — because the
 * number of lights is part of every lit material's shader: adding or removing
 * one recompiles the whole room (a measured 336 ms freeze).
 */
const LAMP_POSITION: Record<RoomId, [number, number, number] | null> = {
  living: [-2.15, 0, -1.5],
  bedroom: [-2.2, 0, -1.4],
  dining: null,
};

function Plant({ position = [2.2, 0, -1.9] as [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.16, 0.12, 0.4, 16]} />
        <meshStandardMaterial color="#8a6f4d" roughness={0.8} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} castShadow position={[Math.sin(i * 1.3) * 0.12, 0.62 + (i % 3) * 0.14, Math.cos(i * 1.3) * 0.12]} rotation={[0.4 * Math.sin(i), i, 0.3]}>
          <coneGeometry args={[0.07, 0.5, 6]} />
          <meshStandardMaterial color={i % 2 ? "#3f5c49" : "#4f6f5a"} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Bed({ position = [0, 0, -0.6] as [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[1.9, 0.3, 2.2]} />
        <meshStandardMaterial color="#5a5244" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.44, 0.08]}>
        <boxGeometry args={[1.84, 0.18, 2.0]} />
        <meshStandardMaterial color="#efe9db" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0, 0.5, 0.75]}>
        <boxGeometry args={[1.8, 0.1, 0.6]} />
        <meshStandardMaterial color="#d9d0c1" roughness={0.95} />
      </mesh>
      {[-0.45, 0.45].map((x) => (
        <mesh key={x} castShadow position={[x, 0.58, -0.78]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.6, 0.12, 0.4]} />
          <meshStandardMaterial color="#f4f0e8" roughness={0.95} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.7, -1.05]}>
        <boxGeometry args={[1.95, 0.9, 0.1]} />
        <meshStandardMaterial color="#45413a" roughness={0.85} />
      </mesh>
      {[-1.25, 1.25].map((x) => (
        <group key={x} position={[x, 0, -0.8]}>
          <mesh castShadow position={[0, 0.25, 0]}>
            <boxGeometry args={[0.45, 0.5, 0.4]} />
            <meshStandardMaterial color="#8a6f4d" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function DiningSet({ position = [0, 0, 0] as [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.74, 0]}>
        <boxGeometry args={[1.9, 0.06, 1.0]} />
        <meshStandardMaterial color="#2b2822" roughness={0.3} metalness={0.1} />
      </mesh>
      {[[-0.85, -0.4], [0.85, -0.4], [-0.85, 0.4], [0.85, 0.4]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.37, z]}>
          <cylinderGeometry args={[0.03, 0.03, 0.74, 10]} />
          <meshStandardMaterial color="#b99a6a" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
      {[[-0.6, -0.95, 0], [0.6, -0.95, 0], [-0.6, 0.95, Math.PI], [0.6, 0.95, Math.PI]].map(([x, z, ry], i) => (
        <group key={i} position={[x as number, 0, z as number]} rotation={[0, ry as number, 0]}>
          <mesh castShadow position={[0, 0.45, 0]}>
            <boxGeometry args={[0.42, 0.05, 0.42]} />
            <meshStandardMaterial color="#35332c" roughness={0.8} />
          </mesh>
          <mesh castShadow position={[0, 0.72, -0.19]}>
            <boxGeometry args={[0.42, 0.5, 0.05]} />
            <meshStandardMaterial color="#35332c" roughness={0.8} />
          </mesh>
          {[[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].map(([lx, lz], j) => (
            <mesh key={j} position={[lx, 0.21, lz]}>
              <cylinderGeometry args={[0.018, 0.018, 0.42, 8]} />
              <meshStandardMaterial color="#1a1916" />
            </mesh>
          ))}
        </group>
      ))}
      {/* pendant */}
      <mesh position={[0, 2.6, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.8, 6]} />
        <meshStandardMaterial color="#1a1916" />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <sphereGeometry args={[0.16, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#b99a6a" metalness={0.8} roughness={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/**
 * All three furniture sets stay mounted and only the current room's is
 * visible. Unmounting a set disposed its materials, three.js then freed the
 * shaders only that set used, and switching back compiled them again.
 */
function Furniture({ room, lighting }: { room: RoomId; lighting: LightingId }) {
  const lampsLit = lighting !== "day";
  return (
    <>
      <group visible={room === "living"}>
        <Sofa position={[0, 0, 0.4]} />
        <CoffeeTable position={[0, 0, 1.55]} />
        <FloorLamp position={LAMP_POSITION.living!} lit={lampsLit && room === "living"} />
        <Plant position={[2.25, 0, -1.9]} />
      </group>
      <group visible={room === "bedroom"}>
        <Bed />
        <FloorLamp position={LAMP_POSITION.bedroom!} lit={lampsLit && room === "bedroom"} />
        <Plant position={[2.3, 0, -1.9]} />
      </group>
      <group visible={room === "dining"}>
        <DiningSet />
        <Plant position={[-2.3, 0, -1.9]} />
        <Plant position={[2.3, 0, -1.9]} />
      </group>
    </>
  );
}

const LIGHTING: Record<LightingId, { ambient: number; sun: number; sunColor: string; ambColor: string }> = {
  day: { ambient: 0.75, sun: 3.2, sunColor: "#fff4dd", ambColor: "#f4f0e8" },
  evening: { ambient: 0.45, sun: 1.6, sunColor: "#ffc98a", ambColor: "#e8d8c0" },
  night: { ambient: 0.22, sun: 0.25, sunColor: "#8a9ab8", ambColor: "#b8c4d8" },
};

export interface RoomSceneHandle {
  setView: (view: "corner" | "front" | "left" | "top") => void;
}

export const RoomScene = forwardRef<RoomSceneHandle, {
  state: StudioState;
  productsBySlug: Map<string, ProductDTO>;
  onSelectWall: (id: WallId) => void;
}>(function RoomScene({ state, productsBySlug, onSelectWall }, ref) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const tier = useMemo(() => qualityTier(), []);
  const light = LIGHTING[state.lighting];
  const lamp = LAMP_POSITION[state.room];
  const lampLit = lamp !== null && state.lighting !== "day";

  useImperativeHandle(ref, () => ({
    setView: (view) => {
      const pos: Record<string, [number, number, number]> = {
        corner: [3.4, 2.0, 4.6],
        front: [0, 1.5, 5.4],
        left: [-4.6, 1.8, 2.2],
        top: [0.2, 4.4, 3.4],
      };
      const p = pos[view] ?? pos.corner;
      camera.position.set(...p);
      controls.current?.target.set(0, 1.2, 0);
      controls.current?.update();
    },
  }));

  return (
    <>
      <color attach="background" args={[state.lighting === "night" ? "#0c0d12" : "#15151a"]} />
      <ambientLight intensity={light.ambient} color={light.ambColor} />
      {/* floor-lamp light: always mounted, so the light count never changes */}
      <pointLight
        position={lamp ? [lamp[0], 1.78, lamp[2]] : [0, 1.78, 0]}
        intensity={lampLit ? 8 : 0}
        color="#ffd98a"
        distance={5}
      />
      {/* sun through the window (right wall) */}
      <directionalLight
        position={[6, 3.4, 1.5]}
        intensity={light.sun}
        color={light.sunColor}
        castShadow={tier === "high"}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <pointLight position={[0, 2.7, 0]} intensity={state.lighting === "night" ? 14 : 6} color="#ffe8c4" distance={8} />

      {/* walls */}
      {WALLS.map((spec) => {
        const wall = state.walls[spec.id];
        const design = wall.design ? (productsBySlug.get(wall.design) ?? null) : null;
        return (
          <Wall
            key={spec.id}
            spec={spec}
            design={design}
            scale={wall.scale}
            paint={state.paint}
            selected={state.selectedWall === spec.id}
            onSelect={onSelectWall}
          />
        );
      })}

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial color="#9c8c72" roughness={0.65} />
      </mesh>
      {/* rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0.5]} receiveShadow>
        <circleGeometry args={[1.5, 40]} />
        <meshStandardMaterial color="#cbc0aa" roughness={0.98} />
      </mesh>
      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_H, 0]}>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial color="#efeadd" roughness={0.95} />
      </mesh>

      {/* window on the right wall */}
      <group position={[ROOM_W / 2 - 0.02, 1.6, -0.6]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 1.5, 0.06]} />
          <meshStandardMaterial color="#efeadd" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[1.32, 1.32]} />
          <meshStandardMaterial
            color={state.lighting === "night" ? "#1a2238" : "#bcd3e2"}
            emissive={state.lighting === "night" ? "#141c30" : "#dcecf4"}
            emissiveIntensity={state.lighting === "day" ? 1.4 : state.lighting === "evening" ? 0.9 : 0.5}
          />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[0.05, 1.4, 0.03]} />
          <meshStandardMaterial color="#efeadd" />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[1.4, 0.05, 0.03]} />
          <meshStandardMaterial color="#efeadd" />
        </mesh>
      </group>

      {/* door opening on the front wall */}
      <group position={[1.6, 1.05, ROOM_D / 2 - 0.03]} rotation={[0, Math.PI, 0]}>
        <mesh>
          <boxGeometry args={[0.95, 2.1, 0.05]} />
          <meshStandardMaterial color="#3a352c" roughness={0.7} />
        </mesh>
        <mesh position={[-0.35, 0, 0.04]}>
          <sphereGeometry args={[0.035, 12, 10]} />
          <meshStandardMaterial color="#b99a6a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      <Furniture room={state.room} lighting={state.lighting} />

      {tier === "high" && (
        <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={9} blur={2.4} far={3} resolution={512} frames={60} />
      )}

      <OrbitControls
        ref={controls}
        target={[0, 1.2, 0]}
        enablePan={false}
        minDistance={1.6}
        maxDistance={6.4}
        maxPolarAngle={Math.PI / 2 + 0.08}
        minPolarAngle={0.5}
        enableDamping
        dampingFactor={0.08}
        makeDefault
      />

      <SceneWarmup />
    </>
  );
});
