# Hämta egna APK-filer via Android och ADB (alternativ)

[English](ADB.md) · [Alla versioner](https://github.com/homeyrglabs/Zeekr-Homey/releases)

Det här kopierar installerade appfiler. Det extraherar inte alla nycklar ur nyare skyddade builds. För den kompletta, versionsavgränsade setupen används [KEYS.sv.md](KEYS.sv.md).

1. Hämta Android SDK Platform-Tools för Windows från https://developer.android.com/tools/releases/platform-tools och packa upp till `C:\Zeekr\platform-tools`.
2. På Android: aktivera Utvecklaralternativ (vanligen genom upprepade tryck på Versionsnummer i Om telefonen) och **USB-felsökning**. Anslut med datakabel, lås upp telefonen och godkänn datorns RSA-fingeravtryck på telefonen. Menynamnen varierar.
3. Kör i PowerShell:

```powershell
cd C:\Zeekr\platform-tools
.\adb.exe devices
```

Status ska vara **device**. Vid **unauthorized** godkänner du dialogen på telefonen och kör igen. Om både BlueStacks och telefonen visas: koppla bort den du inte använder eller lägg till `-s SERIENUMMER` i varje ADB-kommando.

4. Visa APK-sökvägar:

```powershell
.\adb.exe shell pm path com.zeekr.overseas
```

5. Skapa en privat mapp och kopiera bas- och ARM64-filen med ett skript som använder sökvägarna från just din telefon:

```powershell
$apkFolder = Join-Path $env:USERPROFILE 'Zeekr-Private\apks'
New-Item -ItemType Directory -Force -Path $apkFolder | Out-Null
$apkPaths = .\adb.exe shell pm path com.zeekr.overseas
$basePath = ($apkPaths | Where-Object { $_ -match '/base\.apk$' } | Select-Object -First 1) -replace '^package:', ''
$armPath = ($apkPaths | Where-Object { $_ -match 'arm64.*\.apk$' } | Select-Object -First 1) -replace '^package:', ''
if (-not $basePath -or -not $armPath) { throw 'Bas- eller ARM64-APK saknas. Kontrollera appvariant och arkitektur.' }
.\adb.exe pull $basePath.Trim() (Join-Path $apkFolder 'zeekr_base.apk')
if ($LASTEXITCODE -ne 0) { throw 'Kopiering av bas-APK misslyckades.' }
.\adb.exe pull $armPath.Trim() (Join-Path $apkFolder 'zeekr_arm64.apk')
if ($LASTEXITCODE -ne 0) { throw 'Kopiering av ARM64-APK misslyckades.' }
```

Filerna ligger i `C:\Users\DITT_NAMN\Zeekr-Private\apks`. Om de kommer från den exakta verifierade EU 2.9.9-builden kan de matas till adaptern med `--arm64`, enligt nyckelguiden. Andra builds stöds inte av denna adapter, även om paketnamnet är samma.

En nyare build kan behöva runtime-extraktion på en särskild testmiljö med rätt Frida-/klassversion. Vanlig USB-felsökning och BlueStacks-ADB är inte samma sak som root. Paketet lovar ingen komplett runtime-metod för 3.1.1.

Officiell ADB-dokumentation: https://developer.android.com/tools/adb
