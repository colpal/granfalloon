#!/usr/bin/env python
import requests


GRANFALLOON_URL = "http://localhost:8000"
PUBLIC_KEY = {
    "kty": "OKP",
    "crv": "Ed25519",
    "x": "0_Wi5E-xXujsb_rrZ5NbDHmdji2I-ix6XIzim7b4DN8",
}


def main():
    r = requests.post(
        f"{GRANFALLOON_URL}/_/start-challenge",
        json={"publicKey": PUBLIC_KEY},
    )
    print(r.text)


if __name__ == "__main__":
    main()
