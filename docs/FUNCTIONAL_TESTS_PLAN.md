# Functional Test Plan: API Contract for the Go Port

## Goal

A black-box test suite that runs against a **running API container** and specifies how the Meal Manager API **should** behave: status codes, JSON shapes, validation errors, auth, CORS, persistence, and the order email. The suite is the spec for the Go rewrite. When the Go API passes it, the port is done.

The tests describe **intended** behavior, not the current Java behavior. The Java API is expected to fail a number of them; every deliberate difference is listed under [Contract changes vs. the Java API](#contract-changes-vs-the-java-api). The React client has to be updated to the new contract (see [Client follow-ups](#client-follow-ups)).

Non-goals: unit tests, load testing, new product features beyond order editing/fulfillment (tags, ratings, recipe archiving).

## Principles

1. **Black box.** Tests talk to the API over HTTP and observe side effects only through the SMTP sink. They never import API code.
2. **Spec, not snapshot.** Every assertion states the behavior we want. If a test and the implementation disagree, change the implementation, unless the spec turns out to be wrong. In that case, change the test and this document together.
3. **Implementation-neutral environment.** Only the API container differs between runs. Postgres, the JWKS server, and the mail sink stay the same. The Go API reuses the existing Flyway SQL migrations (for example with `golang-migrate`), so the schema and prod data carry over.
4. **Agent-debuggable.** A failing test prints the request, the full response (status, headers, body), and a pointer to the API container logs.
5. **Error paths assert specifics.** Every error test asserts the status, the error `code`, the `message`, and the `details`. A test that would still pass if the error became generic is not good enough.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Test language | **Go** (`testing` + `net/http`), own module at `functional-tests/` | Same language as the port, no extra runtime, `go test -run` for targeting |
| DB access from tests | **Only for resetting state** between tests. All assertions go through the API | Keeps the tests about the contract |
| Auth | Test RSA keypair in `functional-tests/fixtures/` (test-only), JWKS served by a static container. Tests mint their own JWTs | The API verifies RS256 tokens against `CLERK_JWKS_URI` + `CLERK_ISSUER` |
| Email | **Mailpit** as the SMTP sink, polled through its HTTP API | Exercises the real send path without SES |
| Async mechanism | Not asserted | The Go port may keep RabbitMQ or drop it, as long as the email arrives |
| Java runs | **Harness sanity check only**, not a CI gate | Java is expected to fail the changed behavior; a Java run just proves the harness works for the overlapping cases |

## Test environment

```
functional-tests/
├── go.mod
├── README.md                     # how to run, how to add a test
├── Makefile                      # make functional IMPL=go|java
├── docker-compose.yml            # shared deps: postgres, rabbitmq, mailpit, jwks
├── compose.go.yml                # overlay: builds/runs the Go API from api-go/
├── compose.java.yml              # overlay: Java API (harness sanity check)
├── fixtures/
│   ├── jwks.json                 # public key, kid "functional-test-key"
│   ├── test-signing-key.pem      # TEST ONLY private key
│   └── nginx.conf                # serves /.well-known/jwks.json
├── harness/
│   ├── config.go                 # API_BASE_URL, MAILPIT_URL, DB_DSN, ISSUER
│   ├── client.go                 # HTTP helpers; dumps req/resp on failure
│   ├── auth.go                   # MintToken(opts): valid/expired/wrong-iss/wrong-kid/bad-sig/alg-none
│   ├── db.go                     # Reset(): TRUNCATE ... RESTART IDENTITY CASCADE
│   ├── mail.go                   # WaitForMessages(n, timeout), AssertNoMail(d), ClearInbox()
│   ├── fixtures.go               # CreateRecipe/CreateUser/CreateOrder via the API
│   └── assert.go                 # exact-key JSON shape checks, AssertError(code, message, details)
└── tests/
    ├── health_test.go  buildinfo_test.go  auth_test.go  cors_test.go
    ├── recipes_test.go users_test.go      orders_test.go email_test.go
    ├── profile_test.go logs_test.go       removed_endpoints_test.go
```

### Environment contract for the API container

| Env var | Test value |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `DB_QUERY_PARAMS` | compose Postgres |
| `RABBITMQ_HOST`, `RABBITMQ_PORT` | compose RabbitMQ (ignored if the port drops it) |
| `CLERK_JWKS_URI` | `http://jwks/.well-known/jwks.json` |
| `CLERK_ISSUER` | `https://issuer.functional.test` |
| `CORS_ALLOWED_ORIGIN` | `http://client.test` |
| `MEALMANAGER_EMAIL_FROM` | `no-reply@functional.test` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_TLS` | `mailpit`, `1025`, empty, empty, `none`. New for the Go port; prod uses the SES values |
| `API_URL` | `http://api:8080` |
| `APP_ENVIRONMENT` | `test` |
| `APP_VERSION` | `0.0.0-functional` (build arg / ldflags in prod) |

The Java overlay maps the SMTP values through `SPRING_APPLICATION_JSON` (host, port, auth off, STARTTLS off) and builds from `.docker/api.prod.dockerfile`.

### Running

```bash
cd functional-tests
make functional IMPL=go     # compose up --wait → go test ./tests/... -count=1 -p 1 -v → dump api logs on failure → compose down -v
```

- The harness waits for `GET /api/healthcheck` == 200 (up to 120s) before running.
- `-p 1`: tests share one DB, so they run serially.
- `harness.Reset(t)` at the start of every test truncates all five tables, restarts identity sequences, resets `hibernate_sequence`, and clears Mailpit.
- The Go API is developed in `api-go/` (its own `go.mod`) alongside `api/` until cutover. It then replaces `api/`, and the `compose.go.yml` build context moves with it.
- The Makefile writes `out/test-output.txt` (verbose `go test` output) and, on failure, `out/api.log` (API container logs). It always tears the stack down, even after a failure.

### CI

Workflow: `.github/workflows/functional-tests.yml`.

| Trigger | Runs | Purpose |
|---|---|---|
| `push` to `main` (every merge) | `IMPL=go` | post-merge verification of `main` |
| `pull_request` targeting `main` | `IMPL=go` | pre-merge signal; make it a **required status check** in branch protection so a red suite blocks the merge |
| `workflow_dispatch` | `IMPL` input (`go` default, or `java`) | manual runs, including the Java harness sanity check |
| `workflow_call` | `impl` input | lets `deploy.yml` gate deploys on the suite once the Go API is what gets deployed |

- There are no path filters: the suite runs on every merge, so a change anywhere (client, migrations, infra) can't slip past it.
- Until `functional-tests/go.mod` and the target implementation (`api-go/go.mod`, or `api/pom.xml` for Java) both exist, the job skips its test steps and posts a `::warning::` annotation saying why. It's visibly skipped, not silently green. Once both land, the suite runs and is enforced automatically with no workflow edits.
- On failure, `functional-tests/out/` is uploaded as an artifact (test output plus API logs) so an agent can debug from the CI run.

---

## The contract

### Conventions (apply to every endpoint)

| Concern | Rule |
|---|---|
| JSON keys | camelCase, unchanged from today: `recipeURL`, `firstName`, `lastName`, `defaultChecked`, `clerkUserId`, `createdAt`, `fulfilled` |
| Nullable fields | always present; `null` when unset (no omitted keys) |
| Timestamps | RFC 3339 UTC with exactly 3 fractional digits: `2026-09-30T14:03:11.123Z` |
| IDs | JSON numbers, server-assigned. A client-supplied `id` in a body is ignored |
| Lists | `200` with a JSON array; `[]` when empty. Never `204` |
| List ordering | Deterministic. Recipes: `name` ascending, case-insensitive. Users: `lastName`, then `firstName`. Orders: `createdAt` descending |
| Create | `201`, body is the created resource, `Location: /api/<resource>/<id>` header |
| Update | `200`, body is the updated resource. `PUT` is a full replacement: omitted optional fields become `null` or their default |
| Delete | `204`, empty body |
| Unknown JSON fields | ignored |
| Content-Type | `application/json` for every JSON response and error, including `404`/`401` |
| Path ids | must be positive integers; anything else returns `400 invalid_path_param` |

### Error body

Every 4xx/5xx response has this shape:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "request body failed validation",
    "details": [
      { "field": "name", "value": "", "issue": "must not be blank" }
    ]
  }
}
```

`details` is always an array (empty when there is nothing field-specific). One entry per failing field, sorted by `field`. `value` echoes what was sent (`null` if the field was missing).

| Code | Status | When | `message` |
|---|---|---|---|
| `unauthenticated` | 401 | missing or invalid token (also sends `WWW-Authenticate: Bearer`) | `missing or invalid bearer token` |
| `invalid_json` | 400 | unparseable body, or a field of the wrong type | `request body is not valid JSON: <parser detail>` |
| `validation_failed` | 400 | field rules violated | `request body failed validation` |
| `invalid_path_param` | 400 | non-numeric or non-positive path id | `path parameter "id" must be a positive integer, got "<raw>"` |
| `not_found` | 404 | unknown resource id | `<resource> <id> not found` (e.g. `recipe 42 not found`) |
| `conflict` | 409 | delete blocked by references | resource-specific; see below |
| `internal` | 500 | unexpected failure | `internal server error` (details logged, not returned) |

### Validation rules

| Resource | Field | Rule | `issue` text |
|---|---|---|---|
| Recipe | `name` | required, not blank after trim, ≤ 255 chars | `must not be blank` / `must be at most 255 characters` |
| Recipe | `description` | optional, ≤ 255 chars (DB column limit) | `must be at most 255 characters` |
| Recipe | `recipeURL` | optional; when present must be an absolute `http`/`https` URL | `must be an absolute http or https URL` |
| Recipe | `disabled` | optional boolean, default `false` | (type errors are `invalid_json`) |
| User / Profile | `firstName`, `lastName` | required, not blank, ≤ 255 | as above |
| User / Profile | `email` | required, valid address (`net/mail`-parseable, no display name), ≤ 255 | `must be a valid email address` |
| User / Profile | `defaultChecked` | optional boolean, default `true` | |
| Order | `selectedRecipes` | required, non-empty array of ids; every id must exist and be enabled; duplicates collapsed | `must contain at least one recipe id` / `unknown recipe ids: [7, 9]` / `disabled recipe ids: [3]` |
| Order | `selectedUserIds` | required, non-empty; every id must exist; duplicates collapsed | `must contain at least one user id` / `unknown user ids: [12]` |
| Order | `message` | optional string, ≤ 2000 chars; stored and returned as `""` when absent | `must be at most 2000 characters` |
| Log | `level` | required, one of `DEBUG`/`INFO`/`WARN`/`ERROR` (case-insensitive) | `must be one of DEBUG, INFO, WARN, ERROR` |
| Log | `message` | required, not blank, ≤ 10000 | as above |

Text fields are stored as sent (no trimming), apart from the blank check.

### Endpoints

Public (no token): `GET /api/healthcheck`, `GET /api/buildinfo`, `GET /api/recipes/public`, and CORS preflights. Everything else requires a valid token.

| Method & path | Success | Notes |
|---|---|---|
| `GET /api/healthcheck` | 200 `{"status":"ok"}` | |
| `GET /api/buildinfo` | 200 `{version, buildTimestamp, environment, apiUrl}` | real values; `buildTimestamp` is RFC 3339 |
| `GET /api/recipes?name=` | 200 `[Recipe]` | includes disabled recipes; `name` is a case-insensitive substring match |
| `GET /api/recipes/public` | 200 `[Recipe]` | enabled recipes only |
| `GET /api/recipes/{id}` | 200 `Recipe` | |
| `POST /api/recipes` | 201 `Recipe` | |
| `POST /api/recipes/multiadd` | 201 `[Recipe]` | all-or-nothing; validation `details[].field` is indexed: `[2].name` |
| `PUT /api/recipes/{id}` | 200 `Recipe` | |
| `PUT /api/recipes/disable/{id}` | 200 `Recipe` | idempotent; only changes `disabled` |
| `DELETE /api/recipes/{id}` | 204 | 409 if used by an order |
| `DELETE /api/recipes` | 204 | deletes recipes not referenced by any order; 409 if any are referenced (nothing deleted) |
| `GET /api/users` | 200 `[SysUser]` | |
| `GET /api/users/{id}` | 200 `SysUser` | |
| `POST /api/users` | 201 `SysUser` | `clerkUserId` is always `null` here |
| `PUT /api/users/{id}` | 200 `SysUser` | updates all 4 editable fields, **including `defaultChecked`**; `clerkUserId` unchanged |
| `DELETE /api/users/{id}` | 204 | 409 if the user was a recipient on any order |
| `POST /api/orders` | 201 `OrderDetails` | one transaction; email sent only after commit |
| `GET /api/orders` | 200 `[RecipeOrder]` | |
| `GET /api/orders/{id}` | 200 `OrderDetails` | |
| `PUT /api/orders/{id}` | 200 `OrderDetails` | full replacement of recipes, recipients, and message; see [Order editing](#order-editing--fulfillment) |
| `PUT /api/orders/{id}/fulfilled` | 200 `OrderDetails` | body `{ "fulfilled": true \| false }`; idempotent |
| `GET /api/profile` | 200 `SysUser` | 404 `not_found` with message `profile for current user not found` |
| `POST /api/profile` | 200 updated / 201 created `SysUser` | upsert keyed on token `sub` |
| `GET /api/profile/status` | 200 `{authenticated, profileExists, userId, email, name}` | the last three are `null` when there's no profile |
| `POST /api/logs` | 204 | |

**Removed:** `POST /api/users/multiadd`, `DELETE /api/users`, `GET /api/emailuser`, `GET /api/sendmq`. These return 404 `not_found` with message `route not found`.

**Shapes:**

```jsonc
// Recipe
{ "id": 1, "name": "Pot Roast", "description": null, "recipeURL": null, "disabled": false }
// SysUser
{ "id": 2, "firstName": "Ada", "lastName": "L", "email": "ada@x.test", "defaultChecked": true, "clerkUserId": null }
// RecipeOrder (list item)
{ "id": 3, "message": "", "createdAt": "2026-09-30T14:03:11.123Z", "fulfilled": false }
// OrderDetails = RecipeOrder + the two arrays (recipes sorted by name, users by lastName/firstName)
{ "id": 3, "message": "", "createdAt": "…", "fulfilled": false,
  "selectedRecipes": [Recipe, …], "selectedUsers": [SysUser, …] }
