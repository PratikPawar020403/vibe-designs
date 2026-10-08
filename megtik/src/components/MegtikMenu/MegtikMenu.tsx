import React from 'react';
import FlipCard from '../FlipCard/FlipCard';
import { MENU_CARDS, MenuCardConfig } from './menuData';
import './MegtikMenu.css';

export const MegtikMenu: React.FC = () => {
  return (
    <section id="menu" className="megtik-menu-section" aria-label="MEGTIK Café Menu">
      {/* Editorial Section Header */}
      <header className="menu-header-block">
        <span className="menu-section-label">02 — MENU</span>
        <h2 className="menu-section-title">THE MEGTIK MENU</h2>
        <p className="menu-section-subtitle">A few things worth slowing down for.</p>
      </header>

      {/* Three-Card Art-Directed Horizontal Row */}
      <div className="menu-cards-row">
        {MENU_CARDS.map((card: MenuCardConfig, idx: number) => {
          const isTaupe = card.theme === 'taupe';

          return (
            <div
              key={card.id}
              className="menu-card-wrapper"
              style={{
                transform: `translateY(${card.offsetY}px) rotate(${card.rotationDeg}deg)`,
              }}
            >
              {/* Stacked Physical Back-Card Effect */}
              {card.hasStackedBacking && (
                <div
                  className={`card-stacked-backing back-${card.hasStackedBacking}`}
                  aria-hidden="true"
                />
              )}

              <FlipCard
                width={card.width}
                height={card.height}
                radius={20}
                axis="y"
                flipOnClick={true}
                draggable={true}
                tilt={true}
                tiltMax={8}
                glare={true}
                glareOpacity={0.08}
                hoverScale={1.025}
                perspective={1200}
                stiffness={180}
                damping={22}
                background="transparent"
                color={isTaupe ? '#f7f1e7' : '#3c3026'}
                shadow={true}
                shadowColor="#433122"
                shadowOpacity={isTaupe ? 0.26 : 0.14}
                ariaLabel={`MEGTIK Menu Card: ${card.title}`}
                front={
                  <div className={`menu-card-face theme-${card.theme}`}>
                    {/* Top Row: Brand & Edition */}
                    <div className="card-front-header">
                      <span className="card-brand-micro">MEGTIK</span>
                      <span className="card-edition-tag">{card.edition}</span>
                    </div>

                    {/* Title Block: "01 — \n COFFEE \n Bold flavors. Smooth moments." */}
                    <div className="card-front-title-block">
                      <span className="card-num-prefix">{card.number} —</span>
                      <h3 className="card-main-title">{card.title}</h3>
                      <p className="card-descriptor-text">{card.descriptor}</p>
                    </div>

                    {/* Image Area: Art-Directed Photograph with Botanical Accents */}
                    <div className="card-image-slot">
                      {/* Botanical Olive Leaf Accent on Left (Card 01) */}
                      {card.hasStackedBacking === 'left' && (
                        <svg
                          className="card-botanical-accent pos-left"
                          viewBox="0 0 40 70"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M35 65 C20 45, 10 30, 2 5"
                            stroke="#5a6848"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M24 50 C12 48, 8 40, 16 34 C24 38, 22 46, 24 50 Z"
                            fill="#6b7c56"
                            opacity="0.85"
                          />
                          <path
                            d="M14 32 C4 28, 4 18, 12 16 C18 22, 16 28, 14 32 Z"
                            fill="#7a8d62"
                            opacity="0.9"
                          />
                          <path
                            d="M4 10 C-1 4, 3 -1, 8 2 C10 6, 8 9, 4 10 Z"
                            fill="#647350"
                            opacity="0.85"
                          />
                        </svg>
                      )}

                      {/* Botanical Line Art on Taupe Card (Card 02) */}
                      {isTaupe && (
                        <svg
                          className="card-botanical-line"
                          viewBox="0 0 70 120"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M10 110 Q 40 60, 60 10"
                            stroke="#f7f1e7"
                            strokeWidth="0.8"
                            strokeDasharray="2 3"
                          />
                          <ellipse
                            cx="35"
                            cy="75"
                            rx="14"
                            ry="7"
                            transform="rotate(-25 35 75)"
                            stroke="#f7f1e7"
                            strokeWidth="0.8"
                          />
                          <ellipse
                            cx="50"
                            cy="40"
                            rx="12"
                            ry="6"
                            transform="rotate(20 50 40)"
                            stroke="#f7f1e7"
                            strokeWidth="0.8"
                          />
                        </svg>
                      )}

                      {/* Botanical Olive Leaf Accent on Right (Card 03) */}
                      {card.hasStackedBacking === 'right' && (
                        <svg
                          className="card-botanical-accent pos-right"
                          viewBox="0 0 40 70"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M5 65 C20 45, 30 30, 38 5"
                            stroke="#5a6848"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M16 50 C28 48, 32 40, 24 34 C16 38, 18 46, 16 50 Z"
                            fill="#6b7c56"
                            opacity="0.85"
                          />
                          <path
                            d="M26 32 C36 28, 36 18, 28 16 C22 22, 24 28, 26 32 Z"
                            fill="#7a8d62"
                            opacity="0.9"
                          />
                        </svg>
                      )}

                      {/* Actual Menu Food Photograph */}
                      <img
                        src={card.image}
                        alt={card.imageAlt}
                        className={`card-food-image shape-${card.imageShape}`}
                        loading={idx === 0 ? 'eager' : 'lazy'}
                      />
                    </div>

                    {/* Bottom Bar: Flip Cue & Circular Seal (NO product names on front) */}
                    <div className="card-front-bottom-bar">
                      <div className="card-flip-action">
                        <span>FLIP TO EXPLORE</span>
                        <span className="card-flip-arrow" aria-hidden="true">↗</span>
                      </div>
                      <div className="card-circular-seal" aria-hidden="true">
                        <span className="seal-dot" />
                      </div>
                    </div>
                  </div>
                }
                back={
                  <div className={`menu-card-face theme-${card.theme} menu-card-back`}>
                    <div className="card-back-header">
                      <h3 className="back-header-title">{card.number} — {card.title}</h3>
                      <span className="back-header-edition">{card.edition}</span>
                    </div>

                    <div className="card-back-items-list">
                      {card.backItems.map((item, i) => (
                        <div key={i} className="back-menu-item">
                          <div className="back-item-top">
                            <span className="back-item-name">{item.name}</span>
                            <span className="back-item-dots" aria-hidden="true" />
                            <span className="back-item-price">{item.price}</span>
                          </div>
                          <p className="back-item-desc">{item.description}</p>
                        </div>
                      ))}
                    </div>

                    <div className="card-back-footer">
                      <span className="back-footer-note">CRAFTED WITH INTENTION</span>
                      <span className="back-return-link">FLIP BACK ↺</span>
                    </div>
                  </div>
                }
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MegtikMenu;
