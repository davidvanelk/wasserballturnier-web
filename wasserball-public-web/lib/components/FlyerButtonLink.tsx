import Link from 'next/link';
import { cn } from './utils';

type FlyerButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  external?: boolean;
};

const sharedClassName =
  'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.12em]';

export default function FlyerButtonLink({
  href,
  children,
  variant = 'primary',
  className,
  external = false,
}: FlyerButtonLinkProps) {
  const variantClassName =
    variant === 'primary'
      ? 'bg-[var(--brand-red)] text-white shadow-[0_18px_30px_rgba(214,34,31,0.24)] hover:bg-[var(--brand-red-dark)]'
      : 'border border-[rgba(28,28,28,0.14)] bg-transparent text-[var(--brand-ink)] hover:-translate-y-0.5 hover:border-[var(--brand-red)] hover:text-[var(--brand-red)]';

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(sharedClassName, variantClassName, className)}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={cn(sharedClassName, variantClassName, className)}
    >
      {children}
    </Link>
  );
}
