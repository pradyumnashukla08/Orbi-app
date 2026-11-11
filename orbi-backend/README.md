# ORBI --- Your Personal AI Memory

> **Save what you see. Find it when you need it.**
>
> ORBI is a personal visual-memory application that helps people save
> things they notice on their phone and retrieve them later using
> natural-language search. A user saves a screen or image, ORBI stores
> it with useful metadata, and an AI-assisted pipeline makes the memory
> searchable by meaning, text, category, and date.

**Project status:** Early MVP implementation\
**Initial target:** Mobile-first MVP\
**Working name:** ORBI\
**Primary experience:** One-tap save + natural-language retrieval

### Current implementation snapshot

The current mobile flow is implemented in `orbi-ui` with Expo and React
Native:

- The onboarding permissions screen requests camera, Photos/media-library,
  and device media-library access only after the user taps **Allow Camera
  & Photos**.
- If the user denies a permission, the native prompt closes without an
  error toast; the user remains on the permissions screen.
- The capture screen supports choosing an image from the gallery or taking
  one with the camera.
- Selected images are stored locally in AsyncStorage first. A pending
  image remains available locally if the backend sync fails.
- Authenticated image sync uses `POST /api/v1/images` and stores the image
  as a validated data URL in MongoDB.
- Login uses the backend JWT response. Signup and Google UI flows still
  require the remaining verification/provider integration before they
  should be treated as production authentication.

The implementation currently uses MongoDB and AsyncStorage for this
vertical slice. The broader SQLite, OCR, embeddings, and semantic-search
design described below remains planned work.

------------------------------------------------------------------------

## Table of contents

