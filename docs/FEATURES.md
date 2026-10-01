# Feature Catalog

Every user-facing feature, traced end to end: **UI route → React component → client service → HTTP endpoint → controller → repository → table**. Field-level mapping is in [DATA_MODEL.md](DATA_MODEL.md).

Status legend: ✅ works · ⚠️ partially works / has a known bug · ❌ wired in the UI but broken · 💤 dead code (exists, not reachable)

All `/api/**` endpoints require a valid Clerk JWT (`Authorization: Bearer …`) **except** `/api/healthcheck`, `/api/buildinfo`, `/api/recipes/public`, `/api/public/**`, `/api/health` (see `SecurityConfig`). The client attaches the token through `useAuthClient()` in `client/src/services/client.ts`.

---

## 1. Authentication (Clerk)

| Layer | Location |
|---|---|
| UI | `<ClerkProvider>` in `main.tsx`. `RequireAuth` wrapper, `<SignIn>`/`<SignUp>` routes, and `UserButton` in `App.tsx` |
| Token → API | `useAuthClient()` axios interceptor adds `Bearer` token |
| API | `JwtAuthenticationFilter` verifies RS256 against the Clerk JWKS (`JwkProviderConfig`), checks issuer (and audience if set), and sets the principal username = JWT `sub` |
| Helpers | `SecurityUtils.getCurrentUserId()` (Clerk user id), `isAuthenticated()` |

Status ✅. Caveats:
- There is authentication but **no authorization**. Every signed-in user has full CRUD on all data, including the "delete all" endpoints.
- Invalid tokens are logged and the request continues unauthenticated. Spring Security then returns 401/403.

## 2. User profile linked to Clerk identity

| Layer | Location |
|---|---|
| API | `UserProfileController`: `GET /api/profile`, `POST /api/profile` (upsert by `clerkUserId`), `GET /api/profile/status` |
| Repo | `SysUserRepository.findByClerkUserId` |
| Table | `sysuser.clerk_user_id` |
| UI | none |

Status 💤. The API exists but the client doesn't use it.

## 3. Recipes

| Feature | UI route / component | Client call | API endpoint (`RecipeController`) | Repo / table | Status |
|---|---|---|---|---|---|
| List recipes | `/recipes` → `DisplayRecipes` → `RecipesList` → `RecipeReadonly` | `useRecipesService().getAll()` | `GET /api/recipes?name=` | `findAll` / `findByNameContaining` → `recipe` | ⚠️ returns `204` with an empty body when there are no recipes. `getAll` doesn't handle 204 and returns `""` |
| View recipe details | click 🔍 in list (client-side only) | none | none | none | ✅ (the read-only panel always shows `disabled=false`, hard-coded in `recipes-list.component.tsx`) |
| Toggle disabled (soft delete) | ✖ icon in list → `disableRecipe` in `display-recipes.component.tsx` | `update(id, {...recipe, disabled: !disabled})` | `PUT /api/recipes/{id}` | `save` | ✅ (the icon reads as "remove" but it toggles) |
| Add recipe | `/recipes/new` → `AddRecipe` | `create()` | `POST /api/recipes` | `save` | ✅ |
| Bulk add from CSV | `/recipes/new` (CSV form) | none. Stubbed to show "CSV upload is not available" | `POST /api/recipes/multiadd` exists (body: `Recipe[]`) | `saveAll` | ❌ UI stub. `papaparse` is a dependency, and sample data is in `tools/test-data/recipe_import.csv` (`Name,Description,RecipeURL,Disabled`) |
| Edit recipe | `/recipes/:id` → `EditRecipe` | `get(id)`, `update(id, recipe)` | `GET/PUT /api/recipes/{id}` | `findById`/`save` | ✅ |
| Delete recipe | Delete button on `EditRecipe` | `delete(id)` → `DELETE /recipes/{id}/delete` | no such route. Real route: `DELETE /api/recipes/{id}` | `deleteById` | ❌ wrong URL in `recipes.service.ts`. The real route would also fail (500) for recipes used in orders, because of the FK |
| "Disable" via service | not used by UI | `disable(id)` → `DELETE /recipes/{id}` | maps to **hard delete**. Real disable route: `PUT /api/recipes/disable/{id}` | | 💤 / dangerous. Don't wire this up as-is |
| Remove all recipes | "Remove All" button on `/recipes` | `deleteAll()` | `DELETE /api/recipes` | `deleteAll` | ⚠️ no confirmation dialog. Fails if any order references a recipe |
| Public recipe list | none | none | `GET /api/recipes/public` (enabled only, unauthenticated) | `findByDisabled(false)` | 💤 |
| Recipe search page | `RecipeSelector` component | `getAll()` + client filter | | | 💤 not routed in `App.tsx` |

