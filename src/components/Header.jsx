import React from "react";
import { Home } from "lucide-react";
import headerLogo from "../assets/header.png";

export default function Header({ showHomeButton, onHome, type = 'CORPORATE' }) {
  return (
    <header className="landing-header">
      <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo-section-wrapper">
          <img 
            src={headerLogo} 
            className="header-logo-img" 
            alt="Logo" 
            onError={(e) => e.target.style.display = 'none'} 
          />
          <div className="logo-section" style={{ cursor: 'pointer' }} onClick={onHome}>
            <span className="brand-name">STLAF | <span className="brand-accent">{type.toUpperCase()}</span></span>
            <span className="firm-subtitle">SADSAD TAMESIS LEGAL AND ACCOUNTANCY FIRM</span>
          </div>
        </div>

        {showHomeButton && (
          <button className="home-button" onClick={onHome} title="Back to Home">
            <Home size={18} />
            <span>HOME</span>
          </button>
        )}
      </div>
    </header>
  );
}
