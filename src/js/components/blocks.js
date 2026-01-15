// src/js/components/blocks.js

/** 1. Sectie Wrapper (Grijze of Witte achtergrond) */
export const BlockPurposeSection = (content, bgColor = "white") => `
    <section style="padding: 4rem 1rem; background-color: ${bgColor === "grey" ? "#f9f9f9" : "white"};">
        <div style="max-width: 1100px; margin: 0 auto;">
            ${content}
        </div>
    </section>
`;

/** 2. Sectie Header (Titel & Subtitel) */
export const SectionHeader = ({ badge, title, subtitle }) => `
    <div style="text-align: center; margin-bottom: 3rem;">
        ${badge ? `<span class="badge" style="background:var(--brand-bg); color:var(--primary); margin-bottom:1rem; display:inline-block;">${badge}</span>` : ""}
        <h2 style="font-size: 2.5rem; margin-bottom: 0.5rem;">${title}</h2>
        ${subtitle ? `<p style="color: var(--text-muted); max-width: 600px; margin: 0 auto;">${subtitle}</p>` : ""}
    </div>
`;

/** 3. Icon Box (Icoon in cirkel) */
export const IconBox = (iconClass) => `
    <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--brand-bg); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
        <i class="${iconClass}"></i>
    </div>
`;

/** 4. Feature Item (Icoon + Tekst) */
export const FeatureItem = ({ icon, title, description }) => `
    <div style="text-align: left;">
        ${IconBox(icon)}
        <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">${title}</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem;">${description}</p>
    </div>
`;

/** 5. Service Card (Behandeling Kaart) */
export const ServiceCard = ({ image, title, price, duration, link }) => `
    <a href="${link}" class="card service-card" style="padding: 0; overflow: hidden; text-decoration: none; color: inherit; display: block; transition: transform 0.2s;">
        <div style="height: 200px; background: #eee; position: relative;">
            ${image ? `<img src="${image}" style="width: 100%; height: 100%; object-fit: cover;">` : ""}
            <span style="position: absolute; bottom: 10px; right: 10px; background: white; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 0.85rem; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                €${price}
            </span>
        </div>
        <div style="padding: 1.5rem;">
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 5px;">
                <i class="far fa-clock"></i> ${duration} min
            </div>
            <h3 style="margin: 0; font-size: 1.2rem;">${title}</h3>
        </div>
    </a>
`;

/** 6. Image With Overlay (Hero) */
export const ImageWithOverlay = ({
  image,
  title,
  subtitle,
  ctaText,
  ctaLink,
}) => `
    <div class="hero" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${image}'); background-size: cover; background-position: center; color: white; padding: 8rem 1rem;">
        <div class="hero-inner">
            <h1 class="hero-title" style="color: white; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">${title}</h1>
            <p class="hero-subtitle" style="color: rgba(255,255,255,0.9); font-size: 1.2rem;">${subtitle}</p>
            <div class="hero-actions">
                <a href="${ctaLink}" class="btn-primary" style="border: none;">${ctaText}</a>
            </div>
        </div>
    </div>
`;

/** 7. Grid (Responsive Wrapper) */
export const GridResponsive = (content, columns = 3) => `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
        ${content}
    </div>
`;

/** 8. Contact Item */
export const ContactItem = (icon, text) => `
    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 1rem;">
        ${IconBox(icon)}
        <span style="font-weight: 500;">${text}</span>
    </div>
`;
