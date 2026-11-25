# Social Updates content

Add new Atom social-media archive entries to `data/social-updates.json`.

Each entry uses this structure:

```json
{
  "id": "unique-entry-id",
  "category": "posts",
  "date": "2026-11-25",
  "platform": "Instagram",
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

Use a unique `id`. The image and URL are optional. Keep the original post link whenever available. Do not add livestreams here; those belong in Re:Peach.
