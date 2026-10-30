# Extract the Homey API key JSON (Windows)

[Download latest release](https://github.com/homeyrglabs/Zeekr-Homey/releases/latest) · [All releases](https://github.com/homeyrglabs/Zeekr-Homey/releases) · [Svenska](KEYS.sv.md)


These are API signing/encryption values, not the car’s digital driving key. They come from the Android app files, not Homey. No key values are included in this repository.

## Supported route

The bundled adapter supports **only the exact analysed Zeekr EU 2.9.9 build**, package **com.zeekr.overseas**. It analyses the files locally; you do not need to install the old app, downgrade your phone, connect a cable, use BlueStacks or root a device. Extraction of all six fields was verified for that build. Continued acceptance by Zeekr’s server is not guaranteed and is not tested by the extractor.

## 1. Prepare

Download the repository/release ZIP and extract it completely. Install Python 3.10+ from https://www.python.org/downloads/windows/, including the `py` launcher. Check `py -3 --version` in a new terminal. Allow about 1 GB of temporary disk space.

## 2. Obtain the EU 2.9.9 XAPK

Use a copy you have access to. The third-party download page used during analysis was:

https://apkpure.net/zeekr/com.zeekr.overseas/download/2.9.9

APKPure is not Zeekr’s own website. Check **EU**, **2.9.9**, **com.zeekr.overseas**, about **236 MB**, **XAPK**. Only save the file to the computer; installing an APKPure app or the old Zeekr app is not required. Do not use com.zeekr.global.

The adapter reads `com.zeekr.overseas.apk` and `config.arm64_v8a.apk` from the archive. It checks both against the exact APK hashes listed below. A different build is rejected even if it has the same displayed version number. Do not disable that check.

## 3. Extract

Read and run **EXTRACT_KEYS_WINDOWS.cmd** in the extracted repository folder. It creates a local Python environment at `%LOCALAPPDATA%\HomeyZeekrTools\venv`, installs the two extractor dependencies, then asks for the path to the XAPK. Paste or drag the file path into the terminal and press Enter. Internet is needed for the Python dependencies, but the APK analysis itself is offline.

On success, it prints **Complete six-field JSON saved locally** and the output path. It does not print key values. The default path is:

```text
C:\Users\YOUR_WINDOWS_NAME\Zeekr-Private\zeekr_homey_secrets_EU_2.9.9.json
```

Existing output files are never overwritten. For a different output name, run `tools/extract_eu_299.py` from the prepared Python environment with `--output` pointing to a new private file. The JSON contains `hmac_access_key`, `hmac_secret_key`, `password_public_key`, `prod_secret`, `vin_key` and `vin_iv`.

Wysie’s original extractor finds several production-secret candidates. This adapter selects the one identified from the exact build’s PROD signing bytecode, rather than blindly using the first or trying several values against the server. The original extractor is unmodified and its hash is checked too.

## 4. Import

Follow [SETUP.md](SETUP.md) to install the app. Add **Zeekr → Zeekr (EU)** in Homey, enter your Zeekr account there, set your EU country code (SE for Sweden), **app version 2.9.9**, and an initial interval of 300 seconds. Import the JSON from the private output folder, save and select your vehicle. Your phone can keep its existing app version. For an update, keep a working stored account configuration.

## Terminal and macOS/Linux

From the repository root:

```sh
python3 -m venv ~/.homey-zeekr-tools
~/.homey-zeekr-tools/bin/python -m pip install -r tools/requirements-extract.txt
~/.homey-zeekr-tools/bin/python tools/extract_eu_299.py /path/to/ZEEKR_2.9.9.xapk
```

With separate APKs from the exact analysed build, pass the base APK as the input and the split with `--arm64 /path/to/arm64.apk`. With an existing output file, choose a new `--output` filename.

## Errors and limits

- **Hashes do not match:** stop. Check EU package/version; this adapter cannot validate another build.
- **Missing archive entries:** wrong package/archive, or you supplied a standalone APK without --arm64.
- **Output already exists:** preserve the existing file or choose another output name.
- **Dependencies missing:** rerun the Windows wrapper and resolve any pip errors.
- **Homey 079021:** possible account/session conflict. Prefer a separate account with shared vehicle access.
- **Homey 079025:** signing or VIN encryption was rejected. Check the country and app-version settings; old keys may no longer be accepted. A complete JSON is not proof of current server compatibility.
- **No vehicles:** check account access and acceptance of shared access.

The adapter does not support EU 3.1.1 or other builds. USB debugging only allows copying APKs; it does not automatically expose runtime secrets. BlueStacks with ADB is not automatically rooted. Only three fields were verified from the analysed 3.1.1 build using a different method; that is not a complete setup route. Wysie’s Frida methods are version-specific; see the included original documentation instead of assuming compatibility.

Never upload your JSON, account details, sessions, personal logs or APKs to GitHub. Original extractor source and MIT license: [Wysie](https://github.com/Wysie/zeekr_key_extractor), `tools/wysie-key-extractor/LICENSE`.

## Exact analysed build hashes

Base APK SHA-256: `dbafb39c8f001f85e2eb621b06a518bccb47a28b392901f44eea847b5423a301`

ARM64 APK SHA-256: `8f2f4cf71eac73c6b8329c456d0a5f68f3688fc0901bc94548bb9581c5f7caaa`

These hashes identify files, not API keys. For the optional Android copying route, see [ADB.md](ADB.md).
