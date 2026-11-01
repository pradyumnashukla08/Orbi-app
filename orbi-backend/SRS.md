# ORBI --- Software Requirements Specification (SRS)

**Document status:** Draft for product and architecture review\
**Product:** ORBI --- Personal Visual Memory\
**Version:** 0.1\
**Date:** 1 November 2026\
**Audience:** Product owner, mobile developer, backend developer, AI/ML
engineer, QA, security reviewer\
**Scope:** Initial mobile-first MVP with a staged path to Android
capture features and optional cloud processing

> **Purpose of this document:** Define what ORBI must do, how its
> behavior should be validated, what constraints shape the design, and
> which decisions remain open. This is a requirements document, not
> proof that the described features have already been implemented.

------------------------------------------------------------------------

## Document control

  -----------------------------------------------------------------------
  Field                               Value
  ----------------------------------- -----------------------------------
  Product name                        ORBI

  Document type                       Software Requirements Specification

  Version                             0.1 --- initial draft

  Status                              Proposed / review required

  Primary user                        Individual saving personal visual
                                      memories

  Initial platform recommendation     Android-first, with cross-platform
                                      UI where practical

  Backend option                      Node.js + TypeScript

  Data option                         PostgreSQL + `pgvector`

  AI approach                         Asynchronous OCR, image
                                      description, and embeddings

  Main product loop                   Save → process → search → retrieve
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## Contents

1.  Purpose and scope
2.  Product vision and objectives
3.  Definitions and terminology
4.  Stakeholders and user classes
5.  Assumptions and dependencies
6.  Scope boundaries
7.  User experience and workflows
8.  Functional requirements
9.  Detailed screen-capture requirements
10. AI-processing requirements
11. Search and retrieval requirements
12. Data requirements
13. API and integration requirements
14. Non-functional requirements
15. Privacy, security, and compliance requirements
16. Error handling and recovery
17. Observability and operational requirements
18. Accessibility and usability
19. Testing and acceptance criteria
20. Release and deployment requirements
21. Risks and mitigations
22. Requirements traceability
23. Open questions and decisions
24. Recommended implementation sequence
25. Definition of done

------------------------------------------------------------------------

## 1. Purpose and scope

### 1.1 Purpose

This SRS defines the functional and non-functional requirements for
ORBI, a personal visual-memory application. It gives the project a
shared definition of expected behavior before significant implementation
work begins.

The document should be used to:

-   Decide what belongs in the MVP.
-   Separate user-visible requirements from implementation choices.
-   Design the database, API, mobile UI, AI pipeline, and background
    jobs.
-   Build test cases from explicit acceptance criteria.
-   Identify platform limitations before relying on unsupported
    behavior.
-   Make privacy and deletion part of the design rather than adding them
    later.
-   Track unresolved decisions without pretending they have been
    settled.

### 1.2 Product summary

ORBI lets a user save an image or screen content they want to revisit
later. ORBI stores the original image where supported, associates it
with metadata, and may process it using OCR, image-understanding models,
and embeddings. The user can later search in natural language, apply
filters, and retrieve likely matching memories.

Example:

1.  The user sees a pair of black shoes.
2.  The user saves the image using a supported user-initiated flow.
3.  ORBI stores the image and creates a memory record.
4.  A background worker extracts text, description, and an embedding.
5.  Later, the user searches: "Find the black shoes I saw last week."
6.  ORBI returns relevant saved memories with thumbnails and available
    details.

### 1.3 Scope of this SRS

This SRS covers:

-   Account and session behavior where cloud accounts are enabled.
-   Image import and user-initiated capture.
-   Local image persistence and optional cloud storage.
-   Memory metadata and library management.
-   Asynchronous AI processing.
-   Natural-language semantic search and filters.
-   Privacy, authorization, deletion, reliability, testing, and
    deployment.
-   Platform-specific constraints for Android and iOS.

It does not guarantee that all platform features are technically
possible on every device. The implementation must follow the relevant
operating-system APIs and policies.

------------------------------------------------------------------------

## 2. Product vision and objectives

### 2.1 Vision

**ORBI is a searchable memory for things a person sees on their
device.**

The user should not need to remember the exact app, filename, wording,
or date where an item appeared. They should be able to describe the item
and find it among their saved memories.

### 2.2 Primary objectives

-   O1: Make saving an image quick and reliable.
-   O2: Preserve the original image independently of AI processing.
-   O3: Make saved memories discoverable through natural language.
-   O4: Support date, category, and tag filters.
-   O5: Keep user data private and correctly isolated.
-   O6: Recover from temporary network, AI-provider, and background-job
    failures.
-   O7: Build an architecture that can support future capture and sync
    features without rewriting the core memory model.

### 2.3 Product principles

1.  User-initiated saving is the default.
2.  Original content is the source of truth; generated metadata is
    supplementary.
3.  AI work must not block the initial save confirmation unnecessarily.
4.  A failed analysis job must not silently erase a saved image.
5.  Search returns ranked candidates, not certainty.
6.  Users should understand what is local, what is uploaded, and what is
    sent to an AI provider.
7.  Android and iOS may have different capture experiences.
8.  The system should prefer simple, testable components over premature
    distributed architecture.

------------------------------------------------------------------------

## 3. Definitions and terminology

  -----------------------------------------------------------------------
  Term                                Definition
  ----------------------------------- -----------------------------------
  Memory                              A saved item in ORBI, including an
                                      original image or supported file
                                      and its metadata

  Capture                             A user-initiated process that
                                      obtains screen content using
                                      supported platform APIs

  Import                              Adding an existing image/file
                                      through a picker, gallery, or share
                                      flow

  OCR                                 Optical Character Recognition;
                                      extracting visible text from an
                                      image

  Embedding                           A numerical vector representing
                                      text or supported visual input for
                                      similarity retrieval

  Semantic search                     Searching by meaning rather than
                                      requiring exact word matches

  Hybrid search                       Combining semantic similarity with
                                      full-text and structured filtering

  Worker                              A background process that performs
                                      work outside the API request
                                      lifecycle

  Job                                 A tracked unit of background work,
                                      such as OCR or embedding generation

  Metadata                            Data associated with a memory, such
                                      as date, title, tags, source, and
                                      processing state

  Local-first                         The application prioritizes local
                                      persistence and can retain useful
                                      data without requiring immediate
                                      cloud sync

  Signed URL                          A temporary URL granting limited
                                      access to a private stored object

  RPO                                 Recovery Point Objective:
                                      acceptable amount of data loss
                                      after a failure

  RTO                                 Recovery Time Objective: target
                                      time to restore a service

  MVP                                 Minimum Viable Product: the
                                      smallest end-to-end version that
                                      tests the core product value
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 4. Stakeholders and user classes

