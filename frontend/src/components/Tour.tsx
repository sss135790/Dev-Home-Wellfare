"use client";

import React, { useState } from "react";
import { Eye, MapPin, Users, Key, LayoutGrid, X, Building, CheckCircle } from "lucide-react";
import { BlockData, BLOCKS } from "./Constants";

export default function Tour() {
  const [selectedBlock, setSelectedBlock] = useState<BlockData | null>(null);

  return (
    <div className="space-y-6">
      
      {/* Tab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-500" />
            Society Tour
          </h2>
          <p className="text-slate-400 text-sm mt-1">Explore our four blocks and their specific features and amenities.</p>
        </div>
      </div>

      {/* Grid of Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {BLOCKS.map((block) => (
          <div 
            key={block.id}
            className="glass-panel rounded-2xl overflow-hidden group hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Image section with hover overlay */}
            <div className="relative h-60 w-full overflow-hidden bg-slate-950">
              {/* Fallback pattern to show if image is not loaded */}
              <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-slate-500">
                <Building className="w-12 h-12 text-slate-700 mb-2" />
                <p className="text-xs font-semibold uppercase tracking-wider">{block.name}</p>
                <p className="text-[10px] text-slate-600 mt-1">Place your {block.image} image here</p>
              </div>

              {/* Real Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={block.image} 
                alt={block.name}
                onError={(e) => {
                  // Hide image if fails to load so fallback shows
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 relative z-10"
              />

              {/* Black Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-20 pointer-events-none" />
              
              {/* Hover quick view action */}
              <button 
                onClick={() => setSelectedBlock(block)}
                className="absolute top-4 right-4 z-30 bg-blue-600/90 hover:bg-blue-500 text-white p-2 rounded-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0 flex items-center gap-1.5 text-xs font-bold shadow-lg shadow-blue-500/20"
              >
                <Eye className="w-4 h-4" />
                Inspect Block
              </button>

              <div className="absolute bottom-4 left-4 z-20">
                <span className="bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full backdrop-blur-md">
                  {block.id} Wing
                </span>
                <h3 className="text-lg font-bold text-white mt-1.5">{block.name}</h3>
              </div>
            </div>

            {/* Quick summary specs */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-slate-950/50 rounded-xl border border-white/5 text-center text-xs">
                <div>
                  <p className="text-slate-400 text-[10px] font-semibold uppercase">Floors</p>
                  <p className="text-sm font-bold text-white mt-0.5">{block.floors}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-semibold uppercase">Apartments</p>
                  <p className="text-sm font-bold text-white mt-0.5">{block.apartments}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-semibold uppercase">Occupancy</p>
                  <p className="text-sm font-bold text-blue-400 mt-0.5">{block.occupancy}</p>
                </div>
              </div>

              <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                {block.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {block.amenities.slice(0, 3).map((item, idx) => (
                  <span key={idx} className="bg-slate-900 border border-white/5 text-slate-300 text-[10px] px-2 py-0.5 rounded-md">
                    {item}
                  </span>
                ))}
                {block.amenities.length > 3 && (
                  <span className="text-blue-400 text-[10px] font-bold px-1.5 self-center">
                    +{block.amenities.length - 3} more
                  </span>
                )}
              </div>

              <button
                onClick={() => setSelectedBlock(block)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs border border-white/5 transition flex items-center justify-center gap-2"
              >
                View Full Specifications
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Lightbox / Specification Modal */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-slideup my-8">
            
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white font-bold w-7 h-7 rounded-lg flex items-center justify-center text-xs">
                  {selectedBlock.id}
                </span>
                <h3 className="text-lg font-bold text-white">{selectedBlock.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedBlock(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              
              {/* Image side */}
              <div className="relative h-80 md:h-full min-h-[300px] bg-slate-950">
                {/* Fallback */}
                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-slate-500">
                  <Building className="w-16 h-16 text-slate-700 mb-2" />
                  <p className="text-sm font-semibold uppercase tracking-wider">{selectedBlock.name}</p>
                  <p className="text-xs text-slate-600 mt-2">Place your {selectedBlock.image} image here</p>
                </div>

                {/* Real Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={selectedBlock.image} 
                  alt={selectedBlock.name}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="w-full h-full object-cover relative z-10"
                />
              </div>

              {/* Specs side */}
              <div className="p-6 md:p-8 space-y-6 max-h-[500px] overflow-y-auto">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Block Overview</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{selectedBlock.description}</p>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">Key Specifications</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                      <LayoutGrid className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Floors</p>
                        <p className="text-sm font-bold text-white mt-0.5">{selectedBlock.floors} Floors</p>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                      <Users className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Apartments</p>
                        <p className="text-sm font-bold text-white mt-0.5">{selectedBlock.apartments} Units</p>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Occupancy Rate</p>
                        <p className="text-sm font-bold text-emerald-400 mt-0.5">{selectedBlock.occupancy}</p>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Block Supervisor</p>
                        <p className="text-xs font-bold text-white mt-0.5 truncate">{selectedBlock.supervisor}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">Amenities & Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedBlock.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/40 py-2 px-3 rounded-lg border border-white/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
