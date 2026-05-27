"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,          // How long the smooth scroll takes (higher = smoother)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential easing
      orientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.5,   // Smooth on mobile too
    });

    lenisRef.current = lenis;

    // Sync Lenis with GSAP ScrollTrigger
    async function connectGSAP() {
      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");
      const gsap = gsapModule.gsap;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;

      gsap.registerPlugin(ScrollTrigger);

      // Tell Lenis to update ScrollTrigger on every scroll event
      lenis.on("scroll", ScrollTrigger.update);

      // Tell GSAP to call lenis.raf on every tick
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      // Disable Lenis's own internal RAF since GSAP is driving it
      gsap.ticker.lagSmoothing(0);
    }

    connectGSAP();

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
