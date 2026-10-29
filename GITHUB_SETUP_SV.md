# Lägg upp paketet på ditt GitHub-konto

Föreslaget reponamn: **Zeekr-Homey**. Beskrivning: **Unofficial Homey Pro port of Fryyyyy’s Zeekr projects. Shared as-is; no ongoing maintenance or support promised.**

Målet är **https://github.com/homeyrglabs/Zeekr-Homey**. Vibio-Fun-Homey är strukturförebild för projektsidan, inte källa till Zeekrs API-kod.

## Skapa repot och ladda upp

1. Logga in på GitHub och öppna https://github.com/new. Välj organisationen **homeyrglabs**, namn `Zeekr-Homey` och **Public**. Skapa ett tomt repo utan extra README, gitignore eller licens eftersom allt redan finns i paketet.
2. På det tomma repots sida väljer du **uploading an existing file**. På ett befintligt repo: **Add file → Upload files**.
3. Ladda upp i två omgångar eftersom GitHub tillåter högst 100 filer åt gången: först mappen `app` och alla filer direkt i `Zeekr-Homey` (cirka 86 filer totalt). Gör en commit. Ladda sedan upp mapparna `tools` och `upstream-reference` (cirka 32 filer) och gör en andra commit. Dra in innehållet, inte själva ZIP-filen eller den yttre `Zeekr-Homey`-mappen. README.md och app ska ligga direkt i repots rot. Ta med `.gitignore`, `.gitattributes` och `app/.homeycompose`. Om webbläsaruppladdningen utelämnar punktfiler: använd GitHub Desktop för hela mappen i stället.
4. Skriv `Initial Zeekr community release` och välj **Commit changes**.
5. Kontrollera att `app/.homeycompose/app.json`, `app/app.json`, `app/LICENSE` och README.md verkligen finns. Paketet innehåller drygt 100 filer och laddas därför upp i två omgångar enligt steg 3.

## Gör en release med tydlig nedladdning

1. Öppna **Releases → Draft a new release**.
2. Skapa taggen **v0.1.2**, riktad mot huvudgrenen. Titel: **Zeekr 0.1.2 — community beta**.
3. Klistra in texten i RELEASE_NOTES.md. Använd inte @-omnämnanden för upphovspersonerna.
4. Lägg till den separat medföljande filen **Zeekr_Homey_v0.1.2.zip** som nedladdningsfil.
5. Markera **This is a pre-release**, eftersom fullständig modell- och kommandotestning återstår. Välj **Publish release** när du är redo.

## Begränsa underhåll

Öppna **Settings → General → Features** och stäng av **Issues**, **Discussions** och **Wiki** om de är aktiverade. Lägg README.md som startsida och behåll informationen om att support/underhåll inte utlovas.

Om du vill att repot enbart ska vara en läsbar distribution: publicera releasen först och välj därefter **Settings → General → Danger Zone → Archive this repository**. Arkivering gör repo, pull requests och releases skrivskyddade. Du kan avarkivera senare. Besökare kan fortfarande ladda ner och skapa egna forks. Arkivering sker inte automatiskt i detta paket.

Dela länken till repot eller dess releasesida. De som installerar använder egna Homey- och Zeekr-konton och en egen nyckelfil.

Källor: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository
https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories
