# Zeekr 0.1.2 validation

Changes: add energy.electricCar=true to the car driver, original project contributors in the app manifest, concise English/Swedish store readmes a changelog and correctly sized square driver images. No login, telemetry, car command or stored account changes.

Homey CLI 4.6.2 publish validation: passed. Existing 28 Node tests: passed. This is technical upload preparation, not certification approval. Remaining review work is listed in PUBLICERA_SV.md, including English UI/runtime messages and product-specific artwork review. No live API calls or car commands performed.

## GitHub setup package

- Complete English/Swedish setup, extraction and sharing instructions.
- Offline adapter exercised end to end against the exact EU 2.9.9 XAPK. All six resulting values match the previously analysed reference. No values printed or included in distribution.
- A deliberately incorrect APK pair is refused without producing a JSON.
- Output overwrites are refused. Common private/generated files are excluded by the repository gitignore.
- Original license texts and Homey app JavaScript are byte-identical to 0.1.2.
- Existing 28 app tests pass. No live Zeekr requests or car commands performed.
- Windows CMD launchers have been reviewed as source, but not executed on a Windows host here. End-to-end extraction was tested with Python on Linux.