```

**409 messages:**
- recipe: `recipe 5 is used by 2 orders; disable it instead`
- delete-all: `3 recipes are used by orders; disable them instead`, with `details` listing `{ "field": "id", "value": 5, "issue": "used by 2 orders" }` per blocked recipe
- user: `user 4 is a recipient on 1 order`
- editing a fulfilled order: `order 3 is fulfilled; mark it unfulfilled before editing`

### Order editing & fulfillment

No schema change is needed: `recipeorder.fulfilled` already exists, and the join tables get rewritten.

**`PUT /api/orders/{id}`.** The body is the create body plus an optional `notify`:

```json
{ "selectedRecipes": [1, 2], "selectedUserIds": [4], "message": "extra milk", "notify": false }
```

- Validation is the same as create, with one exception: a recipe that is **already on the order** may stay even if it has since been disabled. A disabled recipe that is being newly added is rejected with `disabled recipe ids: [...]`.
- Replaces the order's recipes, recipients, and message in one transaction. `id`, `createdAt`, and `fulfilled` don't change.
- `notify` is an optional boolean, default `false`. When `true`, the updated order is emailed (after commit) to the **new** recipient list, with the subject prefixed `Updated: ` and otherwise identical to the create email. When `false`, no email is sent.
- Returns 409 `conflict` if the order is fulfilled (message above). Missing order → 404.

**`PUT /api/orders/{id}/fulfilled`.**
- Body `{ "fulfilled": <bool> }`. A missing field gives 400 `validation_failed` (`fulfilled`, `must be true or false`); a non-boolean gives 400 `invalid_json`.
- Sets the flag (both directions are allowed) and returns the full `OrderDetails`. Setting it to the current value is a no-op that still returns 200.
- Never sends email. Missing order → 404.

### Email (order created)

- Exactly **one** message per order, all recipients in `To`, from `No Reply (Meal Manager) <MEALMANAGER_EMAIL_FROM>`.
- Subject: `Grocery Meal Order for <Month> <day>`. The date is the order's `createdAt` in `America/New_York`, Go layout `January 2` (e.g. `Grocery Meal Order for September 30`).
- HTML body:
  - one `<li>` per selected recipe, sorted by name (case-insensitive)
  - each item is the recipe name, linked (`<a href>`) to `recipeURL` when it is set
  - recipes are distinct by id, so two recipes that share a name both appear
- The message paragraph appears only when `message` is non-empty, with the text HTML-escaped.
- Footer: `Order created at <Month day, year h:mm AM/PM TZ>` in `America/New_York` (Go layout `January 2, 2006 3:04 PM MST`).
- A plain-text alternative part carries the same content.
- No email is sent when order creation fails, for any reason.
- A failing send is retried a bounded number of times and then dropped and logged. This isn't black-box testable; it's documented here only.

---

## Test case catalog

### Health, build info, removed routes

| ID | Case | Expected |
|---|---|---|
| H-1 | `GET /api/healthcheck`, no token | 200 `{"status":"ok"}`, `application/json` |
| H-2 | Same, with a garbage token | 200 (public routes ignore tokens) |
| B-1 | `GET /api/buildinfo`, no token | 200, exactly 4 string keys |
| B-2 | Values | `version`=`0.0.0-functional`, `environment`=`test`, `apiUrl`=`http://api:8080`, `buildTimestamp` parses as RFC 3339 |
| X-1 | Each removed route, with a valid token | 404 `not_found`, `route not found`, `details: []` |
| X-2 | Unknown route `GET /api/nope`, with a valid token | 404 `not_found`, `route not found` |

