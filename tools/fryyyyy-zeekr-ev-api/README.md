# zeekr_ev_api

API for interacting with Zeekr EVs

It is highly recommended to create a _new Zeekr account_ and share the car with it, otherwise you will be logged out from the phone app whenever you call the API.

Some values are required to call this API in addition to the username and password including:

* HMAC Access Key
* HMAC Secret Key
* Password encryption public key
* VIN encryption key and IV

Extracting these values are left to the user and will not be provided.
