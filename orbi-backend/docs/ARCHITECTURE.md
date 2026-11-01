# ORBI --- System Architecture

**Document type:** High-Level + Detailed Technical Architecture\
**Status:** Proposed baseline for MVP\
**Platform:** Android only\
**Primary goal:** Save screenshots quickly, process them asynchronously,
and let users find them later using text and semantic search.\
**Database decision:** MongoDB for backend/cloud data; a small local
database (SQLite) on Android for the device-side queue and local state.\
**Architecture principle:** Local-first where practical, adaptive
processing where useful, cloud processing only when permitted and
justified.

------------------------------------------------------------------------

## 1. Purpose

This document describes how ORBI's components should be designed, how
they communicate, where data is stored, how screenshot processing works,
and how the system balances:

-   Fast user experience
-   Device battery, memory, temperature, and storage
-   AI/API and infrastructure costs
-   Privacy and security
-   Reliability when the app is closed, the phone restarts, or the
    network is unavailable
-   A path from a low-cost MVP to a larger product

This is an architecture proposal, not a claim that every component has
already been implemented. Technology choices and thresholds must be
validated with prototypes and measurements on real Android devices.

## 2. Product summary

ORBI is a personal visual-memory app. A user saves a screenshot and
later searches for it with a natural-language query such as:

> "Find the screenshot of that restaurant I saved last week."

The intended flow is:

1.  The user explicitly saves a screenshot.
2.  The image is saved locally first, so the capture action does not
    wait for AI processing.
3.  A durable local job is created.
4.  A background worker processes the image in small, controlled steps.
5.  Text, metadata, and optionally an embedding or image description are
    stored.
6.  The user can search locally; cloud processing may be used as an
    optional fallback when the user permits it.
7.  The app shows the matching saved image and relevant context.

### 2.1 MVP boundaries

Included:

-   Android only
-   User-initiated screenshot saving
-   App-private local image storage
-   Persistent local processing queue
-   Local OCR and metadata extraction where feasible
-   Local keyword/date search
-   Semantic search as a staged capability
-   Optional adaptive cloud processing
-   MongoDB-backed cloud API data model if/when cloud features are
    enabled
-   Privacy, deletion, retry, and cost controls

Not assumed for the first release:

-   iOS support
-   Multi-device sync
-   Always-on cloud upload
-   Mandatory cloud AI for every screenshot
-   Kubernetes or microservices
-   Separate vector database before measurements justify it

------------------------------------------------------------------------

## 3. Core architectural decisions

  ------------------------------------------------------------------------
  Area              Proposed decision  Reason            Trade-off /
                                                         validation
  ----------------- ------------------ ----------------- -----------------
  Platform          Android first      Allows focused    Android versions
                                       validation of     and OEM
                                       capture,          background
                                       background        restrictions
                                       scheduling, and   still vary
                                       device            
                                       performance       

  Image storage     Local-first;       Fast save and     Local-only data
                    optional private   lower default     can be lost if
                    cloud copy only    cloud cost        the app/device is
                    when enabled                         lost; offer a
                                                         clear
                                                         export/backup
                                                         strategy

  Local database    SQLite             Suitable for      Vector search may
                                       small structured  require a
                                       device-side       compatible
                                       records, queue    library or a
                                       state, and        staged
                                       offline use       implementation

  Cloud database    MongoDB            Flexible metadata MongoDB does not
                                       documents and     automatically
                                       familiar document make every
                                       model             unstructured
                                                         workload easier;
                                                         indexes, document
                                                         shape, and
                                                         vector-search
                                                         deployment need
                                                         deliberate design

  Queue             Durable local job  Jobs can survive  WorkManager is
                    records plus       process death and not a real-time
                    Android            be rescheduled    execution
                    WorkManager        under constraints guarantee

  Processing        Adaptive           Protects user     Requires
                    local-first,       experience on     measurements,
                    cloud-eligible     weak devices      privacy controls,
                    fallback           while controlling and a clear
                                       cost              fallback policy

  Search            Local keyword/date A useful MVP can  Semantic search
                    search first;      ship before       quality depends
                    semantic retrieval vector            on model,
                    added and measured infrastructure    language, and
                                       becomes complex   content

  Backend           Modular monolith   Simple deployment Scale worker
                    API plus separate  and clear module  independently if
                    worker process     boundaries        queue depth or
                    when cloud work is                   processing time
                    enabled                              grows

  Cloud image       Private object     Keeps image blobs Adds
  storage           storage, optional  out of MongoDB    storage/egress
                                       and allows        cost; retention
                                       controlled        and deletion must
                                       delivery          be implemented

  Vector storage    Evaluate local     Avoids a second   Validate
                    embeddings/index   database          supported MongoDB
                    first; MongoDB     initially         deployment, cost,
                    Vector Search if                     filtering, and
                    cloud semantic                       recall before
                    search is required                   committing
                    and deployment                       
                    supports it                          
  ------------------------------------------------------------------------