-   [1. Overview](#1-overview)
-   [2. Problem statement](#2-problem-statement)
-   [3. Product vision](#3-product-vision)
-   [4. Goals and non-goals](#4-goals-and-non-goals)
-   [5. Core user journey](#5-core-user-journey)
-   [6. Feature requirements](#6-feature-requirements)
-   [7. Search experience](#7-search-experience)
-   [8. System architecture](#8-system-architecture)
-   [9. Data and processing flow](#9-data-and-processing-flow)
-   [10. Suggested technology stack](#10-suggested-technology-stack)
-   [11. Data model](#11-data-model)
-   [12. API outline](#12-api-outline)
-   [13. AI and retrieval design](#13-ai-and-retrieval-design)
-   [14. Mobile platform constraints](#14-mobile-platform-constraints)
-   [15. Privacy and security](#15-privacy-and-security)
-   [16. Reliability and performance](#16-reliability-and-performance)
-   [17. MVP scope](#17-mvp-scope)
-   [18. Development roadmap](#18-development-roadmap)
-   [19. Testing strategy](#19-testing-strategy)
-   [20. Success metrics](#20-success-metrics)
-   [21. Risks and mitigations](#21-risks-and-mitigations)
-   [22. Example repository structure](#22-example-repository-structure)
-   [23. Local development direction](#23-local-development-direction)
-   [24. Open decisions](#24-open-decisions)
-   [25. Product principle](#25-product-principle)

------------------------------------------------------------------------

## 1. Overview

ORBI is a **personal visual-memory and semantic-search app**. It is
designed for moments when a person sees something useful or interesting
but does not have time to act on it.

Examples:

-   A pair of shoes in a social-media post
-   A product on a shopping website
-   A desk setup or room-design idea
-   A code snippet, tutorial, or technical diagram
-   A place, event, recipe, quote, or article
-   A piece of information the user wants to revisit later

The user saves the item to ORBI. ORBI keeps the original image or
screenshot and, where available, extracts searchable information such as
text, a short description, tags, timestamp, and source metadata. The
user can later search with a phrase such as:

> "Find the black shoes I saw last week."

ORBI retrieves likely matches using semantic similarity and ordinary
filters, then displays the saved image and available details.

### Product promise

**Turn things you notice into memories you can find again.**

ORBI should reduce the need to remember which app, page, or date
contained an item. It should not promise that every screen or every
protected app can be captured; capture capabilities depend on platform
rules, user consent, and app restrictions.

------------------------------------------------------------------------

## 2. Problem statement

People regularly discover useful content while doing something else.
They may not have time to buy an item, read an article, copy a link, or
organize it into a folder. Later, they remember only a few details and
cannot find the original item.

Traditional approaches have limitations:

-   Screenshots accumulate without useful organization.
-   Gallery search may find text or objects but may not understand the
    user's intent.
-   Bookmarks require the user to save a link and depend on that link
    remaining available.
-   Notes require extra effort at the moment of discovery.
-   Folder and tag systems rely on users organizing content
    consistently.

ORBI aims to make saving effortless and retrieval flexible.

------------------------------------------------------------------------

## 3. Product vision

ORBI should feel like an external memory for things the user sees on
their device.

### Core principles

1.  **Capture should be quick.** Saving an item should require minimal
    interaction.
2.  **The original should be preserved.** AI-generated text is
    supplementary and must not replace the saved image.
3.  **Search should understand meaning.** Users should not need to
    remember exact words.
4.  **Filters should be predictable.** Date, category, and other filters
    should narrow results clearly.
5.  **The user remains in control.** Capture, storage, processing, sync,
    and deletion must be transparent.
6.  **AI failure must not destroy a memory.** A saved item remains
    available even if analysis fails.
7.  **Platform behavior must be honest.** The app must clearly
    communicate where background or screen-capture restrictions apply.

------------------------------------------------------------------------

## 4. Goals and non-goals

### Goals

-   Let a user register and sign in.
-   Save an image or screenshot with minimal friction.
-   Preserve the original locally where supported.
-   Optionally sync saved memories to a backend.
-   Process saved images asynchronously.
-   Extract text with OCR and generate useful descriptions or tags.
-   Generate embeddings for semantic search.
-   Search using natural-language queries.
-   Filter by date, category, and processing status.
-   Let users view, edit metadata, retry processing, and delete
    memories.
-   Keep each user's data isolated from every other user.
-   Provide a path to a reliable Android-first experience.

### Non-goals for the first MVP

-   Automatically recording the screen continuously.
-   Capturing screens without a clear user action and consent.
-   Bypassing operating-system security or protected-content
    restrictions.
-   Guaranteeing that a floating overlay works above every app.
-   Building a social network or public sharing feed.
-   Training a foundation model from user screenshots.
-   Automatically purchasing products or taking actions on the user's
    behalf.
-   Full cross-device sync before the basic save-and-search loop works.
-   Promising identical capture features on Android and iOS.

------------------------------------------------------------------------

## 5. Core user journey

### 5.1 Onboarding

1.  User installs ORBI.
2.  User registers or signs in.
3.  ORBI explains what it stores and how AI processing works.
4.  User chooses whether to enable optional features such as cloud sync.
5.  ORBI requests permissions only when a feature needs them.
6.  User can use the core gallery and import flow without granting
    unrelated permissions.

### 5.2 Save a memory

1.  User sees something worth keeping.
2.  User uses an available capture path: in-app screenshot/import,
    Android-supported capture flow, or share-to-ORBI.
3.  ORBI confirms the save.
4.  The original image is stored locally where supported.
5.  A memory record is created with timestamp and processing status.
6.  If cloud processing is enabled, a background task uploads or submits
    the item according to the user's settings.
7.  The item appears in the library immediately, even while processing
    is pending.

### 5.3 Process a memory

1.  A worker receives a processing job.
2.  The worker validates the input and checks size/type limits.
3.  OCR extracts visible text when possible.
4.  An image-understanding model may generate a concise description and
    candidate tags.
5.  The configured embedding model generates a vector representation.
6.  Metadata and embedding are stored.
7.  Processing status changes to `ready`, or to `failed` with a
    retryable error code.

### 5.4 Find a memory

1.  User enters a natural-language query.
2.  ORBI generates a query embedding.
3.  The backend searches only the current user's memories.
4.  Semantic similarity retrieves candidate matches.
5.  Structured filters such as date and category are applied.
6.  Optional text matching and ranking improve results.
7.  ORBI displays result thumbnails, descriptions, saved dates, and
    available source information.
8.  User opens the result to see the original image and details.

### 5.5 Delete a memory

1.  User chooses delete.
2.  ORBI explains whether deletion affects local data, cloud data, or
    both.
3.  The memory record, embedding, extracted text, and stored image
    copies are deleted according to the product's retention policy.
4.  Any pending jobs for that memory are cancelled or made safe to
    discard.
5.  The item no longer appears in search results.

------------------------------------------------------------------------

## 6. Feature requirements

### 6.1 Authentication and account

-   Registration and sign-in.
-   Secure password hashing if password-based authentication is used.
-   Short-lived access tokens and a secure refresh-token strategy, or a
    trusted managed identity provider.
-   Sign-out and session revocation.
-   Rate limits on authentication endpoints.
-   Authorization checks on every memory-related API.
-   Account deletion and data export should be planned before
    production.

### 6.2 Capture and import

-   Import an image from the device.
-   Support the platform's share sheet where feasible.
-   Provide a clear save confirmation.
-   Store capture time and source information only when available and
    permitted.
-   Avoid duplicate uploads where a stable content hash can be used
    safely.
-   Handle low storage, permission denial, interrupted uploads, and
    unsupported image types.
-   Never imply that capture succeeded until the image has actually been
    persisted.

### 6.3 Memory library

-   Grid/list view of saved items.
-   Thumbnail and original-image viewing.
-   Sort by newest, oldest, or relevance.
-   Filter by date range, category, and processing status.
-   View extracted text, AI description, and tags.
-   Edit user-facing title or tags.
-   Retry processing after recoverable errors.
-   Delete one item and, eventually, bulk-delete selected items.

### 6.4 AI processing

-   OCR text extraction.
-   Image description generation, when enabled.
-   Candidate tag/category extraction.
-   Embedding generation.
-   Retry with bounded attempts and backoff.
-   Version model metadata so embeddings can be rebuilt when models
    change.
-   Track processing status without exposing internal stack traces to
    users.

### 6.5 Search

-   Natural-language search.
-   Semantic similarity search.
-   Optional full-text search over OCR and descriptions.
-   Date range filters.
-   Category and tag filters.
-   Pagination or cursor-based loading.
-   Relevance ranking.
-   Empty, loading, offline, and error states.
-   Search results must always be scoped to the authenticated user.

### 6.6 Settings and controls

-   Cloud processing and sync preferences.
-   AI-processing disclosure.
-   Local/cloud storage status where possible.
-   Delete memory and account controls.
-   Permission explanations.
-   Clear indication when a feature is unavailable on the current
    platform.

------------------------------------------------------------------------

## 7. Search experience

A user should be able to describe what they remember rather than recall
exact filenames.

Examples:

  -----------------------------------------------------------------------
  User query                          Expected retrieval signals
  ----------------------------------- -----------------------------------
  "Black running shoes"               Image embedding, OCR text,
                                      description, shopping category

  "Desk setup with warm lights"       Visual similarity and generated
                                      description

  "The tutorial with a database       OCR, image description, semantic
  diagram"                            embedding

  "Something I saved last Monday"     Timestamp/date filter

  "The backpack from the shopping     Semantic match plus source
  app"                                metadata, if available

  "Recipe with paneer"                OCR text and semantic match
  -----------------------------------------------------------------------

Search results are probabilistic. ORBI should show ranked candidates
rather than claiming that a result is definitely the item the user
remembers. Users should be able to refine a query or adjust filters.

### Suggested ranking strategy

A first version can use vector similarity plus simple metadata filters.
Later, combine:

-   Semantic similarity
-   Full-text relevance
-   Recency, when the query implies a time
-   User-provided title and tags
-   Source/category match
-   Optional reranking model

Keep ranking explainable enough to debug. Avoid letting recency dominate
a query when the user did not mention time.

------------------------------------------------------------------------

## 8. System architecture

``` mermaid
flowchart TD
    A[Mobile App] --> B[Capture / Import]
    B --> C[Local Image Storage]
    B --> D[Memory Metadata]
    D --> E[Backend API]
    E --> F[(PostgreSQL)]
    E --> G[Object Storage - optional]
    E --> H[Job Queue]
    H --> I[Background Worker]
    I --> J[OCR]
    I --> K[Image Understanding]
    I --> L[Embedding Model]
    J --> F
    K --> F
    L --> M[(pgvector)]
    N[Search Query] --> E
    E --> M
    E --> F
    E --> O[Ranked Search Results]
    O --> A
```

### Main components

**Mobile client** - Authentication screens. - Save/import interface. -
Local image handling. - Memory library and filters. - Search UI. -
Platform-specific capture adapter. - Clear permission and privacy UX.

**Backend API** - Authentication and authorization. - Memory CRUD. -
Upload initiation and completion. - Search endpoint. - Processing status
and retry endpoints. - User preferences and deletion workflows.

**Relational database** - Users, memory metadata, tags, jobs, and
processing states. - Referential integrity and per-user ownership. -
Vector extension such as `pgvector`, if selected.

**Image storage** - Local files on device for local-first behavior. -
Optional private object storage for cloud sync and processing. -
Short-lived signed URLs rather than public image URLs.

**Job queue and worker** - Asynchronous OCR, image description,
embedding generation, and retries. - Idempotent processing. - Bounded
retries and dead-letter/error handling where supported.

**AI providers/models** - OCR provider or local OCR. -
Image-understanding model. - Text or multimodal embedding model. -
Optional reranker. - Provider choice should remain behind interfaces so
the system is not locked to one vendor.

------------------------------------------------------------------------

## 9. Data and processing flow

### Save flow

1.  Capture/import returns an image file.
2.  The client validates the file and writes it to local storage.
3.  The client creates a pending memory record locally.
4.  If sync is enabled, the client requests an upload target or submits
    the image through an authenticated upload endpoint.
5.  The backend validates ownership, MIME type, size, and upload
    completion.
6.  The backend creates a processing job.
7.  The API returns the memory ID and current status.
8.  The client shows the item immediately.

### Processing flow

1.  Worker claims a job.
2.  Worker checks whether the memory still exists and is eligible for
    processing.
3.  Worker loads the image from private storage.
4.  OCR and image analysis run with timeouts.
5.  The worker normalizes extracted text and tags.
6.  The embedding is generated with a known model/version.
7.  Results are written transactionally where practical.
8.  Job and memory statuses are updated.
9.  Temporary files and unnecessary intermediate data are removed.

### Search flow

1.  Validate the authenticated user and query length.
2.  Validate filters and pagination.
3.  Generate the query embedding.
4.  Retrieve vector candidates with a mandatory user filter.
5.  Apply structured filters and optional full-text matching.
6.  Rank candidates and return a small result page.
7.  The client loads authorized thumbnails or uses temporary signed
    URLs.

### Important consistency rule

A memory must not become permanently unusable just because a worker
crashes. Jobs should be retryable and idempotent. A worker processing
the same memory twice must not create duplicate memory records or
duplicate tags.

------------------------------------------------------------------------

## 10. Suggested technology stack

This is a proposed stack, not a claim that every component has already
been implemented.

  -----------------------------------------------------------------------
  Layer                   Initial option          Reason
  ----------------------- ----------------------- -----------------------
  Mobile app              React Native + Expo +   Shared UI and
                          TypeScript              TypeScript workflow

  Platform-specific       Native Android module   Android overlay/capture
  capture                 when required           behavior needs native
                                                  APIs and OS compliance

  Backend                 Node.js + TypeScript +  Familiar ecosystem and
                          Express                 clear API boundaries

  Database                PostgreSQL              Relational metadata,
                                                  transactions, filtering

  Vector search           `pgvector`              Keep metadata and
                                                  vectors together
                                                  initially

  Image storage           Device storage first;   Supports local-first
                          private object storage  MVP and later sync
                          for cloud sync          

  Job processing          Queue + separate worker Keeps AI work out of
                                                  request/response path

  Validation              Zod or equivalent       Validate request and
                                                  job payloads

  API documentation       OpenAPI                 Testable and
                                                  discoverable endpoints

  Testing                 Vitest/Jest, API        Unit and end-to-end
                          integration tests,      confidence
                          mobile tests            

  Observability           Structured logs and     Debug failed jobs and
                          error tracking          slow searches

  Deployment              Containerized           Repeatable deployment
                          API/worker when ready   
  -----------------------------------------------------------------------

### Keep the first version simple

-   Do not add microservices before the main flow works.
-   Start with one API and one worker process.
-   Use PostgreSQL before introducing a separate vector database.
-   Avoid storing large base64 image strings in database rows.
-   Keep AI-provider integrations behind small interfaces.
-   Do not make Redis mandatory unless a queue, caching, or
    rate-limiting requirement justifies it.

------------------------------------------------------------------------

## 11. Data model

The following is a conceptual model. Exact columns and constraints
should be finalized during implementation.

### `users`

  -----------------------------------------------------------------------
  Field                               Purpose
  ----------------------------------- -----------------------------------
  `id`                                Primary key

  `email`                             Unique login identifier, if email
                                      login is used

  `password_hash`                     Hashed password, if locally managed
                                      authentication is used

  `created_at`                        Account creation time

  `updated_at`                        Last update time

  `status`                            Active, disabled, or pending
                                      deletion
  -----------------------------------------------------------------------

### `memories`

  -----------------------------------------------------------------------
  Field                               Purpose
  ----------------------------------- -----------------------------------
  `id`                                Memory UUID

  `user_id`                           Owner; indexed and checked on every
                                      access

  `title`                             User-editable or generated short
                                      title

  `description`                       AI-generated or user-written
                                      description

  `ocr_text`                          Extracted visible text, subject to
                                      retention settings

  `image_storage_key`                 Private storage reference, not a
                                      public URL

  `thumbnail_storage_key`             Optional thumbnail reference

  `source_app`                        Source label only when reliably
                                      available

  `source_url`                        Optional source URL if explicitly
                                      provided or safely available

  `category`                          Suggested or user-selected category

  `tags`                              Normalized tags or a related tag
                                      table

  `captured_at`                       Capture timestamp, if known

  `created_at`                        When ORBI created the record

  `processing_status`                 `pending`, `processing`, `ready`,
                                      or `failed`

  `processing_error_code`             Safe, non-sensitive error
                                      identifier

  `deleted_at`                        Optional soft-delete timestamp, if
                                      soft deletion is chosen
  -----------------------------------------------------------------------

### `memory_embeddings`

  Field             Purpose
  ----------------- ------------------------------------------
  `memory_id`       Reference to memory
  `user_id`         Ownership filter and defense in depth
  `embedding`       Vector generated by the configured model
  `model_name`      Model identifier
  `model_version`   Version used to create the vector
  `created_at`      Embedding creation time

The vector column's dimensions must match the chosen embedding model. Do
not assume every provider returns the same dimensions.

### `processing_jobs`

  Field               Purpose
  ------------------- ----------------------------------------
  `id`                Job identifier
  `memory_id`         Memory being processed
  `status`            Pending, running, completed, or failed
  `attempt_count`     Number of attempts
  `available_at`      Earliest retry time
  `last_error_code`   Safe error category
  `created_at`        Job creation time
  `updated_at`        Last state transition

### Data-model rules

-   Every memory belongs to exactly one user.
-   A user must never access another user's records by guessing an ID.
-   Use database indexes for owner, creation time, category, and job
    status.
-   Use a consistent UTC storage convention for timestamps.
-   Decide whether tags are a normalized table or a PostgreSQL
    array/JSON field based on actual query needs.
-   Hard-delete or anonymize all related data when account deletion is
    completed, according to the published retention policy.
-   Keep embeddings versioned so they can be regenerated after a model
    change.

------------------------------------------------------------------------

## 12. API outline

Example route design; endpoints are proposed and not yet implemented.

### Authentication

  -------------------------------------------------------------------------
  Method                  Route                     Purpose
  ----------------------- ------------------------- -----------------------
  `POST`                  `/api/v1/auth/register`   Create an account

  `POST`                  `/api/v1/auth/login`      Start a session

  `POST`                  `/api/v1/auth/refresh`    Refresh a session, if
                                                    using refresh tokens

  `POST`                  `/api/v1/auth/logout`     Revoke/end a session

  `GET`                   `/api/v1/users/me`        Current user profile
  -------------------------------------------------------------------------

### Memories

  ----------------------------------------------------------------------------------
  Method                  Route                              Purpose
  ----------------------- ---------------------------------- -----------------------
  `POST`                  `/api/v1/memories`                 Create a memory record
                                                             or initiate upload

  `GET`                   `/api/v1/memories`                 List memories with
                                                             filters and pagination

  `GET`                   `/api/v1/memories/:id`             Get one authorized
                                                             memory

  `PATCH`                 `/api/v1/memories/:id`             Update title, tags, or
                                                             category

  `DELETE`                `/api/v1/memories/:id`             Delete a memory and its
                                                             associated data

  `POST`                  `/api/v1/memories/:id/reprocess`   Retry analysis and
                                                             embedding generation

  `GET`                   `/api/v1/memories/:id/status`      Read processing status
  ----------------------------------------------------------------------------------

### Search

  -----------------------------------------------------------------------
  Method                  Route                   Purpose
  ----------------------- ----------------------- -----------------------
  `POST`                  `/api/v1/search`        Search by
                                                  natural-language query
                                                  and filters

  -----------------------------------------------------------------------

Example request:

``` json
{
  "query": "black running shoes I saw last week",
  "filters": {
    "dateFrom": "2026-10-25T00:00:00Z",
    "dateTo": "2026-11-01T23:59:59Z",
    "category": "shopping"
  },
  "limit": 20
}
```

Example response shape:

``` json
{
  "items": [
    {
      "id": "memory-uuid",
      "title": "Black running shoes",
      "description": "A pair of black running shoes on a product page.",
      "thumbnailUrl": "short-lived-authorized-url",
      "capturedAt": "2026-10-28T10:30:00Z",
      "category": "shopping",
      "score": 0.87
    }
  ],
  "nextCursor": null
}
```

The sample IDs, dates, scores, and URLs above are illustrative only.

### API design requirements

-   Validate every request body, path parameter, query parameter, and
    upload.
-   Derive `user_id` from the authenticated session, never from a
    client-controlled body field.
-   Use consistent error responses and appropriate HTTP status codes.
-   Apply pagination limits.
-   Add request IDs and structured logs.
-   Do not return raw provider errors, stack traces, internal storage
    keys, or private object URLs.
-   Make upload completion and processing retries idempotent where
    possible.

------------------------------------------------------------------------

## 13. AI and retrieval design

### 13.1 OCR

OCR turns visible text in an image into searchable text. It can help
retrieve screenshots of product names, web pages, code, diagrams with
labels, and text-heavy posts.

OCR output can be incomplete or incorrect. Store it as extracted
metadata, not as a guaranteed transcription.

### 13.2 Image understanding

An image-understanding model can produce a short factual description and
candidate tags. Example:

-   Description: "Black running shoes shown on a white product page."
-   Tags: `shoes`, `black`, `running`, `shopping`

The description should avoid inventing facts that are not visible.
Generated tags should be treated as suggestions.

### 13.3 Embeddings

An embedding maps text or supported image content into a numerical
vector. Similar concepts tend to have nearby vectors in the model's
vector space.

For example, the user may search "dark running sneakers" even when OCR
contains the phrase "black athletic shoes." Semantic retrieval can help
bridge this wording difference.

Use a model that supports the input modality needed by the design. If
only text embeddings are used, create searchable text from OCR and image
descriptions. If image embeddings are used, ensure the selected model
supports images and query matching in the intended way.

### 13.4 Hybrid retrieval

A practical first version can combine:

1.  Vector similarity over descriptions and OCR-derived text.
2.  PostgreSQL full-text search over OCR and titles.
3.  Structured filters for date, category, and tags.
4.  Optional reranking of a small candidate set.

Apply the user ownership condition inside the database query itself. Do
not retrieve global candidates and filter them in application memory
afterward.

### 13.5 AI cost and latency

-   Do not call an LLM for every ordinary list or gallery request.
-   Process images asynchronously.
-   Resize large images for analysis where quality permits, while
    preserving the original.
-   Cache or reuse processing results when safe and appropriate.
-   Track cost per processed memory and per search.
-   Apply user quotas and rate limits.
-   Offer a clear setting if images or extracted text are sent to an
    external AI provider.

------------------------------------------------------------------------

## 14. Mobile platform constraints

This is one of ORBI's most important implementation risks.

### Android

A floating control and screen capture may be possible using
platform-supported APIs, but they require careful design around
permissions, foreground-service rules, user consent, and Android-version
behavior.

-   A floating overlay may require a special permission and must be
    clearly controlled by the user.
-   Screen capture using Android's `MediaProjection` flow requires user
    consent and follows system restrictions.
-   Some secure or protected screens may prevent capture.
-   Background jobs are not guaranteed to execute immediately.
-   `WorkManager` is suitable for deferrable, retryable work, not a
    guarantee of instant processing.
-   If a persistent foreground service is necessary, its notification
    and behavior must comply with current Android policies.
-   Test on real devices and multiple Android versions; emulator
    behavior alone is insufficient.

**Do not design ORBI around silent, continuous, unrestricted
screenshots.** The product should capture only through a clearly
disclosed, user-initiated and platform-compliant flow.

### iOS

iOS does not provide a general-purpose equivalent to an Android floating
overlay that can freely sit over arbitrary apps and capture their
screens. Background execution and screen-capture APIs are also
constrained.

An iOS version may need a different experience, such as:

-   Share sheet / Share Extension
-   Import from Photos or Files
-   In-app capture of content the app itself displays
-   User-initiated shortcuts or other supported integrations

The product should share the same memory and search model while allowing
platform-specific capture experiences.

### Recommended strategy

Build and validate the core memory pipeline first. Treat capture as a
platform adapter rather than assuming identical capabilities across
operating systems.

------------------------------------------------------------------------

## 15. Privacy and security

ORBI may handle personal screenshots containing names, conversations,
financial information, health details, private documents, or
authentication screens. Privacy must be part of the architecture from
day one.

### Required safeguards

-   Explain what is captured, stored, analyzed, uploaded, and retained.
-   Capture only after a clear user action and supported consent flow.
-   Never attempt to bypass protected-screen restrictions.
-   Do not collect accessibility data or unrelated app content just to
    infer context.
-   Use TLS for network communication.
-   Keep cloud image objects private.
-   Use short-lived signed URLs where appropriate.
-   Encrypt sensitive local data where feasible and use
    platform-provided secure storage for credentials/tokens.
-   Never store raw passwords.
-   Validate ownership on every read, update, delete, download, and
    search request.
-   Avoid logging screenshot contents, OCR text, access tokens, signed
    URLs, or other sensitive payloads.
-   Provide deletion controls and document backup/retention behavior.
-   Use least-privilege access for workers and storage.
-   Keep API keys on the server, never in the mobile app.
-   Provide rate limits and upload size limits.
-   Establish a data retention policy for temporary images, failed jobs,
    and backups.
-   Review the terms and privacy requirements of each AI provider before
    sending user content.

### Local-first vs cloud processing

**Local-first option:** The original remains on the device and
processing happens locally where feasible. This improves user control
but may limit model capability and increase device resource use.

**Cloud-assisted option:** The image or a derived representation is
uploaded to private storage and sent to configured AI services. This can
improve model capability and cross-device search but adds cost, latency,
and privacy obligations.

The UI should clearly state which mode is active. Cloud processing
should not be silently enabled under ambiguous consent.

------------------------------------------------------------------------

## 16. Reliability and performance

### Reliability requirements

-   Save the original before starting optional AI analysis.
-   Use explicit states: `pending`, `processing`, `ready`, and `failed`.
-   Make worker jobs idempotent.
-   Retry transient failures with exponential backoff and a maximum
    attempt count.
-   Avoid infinite retries for unsupported files or permanent provider
    errors.
-   Let the user retry failed processing.
-   Handle offline saves and upload resumption.
-   Cancel or safely discard jobs after deletion.
-   Make deletion consistent across database rows, vectors, and image
    storage.
-   Keep a job status that the client can poll or refresh.

### Performance targets to validate

These are **initial product targets**, not measured results or
guarantees.

-   Local save confirmation: ideally under 1 second after the file has
    been safely written.
-   Search API response: aim for under 1--2 seconds for a typical
    indexed query under expected MVP load.
-   AI processing: asynchronous; completion time depends on
    model/provider, image size, network, and queue load.
-   Gallery browsing: load thumbnails rather than full-resolution
    images.
-   Large result sets: use pagination.
-   Search quality: evaluate with a manually labelled test set rather
    than relying only on subjective impressions.

Measure p50 and p95 latency, job failure rate, upload failure rate, cost
per image, and search relevance.

------------------------------------------------------------------------

## 17. MVP scope

The MVP should prove one complete loop:

**Save an image → process it → search for it by meaning → open the
original.**

### Must have

-   Sign-in or a clearly scoped local-only mode.
-   Image import or user-initiated capture.
-   Reliable local save.
-   Memory list and detail view.
-   Metadata record and processing status.
-   OCR and/or image description.
-   Embedding generation.
-   Semantic search.
-   Date and category filters.
-   Memory deletion.
-   Per-user authorization if cloud accounts are used.
-   Basic error handling and tests.

### Should have

-   Share-to-ORBI flow.
-   Retry failed processing.
-   Full-text + vector hybrid retrieval.
-   Editable title and tags.
-   Offline queue for uploads.
-   Search history only if the user wants it.

### Later

-   Android floating control, once platform feasibility is validated.
-   Cross-device sync.
-   Local AI processing options.
-   Advanced reranking.
-   Duplicate detection.
-   Smart collections.
-   Optional browser integration.
-   iOS-specific capture integrations.

Avoid implementing every feature before validating the central
save-and-find experience.

------------------------------------------------------------------------

## 18. Development roadmap

A suggested order for a solo developer working around 2--2.5 hours per
day. Actual duration depends on platform-specific capture complexity,
debugging, and model/provider setup.

### Phase 0 --- Requirements and platform spike

-   Confirm the first target platform.
-   Test supported capture options on a physical device.
-   Define local-first versus cloud-assisted processing.
-   Document privacy and deletion behavior.
-   Create architecture diagrams and a small threat model.

**Exit condition:** A proven capture/import path exists for the chosen
MVP platform.

### Phase 1 --- Foundation

-   Create repository structure.
-   Set up TypeScript conventions, linting, formatting, environment
    validation, and tests.
-   Create database schema and migrations.
-   Implement authentication or local-only mode.
-   Implement memory metadata CRUD and ownership checks.

**Exit condition:** A user can create, list, view, and delete a memory
record safely.

### Phase 2 --- Save and library

-   Implement image import.
-   Store image locally.
-   Generate thumbnails.
-   Build the memory grid and detail screen.
-   Handle invalid files and storage errors.
-   Add date sorting and basic filters.

**Exit condition:** Images persist reliably and are visible without AI.

### Phase 3 --- Processing pipeline

-   Add job table/queue and worker.
-   Integrate OCR.
-   Add optional image description and tag extraction.
-   Add embedding generation.
-   Add retry and status reporting.

**Exit condition:** A saved image becomes searchable metadata without
blocking the API request.

### Phase 4 --- Search

-   Add vector storage and similarity queries.
-   Add query embedding generation.
-   Add mandatory per-user filtering.
-   Add date/category filters and pagination.
-   Evaluate retrieval against a small labelled dataset.

**Exit condition:** Natural-language queries retrieve relevant saved
memories.

### Phase 5 --- Capture UX

-   Add the platform-specific capture adapter.
-   Implement permission education and consent.
-   Test behavior across devices and app states.
-   Provide a fallback path when capture is unavailable.

**Exit condition:** The save interaction works within documented
platform limits.

### Phase 6 --- Hardening

-   Add structured logs and monitoring.
-   Test account isolation and deletion.
-   Test offline and interrupted uploads.
-   Add rate limits and quotas.
-   Review external AI data handling.
-   Prepare deployment and backup/restore procedures.

**Exit condition:** The MVP is safe enough for a limited test group.

------------------------------------------------------------------------

## 19. Testing strategy

### Unit tests

-   Request validation.
-   Metadata normalization.
-   Date filter handling.
-   Search ranking helpers.
-   Processing-state transitions.
-   Retry policy.
-   Authorization helper functions.

### API integration tests

-   Register/login/logout.
-   Create and delete a memory.
-   Reject access to another user's memory.
-   Reject invalid file type or excessive file size.
-   Create a job exactly once where idempotency is required.
-   Search with empty and populated filters.
-   Retry failed processing.
-   Delete memory and confirm that search no longer returns it.

### Worker tests

-   OCR success and failure.
-   AI provider timeout.
-   Temporary network failure and retry.
-   Unsupported image.
-   Duplicate job delivery.
-   Memory deleted while a job is queued.
-   Embedding model version change.
-   Cleanup after failure.

### Mobile tests

-   Permission granted and denied.
-   Save while offline.
-   App restart after saving.
-   Image import cancellation.
-   Low storage.
-   Thumbnail loading.
-   Empty search results.
-   Long queries and date filters.
-   Capture unavailable on protected screens.
-   Screen rotation and app lifecycle changes.

### Security tests

-   Cross-user IDOR checks.
-   Expired/invalid token handling.
-   Upload abuse and rate limits.
-   Private storage access.
-   Secret leakage in logs and client bundles.
-   Account and memory deletion.
-   Signed URL expiry and authorization.

------------------------------------------------------------------------

## 20. Success metrics

Track product usefulness, not just the number of screens built.

### Core metrics

-   **Save success rate:** successful saves / attempted saves.
-   **Processing completion rate:** memories reaching `ready` / eligible
    memories.
-   **Search success rate:** queries where the user opens a relevant
    result.
-   **Time to retrieve:** time between starting a search and opening the
    intended memory.
-   **Search refinement rate:** how often a user needs to reformulate a
    query.
-   **p95 search latency:** slow-end search response time.
-   **Processing cost per memory:** average AI/storage cost per
    processed item.
-   **Deletion completion rate:** deleted items removed from all
    required stores.
-   **Crash-free sessions:** reliability of the mobile experience.

Start with a small, manually labelled test collection to measure whether
the correct item appears near the top. Avoid reporting invented
benchmarks or performance claims.

------------------------------------------------------------------------

## 21. Risks and mitigations

  -----------------------------------------------------------------------
  Risk                    Why it matters          Mitigation
  ----------------------- ----------------------- -----------------------
  OS limits screen        The expected one-tap    Validate capture early;
  capture                 experience may not work provide import/share
                          in every app            fallback

  AI gives incorrect      Bad metadata can hurt   Preserve original;
  descriptions            search                  label generated
                                                  metadata; allow edits

  Search misses a memory  Semantic retrieval is   Combine vectors,
                          not exact               OCR/full-text,
                                                  metadata, and filters

  AI/provider outage      New memories may not be Save first; queue jobs;
                          processed               retry later

  High inference cost     Usage may become        Quotas, resize for
                          expensive               analysis, measure cost,
                                                  choose models carefully

  Privacy concerns        Screenshots can contain Explicit controls,
                          sensitive content       minimal data
                                                  collection, encryption,
                                                  deletion

  Cross-user data         Memory contents are     Enforce ownership in
  exposure                private                 database queries and
                                                  API authorization

  Large image storage     Cost and load increase  Thumbnails, upload
                          over time               limits,
                                                  lifecycle/retention
                                                  policy

  Embedding model changes Existing vectors may    Store model/version and
                          become incompatible     support re-embedding

  Mobile background       Jobs may be delayed     Treat jobs as
  limits                                          eventually processed;
                                                  show status and retry

  Duplicate saves/jobs    Waste and confusing     Content hashes where
                          results                 appropriate and
                                                  idempotency keys
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 22. Example repository structure

One possible monorepo layout:

``` text
orbi/
├── apps/
│   └── mobile/                 # React Native / Expo client
├── services/
│   ├── api/                    # Node.js + TypeScript API
│   └── worker/                 # Async image-processing worker
├── packages/
│   ├── contracts/              # Shared request/response types
│   ├── validation/             # Shared schemas
│   └── config/                 # Shared lint/TypeScript config
├── database/
│   ├── migrations/
│   └── seeds/
├── docs/
│   ├── architecture.md
│   ├── requirements.md
│   ├── privacy-and-data-flow.md
│   └── decisions/
├── .env.example
├── .gitignore
└── README.md
```

This is a proposal, not a requirement. A simpler repository is perfectly
acceptable for the first iteration. Do not create separate packages
until there is a real need to share code.

------------------------------------------------------------------------

## 23. Local development direction

Exact commands depend on the final workspace setup. Once the repository
is initialized, document the real commands here rather than copying
placeholders into scripts.

### Prerequisites

-   Node.js LTS version compatible with the chosen Expo/backend
    dependencies.
-   pnpm or another selected package manager.
-   Android Studio and an Android emulator or a physical Android device
    for Android development.
-   PostgreSQL with the required vector extension if using cloud
    semantic search.
-   API credentials only for AI providers actually configured.
-   Git.

### Environment variables

Create `.env.example` with variable names and safe placeholder values,
for example:

``` dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/orbi
AUTH_SECRET=replace-with-a-long-random-secret
AI_PROVIDER=your-provider
AI_API_KEY=
IMAGE_STORAGE_MODE=local
```

These are illustrative names. Use a validated environment schema and
never commit real secrets. If a provider does not need a variable, do
not add it just because it appears in this example.

### Development checklist

-   [ ] Install dependencies.
-   [ ] Configure environment variables.
-   [ ] Start the database.
-   [ ] Apply migrations.
-   [ ] Start the API.
-   [ ] Start the worker.
-   [ ] Start the mobile app.
-   [ ] Test image import and local persistence.
-   [ ] Test one complete processing job.
-   [ ] Test a natural-language search.
-   [ ] Test deletion and user isolation.

Do not claim that the project can be run with a specific command until
the corresponding scripts and configuration exist.

------------------------------------------------------------------------

## 24. Open decisions

These decisions should be recorded in short architecture decision
records before implementation becomes difficult to change.

1.  **First platform:** Android only for the first MVP, or Android and
    iOS in parallel?
2.  **Capture path:** In-app capture, share/import, Android floating
    overlay, or a staged combination?
3.  **Storage model:** Local-only, cloud-assisted, or optional sync?
4.  **AI processing:** On-device, cloud provider, or hybrid?
5.  **Authentication:** Managed identity provider or custom
    authentication?
6.  **Search inputs:** OCR text + descriptions first, or a multimodal
    embedding model?
7.  **Vector storage:** PostgreSQL with `pgvector` or a separate vector
    service later?
8.  **Privacy defaults:** What is retained, for how long, and what
    leaves the device?
9.  **Source metadata:** Which information can be captured reliably
    without intrusive permissions?
10. **Monetization:** Free MVP, usage-limited plan, or another model?
    Decide only after cost and user value are measured.

### Recommended starting decisions

For a manageable first version:

-   Start with Android as the primary platform if the floating-control
    experience is central.
-   Implement import/share and local save before advanced overlay
    behavior.
-   Use PostgreSQL for structured metadata and `pgvector` for the
    initial cloud semantic search.
-   Run AI processing in a separate worker.
-   Keep the original image and generated metadata separate.
-   Make cloud processing explicit and optional until its privacy
    behavior is fully documented.
-   Build a small end-to-end MVP before adding advanced features.

These are starting recommendations, not final commitments.

------------------------------------------------------------------------

## 25. Product principle

ORBI is not simply a screenshot gallery with an AI search box. Its value
is the complete loop:

1.  **Notice:** The user sees something useful.
2.  **Save:** ORBI preserves it with minimal effort.
3.  **Understand:** The system extracts searchable information in the
    background.
4.  **Remember:** The user describes what they recall.
5.  **Retrieve:** ORBI returns relevant saved memories quickly.
6.  **Control:** The user can inspect, export, and delete their data.

The first milestone is not a perfect floating icon or the most advanced
AI model. It is a reliable end-to-end demonstration that a user can save
an image, leave it alone, and later find it using a description that
does not exactly match the original text.

**ORBI --- Your personal memory for the things you see.**
