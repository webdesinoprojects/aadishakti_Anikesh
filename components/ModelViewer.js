"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import FoundryModel from "./FoundryModel";
import IngotModel from "./IngotModel";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const MODEL_URL = "/models/aadishakti_battery_v3.glb";

function BatteryModel() {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => scene.clone(true), [scene]);
  const materialGroups = useRef({ body: [], labels: [] });
  const groupRef = useRef();
  const foundryGroupRef = useRef();
  const ingotGroupRef = useRef();
  const modelRef = useRef();
  const mouseNDC = useRef(new THREE.Vector2(-999, -999));
  const animState = useRef({ 
    explosion: 0, 
    gravityDrop: 0, 
    modelSwap: 0, 
    productReveal: 0,
    solidOpacity: 0,
    wireOpacity: 1
  });
  const linesMaterialRef = useRef();

  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;

    return {
      center,
      scale: 2.08 / maxAxis,
    };
  }, [model]);

  const explosionLinesGeometry = useMemo(() => {
    const positions = [];
    const randomDirs = [];
    const randomCenters = [];

    const tempModel = model.clone();
    tempModel.position.set(0, 0, 0);
    tempModel.rotation.set(0, 0, 0);
    tempModel.scale.set(1, 1, 1);
    tempModel.updateMatrixWorld(true);

    tempModel.traverse((child) => {
      if (child.isMesh) {
        const edges = new THREE.EdgesGeometry(child.geometry, 15);
        const edgePositions = edges.attributes.position.array;
        
        for (let i = 0; i < edgePositions.length; i += 6) {
          const v1 = new THREE.Vector3(edgePositions[i], edgePositions[i+1], edgePositions[i+2]);
          const v2 = new THREE.Vector3(edgePositions[i+3], edgePositions[i+4], edgePositions[i+5]);
          
          v1.applyMatrix4(child.matrixWorld);
          v2.applyMatrix4(child.matrixWorld);

          positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
          
          const midPoint = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
          const dir = midPoint.clone().normalize();
          dir.x += (Math.random() - 0.5) * 1.5;
          dir.y += (Math.random() - 0.5) * 1.5;
          dir.z += (Math.random() - 0.5) * 1.5;
          dir.normalize();
          
          const force = 8 + Math.random() * 20;
          dir.multiplyScalar(force);
          
          randomDirs.push(dir.x, dir.y, dir.z, dir.x, dir.y, dir.z);

          const worldTargetY = -0.8 + (Math.random() - 0.5) * 1.5;
          const worldTargetX = (Math.random() - 0.5) * 6.5;
          const worldTargetZ = (Math.random() - 0.5) * 2.5;

          const localSpreadX = worldTargetX / (fit.scale * 2.0) + fit.center.x;
          const localSpreadZ = worldTargetZ / (fit.scale * 2.0) + fit.center.z;
          const localFloorY = worldTargetY / (fit.scale * 2.0) + fit.center.y;

          const cx = (v1.x + v2.x) * 0.5;
          const cy = (v1.y + v2.y) * 0.5;
          const cz = (v1.z + v2.z) * 0.5;

          randomCenters.push(
            localSpreadX + (v1.x - cx), localFloorY + (v1.y - cy), localSpreadZ + (v1.z - cz),
            localSpreadX + (v2.x - cx), localFloorY + (v2.y - cy), localSpreadZ + (v2.z - cz)
          );
        }
      }
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('aDir', new THREE.Float32BufferAttribute(randomDirs, 3));
    geo.setAttribute('aFloor', new THREE.Float32BufferAttribute(randomCenters, 3));
    return geo;
  }, [model, fit.scale, fit.center]);

  const linesMaterial = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uExplosion: { value: 0 },
      uGravity: { value: 0 },
      uMouse: { value: new THREE.Vector3(-999, -999, 0) },
      uColor: { value: new THREE.Color("#dfb65a") },
      uOpacity: { value: 0.0 }
    },
    vertexShader: `
      attribute vec3 aDir;
      attribute vec3 aFloor;
      uniform float uExplosion;
      uniform float uGravity;
      uniform vec3 uMouse;
      
      varying float vAlpha;

      void main() {
        vec3 pos = position;
        
        pos += aDir * uExplosion;
        pos = mix(pos, aFloor, uGravity);
        
        float dist = distance(pos, uMouse);
        float repelRadius = 6.0;
        if (dist < repelRadius) {
           float force = pow((repelRadius - dist) / repelRadius, 1.5);
           vec3 dir = normalize(pos - uMouse);
           pos += dir * force * (uGravity * 6.5);
        }
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        vAlpha = 1.0 - (uExplosion * 0.7);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vAlpha;
      void main() {
        gl_FragColor = vec4(uColor, uOpacity * vAlpha * 0.7);
      }
    `
  }), []);

  useEffect(() => {
    const bodyMaterials = [];
    const labelMaterials = [];

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

      object.castShadow = false;
      object.receiveShadow = false;
      object.frustumCulled = false;
      const material = new THREE.MeshStandardMaterial({
        color: isLabel ? "#d9874b" : "#130c0a",
        emissive: isLabel ? "#c55f2d" : "#170505",
        emissiveIntensity: isLabel ? 0.86 : 0.18,
        roughness: 0.38,
        metalness: 0.54,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      });

      object.material = material;

      if (isLabel) {
        labelMaterials.push(material);
      } else {
        bodyMaterials.push(material);
      }
    });

    materialGroups.current = {
      body: bodyMaterials,
      labels: labelMaterials,
    };
  }, [model]);

  const dragState = useRef({ isDragging: false, previousMousePosition: { x: 0, y: 0 } });

  useEffect(() => {
    const handlePointerDown = (e) => {
      if (e.target.closest('a, button')) return;
      dragState.current.isDragging = true;
      dragState.current.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      dragState.current.isDragging = false;
    };

    const handlePointerMove = (e) => {
      mouseNDC.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNDC.current.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (dragState.current.isDragging) {
        const deltaMove = {
          x: e.clientX - dragState.current.previousMousePosition.x,
          y: e.clientY - dragState.current.previousMousePosition.y
        };

        if (groupRef.current) {
          groupRef.current.rotation.y += deltaMove.x * 0.005;
          groupRef.current.rotation.x = THREE.MathUtils.clamp(
            groupRef.current.rotation.x - deltaMove.y * 0.005,
            -Math.PI / 4,
            Math.PI / 4
          );
        }

        if (foundryGroupRef.current) {
          foundryGroupRef.current.rotation.y += deltaMove.x * 0.005;
          foundryGroupRef.current.rotation.x = THREE.MathUtils.clamp(
            foundryGroupRef.current.rotation.x - deltaMove.y * 0.005,
            -Math.PI / 4,
            Math.PI / 4
          );
        }

        if (ingotGroupRef.current) {
          ingotGroupRef.current.rotation.y += deltaMove.x * 0.005;
          ingotGroupRef.current.rotation.x = THREE.MathUtils.clamp(
            ingotGroupRef.current.rotation.x - deltaMove.y * 0.005,
            -Math.PI / 4,
            Math.PI / 4
          );
        }

        dragState.current.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointermove', handlePointerMove);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  useFrame(() => {
    if (typeof window === "undefined") return;

    const foundryMix = THREE.MathUtils.clamp(animState.current.modelSwap, 0, 1);
    const productReveal = THREE.MathUtils.clamp(animState.current.productReveal, 0, 1);
    const batteryScale = 1 - foundryMix;
    const foundryScale = foundryMix * (1 - productReveal);
    const baseFoundryScale = window.innerWidth < 768 ? 0.48 : 0.7;
    const baseIngotScale = window.innerWidth < 768 ? 0.62 : 0.92;

    if (groupRef.current) {
      groupRef.current.scale.setScalar(fit.scale * batteryScale);
      groupRef.current.visible = batteryScale > 0.01;
    }
    if (foundryGroupRef.current) {
      foundryGroupRef.current.scale.setScalar(fit.scale * baseFoundryScale * foundryScale);
      foundryGroupRef.current.visible = foundryScale > 0.01;
    }
    if (ingotGroupRef.current) {
      ingotGroupRef.current.scale.setScalar(baseIngotScale * productReveal);
      ingotGroupRef.current.visible = productReveal > 0.01;
    }

    // Material Logic for Battery (Solid vs Wireframe)
    materialGroups.current.body.forEach((material) => {
      material.opacity = animState.current.solidOpacity;
      material.emissiveIntensity = THREE.MathUtils.lerp(0.54, 0.18, animState.current.solidOpacity);
    });

    materialGroups.current.labels.forEach((material) => {
      material.opacity = animState.current.solidOpacity;
      material.emissiveIntensity = THREE.MathUtils.lerp(1.25, 0.86, animState.current.solidOpacity);
    });

    if (linesMaterialRef.current) {
      const mouseWorldPos = new THREE.Vector3(mouseNDC.current.x * 6, mouseNDC.current.y * 4, 0);
      const mouseLocalPos = mouseWorldPos.clone();
      if (groupRef.current) groupRef.current.worldToLocal(mouseLocalPos);
      
      mouseLocalPos.x += fit.center.x;
      mouseLocalPos.y += fit.center.y;
      mouseLocalPos.z += fit.center.z;

      linesMaterialRef.current.uniforms.uOpacity.value = animState.current.wireOpacity;
      linesMaterialRef.current.uniforms.uExplosion.value = animState.current.explosion;
      linesMaterialRef.current.uniforms.uGravity.value = animState.current.gravityDrop;
      linesMaterialRef.current.uniforms.uMouse.value.copy(mouseLocalPos);
    }
  });

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth <= 1180) return;

    const ctx = gsap.context(() => {
      if (!groupRef.current) return;

      // Start in the same holographic battery language used through the experience.
      gsap.set(groupRef.current.position, { x: 2.2, y: 0.1, z: 0 });
      gsap.set(groupRef.current.rotation, { x: 0.04, y: -0.34, z: 0 });

      if (foundryGroupRef.current) {
        gsap.set(foundryGroupRef.current.position, { x: 0.78, y: -0.02, z: 0 });
        gsap.set(foundryGroupRef.current.rotation, { x: 0.04, y: -0.34, z: 0 });
      }

      if (ingotGroupRef.current) {
        gsap.set(ingotGroupRef.current.position, { x: 1.72, y: -0.12, z: 0 });
        gsap.set(ingotGroupRef.current.rotation, { x: 0.12, y: -0.42, z: 0.02 });
      }

      // ----------------------------------------------------------------
      // Opening journey. From the moment the page loads the battery is
      // driven by scroll (the same scroll-rotation language used in the
      // closing ingot section), then crossfades into the matching
      // holographic furnace. Mapped to a fixed pixel span (0 -> 2x
      // viewport) so the sticky/pinned layers below can't skew the timing.
      // ----------------------------------------------------------------
      const openingTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".hero-landing",
          start: "top top",
          end: () => "+=" + window.innerHeight * 2,
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
      });

      openingTl
        // Hero beat — battery reacts to scroll straight away (0 -> 1x vh).
        .to(groupRef.current.rotation, { y: 0.55, x: 0.12, ease: "none", duration: 0.5 }, 0)
        .to(groupRef.current.position, { x: 1.92, y: 0.18, ease: "none", duration: 0.5 }, 0)
        // Founders beat — battery rotates further and becomes the furnace (1x -> 2x vh).
        .to(groupRef.current.rotation, { y: Math.PI * 0.52, x: 0.16, ease: "none", duration: 0.5 }, 0.5)
        .to(groupRef.current.position, { x: 1.5, y: 0.06, ease: "none", duration: 0.5 }, 0.5)
        .to(animState.current, { modelSwap: 1, ease: "power2.inOut", duration: 0.42 }, 0.54)
        .to(foundryGroupRef.current.rotation, { y: Math.PI * 0.36, x: 0.08, ease: "none", duration: 0.4 }, 0.6);

      // Stacking depth — each outgoing panel sinks back and dims as the next
      // tinted panel rises over it (the card-stack feel). Only the panels
      // BEFORE the pinned Founders rail are transformed here, so the pin is
      // never wrapped in a transform (which would break its fixed positioning).
      gsap.fromTo(
        ".hero-section",
        { scale: 1, autoAlpha: 1 },
        {
          scale: 0.92,
          autoAlpha: 0.32,
          transformOrigin: "center top",
          ease: "none",
          scrollTrigger: {
            trigger: ".hero-landing",
            start: "top top",
            end: () => "+=" + window.innerHeight,
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );

      gsap.to(".stats-strip", {
        scale: 0.93,
        autoAlpha: 0.4,
        transformOrigin: "center top",
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-landing",
          start: () => "+=" + window.innerHeight,
          end: () => "+=" + window.innerHeight * 2,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // Stat figures lock in place and reveal as their layer scrolls up.
      gsap.fromTo(
        ".stats-item",
        { yPercent: 70, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".hero-landing",
            start: () => "+=" + window.innerHeight * 0.5,
            end: () => "+=" + window.innerHeight * 0.95,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );

      // The manufacturing output is ingots, revealed as the Plants section arrives.
      const plantsTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".plants-section",
          start: "top bottom",
          end: "top 20%",
          scrub: 1.5,
        }
      });

      plantsTl
        .to(animState.current, { productReveal: 1, ease: "power2.inOut", duration: 0.4 }, 0)
        .to(foundryGroupRef.current.rotation, { y: Math.PI * 0.78, ease: "none", duration: 0.34 }, 0)
        .to(ingotGroupRef.current.position, { x: 1.55, y: 0, ease: "none", duration: 0.8 }, 0)
        .to(ingotGroupRef.current.rotation, { y: Math.PI * 0.46, x: 0.16, ease: "none", duration: 0.8 }, 0);

      gsap.to(ingotGroupRef.current.rotation, {
        y: Math.PI * 1.25,
        x: 0.1,
        scrollTrigger: {
          trigger: ".site-footer",
          start: "top bottom",
          end: "bottom bottom",
          scrub: 1.5,
        },
      });

      // Fade out embers in the background
      gsap.to(".ember-field", {
        opacity: 0,
        scrollTrigger: {
          trigger: ".site-footer",
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [fit.scale]);

  return (
    <>
    <group ref={groupRef} scale={fit.scale} position={[0, 0.04, 0]} rotation={[0.04, -0.34, 0]}>
      <group ref={modelRef}>
        <primitive object={model} position={[-fit.center.x, -fit.center.y, -fit.center.z]} />
        <lineSegments frustumCulled={false} position={[-fit.center.x, -fit.center.y, -fit.center.z]} geometry={explosionLinesGeometry}>
          <primitive object={linesMaterial} ref={linesMaterialRef} attach="material" />
        </lineSegments>
      </group>
    </group>
    
    <FoundryModel groupRef={foundryGroupRef} animState={animState} dragState={dragState} />
    <IngotModel groupRef={ingotGroupRef} animState={animState} />
    </>
  );
}

function CameraSetup() {
  const { camera, gl } = useThree();

  useEffect(() => {
    camera.position.set(0, 0.16, 6.15);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    gl.setClearColor(0x000000, 0);
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
  }, [camera, gl]);

  return null;
}

export default function ModelViewer() {
  return (
    <div className="model-viewer">
      <Canvas 
        camera={{ position: [0, 0.16, 6.15], fov: 34 }} 
        dpr={[1, 2]} 
        gl={{ alpha: true, antialias: true }}
      >
        <CameraSetup />
        <ambientLight intensity={2.5} />
        <hemisphereLight args={["#fff2d7", "#160806", 2.2]} />
        <directionalLight position={[0, 0, 5]} intensity={2.5} color="#ffffff" />
        <directionalLight position={[0, 0, -5]} intensity={2.5} color="#ffffff" />
        <directionalLight position={[3.5, 4.5, 4]} intensity={3.3} color="#fff5e2" />
        <pointLight position={[-3.8, 1.6, 3.2]} intensity={14} color="#c46d32" />
        <pointLight position={[3.2, -2.4, 2.8]} intensity={20} color="#dfb65a" />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <BatteryModel />
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
