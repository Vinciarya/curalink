import ConditionOverview from './ConditionOverview';
import InsightsList from './InsightsList';
import PatientGuidance from './PatientGuidance';
import ResearchGaps from './ResearchGaps';
import Disclaimer from './Disclaimer';
import ClinicalTrialSummary from './ClinicalTrialSummary';
import SourcesFooter from './SourcesFooter';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

export default function SynthesisCard({ response }) {
  if (!response) return null;

  return (
    <Card className="synthesis-card mx-auto my-6 flex w-full max-w-4xl flex-col gap-6 p-6 text-base leading-relaxed">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Clinical Synthesis</Badge>
        <Badge variant="secondary">Evidence-backed</Badge>
      </div>

      {response.conditionOverview ? <ConditionOverview text={response.conditionOverview} /> : null}
      {response.researchInsights && response.researchInsights.length > 0 ? <InsightsList insights={response.researchInsights} /> : null}
      
      {response.clinicalTrials && response.clinicalTrials.length > 0 && (
        <div className="flex flex-col gap-3 mt-4">
          <h3 className="font-serif text-xl mb-2 tracking-wide font-black" style={{ color: 'var(--text)' }}>Relevant Clinical Trials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {response.clinicalTrials.map((trial, index) => (
              <ClinicalTrialSummary key={index} trial={trial} />
            ))}
          </div>
        </div>
      )}

      {response.patientGuidance ? <PatientGuidance text={response.patientGuidance} /> : null}
      {response.researchGaps ? <ResearchGaps text={response.researchGaps} /> : null}
      {response.disclaimer ? <Disclaimer text={response.disclaimer} /> : null}
      {response.sourceAttribution && response.sourceAttribution.length > 0 ? <SourcesFooter sourceAttribution={response.sourceAttribution} /> : null}
    </Card>
  );
}
