"use client";

import { useState, useEffect } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = ["Home", "About Us", "Products", "Import", "News", "Gallery", "Contact"];

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#">
          <span>AADISHAKTI</span>
          <small>Lead recycling and non-ferrous metals</small>
        </a>

        {/* Desktop Navigation */}
        <nav className="nav-links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item} href="#">
              {item}
            </a>
          ))}
        </nav>

        {/* Desktop Action */}
        <a className="enquiry-button" href="#">
          Enquiry
        </a>

        {/* Hamburger Icon */}
        <button
          className={`hamburger-menu ${isOpen ? "is-active" : ""}`}
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
          type="button"
        >
          <span className="hamburger-box">
            <span className="hamburger-inner"></span>
          </span>
        </button>
      </header>

      {/* Mobile & Tablet Navigation Overlay */}
      <div className={`mobile-nav-overlay ${isOpen ? "is-visible" : ""}`} onClick={toggleMenu}>
        <div className="mobile-nav-content" onClick={(e) => e.stopPropagation()}>
          <nav className="mobile-nav-links" aria-label="Mobile navigation">
            {navItems.map((item, idx) => (
              <a
                key={item}
                href="#"
                onClick={toggleMenu}
                style={{ transitionDelay: `${idx * 50}ms` }}
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="mobile-nav-footer">
            <a className="mobile-enquiry-button" href="#" onClick={toggleMenu}>
              Enquiry
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
