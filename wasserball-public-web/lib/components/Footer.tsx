import { getCurrentLocale, getScopedI18n } from '@/app/i18n/server';
import Link from 'next/link';

function FacebookIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-[18px] shrink-0 fill-current"
      viewBox="0 0 24 24"
    >
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.19 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2V8.6h-1.25c-1.24 0-1.63.77-1.63 1.56v1.9h2.77l-.44 2.91h-2.33V22C18.34 21.25 22 17.08 22 12.06Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-[18px] shrink-0 fill-current"
      viewBox="0 0 24 24"
    >
      <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    </svg>
  );
}

const Footer = async () => {
  const locale = await getCurrentLocale();
  const t = await getScopedI18n('footer');

  return (
    <footer className="w-full px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] bg-[var(--brand-ink)] px-6 py-8 text-center text-sm text-white/72 shadow-[0_24px_60px_rgba(28,28,28,0.2)] sm:px-8 sm:text-left lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="font-semibold uppercase tracking-[0.14em] text-white">
              {t('legal.sectionTitle')}
            </p>
            <p className="mt-3">
              <Link
                prefetch={false}
                className="text-white/72 hover:text-white"
                href={`/${locale}/imprint`}
              >
                {t('legal.imprint')}
              </Link>
            </p>
            <p>
              <Link
                prefetch={false}
                className="text-white/72 hover:text-white"
                href={`/${locale}/privacy`}
              >
                {t('legal.privacy')}
              </Link>
            </p>
          </div>

          <div>
            <p className="font-semibold uppercase tracking-[0.14em] text-white">
              {t('socialMedia.sectionTitle')}
            </p>
            <p className="mt-3">
              <a
                className="inline-flex items-center gap-2 text-white/72 hover:text-white"
                href="https://www.facebook.com/FeuerwehrEmmerich/"
                target="_blank"
                rel="noopener"
              >
                <FacebookIcon />
                Facebook
              </a>
            </p>
            <p>
              <a
                className="inline-flex items-center gap-2 text-white/72 hover:text-white"
                href="https://www.instagram.com/feuerwehremmerich/"
                target="_blank"
                rel="noopener"
              >
                <InstagramIcon />
                Instagram
              </a>
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p>
            &copy; 2026{' '}
            <a
              className="text-white hover:text-[var(--brand-red)]"
              href="https://www.emmerich.de/stadt-rathaus/oeffentliche-einrichtungen/feuerwehr-emmerich-am-rhein#"
              target="_blank"
              rel="noopener"
            >
              Freiwillige Feuerwehr Emmerich am Rhein
            </a>
          </p>
          <p>Made with ❤️ by Löscheinheit Elten</p>
          <p>
            Check out the repo:{' '}
            <a
              className="text-white hover:text-[var(--brand-red)]"
              target="_blank"
              rel="noopener"
              href="https://github.com/davidvanelk/wasserballturnier-web"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