### Important distinction: local database vs cloud database

MongoDB is proposed for the backend/cloud data store. It should not be
treated as a drop-in embedded database inside the Android app. The
Android app needs a local persistence layer, proposed as SQLite, for
image records, job state, and offline search data.

The app can run in a local-only mode without calling the cloud API for
every capture or search. Cloud components are optional enhancements, not
prerequisites for saving a screenshot.

------------------------------------------------------------------------

## 4. High-level architecture

``` mermaid
flowchart TB
    U[User] --> APP[ORBI Android App]
    APP --> CAP[Capture / Import Module]
    CAP --> FS[App-private Image Storage]
    CAP --> LDB[(Local SQLite Database)]
    LDB --> WM[WorkManager Scheduler]
    WM --> LW[Local Processing Worker]
    LW --> OCR[On-device OCR]
    LW --> META[Metadata Extraction]
    LW --> EMB[Local Embedding Model - if feasible]
    OCR --> LDB
    META --> LDB
    EMB --> LIDX[Local Search Index / Vector Index]
    LDB --> SEARCH[Local Search Service]
    LIDX --> SEARCH
    SEARCH --> APP

    LW -. permitted fallback only .-> API[Authenticated Backend API]
    API --> AUTH[Auth / Authorization]
    API --> MONGO[(MongoDB)]
    API --> OBJ[Private Object Storage]
    API --> Q[Cloud Job Queue / Job Collection]
    Q --> CW[Cloud Worker]
    CW --> VAI[Optional Cloud AI Provider]
    CW --> MONGO
    CW --> OBJ
    API --> SEARCHAPI[Cloud Search API]
    SEARCHAPI --> MONGO
```

Dashed/optional connections represent cloud processing, which must be
enabled by product policy and user consent. In the local-only mode, the
core save and search path stays on the device.

### 4.1 Component responsibilities

**ORBI Android App** - Presents capture, library, search, processing
status, settings, and deletion UI. - Saves the image before scheduling
expensive work. - Shows clear status such as Saved, Processing, Ready,
Retry needed, or Processing paused. - Avoids blocking the main/UI thread
with OCR, embedding generation, file hashing, or large image
transformations.

**Capture / Import Module** - Accepts only user-authorized
capture/import flows supported by Android. - Validates image type,
dimensions, and size. - Writes to a temporary file, then atomically
finalizes the saved file. - Creates a database record and processing
job. - Handles duplicate saves through a content hash or a safe
deduplication policy.

**Local SQLite Database** - Stores local image IDs, file references,
timestamps, metadata, OCR text, processing state, retry count, and local
preferences. - Acts as the source of truth for the device-side queue. -
Uses transactions when creating an image record and its initial job
state. - Does not store large image binaries unless a specific reason is
established.

**WorkManager + Local Worker** - Schedules persistent, deferrable work
with constraints such as network availability or charging when
appropriate. - Processes a limited amount of work per run. - Checks
cancellation, battery, thermal/available-resource signals where
accessible, and app settings. - Records step completion so the whole
pipeline does not have to restart after a failure. - Treats the OS
scheduler as best-effort scheduling, not an exact timer.

**Local Search Service** - Supports keyword, OCR text, date, and
metadata filters. - Adds semantic ranking only after an appropriate
embedding model and index are validated. - Keeps search responsive by
paging results and loading image thumbnails on demand.

**Backend API (optional cloud mode)** - Authenticates users and
authorizes every request against the authenticated account. - Applies
rate limits, upload limits, quotas, and validation. - Creates
short-lived upload/download URLs when needed instead of exposing bucket
credentials. - Does not trust user IDs supplied in request bodies as
authorization. - Does not contain provider API secrets in the mobile
app.

**MongoDB** - Stores cloud user/account records, image metadata,
processing state, and optional cloud search fields. - Stores references
to image objects, not large original image binaries by default. - Uses
indexes based on measured query patterns. - Enforces ownership checks at
the application layer and uses schema validation where useful.

**Private Object Storage** - Holds cloud copies only when the feature is
enabled and the user has authorized the upload. - Uses private
buckets/containers and short-lived signed URLs. - Supports lifecycle
policies, object deletion, and appropriate encryption settings.

**Cloud Worker / Optional AI Provider** - Processes only eligible
jobs. - Has limited concurrency, timeouts, retries, and per-user/per-day
cost limits. - Sends the minimum required data to an external AI
provider. - Uses provider configurations whose retention, training, and
data-processing terms have been reviewed.

------------------------------------------------------------------------

## 5. Capture and save flow

The capture path should prioritize a quick and reliable save, not
immediate AI completion.

1.  The user initiates a supported capture/save action.
2.  ORBI validates that the operation is allowed by Android and by the
    app's permissions.
3.  The image is written to an app-private temporary file.
4.  The app validates the resulting file and finalizes it atomically.
5.  A SQLite transaction creates the image record and a `PENDING`
    processing job.
