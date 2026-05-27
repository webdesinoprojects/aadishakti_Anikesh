"use client";

import React, { useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
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
      if (vUv.x > uProgress) {
        discard;
      }
      
      float flow = sin(vUv.x * 28.0 - uTime * 10.0) * 0.5 + 0.5;
      float hotCore = smoothstep(0.18, 0.82, flow);
      vec3 finalColor = mix(uColorHot, uColorCore, hotCore * 0.68);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
});

const moltenFloodShaderMaterial = new THREE.ShaderMaterial({
  transparent: true,
  depthTest: false,
  depthWrite: false,
  toneMapped: false,
  uniforms: {
    uLeak: { value: 0.0 },
    uPool: { value: 0.0 },
    uProgress: { value: 0.0 },
    uTime: { value: 0.0 },
    uOrigin: { value: new THREE.Vector2(0.67, 0.54) }
  },
  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uLeak;
    uniform float uPool;
    uniform float uProgress;
    uniform float uTime;
    uniform vec2 uOrigin;
    varying vec2 vUv;

    float random(vec2 point) {
      return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 point) {
      vec2 cell = floor(point);
      vec2 local = fract(point);
      vec2 blend = local * local * (3.0 - 2.0 * local);

      float a = random(cell);
      float b = random(cell + vec2(1.0, 0.0));
      float c = random(cell + vec2(0.0, 1.0));
      float d = random(cell + vec2(1.0, 1.0));

      return mix(mix(a, b, blend.x), mix(c, d, blend.x), blend.y);
    }

    float fbm(vec2 point) {
      float value = 0.0;
      float amplitude = 0.52;
      for (int i = 0; i < 5; i++) {
        value += amplitude * noise(point);
        point = point * 2.04 + vec2(5.3, 1.7);
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      float poolVisible = smoothstep(0.003, 0.06, uPool + uProgress);
      float surfaceNoise = fbm(vec2(vUv.x * 4.2 - uTime * 0.1, uTime * 0.2));
      float rollingSurface = sin(vUv.x * 17.0 + uTime * 1.5) * 0.012;
      float surface = 0.018 + uPool * 0.075 + uProgress * 1.08
        + (surfaceNoise - 0.5) * 0.11
        + rollingSurface;
      float poolWidth = mix(0.022, 0.46, uPool);
      float spreadingPool = 1.0 - smoothstep(
        poolWidth,
        poolWidth + 0.065,
        abs(vUv.x - uOrigin.x) + (noise(vec2(vUv.y * 20.0, uTime * 0.1)) - 0.5) * 0.018
      );
      float fullFloor = smoothstep(0.01, 0.14, uProgress);
      float horizontalCoverage = mix(spreadingPool, 1.0, fullFloor);
      float moltenBody = (1.0 - smoothstep(surface - 0.018, surface + 0.035, vUv.y))
        * horizontalCoverage
        * poolVisible;

      vec2 flow = vec2(vUv.x * 3.6 + uTime * 0.07, vUv.y * 5.0 - uTime * 0.28);
      float baseFlow = fbm(flow);
      float hotFlow = fbm(flow * 2.55 + vec2(-uTime * 0.18, uTime * 0.09));
      float veins = smoothstep(0.56, 0.77, hotFlow + baseFlow * 0.25);

      vec3 cooled = vec3(0.18, 0.012, 0.004);
      vec3 orange = vec3(1.08, 0.13, 0.014);
      vec3 yellow = vec3(2.4, 0.84, 0.12);
      vec3 color = mix(cooled, orange, smoothstep(0.12, 0.82, baseFlow));
      color = mix(color, yellow, veins * 0.84);

      float hotLip = 1.0 - smoothstep(0.0, 0.052, abs(vUv.y - surface));
      color += vec3(2.1, 0.48, 0.035) * hotLip;

      float leakVisible = smoothstep(0.02, 0.18, uLeak);
      float streamBottom = mix(uOrigin.y - 0.015, 0.055, smoothstep(0.0, 0.72, uLeak));
      float sway = sin(vUv.y * 23.0 - uTime * 4.6) * mix(0.002, 0.009, uLeak);
      float streamCenter = uOrigin.x + sway;
      float streamWidth = mix(0.005, 0.016, uLeak) + (1.0 - vUv.y) * 0.006;
      float verticalStream = smoothstep(streamBottom - 0.008, streamBottom + 0.014, vUv.y)
        * (1.0 - smoothstep(uOrigin.y - 0.004, uOrigin.y + 0.014, vUv.y));
      float connectedStream = (1.0 - smoothstep(streamWidth, streamWidth + 0.005, abs(vUv.x - streamCenter)))
        * verticalStream
        * leakVisible;
      float landingGlow = (1.0 - smoothstep(0.012, 0.052, length(vec2((vUv.x - uOrigin.x) * 0.7, vUv.y - 0.04))))
        * smoothstep(0.64, 0.94, uLeak);
      float fallingMolten = clamp(connectedStream + landingGlow, 0.0, 1.0);
      color = mix(color, vec3(2.5, 0.96, 0.18), fallingMolten * 0.74);

      float alpha = max(
        moltenBody * mix(0.86, 0.97, uProgress),
        fallingMolten * smoothstep(0.0, 0.14, uLeak)
      );
      gl_FragColor = vec4(color, alpha);
    }
  `
});

function MoltenFlood({ animState, spillOriginRef }) {
  const material = useMemo(() => moltenFloodShaderMaterial.clone(), []);
  const floodRef = useRef();

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uLeak.value = animState?.current?.leakProgress || 0;
    material.uniforms.uPool.value = animState?.current?.poolProgress || 0;
    material.uniforms.uProgress.value = animState?.current?.floodProgress || 0;
    material.uniforms.uOrigin.value.copy(spillOriginRef.current);

    if (floodRef.current) {
      floodRef.current.visible = Boolean(
        animState?.current?.foundryInView
        && (
          animState.current.leakProgress > 0.001
          || animState.current.poolProgress > 0.001
          || animState.current.floodProgress > 0.001
        )
      );
    }
  });

  return (
    <mesh ref={floodRef} visible={false} frustumCulled={false} renderOrder={1000}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default function FoundryModel({ groupRef, animState }) {
  const { camera } = useThree();
  const { scene } = useGLTF(MODEL_URL);
  
  const streamMaterialRef = useRef(dropletShaderMaterial.clone());
  const streamRef = useRef();
  const dwellTimeRef = useRef(0);
  const moldNodeRef = useRef();
  const spillPointRef = useRef(new THREE.Vector3());
  const spillOriginRef = useRef(new THREE.Vector2(0.67, 0.54));

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
        if (name === 'lava_mold') {
          moldNodeRef.current = node;
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
    const foundersShell = document.querySelector(".founder-scroll-shell");
    const foundersBounds = foundersShell?.getBoundingClientRect();
    const plantsBounds = document.querySelector(".plants-section")?.getBoundingClientRect();
    const plantsEntering = Boolean(plantsBounds && plantsBounds.top < window.innerHeight * 0.98);
    const foundryInView = Boolean(
      foundersBounds
      && foundersBounds.top < window.innerHeight * 0.72
      && foundersBounds.bottom > window.innerHeight * 0.18
      && !plantsEntering
      && animState.current.modelSwap > 0.42
      && animState.current.modelSwap < 1.4
    );
    animState.current.foundryInView = foundryInView;

    if (foundryInView) {
      dwellTimeRef.current = Math.min(dwellTimeRef.current + delta, 13);
    } else {
      dwellTimeRef.current = 0;
    }

    const dwellFill = THREE.MathUtils.smoothstep(dwellTimeRef.current, 0.5, 2.6);
    const fillProgress = Math.max(THREE.MathUtils.clamp(p, 0.0, 1.0), dwellFill);
    const leakProgress = foundryInView ? THREE.MathUtils.smoothstep(dwellTimeRef.current, 1.8, 2.8) : 0;
    const poolProgress = foundryInView ? THREE.MathUtils.smoothstep(dwellTimeRef.current, 2.9, 6.4) : 0;
    const floodProgress = foundryInView ? THREE.MathUtils.smoothstep(dwellTimeRef.current, 6.5, 9.4) : 0;
    animState.current.leakProgress = leakProgress;
    animState.current.poolProgress = poolProgress;
    animState.current.floodProgress = floodProgress;

    if (moldNodeRef.current?.geometry.boundingBox) {
      const box = moldNodeRef.current.geometry.boundingBox;
      spillPointRef.current.set(
        THREE.MathUtils.lerp(box.min.x, box.max.x, 0.12),
        box.max.y,
        (box.min.z + box.max.z) * 0.5
      );
      moldNodeRef.current.localToWorld(spillPointRef.current);
      spillPointRef.current.project(camera);
      spillOriginRef.current.set(
        THREE.MathUtils.clamp(spillPointRef.current.x * 0.5 + 0.5, 0.04, 0.96),
        THREE.MathUtils.clamp(spillPointRef.current.y * 0.5 + 0.5, 0.08, 0.94)
      );
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
    <>
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
      <MoltenFlood animState={animState} spillOriginRef={spillOriginRef} />
    </>
  );
}

useGLTF.preload(MODEL_URL);
