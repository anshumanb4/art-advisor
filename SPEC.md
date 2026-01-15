# Art Advisor (AA) - Product Specification

## Overview

Art Advisor is a mobile-first web application that helps users discover their art preferences through an intuitive swipe-based interface, builds a personal collection, and provides personalized recommendations for contemporary art.

---

## Goals

1. **Taste Discovery** - Help users understand their artistic preferences through interactive exploration
2. **Collection Building** - Allow users to curate a personal collection of liked artworks
3. **Personalized Recommendations** - Generate tailored art suggestions based on learned preferences
4. **Art Education** - Expose users to diverse contemporary art from reputable sources

---

## Core Features

### 1. Art Discovery (Swipe Interface)

**Description:** A Tinder-style card interface for browsing artworks.

**Behavior:**
- Display one artwork at a time in a large, prominent format
- Support left swipe (dislike/pass) and right swipe (like)
- Also support tap-to-like and tap-to-pass buttons for accessibility
- Continue showing new artworks until user presses "Done"
- Show subtle swipe feedback (card tilt, color overlay)

**Art Display Requirements:**
- Artwork image takes up majority of viewport (70-80% height)
- Image displayed in wide/landscape-optimized format when possible
- High-resolution images preferred
- Metadata displayed below/overlaid on image:
  - Artist name (prominent)
  - Artwork title (italicized)
  - Year created
  - Medium/Type (painting, sculpture, graphic art)

**Art Sources (Discovery Phase):**
- Open APIs and public domain collections:
  - Metropolitan Museum of Art API (free, extensive collection)
  - Art Institute of Chicago API (free, high-quality images)
  - Rijksmuseum API (free, European masters)
  - Harvard Art Museums API (free with key)
  - WikiArt (contemporary and modern art)

### 2. Collection

**Description:** A personal gallery of all liked artworks.

**Features:**
- Grid view of all liked pieces (thumbnail format)
- Tap to view full artwork details
- Ability to remove pieces from collection
- Sort/filter options:
  - By date added
  - By artist
  - By medium
  - By era/period
- Share individual pieces or entire collection

### 3. Taste Profile & Summary

**Description:** AI-generated analysis of user's art preferences.

**Generated After:**
- Completing a swipe session (pressing "Done")
- Minimum threshold: 10+ artworks swiped for meaningful analysis

**Summary Includes:**
- Preferred art movements/styles (e.g., Impressionism, Abstract, Contemporary)
- Color palette preferences (warm/cool, vibrant/muted)
- Subject matter trends (portraits, landscapes, abstract, etc.)
- Preferred mediums (painting, sculpture, graphic art)
- Notable artists user gravitates toward
- Descriptive paragraph summarizing overall taste

**Taste Profile Updates:**
- Refines with each swipe session
- Weighted toward recent activity
- User can reset/start fresh if desired

### 4. Fresh Recommendations

**Description:** Personalized contemporary art recommendations based on taste profile.

**Behavior:**
- User taps "Get Fresh Recommendations" button
- System uses taste profile to query contemporary art sources
- Returns curated selection matching user preferences
- Presented in same swipe interface (can add to collection)

**Recommendation Sources:**
- **Artsy.net** (primary - contemporary galleries and artists)
- Saatchi Art
- Artnet
- Gallery websites with public APIs
- Contemporary museum collections

**Matching Criteria:**
- Similar artists to those liked
- Matching art movements/styles
- Color palette alignment
- Medium preferences
- Price range (if applicable for purchasable art)

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         LANDING PAGE                            │
│                                                                 │
│                    "Discover Your Art Taste"                    │
│                                                                 │
│                      [Start Exploring]                          │
│                      [View Collection]                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DISCOVERY MODE                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │                                                           │  │
│  │                    [ARTWORK IMAGE]                        │  │
│  │                      (swipeable)                          │  │
│  │                                                           │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│            Artist Name                                          │
│            "Artwork Title" (Year)                               │
│            Medium                                               │
│                                                                 │
│         [✗ Pass]                    [♥ Like]                    │
│                                                                 │
│                        [Done]                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (on "Done")
┌─────────────────────────────────────────────────────────────────┐
│                     SESSION SUMMARY                             │
│                                                                 │
│  "You liked 12 out of 35 artworks"                              │
│                                                                 │
│  Your Taste Profile:                                            │
│  ─────────────────────                                          │
│  You're drawn to bold, expressive works with rich color         │
│  palettes. Your preferences lean toward Abstract                │
│  Expressionism and Contemporary painting, with a particular     │
│  affinity for artists like [Artist A] and [Artist B]...         │
│                                                                 │
│  Preferred Styles: Abstract, Contemporary                       │
│  Preferred Mediums: Painting, Mixed Media                       │
│  Color Tendency: Warm, Saturated                                │
│                                                                 │
│         [View Collection]    [Get Fresh Recommendations]        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRESH RECOMMENDATIONS                        │
│                                                                 │
│  "Based on your taste, you might love these..."                 │
│                                                                 │
│  [Same swipe interface with contemporary art from Artsy, etc.]  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Model

