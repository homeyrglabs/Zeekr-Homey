# Ta fram nyckelfilen på Windows

[Hämta senaste versionen](https://github.com/homeyrglabs/Zeekr-Homey/releases/latest) · [Alla versioner](https://github.com/homeyrglabs/Zeekr-Homey/releases) · [English](KEYS.md)


Det här är API-värden som Homey behöver för att prata med Zeekrs EU-server. Det är inte bilens digitala környckel och de hämtas inte ur Homey. Använd endast dina egna APK-filer/behörigt tillgängliga appfiler. Inga nyckelvärden medföljer.

## Metoden i det här paketet

Det medföljande skriptet stöder **exakt den analyserade EU-builden 2.9.9**, paketnamn **com.zeekr.overseas**. Det läser Android-appens filer på datorn utan att starta appen eller kontakta Zeekr. Du behöver inte Android-telefon, USB-kabel, BlueStacks, root eller Frida för den här vägen. Du behöver inte nedgradera appen på telefonen.

Alla sex fälten har kunnat extraheras från denna build. Det bevisar inte att Zeekrs server fortsätter acceptera dem. Skriptet testar inte inloggning; den sker senare på din Homey. API:t kan ändras.

## 1. Förbered datorn

1. Hämta repots release-ZIP och packa upp hela mappen. Kör inte skripten inne i ZIP-filen.
2. Installera **Python 3.10 eller senare** från https://www.python.org/downloads/windows/. Välj installation med **Python launcher** (`py`). Stäng och öppna terminalen om Python nyss installerats.
3. Kontrollera i PowerShell:

```powershell
py -3 --version
```

Du ska se Python 3.10 eller senare. Ha omkring **1 GB ledigt temporärt diskutrymme** för uppackning av APK och DEX-filer.

## 2. Hämta EU 2.9.9 som XAPK

Om du redan har exakt rätt XAPK kan du använda den. En nedladdningssida som användes vid analysen är:

https://apkpure.net/zeekr/com.zeekr.overseas/download/2.9.9

APKPure är en tredjepartskälla, inte Zeekrs egen webbplats. Välj **ZEEKR EU**, **2.9.9**, **com.zeekr.overseas**, cirka **236 MB**, **XAPK**. Du behöver bara spara filen på datorn och inte installera den eller någon separat APKPure-app. Ladda inte ner den globala varianten com.zeekr.global.

Filnamnet på din XAPK får variera. Behåll filen utanför repomappen, till exempel i Hämtade filer. Skriptet läser dessa två filer ur arkivet:

- `com.zeekr.overseas.apk`
- `config.arm64_v8a.apk`

Det verifierar bådas SHA-256 innan extraktion. Om nedladdningen ersatts med andra bytes stoppar skriptet, även om versionsnumret ser rätt ut. Hämta inte på måfå andra APK-versioner för att komma förbi kontrollen.

## 3. Kör extraktionen

1. Öppna den uppackade `Zeekr-Homey`-mappen.
2. Läs och dubbelklicka på **EXTRACT_KEYS_WINDOWS.cmd**.
3. Skriptet skapar en lokal Python-miljö under `%LOCALAPPDATA%\HomeyZeekrTools\venv` och installerar två beroenden. Internet behövs för Python-beroendena, men själva APK-analysen är lokal.
4. När raden **Path to your Zeekr EU 2.9.9 XAPK** visas: dra XAPK-filen från Utforskaren till terminalfönstret eller klistra in hela sökvägen. Tryck Enter. Om dragning inte fungerar: högerklicka på filen i Utforskaren → Kopiera som sökväg och klistra in den.
5. Vänta tills du ser **Complete six-field JSON saved locally**. Fönstret visar var filen sparades, men inga nyckelvärden.

Standardfilen är:

```text
C:\Users\DITT_WINDOWS_NAMN\Zeekr-Private\zeekr_homey_secrets_EU_2.9.9.json
```

Om en fil redan finns skrivs den inte över. Behåll en fungerande fil. För en ny fil kan du köra manuellt och ange `--output` med ett annat namn. Skriptets slutliga JSON innehåller bara dessa sex fält:

```text
hmac_access_key
hmac_secret_key
password_public_key
prod_secret
vin_key
vin_iv
```

Originalverktyget kan hitta flera `prod_secret`-kandidater. Den här adaptern väljer den som verifierades mot PROD-grenen i just denna builds DEX-kod. Det är därför hashkontrollen inte får tas bort. Kandidater väljs inte genom att testa flera nycklar mot servern.

## 4. Importera på Homey

Installera appen enligt [SETUP.sv.md](SETUP.sv.md). Lägg sedan till **Zeekr → Zeekr (EU)**.

- Ange ditt Zeekr-kontos e-postadress och lösenord direkt i Homey.
- Land: `SE` för Sverige, annars ditt EU-lands tvåbokstavskod.
- **Zeekr-appversion: 2.9.9** för denna nyckelfil. Det här fältet gäller API-klienten i Homey; appversionen på mobilen kan vara en annan.
- Intervall: `300` sekunder som startvärde.
- Välj **Välj JSON-fil** och öppna filen från `Zeekr-Private`.
- Tryck **Spara och anslut** och välj bilen.

Lämna fungerande sparade kontoinställningar oförändrade vid en vanlig appuppdatering. Dela aldrig JSON-filen, lösenord eller sessioner i GitHub, ett supportinlägg eller en skärmbild.

## Alternativ: kör från terminal

Från repomappens rot:

```powershell
py -3 -m venv "$env:LOCALAPPDATA\HomeyZeekrTools\venv"
& "$env:LOCALAPPDATA\HomeyZeekrTools\venv\Scripts\python.exe" -m pip install -r .\tools\requirements-extract.txt
& "$env:LOCALAPPDATA\HomeyZeekrTools\venv\Scripts\python.exe" .\tools\extract_eu_299.py "C:\sokvag\ZEEKR_2.9.9.xapk"
```

Har du redan de två separata APK-filerna från exakt samma build:

```powershell
& "$env:LOCALAPPDATA\HomeyZeekrTools\venv\Scripts\python.exe" .\tools\extract_eu_299.py "C:\sokvag\base.apk" --arm64 "C:\sokvag\split_config.arm64_v8a.apk"
```

## Felsökning

| Meddelande | Vad du gör |
| --- | --- |
| py känns inte igen | Installera Python med Python launcher och öppna terminalen på nytt. |
| APK hashes do not match | Du har andra filer än den verifierade builden. Inga nycklar skapas. Kontrollera EU/versionsnummer; kringgå inte kontrollen. |
| Expected EU base/ARM64 APK entries are missing | Filen är fel XAPK, en ensam APK eller en annan paketvariant. Använd rätt XAPK eller två separata APK-filer enligt ovan. |
| Output already exists | Din tidigare fil skyddas. Behåll den, eller välj ett annat utfilnamn med --output. |
| Python dependencies missing | Kör EXTRACT_KEYS_WINDOWS.cmd igen och kontrollera pip-felet. |
| Homey visar 079021 | Kontot kan ha en annan session. Använd helst ett separat Zeekr-konto som bilen delas med. |
| Homey visar 079025 | Signering/VIN-kryptering avvisas. Kontrollera land och appversion. Gamla nycklar kan ha slutat fungera; en komplett JSON garanterar inte serverstöd. |
| Inga bilar visas | Kontrollera att kontot har tillgång till bilen och att eventuell delning accepterats. |

## Nyare appar och ADB

Den här adaptern stöder **inte** EU 3.1.1 eller andra builds. Att kopiera APK-filer med vanlig USB-felsökning ger inte i sig tillgång till appens runtime-hemligheter. EU 3.1.1 har vid analysen bara gett tre verifierade fält med en separat metod; den vägen är inte en komplett nyckelsetup. BlueStacks med ADB är inte automatiskt rootat.

För att hämta egna APK-filer från Android, se [ADB.sv.md](ADB.sv.md). Wysies medföljande Frida-skript är versionsberoende och dokumenterat mot andra builds; det ska inte framställas som en färdig metod för alla versioner. Originalets detaljer: https://github.com/Wysie/zeekr_key_extractor

## Exakta buildhashar

Base APK SHA-256: `dbafb39c8f001f85e2eb621b06a518bccb47a28b392901f44eea847b5423a301`

ARM64 APK SHA-256: `8f2f4cf71eac73c6b8329c456d0a5f68f3688fc0901bc94548bb9581c5f7caaa`

Dessa identifierar den analyserade builden; de är inte API-nycklar. Full originallicens: tools/wysie-key-extractor/LICENSE.
