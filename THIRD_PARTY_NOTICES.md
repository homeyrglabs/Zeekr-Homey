# Third-party notices

## Fryyyyy — Zeekr EV API

Source: https://github.com/Fryyyyy/zeekr_ev_api

The JavaScript protocol implementation in `app/lib/crypto.js` and `app/lib/client.js` adapts the EU API endpoints, signing algorithms, authentication sequence and VIN encryption from this Python project. The app uses fixed EU routing, configurable EU app-version headers, Homey session persistence, sanitized errors, timeout handling and request throttling. It does not load the Python library in the Homey runtime. The original Python source is included in `tools/fryyyyy-zeekr-ev-api` for reference and reproducible protocol fixtures.

MIT License, Copyright (c) 2025 Fryyyyy. Complete license: `tools/fryyyyy-zeekr-ev-api/LICENSE` and `app/LICENSE`.

## Fryyyyy — Zeekr Home Assistant

Source: https://github.com/Fryyyyy/zeekr_homeassistant

Telemetry fields and the RCS/ZAF charging/climate command payloads are adapted from this integration. The relevant source files and full MIT license are included in `upstream-reference`. Home Assistant entity classes and services do not run on Homey. Features not implemented by this beta must not be inferred from upstream's feature list.

## Wysie — Zeekr Key Extractor

Source: https://github.com/Wysie/zeekr_key_extractor

The unmodified extractor and runtime script are included in `tools/wysie-key-extractor` with their complete MIT license. They run on a user's computer / Android test environment, not on Homey. `tools/merge_keys.py` is a separate helper added for this bundle. No secret values are provided in the bundle. The upstream runtime script is verified only against the documented builds, not against EU Android 3.1.1.

Exact source commits are recorded in `UPSTREAM_VERSIONS.json`. License notices must accompany redistribution of these sources and adaptations.

## Homey and Zeekr

Homey and Zeekr names identify the platforms/products integrated by this community beta. This is an unofficial community integration, not affiliated with Zeekr or Athom. RG Labs identifies the Homey package distributor, not the original API author. The artwork is a generic EV symbol, not the official Zeekr logo or a specific vehicle model.

## Maintenance

This Homey port is shared as-is. No ongoing maintenance, updates, response times or support are promised. Independent community forks are welcome. Full original MIT license texts are preserved.

## Exact EU 2.9.9 adapter

`tools/extract_eu_299.py` invokes Wysie’s unmodified bundled extractor with suppressed console output, checks the two known APK hashes and the extractor hash, and selects the third production-secret candidate for this exact build. This selection was established from `classes12.dex`, `Lcom/zeekr/snc/structed/j;`, constructor field `f`, used by the PROD signing branch. VIN encryption key/IV mapping was checked in `Lon/a;` methods `d` and `g`. These findings are specific to the recorded build and are not a general extractor for newer versions. This helper does not contact Zeekr and does not include extracted values. The wrapper/installer scripts and setup documentation are supplied under the included MIT terms.