### User
```
User {
  id: string
  createdAt: timestamp
  tasteProfile: TasteProfile
  collection: Artwork[]
  swipeHistory: SwipeEvent[]
}
```

### Artwork
```
Artwork {
  id: string
  title: string
  artist: string
  year: number | string
  medium: string (painting | sculpture | graphic art | mixed media | other)
  imageUrl: string
  thumbnailUrl: string
  source: string (met | artic | artsy | etc.)
  sourceUrl: string (link to original)
  movements: string[] (impressionism, abstract, etc.)
  colors: string[] (dominant colors extracted)
  description: string (optional)
}
```

### TasteProfile
```
TasteProfile {
  preferredMovements: { movement: string, weight: number }[]
  preferredMediums: { medium: string, weight: number }[]
  preferredSubjects: { subject: string, weight: number }[]
  colorPreferences: { palette: string, weight: number }[]
  favoriteArtists: string[]
  summary: string (AI-generated prose)
  lastUpdated: timestamp
}
```

### SwipeEvent
```
SwipeEvent {
  artworkId: string
  liked: boolean
  timestamp: timestamp
  sessionId: string
}
```

---

## Technical Architecture

### Frontend
- **Framework:** React (Next.js) or Vue (Nuxt) for SSR/mobile optimization
- **Styling:** Tailwind CSS for responsive mobile-first design
- **Gestures:** Hammer.js or react-swipeable for touch interactions
- **State:** Local storage for guest users, sync to backend for registered users

### Backend
- **API:** Node.js/Express or Next.js API routes
- **Database:** PostgreSQL or MongoDB for user data
- **AI/ML:**
  - OpenAI API for generating taste summaries
  - Simple scoring algorithm for taste profile building
- **Caching:** Redis for API response caching

### External APIs

| Source | API Type | Auth | Notes |
|--------|----------|------|-------|
| Metropolitan Museum | REST | None | Free, 400k+ objects |
| Art Institute Chicago | REST | None | Free, high-quality |
| Rijksmuseum | REST | API Key | Free tier available |
| Harvard Art Museums | REST | API Key | Free tier available |
| Artsy | REST/GraphQL | OAuth | For contemporary art |
| WikiArt | Unofficial | None | Scraping may be needed |

---

## UI/UX Guidelines

### Mobile-First Principles
- Minimum touch target: 44x44px
- Full-width cards on mobile
- Thumb-friendly button placement
- Fast image loading (progressive/lazy load)
- Offline support for collection viewing

### Visual Hierarchy
1. **Artwork image** - Hero element, maximum visibility
2. **Artist name** - Secondary prominence
3. **Title & year** - Tertiary
4. **Action buttons** - Clear but not distracting

### Swipe Interactions
- Smooth 60fps animations
- Visual feedback during swipe (rotation, opacity)
- Undo last swipe option
- Haptic feedback on mobile (if supported)

### Color Scheme
- Neutral background (white/off-white or dark mode)
- Let artwork colors dominate
- Accent color for CTAs (subtle, not competing with art)

---

## MVP Scope (Phase 1)

### Included
- [ ] Landing page with "Start Exploring" CTA
- [ ] Swipe interface with artwork cards
- [ ] Integration with 2-3 free art APIs (Met, Art Institute Chicago)
- [ ] Local storage for collection (no account required)
- [ ] Basic taste summary generation
- [ ] Collection gallery view
- [ ] "Done" button to end session

### Deferred to Phase 2
- [ ] User accounts and cloud sync
- [ ] Artsy integration for fresh recommendations
- [ ] Advanced taste profile analytics
- [ ] Social sharing features
- [ ] Price/purchase integration
- [ ] Artist deep-dives

---

## Success Metrics

1. **Engagement:** Average swipes per session (target: 20+)
2. **Return Rate:** Users returning within 7 days (target: 30%)
3. **Collection Size:** Average pieces saved (target: 10+)
4. **Recommendation Accuracy:** Likes on recommended art (target: 40%+)

---

## Open Questions

1. **Authentication:** Guest-only for MVP, or optional accounts?
2. **Art Curation:** Fully algorithmic, or human-curated seed sets?
3. **Artsy Access:** API access approval needed - fallback sources?
4. **Monetization:** Future consideration for affiliate links to purchase art?
5. **Content Moderation:** How to handle NSFW classical art (nudity in classical works)?

---

## Appendix: API Examples

### Metropolitan Museum of Art
```
GET https://collectionapi.metmuseum.org/public/collection/v1/objects/[id]

Response:
{
  "objectID": 45734,
  "title": "Sunflowers",
  "artistDisplayName": "Vincent van Gogh",
  "objectDate": "1887",
  "medium": "Oil on canvas",
  "primaryImage": "https://..."
}
```

### Art Institute of Chicago
```
GET https://api.artic.edu/api/v1/artworks/[id]?fields=id,title,artist_title,date_display,medium_display,image_id

Response:
{
  "data": {
    "id": 27992,
    "title": "A Sunday on La Grande Jatte",
    "artist_title": "Georges Seurat",
    "date_display": "1884-86",
    "medium_display": "Oil on canvas",
    "image_id": "..."
  }
}
```

---

*Last Updated: January 2026*
*Version: 1.0 Draft*
