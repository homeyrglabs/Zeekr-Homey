import unittest
from merge_keys import merge


class MergeTests(unittest.TestCase):
    def test_runtime_replaces_static_candidates(self):
        source = dict(hmac_access_key='test', hmac_secret_key='test', password_public_key='test', prod_secret='wrong', vin_key=None, vin_iv=None)
        runtime = dict(prod_secret='correct', vin_key='0123456789abcdef', vin_iv='fedcba9876543210')
        result = merge(source, runtime)
        self.assertEqual(result['prod_secret'], 'correct')
        self.assertEqual(source['prod_secret'], 'wrong')

    def test_missing_values_are_rejected(self):
        with self.assertRaisesRegex(ValueError, 'Saknade nycklar'):
            merge({})

    def test_missing_runtime_value_does_not_erase_existing_value(self):
        source = dict(hmac_access_key='test', hmac_secret_key='test', password_public_key='test', prod_secret='test', vin_key='0123456789abcdef', vin_iv='fedcba9876543210')
        self.assertEqual(merge(source, {'vin_key': 'NOT FOUND'}), source)


if __name__ == '__main__':
    unittest.main()
