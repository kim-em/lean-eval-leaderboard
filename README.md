# lean-eval-leaderboard

Results store for the [lean-eval](https://github.com/kim-em/lean-eval) benchmark.

This repository holds machine-written artifacts produced by the lean-eval CI.
**Do not edit files here by hand.** Each successful comparator run appends to
`results/<github-user>.json`, recording which benchmark problems that user has
solved.

Successes are sticky: once a problem is marked solved for a given user, it
stays solved even if a later submission from the same user no longer proves
it.

See the lean-eval repository for the benchmark itself, the submission flow,
and the schema details for records in this repository.
