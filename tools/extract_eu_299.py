"""Offline adapter for the exact EU 2.9.9 APK pair analysed for this port.

Uses Wysie's unmodified MIT extractor, with an exact-build production-candidate
selection based on PROD bytecode. Never prints extracted values or contacts Zeekr.
"""
import argparse
import contextlib
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile
import zipfile

BASE_SHA256 = 'dbafb39c8f001f85e2eb621b06a518bccb47a28b392901f44eea847b5423a301'
ARM64_SHA256 = '8f2f4cf71eac73c6b8329c456d0a5f68f3688fc0901bc94548bb9581c5f7caaa'
EXTRACTOR_SHA256 = '7eb7f879c036ffff9c97f9afd095806d76157fae037fdb7b52fe3b37533c411a'
FIELDS = ('hmac_access_key', 'hmac_secret_key', 'password_public_key', 'prod_secret', 'vin_key', 'vin_iv')


def digest(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for block in iter(lambda: f.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def verified_selection(data):
    """Only call after exact input/extractor hash checks; never infer other builds."""
    candidates = data.get('prod_secret_candidates')
    if not isinstance(candidates, list) or len(candidates) != 7:
        raise ValueError('Unexpected candidate layout; no output written.')
    # classes12.dex: Lcom/zeekr/snc/structed/j; constructor field f;
    # signing method selects f for PROD and UAT, unlike field e for SIT.
    result = {key: data.get(key) for key in FIELDS}
    result['prod_secret'] = candidates[2]
    if any(not isinstance(v, str) or not v.strip() or v == 'NOT FOUND' for v in result.values()):
        raise ValueError('Some required fields are missing; no output written.')
    for key in ('vin_key', 'vin_iv'):
        if len(result[key].encode('utf-8')) != 16:
            raise ValueError('Unexpected VIN key length; no output written.')
    return result


def unpack_inputs(input_path, arm64_path, temp):
    base = temp / 'base.apk'
    arm = temp / 'arm64.apk'
    if arm64_path:
        shutil.copyfile(input_path, base)
        shutil.copyfile(arm64_path, arm)
    else:
        with zipfile.ZipFile(input_path) as archive:
            # Explicit names avoid extracting arbitrary ZIP paths.
            for name, dest in [('com.zeekr.overseas.apk', base), ('config.arm64_v8a.apk', arm)]:
                if name not in archive.namelist():
                    raise ValueError('Expected EU base/ARM64 APK entries are missing. Use the documented EU 2.9.9 XAPK.')
                with archive.open(name) as source, dest.open('wb') as target:
                    shutil.copyfileobj(source, target)
    if digest(base) != BASE_SHA256 or digest(arm) != ARM64_SHA256:
        raise ValueError('APK hashes do not match the analysed EU 2.9.9 build. Stopped; do not substitute another version.')
    return base, arm


def extract(input_path, arm64_path, output):
    if output.exists():
        raise ValueError('Output already exists. Keep it or choose --output with a new filename.')
    upstream = Path(__file__).parent / 'wysie-key-extractor' / 'zeekr_extract_secrets.py'
    if hashlib.sha256(upstream.read_bytes().replace(b'\r\n', b'\n')).hexdigest() != EXTRACTOR_SHA256:
        raise ValueError('Bundled extractor changed. Restore the original release before using this exact-build adapter.')
    with tempfile.TemporaryDirectory(prefix='homey-zeekr-') as directory:
        base, arm = unpack_inputs(input_path, arm64_path, Path(directory))
        spec = importlib.util.spec_from_file_location('wysie_exact_299', upstream)
        module = importlib.util.module_from_spec(spec)
        # Original prints secret material; discard all its console output.
        with open(os.devnull, 'w') as sink, contextlib.redirect_stdout(sink), contextlib.redirect_stderr(sink):
            spec.loader.exec_module(module)
            data = module.extract_secrets(str(base), str(arm), 'EU')
        result = verified_selection(data)
    output.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2)
        f.write('\n')
    return output


def main():
    parser = argparse.ArgumentParser(description='Extract Homey key JSON offline from the analysed Zeekr EU 2.9.9 build.')
    parser.add_argument('input', nargs='?', help='XAPK file, or base APK when --arm64 is supplied')
    parser.add_argument('--arm64', help='ARM64 split APK, only with a base APK input')
    parser.add_argument('--output', default=str(Path.home() / 'Zeekr-Private' / 'zeekr_homey_secrets_EU_2.9.9.json'))
    args = parser.parse_args()
    try:
        raw = args.input or input('Path to your Zeekr EU 2.9.9 XAPK (paste or drag file here): ').strip().strip('"')
        if not raw:
            raise ValueError('No input file selected.')
        out = extract(Path(raw), Path(args.arm64) if args.arm64 else None, Path(args.output).expanduser())
        print('Complete six-field JSON saved locally: ' + str(out))
        print('Homey: country SE (or your EU country), app version 2.9.9. Import the JSON in pairing/settings.')
        print('No live server test was performed. Keep the JSON private; never upload it to GitHub.')
        return 0
    except (ValueError, FileNotFoundError, zipfile.BadZipFile, KeyError) as error:
        print(str(error), file=sys.stderr)
    except ModuleNotFoundError:
        print('Python dependencies missing. Run EXTRACT_KEYS_WINDOWS.cmd or install tools/requirements-extract.txt.', file=sys.stderr)
    except (KeyboardInterrupt, EOFError):
        print('Cancelled. No keys printed.', file=sys.stderr)
    except Exception:
        print('Extraction failed. No key values printed. Check inputs, disk space and the setup guide.', file=sys.stderr)
    return 1


if __name__ == '__main__':
    sys.exit(main())
