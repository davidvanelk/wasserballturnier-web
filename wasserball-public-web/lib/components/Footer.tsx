const Footer = () => {
  return (
    <footer className="text-center py-4 text-gray-600 text-sm">
      <hr className="border-t border-gray-300 my-4" />
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
    </footer>
  );
};

export default Footer;
