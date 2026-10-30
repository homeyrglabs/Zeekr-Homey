# Zeekr 🚘
### Europeiska Zeekr-bilar i Homey Pro

**Ny beta 0.2.0:** [Funktioner, begränsningar och uppdatering](FEATURES.sv.md). Lås/upplåsning och fler molnkommandon är tillagda men inte provade mot en riktig bil. Välj beta-paketet i Releases för att testa.

**Börja här:** [Komplett setup](SETUP.sv.md) → [Ta fram nyckelfilen](KEYS.sv.md) → installera och anslut bilen.

Inofficiell Homey-port baserad på **Fryyyyys** Zeekr EV API och Home Assistant-integration, med nyckelverktyg av **Wysie**. Distribueras under **homeyrglabs/Zeekr-Homey**. Originalprojektens upphovspersoner får erkännandet för API-arbetet. Länkar och MIT-licenser finns i [källhänvisningarna](THIRD_PARTY_NOTICES.md).

**Delas i befintligt skick. Inget löfte om underhåll, uppdateringar eller support. Andra får gärna skapa en fork och fortsätta arbetet. Ingen officiell koppling till Zeekr eller Athom.**

## Installera på Windows

1. Öppna **Releases** i repot och hämta `Zeekr_Homey_v0.1.2.zip`. **Code → Download ZIP** fungerar också.
2. Packa upp hela ZIP-filen.
3. Installera [Node.js 24 eller senare](https://nodejs.org/) på datorn. Homey behöver vara **Homey Pro med programvara 12.9.0 eller senare**.
4. Läs och starta `INSTALL_WINDOWS.cmd`. Skriptet pausar före start, installerar Homey CLI och låter dig logga in med ditt eget Homey-konto och välja Homey.
5. Öppna Homey och lägg till **Zeekr → Zeekr (EU)**.
6. Ange ditt eget Zeekr-konto, EU-landkod och appversionen som passar dina extraherade nycklar. Importera din egen kompletta nyckelfil. Inga nycklar medföljer.

Du kan också köra detta manuellt i PowerShell från den uppackade mappen:

```powershell
npm.cmd install --global homey@4.6.2
homey.cmd login
cd app
homey.cmd app install
```

Vid uppdatering: avinstallera inte först och använd inte `--clean`. Behåll fungerande kontoinställningar. Det interna app-ID:t är oförändrat.

## Status

Community-beta. En användare har rapporterat lyckad installation och parkoppling med 0.1.0. Alla modeller och bilkommandon är inte verifierade. 28 automatiska tester och Homeys tekniska publiceringsvalidering passerar för 0.1.2. Paketet är inte certifierat för Homey App Store. Home Assistant behövs inte. Homey Cloud/Bridge utan Homey Pro stöds inte.

Appen använder Zeekrs moln och kan sluta fungera när API:t ändras. Ett accepterat kommando behöver bekräftas med bilens status. Digital nyckel och Bluetooth ingår inte.

Dela aldrig dina nycklar, lösenord, sessioner, personliga loggar eller APK-filer i repot. Läs [README på engelska](README.md), [START_HAR.md](START_HAR.md) och [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) för detaljer.
