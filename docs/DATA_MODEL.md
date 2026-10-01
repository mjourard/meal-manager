# Data Model & Field Mapping

How each piece of data flows through the stack:

```
Postgres table/column  ──JPA @Column──▶  Java entity field  ──Jackson (getters)──▶  JSON  ──axios──▶  TS interface (client/src/models)
```

Jackson serializes **via public getters** and deserializes **via setters**. A field with no getter does not show up in JSON. This has already caused one bug (see `RecipeOrderDetailsDTO` below).

## Entity relationship overview

```
sysuser 1───* recipeorderrecipient *───1 recipeorder 1───* recipeorderitem *───1 recipe
```

- An **order** (`recipeorder`) is a set of recipes emailed to a set of users.
- `recipeorderitem` and `recipeorderrecipient` are join tables. Each one has its own surrogate `BIGSERIAL` id.
- None of the FKs are `ON DELETE CASCADE`. Deleting a recipe or user that appears in any order raises an FK violation, and the API returns `500`.
- No data is scoped per user. Every authenticated Clerk user can read and write every row in every table.

## ID generation

| Table | Strategy | Source |
|---|---|---|
| `recipe`, `sysuser`, `recipeorder` | `GenerationType.AUTO` → shared `hibernate_sequence` | `V1__initial_schema.sql` creates the sequence |
| `recipeorderitem`, `recipeorderrecipient` | `GenerationType.IDENTITY` → `BIGSERIAL` | per-table |

Because the three main entities share one sequence, their IDs are globally unique across those tables rather than per-table sequential.

## Schema management

- Flyway migrations live in `api/src/main/resources/db/migration/`. Only `V1__initial_schema.sql` exists so far.
- `application.properties` / `application-dev.properties` set `ddl-auto=update`, so Hibernate silently alters the dev schema to match the entities.
- `application-prod.properties` sets `ddl-auto=validate`. **Any entity change needs a new `V{n}__description.sql` migration**, or prod will refuse to start. Dev won't catch a missing migration because `update` masks it.

---

## Recipe

| DB `recipe` column | Type / constraint | Java `Recipe` field | JSON key | TS `Recipe` (`models/recipe.ts`) |
|---|---|---|---|---|
| `id` | bigint PK | `long id` (getter only) | `id` | `id: number` |
| `name` | varchar(255) NOT NULL | `String name` | `name` | `name: string` |
| `description` | varchar(255) null | `String description` | `description` | `description?: string` |
| `recipeurl` | text null | `String recipeURL` | `recipeURL` | `recipeURL?: string` |
| `disabled` | boolean NOT NULL default false | `boolean disabled` (`getDisabled`) | `disabled` | `disabled: boolean` |

Notes:
- `description` is capped at 255 chars in the DB. The client textarea doesn't enforce this, so a longer value fails with a generic 500.
- "Disabled" acts as a soft delete. Recipes are never filtered out by `disabled` except on `GET /api/recipes/public`, and the Create Order screen lists disabled recipes too.

## SysUser (household member / email recipient)

| DB `sysuser` column | Type / constraint | Java `SysUser` field | JSON key | TS `SysUser` (`models/sys-user.ts`) |
|---|---|---|---|---|
| `id` | bigint PK | `long id` | `id` | `id: number` |
| `firstname` | varchar NOT NULL | `firstName` | `firstName` | `firstName: string` |
| `lastname` | varchar NOT NULL | `lastName` | `lastName` | `lastName: string` |
| `email` | varchar NOT NULL | `email` | `email` | `email: string` |
| `defaultchecked` | boolean NOT NULL default true | `Boolean defaultChecked` | `defaultChecked` | `defaultChecked: boolean` |
| `clerk_user_id` | varchar, unique (JPA only; no DB unique index in V1) | `clerkUserId` | `clerkUserId` | **missing** |

Notes:
- A `SysUser` is an **email recipient**, not necessarily a login. Rows created through `/api/users` have no `clerk_user_id`. Rows created through `/api/profile` are linked to the Clerk `sub` claim.
- `defaultChecked` decides whether the user is pre-selected as a recipient on the Create Order screen.

## RecipeOrder

| DB `recipeorder` column | Type | Java `RecipeOrder` field | JSON key | TS `RecipeOrder` (`models/recipe-order.ts`) |
|---|---|---|---|---|
| `id` | bigint PK | `long id` | `id` | `id: number` |
| `message` | text null | `String message` | `message` | `message?: string` |
| `createdat` | timestamp (no tz) | `Date createdAt`, set in constructor | `createdAt`, formatted `yyyy-MM-dd'T'HH:mm:ss.SSSXXX` | `createdAt: Date \| string \| null` |
| `fulfilled` | boolean null | `Boolean fulfilled` (`isFulfilled` → false if null) | `fulfilled` | `fulfilled: boolean` |

Nothing sets `fulfilled` to `true`. No endpoint exists for it.

## RecipeOrderItem / RecipeOrderRecipient (join tables)

| DB column | Java field | Notes |
|---|---|---|
| `recipeorderitem.orderid` | `long orderId` + `@ManyToOne RecipeOrder recipeOrder` (read-only join) | Write the raw id. The relation is `insertable=false, updatable=false` |
| `recipeorderitem.recipeid` | `long recipeId` + `@ManyToOne Recipe recipe` | Only `getRecipe()` is public |
| `recipeorderrecipient.orderid` | `long orderId` + `RecipeOrder recipeOrder` | |
| `recipeorderrecipient.sysuserid` | `long sysUserId` + `SysUser sysUser` | Only `getSysUser()` is public |