### 4.1 Primary user

An individual who sees content they want to revisit but cannot act on
immediately.

Typical needs:

-   Save with minimal effort.
-   Search later using imperfect recollection.
-   Filter memories by date or category.
-   Open the original image.
-   Delete private or unwanted content.

### 4.2 Product owner / developer

Responsible for requirements, architecture, implementation choices,
deployment, and prioritization.

### 4.3 System administrator

For a small MVP, operational administration may be handled by the
developer. Administrative tools must not grant unnecessary access to
private image contents.

### 4.4 AI and infrastructure providers

External services may process image content, text, or embeddings. Their
use must be documented, configured, and governed by the product's
privacy settings and provider terms.

------------------------------------------------------------------------

## 5. Assumptions and dependencies

The following are working assumptions, not confirmed facts:

-   A mobile application is the primary interface.
-   Android is the recommended first target if a floating control is
    central to the product.
-   React Native and Expo may be used for shared mobile UI, but some
    capture functionality may require native Android code.
-   A backend is needed for cloud accounts, cross-device sync, and
    cloud-based AI processing.
-   PostgreSQL can hold structured metadata; `pgvector` is a candidate
    for vector search.
-   AI processing can be provided by an external service or a local
    model.
-   Network access may be absent when the user saves a memory.
-   Operating systems may block capture in protected screens or restrict
    background work.
-   Source-app metadata may be unavailable or unreliable.
-   The final AI provider, embedding model, and vector dimensions have
    not yet been selected.

### Dependencies

-   Android/iOS platform APIs and store policies.
-   Mobile permissions and background execution rules.
-   Database and storage availability.
-   AI/OCR provider availability if cloud processing is selected.
-   Network connectivity for remote sync and cloud inference.
-   Provider pricing, limits, and data-retention terms.

------------------------------------------------------------------------

## 6. Scope boundaries

### 6.1 MVP in scope

-   Registration/login if cloud accounts are enabled.
-   Importing or saving a user-selected image.
-   Reliable local persistence.
-   Memory gallery and detail screen.
-   Memory metadata and processing status.
-   Asynchronous OCR and/or image-description processing.
-   Embedding generation.
-   Natural-language search.
-   Date and category filters.
-   View, update user-editable metadata, and delete memories.
-   Basic authorization, error handling, logging, and tests.

### 6.2 Staged features

-   Android floating overlay.
-   Android screen capture through supported consent-based APIs.
-   Background upload queue and resumable sync.
-   Cross-device access.
-   Hybrid search and advanced ranking.
-   Local AI models.
-   Advanced duplicate detection and smart collections.

### 6.3 Explicitly out of scope

-   Silent, continuous, or unrestricted screen recording.
-   Bypassing protected-screen or operating-system restrictions.
-   Capturing other people's private content without authorization.
-   Automatic purchases or other consequential actions.
-   Public social feeds and public sharing by default.
-   Training a new foundation model on personal screenshots.
-   Guaranteeing identical screen-capture functionality on Android and
    iOS.

------------------------------------------------------------------------

## 7. User experience and workflows

### 7.1 Onboarding workflow

1.  The user opens ORBI.
2.  ORBI explains its purpose and data handling in plain language.
3.  The user registers/signs in, or starts a local-only mode if
    implemented.
4.  ORBI requests only the permissions required for a feature the user
    activates.
5.  The user reaches the memory library.

**Acceptance criteria**

-   The app must not request unrelated permissions during onboarding.
-   Permission denial must not crash the app.
-   The user must be able to understand whether cloud processing is
    enabled.
-   Permission explanations must precede sensitive permission prompts
    where appropriate.

### 7.2 Save workflow

1.  User chooses an image or invokes a supported capture action.
2.  ORBI validates the resulting file.
3.  The original is written to local storage where supported.
4.  A memory record is created.
5.  The UI confirms the save only after local persistence succeeds.
6.  Cloud upload and AI processing are queued if enabled.
7.  The memory appears in the library with an accurate status.

**Acceptance criteria**

-   If AI processing fails, the saved image remains accessible.
-   If the device is offline, local save still works in local-first
    mode.
-   If storage fails, ORBI shows an error and does not falsely claim
    success.
-   The user can distinguish a locally saved item from one synced to the
    cloud.

### 7.3 Processing workflow

1.  A job is queued for an eligible memory.
2.  A worker claims the job.
3.  The worker checks that the memory exists and has not been deleted.
4.  OCR, image description, and embedding tasks run according to
    configuration.
5.  Results are stored with model/version metadata where relevant.
6.  The memory transitions to `ready`, or to `failed` with a safe error
    code.
7.  Transient failures may be retried.

**Acceptance criteria**

-   A worker crash must not permanently leave a job in `processing`
    without recovery.
-   Reprocessing must not create duplicate memory records.
-   The UI must not expose internal stack traces or provider
    credentials.

### 7.4 Search workflow

1.  User enters a natural-language query.
2.  User optionally chooses filters.
3.  ORBI validates the query and filters.
4.  The search service generates a query embedding if needed.
5.  Candidate memories are retrieved only from the current user's
    accessible data.
6.  Structured filters and ranking are applied.
7.  The app displays results with thumbnails, saved dates, and available
    metadata.
8.  The user opens a result or refines the query.

**Acceptance criteria**

-   An empty query must have a documented behavior: reject it or display
    the recent library; do not accidentally run an unbounded vector
    query.
-   Date filters must use a documented timezone convention.
-   Search results must not include another user's memories.
-   No-match results must provide a useful empty state.

### 7.5 Delete workflow

1.  User requests deletion.
2.  ORBI identifies the scope: local copy, cloud copy, or both.
3.  ORBI prevents new processing for the item.
4.  The system removes or schedules deletion of the memory, image
    objects, extracted text, tags, and embeddings as defined by policy.
5.  Search stops returning the deleted item.
6.  The user receives a truthful completion or pending-deletion status.

**Acceptance criteria**

