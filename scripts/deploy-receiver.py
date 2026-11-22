#!/usr/bin/env python3
"""Receive a BAF deployment through an OpenSSH forced command."""

import os
import re
import shutil
import sys
import tarfile
import tempfile
from pathlib import Path


def deploy(command, stream, destination):
    match = re.fullmatch(r"baf-deploy v(\d+\.\d+\.\d+)", command, flags=re.ASCII)
    if not match:
        raise ValueError("Expected baf-deploy followed by a version tag.")

    version = match[1]
    limits = {
        "site.css": 1024 * 1024,
        "math-glossary-en-fr.pdf": 1024 * 1024,
        "privacy-fr.html": 1024 * 1024,
        "fr.html": 1024 * 1024,
        "privacy.html": 1024 * 1024,
        "index.html": 1024 * 1024,
    }

    with tempfile.TemporaryDirectory(prefix=".baf-deploy-", dir=destination) as tmp:
        staging = Path(tmp)
        missing = set(limits)
        with tarfile.open(fileobj=stream, mode="r|") as archive:
            for member in archive:
                name = member.name
                if name not in missing or not member.isfile() or not 0 < member.size <= limits[name]:
                    raise ValueError("Unexpected file in deployment archive.")
                with archive.extractfile(member) as source, (staging / name).open("xb") as target:
                    shutil.copyfileobj(source, target)
                (staging / name).chmod(0o644)
                missing.remove(name)

        if missing:
            raise ValueError("Deployment archive is missing required files.")

        for name in limits:
            os.replace(staging / name, destination / name)

    print(f"Deployed BAF {version}")


if __name__ == "__main__":
    try:
        deploy(
            os.environ.get("SSH_ORIGINAL_COMMAND", ""),
            sys.stdin.buffer,
            Path.home() / "dev.jcisio.com" / "baf",
        )
    except (OSError, ValueError, tarfile.TarError) as error:
        sys.exit(f"BAF deployment rejected: {error}")
