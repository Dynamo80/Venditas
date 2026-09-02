# The brain

Everything a new session needs in order to run this business without having been
present for the conversation that built it.

## Order of consultation

1. **`node ops/status.mjs`** — measured, live. Never trust a document for
   anything this can tell you.
2. **`state.md`** — what is blocked and what happens next. Short by design.
3. **`decisions/`** — why things are the way they are. Read before proposing a
   change of direction.
4. **`runbooks/`** — how to actually perform a task.
5. **`reference/`** — slow-moving facts: competitors, market, accounts.

## The rule that keeps this honest

Measured beats written. A status document is accurate the day it is written and
silently wrong afterwards, and a reader cannot tell which. If a number could be
fetched, fetch it — `state.md` should contain only intent, blockers and
judgement, which genuinely cannot be.
