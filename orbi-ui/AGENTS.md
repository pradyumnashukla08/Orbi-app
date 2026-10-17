# Orbi UI — Project Rules

This repository is an **Expo + React Native + TypeScript** application (mobile-first). Every AI coding agent working here must follow these rules. This file is the **single source of truth** for project conventions — tool-specific files (`CLAUDE.md`, `GEMINI.md`) only import it.

`orbi-ui/` is the project root. Do all work inside it. Never create, modify, or delete anything outside `orbi-ui/`, and ask the user before deleting files.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

This project uses **npm** (`package-lock.json`). Use `npx`. (Use `bunx` only if a `bun.lock` appears.)

```bash
npx expo install <package>   # ALWAYS use this instead of npm install for Expo/RN packages — resolves SDK-compatible versions
npx expo start               # start the dev server (press a / i / w for android / ios / web)
npx tsc --noEmit             # typecheck
npx expo-doctor              # diagnose dependency and config issues
npx expo install --fix       # fix incompatible package versions
```

Run `npx tsc --noEmit` before declaring any task done. ESLint is not configured in this project yet (`npx expo lint` would install an ESLint config — ask the user first).

## Tech stack

- **Expo + React Native + TypeScript**
- **Expo Router** — file-based routing in `app/`
- **NativeWind** — Tailwind CSS for React Native (no web Tailwind setup, no extra CSS files)
- **Zustand** — state management
- **Axios** — API calls
- **react-native-toast-message** — toast/notification UI
- Do **not** add unnecessary libraries, UI frameworks, or extra dependencies. Do not recreate or unnecessarily modify the existing architecture without permission.

## Project structure

```text
app/              Expo Router routes (file = screen, _layout.tsx = navigator)
  index.tsx       root route
  admin/          admin panel routes
  user/           user panel routes
components/       reusable components, one per file
  admin/          admin-only components
  user/           user-only components
  common/         shared components
config/api.ts     shared Axios instance (base URL + common config)
config/clientCatchError.ts  shared API error handler (catch blocks call this)
config/toastConfig.tsx      shared toast layout config
stores/           Zustand stores
  admin/          admin stores
  user/           user stores
types/            shared TypeScript types
assets/           images, fonts, icons
global.css        Tailwind entry (imported once in app/_layout.tsx)
```

## Component rules

- One component per `.tsx` file.
- Always `const Name = () => {}` + `export default Name`. **Never** `function Name() {}`.
- Use React Native primitives (`View`, `Text`, `Pressable`, `ScrollView`, ...). **Never** HTML/React DOM elements (`div`, `button`, `span`).
- Reusable/presentational components live in `components/`, not inside `app/`.

```tsx
const ActivityLogsSkeleton = () => {
  return (
    <View>
      {/* Component content */}
    </View>
  );
};

export default ActivityLogsSkeleton;
```

## Routing rules

- **Expo Router only** (no React Navigation directly, no React Router). Routes are files under `app/`; `_layout.tsx` defines the navigator.
- Admin routes live under `app/admin/`, user routes under `app/user/`. Keep the panels independent.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Styling rules

- **NativeWind only** (via the `className` prop). Don't add another styling/UI library or web CSS files.
- `tailwind.config.js` must keep `darkMode: "class"` — NativeWind's web runtime throws `Cannot manually set color scheme...` if it is `media`.

## UI & accessibility rules

- Follow the existing UI design, colors, spacing, and typography conventions. Do not make unnecessary fancy UI or unrelated design changes.
- Respect Safe Area (the project already includes `react-native-safe-area-context`).
- Buttons and inputs must have accessible labels.
- Keep forms and inputs properly accessible when the keyboard is open.

## State management rules

- **Zustand only.** Stores go in `stores/admin/` or `stores/user/` depending on the panel.
- Don't introduce Redux, MobX, or app-wide React Context state.

## TypeScript rules

- Use proper TypeScript types and interfaces.
- Avoid `any`.
- Type API responses and component props properly.
- Use `unknown` for errors (see the API error handling rules).
- Do not suppress type errors without a reason.

## API call placement rules (strict)

This is a hard rule. Do not deviate without the user's explicit permission.

