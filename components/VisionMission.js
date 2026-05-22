"use client";

import { useEffect, useRef } from "react";

const cards = [
  {
    label: "Vision",
    tone: "red",
    lines: [
      "To continuously innovate through advanced",
      "technology, maintain quality standards aligned",
      "with international benchmarks, and contribute",
      "to sustainable manufacturing.",
    ],
  },
  {
    label: "Mission",
    tone: "gold",
    lines: [
      "To create long-term value for employees,",
      "customers and stakeholders by delivering",
      "uncompromised quality, operational excellence,",
      "and customer satisfaction.",
    ],
  },
];

export default function VisionMission() {
  const sectionRef = useRef(null);

  useEffect(() => {
    let ctx;

    async function setup() {
      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");
      const gsap = gsapModule.gsap;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.fromTo(
          ".vm-card",
          { y: 54, opacity: 0, filter: "blur(12px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1,
            stagger: 0.14,
            ease: "power4.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 78%",
            },
          }
        );

        gsap.fromTo(
          ".vm-mask span",
          { yPercent: 115, rotateX: -18 },
          {
            yPercent: 0,
            rotateX: 0,
            duration: 0.9,
            stagger: 0.045,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 72%",
            },
          }
        );
      }, sectionRef);
    }

    setup();

    return () => {
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <section className="vision-mission-section" ref={sectionRef} aria-label="Vision and mission">
      {cards.map((card) => (
        <article className={`vm-card vm-card-${card.tone}`} key={card.label}>
          <div className="vm-accent" />
          <div>
            <p>{card.label}</p>
            <div className="vm-copy">
              {card.lines.map((line) => (
                <span className="vm-mask" key={line}>
                  <span>{line}</span>
                </span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