-   Deletion must be idempotent.
-   A delayed worker must not recreate deleted metadata.
-   Backup retention and deletion timing must be documented.
-   If deletion is asynchronous, the UI must say so.

------------------------------------------------------------------------

## 8. Functional requirements

Priority definitions:

-   **P0 --- Required for MVP:** Without it, the core save-and-search
    loop is incomplete or unsafe.
-   **P1 --- Important:** Should be delivered soon after the core loop.
-   **P2 --- Later:** Useful enhancement, not a blocker for the first
    MVP.

### 8.1 Account and session management

**FR-AUTH-001 (P0):** If cloud accounts are enabled, the system shall
allow a user to register with the configured identity method.

**FR-AUTH-002 (P0):** The system shall authenticate users before
returning private cloud memories.

**FR-AUTH-003 (P0):** The system shall authorize each memory operation
against the authenticated user.

**FR-AUTH-004 (P0):** The system shall support session termination and a
documented token/session expiration strategy.

**FR-AUTH-005 (P1):** The system should support account recovery
appropriate to the chosen identity method.

**FR-AUTH-006 (P1):** The system should allow a user to request account
deletion and explain the effects on stored data.

**FR-AUTH-007 (P0):** Secrets and passwords shall not be stored in
plaintext.

**FR-AUTH-008 (P0):** The API shall apply rate limits to authentication
endpoints.

### 8.2 Capture, import, and local persistence

**FR-CAP-001 (P0):** The system shall allow a user to import a supported
image using an available platform picker or share flow.

**FR-CAP-002 (P0):** The system shall validate file type, size, and
readability before processing.

**FR-CAP-003 (P0):** The system shall persist the original image locally
before reporting a successful local save, where local storage is the
selected mode.

**FR-CAP-004 (P0):** The system shall create a memory metadata record
for each successfully saved item.

**FR-CAP-005 (P0):** The system shall record a creation timestamp and,
when available, a capture timestamp.

**FR-CAP-006 (P1):** The system should generate a thumbnail to reduce
gallery loading cost.

**FR-CAP-007 (P1):** The system should detect obvious duplicate imports
using a content hash or another documented strategy.

**FR-CAP-008 (P0):** The system shall handle permission denial,
cancellation, low storage, and invalid image errors without falsely
confirming success.

**FR-CAP-009 (P1):** The system should queue cloud upload when offline
and resume when connectivity returns, if cloud sync is enabled.

**FR-CAP-010 (P1):** The system should provide a share-to-ORBI entry
point where the operating system supports it.

### 8.3 Floating control and screen capture

**FR-SCREEN-001 (P1, feasibility-gated):** On supported Android
versions, the system may provide a user-controlled floating shortcut to
initiate a save action.

**FR-SCREEN-002 (P1, feasibility-gated):** Screen capture shall use
supported platform APIs and required consent flows.

**FR-SCREEN-003 (P0):** The UI shall clearly indicate when capture is
unavailable, denied, cancelled, or completed.

**FR-SCREEN-004 (P0):** The system shall not attempt to bypass
secure-window restrictions or capture protections.

**FR-SCREEN-005 (P0):** The user shall be able to disable the floating
control and revoke related permissions through the app or system
settings.

**FR-SCREEN-006 (P1):** The app should provide an import/share fallback
when capture is not supported.

**FR-SCREEN-007 (P0):** The system shall not describe a capture as
successful until the image is safely persisted.

**FR-SCREEN-008 (P1):** The implementation shall be tested on physical
devices and multiple supported OS versions before release.

**FR-SCREEN-009 (P0):** The product shall document that iOS may require
a different capture flow, such as a share extension or import flow.

### 8.4 Memory library and metadata

**FR-MEM-001 (P0):** The system shall list the authenticated user's
saved memories.

**FR-MEM-002 (P0):** The system shall display the original image or a
valid local/cloud representation of it.

**FR-MEM-003 (P0):** The system shall expose a processing state for each
memory when AI processing is enabled.

**FR-MEM-004 (P1):** The system should allow the user to edit a title,
category, or tags.

**FR-MEM-005 (P0):** The system shall support sorting by saved date.

**FR-MEM-006 (P0):** The system shall support deleting a memory.

**FR-MEM-007 (P1):** The system should support filtering by category,
date range, and processing status.

**FR-MEM-008 (P0):** The system shall not expose private storage keys or
permanent public image URLs in the client response.

**FR-MEM-009 (P1):** The system should support cursor-based pagination
for large libraries.

### 8.5 AI processing and jobs

**FR-AI-001 (P0):** When AI processing is enabled, saving a memory shall
enqueue processing asynchronously rather than requiring all AI work to
finish in the save request.

**FR-AI-002 (P0):** The worker shall verify that the memory exists and
is eligible before processing it.

**FR-AI-003 (P0):** The system shall support OCR, image description, or
a documented subset sufficient for the initial search design.

**FR-AI-004 (P0):** The system shall generate embeddings using a
configured model if semantic search is enabled.

**FR-AI-005 (P0):** The system shall store the embedding model
identifier and version or equivalent compatibility metadata.

**FR-AI-006 (P0):** The system shall track job attempts and terminal
status.

**FR-AI-007 (P0):** The system shall retry transient failures using
bounded retries and backoff.

**FR-AI-008 (P0):** The system shall stop or safely discard work for
deleted memories.

**FR-AI-009 (P0):** AI output shall be treated as generated metadata and
shall not overwrite the original image.

**FR-AI-010 (P1):** The system should allow a user to retry a failed
processing job.

**FR-AI-011 (P0):** The system shall apply configured file-size, token,
time, and cost limits to AI processing.

**FR-AI-012 (P0):** The system shall avoid logging full image content or
extracted sensitive text by default.

### 8.6 Search and retrieval

**FR-SEARCH-001 (P0):** The system shall accept a natural-language
search query.

**FR-SEARCH-002 (P0):** The system shall retrieve candidates using
semantic similarity when embeddings are available.

**FR-SEARCH-003 (P0):** The system shall restrict candidate retrieval to
the authenticated user's authorized memories.

**FR-SEARCH-004 (P0):** The system shall support date-range filtering.

**FR-SEARCH-005 (P0):** The system shall support category filtering when
categories are enabled.

**FR-SEARCH-006 (P1):** The system should combine vector retrieval with
OCR/title full-text search.

**FR-SEARCH-007 (P0):** The system shall paginate search results and
enforce a maximum page size.