1. The API call belongs in the **same `.tsx` file as the component/page that triggers it**. The request (endpoint, params, body) *and* the response handling live in that file.
2. **Never** create a centralized `api/`, `services/`, `apiService.ts`, or similar folder/file that groups API endpoints or request functions together.
3. The only shared API code is the Axios configuration in `config/api.ts`:
   - Axios instance
   - Base URL (from `EXPO_PUBLIC_API_URL`)
   - Common headers
   - Common interceptors, if required
4. A component/page imports that shared Axios instance and owns its own endpoint, request params/body, and response handling. Never repeat the base URL per call.
5. Do **not** move, extract, or abstract an API call into another file unless the user explicitly asks for it.
6. Every agent must check existing code for API-call placement, and follow this rule for new features too.

Example: if `ActivityLogs.tsx` fetches activity logs, the Axios request and its response handling stay inside `ActivityLogs.tsx`; only the Axios instance is imported from `config/api.ts`.

## API error handling rules (strict)

- Keep the API call itself in the component/page that triggers it (see the API call placement rules above).
- In the `catch` block, call the shared helper only: `clientCatchError(error)`. Do not repeat Axios error parsing, authentication-error checks, or toast calls inside components/pages.
- The shared helper is `config/clientCatchError.ts`. It extracts the server error message, skips toasts for auth errors (`AUTH_TOKEN_INVALID`, `AUTH_TOKEN_MISSING`), and shows errors through the global `react-native-toast-message` setup.
- Do not replace, duplicate, inline, or move this helper without the user's permission.
- Every `catch` block that handles an API error must be typed `catch (error: unknown)` and end with `clientCatchError(error)`.

```tsx
import api from "../config/api";
import clientCatchError from "../config/clientCatchError";

const fetchActivityLogs = async () => {
  try {
    const response = await api.get("/activity-logs");
    // Handle the successful response here
  } catch (error: unknown) {
    clientCatchError(error);
  }
};
```

## Toast / notification rules (strict)

- Use **`react-native-toast-message`** for all toast notifications. It is the only allowed toast/notification mechanism in this project.
- Never install or use another toast/notification package.
- Never use `ToastAndroid`, `Alert`, or a custom toast implementation as a replacement for normal toast notifications.
- Use this package for success, error, and info notifications — including API success/error notifications.
- Keep the single global setup: `<Toast config={toastConfig} />` in `app/_layout.tsx`, with the shared config in `config/toastConfig.tsx` (both panels use it).
- Only the package's supported types are allowed: `success`, `error`, `info`. Do not invent unsupported toast types.
- Trigger toasts from the component/page that needs them via `Toast.show({ ... })`, following the API call placement rule above. Do not put toast calls in a shared service.
- Do not replace or restructure the existing toast setup without the user's permission.

## Loading & skeleton rules (strict)

Whenever content takes time to load, a loading state is mandatory. Never render asynchronous content without one.

**Normal loading**

- Show a loading indicator while an API call or async operation is running, and hide it when the operation finishes.
- Prevent duplicate requests and duplicate actions while loading (disable the trigger, guard re-entry), where applicable.
- Manage the loading state inside the component/page that owns the request.

**Skeleton loading**

- Use skeleton loading when content takes time to load and its layout is already known.
- Match the skeleton to the real content's layout so the screen stays stable while loading.
- Reuse existing skeleton components when they exist. If none exists and one is needed, create it.
- Skeleton components are reusable: one component per `.tsx` file, `const Name = () => {}` + `export default`, placed in `components/` (panel-agnostic ones in `components/common/`).

**Loading state handling**

- Set loading `true` before the request and `false` when it succeeds or fails — use `try / catch / finally` where appropriate.
- Keep `catch` handling to `clientCatchError(error)` (see the API error handling rules above).
- Keep loading active only during the request, never permanently.

**For every new page, component, or API integration an agent must:**

- Check whether a loading indicator is needed (mandatory).
- Check whether skeleton loading is needed for data-heavy UI (mandatory).
- Never ship asynchronous content without a loading state when the user has to wait.

## Admin vs User panel

- Keep panels separate: `app/admin/` vs `app/user/`, `components/admin/` vs `components/user/`, `stores/admin/` vs `stores/user/`.
- Never import admin-only code into the user panel (or vice versa). Shared code goes to `components/common/` or `types/`.

## Dependency rules

