"""Generate non-secret test vectors by executing the pinned Fryyyyy Python code.

Run: python -m pip install requests pycryptodome
     python tools/generate_protocol_fixtures.py
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools/fryyyyy-zeekr-ev-api/src'))
from requests import Request
from zeekr_ev_api import zeekr_hmac, zeekr_app_sig

date = 'Thu, 29 Oct 2026 08:00:00 GMT'
zeekr_hmac._get_gmt_date = lambda: date
keys = {'hmac_access_key': 'test-access', 'hmac_secret_key': 'test-secret'}
fixtures = {'hmac': [], 'app': [], 'vin': []}
for method, url in [
    ('GET', 'https://example.invalid/region/url?z=2&A=1&b=hello%20world'),
    ('POST', 'https://example.invalid/zeekr-cuc-idaas/auth/checkUserV2'),
    ('GET', 'https://example.invalid/path//nested/?x=a=b&empty=')
]:
    req = Request(method, url, headers={})
    expected = dict(zeekr_hmac.generateHMAC(req, **{'access_key': keys['hmac_access_key'], 'secret_key': keys['hmac_secret_key']}).headers)
    fixtures['hmac'].append(dict(method=method, url=url, keys=keys, date=date, expected=expected))

headers = {'Content-Type': 'application/json; charset=UTF-8', 'X-APP-ID': 'ZEEKRCNCH001M0001',
           'X-PROJECT-ID': 'ZEEKR_EU', 'X-API-SIGNATURE-NONCE': 'test-nonce',
           'X-TIMESTAMP': '1793260800000', 'authorization': 'test-token', 'X-VIN': '',
           'X-DEVICE-ID': 'test-device', 'X-PLATFORM': 'APP', 'accept-language': 'en-AU',
           'X-API-SIGNATURE-VERSION': '2.0', 'ignored-header': 'not-signed'}
for method, url, body in [
    ('GET', 'https://example.invalid/ms-app-bff/api/v4.0/veh/vehicle-list?needSharedCar=true', None),
    ('GET', 'https://example.invalid/a?b=hello%20world&a=x%2Fy%3Fz&b=ignored&x=*&empty=', None),
    ('POST', 'https://example.invalid/ms-remote-control/v1.0/remoteControl/control',
     '{"command":"start","serviceId":"ZAF","setting":{"serviceParameters":[{"key":"AC","value":"true"}]}}'),
    ('POST', 'https://example.invalid/login', '{"z":[{"b":"åäö😀","a":1}],"a":true}')
]:
    req = Request(method, url, headers=headers.copy(), data=body).prepare()
    expected = zeekr_app_sig.calculate_sig(req, 'test-prod-secret')
    fixtures['app'].append(dict(method=method, url=req.url, headers=dict(req.headers), body=body, secret='test-prod-secret', expected=expected))

for text in ['L6T79XXXXXXXX0001', 'test-vin']:
    key, iv = '0123456789abcdef', 'fedcba9876543210'
    fixtures['vin'].append(dict(text=text, key=key, iv=iv, expected=zeekr_app_sig.aes_encrypt(text, key, iv)))
path = ROOT / 'app/tests/fixtures/protocol.json'
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(json.dumps(fixtures, indent=2, ensure_ascii=True) + '\n')
print('Synthetic protocol fixtures written; no real keys or credentials used.')
