# Distribution och eventuell Homey App Store-publicering

[English](PUBLISHING.md) · [GitHub Releases](https://github.com/homeyrglabs/Zeekr-Homey/releases)

**v0.2.1 distribueras via GitHub. Det publicerar inte appen i Homey App Store.** Användare installerar via Homey CLI med egna konton. Se [SETUP.sv.md](SETUP.sv.md) och [GITHUB_SETUP_SV.md](GITHUB_SETUP_SV.md).

## Valfri teknisk uppladdning till Athom

Gör detta bara om du separat väljer att skicka in appen till Athom. Kör från appmappen:

```powershell
homey.cmd login
homey.cmd app validate --level publish
homey.cmd app publish
```

Teknisk validering innebär inte godkänd certifiering. Följ den aktuella utvecklarportalen och [publiceringsguiden](https://apps.developer.homey.app/app-store/publishing). Granska även [butiksriktlinjerna](https://apps.developer.homey.app/app-store/guidelines).

## Återstår före certifiering

- Verifiera alla annonserade kommandon och fel på stödda bilmodeller. Parkoppling räcker inte som test av laddning, klimat eller upplåsning.
- Granska produktspecifika bilder mot Athoms riktlinjer. Nuvarande bild är en generell elbilssymbol.
- Kontrollera engelska och svenska vyer på en fysisk Homey. Språktester ersätter inte sådan kontroll.
- Bevara originalens MIT-licenser och förklara Fryyyyy-porten och Wysies verktyg i granskningsinformationen. Kontrollera aktuella krav för tredjepartskod och tillstånd.
- Ta ställning till ansvar och underhåll för en butiksapp. En text om befintligt skick ersätter inte Athoms granskning och policy.

GitHub-releasen innebär ingen inskickning eller certifiering i Homey App Store.
