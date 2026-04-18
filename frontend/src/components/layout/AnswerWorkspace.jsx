import React from 'react';
import SummaryCard from '../cards/SummaryCard';
import TreatmentCard from '../cards/TreatmentCard';
import ResearchCard from '../cards/ResearchCard';
import RiskCard from '../cards/RiskCard';
import ConfidenceCard from '../cards/ConfidenceCard';
import { useChatStore } from '../../store/chatStore';
import { Badge } from '../ui/badge';
import { Edit3 } from 'lucide-react';
import { Button } from '../ui/button';

export default function AnswerWorkspace() {
  const { patientContext, newSession } = useChatStore();

  return (
    <div className="flex-1 w-full bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Workspace Header */}
        <div className="flex items-end justify-between px-2 mb-8 animate-in fade-in slide-in-from-left duration-500">
          <div>
            <div className="flex items-center gap-2 mb-3">
               <Badge className="bg-primary/10 text-primary border-primary/20 font-black">Synthesis Engine v1.0</Badge>
               {patientContext.location && <Badge variant="secondary" className="bg-accent-light border-border">{patientContext.location}</Badge>}
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight leading-tight">
               Research for: <span className="text-primary">{patientContext.disease || 'Untitled Condition'}</span>
            </h1>
            <p className="text-sm text-muted mt-3 font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Generated based on active clinical parameters and peer-reviewed evidence.
            </p>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={newSession}
            className="text-xs text-muted hover:text-primary hover:bg-primary/5 font-bold gap-2 mb-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Parameters
          </Button>
        </div>

        <div className="space-y-6">
          <SummaryCard />
          <TreatmentCard />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResearchCard />
            <RiskCard />
          </div>

          <ConfidenceCard />
        </div>
      </div>
    </div>
  );
}

