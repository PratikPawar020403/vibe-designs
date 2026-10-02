"use client";

import { Product } from "@/lib/data/mock-schema";
import { clsx } from "clsx";

interface ProductIndexProps {
  products: Product[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  title: string;
}

export function ProductIndex({ products, selectedId, onSelect, title }: ProductIndexProps) {
  return (
    <div className="flex flex-col w-full md:border-r border-ink-black">
      <div className="p-3 sm:p-4 border-b border-ink-black bg-ink-black text-paper-white">
        <h2 className="font-mono text-xs sm:text-sm tracking-widest uppercase">{title}</h2>
      </div>
      <ul className="flex flex-col m-0 p-0 list-none">
        {products.map((product, index) => {
          const isSelected = selectedId === product.id;
          
          return (
            <li key={product.id} className="border-b border-ink-black last:border-b-0">
              <button
                type="button"
                className={clsx(
                  "w-full text-left p-4 sm:p-5 md:p-6 font-display text-2xl sm:text-3xl md:text-4xl uppercase transition-snappy outline-none",
                  "focus:bg-electric-blue focus:text-paper-white",
                  "hover:bg-rani-pink hover:text-paper-white active:bg-rani-pink active:text-paper-white active:translate-x-1 cursor-pointer",
                  isSelected ? "bg-ink-black text-paper-white" : "bg-paper-white text-ink-black"
                )}
                onClick={() => onSelect(product.id)}
                // Keyboard interaction triggers selection naturally via button
                aria-pressed={isSelected}
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="flex items-baseline min-w-0">
                    <span className="font-mono text-xs opacity-50 mr-3 sm:mr-4 shrink-0 align-top">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="break-words">{product.name}</span>
                  </span>
                  
                  {/* Status Badge */}
                  {product.lifecycleState !== 'ACTIVE' && (
                    <span className="font-mono text-[10px] sm:text-xs border border-current px-1.5 sm:px-2 py-0.5 sm:py-1 shrink-0 ml-2">
                      [{product.lifecycleState}]
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