### Auth (target: `GET /api/users`)

| ID | Case | Expected |
|---|---|---|
| A-1 | No `Authorization` header | 401 `unauthenticated`, `WWW-Authenticate: Bearer` |
| A-2 | Valid token | 200 |
| A-3 | Expired (`exp` in the past) | 401 `unauthenticated` |
| A-4 | `nbf` in the future | 401 |
| A-5 | Wrong `iss` | 401 |
| A-6 | Unknown `kid` | 401 |
| A-7 | No `kid` header | 401 |
| A-8 | Signed with a different RSA key | 401 |
| A-9 | `alg: none` | 401 |
| A-10 | HS256 using the public key as the HMAC secret | 401 |
| A-11 | Raw token without the `Bearer ` prefix | 401 |
| A-12 | Valid token, but no `sub` claim | 401 |
| A-13 | Every non-public endpoint (table-driven over the endpoint list) with no token | 401 `unauthenticated`. Runs before any body validation, so an invalid body still gets 401 |
| A-14 | Public endpoints with no token | 200 |

### CORS

| ID | Case | Expected |
|---|---|---|
| C-1 | Preflight `OPTIONS /api/recipes` from `http://client.test`, method `POST`, headers `authorization,content-type` | 204 or 200; `Access-Control-Allow-Origin: http://client.test`, `Allow-Credentials: true`, method and headers allowed; no token needed |
| C-2 | Same, from `http://evil.test` | no `Access-Control-Allow-Origin` header |
| C-3 | Actual `GET /api/recipes` with the allowed Origin and a valid token | 200, with `Access-Control-Allow-Origin` echoed |
| C-4 | 401 response to the allowed Origin | still carries the CORS headers, so the browser can read the error |

