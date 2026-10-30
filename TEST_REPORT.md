# Zeekr 0.2.0-beta.1 validation

Homey app version: 0.2.0. Distribution tag: v0.2.0-beta.1. This is an expanded community beta, not vehicle certification.

- 42 Node tests pass, including the original 28 tests and 14 added tests for expanded controls, telemetry, endpoint routing, Flow dispatch, migration and error handling.
- Homey CLI 4.6.2: `app validate --level publish` passes without warnings about Flow titles.
- Lock/unlock directions and parameters, cover/locator targets, seat encoding, charging-limit scaling and schedule bodies are compared against Fryyyyy's pinned MIT sources listed in UPSTREAM_VERSIONS.json. Additional original source files are preserved under upstream-reference/.
- Mocked tests verify signed encrypted-VIN requests, no retry of control POSTs after timeout/expired token, shared command cooldown, no optimistic lock state, input validation before dispatch, preservation of existing schedules on disable, and no control POST after deletion while reading a plan.
- Upgrade tests verify adding capabilities to an existing device and registering buttons without sending a command. Supplemental read failures clear affected old data while primary readings can remain available.
- Original key extraction tools and instructions remain unchanged. No keys, APKs, sessions, passwords, personal logs or actual coordinates are distributed.
- **No live Zeekr requests or vehicle commands were performed.** New functionality is not verified on an EU Zeekr 001 or any other vehicle by this port. Model, firmware, account permissions and region can prevent commands or fields from working.
- Windows launchers were reviewed as source; no Windows-host installation was performed here. Homey validation and device mocks do not establish real Homey UI behavior or real vehicle operation.
- The previous 0.1.2 release remains available. This beta is isolated on expanded-cloud-controls; main is unchanged.
