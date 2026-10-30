# Complete setup

1. Download `Zeekr_Homey_v0.2.1.zip` from [the latest release](https://github.com/homeyrglabs/Zeekr-Homey/releases/latest) or [all releases](https://github.com/homeyrglabs/Zeekr-Homey/releases) and extract it completely. **Code → Download ZIP** also works. The extracted root contains the two Windows scripts and the `app` folder.
2. Install Node.js **24+** from https://nodejs.org/ for Homey CLI and Python **3.10+** with the `py` launcher from https://www.python.org/downloads/windows/ for extraction. Use Homey Pro software **12.9.0+** and preferably the same local network as the computer.
3. Follow [KEYS.md](KEYS.md) to obtain the exact EU 2.9.9 XAPK, run **EXTRACT_KEYS_WINDOWS.cmd**, and create your private JSON. No phone downgrade, emulator or USB cable is needed for that route. A hash mismatch means this build is unsupported; do not bypass it.
4. Read and run **INSTALL_WINDOWS.cmd**. It pauses before starting, installs Homey CLI, opens your own Homey account login and installs to your selected Homey. Confirm that Zeekr appears in Homey Apps.
5. Add a device in Homey: **Zeekr → Zeekr (EU)**. Enter your own Zeekr account, your EU country code, app version **2.9.9** for the guide’s key file, and interval **300** seconds. Import `zeekr_homey_secrets_EU_2.9.9.json` from your private `Zeekr-Private` folder. Save and select the vehicle. Pairing, settings and runtime messages support English and Swedish according to Homey’s language. A separate account with shared vehicle access can avoid conflicts with the phone app’s session.
6. Compare battery level and range against the Zeekr phone app. Check charging/plug state while connected. If testing a command, do one at a time and confirm the result on the car. An accepted API request is not proof that the vehicle performed it. Commands are not verified for all models.

## Manual installation

From the extracted root on Windows:

```powershell
npm.cmd install --global homey@4.6.2
homey.cmd login
cd app
homey.cmd app install
```

On macOS/Linux, use `npm`, `homey login`, `cd app`, `homey app install` in place of the .cmd commands. See [KEYS.md](KEYS.md) for the Python extraction commands on those platforms.

## Update

Leave the existing app installed. Install from the new package and do not use `--clean`. Keep a working account configuration and key file. The app ID is unchanged.

## Troubleshooting

“Missing File” during installation: one retry succeeded for the first tester, but the cause has not been diagnosed. If it persists, record the error and the outputs of `node --version` and `homey --version` for independent troubleshooting. Successful validation is not confirmation of installation. See [KEYS.md](KEYS.md) for extraction and Zeekr authentication errors.

Never share the key JSON or account credentials. This project is shared as-is without a commitment to ongoing maintenance or support.

## Expanded controls

See [FEATURES.md](FEATURES.md) before trying the added commands. For downloads, use [the latest release](https://github.com/homeyrglabs/Zeekr-Homey/releases/latest) or [all releases](https://github.com/homeyrglabs/Zeekr-Homey/releases). First-time setup needs key extraction; a normal update does not.
