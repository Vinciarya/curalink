import React from 'react';
import SummaryCard from '../cards/SummaryCard';
import TreatmentCard from '../cards/TreatmentCard';
import ResearchCard from '../cards/ResearchCard';
import RiskCard from '../cards/RiskCard';
import ConfidenceCard from '../cards/ConfidenceCard';

export default function AnswerWorkspace() {
  return (
    <div className="flex-1 h-full overflow-y-auto bg-muted/5 px-8 pt-8 pb-32">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Workspace Header */}
        <div className="mb-10 px-2">
          <h1 className="text-3xl font-serif text-foreground/90">Clinical Intelligence Synthesis</h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">Generated based on provided patient context and parameters.</p>
        </div>

        <SummaryCard />
        <TreatmentCard />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResearchCard />
          <RiskCard />
        </div>

        <ConfidenceCard />

      </div>
    </div>
  );
}
