import FlyerSurface from '@/lib/components/FlyerSurface';
import PageHero from '@/lib/components/PageHero';

export default function PrivacyPage() {
  return (
    <main className="flex w-full flex-col gap-8 lg:gap-10">
      <PageHero eyebrow="Rechtliches" title="Datenschutz" />

      <FlyerSurface className="p-6 sm:p-8" revealDelay={1}>
        <section className="prose max-w-none">
          <h2 className="text-3xl font-bold">1. Datenschutz auf einen Blick</h2>
          <h3 className="mt-3 text-2xl font-bold">Allgemeine Hinweise</h3>
          Die folgenden Hinweise geben einen einfachen Überblick darüber, was
          mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website
          besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
          persönlich identifiziert werden können.
          <h3 className="mt-3 text-2xl font-bold">
            Datenerfassung auf dieser Website
          </h3>
          Die Datenverarbeitung auf dieser Website erfolgt durch den
          Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser
          Website entnehmen. Ihre Daten werden zum einen dadurch erhoben, dass
          Sie uns diese mitteilen. Andere Daten werden automatisch oder nach
          Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme
          erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser,
          Betriebssystem oder Uhrzeit des Seitenaufrufs).
        </section>

        <section>
          <h2 className="mt-6 text-3xl font-bold">2. Hosting</h2>
          <h3 className="mt-3 text-2xl font-bold">Hetzner</h3>
          Wir hosten unsere Website bei der Hetzner Online GmbH, Industriestr.
          25, 91710 Gunzenhausen (nachfolgend: Hetzner). Details entnehmen Sie
          der Datenschutzerklärung von Hetzner:
          <a
            className="ml-1 text-[var(--brand-red)]"
            href="https://www.hetzner.com/de/legal/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://www.hetzner.com/de/legal/privacy-policy/
          </a>
          . Die Verwendung von Hetzner erfolgt auf Grundlage von Art. 6 Abs. 1
          lit. f DSGVO.
          <br />
          Wir haben ein berechtigtes Interesse an einer möglichst zuverlässigen
          Darstellung unserer Website. Sofern eine entsprechende Einwilligung
          abgefragt wurde, erfolgt die Verarbeitung ausschließlich auf Grundlage
          von Art. 6 Abs. 1 lit. a DSGVO; die Einwilligung ist jederzeit
          widerrufbar.
          <h3 className="mt-3 text-2xl font-bold">Auftragsverarbeitung</h3>
          Wir haben einen Vertrag über Auftragsverarbeitung (AVV) mit Hetzner
          geschlossen. Dies ist ein datenschutzrechtlich vorgeschriebener
          Vertrag, der gewährleistet, dass Hetzner die personenbezogenen Daten
          unserer Websitebesucher nur nach unseren Weisungen und unter
          Einhaltung der DSGVO verarbeitet.
        </section>

        <section>
          <h2 className="mt-6 text-3xl font-bold">
            3. Allgemeine Hinweise und Pflichtinformationen
          </h2>
          <h3 className="mt-3 text-2xl font-bold">Server-Log-Files</h3>
          Der Anbieter der Seiten erhebt und speichert automatisch Informationen
          in sogenannten Server-Log-Files, die Ihr Browser automatisch an uns
          übermittelt. Dies sind:
          <ul className="my-3 ml-6 list-disc">
            <li>Browsertyp und Browserversion</li>
            <li>Verwendetes Betriebssystem</li>
            <li>Referrer URL (die zuvor besuchte Seite)</li>
            <li>Hostname des zugreifenden Rechners</li>
            <li>Uhrzeit der Serveranfrage</li>
            <li>IP-Adresse</li>
          </ul>
          Diese Daten werden nicht mit anderen Datenquellen zusammengeführt. Die
          Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f
          DSGVO. Der Websitebetreiber hat ein berechtigtes Interesse an der
          technisch fehlerfreien Darstellung und der Optimierung seiner Website
          – hierzu müssen die Server-Logfiles erfasst werden.
          <h3 className="mt-3 text-2xl font-bold">Speicherdauer</h3>
          Die Server-Logfiles werden für eine Dauer von maximal 14 Tagen
          gespeichert und anschließend automatisch gelöscht.
          <h3 className="mt-3 text-2xl font-bold">Betroffenenrechte</h3>
          Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft,
          Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu
          erhalten. <br />
          Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser
          Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung
          erteilt haben, können Sie diese Einwilligung jederzeit für die Zukunft
          widerrufen. Zudem steht Ihnen ein Beschwerderecht bei der zuständigen
          Datenschutz-Aufsichtsbehörde zu.
        </section>

        <section>
          <h2 className="mt-6 text-3xl font-bold">
            4. Analyse-Tools (Tracking)
          </h2>
          <h3 className="mt-3 text-2xl font-bold">
            Matomo (Server-Side Rendering, ohne Cookies)
          </h3>
          Wir setzen auf dieser Website das Open-Source-Webanalysetool Matomo
          ein. Die Analyse erfolgt im Rahmen des Server-Side-Rendering-Prozesses
          (SSR). <br />
          Das bedeutet, dass die Auswertung direkt auf dem Server stattfindet
          und keine Skripte im Browser des Nutzers geladen werden, die Daten an
          Dritte senden.
          <br />
          <strong>Keine Cookies:</strong> Diese Konfiguration von Matomo
          verwendet keine Cookies. Es werden somit keine Textdateien auf Ihrem
          Computer gespeichert, die eine Wiedererkennung Ihres Browsers
          ermöglichen. <br />
          <strong>Anonymisierung:</strong> Die IP-Adresse der Nutzer wird vor
          der Auswertung umgehend anonymisiert (Kürzung der IP-Adresse). Dadurch
          ist ein Rückschluss auf die Identität der einzelnen Besucher nicht
          mehr möglich.
          <br />
          <p className="mt-3">
            Die Daten werden ausschließlich auf den Servern unseres Hosters in
            Deutschland verarbeitet und nicht an Dritte weitergegeben. Die
            Nutzung von Matomo erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f
            DSGVO. Wir haben ein berechtigtes Interesse an der anonymisierten
            Analyse des Nutzerverhaltens, um unser Webangebot und die
            Event-Informationen zu optimieren.
          </p>
        </section>

        <section>
          <h2 className="mt-6 text-3xl font-bold">5. Plugins und Tools</h2>
          <h3 className="mt-3 text-2xl font-bold">Leaflet und OpenStreetMap</h3>
          Zur Darstellung der Veranstaltungsstätte verwenden wir die freie
          JavaScript-Bibliothek Leaflet. Die Bibliothek wird als Bestandteil
          dieser Website von unserem eigenen Server ausgeliefert und setzt keine
          Cookies. Das Kartenmaterial wird von der OpenStreetMap Foundation
          (OSMF), St John’s Innovation Centre, Cowley Road, Cambridge, CB4 0WS,
          Vereinigtes Königreich, bereitgestellt.
          <br />
          Beim Laden der Karte ruft Ihr Browser Kartenkacheln unmittelbar von
          Servern der OSMF ab. Dabei werden technisch notwendige Zugriffsdaten,
          insbesondere Ihre IP-Adresse, Browser- und Geräteinformationen, die
          verweisende Seite sowie Zeitpunkt und Inhalt des Abrufs, an die OSMF
          übermittelt. Die Einbindung erfolgt auf Grundlage von Art. 6 Abs. 1
          lit. f DSGVO. Unser berechtigtes Interesse liegt in einer
          nutzerfreundlichen Darstellung und leichten Auffindbarkeit des
          Veranstaltungsorts. Unsere Kartenintegration setzt keine Cookies ein
          und dient nicht der Nutzerverfolgung.
          <br />
          Weitere Informationen zur Verarbeitung durch die OSMF finden Sie in
          der Datenschutzerklärung der OpenStreetMap Foundation:
          <a
            className="ml-1 text-[var(--brand-red)]"
            target="_blank"
            rel="noopener noreferrer"
            href="https://osmfoundation.org/wiki/Privacy_Policy"
          >
            https://osmfoundation.org/wiki/Privacy_Policy
          </a>
          . Wenn Sie den Link zur Routenplanung anklicken, verlassen Sie unsere
          Website und öffnen Google Maps. Erst durch diesen bewussten Klick
          werden Daten an Google übermittelt. Dort gelten die Datenschutz- und
          Nutzungsbestimmungen von Google.
        </section>

        <section>
          <h2 className="mt-6 text-3xl font-bold">
            6. Social Media Links (Keine Plugins)
          </h2>
          <h3 className="mt-3 text-2xl font-bold">Instagram und Facebook </h3>
          Auf unserer Website sind Verweise (Links) auf unsere offiziellen
          Seiten bei den sozialen Netzwerken Facebook und Instagram (Anbieter:
          Meta Platforms Ireland Limited, 4 Grand Canal Square, Grand Canal
          Harbour, Dublin 2, Irland) eingebunden.
          <br /> Es handelt sich hierbei um reine Text- oder Bildlinks und
          ausdrücklich nicht um sogenannte Social-Media-Plugins (wie z. B. der
          „Gefällt mir“-Button). Solange Sie diese Links nicht anklicken, werden
          keinerlei Daten an Facebook oder Instagram übertragen. Erst wenn Sie
          auf den jeweiligen Link klicken, werden Sie auf die Plattform von Meta
          weitergeleitet. Dort gelten die Datenschutzrichtlinien und
          Nutzungsbedingungen von Meta.
        </section>
      </FlyerSurface>
    </main>
  );
}
