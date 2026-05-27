// Trigger Next.js compilation refresh
import Header from "@/components/Header";
import ModelViewer from "@/components/ModelViewer";
import FoundersRail from "@/components/FoundersRail";
import VisionMission from "@/components/VisionMission";
import PlantsGroup from "@/components/PlantsGroup";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";

const navItems = ["Home", "About Us", "Products", "Import", "News", "Gallery", "Contact"];

const content = [
  "Aadishakti Group is an Indian industrial group focused on lead recycling and non-ferrous metal manufacturing for domestic and international markets.",
  "Through its Mundra and Roorkee operations, the group combines advanced metallurgy, environmental compliance, and global quality standards.",
  "With 70,000 MT annual capacity expanding to 120,000 MT, Aadishakti is building one of India\u2019s strongest sustainable metal recycling ecosystems.",
];

const highlights = ["70,000 MT capacity", "120,000 MT target", "\u20b91200 Cr projected"];

const stats = [
  { value: "70K+", label: "MTPA" },
  { value: "\u20b91200Cr", label: "Revenue" },
  { value: "30+", label: "Countries" },
  { value: "03", label: "Plants" },
  { value: "120K", label: "Target" },
];

export default function Home() {
  return (
    <SmoothScroll>
    <main className="home-page hero-landing">
      <div className="hero-opening" aria-hidden="true">
        <span className="hero-opening-panel hero-opening-panel-left" />
        <span className="hero-opening-panel hero-opening-panel-right" />
        <div className="hero-opening-brand">
          <span>AADISHAKTI</span>
          <small>Lead recycling / Non-ferrous metals</small>
          <i />
        </div>
      </div>

      <Header />

      <div className="ember-field" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="stack-layer" style={{ zIndex: 1, backgroundColor: "transparent" }}>
        <section className="hero-section" aria-label="Aadishakti Group homepage">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow-enter">Aadishakti Group</p>
            <h1 className="hero-headline">
              <span className="hero-headline-mask">
                <span className="headline-line hero-headline-line">Lead recycling</span>
              </span>
              <span className="hero-headline-mask">
                <span className="headline-line accent hero-headline-line hero-headline-accent">
                  at industrial scale.
                </span>
              </span>
              <span className="hero-headline-rule" aria-hidden="true" />
            </h1>

            <div className="hero-content">
              {content.map((paragraph, index) => (
                <p className="hero-body-enter" style={{ "--hero-line": index }} key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="hero-highlights hero-detail-enter" aria-label="Company highlights">
              {highlights.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <div className="hero-actions hero-actions-enter">
              <a className="primary-action" href="#">
                Explore Products
              </a>
              <a className="secondary-action" href="#">
                Contact Us
              </a>
            </div>
          </div>

          <div id="model-interaction-zone" className="model-stage" aria-label="Draggable Aadishakti battery model">
            {/* Interaction zone wrapper */}
          </div>
        </section>
      </div>

      <div className="stack-layer" style={{ zIndex: 2, backgroundColor: "transparent" }}>
        <section className="stats-strip" aria-label="Aadishakti Group statistics">
          {stats.map((stat) => (
            <div className="stats-item" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>
      </div>

      <div className="stack-layer" style={{ zIndex: 3, backgroundColor: "transparent" }}>
        <FoundersRail />
      </div>

      <div className="stack-layer" style={{ zIndex: 4, backgroundColor: "transparent" }}>
        <VisionMission />
      </div>

      <div className="stack-layer" style={{ zIndex: 5, backgroundColor: "transparent" }}>
        <PlantsGroup />
      </div>

      <div className="stack-layer" style={{ zIndex: 6, position: "relative", backgroundColor: "transparent" }}>
        <Footer />
      </div>
      
      {/* Absolute positioned model viewer in background */}
      <div className="fixed inset-0 z-0 pointer-events-none hero-model-enter" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <ModelViewer />
      </div>
    </main>
    </SmoothScroll>
  );
}
