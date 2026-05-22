// Trigger Next.js compilation refresh
import Header from "@/components/Header";
import ModelViewer from "@/components/ModelViewer";
import FoundersRail from "@/components/FoundersRail";
import VisionMission from "@/components/VisionMission";
import PlantsGroup from "@/components/PlantsGroup";
import Footer from "@/components/Footer";

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
    <main className="home-page">
      <Header />

      <div className="ember-field" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <section className="hero-section" aria-label="Aadishakti Group homepage">
        <div className="hero-copy">
          <p className="eyebrow">Aadishakti Group</p>
          <h1>
            <span className="headline-line">Lead recycling</span>
            <span className="headline-line accent">at industrial scale.</span>
          </h1>

          <div className="hero-content">
            {content.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="hero-highlights" aria-label="Company highlights">
            {highlights.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <div className="hero-actions">
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

      <section className="stats-strip" aria-label="Aadishakti Group statistics">
        {stats.map((stat) => (
          <div className="stats-item" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <FoundersRail />
      <VisionMission />
      <PlantsGroup />
      <Footer />
      
      {/* Absolute positioned model viewer in background */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <ModelViewer />
      </div>
    </main>
  );
}
