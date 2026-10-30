# Zeekr 🚘
### Europeiska Zeekr-bilar i Homey Pro

**[Hämta senaste versionen](https://github.com/homeyrglabs/Zeekr-Homey/releases/latest) · [Alla versioner och nedladdningar](https://github.com/homeyrglabs/Zeekr-Homey/releases)**

**Aktuell community-version: v0.2.1.** Hämta `Zeekr_Homey_v0.2.1.zip` under **Assets**, packa upp hela paketet och följ [setupguiden](SETUP.sv.md).

[🇬🇧 English](README.md) · [Komplett setup](SETUP.sv.md) · [Ta fram nyckelfilen](KEYS.sv.md) · [Alla funktioner och begränsningar](FEATURES.sv.md)

Inofficiell Homey-port baserad på **Fryyyyys Zeekr EV API och Home Assistant-integration**, med nyckelverktyg av **Wysie**. Distribueras genom **homeyrglabs/Zeekr-Homey**. Originalförfattarna får erkännandet för API-arbetet och originalens MIT-licenser medföljer. Se [källhänvisningarna](THIRD_PARTY_NOTICES.md).

**Delas i befintligt skick. Inget löfte om underhåll, uppdateringar, support eller svarstider. Andra får gärna skapa en fork och fortsätta arbetet. Ingen officiell koppling till Zeekr eller Athom.**

## Funktioner

- Batterinivå, räckvidd, laddning, kabelstatus, laddeffekt, kupétemperatur, mätarställning och däcktryck.
- Molnkommandon för lås/upplåsning, frigöring av bagagelucka/frunk, fönster, solgardin, laddlucka och ljus/tuta.
- Laddning och kupéklimat, defroster, ratt- och sätesvärme, sätesventilation fram, kort luftningscykel och sentry.
- Laddgräns, laddschema och engångsavgång med klimat/rattvärme.
- Fler rapporterade dörr-, fönster- och låsvärden, sätesinställningar, däcktemperaturer/varningar, koordinater, ladd-/färddata och schemastatus.
- Svenska och engelska i parkoppling, inställningar, egenskaper, Flow-kort och driftmeddelanden. Engelska används som reservspråk.
- Körs direkt på Homey Pro; Home Assistant behövs inte.

Se [FEATURES.sv.md](FEATURES.sv.md) för funktionstabell, hur scheman ersätts och begränsningar. Utökningen tillför **28 Flow-åtgärder och tio knappar** till de ursprungliga funktionerna.

**De nya bilkommandona är testade med simulerade svar, inte mot en riktig bil.** Stöd beror på modell, region, programvara, kontobehörighet och bilstatus. Ett accepterat anrop bevisar inte utförd åtgärd. Låsstatus ändras först efter rapporterad telemetri. Bluetooth-/digital környckel, närhetsupplåsning och kamerabilder ingår inte.

## Krav och status

| Del | Krav / status |
|---|---|
| Homey | Homey Pro 12.9.0+; enbart Homey Cloud/Bridge stöds inte |
| Installationsdator | Node.js 24+ för Homey CLI 4.6.2 |
| Nyckelextraktion | Python 3.10+; exakt analyserad EU-build 2.9.9 |
| Zeekr-konto | Eget EU-konto med tillgång till bilen, helst separat konto med bildelning |
| Zeekr 001 | En användare har rapporterat installation/parkoppling; utökade kommandon behöver testas |
| Andra modeller / extraktion från EU 3.1.1 | Inte verifierat; 3.1.1 saknar komplett stödd extraktionsväg |
| Distribution | Community-version via GitHub, **inte certifierad för Homey App Store** |

## Installera eller uppdatera på Windows

1. Öppna **[senaste versionen](https://github.com/homeyrglabs/Zeekr-Homey/releases/latest)** eller **[alla versioner](https://github.com/homeyrglabs/Zeekr-Homey/releases)** och hämta **Zeekr_Homey_v0.2.1.zip** under Assets.
2. Packa upp hela ZIP-filen. Läs [SETUP.sv.md](SETUP.sv.md).
3. Vid första installationen: följ [KEYS.sv.md](KEYS.sv.md) och kör `EXTRACT_KEYS_WINDOWS.cmd` för att skapa din privata nyckelfil. Inga APK-filer eller nycklar medföljer.
4. Installera [Node.js 24+](https://nodejs.org/). Läs och kör `INSTALL_WINDOWS.cmd`. Logga in på ditt eget Homey-konto och välj Homey.
5. Vid första installationen: lägg till **Zeekr → Zeekr (EU)**, ange Zeekr-konto och EU-landkod samt importera nyckelfilen. Använd API-appversion **2.9.9** med nycklar från guiden.
6. Jämför avläsningarna med mobilappen. Prova ett manuellt kommando i taget vid bilen med din vanliga nyckel tillgänglig.

**Vid uppdatering:** installera på samma Homey utan att först avinstallera eller använda `--clean`. Behåll fungerande konto, nycklar och API-appversion. App-ID är fortsatt `com.rglabs.zeekr`; nya egenskaper läggs till på befintlig bil när appen startar. En ny GitHub-release uppdaterar inte Homey automatiskt.

Manuell installation i PowerShell från den uppackade mappens rot:

```powershell
npm.cmd install --global homey@4.6.2
homey.cmd login
cd app
homey.cmd app install
```

På macOS/Linux används `npm` och `homey` utan `.cmd`. **Code → Download ZIP** hämtar aktuell källkod på main; en release-ZIP ger en bestämd version.

## Avläsning och integritet

Standardintervallet är **300 sekunder**, justerbart mellan 60 och 3600 sekunder. Anropen tar också tid. Efter accepterat kommando planeras en uppdatering efter 35 sekunder. Homeys tidsangivelse kan avse när ett värde senast ändrades; en lyckad molnhämtning bevisar inte att en sovande bil skickat ny telemetri.

Konto, extraherade API-värden och session sparas i appinställningarna på din Homey. Koordinater kan visas om bilen rapporterar dem. Behåll privata nyckelfiler utanför repot. Publicera aldrig nycklar, lösenord, sessioner, VIN, exakta koordinater, personliga loggar eller APK-filer.

## Originalprojekt och licens

- [Fryyyyy / zeekr_ev_api](https://github.com/Fryyyyy/zeekr_ev_api): protokoll, inloggning, signering och VIN-kryptering.
- [Fryyyyy / zeekr_homeassistant](https://github.com/Fryyyyy/zeekr_homeassistant): telemetri, styrning och scheman.
- [Wysie / zeekr_key_extractor](https://github.com/Wysie/zeekr_key_extractor): APK-analys och extraktionsverktyg.

Se [LICENSE](LICENSE), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), [UPSTREAM_VERSIONS.json](UPSTREAM_VERSIONS.json), [valideringsrapport](TEST_REPORT.md) och [egen vidareutveckling](CONTRIBUTING.md). Ändringar i Zeekrs API kan göra att appen slutar fungera. Delningen innebär inget löfte om underhåll eller support.
