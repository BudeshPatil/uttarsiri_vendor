# Uttar Siri — Vendor Portal

Professional grocery supplier portal (Vite + React) for vendor registration, catalogue management, orders, inventory and reports.

## Stack

- Vite 6 + React 18 + React Router 7 + Tailwind
- JWT auth via existing `/api/auth/login`
- Vendor APIs under `/api/vendors/*`
- UI languages: English, Kannada, Hindi

## Scripts

```bash
npm install
npm run dev      # http://localhost:4303
npm run build
```

## Environment

`VITE_API_BASE_URL=http://localhost:5004/api`  
`VITE_APP_NAME=Uttar Siri Vendor`

## Flow

1. Register at `/signup` → `POST /vendors/register` (status `pending`).
2. Admin approves: `PUT /api/vendors/admin/:id/approve`.
3. Sign in at `/signin` → approved vendors access Dashboard, Products, Orders, Inventory, Reports, Profile.
4. Suspended vendors can sign in but only see the status gate (business APIs blocked).

## Modules

| Area | Notes |
|------|--------|
| Products | Multilingual names/descriptions, variants, images (URL), submit for admin approval |
| Orders | Vendor-scoped lines; accept → prepare → ready → dispatch (or reject) |
| Inventory | Stock updates, low-stock list, movement history |
| Reports | Sales, product performance, commission, settlement summary |

Ownership is enforced on the backend (`vendor_id`); the UI never trusts client-side scoping alone.
