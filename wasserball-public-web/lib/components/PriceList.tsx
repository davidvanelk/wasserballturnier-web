import { cn } from './utils';

type PriceListProps = {
  className?: string;
};

export default function PriceList({ className = '' }: PriceListProps) {
  return (
    <div
      className={cn(
        'rounded-[1.75rem] border border-[rgba(28,28,28,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(28,28,28,0.08)] min-h-[50vh] items-center justify-center',
        className,
      )}
    >
      <h2 className="mb-4 font-mono text-2xl font-bold uppercase text-[var(--brand-ink)]">
        Preisliste
      </h2>
    </div>
  );
}
