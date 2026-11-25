# Social Updates content

Add new Atom social-media archive entries to `data/social-updates.json`.

Each entry uses this structure:

```json
{
  "id": "unique-entry-id",
  "category": "posts",
  "platform": "Instagram",
  "mediaType": "reel",
  "publicationDate": "2026-11-25",
  "archiveDate": "2026-11-26",
  "title": "Short title",
  "description": "Short context or description",
  "image": "1. assets/Social Updates/Posts/example.jpg",
  "imageAlt": "Description of the image",
  "url": "https://www.instagram.com/p/...",
  "likes": 12500,
  "comments": 320,
  "replies": 18,
  "views": 85000
}
```

Allowed categories:
- `posts` — Atom's Instagram feed posts, carousels and Reels (Stories will be added in a later phase).
- `interactions` — comments, replies, likes and reposts.
- `fan-moments` — public moments and interactions involving fans.

Platforms may include Instagram, TikTok, X, Facebook, Weibo, YouTube, Threads or another platform. The platform filter automatically includes any platform used in the entries.

Dates:
- `publicationDate` is the date the original post or interaction happened. This date powers the period filter.
- `archiveDate` is the date the fanbase added the item to this archive.
- Use the format `YYYY-MM-DD`. The older `date` field is still accepted as a fallback.

Use a unique `id`. The image and URL are optional. Keep the original post link whenever available. Do not add livestreams here; those belong in Re:Peach.

## Instagram feed archive

For the first Instagram phase, archive feed posts and Reels only. Do not add Stories yet.

Optional fields supported by Social Updates cards:
- `mediaType`: `post` or `reel`.
- `image` or `thumbnail`: preview image URL or repository asset path.
- `likes`, `comments`, `replies`, `views`: engagement counts, only when verified and available.
- Alternatively, engagement counts can be grouped under `metrics`, for example `"metrics": {"likes": 120, "comments": 8}`.

Do not estimate missing engagement metrics. Leave unavailable values out. Counts are snapshots from the time they were checked and may change on the original platform.