6.  The app confirms that the screenshot was saved.
7.  WorkManager is asked to schedule the processing work.
8.  Processing occurs later, subject to resource and OS scheduling
    constraints.

### Failure rules

-   If image writing fails, do not create a successful image record.
-   If the image saves but job scheduling fails, the pending job remains
    in SQLite and a later reconciliation task schedules it.
-   If the app crashes after saving but before creating the job, startup
    reconciliation scans for records/files that need repair.
-   If the user deletes the image before processing begins, cancel or
    invalidate its pending job.
-   If the file is missing or corrupt, mark the record as an error and
    offer a clear recovery action.

### Atomicity and reconciliation

The filesystem and SQLite cannot be committed in one shared transaction.
Use a small state machine and startup reconciliation: - Write temporary
file. - Finalize image file. - Commit image record and job state. - On
startup, compare database records with files and repair
orphaned/unfinished states safely.

Do not delete unknown files automatically unless the app can prove they
are its own temporary/orphan files.

------------------------------------------------------------------------

## 6. Local processing pipeline

### 6.1 Proposed steps

Each image should have independently tracked processing steps.

1.  **Validate:** Check that the file can be decoded and its
    size/dimensions are within supported limits.
2.  **Normalize:** Produce a smaller processing copy when appropriate;
    preserve the original unless the user requests deletion or a
    retention policy says otherwise.
3.  **OCR:** Extract text using an on-device OCR option.
4.  **Metadata extraction:** Save capture time, import time, dimensions,
    format, and any reliable source metadata.
5.  **Optional image description:** Generate a concise description using
    a local vision model if it is supported and meets performance
    targets.
6.  **Optional embedding:** Generate a text or image embedding using a
    validated local model.
7.  **Index update:** Update keyword and/or vector search indexes.
8.  **Complete:** Mark the relevant steps complete and make the item
    searchable.

OCR, description, and embeddings are separate operations. A failure in
description generation should not erase successful OCR output or force
every completed step to run again.

### 6.2 Processing state model

Suggested image/job states:

-   `SAVED`
-   `PENDING`
-   `PROCESSING`
-   `PARTIALLY_PROCESSED`
-   `READY`
-   `RETRY_WAIT`
-   `PAUSED_RESOURCE`
-   `FAILED_PERMANENT`
-   `DELETE_PENDING`
-   `DELETED`

Keep a per-step state where useful, for example: - `ocr_status` -
`description_status` - `embedding_status` - `index_status`

A single overall status is useful for UI display, but per-step states
improve recovery and diagnostics.

### 6.3 Queue design

-   SQLite is the durable record of local work; do not rely only on an
    in-memory queue.
-   WorkManager schedules the worker and applies supported constraints.
-   Start with one local processing worker for heavy steps.
-   Use bounded batches and yield between images to reduce long-running
    work.
-   Apply exponential backoff with a maximum retry count for transient
    failures.
-   Do not retry permanent errors indefinitely.
-   Use idempotent step outputs and unique job IDs.
-   Add a queue reconciliation routine at app startup and after relevant
    failures.

A single worker is a safe MVP default, not a universal performance
optimum. Measure queue wait time and per-step processing time before
testing limited parallelism.

------------------------------------------------------------------------

## 7. Adaptive local-versus-cloud processing

The system should not guess based only on the phone model. It should use
measured processing performance, current device conditions, network
state, user preferences, privacy settings, and cost policy.

### 7.1 Decision principle

**The core save action must never wait for AI.** Save locally first,
then choose where processing should happen.

The routing policy can select: - Local processing now - Local processing
later - Optional cloud processing - A user-visible "processing paused"
state

Cloud fallback is not allowed if the user has disabled cloud processing
or has not given the required consent.

### 7.2 Signals to evaluate

  -----------------------------------------------------------------------
  Signal                  Why it matters          Possible response
  ----------------------- ----------------------- -----------------------
  Measured OCR/embedding  Directly shows real     Keep local if within
  duration on this device performance             target; otherwise defer
                                                  or consider permitted
                                                  fallback

  Queue depth and oldest  Detects that jobs are   Reduce optional work,
  job age                 accumulating            show status, or
                                                  consider cloud fallback
                                                  if enabled

  Available memory /      A local model may not   Use a smaller model,
  model load failure      fit reliably            skip optional
                                                  description, or offer
                                                  cloud processing

  Battery level and       Heavy work can reduce   Defer heavy steps at
  charging state          battery life            low battery; allow
                                                  lightweight work if
                                                  suitable

  Thermal state, when     Sustained compute can   Pause or reduce heavy
  available               cause heat/throttling   inference

  Network availability    Cloud work requires     Keep local queue
  and quality             upload and response     pending if offline; do
                          time                    not repeatedly fail
                                                  uploads

  User preference and     Privacy is a product    Always honor the
  consent                 requirement             setting; no silent
                                                  upload

  Cloud quota and cost    Prevents unexpectedly   Reject/defer cloud jobs
  budget                  high bills              once limits are reached

  Image size and          Large images may take   Resize a processing
  complexity              longer and use more     copy where quality
                          memory                  allows
  -----------------------------------------------------------------------

