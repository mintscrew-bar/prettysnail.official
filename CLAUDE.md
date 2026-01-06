# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**이쁜우렁이 (Pretty Snail)** is a Korean e-commerce brand website for HACCP-certified snail products. This is a Next.js 16 marketing site with heavy animation, storytelling elements, and a simple admin dashboard for managing products and promotions. The site showcases products and drives conversions through Naver Smart Store and Coupang.

**Tech Stack:**
- Next.js 16.0.10 (App Router)
- React 19.2.1 with React Compiler enabled
- TypeScript 5
- SCSS Modules for styling
- Tailwind CSS 4 (PostCSS)
- GSAP 3.14.2 with ScrollTrigger for animations
- Vercel Blob Storage for image uploads
- Korean fonts: Pretendard (variable) and memomentKkukKkuk

## Common Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint (Next.js flat config format)
```

**Note:** ESLint uses the new flat config format (`eslint.config.mjs`) with Next.js presets for core-web-vitals and TypeScript.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with metadata, fonts
│   ├── page.tsx                # Homepage with all sections and GSAP animations
│   ├── globals.scss            # Global styles, CSS variables, design tokens
│   ├── page.module.scss        # Homepage-specific SCSS modules
│   ├── admin/                  # Admin dashboard (client-side auth)
│   │   ├── layout.tsx          # Admin layout wrapper
│   │   ├── page.tsx            # Admin dashboard home
│   │   ├── login/              # Admin login page
│   │   ├── products/           # Product management
│   │   └── promotions/         # Promotion management
│   ├── products/               # Public product pages
│   │   ├── page.tsx            # Product listing
│   │   └── [id]/page.tsx       # Product detail
│   └── api/
│       └── upload/route.ts     # Image upload API (Vercel Blob)
├── components/
│   ├── Header.tsx              # Site header with navigation
│   ├── Header.module.scss
│   ├── Footer.tsx              # Site footer
│   └── Footer.module.scss
├── hooks/
│   └── useLocalStorage.ts      # localStorage hook with SSR safety
└── data/
    ├── promotions.ts           # Promotion/event cards data
    └── products.ts             # Product catalog data

public/
├── images/
│   ├── banner/                 # Hero section video and images
│   └── story/                  # Story section images (1.jpg, 2.jpg, etc.)
├── logo/                       # Brand logos (Asset *.png)
└── icons/                      # SVG icons
```

## Architecture & Code Patterns

### Route Structure

The app uses Next.js App Router with the following key routes:

**Public Routes:**
- `/` - Homepage with full marketing experience (GSAP animations, product showcase)
- `/products` - Product listing page
- `/products/[id]` - Individual product detail pages

**Admin Routes (client-side localStorage auth):**
- `/admin/login` - Admin login (credentials: admin/admin1234)
- `/admin` - Admin dashboard home
- `/admin/products` - Product management (CRUD operations)
- `/admin/promotions` - Promotion management (CRUD operations)

**API Routes:**
- `/api/upload` - POST endpoint for image uploads (uses Vercel Blob in production, base64 in development)

### Data Storage Pattern

**Two-tier storage strategy:**

1. **Static data** (`src/data/*.ts`): TypeScript files with interfaces and arrays
   - Used for initial data seeding
   - Committed to git
   - Comments indicate these should be replaced with CMS/API

2. **Runtime data** (`localStorage` via `useLocalStorage` hook):
   - Products and promotions can be created/edited/deleted via admin panel
   - Changes are persisted to localStorage
   - SSR-safe: checks `typeof window !== 'undefined'`
   - Initial load merges static data with localStorage data

**Key insight:** The app loads static data from TypeScript files, then overlays localStorage changes. Admin edits are stored in localStorage only, not in the TypeScript files.

### Homepage Component Structure

The homepage (`app/page.tsx`) is a **single client component** (~1000 lines) with multiple sub-components defined in the same file. This architecture was chosen for:
- Easier GSAP context sharing between sections
- Simpler state management for scroll animations
- Reduced prop drilling for shared animation refs

