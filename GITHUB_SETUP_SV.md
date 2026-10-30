# GitHub-distribution och egna utgåvor

[English](GITHUB_SETUP.md) · [Senaste versionen](https://github.com/homeyrglabs/Zeekr-Homey/releases/latest) · [Alla versioner](https://github.com/homeyrglabs/Zeekr-Homey/releases)

Repot är [homeyrglabs/Zeekr-Homey](https://github.com/homeyrglabs/Zeekr-Homey). README och `app/` ligger direkt i roten tillsammans med verktyg, originalkällor, MIT-licenser och guider på båda språken. Vibio-projektet är strukturförebild, inte källa till Zeekrs protokoll.

## Källkod

Använd GitHub Desktop eller git så att kataloger och punktfiler följer med: `.gitignore`, `.gitattributes` och `app/.homeycompose`. Webbuppladdningar måste göras till rätt katalog och inom GitHubs gräns per uppladdning. Publicera aldrig privata nyckelfiler, APK-filer, inloggning, sessioner, VIN, exakta koordinater eller personliga loggar.

Arbeta på en gren, granska ändringarna och kör från `app/`:

```text
node --test tests/*.test.js
homey app validate --level publish
```

Slå därefter ihop granskade ändringar till `main`. Behåll upphovspersonernas MIT-licenser och källhänvisningar. Teknisk validering bevisar inte stöd på en verklig bil.

## Release

1. Öppna [Releases](https://github.com/homeyrglabs/Zeekr-Homey/releases) → **Draft a new release**.
2. Skapa en ny versionstagg från granskad main-kod. Versionen ska stämma med appens manifest och package.json; aktuell version är **v0.2.1**.
3. Skriv engelska och svenska versionsnoteringar med uppdateringssteg, verkliga testresultat och kvarvarande begränsningar. Använd inga @-omnämnanden av originalförfattarna.
4. Bifoga hela `Zeekr_Homey_v0.2.1.zip` med app, verktyg, guider och MIT-licenser. Uteslut genererade byggmappar och privata filer.
5. För ordinarie community-version: välj **Set as the latest release** och publicera. Separata experimentella förhandsversioner markeras **Pre-release**. GitHubs etikett garanterar inte bilstöd eller Homey-certifiering.
6. Kontrollera tagg, nedladdningsfilens kontrollsumma och [senaste versionen](https://github.com/homeyrglabs/Zeekr-Homey/releases/latest). Behåll en tydlig länk till [alla versioner](https://github.com/homeyrglabs/Zeekr-Homey/releases) i båda README-filerna och setupguiderna.

## Underhåll

Projektet delas i befintligt skick utan löfte om underhåll eller support. Andra får gärna skapa forks. Att ändra Issues/Wiki eller arkivera repot är valfria ägarbeslut och behövs inte för publicering. Arkivering gör repot skrivskyddat tills det avarkiveras.

[GitHubs dokumentation om releaser](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository).