### Recipes

| ID | Case | Expected |
|---|---|---|
| R-1 | `GET /api/recipes`, empty DB | 200 `[]` |
| R-2 | Create with all fields | 201, `Location: /api/recipes/{id}`, body echoes the fields |
| R-3 | Create with only `name` | 201: `description:null`, `recipeURL:null`, `disabled:false` |
| R-4 | Create with an unknown field and a client `id` | 201; field ignored, server id assigned |
| R-5 | Create with `name` missing | 400 `validation_failed`, details `[{field:"name", value:null, issue:"must not be blank"}]` |
| R-6 | Create with `name: "   "` | 400, `value:"   "`, `must not be blank` |
| R-7 | Create with a 256-char `name` and a 256-char `description` | 400, two details sorted by field (`description`, `name`), each `must be at most 255 characters` |
| R-8 | Create with `recipeURL: "not a url"` and with `"ftp://x"` | 400, `must be an absolute http or https URL` |
| R-9 | Create with `disabled: "yes"` | 400 `invalid_json`; message names `disabled` |
| R-10 | Create with a malformed JSON body | 400 `invalid_json` |
| R-11 | List after creating `banana`, `Apple`, `cherry` (one disabled) | 200, in order `Apple`, `banana`, `cherry`, including the disabled one |
| R-12 | `?name=APP` | case-insensitive match returns `Apple` |
| R-13 | `?name=zzz` | 200 `[]` |
| R-14 | `GET /{id}` exists / missing | 200 / 404 `not_found` `recipe 999 not found` |
| R-15 | `GET /abc`, `GET /0`, `GET /-1` | 400 `invalid_path_param`, message includes the raw value |
| R-16 | `PUT` full replacement | 200, all fields replaced; a follow-up `GET` matches |
| R-17 | `PUT` omitting `description` | 200, `description:null` |
| R-18 | `PUT` with an invalid body | 400 with the same details as on create |
| R-19 | `PUT` on a missing id | 404 |
| R-20 | `PUT /disable/{id}`, twice | 200 both times, `disabled:true`, other fields unchanged |
| R-21 | `PUT /disable/{missing}` | 404 |
| R-22 | `DELETE /{id}`, unreferenced | 204; then `GET` returns 404 |
| R-23 | `DELETE /{missing}` | 404 `recipe 999 not found` |
| R-24 | `DELETE /{id}` for a recipe used by 2 orders | 409 `conflict`, `recipe <id> is used by 2 orders; disable it instead`; recipe still exists |
| R-25 | `GET /public` with enabled and disabled recipes, no token | 200, enabled only, sorted |
| R-26 | `POST /multiadd` with 3 valid recipes | 201, 3 recipes with ids |
| R-27 | `POST /multiadd` where item 2 has a blank name | 400, detail `field:"[1].name"`; **none** created |
| R-28 | `POST /multiadd []` | 400 `validation_failed`, detail `{field:"", value:[], issue:"must contain at least one recipe"}` |
| R-29 | `DELETE /api/recipes` with no orders | 204, then the list is `[]` |
| R-30 | `DELETE /api/recipes` when one recipe is referenced | 409 with a per-recipe detail; **no** recipes deleted |