**Main sections in order:**

1. **Preloader** - Animated logo intro with GSAP timeline
2. **Header** - Now extracted to `src/components/Header.tsx` (sticky navigation with scroll state)
3. **MainBanner** - Hero section with parallax scroll, video background, ScrollTrigger pinning
4. **HookSection** - Horizontal scrolling promotion cards
5. **StorytellingSection** - Story steps with scroll-triggered animations
6. **ProductShowcase** - Filterable product grid with category tabs
7. **OutroSection** - CTA section for store links
8. **Footer** - Now extracted to `src/components/Footer.tsx`

**When adding new sections to homepage:** Add them as function components within `page.tsx` to maintain access to shared GSAP contexts and refs.

### Admin Panel Architecture

The admin panel uses **client-side only authentication**:
- Login credentials: `admin` / `admin1234` (hardcoded in `admin/login/page.tsx:33`)
- Auth state stored in localStorage as `admin-logged-in`
- No server-side session management
- Each admin page checks auth in `useEffect` and redirects to `/admin/login` if not authenticated

**Admin pages pattern:**
```typescript
useEffect(() => {
  const isLoggedIn = localStorage.getItem('admin-logged-in');
  if (isLoggedIn !== 'true') {
    router.push('/admin/login');
  }
}, [router]);
```

**Data management in admin:**
- Uses `useLocalStorage` hook for CRUD operations
- Products: array with id, name, category, price, image, description
- Promotions: array with id, title, description, image, discount, period, link
- Changes persist to localStorage immediately

### Animation System (GSAP)

All animations use GSAP with ScrollTrigger. Key patterns:

- **Timeline animations**: Used for sequential entry animations (Preloader, MainBanner initial load)
- **ScrollTrigger.create**: For scroll-based interactions (pinning, opacity changes, reveal animations)
- **Context cleanup**: All GSAP animations use `gsap.context()` and return cleanup functions in `useEffect`
- **Scroll pinning**: MainBanner pins for 150% viewport height while overlay fades and content scales

Example pattern used throughout:
```typescript
useEffect(() => {
  const ctx = gsap.context(() => {
    // GSAP animations here
  }, sectionRef);

  return () => ctx.revert();
}, []);
```

### Image Upload System

**API Route:** `/api/upload` (POST)

**Dual-mode operation:**
1. **Production (Vercel)**: Uses `@vercel/blob` package to upload to Vercel Blob Storage
   - Requires `BLOB_READ_WRITE_TOKEN` environment variable (auto-set by Vercel)
   - Returns public URL: `https://blob.vercel-storage.com/...`

2. **Development (local)**: Falls back to base64 encoding
   - Converts file to base64 data URL
   - Returns data URL for localStorage storage
   - Console warning indicates development mode

**Validation:**
- File size limit: 10MB
- File type: images only (`image/*`)
- Error handling returns appropriate HTTP status codes

### Styling System

**Two-layer approach:**
1. **globals.scss**: CSS variables for design tokens (colors, spacing, typography, transitions)
2. **Module SCSS**: Component-scoped styles (e.g., `page.module.scss`, `Header.module.scss`)

**Design tokens (CSS variables):**
- Brand colors: Warm earth tones (olive green, terracotta, cream, gold)
- Spacing scale: xs → 2xl (0.5rem → 8rem)
- Typography scale: xs → hero (0.75rem → clamp(2.5rem, 8vw, 6rem))
- Consistent transitions: fast (0.2s), base (0.3s), slow (0.5s)

**Color palette:**
- Primary: `#5d7a4a` (olive green) - main brand color
- Secondary: `#a67c52` (terracotta brown)
- Accent: `#c9a66b` (warm gold)
- Background: `#fdfbf7` (warm off-white), `#f7f3eb` (cream)
- Text: `#3d3a35` (warm charcoal)

### TypeScript Configuration

