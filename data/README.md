# Social Updates content

Add new Atom social-media archive entries to `data/social-updates.json`.

Each entry uses this structure:

```json
{
  "id": "unique-entry-id",
  "category": "posts",
  "platform": "Instagram",
  "publicationDate": "2026-11-25",
  "archiveDate": "2026-11-26",
  "title": "Short title",
  "description": "Short context or description",
  "image": "1. assets/Social Updates/Posts/example.jpg",
  "imageAlt": "Description of the image",
  "url": "https://www.instagram.com/p/..."
}
```

Allowed categories:
- `posts` — Atom's posts, photos, carousels and videos.
- `interactions` — comments, replies, likes and reposts.
- `fan-moments` — public moments and interactions involving fans.

Platforms may include Instagram, TikTok, X, Facebook, Weibo, YouTube, Threads or another platform. The platform filter automatically includes any platform used in the entries.

Dates:
- `publicationDate` is the date the original post or interaction happened. This date powers the period filter.
- `archiveDate` is the date the fanbase added the item to this archive.
- Use the format `YYYY-MM-DD`. The older `date` field is still accepted as a fallback.

Use a unique `id`. The image and URL are optional. Keep the original post link whenever available. Do not add livestreams here; those belong in Re:Peach.
