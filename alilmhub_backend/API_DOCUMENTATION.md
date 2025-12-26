# AlIlmHub API Documentation

> **Base URL:** `/api/v1`  
> **Authentication:** Bearer Token (JWT) in `Authorization` header

---

## Table of Contents

1. [Reference API](#1-reference-api)
2. [Debate API](#2-debate-api)
3. [Topic API](#3-topic-api)
4. [How They Connect](#4-how-they-connect)

---

## 1. Reference API

References are source materials (books, articles, hadith, quran verses) that can be cited in topics and debates.

### Data Structure

```typescript
{
  _id: string;              // MongoDB ObjectId
  slug: string;             // URL-friendly identifier (auto-generated, immutable)
  type: "book" | "article" | "hadith" | "quran";
  title: string;
  author?: string;
  citationText?: string;    // The actual quote/citation
  sourceUrl?: string;
  sourceLanguage?: string;
  verified: boolean;        // Has been verified by a scholar
  verifiedBy?: User;        // Who verified it
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}
```

### Endpoints

#### Create Reference
```http
POST /reference
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "hadith",                           // Required: book | article | hadith | quran
  "title": "Sahih Bukhari - Book of Prayer",  // Required
  "author": "Imam Bukhari",                   // Optional
  "citationText": "Prayer is the pillar...",  // Optional
  "sourceUrl": "https://sunnah.com/...",      // Optional
  "sourceLanguage": "Arabic"                  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "slug": "sahih-bukhari-book-of-prayer",
    "type": "hadith",
    "title": "Sahih Bukhari - Book of Prayer",
    "author": "Imam Bukhari",
    "verified": false,
    "createdBy": "...",
    "createdAt": "2025-12-26T10:00:00Z"
  }
}
```

#### Get All References
```http
GET /reference
GET /reference?type=hadith
GET /reference?search=bukhari
GET /reference?page=1&limit=10
GET /reference?sort=-createdAt
```

#### Get Reference by Slug
```http
GET /reference/:slug
```

#### Update Reference
```http
PATCH /reference/:slug
Authorization: Bearer {token}

{
  "citationText": "Updated citation text"
}
```

#### Delete Reference
```http
DELETE /reference/:slug
Authorization: Bearer {token}
```

#### Verify Reference (Scholar/Reviewer only)
```http
PATCH /reference/:slug/verify
Authorization: Bearer {token}
```

#### Get Bulk References by IDs
```http
POST /reference/bulk

{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

---

## 2. Debate API

Debates are discussions where users take supporting or opposing positions on a topic.

### Data Structure

```typescript
{
  _id: string;
  slug: string;                    // Auto-generated, immutable
  title: string;
  titleDescription?: string;
  topicId?: Topic;                 // Optional - debate can exist without topic
  author: User;
  description: string;
  stance: "supporting" | "opposing" | "neutral";
  status: "open" | "closed" | "archived";
  references: Reference[];         // ObjectId array (populated)
  supportingMembers: User[];
  opposingMembers: User[];
  viewsCount: number;
  supportingVotesCount: number;
  opposingVotesCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Endpoints

#### Create Debate
```http
POST /debate
Authorization: Bearer {token}

{
  "title": "Is Taraweeh 8 or 20 Rakah?",           // Required
  "description": "Discussion about the number...", // Required
  "stance": "supporting",                          // Required: supporting | opposing | neutral
  "titleDescription": "A scholarly debate...",     // Optional
  "topicId": "507f1f77bcf86cd799439011",          // Optional (MongoDB _id of Topic)
  "references": ["507f1f77bcf86cd799439012"]      // Optional (MongoDB _id array)
}
```

#### Get All Debates
```http
GET /debate
GET /debate?status=open
GET /debate?search=prayer
GET /debate?page=1&limit=10
```

#### Get Debate by Slug
```http
GET /debate/:slug
```

**Response includes populated data:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "slug": "is-taraweeh-8-or-20-rakah",
    "title": "Is Taraweeh 8 or 20 Rakah?",
    "author": { "_id": "...", "name": "Ahmed", "email": "..." },
    "topicId": { "_id": "...", "slug": "salah", "title": "Salah" },
    "references": [
      { "_id": "...", "slug": "sahih-bukhari", "title": "Sahih Bukhari", "type": "hadith" }
    ],
    "supportingMembers": [...],
    "opposingMembers": [...]
  }
}
```

#### Get Debates by Topic
```http
GET /debate/topic/:topicId
```

#### Get Debates by User
```http
GET /debate/user/:userId
```

#### Update Debate (Author only)
```http
PATCH /debate/:slug
Authorization: Bearer {token}

{
  "description": "Updated description"
}
```

#### Delete Debate (Author only)
```http
DELETE /debate/:slug
Authorization: Bearer {token}
```

#### Add References to Debate
```http
PATCH /debate/:slug/add-references
Authorization: Bearer {token}

{
  "referenceIds": ["507f1f77bcf86cd799439011"]  // MongoDB _id array
}
```

#### Remove References from Debate
```http
PATCH /debate/:slug/remove-references
Authorization: Bearer {token}

{
  "referenceIds": ["507f1f77bcf86cd799439011"]
}
```

#### Join Debate
```http
POST /debate/:slug/join
Authorization: Bearer {token}

{
  "side": "supporting"  // supporting | opposing
}
```

#### Leave Debate
```http
POST /debate/:slug/leave
Authorization: Bearer {token}
```

#### Update Debate Status (Author only)
```http
PATCH /debate/:slug/status
Authorization: Bearer {token}

{
  "status": "closed"  // open | closed | archived
}
```

---

## 3. Topic API

Topics are knowledge articles with hierarchical structure, versioned content, and embedded references/debates.

### Data Structure

```typescript
{
  _id: string;
  id: string;                      // Custom ID like "topic_salah_123456"
  slug: string;                    // URL-friendly: "salah" (immutable)
  title: string;
  
  // Hierarchy
  parentId?: string;               // Parent topic's custom `id` field
  level: number;                   // Depth (0 = root)
  path: string;                    // Full path: "/islam/fiqh/salah"
  
  // Content
  summary?: string;
  titleDescription?: string;
  wikiContent?: string;            // Markdown content
  contentBlocks: ContentBlock[];   // Rich structured content
  versions: Version[];             // Version history
  
  // Status
  status: "draft" | "published" | "archived";
  canonical: boolean;
  
  // Relationships (stored as SLUGS, not ObjectIds)
  references: string[];            // Reference slugs
  debates: string[];               // Debate slugs
  
  // Metadata
  createdBy: User;
  updatedBy?: User;
  viewCount: number;
  editCount: number;
  isFeatured: boolean;
  isDeleted: boolean;
}
```

### Content Block Structure

Topics use a rich content structure for the editor:

```typescript
ContentBlock {
  id: string;                      // Unique block ID
  type: "heading" | "paragraph" | "list" | "quote" | "code";
  units: ContentUnit[];
  metadata?: {
    level?: number;                // For headings (1-6)
    ordered?: boolean;             // For lists
    language?: string;             // For code blocks
  };
}

ContentUnit {
  id: string;
  content: string;                 // Plain text (for search)
  spans: Span[];
}

Span {
  text: string;
  type: "text" | "reference" | "debate";
  marks?: string[];                // ["bold", "italic", "highlight"]
  data?: {
    refId?: string;                // Reference SLUG
    debateId?: string;             // Debate SLUG
    stance?: "supporting" | "opposing" | "neutral";
  };
}
```

### Endpoints

#### Create Topic
```http
POST /topic
Authorization: Bearer {token}

{
  "title": "Salah (Prayer)",                    // Required
  "summary": "The second pillar of Islam",      // Optional
  "titleDescription": "Detailed description",   // Optional
  "wikiContent": "# Salah\n\nSalah is...",     // Optional (Markdown)
  "parentId": "topic_fiqh_123456",             // Optional (parent's custom id)
  "status": "published",                        // Optional: draft | published | archived
  "isFeatured": false                          // Optional
}
```

**Note:** `slug`, `id`, `path`, and `level` are auto-generated. Do not send them.

#### Get All Topics
```http
GET /topic
GET /topic?search=prayer
GET /topic?status=published
GET /topic?isFeatured=true
GET /topic?page=1&limit=10
```

#### Get Topic by Slug
```http
GET /topic/:slug
```

**Response includes full reference and debate data:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "id": "topic_salah_123456",
    "slug": "salah",
    "title": "Salah (Prayer)",
    "path": "/islam/fiqh/salah",
    "level": 2,
    "parent": { "id": "topic_fiqh_789", "slug": "fiqh", "title": "Fiqh" },
    "breadcrumb": [
      { "slug": "islam", "title": "Islam" },
      { "slug": "fiqh", "title": "Fiqh" },
      { "slug": "salah", "title": "Salah" }
    ],
    "breadcrumbPath": "Islam -> Fiqh -> Salah",
    "references": ["sahih-bukhari-prayer", "quran-2-43"],
    "debates": ["taraweeh-rakah-count"],
    "referencesData": [
      { "slug": "sahih-bukhari-prayer", "type": "hadith", "title": "Sahih Bukhari - Prayer", "verified": true }
    ],
    "debatesData": [
      { "slug": "taraweeh-rakah-count", "title": "Taraweeh Rakah Count", "stance": "neutral", "status": "open" }
    ],
    "contentBlocks": [...],
    "createdBy": { "name": "...", "email": "..." }
  }
}
```

#### Update Topic
```http
PATCH /topic/:slug
Authorization: Bearer {token}

{
  "title": "Updated Title",
  "summary": "Updated summary",
  "parentId": "topic_new_parent_123"  // Change parent (will recalculate path)
}
```

**Note:** `slug` and `id` cannot be changed after creation.

#### Delete Topic (Soft Delete)
```http
DELETE /topic/:slug
Authorization: Bearer {token}
```

#### Get Knowledge Tree
```http
GET /topic/knowledge-tree
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "slug": "islam",
      "title": "Islam",
      "count": 5,
      "isFeatured": true,
      "hasSubTopics": true,
      "children": [
        {
          "slug": "fiqh",
          "title": "Fiqh",
          "children": [...]
        }
      ]
    }
  ]
}
```

#### Get Sub-Topics
```http
GET /topic/:slug/sub-topics
```

#### Get Topic Children (Direct children only)
```http
GET /topic/:slug/children
```

#### Get Topic Subtree (All descendants)
```http
GET /topic/:slug/subtree
```

#### Get Topics by Path
```http
GET /topic/by-path?path=/islam/fiqh
```

#### Add References to Topic
```http
PATCH /topic/:slug/add-references
Authorization: Bearer {token}

{
  "referenceIds": ["sahih-bukhari-prayer"]  // Reference SLUGS
}
```

#### Remove References from Topic
```http
PATCH /topic/:slug/remove-references
Authorization: Bearer {token}

{
  "referenceIds": ["sahih-bukhari-prayer"]
}
```

### Versioning

#### Get All Versions
```http
GET /topic/:slug/versions
```

#### Get Specific Version
```http
GET /topic/:slug/versions/:versionId
```

#### Update Topic Content (Creates New Version)
```http
PUT /topic/:slug/content
Authorization: Bearer {token}

{
  "contentBlocks": [
    {
      "id": "blk_1",
      "type": "heading",
      "units": [{
        "id": "unit_1",
        "content": "What is Salah?",
        "spans": [{ "text": "What is Salah?", "type": "text" }]
      }],
      "metadata": { "level": 1 }
    },
    {
      "id": "blk_2",
      "type": "paragraph",
      "units": [{
        "id": "unit_2",
        "content": "Salah is mentioned in Sahih Bukhari as obligatory.",
        "spans": [
          { "text": "Salah is mentioned in ", "type": "text" },
          { 
            "text": "Sahih Bukhari", 
            "type": "reference", 
            "data": { "refId": "sahih-bukhari-prayer", "stance": "supporting" }
          },
          { "text": " as obligatory.", "type": "text" }
        ]
      }]
    }
  ],
  "summary": "Updated summary",
  "wikiContent": "# Salah..."
}
```

---

## 4. How They Connect

### Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           TOPIC                                  │
│  - Has hierarchical parent/child structure                      │
│  - Contains rich content with embedded references/debates       │
│  - references[] and debates[] store SLUGS                       │
└─────────────────────────────────────────────────────────────────┘
        │                                    │
        │ (slugs in spans)                   │ (slugs in spans)
        ▼                                    ▼
┌───────────────────┐              ┌───────────────────┐
│    REFERENCE      │              │      DEBATE       │
│  - Standalone     │◄─────────────│  - Can link to    │
│  - Lookup by slug │   (ObjectIds)│    Topic          │
│  - Verified by    │              │  - Has references │
│    scholars       │              │  - Users can join │
└───────────────────┘              └───────────────────┘
```

### Key Points for Frontend

1. **Topic → Reference/Debate:** Uses **SLUGS** in content spans
   - When embedding a reference in topic content, use `refId: "reference-slug"`
   - When embedding a debate in topic content, use `debateId: "debate-slug"`

2. **Debate → Reference:** Uses **MongoDB ObjectIds**
   - When adding references to a debate, use the `_id` field

3. **Debate → Topic:** Uses **MongoDB ObjectId**
   - When creating a debate for a topic, use the topic's `_id` field

4. **Topic Hierarchy:** Uses **Custom ID** (not ObjectId)
   - When setting a parent topic, use the parent's `id` field (e.g., `"topic_fiqh_123456"`)

### Example Flow: Creating a Complete Article

**Step 1: Create References First**
```http
POST /reference
{ "type": "hadith", "title": "Sahih Bukhari - Prayer Chapter" }
→ Returns slug: "sahih-bukhari-prayer-chapter"
```

**Step 2: Create Topic with Embedded Reference**
```http
POST /topic
{
  "title": "Importance of Prayer",
  "contentBlocks": [{
    "id": "blk_1",
    "type": "paragraph",
    "units": [{
      "id": "unit_1",
      "content": "Prayer is obligatory as mentioned in Sahih Bukhari",
      "spans": [
        { "text": "Prayer is obligatory as mentioned in ", "type": "text" },
        { 
          "text": "Sahih Bukhari", 
          "type": "reference", 
          "data": { "refId": "sahih-bukhari-prayer-chapter", "stance": "supporting" }
        }
      ]
    }]
  }]
}
```

**Step 3: Create Debate Linked to Topic**
```http
POST /debate
{
  "title": "Number of Rakah in Taraweeh",
  "description": "Discussion about...",
  "stance": "neutral",
  "topicId": "507f1f77bcf86cd799439011",  // Topic's _id
  "references": ["507f1f77bcf86cd799439012"]  // Reference's _id
}
```

---

## Query Parameters (Common)

| Parameter | Description | Example |
|-----------|-------------|---------|
| `search` | Text search | `?search=prayer` |
| `page` | Page number | `?page=2` |
| `limit` | Items per page | `?limit=20` |
| `sort` | Sort field (- for desc) | `?sort=-createdAt` |
| `fields` | Select specific fields | `?fields=title,slug` |

---

## Error Responses

```json
{
  "success": false,
  "message": "Error message here",
  "errorSources": [
    { "path": "field", "message": "Specific error" }
  ]
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (not allowed) |
| 404 | Not Found |
| 500 | Server Error |
