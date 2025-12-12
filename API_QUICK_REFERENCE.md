# Topic API Quick Reference

## Legacy Endpoints (Still Working) ✅

### Get All Topics
```http
GET /api/v1/topic
```

### Create Topic
```http
POST /api/v1/topic
Authorization: Bearer {token}

{
  "title": "Topic Title",
  "titleDescription": "Description",
  "summary": "Brief summary",
  "parentTopic": "ObjectId" // Optional
}
```

### Get Topic by Slug
```http
GET /api/v1/topic/:slug
```

### Update Topic
```http
PATCH /api/v1/topic/:slug
Authorization: Bearer {token}

{
  "title": "Updated Title",
  "titleDescription": "Updated description"
}
```

### Delete Topic
```http
DELETE /api/v1/topic/:slug
Authorization: Bearer {token}
```

### Get Sub-Topics
```http
GET /api/v1/topic/:slug/sub-topics
```

### Get Knowledge Tree
```http
GET /api/v1/topic/knowledge-tree
```

### Add References
```http
PATCH /api/v1/topic/:slug/add-references
Authorization: Bearer {token}

{
  "referenceIds": ["ObjectId1", "ObjectId2"]
}
```

### Remove References
```http
PATCH /api/v1/topic/:slug/remove-references
Authorization: Bearer {token}

{
  "referenceIds": ["ObjectId1", "ObjectId2"]
}
```

---

## New Versioning Endpoints 🆕

### Get All Versions
```http
GET /api/v1/topic/:slug/versions

Response:
[
  {
    "versionId": "v1",
    "changedAt": "2025-12-12T10:00:00Z",
    "changedBy": "ObjectId",
    "contentBlocks": [...]
  },
  {
    "versionId": "v2",
    "changedAt": "2025-12-12T11:00:00Z",
    "changedBy": "ObjectId",
    "changes": [...],
    "contentBlocks": [...]
  }
]
```

### Get Specific Version
```http
GET /api/v1/topic/:slug/versions/:versionId

Response:
{
  "versionId": "v2",
  "changedAt": "2025-12-12T11:00:00Z",
  "changedBy": "ObjectId",
  "changes": [
    {
      "blockId": "blk_1",
      "unitId": "unit_1",
      "spanIndex": 0,
      "oldText": "Old text",
      "newText": "New text",
      "diff": "+New text"
    }
  ],
  "contentBlocks": [...]
}
```

### Update Topic Content (Creates New Version)
```http
PUT /api/v1/topic/:slug/content
Authorization: Bearer {token}

{
  "summary": "Updated summary",
  "wikiContent": "# Updated markdown content",
  "contentBlocks": [
    {
      "id": "blk_1",
      "type": "heading",
      "units": [
        {
          "id": "unit_1",
          "content": "Heading Text",
          "spans": [
            {
              "text": "Heading Text",
              "type": "text"
            }
          ]
        }
      ],
      "metadata": {
        "level": 1
      }
    },
    {
      "id": "blk_2",
      "type": "paragraph",
      "units": [
        {
          "id": "unit_2",
          "content": "Paragraph with reference [ref_5]",
          "spans": [
            {
              "text": "Paragraph with reference ",
              "type": "text"
            },
            {
              "text": "[ref_5]",
              "type": "reference",
              "data": {
                "refId": "ref_5",
                "stance": "supporting"
              }
            }
          ]
        }
      ]
    }
  ]
}

Response:
{
  "success": true,
  "message": "Topic content updated successfully",
  "data": {
    // Updated topic with new version
  }
}
```

---

## New Hierarchy Endpoints 🆕

### Get Immediate Children
```http
GET /api/v1/topic/:slug/children

Response:
[
  {
    "id": "topic_salah",
    "slug": "salah",
    "title": "Salah (Prayer)",
    "parentId": "topic_fiqh",
    "level": 2,
    "path": "/islam/fiqh/salah"
  },
  // ... more children
]
```

### Get Entire Subtree
```http
GET /api/v1/topic/:slug/subtree

Response:
[
  {
    "id": "topic_fiqh",
    "slug": "fiqh",
    "title": "Fiqh",
    "level": 1,
    "path": "/islam/fiqh"
  },
  {
    "id": "topic_salah",
    "slug": "salah",
    "title": "Salah",
    "level": 2,
    "path": "/islam/fiqh/salah"
  },
  {
    "id": "topic_wudu",
    "slug": "wudu",
    "title": "Wudu",
    "level": 3,
    "path": "/islam/fiqh/salah/wudu"
  }
  // ... entire subtree
]
```

### Get Topics by Path
```http
GET /api/v1/topic/by-path?path=/islam/fiqh

Response:
[
  {
    "id": "topic_fiqh",
    "slug": "fiqh",
    "title": "Fiqh",
    "path": "/islam/fiqh"
  },
  {
    "id": "topic_salah",
    "slug": "salah",
    "title": "Salah",
    "path": "/islam/fiqh/salah"
  }
  // ... all topics under /islam/fiqh
]
```

---

## Content Block Types

### Heading
```json
{
  "id": "blk_1",
  "type": "heading",
  "units": [{
    "id": "unit_1",
    "content": "Heading Text",
    "spans": [{"text": "Heading Text", "type": "text"}]
  }],
  "metadata": {
    "level": 1  // 1-6 for h1-h6
  }
}
```

