"use client";

import { useState, useCallback } from "react";
import { PageLoader } from "@/components/layout/PageLoader";
import { ProductIndex } from "@/components/layout/ProductIndex";
import { RevealContainer, HeroCanvas } from "@/components/layout/RevealContainer";
import { FooterCtaSection } from "@/components/layout/FooterCtaSection";
import { MOCK_CORE_COLLECTION, MOCK_EXPERIMENTAL_ARCHIVE, MOCK_EDITORIAL_CONTENT, Product } from "@/lib/data/mock-schema";

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isHeroReady, setIsHeroReady] = useState(false);
  const [dissolveStarted, setDissolveStarted] = useState(false);

  const handleHeroReady = useCallback(() => {
    setIsHeroReady(true);
  }, []);

  const handleDissolveStart = useCallback(() => {
    setDissolveStarted(true);
  }, []);

  const allContent = [...MOCK_CORE_COLLECTION, ...MOCK_EXPERIMENTAL_ARCHIVE, ...MOCK_EDITORIAL_CONTENT];
  const selectedProduct = allContent.find(p => p.id === selectedId) || null;

  return (
    <div className="flex flex-col min-h-[calc(100dvh-4rem)]">
      <PageLoader
        isHeroReady={isHeroReady}
        onDissolveStart={handleDissolveStart}
      />

      {/* 
        Upper Showcase Canvas
      */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* 
          Left Side: The Index & Mobile Hero
          When no product is selected, mobile displays the dedicated Mobile Hero first.
          Then the index is displayed.
          If a product is selected, mobile hides the index while desktop preserves split screen.
        */}
        <div className={`w-full md:w-1/2 lg:w-2/5 flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>
          {/* Mobile Hero: Rendered at top of mobile home screen */}
          {!selectedId && (
            <div className="block md:hidden">
              <HeroCanvas
                isMobile
                startGather={dissolveStarted}
                onReady={handleHeroReady}
              />
            </div>
          )}

          <ProductIndex 
            title="Core Collection" 
            products={MOCK_CORE_COLLECTION} 
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <ProductIndex 
            title="Experimental Releases" 
            products={MOCK_EXPERIMENTAL_ARCHIVE} 
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <ProductIndex 
            title="Brand & Process" 
            products={MOCK_EDITORIAL_CONTENT} 
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* 
          Right Side: The Reveal
          Always rendered, but manages its own mobile overlay/visibility logic based on selection.
        */}
        <div className={`w-full md:w-1/2 lg:w-3/5 fixed md:relative top-0 left-0 h-screen md:h-auto z-40 md:z-auto ${selectedId ? 'block' : 'hidden md:block'}`}>
          <RevealContainer 
            selectedProduct={selectedProduct} 
            onCloseMobile={() => setSelectedId(null)}
            startGather={dissolveStarted}
            onHeroReady={handleHeroReady}
          />
        </div>
      </div>

      {/* 
        Final "Join the Crew / Find Us" Section
      */}
      <FooterCtaSection />
    </div>
  );
}
