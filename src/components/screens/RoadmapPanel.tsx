'use client';

import { useAnalysisStore } from '@/store';
import { STAR_TIERS, MODELS } from '@/types';
import { X, Trash2, Map, Star } from 'lucide-react';

export function RoadmapPanel() {
  const { roadmapOpen, roadmapItems, removeFromRoadmap, toggleRoadmap } =
    useAnalysisStore();

  if (!roadmapOpen) return null;

  // Group by tier
  const grouped = roadmapItems.reduce(
    (acc, item) => {
      const level = item.idea.star_level;
      if (!acc[level]) acc[level] = [];
      acc[level].push(item);
      return acc;
    },
    {} as Record<number, typeof roadmapItems>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-30"
        onClick={toggleRoadmap}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-ls-dark border-l border-ls-dark-border z-40 animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-ls-dark-border">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-ls-accent" />
            <h2 className="text-lg font-bold text-white">Roadmap</h2>
            <span className="text-sm text-gray-500">
              ({roadmapItems.length} items)
            </span>
          </div>
          <button
            onClick={toggleRoadmap}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-ls-dark-card transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {roadmapItems.length === 0 ? (
            <div className="text-center py-16">
              <Map className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No ideas selected yet</p>
              <p className="text-sm text-gray-500">
                Click the + button on any idea card to add it to your roadmap.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {([6, 7, 8, 9] as const).map((level) => {
                const items = grouped[level];
                if (!items || items.length === 0) return null;
                const tier = STAR_TIERS[level];
                return (
                  <div key={level}>
                    <div className="flex items-center gap-2 mb-3">
                      <Star
                        className="w-4 h-4"
                        style={{ color: tier.color }}
                        fill={tier.color}
                      />
                      <h3
                        className="text-sm font-semibold"
                        style={{ color: tier.color }}
                      >
                        {level}-Star · {tier.label}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {items.map((item) => {
                        const model = MODELS[item.idea.model_source];
                        return (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-ls-dark-card border border-ls-dark-border group"
                          >
                            <div
                              className="w-1 h-full min-h-[2rem] rounded-full flex-shrink-0"
                              style={{ backgroundColor: tier.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {item.idea.title}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <div
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: model.color }}
                                />
                                <span className="text-xs text-gray-500">
                                  {model.name}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromRoadmap(item.idea_id)}
                              className="p-1 rounded text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {roadmapItems.length > 0 && (
          <div className="p-5 border-t border-ls-dark-border">
            <p className="text-xs text-gray-500 text-center">
              Roadmap export coming soon — PDF, deck, or project board.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
