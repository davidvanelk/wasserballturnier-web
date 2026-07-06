type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  titleClassName?: string;
  className?: string;
  description?: string;
  inverted?: boolean;
};

export default function SectionHeader({
  eyebrow,
  title,
  titleClassName,
  className,
  description,
  inverted = false,
}: SectionHeaderProps) {
  return (
    <div className={className}>
      <p
        className={
          inverted
            ? 'text-sm font-bold uppercase tracking-[0.18em] text-[rgba(255,255,255,0.64)]'
            : 'text-sm font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]'
        }
      >
        {eyebrow}
      </p>
      <h2
        className={
          (titleClassName ?? inverted)
            ? 'mt-3 font-mono text-3xl uppercase text-white sm:text-4xl'
            : 'mt-3 font-mono text-3xl uppercase text-[var(--brand-ink)] sm:text-4xl'
        }
      >
        {title}
      </h2>
      {description ? (
        <p
          className={
            inverted
              ? 'mt-4 max-w-3xl text-base leading-7 text-white/72'
              : 'mt-4 max-w-3xl text-base leading-7 text-[var(--brand-gray)]'
          }
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
