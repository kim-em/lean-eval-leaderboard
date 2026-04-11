# lean-eval-leaderboard

Results store for the [lean-eval](https://github.com/kim-em/lean-eval) benchmark.

This repository holds machine-written artifacts produced by the lean-eval CI.
**Do not edit files here by hand.** Each successful comparator run is appended
to `results/<github-login>.json`, recording which benchmark problems that user
has solved.

Successes are **sticky**: once a problem is marked solved for a given user,
that record is never modified or removed, even if a later submission from the
same user no longer proves it.

## File layout

```
results/
  <github-login>.json
```

One file per submitter. Users without any successful submission have no file.
Filenames use the user's GitHub login, lowercased, since GitHub logins are
case-insensitive.

## Record schema (v1)

```json
{
  "schema_version": 1,
  "user": "kim-em",
  "solved": {
    "two_plus_two": {
      "solved_at": "2026-04-11T10:45:00Z",
      "benchmark_commit": "8e1b9cf5e1d3c2b1a0f9e8d7c6b5a4938271605f",
      "submission_repo": "kim-em/my-lean-eval-proofs",
      "submission_ref": "deadbeefcafef00dbaadc0de1234567890abcdef",
      "submission_public": true,
      "model": "Claude Opus 4.6",
      "issue_number": 42
    },
    "list_append_singleton_length": {
      "solved_at": "2026-04-12T08:15:30Z",
      "benchmark_commit": "8e1b9cf5e1d3c2b1a0f9e8d7c6b5a4938271605f",
      "submission_repo": "kim-em/my-lean-eval-proofs",
      "submission_ref": "deadbeefcafef00dbaadc0de1234567890abcdef",
      "submission_public": false,
      "model": "Claude Opus 4.6",
      "issue_number": 43
    }
  }
}
```

### Top-level fields

| Field            | Type    | Description                                              |
| ---------------- | ------- | -------------------------------------------------------- |
| `schema_version` | integer | Currently `1`.                                           |
| `user`           | string  | GitHub login with original case preserved.              |
| `solved`         | object  | Map from problem id to solution record. Never empty.    |

### Per-problem solution record

| Field              | Type    | Description                                                                            |
| ------------------ | ------- | -------------------------------------------------------------------------------------- |
| `solved_at`        | string  | ISO 8601 UTC timestamp of when the record was first written.                           |
| `benchmark_commit` | string  | 40-character SHA of the `kim-em/lean-eval` commit evaluated against.                   |
| `submission_repo`  | string  | `owner/repo` of the submitter's repository.                                            |
| `submission_ref`   | string  | 40-character SHA of the submitter's repo at evaluation time.                           |
| `submission_public`| boolean | `true` if the submitter's repository was public at evaluation time, `false` otherwise. The leaderboard site uses this to decide whether to link to the solution. |
| `model`            | string  | Free-form model identifier supplied by the submitter on the submission form.           |
| `issue_number`     | integer | Issue number in `kim-em/lean-eval` that triggered the evaluation.                      |

## Write semantics

When the lean-eval CI records a successful submission:

1. It reads `results/<login>.json`, or starts from an empty `solved` map.
2. For each problem that passed in the submission:
   - If `solved[<problem_id>]` already exists, **do nothing** (sticky no-op).
   - Otherwise, add a new record with the fields above.
3. If at least one new record was added, the CI commits and pushes the updated
   file. If no new records were added, it makes no commit.

The `solved` map only ever grows. The original `solved_at` timestamp is
preserved, and the audit trail (`benchmark_commit`, `submission_ref`,
`issue_number`) always refers to the run that first established the success.

## Commit convention

Commits by the lean-eval CI use the message form:

```
record: <login> solved <problem_id>[, <problem_id>...] @ <benchmark_short_sha>
```

One commit per submission, grouping all newly-recorded problems together.

## Schema evolution

Breaking changes bump `schema_version`. Consumers should refuse to parse a
file whose `schema_version` they do not know. Non-breaking additive changes
(new optional fields) keep the version number stable.