**FR-SEARCH-008 (P0):** The system shall return a useful empty state
when no candidate matches.

**FR-SEARCH-009 (P1):** The system should allow the user to refine a
query without losing the ability to adjust filters.

**FR-SEARCH-010 (P1):** The system should provide basic relevance
evaluation using a labelled test dataset.

**FR-SEARCH-011 (P0):** The system shall handle missing embeddings
gracefully, for example by using available text search or clearly
marking the memory as not yet searchable.

**FR-SEARCH-012 (P0):** The system shall validate query length and
filter values to protect resource usage.

### 8.7 Settings and user control

**FR-SET-001 (P0):** The system shall explain whether AI processing is
local or remote.

**FR-SET-002 (P0):** If remote processing is used, the system shall
disclose what content or derived data is sent to the configured
provider.

**FR-SET-003 (P1):** The system should let the user enable or disable
optional cloud sync.

**FR-SET-004 (P0):** The system shall provide a way to delete a saved
memory.

**FR-SET-005 (P1):** The system should provide account-level data
export/deletion controls before broad public release.

**FR-SET-006 (P0):** The system shall explain permission purpose and
provide a route to system settings when a required permission is denied
permanently.

------------------------------------------------------------------------

## 9. Detailed screen-capture requirements

### 9.1 Capture is a platform capability, not an assumption

The floating icon is a desired product experience, but its behavior
depends on platform APIs and restrictions. The implementation shall not
treat arbitrary cross-app screen capture as a guaranteed capability.

### 9.2 Android requirements

-   Use only supported screen-capture APIs and user-consent mechanisms.
-   Request overlay permission only when the user enables the floating
    control.
-   Make the floating control dismissible and disableable.
-   Follow current foreground-service and notification requirements if a
    foreground service is needed.
-   Respect secure windows and protected content.
-   Handle the app entering the background, process death, and
    permission revocation.
-   Do not rely on continuous capture as the default behavior.
-   Use background scheduling for deferrable processing, not as a
    promise of immediate execution.

### 9.3 iOS requirements

-   Do not assume an Android-style always-on overlay can be implemented
    on iOS.
-   Evaluate share extensions, photo/file import, and supported in-app
    capture.
-   Keep the memory metadata and search experience consistent where
    possible.
-   Explain platform-specific limitations in onboarding or help content.

### 9.4 Capture acceptance tests

-   Capture flow cancelled: no memory is falsely marked as saved.
-   Permission denied: the app remains usable through supported
    alternatives.
-   Protected screen: no attempt is made to bypass restrictions.
-   Successful capture: the file can be reopened after app restart.
-   Low storage: the user receives a clear failure state.
-   App killed during a capture: the system recovers without corrupting
    unrelated memories.

------------------------------------------------------------------------

## 10. AI-processing requirements

### 10.1 Pipeline stages

1.  Validate image.
2.  Create a safe analysis derivative if resizing is needed.
3.  Run OCR where applicable.
4.  Generate a concise image description if enabled.
5.  Generate category/tag suggestions if enabled.
6.  Build searchable text.
7.  Generate an embedding with a compatible model.
8.  Persist metadata, vector, model version, and final status.
9.  Clean up temporary artifacts according to policy.

### 10.2 Searchable representation

A memory's searchable representation may combine:

-   User-provided title.
-   OCR text.
-   Image description.
-   User-approved tags.
-   Selected source metadata.

The exact fields and weighting should be evaluated empirically. Do not
include sensitive metadata in embeddings unless the user has been
informed and the design requires it.

### 10.3 AI quality controls

-   Preserve the original image.
-   Treat OCR as potentially inaccurate.
-   Treat descriptions and tags as model-generated suggestions.
-   Avoid inferring sensitive attributes about people shown in images.
-   Do not fabricate source URLs or product information.
-   Record model/provider version and processing time where
    operationally useful.
-   Support reprocessing after model changes.
-   Keep provider-specific logic behind interfaces.
-   Use timeouts, quotas, and bounded retries.

### 10.4 Embedding compatibility

Embeddings from different models or model versions may be incompatible.
The system shall not compare vectors of incompatible dimensions or
assume that values from different vector spaces are directly comparable.
Re-embedding should be a controlled migration with version tracking.

### 10.5 AI-provider failure

If a provider is unavailable:

-   The original memory remains accessible.
-   The job becomes retryable or reaches a documented failed state.
-   The UI shows that processing is delayed or failed.
-   Search may fall back to available OCR/title metadata.
-   The system does not repeatedly retry permanent failures
    indefinitely.

------------------------------------------------------------------------

## 11. Search and retrieval requirements

### 11.1 Search input

The query may be a phrase, sentence, or short description. The API shall
enforce a maximum length and reject malformed filters.

### 11.2 Candidate generation

Candidate generation may use:

-   Vector similarity.
-   Full-text search over OCR and descriptions.
-   Exact matching for titles and tags.
-   Metadata filters such as date and category.

### 11.3 Ranking

The initial ranker may combine normalized semantic and text scores.
Recency may be used when the query or filter explicitly asks for time.
Ranking parameters should be configurable and tested.

### 11.4 Filters

Minimum filter set:

-   Date from / date to.
-   Category.
-   Optional tag.
-   Optional processing status for library views.

Date handling must specify whether filters are interpreted in the user's
local timezone and converted to UTC at the API/database boundary.

### 11.5 Search security

-   User scope must be applied inside the database/vector query.
-   Do not expose cross-user candidate IDs through debugging or
    telemetry.
-   Validate page size and query complexity.
-   Avoid returning embeddings or unnecessary OCR content to the mobile
    client.
-   Signed media links must be short-lived and authorized.

### 11.6 Search quality evaluation

Create a small test set containing saved images and natural-language
queries. For each query, label the relevant memories. Track:

-   Recall@K: whether a relevant result appears in the top K.
-   MRR (Mean Reciprocal Rank): how highly the first relevant result is
    ranked.
-   Search latency.
-   User reformulation rate during a pilot.

Do not publish performance or accuracy claims until they have been
measured.

------------------------------------------------------------------------

## 12. Data requirements

### 12.1 Logical entities

The initial data model may contain:

-   User
-   Session or refresh-token record, if managed by the application
-   Memory
-   Memory tag or normalized tag relation
-   Embedding
-   Processing job
-   User preferences
-   Optional upload/sync state

