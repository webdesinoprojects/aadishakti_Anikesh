"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const plantSections = [
  {
    key: "roorkee",
    eyebrow: "Roorkee",
    title: "Aadishakti Metal Recycling Pvt. Ltd. (AMRPL)",
    subtitle: "Domestic recycling backbone",
    body:
      "AMRPL is the group's first manufacturing unit, acquired in 2014 and renamed in 2023. The facility primarily serves the domestic Indian market and plays a critical role in the group's domestic supply chain and recycling ecosystem.",
    images: [
      { src: "/assets/plants/roorkee-facility.jpeg", label: "Roorkee facility", size: "large" },
      { src: "/assets/plants/roorkee-yard.jpeg", label: "Material yard", size: "tall" },
      { src: "/assets/plants/roorkee-office-01.jpeg", label: "Office view", size: "" },
      { src: "/assets/plants/roorkee-office-02.jpeg", label: "Roorkee operations", size: "wide" },
    ],
  },
  {
    key: "mundra",
    eyebrow: "Mundra",
    title: "Aadishakti Green Recycling Pvt. Ltd. (AGRPL)",
    subtitle: "Flagship smelting facility",
    body:
      "AGRPL is the flagship company of the Aadishakti Group, focused on large-scale lead smelting and metallurgical processing with a strong export orientation. Started in 2023, AGRPL has made a significant presence in the industry within a short period of time.",
    extra:
      "A new world-class facility at Mundra, scheduled for completion in April 2026, will enhance production capacity and incorporate cutting-edge smelting technologies and advanced process systems.",
    images: [
      { src: "/assets/plants/mundra-exterior.jpeg", label: "Mundra exterior", size: "large" },
      { src: "/assets/plants/mundra-smelting-line.webp", label: "Smelting line", size: "tall" },
      { src: "/assets/plants/mundra-rotary-furnace.webp", label: "Rotary furnace", size: "" },
      { src: "/assets/plants/mundra-lead-ingots.webp", label: "Lead ingots", size: "wide" },
    ],
  },
];

const bentoPositions = [
  { gridColumn: "1 / 2", gridRow: "1 / 3" },
  { gridColumn: "2 / 4", gridRow: "1 / 2" },
  { gridColumn: "2 / 3", gridRow: "2 / 3" },
  { gridColumn: "3 / 4", gridRow: "2 / 3" },
];

function AnimatedPlantTitle({ title }) {
  const words = title.split(" ");

  return (
    <h3 className="plant-title" aria-label={title}>
      {words.map((word, wordIndex) => (
        <span className="plant-title-word" aria-hidden="true" key={`${word}-${wordIndex}`}>
          {Array.from(word).map((character, characterIndex) => (
            <span className="plant-title-char" key={`${character}-${characterIndex}`}>
              {character}
            </span>
          ))}
          {wordIndex < words.length - 1 ? " " : null}
        </span>
      ))}
      <span className="plant-title-scan" aria-hidden="true" />
    </h3>
  );
}

