# Features in 0.2.1

[Svenska](FEATURES.sv.md) · [Latest release](https://github.com/homeyrglabs/Zeekr-Homey/releases/latest) · [All releases](https://github.com/homeyrglabs/Zeekr-Homey/releases)

Expanded community release based on Fryyyyy’s MIT projects. Wire formats have been compared with upstream code and tested with simulated responses. **New commands have not been tested against a real vehicle by this port.** Their presence upstream does not guarantee that an EU 001 or a shared account accepts them.

## Controls

| Feature | Homey |
|---|---|
| Lock / unlock all doors | Device buttons and Flow |
| Release trunk / front hood | Buttons and Flow; release does not guarantee powered opening |
| Open / close charge lid | Buttons and Flow |
| Open / close all windows; ventilation position | Flow; close/ventilate also available as buttons |
| Open / close sunshade | Flow |
| Flash lights; horn and lights | Buttons and Flow |
| Start / stop charging and cabin climate | Original Flow cards |
| Charging limit | Flow: 50–100 %, steps of 5 |
| Defrost, steering wheel heating | Flow |
| Seat heating, four positions | Flow: level 0–3; 0 turns it off |
| Front seat ventilation | Same seat card, select ventilation |
| Short ventilation cycle | Flow; vehicle determines duration, upstream indicates about one minute |
| Sentry mode | Flow; depends on model and region |
| Stop parking comfort | Flow; enabling is not sufficiently documented |
| Charging schedule | Flow: start/end HH:MM in the vehicle’s timezone; replaces existing charging plan |
| One-time departure with climate/wheel heating | Flow; replaces existing departure plan, including recurring schedules |
| Disable charging/departure plan | Flow; first reads the existing plan and preserves its documented settings |

All controls are explicit actions. No vehicle command is sent during installation, app startup, pairing or routine polling. Pressing a button can directly affect the car. Verify each result on the vehicle. Do not use an unverified unlock action in automatic Flows.

**Command accepted** means the API accepted the request. Lock and other observed states are updated only by readings. Failed commands are not automatically retried. Wait at least ten seconds between commands and check vehicle status after a timeout.

## Additional readings

Charging limit, time remaining and charging speed; trip distance, average speed and energy consumption; predicted range at 20/100 %; coordinates; doors and individual locks; window states and opening percentages; front hood, trunk, charge lid, parking brake and sunshade; seat/wheel heating, ventilation, defrost and sentry; tyre temperatures and warnings; charging plan and next departure.

Missing/unreported values are unknown. Four supplemental read requests provide extra values. Their failure need not stop primary vehicle readings. **Last complete supplemental fetch** covers those extra requests; **Last API fetch** records a successful primary vehicle-status fetch. Neither proves that Zeekr received fresh telemetry from a sleeping vehicle. Homey’s displayed value age can indicate when a reading last changed.

Polling defaults to 300 seconds and can be adjusted in app settings. Requests take additional time. A follow-up refresh is scheduled 35 seconds after an accepted command. Cloud controls do not need a Bluetooth connection.

## Not included

Bluetooth/digital driving key, proximity unlocking, driving authorization, camera images/video, journey history, refrigerator controls or every feature from all models/regions of the phone app. This integration does not reproduce the complete Zeekr app. Account and API keys are still required.

## Update and test

1. Download **Zeekr_Homey_v0.2.1.zip** from [the latest release](https://github.com/homeyrglabs/Zeekr-Homey/releases/latest) or [all releases](https://github.com/homeyrglabs/Zeekr-Homey/releases). Extract the whole package.
2. Run `INSTALL_WINDOWS.cmd` and select the same Homey. Do not uninstall first or use `--clean`.
3. The existing vehicle and account settings remain. New capabilities are added when the app starts.
4. Open the vehicle’s controls in Homey. Test one action at a time while beside the car with your regular key available. Start with a light signal and confirm the effect on the car.
5. If a request is rejected, note the function and sanitized error code. Never share keys, VIN, coordinates, tokens or personal logs.

If necessary, install the previous v0.1.2 ZIP in the same way. It does not automatically remove every added capability. Uninstalling to tidy up cards can delete settings and history.

Pairing, settings, runtime messages, capabilities and Flow cards support English and Swedish. Other Homey languages fall back to English. Shared as-is, without a commitment to maintenance or support. API work: [Fryyyyy](https://github.com/Fryyyyy/zeekr_homeassistant); key tools: [Wysie](https://github.com/Wysie/zeekr_key_extractor). Original MIT notices are included.
