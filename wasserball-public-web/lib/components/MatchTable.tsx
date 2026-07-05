import { cn } from './utils';

type MatchTableProps = {
  className?: string;
};

export default function MatchTable({ className = '' }: MatchTableProps) {
  return (
    <div
      className={cn(
        'rounded-[1.75rem] border border-[rgba(28,28,28,0.08)] bg-white px-6 py-8 shadow-[0_18px_40px_rgba(28,28,28,0.08)] min-h-[50vh] flex items-center justify-center',
        className,
      )}
    >
      <h2 className="mt-12 font-mono text-2xl font-bold uppercase text-[var(--brand-ink)] sm:text-3xl">
        Spielplan goes here
      </h2>
    </div>
  );
}
