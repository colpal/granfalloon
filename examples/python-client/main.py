#!/usr/bin/env python
from base64 import b64encode
import requests
from jwcrypto.jwk import JWK


GRANFALLOON_URL: str = "http://localhost:8000"
PUBLIC_JWK: dict[str, str] = {
    "kty": "OKP",
    "crv": "Ed25519",
    "x": "0_Wi5E-xXujsb_rrZ5NbDHmdji2I-ix6XIzim7b4DN8",
}


def authenticate() -> str:
    response = requests.post(
        f"{GRANFALLOON_URL}/_/start-challenge",
        json={"publicKey": PUBLIC_JWK},
    ).json()

    try:
        nonce: str = response["data"]["nonce"]
        challenge: str = response["data"]["challenge"]
    except KeyError:
        raise Exception(response["errors"])

    with open("../../test/profiles/example-ed25519.json.private") as file:
        private_jwk = JWK.from_json(file.read())

    private_key = private_jwk.get_op_key("sign")
    challenge_encoded: bytes = challenge.encode()
    signature: bytes = private_key.sign(challenge_encoded)
    signature_base64: bytes = b64encode(signature)
    answer: str = signature_base64.decode()

    response = requests.post(
        f"{GRANFALLOON_URL}/_/complete-challenge",
        json={"nonce": nonce, "answer": answer},
    ).json()

    try:
        return response["data"]["session"]
    except KeyError:
        raise Exception(response["errors"])


def main():
    token: str = authenticate()
    response = requests.get(
        f"{GRANFALLOON_URL}/widgets",
        headers={"Authorization": f"token {token}"},
    )


if __name__ == "__main__":
    main()
