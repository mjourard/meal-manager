# Meal Manager: Agent Guide

A household meal-planning app. Users keep a recipe list, pick recipes for an "order", and email that list to household members.

- **Feature catalog** (UI → service → endpoint → table, with known bugs): [docs/FEATURES.md](docs/FEATURES.md)
- **Data model & field mapping** (DB ↔ Java ↔ JSON ↔ TS, DTOs, env vars): [docs/DATA_MODEL.md](docs/DATA_MODEL.md)
- **Functional test plan** (black-box contract tests for the planned Java → Go API port): [docs/FUNCTIONAL_TESTS_PLAN.md](docs/FUNCTIONAL_TESTS_PLAN.md)
- Deployment: [DEPLOYMENT.md](DEPLOYMENT.md), [deploy/terraform/README.md](deploy/terraform/README.md) · Debugging: [DEBUGGING.md](DEBUGGING.md)

Read FEATURES.md before changing a feature. Several client calls hit routes that don't exist, and a few UI flows are stubs.

## Stack

| Part | Path | Tech |
|---|---|---|
| "mm api" | `api/` | Spring Boot 2.4, Java 11 (Fly image runs JRE 17), JPA/Hibernate, Flyway, Postgres, RabbitMQ (spring-amqp), Thymeleaf email templates, SES SMTP, Clerk JWT via auth0 `java-jwt`/`jwks-rsa` |
| "mm client" | `client/` | React 19 + TypeScript + Vite, react-router v6, Bootstrap 5, axios, Clerk React |
| Infra | `.docker/`, `deploy/`, `.github/workflows/` | docker-compose for local deps; Fly.io (API, Postgres, RabbitMQ); Render (client); Terraform for AWS DNS |

## Commands

```bash
# Local deps (Postgres, RabbitMQ, localstack)
cd .docker && docker-compose up

# API (env vars from env-files/.env; see env-files/.env.dist)
cd api && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
cd api && ./mvnw -B test                                   # only a contextLoads test exists
cd api && ./mvnw -B checkstyle:check -Denvfile.skip=true   # lint (also runs in the validate phase)

# Client (env vars from client/.env; see client/.env.dist)
cd client && npm ci && npm run dev    # Vite default :5173. PORT in .env.dist is ignored, but the API's CORS_ALLOWED_ORIGIN defaults to :3000, so run with --port 3000 or change the origin
cd client && npm run lint
cd client && npm run build            # tsc -b && vite build
cd client && npm test                 # vitest; there are currently no test files

# Functional API contract tests (once functional-tests/ exists; CI runs these on every PR to and merge into main)
cd functional-tests && make functional IMPL=go   # or IMPL=java
```

## Architecture & request flow

```
React page (client/src/components/pages/*.component.tsx)
  → hook service (client/src/services/*.service.ts, uses useAuthClient() to attach Clerk Bearer token)
    → {VITE_MEALMANAGER_BASE_URL}/api/...
      → JwtAuthenticationFilter → @RestController (api/.../controller)
        → JpaRepository (api/.../repository) → Postgres
        → (orders only) Sender → RabbitMQ "email" queue → Receiver → Thymeleaf → EmailService (SES)
```

API package layout (`api/src/main/java/com/mealmanager/api/`): `config/` (security, JWT), `controller/`, `dto/` (+ `dto/templatedata/` for email template payloads), `messagequeue/`, `model/` (JPA entities), `repository/`, `security/`, `services/` (email, templates), `util/` (LoggingUtil).

There is no service layer: controllers call repositories directly. Follow that pattern unless the task calls for a refactor.

## Conventions (from `.cursor/rules/`, which apply here too)

- Client components are functional, one per file, named `<kebab-case-name>.component.tsx`. Pages go in `components/pages/`.
- Client services are React hooks (`useXService`) that return `useCallback`-wrapped methods, wrap axios errors as `new Error("Failed to …: msg", { cause })`, and treat HTTP `204` as an empty list.
- Client models live in `client/src/models/`. Use `CreateType<T>` / `UpdateType<T>` / `DisplayType<T>` from `utility-types.ts`. Define TS types before implementing.
- Prefer simple solutions. Don't duplicate existing code. Don't introduce new patterns or libraries without exhausting the existing ones. Touch only code related to the task.
- No mock or fake data outside tests. Keep dev/test/prod separate (Spring profiles `dev` / `prod`; tests use H2 via `api/src/test/resources/application.properties`).
- Never overwrite `.env` files without asking.
- Keep files under ~300–500 lines and functions under ~60 lines.
- Utility scripts start with a comment explaining their purpose.
- Lint overrides need a comment explaining why.

## Checklist: adding or changing a data field

1. Write a **Flyway migration** `api/src/main/resources/db/migration/V{next}__{desc}.sql`. Prod uses `ddl-auto=validate`, and dev's `update` hides missing migrations.
2. Update the JPA entity in `model/`: `@Column(name = "lowercase_db_name")`, plus a **getter and a setter**. Jackson needs the getter to emit the field and the setter to accept it.
3. If the controller copies fields one by one (the `PUT` handlers and the `POST` constructors do), add the new field there too.
4. Update the TS interface in `client/src/models/`, then the forms and pages.
5. Update [docs/DATA_MODEL.md](docs/DATA_MODEL.md) and, if behavior changes, [docs/FEATURES.md](docs/FEATURES.md).

## Checklist: adding an endpoint

1. Add it to the relevant controller under `/api/...`. It is JWT-protected by default. To make it public, add an `antMatchers(...).permitAll()` in `SecurityConfig`.
2. Add a method to the matching `client/src/services/*.service.ts` hook. **Check that the method and path match the controller exactly.** Past drift is listed under "Client calls with no matching API route" in FEATURES.md.
3. Return clear error details for validation failures: which field, which value, and what was expected. Existing handlers return bare `500` with a null body. Don't copy that.

## Gotchas

- Shared `hibernate_sequence` for `recipe`, `sysuser`, `recipeorder`. IDs are not per-table sequential.
- FKs have no cascade. Deleting a recipe or user that is referenced by an order fails with a 500.
- `POST /api/orders` is not `@Transactional`, so a failure can leave a partial order.
- `RecipeOrderDetailsDTO.orderId` has no getter, so `GET /api/orders/{id}` omits the id.
- Email templates load from the filesystem path `src/main/resources/email-templates/`, relative to the working directory. They won't resolve from a bare jar.
- `GET /api/recipes` returns `204` with an empty body when there are no recipes. `useRecipesService().getAll()` doesn't special-case 204.
- Authorization is not scoped: any authenticated user can read or modify all data.
