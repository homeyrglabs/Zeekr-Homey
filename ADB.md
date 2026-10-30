# Copy your own Android APKs with ADB (optional)

[Svenska](ADB.sv.md) · [Latest release](https://github.com/homeyrglabs/Zeekr-Homey/releases/latest) · [All releases](https://github.com/homeyrglabs/Zeekr-Homey/releases)

This copies installed application files. It does not extract all runtime keys from newer protected builds. The complete, version-specific extraction route is in [KEYS.md](KEYS.md).

1. Download Android SDK Platform-Tools for Windows from [Google](https://developer.android.com/tools/releases/platform-tools) and extract to `C:\Zeekr\platform-tools`.
2. Enable Android Developer options and USB debugging. Connect a data cable, unlock the phone and approve the computer’s RSA fingerprint on the phone. Exact menu names vary.
3. In PowerShell:

```powershell
cd C:\Zeekr\platform-tools
.\adb.exe devices
```

The status must be **device**. For **unauthorized**, approve the phone’s dialog and run the command again. If both an emulator and phone appear, disconnect the one you are not using or add `-s SERIAL_NUMBER` to each ADB command.

4. List installed APK paths:

```powershell
.\adb.exe shell pm path com.zeekr.overseas
```

5. Copy the base and ARM64 APKs into a private folder using the paths returned by your device:

```powershell
$apkFolder = Join-Path $env:USERPROFILE 'Zeekr-Private\apks'
New-Item -ItemType Directory -Force -Path $apkFolder | Out-Null
$apkPaths = .\adb.exe shell pm path com.zeekr.overseas
$basePath = ($apkPaths | Where-Object { $_ -match '/base\.apk$' } | Select-Object -First 1) -replace '^package:', ''
$armPath = ($apkPaths | Where-Object { $_ -match 'arm64.*\.apk$' } | Select-Object -First 1) -replace '^package:', ''
if (-not $basePath -or -not $armPath) { throw 'Base or ARM64 APK missing. Check app package and architecture.' }
.\adb.exe pull $basePath.Trim() (Join-Path $apkFolder 'zeekr_base.apk')
if ($LASTEXITCODE -ne 0) { throw 'Base APK copy failed.' }
.\adb.exe pull $armPath.Trim() (Join-Path $apkFolder 'zeekr_arm64.apk')
if ($LASTEXITCODE -ne 0) { throw 'ARM64 APK copy failed.' }
```

The output is under `C:\Users\YOUR_NAME\Zeekr-Private\apks`. Only APKs from the exact analysed EU 2.9.9 build can be passed to the adapter with `--arm64` as documented in [KEYS.md](KEYS.md). Other builds are unsupported even when their package name matches.

Newer builds may require version-specific runtime extraction in an appropriate Android test environment. USB debugging and BlueStacks ADB do not imply root access. No complete EU 3.1.1 runtime extraction route is promised by this package.

[Official ADB documentation](https://developer.android.com/tools/adb).