The client has TS models for these (`recipe-order-item.ts`, `recipe-order-recipient.ts`) with **different field names** (`recipeOrderId`, `userId`). There is also no API that serves these entities directly, so those models and their services are dead code.

---

## DTOs (API request/response shapes that aren't entities)

### `RecipeOrderDTO`: request body for `POST /api/orders`

| JSON key | Java | TS `CreateRecipeOrderDetails` |
|---|---|---|
| `selectedRecipes` | `List<Long>` (recipe ids) | `number[]` |
| `selectedUserIds` | `List<Long>` (sysuser ids) | `number[]` |
| `message` | `String` (null → `""`) | `string` |

Unknown IDs are dropped without error (`findAllById`). The API returns 500 only when *all* of them are invalid.

### `RecipeOrderDetailsDTO`: response for `GET /api/orders/{id}`

| JSON key | Java | TS `RecipeOrderDetails` |
|---|---|---|
| *(not emitted)* | `Long orderId`, **no getter** | `id: number` ← always `undefined` |
| `selectedRecipes` | `List<Recipe>` | `Recipe[]` |
| `selectedUsers` | `List<SysUser>` | `SysUser[]` |
| `message` | `String` (null → `""`) | `message?: string` |

### `EmailTemplateData`: RabbitMQ message on queue `email`

This is a Java-serialized object (`Serializable`, default `SimpleMessageConverter`). It never reaches the client.

| Field | Content for order emails |
|---|---|
| `toAddresses` | each selected user's `email` |
| `ccAddresses`, `bccAddresses` | unused (no getters; the Receiver ignores them) |
| `subject` | `"Grocery Meal Order for <Month dd>"` (America/New_York, `GroceryMealOrderData.getStandardSubject`) |
| `templateName` | `"grocery-meal-order"` |
| `dataMap.meals` | `SortedSet<String>` of recipe **names**. Alphabetical, de-duplicated by name. URLs are not included |
| `dataMap.message` | order message |
| `dataMap.creationDate` | `Instant.now()` at send time (not `recipeorder.createdat`) |

Template: `api/src/main/resources/email-templates/grocery-meal-order.html` (Thymeleaf). Variable names come from the `GroceryMealOrderData.VARIABLES` enum.

### Build info: `GET /api/buildinfo`

`{ version, buildTimestamp, environment, apiUrl }`. It comes from `app.version` / `app.build.timestamp` (Maven-filtered), `spring.profiles.active`, and `API_URL`. The TS side is `BuildInfo` in `services/build-info.service.ts`.

### Client log: `POST /api/logs`

The request body is `{ level, message, context?, correlationId?, metadata? }` (TS `LogData` in `services/logging.service.ts`). The API writes it through `LoggingUtil.logClientMessage` to the API's logs and, if `app.logging.file.enabled`, to a file under `app.logging.directory`.

### Profile: `/api/profile`

- `GET /api/profile` returns the `SysUser` whose `clerkUserId` matches the JWT `sub`.
- `POST /api/profile` upserts that row using a `SysUser` body.
- `GET /api/profile/status` returns `{ authenticated, profileExists, userId?, email?, name? }`.

There are no TS models for these yet. The client doesn't call them.

---

## Configuration → code mapping

| Env var | Consumed by | Purpose |
|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_QUERY_PARAMS`, `DB_USERNAME`, `DB_PASSWORD` | `spring.datasource.*` | Postgres |
| `RABBITMQ_HOST`, `RABBITMQ_PORT`, `SPRING_RABBITMQ_USERNAME/PASSWORD` | `spring.rabbitmq.*` | email queue |
| `AWS_SES_REGION`, `AWS_SMTP_USERNAME`, `AWS_SMTP_PASSWORD` | `spring.mail.*` | SES SMTP |
| `MEALMANAGER_EMAIL_FROM` | `from.email.address` → `EmailService` | sender address |
| `CORS_ALLOWED_ORIGIN` | `SecurityConfig`, `ApiApplication` | client origin |
| `CLERK_JWKS_URI`, `CLERK_ISSUER` | `auth.jwt.*` → `JwtConfig` | JWT verification |
| `APP_ENVIRONMENT`, `APP_DEBUG_ENABLED`, `API_URL`, `APP_LOGGING_*` | `app.*` | build info, debug logging, file logging |
| `VITE_MEALMANAGER_BASE_URL` | `client/src/services/client.ts` | API base (the client appends `/api`) |
| `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_SIGN_IN_URL`, `VITE_CLERK_SIGN_UP_URL` | `main.tsx`, `App.tsx` | Clerk |
| `VITE_CONTACT_NAME/EMAIL/PHONE` | `contact-us.component.tsx` | static contact page |
| `VITE_APP_VERSION` | overwritten by `vite.config.ts` from `package.json` version | build info page |

Templates: `.env.dist` at `env-files/.env.dist` (API/compose) and `client/.env.dist`. Production API values are in `api/fly.toml`, with secrets set through `deploy/scripts/fly-secrets.sh`.