### Users

| ID | Case | Expected |
|---|---|---|
| U-1 | List, empty DB | 200 `[]` |
| U-2 | Create a valid user | 201, `Location`, `clerkUserId:null` |
| U-3 | Create without `defaultChecked` | 201, `defaultChecked:true` |
| U-4 | Create with each required field missing (table-driven) | 400, one detail naming that field, `value:null` |
| U-5 | Create with `email: "not-an-email"`, and with `"Ada <a@x.test>"` | 400, `must be a valid email address` |
| U-6 | Create with a `clerkUserId` in the body | 201, `clerkUserId:null` (not settable here) |
| U-7 | List ordering: (`Smith`,`Bo`), (`adams`,`Cy`), (`Smith`,`Al`) | `adams Cy`, `Smith Al`, `Smith Bo` |
| U-8 | `GET /{id}` / missing / `abc` | 200 / 404 `user 999 not found` / 400 |
| U-9 | `PUT` changing all 4 fields, including `defaultChecked: false` | 200; a follow-up `GET` shows all 4 changed |
| U-10 | `PUT` on a profile-linked user | `clerkUserId` preserved |
| U-11 | `PUT` with invalid fields / missing id | 400 details / 404 |
| U-12 | `DELETE` unreferenced / missing | 204 / 404 |
| U-13 | `DELETE` a user who was a recipient | 409 `user <id> is a recipient on 1 order`; user still exists |