- Do **not** add libraries or UI frameworks without permission. Prefer Expo-recommended modules.
- Install Expo/RN packages with `npx expo install` so versions stay SDK-compatible.

## Environment & security rules

- Manage environment-specific API configuration through environment variables.
- Never commit API keys, passwords, tokens, or credentials to Git.
- Do not put secret credentials in Expo client-side environment variables (`EXPO_PUBLIC_*` values are bundled into the client and are not secret).
- Do not modify existing authentication or security logic without permission.

## Scope and permission rules

- If the user asks only for a folder structure, a prompt/instruction file, or an audit, **do not** implement functionality, UI, or business logic.
- Do not change the existing structure, conventions, or unrelated files without permission.
- Ask before deleting files or modifying anything outside `orbi-ui/`.

## Git workflow rules (strict)

**Base branch**

- `dev` is the main development branch. Frontend changes always start from `dev`.
- Never commit or push directly to `dev`.
- Never touch `main` without explicit permission.

**Separate branch for frontend changes**

For any frontend change (feature, bug fix, UI update, refactor):

1. Check the current Git status first.
2. Create a new branch from `dev`.
3. Branch names must start with the `ui/` prefix and be descriptive of the change.

Examples: `ui/activity-logs-page`, `ui/login-screen`, `ui/fix-loading-state`, `ui/toast-notifications`.

Never overwrite or discard existing user changes.

**Detailed description before pushing**

Before pushing any frontend change, prepare a detailed description that covers:

- What was changed.
- Which components/pages are affected.
- What functionality was added, updated, or fixed.
- Any changes to loading state, skeleton loading, API error handling, or toast notifications (if applicable).
- Any dependency install or configuration change.
- What testing/validation was run and its result.

A vague description ("UI updated", "Bug fixed") is not acceptable.

**Push workflow**

1. Review the changes and run the relevant checks.
2. Commit the changes on the new `ui/` branch.
3. Before pushing, show the branch name and the detailed change description to the user.
4. Wait for the user's approval before pushing.
5. Push to the remote only after approval.

If the user already gave explicit push permission for the task, do not ask for approval again — but the detailed description before pushing is still mandatory.

**Permanent restrictions**

- Never push frontend changes directly to `dev` or `main`.
- The `ui/` prefix is mandatory for frontend branches.
- Never reset, overwrite, or delete existing Git changes without permission.
- Never force-push any remote branch.
- If the current branch or Git state is unclear, inspect it first and ask the user when needed.

## Testing & completion report rules

- After changes, run the available TypeScript checks, lint, and relevant tests.
- Clearly report which tests were not run or failed.
- Never claim tests pass without actually running them.
- In the final report, state the modified files, the implemented changes, the testing results, and any remaining issues.

## Setup quirks (already handled — don't "fix" them)

- `package.json` uses `"main": "expo-router/entry"` for file-based routing (there is no `App.tsx`).
- `tsconfig.json` extends `expo/tsconfig.base.json` — the `.json` extension is intentional; some resolvers fail without it.
- `babel.config.js` needs `babel-preset-expo` (direct dependency) plus `nativewind/babel`, in that order.
- `nativewind-env.d.ts` provides NativeWind types and the `*.css` module declaration.
- `global.css` is imported only in `app/_layout.tsx`.

## Native builds / EAS

- If `ios/` and `android/` don't exist they are generated — never create or edit them by hand; configure native behavior via `app.json` and config plugins.
- Expo Go only includes bundled native modules. After adding a library with native code, a development build is needed: `npx expo run:android` / `npx expo run:ios`, or `eas build --profile development`.
- Building with EAS: run `npx eas-cli@latest <command>`. Docs: https://docs.expo.dev/eas/index.md

## Instruction files & rule preservation

- `AGENTS.md` is the central source of truth for project rules.
- Keep the instruction files for Claude Code (`CLAUDE.md`), Codex, Gemini CLI (`GEMINI.md`), and OpenCode consistent with this file, preserving all existing rules. (Codex and OpenCode read `AGENTS.md` directly.)
- Tool-specific instruction files should reference the central rules (or keep a compatible copy); they must not drop rules.
- **Never** delete, replace, or simplify an existing rule. Add new rules alongside the existing ones.
- If a new rule conflicts with an existing rule, report the conflict to the user instead of resolving it yourself.