### 12.2 Memory fields

A memory may include:

-   UUID.
-   Owner user ID.
-   Title.
-   Description.
-   OCR text.
-   Private image-storage key.
-   Thumbnail key.
-   Category and tags.
-   Capture time, if known.
-   Creation/update timestamps.
-   Processing state and safe error code.
-   Deletion state, if soft deletion is chosen.

### 12.3 Data integrity

-   Memory owner is mandatory for cloud records.
-   Foreign keys should protect relational integrity.
-   Every user-facing operation must enforce ownership.
-   Job creation should be idempotent.
-   Timestamps should use a consistent UTC convention.
-   The database shall have indexes for owner, creation time, category,
    and job status based on query patterns.
-   Vector dimensions must match the configured embedding model.
-   Deletion must cover image objects, vectors, extracted text, and
    associated records.

### 12.4 Retention and deletion

Before production, specify:

-   How long local and cloud originals are retained.
-   Whether deleted data remains in backups temporarily.
-   How provider-side retention works for remote AI processing.
-   Whether derived OCR, descriptions, and embeddings are deleted
    together.
-   What happens to data when a user closes their account.
-   How failed uploads and temporary files are cleaned up.

The app must not promise immediate irreversible deletion from backups or
third-party systems unless the architecture and provider contracts
support that promise.

------------------------------------------------------------------------

## 13. API and integration requirements

### 13.1 Proposed API surface

  ----------------------------------------------------------------------------------------
  Method            Endpoint                           Purpose           Priority
  ----------------- ---------------------------------- ----------------- -----------------
  POST              `/api/v1/auth/register`            Register          P0 if accounts
                                                                         enabled

  POST              `/api/v1/auth/login`               Login             P0 if accounts
                                                                         enabled

  POST              `/api/v1/auth/refresh`             Refresh session   P0 if refresh
                                                                         tokens used

  POST              `/api/v1/auth/logout`              Logout            P0

  GET               `/api/v1/users/me`                 Current user      P0

  POST              `/api/v1/memories`                 Create memory /   P0
                                                       start upload      

  GET               `/api/v1/memories`                 List memories     P0

  GET               `/api/v1/memories/:id`             Read memory       P0

  PATCH             `/api/v1/memories/:id`             Update metadata   P1

  DELETE            `/api/v1/memories/:id`             Delete memory     P0

  GET               `/api/v1/memories/:id/status`      Read processing   P0
                                                       state             

  POST              `/api/v1/memories/:id/reprocess`   Retry processing  P1

  POST              `/api/v1/search`                   Semantic/hybrid   P0
                                                       search            
  ----------------------------------------------------------------------------------------

This is a proposed API contract. Exact upload endpoints may be added if
using direct-to-object-storage uploads.

### 13.2 API behavior

-   Use a consistent response envelope or document a consistent response
    style.
-   Validate all user input.
-   Authenticate and authorize before accessing private records.
-   Enforce request and upload limits.
-   Use appropriate status codes.
-   Return safe, stable error codes.
-   Support pagination.
-   Avoid returning secrets, internal paths, storage credentials, or
    stack traces.
-   Add request IDs to logs.
-   Document routes with OpenAPI.

### 13.3 Suggested error categories

-   `AUTH_REQUIRED`
-   `ACCESS_DENIED`
-   `MEMORY_NOT_FOUND`
-   `INVALID_INPUT`
-   `UNSUPPORTED_FILE`
-   `FILE_TOO_LARGE`
-   `STORAGE_UNAVAILABLE`
-   `PROCESSING_PENDING`
-   `PROCESSING_FAILED`
-   `SEARCH_UNAVAILABLE`
-   `RATE_LIMITED`
-   `INTERNAL_ERROR`

These are illustrative identifiers. They should be standardized during
implementation.

------------------------------------------------------------------------

## 14. Non-functional requirements

### 14.1 Performance

**NFR-PERF-001:** The local save flow should confirm success as soon as
the image and required local metadata are safely persisted.

**NFR-PERF-002:** AI processing shall not block a save request until all
model calls finish.

**NFR-PERF-003:** The initial cloud search target should be p95 API
latency of 2 seconds or less under a defined test load, excluding
exceptional provider outages and client network delays. This is a target
to validate, not a guarantee.

**NFR-PERF-004:** Gallery lists should use thumbnails and pagination
rather than loading all full-resolution images at once.

**NFR-PERF-005:** The system shall limit image dimensions/size sent to
analysis according to model requirements while preserving the original
separately.

### 14.2 Reliability

**NFR-REL-001:** Saved originals shall remain available if AI processing
fails.

**NFR-REL-002:** Job retries shall be bounded and observable.

**NFR-REL-003:** The worker shall recover or requeue abandoned jobs
after crashes.

**NFR-REL-004:** Memory deletion shall be safe to repeat.

**NFR-REL-005:** Upload and processing status shall be recoverable after
an app restart.

### 14.3 Scalability

**NFR-SCALE-001:** API and worker responsibilities shall be separated so
processing can scale independently.

**NFR-SCALE-002:** Search and list queries shall use appropriate indexes
and pagination.

**NFR-SCALE-003:** Image binaries shall be stored outside relational
database rows.

**NFR-SCALE-004:** The system should permit a future move to a dedicated
queue or vector service without changing the user-facing memory model.

### 14.4 Maintainability

**NFR-MAINT-001:** Backend code shall use clear modules for auth,
memories, processing, search, and storage.

**NFR-MAINT-002:** AI provider integrations shall be behind interfaces.

**NFR-MAINT-003:** Database changes shall use versioned migrations.

**NFR-MAINT-004:** Critical flows shall have automated tests.

**NFR-MAINT-005:** Configuration and secrets shall be separated from
source code.

### 14.5 Portability

**NFR-PORT-001:** Shared UI and business logic should be portable where
practical.

**NFR-PORT-002:** Platform-specific capture code shall be isolated
behind an adapter/interface.

**NFR-PORT-003:** The product shall document feature differences between
Android and iOS.

### 14.6 Observability

**NFR-OBS-001:** The backend shall log request IDs, status codes, and
durations without logging private image content.

**NFR-OBS-002:** Processing jobs shall expose counts and failure
categories.

**NFR-OBS-003:** Search latency and AI processing latency shall be
measured separately.

**NFR-OBS-004:** Secrets, access tokens, signed URLs, and sensitive OCR
content shall be redacted from logs.

