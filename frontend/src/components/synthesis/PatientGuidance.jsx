export default function PatientGuidance({ text }) {
  return (
    <div className="patient-guidance my-4">
      <div className="patient-guidance-label">Patient Guidance</div>
      <div className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
        {text}
      </div>
    </div>
  );
}
