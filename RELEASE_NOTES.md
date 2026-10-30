# 0.2.0-beta.1 — expanded cloud controls

Adds explicit cloud lock/unlock buttons and Flow cards, trunk/hood release, windows/sunshade/charge lid, locator, defrost/wheel/seats/ventilation/sentry, charging limits and schedules, departure scheduling, and additional telemetry. See [Swedish feature list and upgrade guide](FEATURES.sv.md).

New commands are offline/mocked-tested only. They have not been tested against a real vehicle. No Bluetooth driving key is included. 42 tests and Homey technical publish validation pass. Shared as-is, without maintenance or support commitments.

Install the full release ZIP on the same Homey with INSTALL_WINDOWS.cmd. Do not uninstall first or use --clean. Existing app ID, account settings and device remain. Newly added capabilities are migrated at startup.

Original API work: Fryyyyy. Key extractor: Wysie. Original MIT notices are preserved.

---

Zeekr 0.1.2 — community beta

Unofficial Homey Pro port of Fryyyyy’s Zeekr projects, with desktop key tools by Wysie. Original MIT license notices are preserved.

Download **Zeekr_Homey_v0.1.2.zip**, extract it, then read README.md / README.sv.md. On Windows, INSTALL_WINDOWS.cmd guides you through Homey CLI installation and your own Homey login. Requires Homey Pro 12.9.0+ and Node.js 24+. Your own Zeekr EU account and complete valid key JSON are required; no credentials or key values are included.

This is a community beta, shared as-is without a commitment to ongoing maintenance or support. Settings/pairing and several runtime messages are currently Swedish. Successful pairing has been reported by one user; vehicle commands and model compatibility need further testing. Independent forks are welcome.

Includes complete English/Swedish setup and key extraction guides, a Windows extractor launcher and an offline exact-build EU 2.9.9 adapter. The adapter refuses different APK bytes and writes the six-field JSON outside the repository without printing values. It does not guarantee current server acceptance and does not support arbitrary app versions.
