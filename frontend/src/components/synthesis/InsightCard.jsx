/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { useChatStore } from '../../store/chatStore';
import CitationChip from '../ui/CitationChip';

export default function InsightCard({ insight, index }) {
  const { highlightCitation } = useChatStore();

  return (
    <motion.div
      className="insight-card"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className={`confidence-bar confidence-${insight.confidence?.toLowerCase() || 'moderate'}`} />

      <div className="insight-content flex flex-col gap-3 flex-1">
        <p className="insight-finding leading-relaxed" style={{ color: 'var(--text-primary)' }}>{insight.finding}</p>

        {insight.sourceRefs && insight.sourceRefs.length > 0 && (
          <div className="citation-chips flex flex-wrap gap-2 mt-1">
            {insight.sourceRefs.map(ref => (
              <CitationChip
                key={ref}
                citation={ref}
                onClick={() => highlightCitation(ref)}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