## 4. Household users (email recipients)

| Feature | UI route / component | Client call | API endpoint (`SysUserController`) | Status |
|---|---|---|---|---|
| List users | `/users` → `DisplayUsers` | `useSysUsersService().getAll()` (handles 204) | `GET /api/users` | ✅ |
| Toggle default-selected | button on `DisplayUsers` | `updateDefaultChecked(id, v)` → `PUT /users/{id}/defaultchecked` | no such route | ❌ |
| Create user | "New User" → links to `/users/new` | `create()` | `POST /api/users` | ❌ no route for `/users/new`. `EditUser` is mounted at `/myusers/:id` |
| Edit user | "Edit" → links to `/users/{id}` | `get()`, `update()` | `GET/PUT /api/users/{id}` | ❌ same route mismatch (`/users/:id` vs `/myusers/:id`). The API `PUT` also **ignores `defaultChecked`** |
| Delete user | `EditUser` Delete button | `delete(id)` | `DELETE /api/users/{id}` | ⚠️ reachable only through `/myusers/:id`. FK failure if the user was on an order |
| Bulk add users | none | none | `POST /api/users/multiadd` | 💤 |
| Delete all users | none | none | `DELETE /api/users` | 💤 |
| Dev test endpoints | none | none | `GET /api/emailuser`, `GET /api/sendmq` (hard-coded recipient address) | 💤 dev-only. They are not gated by environment |

## 5. Meal orders (the core workflow)

**Flow for "Create Order":**

1. `/orders/new` → `CreateOrder` loads `recipes.getAll()`, `users.getAll()`, and `users.getDefaultChecked()` (a client-side filter on `defaultChecked`) in parallel. Default users are pre-selected.
2. The user picks recipes (with client-side name search) and recipients, and types an optional message.
3. `useRecipeOrdersService().create({selectedRecipes, selectedUserIds, message})` sends `POST /api/orders`.
4. `RecipeOrderController.placeOrder`:
   - Resolves the IDs with `findAllById`. Invalid IDs are dropped silently, and it returns 500 if none are valid.
   - Inserts one `recipeorder` (createdAt=now, fulfilled=false).
   - Inserts one `recipeorderitem` per recipe and one `recipeorderrecipient` per user. This is **not transactional**: a mid-loop failure leaves a partial order.
   - Builds `GroceryMealOrderData` + `EmailTemplateData` and calls `Sender.send()` → RabbitMQ queue `email`.
   - Returns `201` with the `RecipeOrder` JSON.
5. `Receiver` (`@RabbitListener(queues="email")`) renders the Thymeleaf template `grocery-meal-order` and sends it with `EmailService` (SES SMTP, HTML body, from `MEALMANAGER_EMAIL_FROM`).
6. The client shows "Order #id created" and redirects to `/orders` after 1.5s.

| Feature | UI route / component | API | Status |
|---|---|---|---|
| Create order + email | `/orders/new` → `CreateOrder` | `POST /api/orders` | ⚠️ see risks below |
| List orders | `/orders` → `DisplayOrders` | `GET /api/orders` (204 when empty, handled) | ✅ |
| View order details | click an order in `DisplayOrders` | `GET /api/orders/{id}` → `RecipeOrderDetailsDTO` | ✅ recipes, recipients, and message display. The DTO's `id` is missing, but the page uses the list item's id |
| Edit order | `/orders/:id` → `EditOrder` | none. Save shows "Order updated successfully" without calling anything | ❌ no update endpoint. Header shows `#undefined` because the DTO has no `id` |
| Mark fulfilled | none | none | ❌ not implemented (the column exists) |