The app should not depend on a single device-spec heuristic. RAM/CPU
class can be an initial hint, but actual measured latency and failures
are more reliable.

### 7.3 Example routing policy

Illustrative only; numeric thresholds must be set after prototype
testing.

1.  Save the image locally immediately.
2.  Run lightweight OCR locally when the device is in an acceptable
    state.
3.  Record duration, outcome, and resource-related failures without
    collecting unnecessary personal content.
4.  If local processing is fast enough and stable, continue locally.
5.  If heavy optional steps are slow, defer them until charging/idle or
    use a smaller model.
6.  If local processing repeatedly fails or exceeds a measured service
    target, and the user has explicitly enabled cloud processing, queue
    an eligible cloud job.
7.  If cloud processing is disabled, keep the image saved and searchable
    with whatever local processing succeeded; show a non-blocking
    status.
8.  Apply per-account quotas, upload-size limits, timeouts, and a daily
    cloud cost cap.

Do not upload the image just because the network exists. Do not upload
merely because the phone is low-end. The decision must include user
consent, privacy, measured need, and cost controls.

### 7.4 Avoid a bad fallback loop

If cloud processing fails, the app must not repeatedly alternate between
local and cloud processing. Store a routing decision and attempt count
per step. Apply bounded retries and a cooldown before trying another
route.

### 7.5 UX expectations

-   Capture/save should feel immediate even if processing takes time.
-   Show simple states: `Saved`, `Processing`, `Ready to search`,
    `Paused to save battery`, or `Needs attention`.
-   Do not display misleading promises such as "ready instantly" when
    processing is asynchronous.
-   If a user chooses local-only mode, make it clear that advanced
    descriptions may take longer or remain unavailable on some devices.
-   Avoid frequent notifications; use in-app status unless the user opts
    into notifications.

------------------------------------------------------------------------

## 8. Performance strategy and load prediction

There is no perfectly reliable way to predict every user's future
workload before the app has observed it. The practical approach is to
estimate capacity, measure actual behavior, and react safely.

### 8.1 Before launch: benchmark devices

Build a small benchmark harness and test a representative range of
Android phones: - Low-memory / entry-level device - Typical mid-range
device - Higher-end device - Multiple supported Android versions -
Different image resolutions and OCR text densities

Measure: - Time to save a screenshot - OCR latency per image -
Description latency, if enabled - Embedding latency, if enabled - Peak
memory during inference - Battery impact over a repeatable test -
Thermal behavior during a sustained batch - Queue drain rate and error
rate - Search latency and relevance

Use the results to choose a supported model, image-size limits, and
default scheduling policy. Do not promise the same processing speed on
all devices.

### 8.2 After launch: privacy-conscious telemetry

If analytics are enabled and disclosed, collect operational measurements
such as: - App/OS version and coarse device capability category - Image
dimensions/size buckets, not image contents - Processing step duration -
Success/failure category - Queue length and oldest pending-job age -
Whether work was deferred for battery, network, or resource
constraints - Local vs cloud route outcome

Avoid sending screenshot pixels, raw OCR text, sensitive descriptions,
access tokens, or full file paths as performance telemetry. Provide
appropriate disclosure and controls.

### 8.3 Capacity estimate

A simple initial queue estimate is:

`estimated_queue_time ≈ pending_jobs × observed_average_processing_time`

This is approximate because images vary in complexity and processing can
be deferred by Android. Track percentiles (such as p50/p95), not just
averages.

Possible product-level targets should be selected after measurement.
Examples of metrics to set targets for: - Capture-to-saved latency -
Local OCR p50/p95 duration - Queue age under normal usage - Search
response time - Crash-free processing sessions - Battery impact during a
typical daily workload

Avoid inventing universal numeric targets before device tests. First
establish a baseline, then set thresholds that reflect real use.

------------------------------------------------------------------------

## 9. MongoDB data architecture

MongoDB is the chosen backend database for optional cloud functionality.
Flexible metadata is a valid reason to consider it, but it is not by
itself proof that MongoDB is better than every alternative.

### 9.1 Data placement

**Android local database (SQLite):** - Local image records and paths -
Processing jobs and per-step status - OCR text and local metadata -
Local search state and optional embedding references - User preferences
and cloud-consent settings

**MongoDB (cloud):** - Cloud account/profile reference - Cloud image
metadata and processing state - Object storage keys and file metadata -
Optional cloud descriptions and embeddings, if the selected deployment
supports the needed search feature - Usage quotas and audit/security
event references where appropriate

**Object storage (cloud, optional):** - Original images and thumbnails
only when cloud storage/backup is enabled

Avoid storing large screenshot binaries directly in MongoDB by default.
Store an object key and metadata instead.

### 9.2 Example MongoDB collections

#### `users`

