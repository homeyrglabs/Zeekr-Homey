# Zeekr 0.2.1 validation

Scope: expanded community release, bilingual app and documentation, main-branch GitHub distribution. Not vehicle certification.

- 48 Node tests pass: the 42 expanded-control tests plus six tests for English/Swedish custom views, placeholders, dynamic status, private key-file errors, catalog/interpolation consistency, runtime validation and translated network/API errors.
- Homey CLI 4.6.2: `app validate --level publish` passes.
- Existing protocol signing, encrypted VIN, no automatic control-POST retries, command cooldown, reported-state semantics, device migration, schedule preservation and account persistence checks remain in place.
- English is the fallback language; Homey’s translation mechanism selects Swedish when applicable. No account, protocol header, key, API-version default or polling default was changed as part of localization.
- Existing key extraction tools remain unchanged. Their exact-build restriction is preserved. English key instructions now include the same explicit APK hashes as Swedish instructions.
- All current Swedish user guides have English counterparts. README/setup/feature/key/start/distribution guides link to GitHub Releases and the latest release.
- Original API/tool attribution and full MIT notices are preserved. No extracted keys, APKs, sessions, passwords, personal logs, real VINs or precise locations are included.
- No live Zeekr requests or vehicle commands were performed. New controls remain unverified against a real EU 001 or other vehicle by this port.
- No physical Homey UI/install test or Windows-host launcher execution was performed here. Mocked custom-view tests and CLI validation do not establish real-device operation or Homey App Store approval.