export default function PlantsGroup() {
  const sectionRef = useRef(null);
  const [activeImage, setActiveImage] = useState(null);
  const canUsePortal = typeof document !== "undefined";

  useEffect(() => {
    let ctx;

    async function setup() {
      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");
      const gsap = gsapModule.gsap;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          gsap.timeline({
            scrollTrigger: {
              trigger: ".plants-heading",
              start: "top 80%",
              toggleActions: "restart none restart none",
            },
          })
            .fromTo(
              ".plants-heading .section-kicker",
              { autoAlpha: 0, y: 14 },
              { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" }
            )
            .fromTo(
              ".plant-heading-echo",
              {
                autoAlpha: 0,
                clipPath: "inset(0 0 100% 0)",
                scaleY: 1.54,
                transformOrigin: "left bottom",
              },
              {
                autoAlpha: 1,
                clipPath: "inset(0 0 0% 0)",
                scaleY: 1,
                duration: 0.76,
                stagger: 0.12,
                ease: "power3.out",
              },
              "-=0.12"
            )
            .fromTo(
              ".plant-heading-line",
              {
                autoAlpha: 0,
                clipPath: "inset(0 0 100% 0)",
                scaleY: 1.38,
                filter: "blur(4px)",
                letterSpacing: "0.035em",
                transformOrigin: "left bottom",
              },
              {
                autoAlpha: 1,
                clipPath: "inset(0 0 0% 0)",
                scaleY: 1,
                filter: "blur(0px)",
                letterSpacing: "0em",
                duration: 0.92,
                stagger: 0.14,
                ease: "power4.out",
              },
              "-=0.46"
            )
            .to(
              ".plant-heading-echo",
              { autoAlpha: 0, duration: 0.38, stagger: 0.08, ease: "power2.out" },
              "-=0.3"
            )
            .fromTo(
              ".plant-heading-accent",
              { autoAlpha: 0, scaleX: 0 },
              { autoAlpha: 1, scaleX: 1, duration: 0.8, ease: "power3.out" },
              "-=0.42"
            );

          gsap.utils.toArray(".plant-title").forEach((title) => {
            const characters = title.querySelectorAll(".plant-title-char");
            const scan = title.querySelector(".plant-title-scan");

            gsap.timeline({
              scrollTrigger: {
                trigger: title,
                start: "top 84%",
                toggleActions: "restart none restart none",
              },
            })
              .fromTo(
                characters,
                { autoAlpha: 0, y: 22, filter: "blur(5px)", color: "rgba(223, 182, 90, 0.94)" },
                {
                  autoAlpha: 1,
                  y: 0,
                  filter: "blur(0px)",
                  color: "#f7f1ed",
                  duration: 0.25,
                  stagger: { each: 0.016, from: "random" },
                  ease: "power2.out",
                }
              )
              .fromTo(
                scan,
                { autoAlpha: 0, scaleX: 0 },
                { autoAlpha: 1, scaleX: 1, duration: 0.48, ease: "power3.out" },
                "-=0.24"
              );
          });
        }

        gsap.utils.toArray(".plant-flow-path").forEach((path) => {
          const length = path.getTotalLength();
          gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
          gsap.to(path, {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: path.closest(".plant-full-panel"),
              start: "top 72%",
              end: "bottom 46%",
              scrub: 1,
            },
          });
        });

        gsap.fromTo(
          ".plant-panel-card",
          { y: 52, opacity: 0, clipPath: "inset(12% 0 0 0 round 18px)" },
          {
            y: 0,
            opacity: 1,
            clipPath: "inset(0% 0 0 0 round 18px)",
            duration: 0.9,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              toggleActions: "restart none restart none",
            },
          }
        );

        // Staggered bento image entrance — each tile flies in from a unique direction
        gsap.utils.toArray(".plant-image-grid").forEach((grid) => {
          const tiles = grid.querySelectorAll(".plant-image-tile");
          
          // Different entrance directions for each tile position
          const entrances = [
            { x: -80, y: 60, rotation: -3 },   // Tile 1: from bottom-left
            { x: 60, y: -50, rotation: 2 },     // Tile 2: from top-right
            { x: -40, y: 80, rotation: -2 },    // Tile 3: from bottom-left
            { x: 80, y: 60, rotation: 3 },      // Tile 4: from bottom-right
          ];

          tiles.forEach((tile, i) => {
            const entrance = entrances[i] || entrances[0];
            
            gsap.fromTo(tile,
              {
                x: entrance.x,
                y: entrance.y,
                rotation: entrance.rotation,
                scale: 0.85,
                opacity: 0,
                filter: "blur(8px)",
              },
              {
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                opacity: 1,
                filter: "blur(0px)",
                duration: 1.2,
                delay: i * 0.15,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: grid,
                  start: "top 80%",
                  toggleActions: "restart none restart none",
                },
              }
            );
          });

          // Parallax zoom — images slowly scale up as you scroll past
          tiles.forEach((tile, i) => {
            const img = tile.querySelector(".plant-image-main");
            if (!img) return;
            
            gsap.to(img, {
              scale: 1.12 + (i * 0.03),
              ease: "none",
              scrollTrigger: {
                trigger: tile,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.5,
              },
            });
          });
        });
      }, sectionRef);
    }

    setup();

    return () => {
      if (ctx) ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (!activeImage) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setActiveImage(null);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [activeImage]);

  return (
    <section className="plants-section" ref={sectionRef} aria-label="Plants and group companies">
      <div className="plants-heading">
        <p className="section-kicker">Plants / Group</p>
        <h2>
          <span className="plant-heading-mask">
            <span className="plant-heading-line plant-heading-primary">Two operating hubs.</span>
            <span className="plant-heading-echo" aria-hidden="true">Two operating hubs.</span>
          </span>
          <span className="plant-heading-mask">
            <span className="plant-heading-line plant-heading-secondary">One recycling ecosystem.</span>
            <span className="plant-heading-echo plant-heading-echo-secondary" aria-hidden="true">
              One recycling ecosystem.
            </span>
          </span>
          <span className="plant-heading-accent" aria-hidden="true" />
        </h2>
      </div>

      {plantSections.map((plant, index) => (
        <article className={`plant-full-panel ${plant.key}-panel`} key={plant.key}>
          <svg className="plants-flow" viewBox="0 0 1200 520" fill="none" aria-hidden="true">
            <path
              className="plant-flow-path"
              d={
                index === 0
                  ? "M42 338 C 220 176, 361 428, 518 248 S 792 94, 945 224 S 1110 418, 1160 176"
                  : "M42 170 C 226 386, 384 128, 558 276 S 812 424, 966 248 S 1112 112, 1160 320"
              }
            />
          </svg>

          <div className="plant-panel-grid">
            <div
              className="plant-panel-card plant-copy-panel"
              style={{
                background: "transparent",
                border: 0,
                borderRadius: 0,
                boxShadow: "none",
              }}
            >
              <span>{plant.eyebrow}</span>
              <AnimatedPlantTitle title={plant.title} />
              <small>{plant.subtitle}</small>
              <p>{plant.body}</p>
              {plant.extra && <p>{plant.extra}</p>}
            </div>

            <div
              className="plant-panel-card plant-gallery-panel"
              style={{
                background: "transparent",
                border: 0,
                borderRadius: 0,
                boxShadow: "none",
                padding: 0,
              }}
            >
              <div
                className="plant-image-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(164px, 0.72fr) minmax(262px, 1.08fr) minmax(164px, 0.72fr)",
                  gridTemplateRows: "repeat(2, minmax(214px, 1fr))",
                  gap: "clamp(16px, 1.1vw, 22px)",
                }}
              >
                {plant.images.map((image, imageIndex) => (
                  <figure className="plant-image-tile" style={bentoPositions[imageIndex]} key={image.src}>
                    <button
                      className="plant-image-button"
                      type="button"
                      aria-label={`Open ${image.label}`}
                      onClick={() => setActiveImage(image)}
                    >
                      <img className="plant-image-backdrop" src={image.src} alt="" aria-hidden="true" />
                      <img className="plant-image-main" src={image.src} alt={image.label} />
                      <span className="plant-image-caption">{image.label}</span>
                    </button>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </article>
      ))}

      {activeImage && canUsePortal && createPortal(
        <div className="plant-lightbox" role="dialog" aria-modal="true" onClick={() => setActiveImage(null)}>
          <button className="plant-lightbox-close" type="button" onClick={() => setActiveImage(null)}>
            Close
          </button>
          <div className="plant-lightbox-frame" onClick={(event) => event.stopPropagation()}>
            <img src={activeImage.src} alt={activeImage.label} />
            <p>{activeImage.label}</p>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