### 14.7 Usability

**NFR-UX-001:** The core save action shall require as few steps as the
selected platform permits.

**NFR-UX-002:** Processing states shall be understandable to
non-technical users.

**NFR-UX-003:** Search shall provide clear loading, empty, offline, and
error states.

**NFR-UX-004:** The user shall be able to find deletion and privacy
controls without navigating a confusing flow.

### 14.8 Resource usage

**NFR-RESOURCE-001:** Background processing shall have documented limits
for CPU, memory, image size, and retries.

**NFR-RESOURCE-002:** The mobile app shall avoid unnecessary
battery-intensive continuous tasks.

**NFR-RESOURCE-003:** The system shall track cloud AI and storage costs
per user or per memory at a privacy-appropriate level.

------------------------------------------------------------------------

## 15. Privacy, security, and compliance requirements

### 15.1 Data classification

Treat original screenshots, extracted text, source metadata, and search
history as potentially sensitive user data. Do not assume that a
screenshot is harmless because it is stored privately.

### 15.2 Authentication and authorization

-   Store passwords using a suitable password-hashing algorithm if
    passwords are managed directly.
-   Use short-lived access tokens and a secure refresh/session strategy.
-   Keep secrets in environment/secret management systems.
-   Enforce owner-based authorization on every memory endpoint and
    storage operation.
-   Do not trust a `userId` supplied in a request body.
-   Revoke sessions on logout/account deletion as applicable.
-   Rate-limit authentication and expensive AI/search endpoints.

### 15.3 Storage and transport

-   Use TLS for network traffic.
-   Keep object storage private.
-   Encrypt stored data at rest where supported and appropriate.
-   Use platform secure storage for credentials and refresh tokens.
-   Avoid permanent public URLs for private screenshots.
-   Limit signed URL lifetime and scope.
-   Validate uploads and protect against malformed files.

### 15.4 AI privacy

-   Disclose when images or derived text are sent to an external AI
    provider.
-   Minimize the content sent to the provider.
-   Review provider data-retention and training-use policies.
-   Do not send content to optional providers without a documented
    product setting and appropriate disclosure.
-   Avoid putting personal screenshots into logs or analytics.
-   Provide a clear way to disable cloud processing if the product
    supports a local-only mode.

### 15.5 Data subject controls

Before a public launch, define and implement:

-   Export of user data where required by the product/legal context.
-   Account deletion.
-   Memory deletion.
-   Retention of backups.
-   Handling of provider-side data.
-   Support/contact route for privacy requests.

### 15.6 Security acceptance tests

-   User A cannot fetch User B's memory by changing an ID.
-   User A cannot retrieve User B's result through vector search.
-   Expired credentials cannot access private endpoints.
-   Invalid upload types are rejected.
-   Internal provider errors do not expose secrets.
-   Deleting a memory prevents a queued job from restoring it.
-   Private media cannot be fetched without authorized access.

------------------------------------------------------------------------

## 16. Error handling and recovery

### 16.1 General rules

-   Errors must be explicit, safe, and actionable.
-   Do not display stack traces or raw provider responses.
-   Preserve already-saved data during downstream failures.
-   Distinguish retryable from permanent failures.
-   Use request IDs or job IDs for diagnostics.
-   Do not claim a task completed before confirmation from the
    responsible component.

### 16.2 Failure matrix

  -----------------------------------------------------------------------
  Failure                             Expected behavior
  ----------------------------------- -----------------------------------
  Image picker cancelled              Return to the previous screen
                                      without creating a false save

  Local storage full                  Show save failure; do not report
                                      success

  No internet                         Keep local save if local-first mode
                                      is enabled; queue sync if supported

  Upload interrupted                  Keep local original and
                                      resume/retry safely

  OCR unavailable                     Preserve memory; retry or mark
                                      partial processing

  LLM timeout                         Preserve existing metadata; retry
                                      only within limits

  Embedding generation fails          Mark search processing as
                                      incomplete; use fallback search if
                                      available

  Database unavailable                Return safe service error; do not
                                      fabricate successful cloud save

  Worker crashes                      Reclaim or retry the abandoned job

  Memory deleted during processing    Discard output and do not recreate
                                      deleted records

  Permission revoked                  Disable affected feature and
                                      explain how to re-enable it

  Search returns no match             Show empty state and allow
                                      query/filter refinement
  -----------------------------------------------------------------------

### 16.3 Processing states

Recommended memory processing states:

-   `pending`
-   `processing`
-   `ready`
-   `partial` (optional, when some useful metadata exists but a stage
    failed)
-   `failed`

The chosen states must have clear transition rules. Avoid allowing
arbitrary transitions such as `deleted → ready`.

------------------------------------------------------------------------

## 17. Observability and operational requirements

### 17.1 Metrics

Measure at minimum:

-   Successful and failed saves.
-   Upload success/failure rate.
-   Queue depth and job age.
-   Processing completion/failure rate.
-   Retry count by failure category.
-   OCR/description/embedding duration.
-   Search p50/p95 latency.
-   Search result opens and query refinements, with privacy-conscious
    telemetry.
-   AI cost per processed memory.
-   Storage usage.
-   Deletion completion status.

### 17.2 Logging

Logs should contain operational context such as request/job IDs, state
transitions, durations, and safe error categories. Do not log raw
screenshots, credentials, signed URLs, or OCR text by default.

### 17.3 Alerts

For a production or pilot environment, consider alerts for:

-   Sustained API failures.
-   Queue backlog exceeding a chosen threshold.
-   Repeated AI-provider failures.
-   Database connection exhaustion.
-   Abnormal storage growth.
-   Deletion jobs failing.
-   Sudden increase in per-memory AI cost.

Thresholds should be set after observing normal usage rather than
inventing arbitrary production limits.

### 17.4 Backup and recovery

Before cloud launch, define database and object-storage backup policies.
Test restoration, not merely backup creation. Choose RPO/RTO targets
based on the service's actual importance and budget.

------------------------------------------------------------------------

## 18. Accessibility and usability

-   Use readable text and adequate contrast.
-   Support system font scaling where practical.
-   Give icon-only controls accessible labels.
-   Ensure important states are not communicated by color alone.
-   Provide clear focus behavior and screen-reader labels.
-   Make floating controls movable or dismissible where appropriate.
-   Avoid placing controls over essential system/app UI.
-   Provide confirmation for destructive actions.
-   Use concise, plain-language privacy and permission explanations.
-   Ensure the main library and search can still be used when floating
    capture is unavailable.

