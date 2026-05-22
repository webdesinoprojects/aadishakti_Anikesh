"use client";

import Link from "next/link";

export default function Footer() {
  const quickLinks = [
    { label: "About Us", href: "#" },
    { label: "Products", href: "#" },
    { label: "Investor's Corner", href: "#" },
    { label: "Import", href: "#" },
    { label: "News", href: "#" },
    { label: "Gallery", href: "#" },
    { label: "Career", href: "#" },
  ];

  const productLinks = [
    { label: "Pure Lead", href: "#" },
    { label: "Lead Alloys", href: "#" },
    { label: "Red Lead Oxide", href: "#" },
    { label: "Grey Lead Oxide", href: "#" },
  ];

  const plantLinks = [
    { label: "AMRPL - Roorkee", href: "#" },
    { label: "AGRPL - Mundra", href: "#" },
    { label: "New Mundra Facility", href: "#", isNew: true },
  ];

  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="footer-cta-container">
        <div className="footer-cta-card">
          <div className="footer-cta-content">
            <h3>Ready to Partner With Us?</h3>
            <p>Bulk orders, custom specs, competitive pricing.</p>
          </div>
          <a href="#" className="footer-cta-button">
            Contact Us <span className="arrow">→</span>
          </a>
        </div>
      </div>

      <div className="footer-main-grid">
        {/* Brand & Address Column */}
        <div className="footer-column brand-column">
          <div className="footer-brand">
            <span className="brand-name">AADISHAKTI</span>
            <small className="brand-tagline">Forging The Future Of Lead Recycling</small>
          </div>
          <address className="footer-address">
            <span className="address-label">Corporate Office:</span>
            <p className="address-text">
              30, Third Floor, Shivaji Marg,<br />
              Moti Nagar, New Delhi - 110015
            </p>
            <p className="phone-text">
              <a href="tel:+918743000299">+91-8743000299</a>
            </p>
            <p className="email-text">
              <a href="mailto:info@aadishakti.com">info@aadishakti.com</a>
            </p>
          </address>
        </div>

        {/* Quick Links Column */}
        <div className="footer-column">
          <h4>Quick Links</h4>
          <nav aria-label="Quick links navigation">
            <ul>
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Products Column */}
        <div className="footer-column">
          <h4>Products</h4>
          <nav aria-label="Products navigation">
            <ul>
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Plants Column */}
        <div className="footer-column">
          <h4>Plants</h4>
          <nav aria-label="Plants navigation">
            <ul>
              {plantLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={link.isNew ? "highlight-link" : ""}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Sales Enquiry Column */}
        <div className="footer-column enquiry-column">
          <h4>Sales Enquiry</h4>
          <div className="enquiry-group">
            <span className="enquiry-label">Lead & Oxides</span>
            <p className="enquiry-contact">
              Mr. Gourav Sharma | <a href="tel:+918743000799">+91-8743000799</a>
            </p>
          </div>
          <div className="enquiry-group">
            <span className="enquiry-label">Import Enquiry</span>
            <p className="enquiry-contact">
              Mr. Rajesh Mehta | <a href="tel:+919045585676">+91-9045585676</a>
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="divider-line" />
        <div className="footer-bottom-content">
          <div className="footer-bottom-left">
            <span className="iso-certification">
              ISO 9001:2015 | ISO 14001:2015 | ISO 45001:2018
            </span>
            <span className="copyright">
              © {new Date().getFullYear()} Aadishakti Group. All Rights Reserved.
            </span>
          </div>
          <div className="footer-bottom-right">
            <a href="#">Privacy Policy</a>
            <span className="separator">|</span>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