### Orders

| ID | Case | Expected |
|---|---|---|
| O-1 | List, empty DB | 200 `[]` |
| O-2 | Create with 2 recipes, 2 users, a message | 201, `Location: /api/orders/{id}`, `OrderDetails` with `fulfilled:false`, `createdAt` within ±5s of now in the exact format, arrays sorted |
| O-3 | `GET /{id}` after O-2 | 200, equal to the O-2 response body |
| O-4 | List with 3 orders created in sequence | newest first; items have exactly the 4 `RecipeOrder` keys |
| O-5 | Create without `message` | 201, `message:""` |
| O-6 | Create with duplicate ids `[1,1]` | 201, recipe appears once |
| O-7 | Create with `selectedRecipes: []`, or missing | 400, `must contain at least one recipe id` |
| O-8 | Create with `selectedUserIds: []`, or missing | 400, `must contain at least one user id` |
| O-9 | Create with one valid and two unknown recipe ids | 400, `unknown recipe ids: [<a>, <b>]` (sorted); no order created (list still `[]`) |
| O-10 | Create with an unknown user id | 400, `unknown user ids: [<id>]` |
| O-11 | Create with a disabled recipe | 400, `disabled recipe ids: [<id>]` |
| O-12 | Unknown recipes and unknown users at once | 400, two details (`selectedRecipes`, `selectedUserIds`) |
| O-13 | 2001-char message | 400, `must be at most 2000 characters` |
| O-14 | `GET /{missing}` / `/abc` | 404 `order 999 not found` / 400 |
| O-15 | Disabling a recipe after it was ordered | `GET /orders/{id}` still includes it, with `disabled:true` |
| O-16 | `PUT /{id}`: swap one recipe, replace recipients, change message | 200; `selectedRecipes`, `selectedUsers`, and `message` match the request; `id`, `createdAt`, `fulfilled` unchanged; a follow-up `GET` matches |
| O-17 | `PUT /{id}` omitting `message` | 200, `message:""` |
| O-18 | `PUT /{id}` with every validation failure from O-7…O-13 (table-driven) | same 400 details as create; order unchanged on a follow-up `GET` |
| O-19 | `PUT /{id}` keeping a recipe that was disabled after ordering | 200, recipe kept |
| O-20 | `PUT /{id}` adding a newly disabled recipe | 400, `disabled recipe ids: [<id>]` |
| O-21 | `PUT /{missing}` / `/abc` | 404 `order 999 not found` / 400 |
| O-22 | `PUT /{id}` on a fulfilled order | 409 `order <id> is fulfilled; mark it unfulfilled before editing`; order unchanged |
| O-23 | After O-16, a recipe/user that was removed from the order | can now be deleted (204) if no other order references it |
| F-1 | `PUT /{id}/fulfilled {"fulfilled":true}` | 200 `OrderDetails` with `fulfilled:true`; list item shows `fulfilled:true` |
| F-2 | Same request again | 200, still `true` |
| F-3 | `{"fulfilled":false}` on a fulfilled order | 200, `fulfilled:false`; the order is editable again (O-16 succeeds) |
| F-4 | `{}` | 400 `validation_failed`, detail `{field:"fulfilled", value:null, issue:"must be true or false"}` |
| F-5 | `{"fulfilled":"yes"}` | 400 `invalid_json`, message names `fulfilled` |
| F-6 | `PUT /{missing}/fulfilled` | 404 `order 999 not found` |