- **Path alias**: `@/*` maps to `./src/*`
- **Target**: ES2017
- **JSX**: `react-jsx` (React 19 automatic runtime)
- **Strict mode**: Enabled
- **React Compiler**: Enabled in `next.config.ts` (automatic memoization)
- **Module resolution**: `bundler` (Next.js optimized)

## Key Implementation Details

### Responsive Design
- Mobile menu button in header (not fully implemented - only UI exists)
- Carousel navigation for promotion cards on mobile
- CSS `clamp()` for fluid typography
- GSAP handles different screen sizes in ScrollTrigger with media queries

### Korean Language
- Site language: `ko` (set in `<html lang="ko">`)
- Primary font: Pretendard Variable (loaded from CDN)
- Decorative font: memomentKkukKkuk (loaded via @font-face)
- All content is in Korean

### Performance Considerations
- React Compiler enabled for automatic memoization
- Video poster image provided for hero section
- GSAP ScrollTrigger uses `scrub`, `anticipatePin` for smooth scrolling
- Cleanup of ScrollTrigger instances on unmount to prevent memory leaks

## Development Workflows

### Adding New Products (via Admin UI)
1. Navigate to `/admin/login` and log in (admin/admin1234)
2. Go to `/admin/products`
3. Click "제품 추가" (Add Product)
4. Fill form and upload image (uses `/api/upload`)
5. Data saves to localStorage under `prettysnail-products` key

### Adding New Products (via Code)
Edit `src/data/products.ts`:
```typescript
export const products: Product[] = [
  {
    id: 'unique-id',
    name: '제품명',
    category: 'snail' | 'soup' | 'sauce' | 'set',
    price: 15000,
    image: '/images/products/image.jpg',
    description: '제품 설명...'
  }
];
```

### Adding New Promotions
Similar to products - either via admin UI at `/admin/promotions` or edit `src/data/promotions.ts`.

### Adding New Animations to Homepage
1. Import `gsap` and `ScrollTrigger` at top of `app/page.tsx`
2. Use `gsap.registerPlugin(ScrollTrigger)` at component level
3. Wrap animations in `gsap.context()` within `useEffect`
4. Return cleanup function: `() => ctx.revert()`

### Modifying Design Tokens
Edit CSS variables in `src/app/globals.scss` under the `:root` selector. Changes will cascade to all components using the variables.

### Working with Images
**Upload via admin:**
- Uses `/api/upload` endpoint
- Returns URL (Blob Storage in prod, base64 in dev)

**Static images:**
- Place in `public/` directory
- Reference as `/images/...` in code
- Logo variations: `public/logo/Asset *.png`
- Hero video: `public/images/banner/farm.mp4`
- Story images: `public/images/story/{1-4}.jpg`

## Deployment

### Vercel Deployment
See `DEPLOYMENT.md` for detailed instructions. Key steps:

1. Connect GitHub repo to Vercel
2. Create Vercel Blob Storage instance
3. Environment variable `BLOB_READ_WRITE_TOKEN` auto-set by Vercel
4. Push to main branch triggers automatic deployment

### Local Development
- No environment variables required
- Image uploads use base64 fallback
- localStorage persists across browser sessions
- Auth state cleared on browser close (sessionStorage would be better)

## Known Limitations & TODOs

**Security:**
- Admin authentication is client-side only (localStorage)
- Credentials are hardcoded in source code
- No CSRF protection
- No rate limiting on upload endpoint

**Data Persistence:**
- localStorage is browser-specific and not shared across devices
- No database or CMS integration
- Admin changes don't sync to git repository
- Data loss risk if localStorage is cleared

**Features:**
- Mobile menu button exists but drawer/menu not implemented
- Some promotion/product links point to `#` placeholders
- Contact information uses placeholder values
- Store links (Naver, Coupang) are not fully connected
- No search functionality for products
- No shopping cart (redirects to external stores)

**Performance:**
- Large base64 images in localStorage can slow down admin panel
- No image optimization/compression before upload
- GSAP animations can be heavy on low-end devices
