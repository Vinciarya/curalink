import ConditionOverview from './ConditionOverview';
import InsightsList from './InsightsList';
import PatientGuidance from './PatientGuidance';
import ResearchGaps from './ResearchGaps';
import Disclaimer from './Disclaimer';
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
      {response.keyInsights && response.keyInsights.length > 0 ? <InsightsList insights={response.keyInsights} /> : null}
      {response.patientGuidance ? <PatientGuidance text={response.patientGuidance} /> : null}
      {response.researchGaps ? <ResearchGaps text={response.researchGaps} /> : null}
      {response.disclaimer ? <Disclaimer text={response.disclaimer} /> : null}
      {response.sourcesUsed && response.sourcesUsed.length > 0 ? <SourcesFooter sourcesUsed={response.sourcesUsed} /> : null}
    </Card>
  );
}
