# Publicera Zeekr på Homey

Version 0.1.2 kan laddas upp som ett utkast efter teknisk publiceringsvalidering. Validering innebär inte att Athom kommer att godkänna appen.

## Windows

Packa upp ZIP-filen. Kör från den nya `app`-mappen:

```powershell
homey.cmd login
homey.cmd app validate --level publish
homey.cmd app publish
```

CLI kan fråga om versionsnummer och ändringslogg. Ett GitHub-repository krävs inte för uppladdning. Om mappen redan är ett Git-repository kan CLI också fråga om ändrade filer.

Efter uppladdning: öppna https://tools.developer.homey.app, välj Apps SDK / My Apps, öppna Zeekr och byggversionen. För en helt ny app krävs certifiering innan andra användare kan installera den från butiken, även via testlänk. För endast testutgivning: avmarkera automatisk publicering efter godkännande och följ portalens aktuella val.

## Återstår före certifiering

- Parkopplings- och inställningssidor samt flera drift-/felmeddelanden är fortfarande på svenska. Engelska krävs och fullständiga konsekventa översättningar behöver göras före inskickning för granskning.
- Nuvarande omslagsbild är en generell illustration. Athom bedömer bildens relevans; en mer produktspecifik bild kan behövas.
- Bekräfta alla funktioner som beskrivs i butiken mot verklig bil, inklusive Flow-kommandon och felhantering. En lyckad parkoppling räcker inte som test av laddstart eller klimat.
- Bevara originalens MIT-licenser och ange i granskningsinformationen att detta är en port av Fryyyyys projekt med nyckelverktyg av Wysie. Athoms riktlinjer efterfrågar också tillstånd från originalförfattare när deras kod används; hänvisa till de medföljande MIT-licenserna och förklara användningen.

Appen publiceras under ditt Athom-konto. En text om att underhåll inte utlovas ersätter inte Athoms granskning; appar som slutar fungera eller inte längre underhålls kan tas bort.

Källor: https://apps.developer.homey.app/app-store/publishing och https://apps.developer.homey.app/app-store/guidelines
