import { getScopedI18n } from '@/app/i18n/server';
import Link from 'next/link';

const Footer = async () => {
  const t = await getScopedI18n('footer');
  return (
    <footer className="text-center sm:text-left grid grid-cols-1 gap-3 sm:flex sm:gap-16 sm:px-3 py-4 text-gray-600 text-sm mx-auto">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="font-semibold text-gray-800">
            {t('legal.sectionTitle')}
          </p>
          <p>
            <Link className="text-red-500 hover:underline" href="/imprint">
              {t('legal.imprint')}
            </Link>
          </p>
          <p>
            <Link className="text-red-500 hover:underline" href="/privacy">
              {t('legal.privacy')}
            </Link>
          </p>
          <p>
            <Link className="text-red-500 hover:underline" href="/contact">
              {t('legal.contact')}
            </Link>
          </p>
        </div>

        <div>
          <p className="font-semibold text-gray-800">
            {t('socialMedia.sectionTitle')}
          </p>
          <p>
            <a
              className="text-red-500 hover:underline"
              href="https://www.facebook.com/feuerwehremmerichamrhein"
              target="_blank"
              rel="noopener"
            >
              Facebook
            </a>
          </p>
          <p>
            <a
              className="text-red-500 hover:underline"
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
            className="text-red-500 hover:underline"
            href="https://www.emmerich.de/stadt-rathaus/oeffentliche-einrichtungen/feuerwehr-emmerich-am-rhein#"
            target="_blank"
            rel="noopener"
          >
            Freiwillige Feuerwehr Emmerich am Rhein
          </a>
        </p>
        <p>Made with ❤️ by Löschzug Elten</p>
        <p>
          Check out the repo:{' '}
          <a
            className="text-red-500 hover:underline"
            target="_blank"
            rel="noopener"
            href="https://github.com/davidvanelk/wasserballturnier-web"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