Example fields: - `_id` - `authProviderId` or equivalent stable identity
reference - `createdAt` - `settings` - `cloudProcessingConsent` -
`cloudBackupEnabled` - `usagePlan` or quota reference

Do not store plaintext passwords. Prefer a vetted identity provider or a
carefully implemented authentication system.

#### `savedImages`

Example fields: - `_id` - `userId` - `createdAt` - `capturedAt`
(nullable if unknown) - `storageMode` (`local`, `cloud`, `hybrid`) -
`objectKey` (only for cloud-stored copies) - `mimeType` - `width` -
`height` - `fileSizeBytes` - `contentHash` (if needed; protect against
privacy leakage from globally comparable hashes) - `ocrText` (if cloud
storage of OCR text is allowed) - `description` (optional) -
`processingStatus` - `createdAt` - `updatedAt` - `deletedAt` (for
deletion workflow, where appropriate)

Avoid copying sensitive fields into analytics or logs. Consider whether
raw OCR text must be synced at all.

#### `processingJobs`

Example fields: - `_id` - `userId` - `imageId` - `jobType` - `status` -
`attemptCount` - `nextAttemptAt` - `lockedAt` - `workerId` -
`lastErrorCode` - `createdAt` - `updatedAt`

Use idempotency keys or unique constraints/indexes so retries do not
create duplicate results.

#### `usageEvents` (optional)

Store minimal usage counts and cost estimates, not image content.
Retention should be limited and documented.

### 9.3 Index strategy

Start with indexes based on actual query patterns. Candidates include: -
`savedImages`: `{ userId: 1, createdAt: -1 }` - `savedImages`:
`{ userId: 1, processingStatus: 1 }` - `processingJobs`:
`{ status: 1, nextAttemptAt: 1 }` - `processingJobs`:
`{ userId: 1, createdAt: -1 }` - A uniqueness rule for idempotency key,
scoped appropriately

If cloud vector search is enabled, configure vector indexes according to
the selected MongoDB deployment's current capabilities. Verify filtering
by `userId`, index dimensions, model versioning, operational cost, and
deletion behavior before relying on it. Do not assume every MongoDB
deployment offers the same vector-search features.

### 9.4 Tenant isolation

-   Derive the authenticated `userId` from the verified server-side
    identity.
-   Never authorize access based only on a `userId` supplied by the
    client.
-   Apply ownership filters to every image, job, search, update, and
    delete query.
-   Test cross-user access attempts explicitly.
-   Keep cloud object keys unguessable and bucket access private;
    unguessable keys alone are not authorization.

### 9.5 Embedding versioning

Store enough information to know which model generated an embedding: -
`embeddingModel` - `embeddingVersion` - `embeddingDimensions` -
`generatedAt`

If the model changes, old and new vectors may not be comparable. Plan a
controlled re-embedding strategy rather than silently mixing
incompatible vectors.

------------------------------------------------------------------------

## 10. Search architecture

### 10.1 MVP search sequence

1.  Search OCR text and descriptions using keyword search.
2.  Add date, source, and metadata filters.
3.  Add semantic search after a suitable embedding model and local/cloud
    index are validated.
4.  Consider hybrid ranking that combines lexical and semantic
    relevance.
5.  Evaluate search quality with a small, privacy-safe test set of
    representative queries.

### 10.2 Local search

The first release should not require a cloud round-trip for ordinary
local search. Store OCR text and metadata locally. Implement
keyword/date search first. Add a local vector index only when the chosen
Android library/model is proven stable and fast enough.

### 10.3 Cloud search

If cloud search is enabled: - Authenticate every request. - Filter all
candidate documents by the authenticated user's ownership. - Use
metadata/date filters where possible to reduce the candidate set. -
Avoid returning raw image bytes in search results. - Return minimal
result metadata and a short-lived authorized image URL only when
required. - Rate-limit expensive semantic searches.

### 10.4 Search quality

Measure: - Whether the correct item appears in the top results - Search
latency - Empty-result rate - Keyword vs semantic usefulness - False
matches between similar screenshots

A vector score is not a guarantee that a result is correct. Use ranking,
metadata filters, and user feedback where appropriate.

------------------------------------------------------------------------

## 11. Security and privacy

Screenshots can contain private messages, financial details, identity
documents, location, and other sensitive information. Privacy must be
designed into the data flow.

### 11.1 Local security

-   Store screenshots in app-private storage.
-   Do not request broad media/file permissions if a narrower supported
    Android API is sufficient.
-   Protect sensitive preferences and tokens using Android
    Keystore-backed mechanisms or a vetted secure-storage library.
-   Do not assume app-private storage alone is equivalent to end-to-end
    encryption.
-   Use an explicit export/backup flow.
-   Make deletion remove the image, metadata, embedding/index entry, and
    pending jobs.
-   Avoid logging OCR text, descriptions, tokens, or image paths.

### 11.2 Cloud security

-   Use HTTPS/TLS.
-   Keep provider keys and database credentials on the server, never in
    the APK.
-   Use short-lived access tokens and safe refresh-token handling if
    account login is implemented.
