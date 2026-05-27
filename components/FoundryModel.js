"use client";

import { useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const MODEL_URL = "/models/AadiShakti_Foundry.glb";

function buildEdgeGeometry(scene) {
  const positions = [];
  const model = scene.clone(true);

  model.updateMatrixWorld(true);
  model.traverse((node) => {
    if (!node.isMesh || !node.geometry) return;

    const edges = new THREE.EdgesGeometry(node.geometry, 16);
    const vertices = edges.attributes.position.array;

    for (let index = 0; index < vertices.length; index += 3) {
      const point = new THREE.Vector3(vertices[index], vertices[index + 1], vertices[index + 2]);
      point.applyMatrix4(node.matrixWorld);
      positions.push(point.x, point.y, point.z);
    }

    edges.dispose();
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

export default function FoundryModel({ groupRef, animState }) {
  const { scene } = useGLTF(MODEL_URL);
  const primaryMaterialRef = useRef();
  const echoMaterialRef = useRef();
  const edges = useMemo(() => buildEdgeGeometry(scene), [scene]);

  useFrame(({ clock }) => {
    const visibleAmount = THREE.MathUtils.clamp(
      (animState.current.modelSwap || 0) * (1 - (animState.current.productReveal || 0)),
      0,
      1
    );
    const pulse = 0.82 + Math.sin(clock.elapsedTime * 2.1) * 0.12;

    if (primaryMaterialRef.current) {
      primaryMaterialRef.current.opacity = visibleAmount * pulse;
    }
    if (echoMaterialRef.current) {
      echoMaterialRef.current.opacity = visibleAmount * (0.16 + Math.sin(clock.elapsedTime * 1.6) * 0.04);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.7, 0]} rotation={[0, 0, 0]} visible={false}>
      <lineSegments geometry={edges}>
        <lineBasicMaterial
          ref={primaryMaterialRef}
          color="#dfb65a"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
      <lineSegments geometry={edges} scale={1.012}>
        <lineBasicMaterial
          ref={echoMaterialRef}
          color="#ff453c"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
