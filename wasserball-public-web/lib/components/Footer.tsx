import { getCurrentLocale, getScopedI18n } from '@/app/i18n/server';
import Link from 'next/link';

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
                className="text-white/72 hover:text-white"
                href={`/${locale}/imprint`}
              >
                {t('legal.imprint')}
              </Link>
            </p>
            <p>
              <Link
                className="text-white/72 hover:text-white"
                href={`/${locale}/privacy`}
              >
                {t('legal.privacy')}
              </Link>
            </p>
            <p>
              <Link
                className="text-white/72 hover:text-white"
                href={`/${locale}/contact`}
              >
                {t('legal.contact')}
              </Link>
            </p>
          </div>

          <div>
            <p className="font-semibold uppercase tracking-[0.14em] text-white">
              {t('socialMedia.sectionTitle')}
            </p>
            <p className="mt-3">
              <a
                className="text-white/72 hover:text-white"
                href="https://www.facebook.com/feuerwehremmerichamrhein"
                target="_blank"
                rel="noopener"
              >
                Facebook
              </a>
            </p>
            <p>
              <a
                className="text-white/72 hover:text-white"
                href="https://www.instagram.com/feuerwehremmerich/"
                target="_blank"
                rel="noopener"
              >
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
