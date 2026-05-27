"use client";

import React, { useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const MODEL_URL = "/models/AadiShakti_Foundry.glb";

// Custom shader for the descending lava droplets
const dropletShaderMaterial = new THREE.ShaderMaterial({
  transparent: true,
  side: THREE.DoubleSide,
  uniforms: {
    uProgress: { value: 0.0 },
    uTime: { value: 0.0 },
    uColorHot: { value: new THREE.Color("#ffaa00") }, // Glowing Gold
    uColorCore: { value: new THREE.Color("#ffffff") } // White hot center
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uProgress;
    uniform float uTime;
    uniform vec3 uColorHot;
    uniform vec3 uColorCore;
    varying vec2 vUv;
    
    void main() {
      // vUv.x goes from 0 (mouth) to 1 (mold)
      if (vUv.x > uProgress) {
        discard;
      }
      
      // Create droplet effect
      // dropPhase oscillates between -1 and 1 along the stream
      float dropPhase = sin(vUv.x * 60.0 - uTime * 25.0);
      
      // Threshold determines how much of the stream is discarded to form drops
      // It starts at -1.0 (fully solid) at the mouth, and transitions to 0.6 (sparse drops) at the mold
      float threshold = mix(-1.0, 0.6, vUv.x);
      
      if (dropPhase < threshold) {
        discard;
      }
      
      // Glow intensity based on the droplet center
      float heat = (dropPhase - threshold) / (1.0 - threshold); 
      vec3 finalColor = mix(uColorHot, uColorCore, heat * 0.8);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
});

export default function FoundryModel({ groupRef, animState, overflowLayerRef }) {
  const { scene } = useGLTF(MODEL_URL);
  
  const streamMaterialRef = useRef(dropletShaderMaterial.clone());
  const streamRef = useRef();
  const dwellTimeRef = useRef(0);
  const floodProgressRef = useRef(-1);

  const SPLIT_OFFSET = 0.45; // Distance to push each half apart

  // 1. Deep clone the scene and physically push the left and right halves apart
  const sceneClone = useMemo(() => {
    const clone = scene.clone(true);
    
    clone.traverse(node => {
      if (node.isMesh) {
        node.geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        node.geometry.boundingBox.getCenter(center);
        
        // Calculate approximate global X relative to the model root
        let globalX = center.x;
        let current = node;
        while(current && current.position) {
          globalX += current.position.x;
          current = current.parent;
        }
        
        // Push the right side (Crucible) further right, and left side (Mold) further left
        if (globalX > 0.05) {
          node.position.x += SPLIT_OFFSET;
        } else if (globalX < -0.05) {
          node.position.x -= SPLIT_OFFSET;
        }
      }
    });
    
    return clone;
  }, [scene]);

  // Setup the glowing molten metal material
  const lavaMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#ff3300",
      emissive: "#ff4a00",
      emissiveIntensity: 6.0,
      toneMapped: false,
      roughness: 0.1,
      metalness: 0.8
    });
  }, []);

  // 2. Inject the custom lava shader into the newly split clone
  React.useEffect(() => {
    sceneClone.traverse((node) => {
      if (node.isMesh) {
        const name = node.name.toLowerCase();
        if (name === 'lava_crucible' || name === 'lava_mold') {
          node.material = lavaMaterial;
        }
      }
    });
  }, [sceneClone, lavaMaterial]);

  // 3. Dynamically calculate the long arcing curve between the separated meshes
  const streamGeometry = useMemo(() => {
    try {
      let crucibleNode = null;
      let moldNode = null;
      
      sceneClone.traverse((node) => {
        const name = node.name.toLowerCase();
        if (name === 'lava_crucible') crucibleNode = node;
        if (name === 'lava_mold') moldNode = node;
      });
      
      if (!crucibleNode || !moldNode) return null;
      
      const cBox = crucibleNode.geometry.boundingBox;
      const mBox = moldNode.geometry.boundingBox;
      
      const cStart = new THREE.Vector3();
      cBox.getCenter(cStart);
      cStart.add(crucibleNode.position); // Includes the +X split offset
      
      const mCenter = new THREE.Vector3();
      mBox.getCenter(mCenter);
      mCenter.add(moldNode.position); // Includes the -X split offset
      
      // Arc slightly up so it looks like a tap pouring out
      cStart.z += 0.05; 
      
      const mid = new THREE.Vector3().lerpVectors(cStart, mCenter, 0.5);
      mid.z += 0.25; // Create a beautiful high arc through the gap
      
      const curve = new THREE.QuadraticBezierCurve3(cStart, mid, mCenter);
      return new THREE.TubeGeometry(curve, 64, 0.035, 16, false);
    } catch(err) {
      return null;
    }
  }, [sceneClone]);

  useFrame((state, delta) => {
    if (!animState?.current) return;
    
    const p = animState.current.pourProgress || 0;
    const foundryIsHeld = animState.current.modelSwap > 0.82 && animState.current.modelSwap < 1.18;

    if (foundryIsHeld) {
      dwellTimeRef.current = Math.min(dwellTimeRef.current + delta, 8);
    } else {
      dwellTimeRef.current = Math.max(dwellTimeRef.current - delta * 3.2, 0);
    }

    const dwellFill = THREE.MathUtils.smoothstep(dwellTimeRef.current, 0.5, 2.6);
    const fillProgress = Math.max(THREE.MathUtils.clamp(p, 0.0, 1.0), dwellFill);
    const floodProgress = THREE.MathUtils.smoothstep(dwellTimeRef.current, 3.15, 7.1);

    if (
      overflowLayerRef?.current &&
      Math.abs(floodProgress - floodProgressRef.current) > 0.001
    ) {
      overflowLayerRef.current.style.setProperty("--flood-progress", floodProgress.toFixed(4));
      floodProgressRef.current = floodProgress;
    }
    
    if (streamMaterialRef.current) {
      streamMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      streamMaterialRef.current.uniforms.uProgress.value = THREE.MathUtils.clamp(fillProgress * 2.0, 0.0, 1.0);
    }
    
    sceneClone.traverse((node) => {
      if (node.name.toLowerCase() === 'lava_mold') {
        node.scale.y = Math.max(0.001, fillProgress);
      }
    });
  });

  return (
    <group ref={groupRef} scale={0.45} position={[0, -0.7, 0]} rotation={[0, 0, 0]}>
      {/* Keep the exported side elevation as the default draggable view. */}
      <group rotation={[0, 0, 0]}>
        <primitive object={sceneClone} />
        
        {streamGeometry && (
          <mesh 
            ref={streamRef} 
            geometry={streamGeometry} 
            material={streamMaterialRef.current} 
          />
        )}
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
