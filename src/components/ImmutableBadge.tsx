import { Lock, History, ShieldCheck } from 'lucide-react';

interface Props {
  state: 'immutable' | 'versioned' | 'verified';
  label?: string;
}

const CONFIG = {
  immutable: { icon: Lock, text: 'IMMUTABLE', style: 'bg-tactical-amber/10 text-tactical-amber border-tactical-amber/30' },
  versioned: { icon: History, text: 'VERSIONED', style: 'bg-tactical-blue/10 text-tactical-blue border-tactical-blue/30' },
  verified: { icon: ShieldCheck, text: 'VERIFIED', style: 'bg-tactical-green/10 text-tactical-green border-tactical-green/30' },
};

export default function ImmutableBadge({ state, label }: Props) {
  const config = CONFIG[state];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-tactical rounded border ${config.style}`}>
      <Icon className="w-2.5 h-2.5" />
      {label || config.text}
    </span>
  );
}