------------------------------------------------------------------------

## 19. Testing and acceptance criteria

### 19.1 Core end-to-end acceptance scenario

**Scenario:** User saves and later retrieves an image.

Given the user has access to ORBI and a supported image is available,
when the user saves the image, the system shall persist it, create a
memory record, process it asynchronously if enabled, and make it
retrievable through a relevant natural-language query once the required
indexing stages complete.

**Pass conditions:**

-   The original can be opened after app restart.
-   A memory record exists with a valid owner.
-   Processing state is accurate.
-   The worker does not block the initial save.
-   A relevant query can retrieve the memory in the configured test set.
-   Another user cannot access the memory.
-   Deleting the memory removes it from subsequent search results.

### 19.2 Test groups

**Unit tests** - Request validation. - Date boundaries and timezone
conversions. - State transitions. - Ranking helper functions. - Retry
policy. - File validation.

**API integration tests** - Authentication. - Memory CRUD. - Ownership
enforcement. - Upload validation. - Search filters and pagination. -
Processing status. - Retry endpoint. - Deletion behavior.

**Worker tests** - Success, timeout, retry, permanent failure. -
Duplicate job delivery. - Memory deletion during a job. - Model version
tracking. - Temporary-file cleanup.

**Mobile tests** - Permission granted/denied. - Import cancellation. -
Offline save. - App restart. - Low storage. - Search empty/loading/error
states. - Capture unavailable on protected content. - Platform-specific
behavior.

**Security tests** - IDOR/cross-user access. - Token expiration. - Rate
limits. - Private object access. - Secret leakage. - Account deletion. -
Signed URL expiration.

### 19.3 Search evaluation

Build a small labelled dataset with:

-   Saved images.
-   Multiple query phrasings per image.
-   Relevant and non-relevant candidates.
-   Queries with and without date/category filters.

Evaluate Recall@5, MRR, latency, and failure cases. Establish a baseline
before tuning ranking or adding a reranker.

### 19.4 Release gate

The MVP should not be considered ready for external users until:

-   Core save-and-retrieve flow passes.
-   User data isolation tests pass.
-   Privacy disclosures match actual behavior.
-   Deletion behavior is verified.
-   Known platform limitations are documented.
-   Critical failures are observable.
-   No real secrets are committed to the repository.

------------------------------------------------------------------------

## 20. Release and deployment requirements

### 20.1 Environments

Use separate development and production configuration. A staging
environment is recommended before inviting external testers.

### 20.2 Configuration

-   Validate required environment variables at startup.
-   Keep secrets out of source control and client bundles.
-   Document database migration and rollback expectations.
-   Use separate credentials for development and production.
-   Keep AI provider selection configurable.

### 20.3 Deployment

-   Deploy API and worker as independently restartable processes.
-   Use health/readiness checks where supported.
-   Run database migrations in a controlled release step.
-   Configure private image storage and access policy.
-   Configure request and upload size limits.
-   Test background job recovery after deployment/restart.
-   Verify backup restoration before relying on backups.

### 20.4 Mobile distribution

-   Test on physical devices.
-   Document supported Android/iOS versions.
-   Explain special permissions before asking for them.
-   Provide a fallback when capture is unavailable.
-   Review platform store policies before releasing overlay, background
    service, or screen-capture features.

------------------------------------------------------------------------

## 21. Risks and mitigations

  -----------------------------------------------------------------------
  Risk                    Impact                  Mitigation
  ----------------------- ----------------------- -----------------------
  Floating capture is     Core interaction        Validate feasibility
  restricted              differs across devices  early and maintain
                                                  import/share fallback

  iOS cannot mirror       Platform parity is      Build platform-specific
  Android overlay         limited                 capture adapters
  behavior                                        

  Search quality is poor  Users cannot find       Hybrid retrieval,
                          memories                labelled test set,
                                                  query refinement

  AI descriptions contain Incorrect metadata      Preserve originals;
  errors                  harms retrieval         allow edits; use
                                                  descriptions as hints

  AI costs are high       Operating cost becomes  Quotas, async
                          unsustainable           processing, image
                                                  resizing, cost tracking

  Provider outage         Processing delays       Retry policy, fallback
                                                  search, status
                                                  visibility

  Sensitive screenshots   Serious privacy         Least privilege,
  leak                    incident                private storage,
                                                  encryption, safe
                                                  logging

  Cross-user retrieval    Private memory exposure Database-scoped owner
  bug                                             filters and security
                                                  tests

  Background jobs are     Search indexing is not  Show processing status;
  delayed                 immediate               design for eventual
                                                  completion

  Deletion is incomplete  Data remains in derived Central deletion
                          stores                  workflow and
                                                  reconciliation jobs

  Model version changes   Existing embeddings     Version metadata and
                          become incompatible     controlled re-embedding

  Offline capture loses   Trust in the app is     Persist locally first
  data                    damaged                 and test crash/restart
                                                  recovery
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 22. Requirements traceability

This table links product goals to requirements and validation methods.

  -----------------------------------------------------------------------
  Goal                    Related requirements    Validation
  ----------------------- ----------------------- -----------------------
  Quick, reliable saving  FR-CAP-001 to           Mobile end-to-end tests
                          FR-CAP-008              

  AI must not block       FR-AI-001, NFR-PERF-002 API and worker tests
  saving                                          

  Search by meaning       FR-SEARCH-001 to        Labelled retrieval
                          FR-SEARCH-006           dataset

  Filters work correctly  FR-SEARCH-004,          Date/category
                          FR-SEARCH-005           integration tests

  Protect private         FR-AUTH-003,            Cross-user
  memories                FR-SEARCH-003, security authorization tests
                          requirements            

  Recover from AI         FR-AI-006 to FR-AI-012  Worker failure/retry
  failures                                        tests

  Respect platform limits FR-SCREEN-001 to        Physical-device
                          FR-SCREEN-009           platform tests

  User controls data      FR-SET-001 to           Privacy and deletion
                          FR-SET-006              acceptance tests

  Maintain operational    NFR-OBS-001 to          Log/metric review and
  visibility              NFR-OBS-004             failure drills
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 23. Open questions and decisions

These are important unresolved decisions. Do not treat them as completed
merely because recommendations are listed.