### Email

| ID | Case | Expected |
|---|---|---|
| E-1 | After O-2, wait ≤ 15s | exactly 1 message; `To` = both users |
| E-2 | From header | `No Reply (Meal Manager) <no-reply@functional.test>` |
| E-3 | Subject | `Grocery Meal Order for <Month day>` from `createdAt` in New York time |
| E-4 | Meal list | `<li>` items in case-insensitive name order |
| E-5 | Recipe with a URL / without | `<a href="<url>">name</a>` / plain name |
| E-6 | Two recipes with the same name | two `<li>` |
| E-7 | Message `<b>hi</b>` | appears escaped (`&lt;b&gt;`), not as markup |
| E-8 | Empty message | no message paragraph |
| E-9 | Footer timestamp | matches `createdAt` in New York time, layout `January 2, 2006 3:04 PM MST` |
| E-10 | Plain-text part | present, with every meal name |
| E-11 | Every rejected-order case (O-7…O-13) | no email after 3s |
| E-12 | `PUT /orders/{id}` with `notify:true` | exactly 1 new message to the **new** recipients only; subject `Updated: Grocery Meal Order for <Month day>` (date from the original `createdAt`); body lists the updated recipes |
| E-13 | `PUT /orders/{id}` with `notify` omitted or `false` | no email after 3s |
| E-14 | `PUT /orders/{id}` rejected (400/409) with `notify:true` | no email after 3s |
| E-15 | `PUT /orders/{id}/fulfilled` | no email after 3s |

### Profile (token `sub` = `user_test_1` unless stated)

| ID | Case | Expected |
|---|---|---|
| P-1 | `GET /api/profile`, no profile | 404 `not_found`, `profile for current user not found` |
| P-2 | `POST /api/profile` with a valid body | 201, `clerkUserId:"user_test_1"` |
| P-3 | `POST` again with changes | 200, same `id`, fields updated |
| P-4 | `POST` with an invalid body | 400 with the same rules and details as users |
| P-5 | `POST` with a body `clerkUserId: "someone_else"` | ignored; stays `user_test_1` |
| P-6 | `GET /status` without a profile | `{authenticated:true, profileExists:false, userId:null, email:null, name:null}` |
| P-7 | `GET /status` with a profile | `profileExists:true`, `userId`, `email`, `name:"First Last"` |
| P-8 | Two `sub`s | two distinct users; each `GET /api/profile` returns its own |
| P-9 | A profile user appears in `GET /api/users` | yes |

### Logs