-   Apply request validation, rate limits, upload limits, and quotas.
-   Store images in private object storage with encryption settings
    enabled.
-   Use short-lived signed URLs and narrow object permissions.
-   Keep database and storage credentials least-privileged.
-   Configure backups and retention; test restoration.
-   Review external AI provider retention, training, and data-processing
    terms before sending user data.

### 11.3 Cloud consent

Cloud AI and cloud backup are distinct permissions: -
`cloudProcessingEnabled` - `cloudBackupEnabled`

A user may permit cloud AI processing without choosing persistent cloud
backup, if the flow can be designed safely. Explain what is uploaded,
why, which provider receives it, and how long the data is retained. If
cloud processing is disabled, never silently upload as a fallback.

### 11.4 Deletion workflow

When the user deletes an image: 1. Mark it `DELETE_PENDING` so it cannot
appear in search. 2. Cancel or invalidate pending jobs. 3. Delete local
image, metadata, OCR, descriptions, embeddings, and indexes. 4. If cloud
copies exist, delete the object and associated MongoDB records. 5.
Handle retries for failed remote deletion. 6. Confirm completion
honestly; if a remote deletion is pending, show that status.

Backups and provider retention need explicit retention rules; deleting
the live record may not instantly remove every backup copy.

------------------------------------------------------------------------

## 12. Android background-work and resource policy

### 12.1 Scheduling

Use Android WorkManager for persistent, deferrable work. Select
constraints based on the task: - OCR/lightweight metadata may run under
normal conditions if measured to be acceptable. - Large local vision
models or heavy embedding tasks may be deferred until charging or
idle. - Cloud uploads require network connectivity. - Long or expensive
tasks should be split into restartable steps.

WorkManager can delay work to respect OS constraints and battery
optimization. Do not use it as a promise that a job will start at an
exact time.

### 12.2 Resource policy

The worker should: - Avoid running heavy model inference on the main
thread. - Process one heavy image at a time initially. - Release image
bitmaps and model resources promptly. - Resize a processing copy when
quality allows. - Use bounded memory and avoid loading an entire backlog
into RAM. - Yield or stop safely between images. - Defer optional work
when the device is hot, low on battery, or under memory pressure where
signals are available. - Preserve successful partial results when a
later step fails.

### 12.3 User controls

Provide settings such as: - Process on device only - Allow cloud AI
processing - Allow cloud backup (separate option) - Pause background
processing - Heavy processing on charging only - Mobile data permission
for uploads - Delete all saved data / export data

Avoid overwhelming users with technical switches; group advanced
settings under an understandable "Privacy and processing" section.

------------------------------------------------------------------------

## 13. Cost architecture

### 13.1 Default cost-saving policy

-   Save locally first.
-   Do not upload every screenshot by default.
-   Run lightweight processing before expensive model calls.
-   Call cloud AI only when permitted and likely to improve results.
-   Do not run image description if OCR and metadata are sufficient for
    the user's likely query.
-   Deduplicate safely when useful.
-   Use size limits and compressed processing copies.
-   Set per-user and global cloud usage budgets.
-   Limit retries and prevent duplicate jobs.
-   Use a single backend deployment and MongoDB deployment appropriate
    to the expected MVP load.
-   Avoid a separate vector database until evidence shows it is
    necessary.

### 13.2 Cost drivers to monitor

-   Cloud AI calls and input image/token volume
-   Object storage capacity
-   Download/egress bandwidth
-   MongoDB storage, indexes, and compute
-   Worker compute time
-   Logging and monitoring volume
-   Backup retention
-   Failed/retried jobs

### 13.3 Cost guardrails

-   Maximum image upload size
-   Maximum cloud AI jobs per user per time period
-   Maximum retry count
-   Global daily/monthly budget alert
-   Per-user quota and rate limits
-   Queue depth alerts
-   Cloud processing kill switch
-   Ability to disable a costly model without disabling local
    save/search

Do not claim that the architecture is "free"; local compute has
battery/heat costs, and cloud services have variable charges. Measure
actual costs before choosing a paid tier.

------------------------------------------------------------------------

## 14. Reliability and recovery

-   Local image saving must be independent of AI success.
-   Every processing step must be retryable or have a clear
    permanent-failure state.
-   Use idempotent updates and unique job IDs.
-   Keep retry counts and machine-readable error categories.
-   Use exponential backoff with jitter for transient network/service
    failures.
-   Do not retry authentication, invalid image, or unsupported model
    errors forever.
-   Reconcile incomplete files and database records at startup.
-   If cloud is unavailable, local save and local search continue.
-   If the user revokes cloud consent, stop scheduling new cloud jobs
    and cancel eligible queued uploads where possible.
-   If a cloud job finishes after the user deletes the image, discard
    its result and complete the deletion workflow.

------------------------------------------------------------------------

## 15. Observability and performance metrics

Operational metrics should be privacy-conscious and useful for
decisions.

### 15.1 Metrics