### Paragraph
```json
{
  "id": "blk_2",
  "type": "paragraph",
  "units": [{
    "id": "unit_2",
    "content": "This is a paragraph.",
    "spans": [{"text": "This is a paragraph.", "type": "text"}]
  }]
}
```

### List
```json
{
  "id": "blk_3",
  "type": "list",
  "units": [
    {"id": "unit_3", "content": "Item 1", "spans": [{"text": "Item 1", "type": "text"}]},
    {"id": "unit_4", "content": "Item 2", "spans": [{"text": "Item 2", "type": "text"}]}
  ],
  "metadata": {
    "ordered": true  // true for numbered list, false for bullet
  }
}
```

### Quote
```json
{
  "id": "blk_4",
  "type": "quote",
  "units": [{
    "id": "unit_5",
    "content": "Quoted text here",
    "spans": [{"text": "Quoted text here", "type": "text"}]
  }]
}
```

### Code
```json
{
  "id": "blk_5",
  "type": "code",
  "units": [{
    "id": "unit_6",
    "content": "const x = 10;",
    "spans": [{"text": "const x = 10;", "type": "text"}]
  }],
  "metadata": {
    "language": "javascript"
  }
}
```

---

## Span Types

### Plain Text
```json
{
  "text": "Plain text",
  "type": "text"
}
```

### Formatted Text
```json
{
  "text": "Bold italic text",
  "type": "text",
  "marks": ["bold", "italic"]
}
```

### Reference
```json
{
  "text": "[ref_5]",
  "type": "reference",
  "data": {
    "refId": "ref_5",
    "stance": "supporting"  // or "opposing", "neutral"
  }
}
```

### Debate
```json
{
  "text": "[debate_2]",
  "type": "debate",
  "data": {
    "debateId": "debate_2",
    "stance": "opposing"
  }
}
```

---

## Complete Example

### Creating a Rich Topic
```http
POST /api/v1/topic
Authorization: Bearer {token}

{
  "title": "Salah (Prayer)",
  "summary": "The second pillar of Islam - obligatory prayer performed five times daily",
  "wikiContent": "# Salah\n\nSalah is the Islamic prayer...",
  "parentId": "topic_fiqh",
  "status": "published",
  "contentBlocks": [
    {
      "id": "blk_1",
      "type": "heading",
      "units": [{
        "id": "unit_1",
        "content": "What is Salah?",
        "spans": [{"text": "What is Salah?", "type": "text"}]
      }],
      "metadata": {"level": 1}
    },
    {
      "id": "blk_2",
      "type": "paragraph",
      "units": [{
        "id": "unit_2",
        "content": "Salah is the obligatory prayer in Islam, mentioned in the Quran [ref_5] as one of the five pillars.",
        "spans": [
          {"text": "Salah is the obligatory prayer in Islam, mentioned in the Quran ", "type": "text"},
          {"text": "[ref_5]", "type": "reference", "data": {"refId": "ref_5", "stance": "supporting"}},
          {"text": " as one of the five pillars.", "type": "text"}
        ]
      }]
    },
    {
      "id": "blk_3",
      "type": "heading",
      "units": [{
        "id": "unit_3",
        "content": "Times of Prayer",
        "spans": [{"text": "Times of Prayer", "type": "text"}]
      }],
      "metadata": {"level": 2}
    },
    {
      "id": "blk_4",
      "type": "list",
      "units": [
        {"id": "unit_4", "content": "Fajr - Dawn prayer", "spans": [{"text": "Fajr - Dawn prayer", "type": "text"}]},
        {"id": "unit_5", "content": "Dhuhr - Midday prayer", "spans": [{"text": "Dhuhr - Midday prayer", "type": "text"}]},
        {"id": "unit_6", "content": "Asr - Afternoon prayer", "spans": [{"text": "Asr - Afternoon prayer", "type": "text"}]},
        {"id": "unit_7", "content": "Maghrib - Sunset prayer", "spans": [{"text": "Maghrib - Sunset prayer", "type": "text"}]},
        {"id": "unit_8", "content": "Isha - Night prayer", "spans": [{"text": "Isha - Night prayer", "type": "text"}]}
      ],
      "metadata": {"ordered": false}
    }
  ]
}
```

---

## Query Parameters

### Get All Topics
```http
GET /api/v1/topic?page=1&limit=10&sort=-createdAt&search=salah
```

Parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sort` - Sort field (prefix with - for descending)
- `search` - Search in title, summary, wikiContent
- `status` - Filter by status (draft, published, archived)
- `isFeatured` - Filter featured topics (true/false)

---

## Response Format

All endpoints return this format:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message",
  "data": {...},
  "meta": {  // For paginated responses
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

Error format:

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Topic not found",
  "errorDetails": {...}
}
```

---

## Tips

### Creating Hierarchies
1. Create root topic first (no parentId)
2. Create child topics with parentId set to parent's custom ID
3. System auto-calculates: path, level
4. Use `/children` or `/subtree` endpoints to navigate

### Working with Versions
1. Initial create = v1 automatically
2. Use PUT `/content` to create new versions
3. Each version is a complete snapshot
4. Use GET `/versions` to see history
5. Use GET `/versions/:versionId` to view specific version

### Best Practices
- Always include `summary` for better cards/previews
- Use `wikiContent` for markdown representation
- Structure content with contentBlocks for rich editing
- Keep references inline in content for better context
- Use `status: "draft"` while editing, publish when ready

---

**Need help?** Check `MIGRATION_SUMMARY.md` for detailed examples!
