import React from "react";
import { FileText, Building2, Scale, Briefcase } from "lucide-react";
import Header from "./Header";

export default function LandingPage({ onSelectTool }) {
  const tools = [
    {
      id: "corporate",
      title: "CORPORATE AOI",
      description: "Amended Articles of Incorporation drafting tailored for STLAF matters. Features AI-powered extraction.",
      icon: <Building2 className="w-8 h-8 text-[var(--gold)]" />,
      active: true
    },
    {
      id: "partnership",
      title: "PARTNERSHIP AOP",
      description: "Drafting tool for Partnership businesses. Standard SEC compliant documentation.",
      icon: <Briefcase className="w-8 h-8 text-[var(--gold)]" />,
      active: true
    }
  ];

  return (
    <div className="landing-wrapper">
      <Header onHome={() => {}} />

      {/* Hero Section */}
      <main className="landing-main">
        <div className="hero-branding">
          <img 
            src="/static/logo.png" 
            className="hero-logo-img" 
            alt="STLAF DRAFTING" 
            onError={(e) => e.target.src = 'https://via.placeholder.com/400x150?text=STLAF+DRAFTING'}
          />
        </div>

        {/* Tools Grid */}
        <div className="tools-grid">
          {tools.map((tool) => (
            <div 
              key={tool.id} 
              className={`tool-card ${!tool.active ? 'disabled' : ''}`}
              onClick={() => tool.active && onSelectTool(tool.id)}
            >
              <div className="tool-icon-circle">
                {tool.icon}
              </div>
              <h3 className="tool-title">{tool.title}</h3>
              <p className="tool-description">{tool.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
