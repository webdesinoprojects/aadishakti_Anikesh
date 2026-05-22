"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/models/aadishakti_battery_v3.glb";

function WireBattery() {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => scene.clone(true), [scene]);

  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;

    return {
      center,
      scale: 2.35 / maxAxis,
    };
  }, [model]);

  useEffect(() => {
    model.traverse((object) => {
      if (!object.isMesh) return;

      const name = object.name.toLowerCase();
      const materialName = object.material?.name?.toLowerCase() ?? "";
      const isLabel =
        name.includes("label") ||
        name.includes("logo") ||
        name.startsWith("l_") ||
        materialName.includes("label") ||
        materialName.includes("logo");

      object.frustumCulled = false;
      object.material = isLabel
        ? new THREE.MeshBasicMaterial({
            color: "#ff7c7b",
            transparent: true,
            opacity: 0.96,
            depthWrite: false,
          })
        : new THREE.MeshBasicMaterial({
            color: "#c15b5d",
            wireframe: true,
            transparent: true,
            opacity: 0.48,
            depthWrite: false,
          });
    });
  }, [model]);

  useFrame(({ clock }) => {
    model.rotation.y = -0.42 + Math.sin(clock.elapsedTime * 0.42) * 0.035;
  });

  return (
    <group scale={fit.scale} rotation={[0.02, -0.42, 0]}>
      <primitive object={model} position={[-fit.center.x, -fit.center.y, -fit.center.z]} />
    </group>
  );
}

function CameraSetup() {
  const { camera, gl } = useThree();

  useEffect(() => {
    camera.position.set(0, 0.12, 5.8);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    gl.setClearColor(0x000000, 0);
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [camera, gl]);

  return null;
}

export default function WireframeBattery() {
  return (
    <div className="wireframe-viewer" style={{ position: "absolute", inset: "-5% -4%" }}>
      <Canvas camera={{ position: [0, 0.12, 5.8], fov: 34 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
        <CameraSetup />
        <ambientLight intensity={1.4} />
        <pointLight position={[-2.5, 2.2, 3]} intensity={18} color="#ff6c66" />
        <pointLight position={[3, -1.8, 2.8]} intensity={12} color="#dfb65a" />
        <Suspense fallback={null}>
          <WireBattery />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          rotateSpeed={0.65}
          autoRotate
          autoRotateSpeed={0.24}
          minPolarAngle={Math.PI / 3.2}
          maxPolarAngle={Math.PI / 1.6}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
