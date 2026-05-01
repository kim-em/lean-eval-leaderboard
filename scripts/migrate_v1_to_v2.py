#!/usr/bin/env python3
"""One-shot migration of `results/*.json` from schema_version 1 to 2.

Schema v1 keyed sticky records on `(user, problem)`, with `model` stored
inside each per-problem record. Schema v2 keys sticky records on
`(user, model, problem)` by hoisting `model` up into a bucket layer:

    v1:  solved[<problem_id>] = { "model": "...", ...other fields }
    v2:  solved[<model>][<problem_id>] = { ...other fields, no "model" }

The migration is mechanical, lossless, and idempotent: re-running on a
v2 file is a no-op.

Usage:
    python3 scripts/migrate_v1_to_v2.py results/<login>.json [...]
    python3 scripts/migrate_v1_to_v2.py --all          # walk results/
    python3 scripts/migrate_v1_to_v2.py --check ...    # dry-run (exit 1 if change needed)
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sys


REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
RESULTS_ROOT = REPO_ROOT / "results"


class MigrationError(Exception):
    pass


def migrate(data: dict) -> dict:
    version = data.get("schema_version")
    if version == 2:
        return data
    if version != 1:
        raise MigrationError(f"unexpected schema_version {version!r}; can only migrate v1 → v2")

    user = data.get("user")
    if not isinstance(user, str):
        raise MigrationError("missing or non-string 'user'")
    solved_v1 = data.get("solved")
    if not isinstance(solved_v1, dict):
        raise MigrationError("missing or non-object 'solved'")

    solved_v2: dict[str, dict[str, dict]] = {}
    for problem_id, record in solved_v1.items():
        if not isinstance(record, dict):
            raise MigrationError(f"record for problem {problem_id!r} is not an object")
        record = dict(record)  # don't mutate input
        model = record.pop("model", None)
        if not isinstance(model, str) or not model.strip():
            raise MigrationError(
                f"record for problem {problem_id!r} is missing a non-empty 'model' string"
            )
        bucket = solved_v2.setdefault(model, {})
        if problem_id in bucket:
            # Two v1 records with the same model+problem can only happen if
            # the v1 file was hand-edited; v1 sticky semantics prevent it
            # via the writer. Fail loudly.
            raise MigrationError(
                f"duplicate (model, problem) = ({model!r}, {problem_id!r}) in v1 file"
            )
        bucket[problem_id] = record

    return {"schema_version": 2, "user": user, "solved": solved_v2}


def _format(data: dict) -> str:
    return json.dumps(data, indent=2, sort_keys=True) + "\n"


def _process(path: pathlib.Path, *, check: bool) -> bool:
    """Returns True if the file changed (or would change in --check mode)."""
    original = path.read_text(encoding="utf-8")
    data = json.loads(original)
    migrated = migrate(data)
    new_text = _format(migrated)
    if new_text == original:
        return False
    if check:
        print(f"would migrate: {path}", file=sys.stderr)
    else:
        path.write_text(new_text, encoding="utf-8")
        print(f"migrated: {path}", file=sys.stderr)
    return True


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="*", type=pathlib.Path)
    parser.add_argument("--all", action="store_true", help="Migrate every file under results/.")
    parser.add_argument("--check", action="store_true", help="Dry-run; exit 1 if any file would change.")
    args = parser.parse_args(argv)

    if args.all:
        if args.paths:
            parser.error("--all is incompatible with explicit paths")
        args.paths = sorted(p for p in RESULTS_ROOT.glob("*.json"))
    if not args.paths:
        parser.error("nothing to do; pass file paths or --all")

    any_changed = False
    try:
        for path in args.paths:
            if not path.is_file():
                raise MigrationError(f"not a file: {path}")
            any_changed |= _process(path, check=args.check)
    except (MigrationError, json.JSONDecodeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    return (1 if (args.check and any_changed) else 0)


if __name__ == "__main__":
    raise SystemExit(main())
