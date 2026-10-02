import { TicketSpecs, CommerceCapability } from "@/lib/data/mock-schema";

export function TicketModule({ 
  specs, 
  commerce 
}: { 
  specs: TicketSpecs; 
  commerce?: CommerceCapability;
}) {
  return (
    <div className="border border-ink-black flex flex-col font-mono text-xs uppercase w-64 bg-paper-white shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
      {/* Specs Section */}
      <div className="p-3">
        <div className="flex justify-between border-b border-ink-black pb-2 mb-2">
          <span>ABV</span>
          <span>{specs.abv}</span>
        </div>
        <div className="flex justify-between border-b border-ink-black pb-2 mb-2">
          <span>IBU</span>
          <span>{specs.ibu}</span>
        </div>
        <div className="flex justify-between">
          <span>ING</span>
          <span className="text-right pl-4">{specs.ingredients.join(", ")}</span>
        </div>
      </div>
    </div>
  );
}
