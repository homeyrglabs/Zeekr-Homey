# Zeekr 🚘
### European Zeekr vehicles in Homey Pro

**Unofficial community port — original Zeekr API work by Fryyyyy, key tools by Wysie.**

Follow your car’s battery, range and charging status in Homey, and use supported charging/climate requests in Flows. Shared by [homeyrglabs](https://github.com/homeyrglabs); the original API research and implementation remain credited to their authors.

**Shared as-is. No ongoing maintenance, updates, response times or support are promised. Independent forks are welcome.**

[🇸🇪 Svenska](README.sv.md) · [Complete setup](SETUP.md) · [Extract API keys](KEYS.md)

---

## ✨ Features

- Battery level, range, charging and cable state supplied by Zeekr EU
- Charging power, current/voltage and other telemetry when provided by the API
- Cabin temperature, climate and lock state, odometer and tyre pressures
- Homey Flow cards for charging and cabin climate requests
- Runs directly on Homey Pro; Home Assistant is not required
- Free source distribution with the original MIT notices preserved

An accepted API request does not prove that the car performed the action. Verify commands against vehicle status.

---

## 📱 Compatibility and status

| Item | Status |
| --- | --- |
| Homey Pro | Software 12.9.0 or newer required |
| Zeekr EU account | Required, with access to the vehicle |
| Zeekr 001 | One user reported installation/pairing with the original 0.1.0 beta |
| Other Zeekr models | Not verified by this port |
| Charging / climate commands | Need actual vehicle testing; not verified for all models |
| Included key extraction route | Exact analysed EU Android 2.9.9 build only |
| EU Android 3.1.1 key extraction | Not a complete supported setup route |
| Homey Cloud / Bridge without Homey Pro | Not supported |

Version **0.1.2** is a community beta for installation with Homey CLI. It is not a Homey App Store release. Settings, pairing and several runtime messages are currently Swedish. Existing 28 automated tests and technical publish validation pass; that does not establish compatibility with every vehicle or command.

---

## 🏠 Installation

### Download

Open this repository’s **Releases** and download **Zeekr_Homey_v0.1.2.zip**. Alternatively, use **Code → Download ZIP** for the source tree. Extract the complete ZIP.

### Requirements

- Homey Pro software **12.9.0+**
- A computer with **Node.js 24+** for the included Homey CLI
- **Python 3.10+** for the documented offline key extraction
- Your own Zeekr EU account and a complete valid EU API key JSON

### Getting started

1. Follow [the complete setup](SETUP.md).
2. Follow [the key extraction guide](KEYS.md), then run **EXTRACT_KEYS_WINDOWS.cmd** with the documented EU 2.9.9 XAPK. It writes your private JSON outside the repository and never prints key values.
3. Run **INSTALL_WINDOWS.cmd** to install the app using your own Homey login.
4. Add **Zeekr → Zeekr (EU)** in Homey.
5. Enter your Zeekr account, EU country code, **app version 2.9.9** for that key file, and an initial interval of **300 seconds**.
6. Import your own key JSON, save and select the vehicle. Compare reported values against the phone app.

No APKs, API key values or account credentials are included. Your phone can keep its current app version.

### Manual installation

From the extracted repository root on Windows:

```powershell
npm.cmd install --global homey@4.6.2
homey.cmd login
cd app
homey.cmd app install
```

On macOS/Linux use `npm` and `homey` without `.cmd`; see [SETUP.md](SETUP.md) and [KEYS.md](KEYS.md).

For updates, leave the existing app installed, do not use `--clean`, and keep a working account configuration. The app ID remains `com.rglabs.zeekr`.

---

## 🔑 Key extraction

The included wrapper checks the exact EU 2.9.9 APK hashes before invoking Wysie’s bundled, unmodified MIT extractor. It uses the production signing candidate identified from that build’s bytecode. Other builds are refused; the check must not be bypassed.

[**English: extract your key file**](KEYS.md) · [**Svenska: ta fram nyckelfilen**](KEYS.sv.md)

The analysis runs locally and does not require a phone cable, BlueStacks, root or a phone downgrade for this route. Successful extraction does not guarantee continued server acceptance. Authentication is tested later by your Homey.

---

## ⚡ Homey Flows

Use the supplied cards to refresh status, check charging/cable/lock/battery conditions and request charging or cabin climate start/stop. Triggers report changes after valid API readings.

Capabilities depend on what Zeekr supplies for your vehicle. Test one manual command at a time and confirm its effect. No digital driving key or Bluetooth functionality is included.

---

## 🧰 Maintenance and independent forks

This project is provided for download and independent reuse. There is no promise to respond to support requests, review pull requests or repair API changes. Zeekr API changes can stop the integration from working.

If you wish to continue development, fork the repository, preserve the license notices and document your own changes and vehicle tests. Please do not send Homey-port support requests to the original API/tool authors. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 🧑‍💻 Original projects

- [**Fryyyyy / zeekr_ev_api**](https://github.com/Fryyyyy/zeekr_ev_api): EU API protocol, authentication, request signing and VIN encryption.
- [**Fryyyyy / zeekr_homeassistant**](https://github.com/Fryyyyy/zeekr_homeassistant): telemetry and charging/climate command mappings.
- [**Wysie / zeekr_key_extractor**](https://github.com/Wysie/zeekr_key_extractor): desktop APK analysis and runtime extraction tools.

**homeyrglabs** distributes this Homey adaptation. This is not a claim to original authorship of the Zeekr API. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [UPSTREAM_VERSIONS.json](UPSTREAM_VERSIONS.json) for exact provenance.

---

## 🔒 Privacy

The app uses your Zeekr EU account to communicate directly with Zeekr’s cloud. Credentials, extracted API values and a reusable session are stored in Homey app settings. No RG Labs account or separate Home Assistant server is required.

Keep your key JSON outside the repository. Never publish passwords, sessions, personal logs or APK files. The root `.gitignore` excludes common private/generated files; inspect what you publish as well.

---

## ⚠️ Disclaimer

This is an independent community integration, not affiliated with or endorsed by Zeekr or Athom. Availability, compatibility and successful vehicle commands cannot be guaranteed. It is shared as-is under the included license terms.

---

## 📄 Source code and license

This repository includes the Homey source code and tools for independent reuse. Original MIT license texts and copyright notices are preserved in [LICENSE](LICENSE), `app/LICENSE`, `app/licenses/` and the included upstream sources.

See the [complete setup](SETUP.md), [Swedish setup](SETUP.sv.md) and [third-party notices](THIRD_PARTY_NOTICES.md).