-   Capture/save latency
-   OCR p50/p95 duration
-   Embedding p50/p95 duration
-   Optional description p50/p95 duration
-   Queue depth and oldest pending job age
-   Processing success/failure rates by step
-   Retry count and permanent failure count
-   Search p50/p95 latency
-   Cloud AI calls per active user
-   Approximate cost per processed image
-   Cloud upload failure rate
-   Crash-free processing sessions
-   Battery/thermal deferral counts where available

### 15.2 Privacy rules for telemetry

Do not send screenshots, raw OCR text, descriptions, authentication
tokens, or sensitive file paths in analytics. Use coarse device
categories and processing metrics. Disclose telemetry appropriately and
provide controls where required.

### 15.3 Decision thresholds

Do not hardcode arbitrary "slow device" cutoffs before testing.
Benchmark representative Android devices, establish p50/p95 baselines,
then define thresholds for: - Continue local processing - Defer heavy
local work - Use a smaller local model - Offer cloud processing, if
consented - Show a processing-delay message

------------------------------------------------------------------------

## 16. API architecture (optional cloud mode)

Cloud APIs are not required for local-only save and search. When cloud
capabilities are enabled, suggested endpoints include:

  -----------------------------------------------------------------------------
  Method                  Endpoint                      Purpose
  ----------------------- ----------------------------- -----------------------
  `POST`                  `/v1/auth/session`            Start or exchange an
                                                        authenticated session,
                                                        depending on auth
                                                        design

  `GET`                   `/v1/me`                      Get the authenticated
                                                        account

  `POST`                  `/v1/images`                  Create cloud metadata
                                                        record or initiate an
                                                        upload

  `POST`                  `/v1/images/:id/upload-url`   Request a short-lived
                                                        authorized upload URL

  `GET`                   `/v1/images`                  List cloud-backed saved
                                                        items with pagination

  `GET`                   `/v1/images/:id`              Get authorized metadata
                                                        for one item

  `DELETE`                `/v1/images/:id`              Begin deletion of
                                                        cloud-backed data

  `POST`                  `/v1/search`                  Search cloud-backed
                                                        metadata/embeddings

  `GET`                   `/v1/jobs/:id`                Check processing status

  `GET`                   `/v1/usage`                   View quota/usage if
                                                        cloud processing is
                                                        enabled
  -----------------------------------------------------------------------------

API design rules: - Use pagination. - Validate request bodies and query
parameters. - Derive user identity from authentication. - Apply
ownership filters to all operations. - Never expose permanent
object-storage credentials. - Return stable error codes without leaking
internal details. - Apply quotas to upload, processing, and
semantic-search endpoints.

Exact authentication provider, hosting provider, and endpoint contract
remain implementation decisions.

------------------------------------------------------------------------

## 17. Testing strategy

### 17.1 Unit tests

-   Metadata extraction
-   Queue state transitions
-   Retry/backoff policy
-   Idempotency behavior
-   Local/cloud routing policy
-   Deletion and index cleanup
-   MongoDB ownership filters and schema validation

### 17.2 Integration tests

-   Save image → SQLite record → queue → OCR → searchable record
-   App/process restart with pending work
-   Worker failure after OCR but before embedding
-   Duplicate job delivery
-   Missing/corrupt image file
-   Cloud upload timeout and retry
-   Cloud consent disabled while jobs are queued
-   User deletion while cloud processing is in progress

### 17.3 Security tests

-   User A cannot fetch User B's image, job, metadata, or search result
-   Expired or invalid signed URL is rejected
-   No provider API keys in the Android package
-   No sensitive content in logs
-   Cloud processing cannot occur without the configured consent
-   Deletion removes local and cloud searchability
-   Upload limits and rate limits work

### 17.4 Performance tests

-   Low-end, mid-range, and high-end Android devices
-   Small, typical, and large screenshots
-   Sustained batch processing
-   Low battery, network unavailable, and thermal throttling scenarios
-   Large local library search latency
-   Queue recovery after force-stop/restart according to Android's
    supported scheduling behavior

------------------------------------------------------------------------

## 18. Implementation phases

### Phase 0 --- Validate risky assumptions

-   Confirm Android capture method and platform restrictions.
-   Prototype local file saving and WorkManager.
-   Benchmark OCR on a low-end, mid-range, and higher-end device.
-   Test local embedding options separately from OCR.
-   Verify whether local semantic search meets product quality needs.

### Phase 1 --- Reliable local core

-   App-private screenshot storage
-   SQLite image records
-   Durable job state
-   OCR and basic metadata
-   Retry/reconciliation
-   Keyword/date search
-   Delete/export controls

### Phase 2 --- Local semantic search

-   Select a suitable embedding model
-   Benchmark latency, RAM, storage, and battery
-   Add a local index if the platform/library is stable
-   Evaluate search relevance on representative examples

### Phase 3 --- Adaptive processing policy

