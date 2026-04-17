import SynthesisCard from '../synthesis/SynthesisCard';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  
  if (isUser) {
    return (
      <div className="flex justify-end my-4">
        <div className="max-w-xl px-6 py-4 rounded-2xl bg-opacity-10 text-[15px]" style={{ backgroundColor: 'var(--accent-primary-dim)', color: 'var(--accent-primary)', borderBottomRightRadius: '4px' }}>
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant response
  return (
    <div className="flex justify-start my-4">
      {message.response ? (
        <SynthesisCard response={message.response} publications={message.publications || []} trials={message.trials || []} />
      ) : (
        <div className="max-w-3xl px-6 py-4 rounded-2xl bg-opacity-50 text-[15px] leading-relaxed w-full" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', borderBottomLeftRadius: '4px' }}>
          {message.content}
        </div>
      )}
    </div>
  );
}
