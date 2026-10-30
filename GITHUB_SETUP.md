# GitHub distribution and independent releases

[Svenska](GITHUB_SETUP_SV.md) · [Latest release](https://github.com/homeyrglabs/Zeekr-Homey/releases/latest) · [All releases](https://github.com/homeyrglabs/Zeekr-Homey/releases)

The public distribution repository is [homeyrglabs/Zeekr-Homey](https://github.com/homeyrglabs/Zeekr-Homey). `README.md` and `app/` belong directly in its root; tools, source references, licenses and both language guides accompany them. The Vibio project is a structural example, not the source of the Zeekr protocol.

## Source changes

Use GitHub Desktop or git to preserve all subdirectories and dotfiles, including `.gitignore`, `.gitattributes` and `app/.homeycompose`. Browser uploads need to target the correct directory and stay within GitHub’s per-upload limit. Never upload your private key JSON, APKs, credentials, sessions, VIN, precise coordinates or personal logs.

Work in a branch, review the diff, run `node --test tests/*.test.js` from `app/`, then `homey app validate --level publish`. Merge reviewed changes into `main`. Preserve the original MIT notices and source attribution. A technical check does not verify car compatibility.

## Release

1. Open the [releases page](https://github.com/homeyrglabs/Zeekr-Homey/releases) and choose **Draft a new release**.
2. Create a new version tag from the reviewed `main` commit, matching `app/.homeycompose/app.json` and `app/package.json` (current release: **v0.2.1**).
3. Add clear English and Swedish notes, installation/update steps, actual validation results and untested limitations. Do not use author @-mentions.
4. Attach the complete `Zeekr_Homey_v0.2.1.zip` source/setup package, with `app/`, tools, guides and MIT notices. Exclude generated build directories and all private files.
5. For a normal community release, select **Set as the latest release** and publish. For a separate experimental preview, label it **Pre-release** instead. GitHub’s release label does not establish real vehicle compatibility or Homey App Store certification.
6. Verify the tag, asset checksum and the [latest-release link](https://github.com/homeyrglabs/Zeekr-Homey/releases/latest). Keep [all releases](https://github.com/homeyrglabs/Zeekr-Homey/releases) linked prominently in both READMEs and setup guides.

## Maintenance expectations

The project is shared as-is without a maintenance or support commitment. Independent forks are welcome. Repository feature settings or archival are optional owner decisions; publishing does not require changing them. Archiving makes the repository read-only until unarchived.

[GitHub file-upload documentation](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository) · [Release documentation](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