| ID | Case | Expected |
|---|---|---|
| L-1 | `{level:"info", message:"x"}` | 204 |
| L-2 | `{level:"verbose", message:"x"}` | 400, `level` `must be one of DEBUG, INFO, WARN, ERROR` |
| L-3 | `{level:"INFO"}` (no message) | 400, `message` `must not be blank` |
| L-4 | With optional `context`, `correlationId`, `metadata` object | 204 |

---

## Contract changes vs. the Java API

These are the deliberate differences. Java will fail the related tests.

| Area | Java today | New contract |
|---|---|---|
| Unauthenticated | 403 (Spring default), empty body | 401 `unauthenticated` + `WWW-Authenticate` |
| Errors in general | bare 500 / empty bodies | structured error body with codes; 400/404/409 where appropriate |
| Empty lists | 204, no body | 200 `[]` |
| List ordering | unspecified | deterministic (see Conventions) |
| Create responses | no `Location` | `Location` header |
| Healthcheck | text `OK` | JSON `{"status":"ok"}` |
| Validation | none (DB errors become 500) | field rules above |
| Recipe search | case-sensitive | case-insensitive |
| Recipe delete, missing | 500 | 404 |
| Recipe/user delete, referenced | 500 (FK violation) | 409 with explanation |
| Delete all recipes | 500 if any referenced | 409, atomic |
| User update | ignores `defaultChecked` | updates it |
| User create without `defaultChecked` | likely 500 | defaults to `true` |
| Order create, bad ids | silently dropped; 500 only if *all* are bad | 400 listing the bad ids; nothing persisted |
| Order create, disabled recipe | allowed | 400 (matches the UI's description of "disabled") |
| Order create | not transactional | atomic; email only after commit |
| Order create response | `RecipeOrder` | `OrderDetails` |
| Order details | no `id`, `createdAt`, `fulfilled` | full `OrderDetails` |
| Order editing | not supported (the UI fakes success) | `PUT /api/orders/{id}`, with optional re-notify |
| Order fulfillment | column exists, nothing sets it | `PUT /api/orders/{id}/fulfilled` |
| Email meals | names only, de-duplicated by name | per recipe, linked to the URL, plus a plain-text part |
| Email timestamp | `#dates.format(Instant)` (likely broken) | defined New York format |
| Profile 404 | text body | JSON error |
| Profile create | 200 | 201 (update stays 200) |
| Profile status | omits keys when there's no profile | keys present as `null` |
| Logs | 200, accepts anything | 204, validated |
| Build info version | possibly the literal `@app.version@` | real value from build config |
| Removed endpoints | `/api/users/multiadd`, `DELETE /api/users`, `/api/emailuser`, `/api/sendmq` | 404 |

## Client follow-ups

The React client needs these changes to work against the new contract:
- Drop the `204` special-casing and expect `[]`.
- `RecipeOrderDetails` gets `createdAt` and `fulfilled`; `id` now arrives.
- `CreateRecipeOrderResponse` becomes `OrderDetails`.
- Fix the routes that don't exist: recipe delete should use `DELETE /api/recipes/{id}`; the default-checked toggle should use `PUT /api/users/{id}` with the full user; `disable()` should use `PUT /api/recipes/disable/{id}`.
- Show `error.message` / `error.details` instead of generic failure strings.
- Remove the dead order-item and order-recipient services.
- `EditOrder` saves through `PUT /api/orders/{id}` and offers a "re-send email" checkbox (`notify`). It shows the 409 message for fulfilled orders.
- `DisplayOrders` gets a "Mark fulfilled / unfulfilled" button that calls `PUT /api/orders/{id}/fulfilled`.

## Out of scope / open questions

- **Per-household data scoping.** Every authenticated user still sees all data. That is a separate design.
- **Rate limits / payload size limits.** Not specified.

## Rollout

1. **Harness + infra**: compose files, fixtures, harness package, then H/B/X/A/C. Validate the harness by running the cases Java should already pass (A-2, R-2, R-14 happy path, U-2, O-3-style reads).
2. **Resource specs**: R, U, O, P, L.
3. **Email**: E.
4. **Go API**: build behind `compose.go.yml`, working through the suite one file at a time (`go test -run TestRecipes`). CI enforces `IMPL=go` on every PR to and merge into `main`.
5. **Client update** to the new contract (above), tested against the Go API in a dev environment.
6. **Cutover**: switch the Fly image to Go and retire the Java overlay.
