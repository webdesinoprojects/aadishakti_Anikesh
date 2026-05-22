"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PresentationControls, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const MODEL_URL = "/models/aadishakti_battery_v3.glb";

function BatteryModel() {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => scene.clone(true), [scene]);
  const materialGroups = useRef({ body: [], labels: [] });
  const groupRef = useRef();
  const modelRef = useRef();
  const mouseNDC = useRef(new THREE.Vector2(-999, -999));
  const animState = useRef({ explosion: 0, gravityDrop: 0 });
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

          // Calculate exact world targets so it always lands on screen
          // Raised the floor slightly to ensure it lands right in the middle of the footer
          const worldTargetY = -0.8 + (Math.random() - 0.5) * 1.5;
          const worldTargetX = (Math.random() - 0.5) * 6.5;
          const worldTargetZ = (Math.random() - 0.5) * 2.5;

          // Add fit.center to cancel out the lineSegments position offset
          const localSpreadX = worldTargetX / (fit.scale * 2.0) + fit.center.x;
          const localSpreadZ = worldTargetZ / (fit.scale * 2.0) + fit.center.z;
          const localFloorY = worldTargetY / (fit.scale * 2.0) + fit.center.y;

          // CRITICAL FIX: To prevent the line from collapsing to zero length (which WebGL won't render),
          // we must preserve the offset of its two vertices relative to its center!
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

  useEffect(() => {
    const handlePointerDown = (e) => {
      if (e.target.closest('a, button')) return; // Don't block clicks on links/buttons
      modelRef.current.userData.isDragging = true;
      modelRef.current.userData.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      if (modelRef.current) modelRef.current.userData.isDragging = false;
    };

    const handlePointerMove = (e) => {
      mouseNDC.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNDC.current.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (modelRef.current?.userData.isDragging) {
        const deltaMove = {
          x: e.clientX - modelRef.current.userData.previousMousePosition.x,
          y: e.clientY - modelRef.current.userData.previousMousePosition.y
        };

        modelRef.current.rotation.y += deltaMove.x * 0.005;
        modelRef.current.rotation.x = THREE.MathUtils.clamp(
          modelRef.current.rotation.x + deltaMove.y * 0.005,
          -Math.PI / 4,
          Math.PI / 4
        );

        modelRef.current.userData.previousMousePosition = { x: e.clientX, y: e.clientY };
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

  useFrame((state, delta) => {
    if (typeof window === "undefined") return;

    if (modelRef.current && !modelRef.current.userData.isDragging) {
      modelRef.current.rotation.y -= delta * 0.05; // Much slower auto-rotate
    }

    const viewport = window.innerHeight || 1;
    const progress = THREE.MathUtils.clamp((window.scrollY - viewport * 0.12) / (viewport * 0.62), 0, 1);

    // Fade out base model quickly as we scroll
    materialGroups.current.body.forEach((material) => {
      material.opacity = Math.max(0, 1 - progress * 2.0);
      material.emissiveIntensity = THREE.MathUtils.lerp(0.18, 0.54, progress);
    });

    materialGroups.current.labels.forEach((material) => {
      material.opacity = Math.max(0, 1 - progress * 2.0);
      material.emissiveIntensity = THREE.MathUtils.lerp(0.86, 1.25, progress);
    });

    if (linesMaterialRef.current) {
      const mouseWorldPos = new THREE.Vector3(mouseNDC.current.x * 6, mouseNDC.current.y * 4, 0);
      const mouseLocalPos = mouseWorldPos.clone();
      if (groupRef.current) groupRef.current.worldToLocal(mouseLocalPos);
      
      // Shift mouse to match the lineSegments position offset
      mouseLocalPos.x += fit.center.x;
      mouseLocalPos.y += fit.center.y;
      mouseLocalPos.z += fit.center.z;

      // Fade in lines as we scroll
      linesMaterialRef.current.uniforms.uOpacity.value = Math.min(1.0, progress * 1.5);
      linesMaterialRef.current.uniforms.uExplosion.value = animState.current.explosion;
      linesMaterialRef.current.uniforms.uGravity.value = animState.current.gravityDrop;
      linesMaterialRef.current.uniforms.uMouse.value.copy(mouseLocalPos);
    }
  });

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth <= 1180) return;

    const ctx = gsap.context(() => {
      if (!groupRef.current) return;

      // 1. Initial State for Desktop Fullscreen Layout
      gsap.set(groupRef.current.position, { x: 2.2, y: 0.1, z: 0 });
      gsap.set(groupRef.current.scale, { x: fit.scale, y: fit.scale, z: fit.scale });
      
      // 2. Scroll to Founders section: Trigger true particle explosion
      gsap.to(animState.current, {
        explosion: 1,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: ".founder-scroll-shell",
          start: "top bottom",
          end: "top center",
          scrub: 1.2,
        },
      });

      gsap.to(groupRef.current.position, {
        x: 0,
        y: 0.5,
        scrollTrigger: {
          trigger: ".founder-scroll-shell",
          start: "top bottom",
          end: "top center",
          scrub: 1.2,
        },
      });

      gsap.to(groupRef.current.scale, {
        x: fit.scale * 1.8,
        y: fit.scale * 1.8,
        z: fit.scale * 1.8,
        scrollTrigger: {
          trigger: ".founder-scroll-shell",
          start: "top bottom",
          end: "top center",
          scrub: 1.2,
        },
      });

      gsap.to(groupRef.current.rotation, {
        y: Math.PI * 0.8,
        x: 0.4,
        scrollTrigger: {
          trigger: ".founder-scroll-shell",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      // 3. Scroll to Plants section: Re-assemble parts into battery form
      gsap.to(animState.current, {
        explosion: 0,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: ".plants-section",
          start: "top bottom",
          end: "top center",
          scrub: 1.2,
        },
      });

      gsap.to(groupRef.current.position, {
        x: 2.35,
        y: 0.2,
        scrollTrigger: {
          trigger: ".plants-section",
          start: "top bottom",
          end: "top center",
          scrub: 1.2,
        },
      });

      gsap.to(groupRef.current.scale, {
        x: fit.scale * 0.65,
        y: fit.scale * 0.65,
        z: fit.scale * 0.65,
        scrollTrigger: {
          trigger: ".plants-section",
          start: "top bottom",
          end: "top center",
          scrub: 1.2,
        },
      });
      
      gsap.to(groupRef.current.rotation, {
        y: Math.PI * 2.0, // Face exactly front for the perfect battery posture
        x: 0.1,
        scrollTrigger: {
          trigger: ".plants-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      // 4. Scroll to Footer: Gravity drop and Interactive Pile
      gsap.to(animState.current, {
        gravityDrop: 1,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: ".site-footer",
          start: "top bottom",
          end: "bottom bottom",
          scrub: 1.2,
        },
      });

      gsap.to(groupRef.current.position, {
        x: 0,
        y: 0.8,
        scrollTrigger: {
          trigger: ".site-footer",
          start: "top bottom",
          end: "bottom bottom",
          scrub: 1.2,
        },
      });

      gsap.to(groupRef.current.scale, {
        x: fit.scale * 2.0,
        y: fit.scale * 2.0,
        z: fit.scale * 2.0,
        scrollTrigger: {
          trigger: ".site-footer",
          start: "top bottom",
          end: "bottom bottom",
          scrub: 1.2,
        },
      });

      gsap.to(groupRef.current.rotation, {
        y: Math.PI * 4.2,
        x: 0.2,
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
    <group ref={groupRef} scale={fit.scale} position={[0, 0.04, 0]} rotation={[0.04, -0.34, 0]}>
      <group ref={modelRef}>
        <primitive object={model} position={[-fit.center.x, -fit.center.y, -fit.center.z]} />
        <lineSegments frustumCulled={false} position={[-fit.center.x, -fit.center.y, -fit.center.z]} geometry={explosionLinesGeometry}>
          <primitive object={linesMaterial} ref={linesMaterialRef} attach="material" />
        </lineSegments>
      </group>
    </group>
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
        <ambientLight intensity={0.62} />
        <hemisphereLight args={["#fff2d7", "#160806", 1.22]} />
        <directionalLight position={[3.5, 4.5, 4]} intensity={3.3} color="#fff5e2" />
        <pointLight position={[-3.8, 1.6, 3.2]} intensity={14} color="#c46d32" />
        <pointLight position={[3.2, -2.4, 2.8]} intensity={20} color="#dfb65a" />
        <Suspense fallback={null}>
          <BatteryModel />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