Email pipeline risks to check before changing anything here:
- `TemplateService` uses a `FileTemplateResolver` with the **filesystem** prefix `src/main/resources/email-templates/`. That path only exists when the API runs from the `api/` source dir (local, or `.docker/api.prod.dockerfile`, which copies the whole source tree). The Fly image (`api/Dockerfile.fly`) ships only the jar, so the template likely can't be resolved in production.
- The template calls `#dates.format(creationDate)`, but `creationDate` is a `java.time.Instant`. `#dates` expects a `java.util.Date`, and the Java 8 equivalent is `#temporals.format`. I didn't verify this at runtime, but it is likely to throw.
- When `Receiver` throws (for example, no recipients), Spring AMQP's default behavior is to requeue, which can redeliver forever.
- The email contains recipe names only, not URLs.

## 6. Client → server logging

| Layer | Location |
|---|---|
| Client | `useLoggingService()` hook (console + `POST /logs` through the auth client). There's also a global `logger` singleton |
| API | `LoggingController` `POST /api/logs` → `LoggingUtil` (SLF4J + optional file under `app.logging.directory`) |

Status ⚠️. The hook works for signed-in users. The global `logger` (used in `sys-users.service.ts`) calls `fetch('/api/logs')` **relative to the client origin and without a token**, so it never reaches the API. Only `CreateOrder` uses the hook, and it is very chatty: it logs on every keystroke in search and sends an HTTP request for each one.

## 7. Build info & health

| Feature | UI | API | Status |
|---|---|---|---|
| Build info | `/build-info` → `BuildInfoPage` (client version from `package.json` + API info) | `GET /api/buildinfo` (public) | ✅ |
| Health check | none | `GET /api/healthcheck` → `"OK"` (public) | ✅ |

## 8. Static pages

- `/` → `Home`: welcome text and links when signed in, sign-in/up links when signed out. ✅
- `/contact-us` → `ContactUs`: shows `VITE_CONTACT_*` env values. ✅

## Roadmap items (from README, not started)

- v1.0.0: recipe tags and rating past recipes
- v1.1.0: cron job to archive recipe pages (the Add Recipe help text already says snapshots will be taken, but this doesn't exist)
- v1.2.0: GotMilk integration (save grocery lists, sync)

---

## Endpoint index

| Method & path | Controller method | Auth | Used by client? |
|---|---|---|---|
| GET `/api/healthcheck` | `HealthCheckController.healthCheck` | public | no |
| GET `/api/buildinfo` | `BuildInfoController.getBuildInfo` | public | yes |
| POST `/api/logs` | `LoggingController.logClientMessage` | JWT | yes |
| GET `/api/recipes/public` | `RecipeController.getPublicRecipes` | public | no |
| GET `/api/recipes?name=` | `getAllRecipes` | JWT | yes |
| GET `/api/recipes/{id}` | `getRecipeById` | JWT | yes |
| POST `/api/recipes` | `createRecipe` | JWT | yes |
| POST `/api/recipes/multiadd` | `createRecipes` | JWT | no |
| PUT `/api/recipes/{id}` | `updateRecipe` | JWT | yes |
| PUT `/api/recipes/disable/{id}` | `disableRecipe` | JWT | no |
| DELETE `/api/recipes/{id}` | `deleteRecipe` | JWT | only through the misnamed `disable()` (unused) |
| DELETE `/api/recipes` | `deleteAllRecipes` | JWT | yes |
| GET `/api/users` | `SysUserController.getAllSysUsers` | JWT | yes |
| GET `/api/users/{id}` | `getSysUserById` | JWT | yes |
| POST `/api/users` | `createSysUser` | JWT | yes (unreachable UI) |
| POST `/api/users/multiadd` | `createSysUsers` | JWT | no |
| PUT `/api/users/{id}` | `updateSysUser` (ignores `defaultChecked`) | JWT | yes |
| DELETE `/api/users/{id}` | `deleteSysUser` | JWT | yes |
| DELETE `/api/users` | `deleteAllSysUsers` | JWT | no |
| GET `/api/emailuser` | `testSendEmail` (dev test) | JWT | no |
| GET `/api/sendmq` | `testSendRabbitMQ` (dev test) | JWT | no |
| POST `/api/orders` | `RecipeOrderController.placeOrder` | JWT | yes |
| GET `/api/orders` | `getOrders` | JWT | yes |
| GET `/api/orders/{id}` | `getOrderDetails` | JWT | yes |
| GET/POST `/api/profile`, GET `/api/profile/status` | `UserProfileController` | JWT | no |

Client calls with **no matching API route**: `DELETE /recipes/{id}/delete`, `PUT /users/{id}/defaultchecked`, everything under `/recipe-order-items/**` and `/recipe-order-recipients/**`.
