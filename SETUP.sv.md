# Komplett setup: från nedladdning till bil i Homey

## 1. Hämta och packa upp

Öppna **Releases** på GitHub-repot. Hämta `Zeekr_Homey_v0.1.2.zip` och packa upp hela filen, exempelvis till `C:\Zeekr`. Du ska se README, `EXTRACT_KEYS_WINDOWS.cmd`, `INSTALL_WINDOWS.cmd` och mappen `app`. **Code → Download ZIP** fungerar också.

## 2. Installera datorverktygen

- [Node.js 24 eller senare](https://nodejs.org/) för Homey CLI.
- [Python 3.10 eller senare](https://www.python.org/downloads/windows/) med Python launcher för nyckelextraktionen.

Homey måste vara **Homey Pro 12.9.0 eller senare**. Datorn och Homey bör vara på samma lokala nätverk vid installationen.

## 3. Skapa din nyckelfil

Följ hela [KEYS.sv.md](KEYS.sv.md): hämta den specificerade EU 2.9.9-XAPK-filen, kör `EXTRACT_KEYS_WINDOWS.cmd` och välj filen. Det färdiga resultatet sparas i din privata Windows-mapp `Zeekr-Private`. Du behöver inte ändra appen på mobilen och inga nycklar medföljer i repot.

Skriptet stöder bara den exakta builden som verifierats. Om det stoppar på hashkontrollen har du inte rätt fil och setupen ska inte fortsätta med gissade nycklar.

## 4. Installera Homey-appen

Läs och kör **INSTALL_WINDOWS.cmd** i den uppackade mappen. Det pausar före start, installerar Homey CLI, öppnar inloggningen till ditt eget Homey-konto och installerar på den Homey du väljer.

Alternativt kör du från mappens rot i PowerShell:

```powershell
npm.cmd install --global homey@4.6.2
homey.cmd login
cd app
homey.cmd app install
```

Om installationen säger **Missing File**: försök samma installationskommando en gång till. Felet är inte diagnostiserat i denna port. Kvarstår det, spara feltext och versionerna från `node --version` och `homey.cmd --version` för egen felsökning. En lyckad CLI-validering garanterar inte att uppladdningen lyckats. Kontrollera i Homey att appen faktiskt installerats.

## 5. Anslut bilen

Öppna **Homey → Enheter → + → Ny enhet → Zeekr → Zeekr (EU)**.

1. Ange ditt Zeekr-kontos e-postadress och lösenord direkt i Homey. Använd helst ett separat konto som du delar bilen med, för att minska sessionskonflikter.
2. Land: **SE** för Sverige.
3. Zeekr-appversion: **2.9.9** om du följt nyckelguiden.
4. Uppdateringsintervall: **300 sekunder**.
5. Välj JSON-filen `zeekr_homey_secrets_EU_2.9.9.json` från `Zeekr-Private`.
6. Tryck **Spara och anslut** och välj bilen.

## 6. Kontrollera resultatet

Jämför batterinivå och räckvidd med Zeekr-appen. Kontrollera laddkabel/laddstatus när bilen är ansluten. Testa därefter, om du vill, ett manuellt Flow-kommando i taget och kontrollera resultatet på bilen. Ett accepterat API-kommando är inte bevis för att bilen har utfört det. Bilkommandon ska inte betraktas som verifierade för alla modeller.

## Uppdatera senare

Packa upp den nya versionen och kör installationen igen. Avinstallera inte appen först och använd inte `--clean`. Behåll en fungerande konfiguration och nyckelfil; byt inte appversion eller konto enbart för en grafik-/dokumentationsuppdatering.

## Delning och support

Dela repolänken eller release-ZIP-filen, aldrig din privata nyckelfil eller inloggning. MIT-licenser och källhänvisningar ska följa med. Projektet delas i befintligt skick utan löfte om löpande underhåll eller support.