### Product and platform

1.  Is Android the first and only MVP platform, or must iOS ship at the
    same time?
2.  Is the floating icon a launch requirement or a later enhancement?
3.  Which capture paths are acceptable: share sheet, gallery import,
    in-app capture, Android screen capture?
4.  Should the product support local-only usage without an account?

### Data and privacy

5.  Are originals stored only on-device by default, or synced to private
    cloud storage?
6.  Is cloud AI processing opt-in, opt-out, or unavailable until
    explicitly enabled?
7.  What is the retention policy for originals, OCR text, embeddings,
    logs, and backups?
8.  What is the account-deletion policy and expected completion time?
9.  Will users be able to export their entire memory library?

### AI and search

10. Which OCR and image-understanding providers will be used?
11. Will the initial embedding model be text-only or multimodal?
12. What languages must OCR support?
13. Is semantic search required while offline?
14. How should the system behave when a memory has no embedding yet?
15. How will search relevance be evaluated before public launch?

### Engineering and operations

16. Will authentication be managed by an identity provider or
    implemented by the application?
17. Which queue will be used, if any, for the first deployment?
18. What is the expected number of users and saved memories during the
    pilot?
19. What AI cost per memory is acceptable?
20. What backup and recovery objectives are affordable?

### Recommended initial decisions

-   Validate Android capture feasibility before promising a persistent
    floating overlay.
-   Start with image import/share and local persistence.
-   Use one API and one worker initially.
-   Use PostgreSQL and `pgvector` for the first cloud search
    implementation.
-   Keep AI processing asynchronous.
-   Make remote AI processing and cloud storage behavior explicit.
-   Delay advanced ranking, broad platform parity, and complex sync
    until the end-to-end loop is reliable.

------------------------------------------------------------------------

## 24. Recommended implementation sequence

The sequence below is designed for a solo developer who can spend
roughly 2--2.5 hours per day and use AI coding tools while personally
reviewing architecture and behavior. It is a planning aid, not a
guaranteed delivery schedule.

### Stage 1 --- Feasibility and scope

-   Confirm target platform.
-   Test image import and supported capture APIs on a physical device.
-   Choose local-first/cloud-assisted behavior.
-   Decide initial AI inputs and provider.
-   Write short architecture decision records.

**Exit gate:** The first supported save path is proven.

### Stage 2 --- Persistence and memory API

-   Set up repository and environment validation.
-   Define migrations and memory schema.
-   Implement authentication if needed.
-   Implement create/list/detail/delete.
-   Enforce user ownership.

**Exit gate:** Saved memory metadata is safe and testable.

### Stage 3 --- Mobile save and gallery

-   Build import flow.
-   Persist originals locally.
-   Display the memory gallery and detail page.
-   Add date sorting and basic filters.
-   Handle offline and low-storage states.

**Exit gate:** Images remain accessible after restart.

### Stage 4 --- AI jobs

-   Add processing jobs and worker.
-   Integrate OCR.
-   Add image descriptions if required.
-   Generate embeddings.
-   Track job state, retries, and failures.

**Exit gate:** A saved image becomes searchable without blocking the
save request.

### Stage 5 --- Search

-   Implement query embedding.
-   Add vector search and ownership filtering.
-   Add metadata filters and pagination.
-   Build a labelled test dataset.
-   Measure baseline search relevance.

**Exit gate:** Natural-language search finds relevant memories in the
test set.

### Stage 6 --- Capture enhancements

-   Add Android floating control only after feasibility testing.
-   Implement consent and permission states.
-   Test process death, permission revocation, and protected content.
-   Provide fallback import/share behavior.

**Exit gate:** Capture works reliably within documented platform limits.

### Stage 7 --- Pilot readiness

-   Test authorization and deletion.
-   Add logging, metrics, rate limits, and cost controls.
-   Review privacy disclosures.
-   Test backup and restore if cloud data is used.
-   Prepare a limited tester release.

**Exit gate:** Critical safety, privacy, reliability, and acceptance
tests pass.

------------------------------------------------------------------------

## 25. Definition of done

A feature is not done merely because its UI exists. It is done when:

-   Requirements and acceptance criteria are documented.
-   Success, failure, cancellation, and offline states are handled.
-   Inputs are validated.
-   Authorization and privacy implications are reviewed.
-   Relevant automated tests pass.
-   Errors are observable without logging sensitive content.
-   Documentation matches actual implementation.
-   No real credentials or secrets are committed.
-   Known platform limitations are explained.
-   The feature has been tested in the environment it claims to support.

The MVP is complete when a user can save a supported image, find it
later with a meaningful natural-language query, open the original, and
delete it---with reliable behavior and appropriate privacy protections.

------------------------------------------------------------------------

## Appendix A --- Example search request

``` json
{
  "query": "the black shoes I saw last week",
  "filters": {
    "dateFrom": "2026-10-25T00:00:00Z",
    "dateTo": "2026-11-01T23:59:59Z",
    "category": "shopping"
  },
  "limit": 20
}
```

This example illustrates the shape of a request only. Actual date
interpretation, validation, and API contracts must be finalized in the
implementation.

## Appendix B --- Example processing state machine

``` mermaid
stateDiagram-v2
    [*] --> pending
    pending --> processing
    processing --> ready
    processing --> partial
    processing --> failed
    failed --> pending: retry
    partial --> pending: reprocess
    ready --> pending: reprocess
    pending --> deleted
    processing --> deleted
    ready --> deleted
    partial --> deleted
    failed --> deleted
    deleted --> [*]
```

The implementation must define which transitions are allowed and ensure
deleted memories cannot be restored by delayed jobs.

## Appendix C --- Initial release checklist

-   [ ] Platform and capture feasibility confirmed.
-   [ ] Local save works after app restart.
-   [ ] Authentication and authorization tests pass, if accounts are
    enabled.
-   [ ] AI processing is asynchronous.
-   [ ] Worker retries are bounded.
-   [ ] Search filters are tested.
-   [ ] Cross-user search isolation is verified.
-   [ ] Deletion covers all derived data stores.
-   [ ] Cloud AI data handling is disclosed.
-   [ ] Secrets are not committed.
-   [ ] Logs exclude private content and credentials.
-   [ ] Critical failure cases are tested on a physical device.
-   [ ] README and SRS match actual shipped behavior.

------------------------------------------------------------------------

**End of document.**
