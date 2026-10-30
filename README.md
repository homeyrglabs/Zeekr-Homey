# Zeekr 🚘
### European Zeekr vehicles in Homey Pro

**[Download the latest release](https://github.com/homeyrglabs/Zeekr-Homey/releases/latest) · [All releases and downloads](https://github.com/homeyrglabs/Zeekr-Homey/releases)**

**Current community release: v0.2.1.** Download `Zeekr_Homey_v0.2.1.zip` under **Assets**, extract the complete package and follow [the setup guide](SETUP.md).

[🇸🇪 Svenska](README.sv.md) · [Setup](SETUP.md) · [Extract API keys](KEYS.md) · [All features and limitations](FEATURES.md)

Unofficial Homey port of **Fryyyyy’s Zeekr EV API and Home Assistant integration**, with key tools by **Wysie**. Distributed through **homeyrglabs/Zeekr-Homey**. Original authors retain credit for the API research and implementation; original MIT notices are preserved. See [third-party notices](THIRD_PARTY_NOTICES.md).

**Shared as-is. No ongoing maintenance, updates, support or response times are promised. Independent forks are welcome. Not affiliated with Zeekr or Athom.**

## Features

- Battery, range, charging, cable state, charging power, cabin temperature, odometer and tyre pressures.
- Explicit cloud requests for door locking/unlocking, trunk/front hood release, windows, sunshade, charge lid and locator lights/horn.
- Charging and cabin climate, defrost, steering wheel and seat heating, front seat ventilation, short ventilation cycle and sentry requests.
- Charging limit, charging schedule and one-time departure schedule requests.
- Additional reported door/window/lock states, seat settings, tyre temperatures/warnings, coordinates, charging and trip readings, and schedule status.
- English and Swedish pairing, settings, capabilities, Flow cards and runtime messages. English fallback for other Homey languages.
- Runs directly on Homey Pro; Home Assistant is not required.

See [FEATURES.md](FEATURES.md) for the complete control table, replacement behavior of schedules and limitations. The expansion adds **28 Flow actions and ten device buttons** to the original controls.

**New vehicle commands are tested with simulated responses, not against a real car.** Availability depends on model, region, firmware, account permissions and vehicle state. An accepted request does not prove that the car performed it. Lock status changes only after reported telemetry confirms it. No Bluetooth/digital driving key, proximity unlocking or camera access is included.

## Requirements and status

| Item | Requirement / status |
|---|---|
| Homey | Homey Pro, software 12.9.0+; Homey Cloud/Bridge alone is not supported |
| Installation computer | Node.js 24+ for Homey CLI 4.6.2 |
| Key extraction | Python 3.10+; exact analysed EU Android 2.9.9 build only |
| Zeekr account | Your own EU account with access to the vehicle; a separate shared account is preferred |
| Zeekr 001 | Initial installation/pairing reported by one user; expanded commands still require vehicle testing |
| Other models / EU 3.1.1 extraction | Not verified; 3.1.1 is not a complete supported extraction route |
| Distribution | GitHub community release, **not a certified Homey App Store app** |

## Install or update on Windows

1. Open **[the latest release](https://github.com/homeyrglabs/Zeekr-Homey/releases/latest)** or **[all releases](https://github.com/homeyrglabs/Zeekr-Homey/releases)**, then download **Zeekr_Homey_v0.2.1.zip** under Assets.
2. Extract the complete ZIP. Read [SETUP.md](SETUP.md).
3. For a first installation, follow [KEYS.md](KEYS.md) and run `EXTRACT_KEYS_WINDOWS.cmd` to create your own private key JSON. No APKs or keys are included.
4. Install [Node.js 24+](https://nodejs.org/), then read and run `INSTALL_WINDOWS.cmd`. Sign in with your own Homey account and select your Homey.
5. For a first installation, add **Zeekr → Zeekr (EU)**, enter your own Zeekr account and EU country code, and import your key file. Use API app version **2.9.9** for keys from the included extraction guide.
6. Compare readings with the phone app. Test one manual command at a time beside the vehicle, with your regular key available.

**Updating:** install on the same Homey without uninstalling first or using `--clean`. Keep your working account, keys and API app-version setting. The app ID remains `com.rglabs.zeekr`; new capabilities are added to an existing device when the app starts. Downloading a new GitHub release does not update Homey automatically.

Manual PowerShell installation from the extracted root:

```powershell
npm.cmd install --global homey@4.6.2
homey.cmd login
cd app
homey.cmd app install
```

macOS/Linux: use `npm` and `homey` without `.cmd`. **Code → Download ZIP** downloads the current main source tree; tagged release ZIPs provide a specific version.

## Polling and privacy

Default polling is **300 seconds**, configurable between 60 and 3600 seconds. Requests take additional time. A follow-up refresh is scheduled 35 seconds after an accepted command. A displayed value age in Homey can indicate its last change; a successful cloud fetch does not prove that a sleeping vehicle supplied fresh telemetry.

Credentials, extracted API values and the reusable session are stored in your Homey app settings. Vehicle coordinates may be displayed when returned. Keep private key files outside the repository. Never publish keys, passwords, sessions, VINs, precise coordinates, personal logs or APKs.

## Original projects and license

- [Fryyyyy / zeekr_ev_api](https://github.com/Fryyyyy/zeekr_ev_api): protocol, authentication, signing and VIN encryption.
- [Fryyyyy / zeekr_homeassistant](https://github.com/Fryyyyy/zeekr_homeassistant): telemetry, controls and schedule mappings.
- [Wysie / zeekr_key_extractor](https://github.com/Wysie/zeekr_key_extractor): APK analysis and runtime extraction tools.

See [LICENSE](LICENSE), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), [UPSTREAM_VERSIONS.json](UPSTREAM_VERSIONS.json), [validation report](TEST_REPORT.md) and [independent continuation](CONTRIBUTING.md). Zeekr API changes can stop this integration from working. Sharing it does not create a maintenance or support commitment.
