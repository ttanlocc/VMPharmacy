# TDR – Technical Design Requirements

## Architecture Overview
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Next.js   │────▶│   Vercel    │────▶│  Supabase   │
│     PWA     │     │   Hosting   │     │  Backend    │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js + React | Fast, PWA support |
| Hosting | Vercel | Free, auto-deploy |
| Database | Supabase (PostgreSQL) | Free tier, realtime |
| Storage | Supabase Storage | Ảnh thuốc, integrated |
| Auth | Supabase Auth | Simple, secure |

## Data Schema

```sql
drug_groups (id, name)

drugs (id, name, unit, unit_price, image_url, group_id)

templates (id, name, created_at)

template_items (id, template_id, drug_id, quantity, note)
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/drugs` | CRUD thuốc |
| GET/POST | `/api/templates` | CRUD đơn mẫu |
| POST | `/api/upload` | Upload ảnh |

## Performance Requirements
- First load: < 3s
- Image size: < 200KB (WebP)
- Offline: Basic PWA caching

## Security
- Row Level Security (Supabase)
- Auth required for all writes
- Image upload validation

## Cost Projection

| Phase | Monthly Cost |
|-------|--------------|
| MVP | $0 |
| Production | $0-25 |
| Scale | $25-50 |
