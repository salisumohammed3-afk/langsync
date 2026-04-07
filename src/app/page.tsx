'use client';

import { useAnalysisStore } from '@/store';
import {
  InputScreen,
  ScoringScreen,
  PersonaScreen,
  LoadingScreen,
  ResultsScreen,
  RoadmapPanel,
} from '@/components/screens';

export default function Home() {
  const step = useAnalysisStore((s) => s.step);

  return (
    <main className="relative">
      {step === 'input' && <InputScreen />}
      {step === 'scoring' && <ScoringScreen />}
      {step === 'personas' && <PersonaScreen />}
      {step === 'loading' && <LoadingScreen />}
      {step === 'results' && <ResultsScreen />}

      {/* Roadmap panel overlays on results */}
      <RoadmapPanel />
    </main>
  );
}
