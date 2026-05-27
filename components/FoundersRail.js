"use client";

import { useEffect, useRef } from "react";

const founders = [
  {
    name: "Mr. Amit Goyal",
    role: "Co-Founder & Director",
    image: "/assets/founders/founder-amit-goyal.jpg",
    note: "Strategic growth, operations and market expansion.",
  },
  {
    name: "Mr. Anil Goel",
    role: "Co-Founder & Director",
    image: "/assets/founders/founder-anil-goel.jpg",
    note: "Manufacturing leadership and plant execution.",
  },
  {
    name: "Rakesh Shah",
    role: "Metallurgy Advisor",
    image: "/assets/founders/founder-rakesh-shah.jpg",
    note: "Process quality, refining systems and alloy standards.",
  },
  {
    name: "Mehul Patel",
    role: "Operations Lead",
    image: "/assets/founders/founder-mehul-patel.jpg",
    note: "Production planning, compliance and supply chain.",
  },
  {
    name: "Kiran Mehta",
    role: "Finance & Growth",
    image: "/assets/founders/founder-kiran-mehta.jpg",
    note: "Expansion planning, investments and commercial strategy.",
  },
  {
    name: "Nisha Rao",
    role: "Sustainability Lead",
    image: "/assets/founders/founder-nisha-rao.jpg",
    note: "Environmental systems and recycling impact programs.",
  },
];

export default function FoundersRail() {
  const shellRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    let ctx;

    async function setup() {
      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");
      const gsap = gsapModule.gsap;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const shell = shellRef.current;
        const track = trackRef.current;
        if (!shell || !track) return;

        const distance = () => Math.max(0, track.scrollWidth - shell.clientWidth);

        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: shell,
            pin: true,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        gsap.fromTo(
          ".founder-card",
          { y: 58, opacity: 0.45 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: shell,
              start: "top 78%",
              end: "top 20%",
              scrub: 1,
            },
          }
        );
      }, shellRef);
    }

    setup();

    return () => {
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <section
      className="founder-scroll-shell"
      ref={shellRef}
      aria-label="Founder profiles"
      style={{
        position: "relative",
        zIndex: 2,
        minHeight: "100vh",
        overflow: "hidden",
        padding: "clamp(74px, 9vh, 104px) 0 clamp(66px, 8vh, 92px)",
        borderBottom: 0,
        background: "transparent",
      }}
    >
      <div
        className="founder-heading"
        style={{
          width: "min(1480px, calc(100% - clamp(48px, 11.6vw, 216px)))",
          margin: "0 auto 42px",
        }}
      >
        <p
          className="section-kicker"
          style={{
            margin: "0 0 18px",
            color: "var(--red)",
            fontFamily: "var(--font-display), system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
          }}
        >
          Leadership
        </p>
        <h2
          style={{
            margin: 0,
            color: "#f6f1eb",
            fontFamily: "var(--font-display), system-ui, sans-serif",
            fontSize: "clamp(42px, 4.6vw, 78px)",
            fontWeight: 800,
            lineHeight: 0.98,
          }}
        >
          Our Founders
        </h2>
      </div>

      <div className="founder-window" style={{ overflow: "hidden", width: "100%" }}>
        <div
          className="founder-track"
          ref={trackRef}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: "clamp(22px, 2.2vw, 34px)",
            width: "max-content",
            padding: "0 clamp(24px, 5.8vw, 108px)",
            willChange: "transform",
          }}
        >
          {founders.map((founder, index) => (
            <article
              className="founder-card"
              key={founder.name}
              onMouseEnter={(event) => {
                const info = event.currentTarget.querySelector(".founder-info");
                const image = event.currentTarget.querySelector("img");
                if (info) info.style.transform = "translateY(0)";
                if (image) image.style.transform = "scale(1.04)";
              }}
              onMouseLeave={(event) => {
                const info = event.currentTarget.querySelector(".founder-info");
                const image = event.currentTarget.querySelector("img");
                if (info) info.style.transform = "translateY(100%)";
                if (image) image.style.transform = "scale(1)";
              }}
              style={{
                position: "relative",
                width: "clamp(260px, 24vw, 372px)",
                height: "clamp(360px, 42vh, 520px)",
                flex: "0 0 auto",
                marginTop: index % 2 === 0 ? 0 : "clamp(28px, 6vh, 74px)",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 8,
                background: "#111",
                boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
              }}
            >
              <img
                src={founder.image}
                alt={founder.name}
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "saturate(0.9) contrast(1.05)",
                  transition: "transform 480ms ease, filter 480ms ease",
                }}
              />
              <div
                className="founder-info"
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  minHeight: "46%",
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  background:
                    "linear-gradient(180deg, rgba(5,5,6,0.04), rgba(5,5,6,0.72) 24%, rgba(5,5,6,0.94)), linear-gradient(135deg, rgba(255,51,43,0.16), rgba(223,182,90,0.1))",
                  backdropFilter: "blur(14px)",
                  transform: "translateY(100%)",
                  transition: "transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                }}
              >
                <span
                  style={{
                    color: "var(--gold)",
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {founder.role}
                </span>
                <h3
                  style={{
                    margin: "10px 0 0",
                    color: "#fff",
                    fontFamily: "var(--font-display), system-ui, sans-serif",
                    fontSize: "clamp(24px, 2vw, 34px)",
                    fontWeight: 800,
                  }}
                >
                  {founder.name}
                </h3>
                <p
                  style={{
                    maxWidth: "28ch",
                    margin: "12px 0 0",
                    color: "rgba(246,241,235,0.72)",
                    fontSize: 14,
                    fontWeight: 650,
                    lineHeight: 1.55,
                  }}
                >
                  {founder.note}
                </p>
              </div>
            </article>
          ))}
          <div aria-hidden="true" style={{ width: "60vw", flex: "0 0 auto" }} />
        </div>
      </div>
    </section>
  );
}
