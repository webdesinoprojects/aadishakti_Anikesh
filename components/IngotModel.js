"use client";

import { useRef } from "react";
import { Edges, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const BARS = [
  { position: [-0.76, -0.34, 0], rotation: [0, -0.08, 0.02] },
  { position: [0.78, -0.34, 0.02], rotation: [0, 0.08, -0.02] },
  { position: [0, 0.02, 0], rotation: [0, -0.04, 0] },
  { position: [-0.4, 0.37, 0.04], rotation: [0, 0.07, 0.015] },
  { position: [0.42, 0.37, 0.04], rotation: [0, -0.07, -0.015] },
];

function IngotBar({ position, rotation }) {
  return (
    <RoundedBox args={[1.38, 0.28, 0.58]} radius={0.045} smoothness={3} position={position} rotation={rotation}>
      <meshBasicMaterial color="#dfb65a" transparent opacity={0.055} depthWrite={false} toneMapped={false} />
      <Edges color="#dfb65a" transparent opacity={0.9} />
    </RoundedBox>
  );
}

export default function IngotModel({ groupRef, animState }) {
  const haloRef = useRef();

  useFrame(({ clock }) => {
    if (!haloRef.current) return;

    const reveal = animState.current.productReveal || 0;
    const pulse = 0.22 + Math.sin(clock.elapsedTime * 1.8) * 0.055;
    haloRef.current.material.opacity = reveal * pulse;
  });

  return (
    <group ref={groupRef} visible={false}>
      <group scale={0.78}>
        {BARS.map((bar, index) => (
          <IngotBar key={index} position={bar.position} rotation={bar.rotation} />
        ))}
        <mesh ref={haloRef} position={[0, -0.57, -0.12]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.36, 1.62, 48]} />
          <meshBasicMaterial color="#dfb65a" transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
