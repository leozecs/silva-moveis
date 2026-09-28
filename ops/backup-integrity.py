#!/usr/bin/env python3
"""Authenticate encrypted backup files with a separate derived HMAC key.

Verify before decrypting. The master secret is held in macOS Keychain,
never in the repository or in the cloud backup directory.
"""

import argparse
import hashlib
import hmac
import subprocess
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("operation", choices=("sign", "verify"))
    parser.add_argument("backup", type=Path)
    args = parser.parse_args()
    secret = subprocess.check_output([
        "security", "find-generic-password", "-a", "leo", "-s",
        "silva-moveis-backup-20260927", "-w",
    ]).strip()
    # Domain separation from the password used by OpenSSL/PBKDF2 encryption.
    authentication_key = hmac.digest(secret, b"silva-backup-auth-v1", "sha256")
    digest = hmac.new(authentication_key, digestmod=hashlib.sha256)
    with args.backup.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    signature = args.backup.with_name(args.backup.name + ".hmac")
    if args.operation == "sign":
        with signature.open("x") as stream:
            stream.write(digest.hexdigest() + "\n")
    else:
        if not hmac.compare_digest(signature.read_text().strip(), digest.hexdigest()):
            raise SystemExit("Backup authentication failed. Do not decrypt or restore.")
    print(f"Backup {args.operation} OK: {args.backup.name}")


if __name__ == "__main__":
    main()
