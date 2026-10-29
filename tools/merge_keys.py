"""Merge Wysie's static extractor JSON and optional Frida log into a Homey import.

Does not contact Zeekr. Does not print key values. Refuses incomplete input.
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path

FIELDS = ('hmac_access_key', 'hmac_secret_key', 'password_public_key', 'prod_secret', 'vin_key', 'vin_iv')
RUNTIME_FIELDS = ('prod_secret', 'vin_key', 'vin_iv')


def merge(static, runtime=None):
    result = {key: static.get(key) for key in FIELDS}
    if runtime:
        for key in RUNTIME_FIELDS:
            value = runtime.get(key)
            if isinstance(value, str) and value.strip() and value.strip() != 'NOT FOUND':
                result[key] = value.strip()
    missing = [key for key in FIELDS if not isinstance(result[key], str) or not result[key].strip() or result[key] == 'NOT FOUND']
    if missing:
        raise ValueError('Saknade nycklar: ' + ', '.join(missing))
    for key in ('vin_key', 'vin_iv'):
        if len(result[key].encode('utf-8')) != 16:
            raise ValueError(key + ' måste vara 16 UTF-8-byte.')
    return result


def read_runtime(path):
    text = Path(path).read_text(encoding='utf-8', errors='replace')
    try:
        data = json.loads(text)
        if isinstance(data, dict):
            return data
    except ValueError:
        pass
    result = {}
    for line in text.splitlines():
        match = re.search(r'(prod_secret|vin_key|vin_iv):\s*(.*?)\s*$', line)
        if match and match[2] != 'NOT FOUND':
            result[match[1]] = match[2]
    return result


def main():
    parser = argparse.ArgumentParser(description='Skapa en komplett nyckelfil för Homey utan att skriva ut nycklarna.')
    parser.add_argument('static_json', help='zeekr_secrets.json från Wysies verktyg')
    parser.add_argument('--runtime', help='Frida-logg eller JSON med de tre runtime-värdena')
    parser.add_argument('--output', default='zeekr_homey_secrets.json')
    args = parser.parse_args()
    try:
        static = json.loads(Path(args.static_json).read_text(encoding='utf-8-sig'))
        if not isinstance(static, dict):
            raise ValueError('Statisk nyckelfil måste vara ett JSON-objekt.')
        result = merge(static, read_runtime(args.runtime) if args.runtime else None)
        output = Path(args.output)
        if output.resolve() == Path(args.static_json).resolve() or (args.runtime and output.resolve() == Path(args.runtime).resolve()):
            raise ValueError('Välj en annan utfil så att källfilen inte skrivs över.')
        # Exclusive creation prevents accidentally overwriting a previous known-good key set.
        fd = os.open(output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, 'w', encoding='utf-8') as file:
            json.dump(result, file, indent=2)
            file.write('\n')
        print('Sex värden sparade i ' + str(output) + '. Giltigheten måste testas mot Zeekr.')
        return 0
    except (ValueError, OSError, TypeError, AttributeError) as error:
        # JSON errors can contain data; only provide safe, structural feedback.
        if isinstance(error, FileExistsError):
            print('Utfilen finns redan. Välj --output med ett nytt filnamn.', file=sys.stderr)
        elif isinstance(error, json.JSONDecodeError):
            print('Källfilen innehåller ogiltig JSON.', file=sys.stderr)
        else:
            print(str(error), file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
