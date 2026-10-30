# Distribution and optional Homey App Store submission

[Svenska](PUBLICERA_SV.md) · [GitHub releases](https://github.com/homeyrglabs/Zeekr-Homey/releases)

**v0.2.1 is distributed through GitHub. Publishing there does not publish to the Homey App Store.** Users install the package with Homey CLI using their own accounts. See [SETUP.md](SETUP.md) and [GITHUB_SETUP.md](GITHUB_SETUP.md).

## Optional technical upload to Athom

Only perform this if you separately choose to submit the app to Athom. From the app folder:

```powershell
homey.cmd login
homey.cmd app validate --level publish
homey.cmd app publish
```

Technical validation is not certification approval. Follow the current developer portal and [official publishing guide](https://apps.developer.homey.app/app-store/publishing). Review the [App Store guidelines](https://apps.developer.homey.app/app-store/guidelines) before submission.

## Remaining certification work

- Verify every advertised command and failure case against the supported vehicle models. Pairing alone does not verify charging, climate or unlocking.
- Review product-specific artwork and representations against Athom’s image guidelines; the existing artwork is a generic EV symbol.
- Review English and Swedish UI on a real Homey. Automated locale tests are not a substitute for physical-device testing.
- Preserve the original MIT licenses and explain the Fryyyyy port and Wysie tools in review information. Check Athom’s current requirements for third-party code and author permission.
- Consider the ownership and maintenance responsibilities of an App Store listing. The as-is notice does not replace Athom’s review or policies.

No Homey App Store submission or certification is implied by the GitHub release.