-   Add local timing and queue metrics
-   Add resource-aware deferral and model selection
-   Define thresholds from test data
-   Add explicit cloud-processing preference and consent flow

### Phase 4 --- Optional cloud capabilities

-   Authenticated modular-monolith API
-   MongoDB metadata collections and indexes
-   Private object storage if backup is required
-   Cloud job worker and bounded retries
-   Optional cloud AI fallback
-   Per-user/global quotas, budgets, and monitoring

### Phase 5 --- Hardening

-   Security and deletion audits
-   Device compatibility testing
-   Backup/restore validation where cloud data exists
-   Cost and queue load testing
-   Release checklist and privacy documentation

------------------------------------------------------------------------

## 19. Risks and mitigations

  -----------------------------------------------------------------------
  Risk                    Impact                  Mitigation
  ----------------------- ----------------------- -----------------------
  Local AI is slow on     Users wait for search   Save immediately, use
  low-end phones          readiness               lightweight steps,
                                                  defer heavy work, allow
                                                  consented cloud
                                                  fallback

  Background jobs are     Queue backlog grows     Use WorkManager
  delayed by Android                              correctly, expose
                                                  status, measure queue
                                                  age, reconcile pending
                                                  work

  Cloud fallback          Unexpected bill         Conditional calls,
  increases cost                                  quotas, budgets,
                                                  image-size limits,
                                                  retries capped

  Sensitive screenshot is Privacy incident        Separate
  uploaded unexpectedly                           cloud-processing and
                                                  backup settings,
                                                  explicit consent,
                                                  auditable routing
                                                  policy

  MongoDB vector features Search architecture     Validate deployment
  unavailable in selected changes                 capability early; keep
  deployment                                      vector layer behind an
                                                  interface

  Embedding model changes Old vectors become      Version embeddings and
                          incompatible            plan re-indexing

  Phone loss removes      User loses memories     Explain trade-off and
  local-only data                                 provide optional
                                                  export/backup

  Deletion leaves         Privacy and storage     Deletion workflow,
  orphaned embeddings or  issue                   retries,
  cloud objects                                   reconciliation,
                                                  periodic orphan checks

  Device overheating or   Poor user experience    Resource constraints,
  battery drain                                   limited concurrency,
                                                  defer heavy processing

  AI description is       Bad search results      Treat generated
  inaccurate                                      descriptions as hints,
                                                  preserve OCR/metadata,
                                                  evaluate search quality
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 20. Open decisions to resolve before implementation

1.  **Capture mechanism:** Exact Android-supported
    capture/floating-control approach and its permission/UX constraints.
2.  **Minimum Android version:** Determines available APIs and
    compatibility strategy.
3.  **Local OCR library/model:** Validate offline availability, package
    size, language support, and accuracy.
4.  **Local embedding model:** Validate model size, latency, memory, and
    language support.
5.  **Local vector index:** Choose only after the embedding prototype
    succeeds.
6.  **Cloud AI provider:** Optional; compare retention, data processing
    terms, cost, latency, and image support.
7.  **Authentication:** Only required when cloud account features are
    introduced.
8.  **Cloud backup:** Explicitly optional and separate from cloud AI
    processing.
9.  **MongoDB deployment:** Choose only when cloud functionality is
    needed; confirm vector-search capabilities and cost.
10. **Performance targets:** Set after measurements on representative
    devices.
11. **Data retention and export:** Decide how long originals and derived
    data are kept and how users can export/delete them.
12. **Telemetry:** Decide what minimal operational metrics to collect
    and how users are informed.

------------------------------------------------------------------------

## 21. Definition of done for the architecture prototype

The first technical prototype should demonstrate:

-   A screenshot can be saved locally without waiting for OCR or AI.
-   A persistent local job is created.
-   The worker processes images without blocking the UI.
-   App restart does not silently lose pending jobs.
-   One failed image does not block the rest of the queue.
-   OCR and metadata become searchable.
-   Local search works without a network connection.
-   Processing time, peak memory where measurable, queue age, and
    failures are recorded locally for testing.
-   Cloud processing is never invoked when disabled.
-   The app handles delete/retry states correctly.
-   Performance is benchmarked on representative Android devices before
    promising a universal processing speed.

## 22. Final recommendation

Build ORBI as an **Android local-first app with a durable SQLite-backed
queue and WorkManager-managed processing**. Save screenshots
immediately, then process them in independent, restartable steps. Start
with local OCR and keyword/date search; validate embeddings and image
understanding with real-device benchmarks.

Use **MongoDB for optional cloud-side metadata and jobs**, not as the
Android embedded database. Keep original cloud images in private object
storage if cloud backup is introduced. Add adaptive cloud processing
only after measuring local performance and only when the user has
explicitly allowed it.

The key product rule is:

> **Never make screenshot saving depend on AI completion. Never silently
> upload private screenshots. Decide local vs cloud processing using
> measured performance, device conditions, user consent, and cost
> limits.**

This keeps the MVP simple while preserving a path to a more capable
system when real usage justifies the added complexity.
