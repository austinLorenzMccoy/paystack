# Frontend Product Requirements Document
## x402Pay - Bitcoin Creator Monetization SDK
### Landing Page & Dashboard Experience

---

## 1. DESIGN PHILOSOPHY

### Aesthetic Direction: **"Bitcoin Brutalist"**

A bold fusion of:
- **Brutalist Architecture**: Raw, unapologetic, geometric structures
- **Bitcoin Orange**: Dominant use of #F7931A (Bitcoin orange) with high contrast
- **Monospaced Typography**: Code-first, technical aesthetic
- **Stacks Purple Accents**: #5546FF for CTAs and highlights
- **Concrete Textures**: Industrial backgrounds, rough edges, honest materials
- **Sharp Angles**: No rounded corners - everything at 0deg or 45deg angles

**Key Differentiators:**
- NO gradient backgrounds
- NO rounded corners (everything square/angular)
- Monospaced fonts for headings (JetBrains Mono, IBM Plex Mono)
- High contrast black/white with strategic orange/purple punches
- Grid-based layout with intentional breaks
- Heavy use of borders and dividers
- Terminal/CLI aesthetic in interactive elements

**Inspiration References:**
- Brutalist web design movement
- Bitcoin Core UI
- Terminal interfaces
- Swiss typography
- Bauhaus geometric art

---

## 2. DESIGN SYSTEM

### Color Palette

```css
:root {
  /* Primary */
  --bitcoin-orange: #F7931A;
  --stacks-purple: #5546FF;
  
  /* Neutrals */
  --black: #000000;
  --charcoal: #1A1A1A;
  --concrete: #2D2D2D;
  --slate: #4A4A4A;
  --fog: #E0E0E0;
  --white: #FFFFFF;
  
  /* Accents */
  --success-green: #00FF41;
  --warning-yellow: #FFD700;
  --error-red: #FF3B30;
  
  /* Gradients (ONLY for backgrounds, never buttons) */
  --noise-overlay: url("data:image/svg+xml,..."); /* Grain texture */
  --grid-pattern: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 1px,
    var(--concrete) 1px,
    var(--concrete) 2px
  );
}
```

### Typography System

```css
/* Font Stack */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

:root {
  /* Display - Monospaced, technical */
  --font-display: 'JetBrains Mono', 'Courier New', monospace;
  
  /* Body - Clean, readable */
  --font-body: 'IBM Plex Sans', -apple-system, system-ui, sans-serif;
  
  /* Code - Inline code snippets */
  --font-code: 'JetBrains Mono', monospace;
  
  /* Sizes */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */
  --text-6xl: 3.75rem;    /* 60px */
  --text-7xl: 4.5rem;     /* 72px */
  
  /* Line Heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### Spacing System (8px base)

```css
:root {
  --space-1: 0.5rem;   /* 8px */
  --space-2: 1rem;     /* 16px */
  --space-3: 1.5rem;   /* 24px */
  --space-4: 2rem;     /* 32px */
  --space-5: 2.5rem;   /* 40px */
  --space-6: 3rem;     /* 48px */
  --space-8: 4rem;     /* 64px */
  --space-10: 5rem;    /* 80px */
  --space-12: 6rem;    /* 96px */
  --space-16: 8rem;    /* 128px */
}
```

### Component Styles

**Buttons:**
```css
.btn-primary {
  background: var(--bitcoin-orange);
  color: var(--black);
  font-family: var(--font-display);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: var(--space-3) var(--space-4);
  border: 3px solid var(--black);
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
}

.btn-primary:hover {
  transform: translate(-4px, -4px);
  box-shadow: 4px 4px 0 var(--black);
}

.btn-secondary {
  background: transparent;
  color: var(--white);
  border: 2px solid var(--stacks-purple);
  /* Same hover effect */
}
```

**Cards:**
```css
.card {
  background: var(--charcoal);
  border: 2px solid var(--slate);
  padding: var(--space-4);
  position: relative;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--bitcoin-orange);
}

.card:hover {
  border-color: var(--bitcoin-orange);
}
```

**Inputs:**
```css
.input {
  background: var(--concrete);
  border: 2px solid var(--slate);
  color: var(--white);
  font-family: var(--font-display);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-base);
}

.input:focus {
  outline: none;
  border-color: var(--bitcoin-orange);
  box-shadow: 0 0 0 4px rgba(247, 147, 26, 0.1);
}
```

---

## 3. PAGE STRUCTURE & NAVIGATION

### Site Map

```
/                    → Landing Page
├── /docs            → Documentation (external link)
├── /pricing         → Pricing (future)
└── /dashboard       → Authenticated Area
    ├── /overview    → Main dashboard
    ├── /analytics   → Revenue analytics
    ├── /content     → Content management
    ├── /payments    → Payment history
    └── /settings    → Settings (in sidebar)
```

### Navigation Components

**Landing Page Header:**
- Logo (left)
- Nav Links (center): Docs, Pricing, GitHub
- CTA Button (right): "Launch Dashboard"
- Sticky on scroll with backdrop blur

**Dashboard Sidebar:**
- Collapsible (localStorage persistence)
- Icons + Labels
- Active state highlighting
- Collapse toggle at bottom
- Responsive: Overlay on mobile

**Dashboard Header:**
- Breadcrumbs
- User avatar/wallet address
- Network indicator (Testnet/Mainnet)
- "Back to Home" link (top right)

---

## 4. LANDING PAGE DETAILED SPEC

### Hero Section

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  [LOGO]              Docs  Pricing  GitHub  [DASHBOARD]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Background: Stacks blockchain image           │  │
│  │    Overlay: Dark gradient (rgba(0,0,0,0.85))     │  │
│  │    Noise texture overlay                          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│              ONE LINE OF CODE.                         │
│           BITCOIN-NATIVE PAYMENTS.                     │
│        CREATOR-FIRST MONETIZATION.                     │
│                                                         │
│       [ GET STARTED ]    [ VIEW DOCS ]                 │
│                                                         │
│  $ npm install @x402pay/sdk                           │
│  ┌──────────────────────────────────────────┐         │
│  │ // Add payment to any content             │         │
│  │ <PaywallButton                             │         │
│  │   contentId="article-1"                    │         │
│  │   price={0.10}                             │         │
│  │   asset="STX"                              │         │
│  │ />                                         │         │
│  └──────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

**Specs:**
- **Height:** 100vh
- **Background:** 
  - Image: Stacks blockchain (provided URL)
  - Overlay: `linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.8) 100%)`
  - Noise texture: 5% opacity
- **Typography:**
  - H1: 72px JetBrains Mono, 800 weight, uppercase, letter-spacing: 0.05em
  - Each line in different color: Orange, Purple, White
  - Animation: Stagger in from left (0.2s delay between lines)
- **Code Block:**
  - Terminal-style box
  - Blinking cursor animation
  - Syntax highlighting
  - Copy button (top right)

### Features Section

**Layout: 3-Column Grid**

```
┌─────────────────────────────────────────────────────────┐
│              WHY PAYSTACK WINS                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐           │
│  │    🟠    │    │    🟣    │    │    ⚡    │           │
│  │ BITCOIN  │    │ CLARITY  │    │   AI    │           │
│  │ NATIVE   │    │ CONTRACTS│    │ AGENTS  │           │
│  │          │    │          │    │         │           │
│  │ Accept   │    │ Program  │    │ Tap into│           │
│  │ sBTC...  │    │ revenue..│    │ agent...│           │
│  └─────────┘    └─────────┘    └─────────┘           │
└─────────────────────────────────────────────────────────┘
```

**Specs:**
- Each card has orange top border
- Hover: Lift effect + box shadow
- Icon: Large, monochrome
- Title: JetBrains Mono, uppercase
- Body: IBM Plex Sans, 16px
- CTA link at bottom of each card

### How It Works Section

**Layout: Stepped Timeline**

```
┌─────────────────────────────────────────────────────────┐
│           GET STARTED IN 3 STEPS                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [1] ───────────────────┐                              │
│  INSTALL SDK            │                              │
│  $ npm install...       │                              │
│                         │                              │
│                         └──→ [2] ─────────────────┐    │
│                              CONFIGURE PAYMENTS    │    │
│                              <PaywallButton...     │    │
│                                                    │    │
│                                                    └──→ [3]
│                                                         EARN
│                                                         💰
└─────────────────────────────────────────────────────────┘
```

**Specs:**
- Diagonal flow (left → right, descending)
- Connecting lines with animated dots
- Code snippets in terminal boxes
- Sticky scroll animation (steps reveal on scroll)

### Stats Section

**Layout: Full-width bar with 4 metrics**

```
┌─────────────────────────────────────────────────────────┐
│  $10K+        50+           20%            100%        │
│  Revenue      Creators      AI Payments    Uptime      │
└─────────────────────────────────────────────────────────┘
```

**Specs:**
- Background: Black with grid pattern
- Numbers: 60px JetBrains Mono, orange
- Labels: 14px IBM Plex Sans, white
- Counter animation on scroll into view

### CTA Section

**Layout: Centered, high contrast**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│         READY TO MONETIZE YOUR CONTENT?                │
│                                                         │
│              [ LAUNCH DASHBOARD ]                      │
│                                                         │
│         or explore our documentation first             │
└─────────────────────────────────────────────────────────┘
```

**Specs:**
- Background: Bitcoin orange
- Text: Black
- Large button with hover lift
- Secondary link below

### Footer

**Layout: 3-column**

```
┌─────────────────────────────────────────────────────────┐
│  PAYSTACK              PRODUCT          COMMUNITY       │
│  Bitcoin Creator       Dashboard        Twitter         │
│  SDK                   Docs             GitHub          │
│                        Pricing          Discord         │
│                                                         │
│  © 2026 x402Pay. Built on Stacks.                    │
└─────────────────────────────────────────────────────────┘
```

---

## 5. DASHBOARD DETAILED SPEC

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR  │  HEADER (Breadcrumbs, User, Back to Home) │
│           ├─────────────────────────────────────────────┤
│  [≡]      │                                            │
│           │                                            │
│  Overview │          MAIN CONTENT AREA                 │
│  Analytics│                                            │
│  Content  │                                            │
│  Payments │                                            │
│  Settings │                                            │
│           │                                            │
│           │                                            │
│  [<]      │                                            │
└───────────┴─────────────────────────────────────────────┘
```

### Sidebar Specifications

**States:**
- **Expanded:** 280px width, icons + full labels
- **Collapsed:** 80px width, icons only
- **Mobile:** Overlay drawer from left

**Features:**
- Smooth animation (300ms ease-in-out)
- Active page: Orange left border (4px)
- Hover: Background color change
- Collapse toggle at bottom
- LocalStorage persistence: `x402pay_sidebar_collapsed`

**Component Structure:**
```tsx
<aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
  <nav>
    <NavItem icon={<HomeIcon />} label="Overview" href="/dashboard" />
    <NavItem icon={<ChartIcon />} label="Analytics" href="/dashboard/analytics" />
    <NavItem icon={<FileIcon />} label="Content" href="/dashboard/content" />
    <NavItem icon={<DollarIcon />} label="Payments" href="/dashboard/payments" />
    
    {/* Collapsible Section */}
    <CollapsibleSection title="Settings">
      <NavItem icon={<UserIcon />} label="Profile" href="/dashboard/settings/profile" />
      <NavItem icon={<KeyIcon />} label="API Keys" href="/dashboard/settings/api" />
      <NavItem icon={<BellIcon />} label="Notifications" href="/dashboard/settings/notifications" />
    </CollapsibleSection>
  </nav>
  
  <button className="collapse-toggle" onClick={toggleSidebar}>
    {collapsed ? <ChevronRight /> : <ChevronLeft />}
  </button>
</aside>
```

**Animations:**
```css
.sidebar {
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item {
  transition: all 200ms ease;
}

.nav-item:hover {
  background: var(--concrete);
  padding-left: calc(var(--space-3) + 4px);
}

.collapsible-section {
  overflow: hidden;
}

.collapsible-content {
  max-height: 0;
  opacity: 0;
  transition: max-height 300ms ease, opacity 200ms ease;
}

.collapsible-content.open {
  max-height: 500px;
  opacity: 1;
}
```

### Dashboard Header

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Home > Dashboard > Overview         [Testnet] [@0x...] │
└─────────────────────────────────────────────────────────┘
```

**Specs:**
- Height: 64px
- Border bottom: 2px solid slate
- Breadcrumbs: Left side
- Network indicator: Badge with colored dot
- Wallet address: Truncated (0x1234...5678)
- "Back to Home" link: Top right corner

### Overview Page Content

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  OVERVIEW                               Last 30 Days ▼  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ $1,234   │  │   156    │  │   23%    │            │
│  │ Revenue  │  │ Payments │  │ AI Agent │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │      REVENUE CHART                              │   │
│  │                                                  │   │
│  │      [Line chart showing revenue over time]     │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────────┐ │
│  │ TOP CONTENT         │  │ RECENT PAYMENTS         │ │
│  │ 1. Article A $45    │  │ 0x123... $0.10 STX      │ │
│  │ 2. API Call  $32    │  │ 0x456... $0.50 sBTC     │ │
│  └─────────────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Components:**

1. **Stat Cards** (3 cards)
   - Large number: 48px JetBrains Mono
   - Label: 14px uppercase
   - Orange accent on hover
   - Trend indicator (↑ 12% from last month)

2. **Revenue Chart**
   - Canvas-based line chart
   - Orange line for total revenue
   - Purple line for AI agent revenue
   - Grid background
   - Tooltip on hover

3. **Top Content Table**
   - Monospaced numbers
   - Ranking with orange badges
   - Click to view details

4. **Recent Payments List**
   - Truncated wallet addresses
   - Amount + asset
   - Time ago
   - Link to transaction on explorer

### Analytics Page

**Features:**
- Date range picker
- Revenue breakdown by asset (sBTC/STX/USDCx)
- Agent vs. Human comparison
- Geographic distribution map
- Export CSV button

### Content Page

**Features:**
- List of all monetized content
- Add new content button
- Edit pricing
- View access logs
- Copy embed code

### Payments Page

**Features:**
- Transaction history table
- Filters: Date, Asset, Status
- Search by transaction hash
- Export to CSV
- Pagination

### Settings Page (In Sidebar)

**Sections:**
1. **Profile**
   - Wallet address
   - Display name
   - Email (optional)
   - Avatar upload

2. **API Keys**
   - Generate new key
   - List existing keys
   - Revoke functionality
   - Copy to clipboard

3. **Revenue Contract**
   - Current contract address
   - Split configuration
   - Deploy new contract
   - View on explorer

4. **Notifications**
   - Email alerts for payments
   - Webhook URLs
   - Telegram integration

---

## 6. RESPONSIVE DESIGN

### Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  /* Sidebar → Overlay drawer */
  /* Single column layouts */
  /* Smaller typography */
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  /* Sidebar always collapsed */
  /* 2-column grids */
}

/* Desktop */
@media (min-width: 1025px) {
  /* Full sidebar */
  /* 3-column grids */
}
```

### Mobile Optimizations

**Landing Page:**
- Hero text: 36px → 24px
- Single column feature cards
- Stacked CTA buttons
- Simplified code snippets

**Dashboard:**
- Hamburger menu for sidebar
- Slide-in drawer from left
- Overlay backdrop
- Touch-friendly tap targets (min 44px)
- Horizontal scroll for tables

---

## 7. ANIMATIONS & MICRO-INTERACTIONS

### Page Load Animations

**Landing Page:**
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-title {
  animation: fadeInUp 0.6s ease-out;
}

.hero-subtitle {
  animation: fadeInUp 0.6s ease-out 0.2s backwards;
}

.hero-cta {
  animation: fadeInUp 0.6s ease-out 0.4s backwards;
}
```

**Dashboard:**
```css
/* Stagger stat cards */
.stat-card:nth-child(1) { animation-delay: 0s; }
.stat-card:nth-child(2) { animation-delay: 0.1s; }
.stat-card:nth-child(3) { animation-delay: 0.15s; }
```

### Hover Effects

**Buttons:**
- Translate + shadow on hover
- 150ms transition
- Color shift

**Cards:**
- Border color change
- Subtle lift (2px)
- 200ms ease

**Links:**
- Underline animation (left → right)
- Color transition

### Sidebar Animations

**Collapse/Expand:**
```tsx
const sidebarVariants = {
  expanded: { width: 280 },
  collapsed: { width: 80 }
};

const labelVariants = {
  visible: { opacity: 1, x: 0 },
  hidden: { opacity: 0, x: -10 }
};
```

**Collapsible Section:**
```css
.collapsible-toggle {
  transition: transform 200ms ease;
}

.collapsible-toggle.open {
  transform: rotate(90deg);
}
```

---

## 8. 404 PAGE

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                     404                                 │
│                                                         │
│              PAGE NOT FOUND                            │
│                                                         │
│     This page doesn't exist on the blockchain.         │
│                                                         │
│         [ BACK TO HOME ]  [ DASHBOARD ]                │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Specs:**
- Centered vertically and horizontally
- "404" in massive JetBrains Mono (120px)
- Orange color
- Animated glitch effect
- 2 CTA buttons
- Auto-redirect after 5 seconds (countdown timer)

**Animation:**
```css
@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

.error-code {
  animation: glitch 0.5s infinite;
}
```

---

## 9. ACCESSIBILITY (a11y)

### Requirements

- **Keyboard Navigation:** Full support, visible focus states
- **Screen Readers:** Proper ARIA labels, semantic HTML
- **Color Contrast:** WCAG AA compliant (4.5:1 minimum)
- **Alt Text:** All images and icons
- **Skip Links:** "Skip to main content"
- **Focus Trapping:** Modal overlays

### Implementation

```tsx
// Example: Accessible button
<button
  aria-label="Toggle sidebar"
  aria-expanded={!collapsed}
  aria-controls="main-sidebar"
>
  {collapsed ? <ChevronRight /> : <ChevronLeft />}
</button>

// Focus visible
.btn:focus-visible {
  outline: 3px solid var(--bitcoin-orange);
  outline-offset: 2px;
}
```

---

## 10. PERFORMANCE TARGETS

- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Lighthouse Score:** > 90
- **Bundle Size:** < 250kb (gzipped)

### Optimizations

- Code splitting per route
- Lazy load images (Intersection Observer)
- Prefetch critical assets
- Minimize CSS (use Tailwind + PurgeCSS)
- Web Workers for heavy computations
- Service Worker for offline caching

---

## 11. TECH STACK

### Framework
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**

### Styling
- **TailwindCSS** (custom config)
- **CSS Variables** (design tokens)
- **Framer Motion** (animations)

### Charts & Visualization
- **Recharts** or **Chart.js**
- **D3.js** (for custom charts)

### UI Components
- **Headless UI** (accessible primitives)
- **Radix UI** (dropdown, dialog, etc.)
- **React Icons** (icons)

### Stacks Integration
- **@stacks/connect-react** (wallet)
- **@stacks/transactions** (signing)
- **@stacks/network** (API calls)

### State Management
- **Zustand** (global state)
- **TanStack Query** (server state)

### Forms
- **React Hook Form**
- **Zod** (validation)

### Utilities
- **clsx** (conditional classes)
- **date-fns** (date formatting)
- **copy-to-clipboard** (copy buttons)

---

## 12. COMPONENT LIBRARY

### Core Components

1. **Button**
   - Variants: primary, secondary, ghost, danger
   - Sizes: sm, md, lg
   - States: default, hover, active, disabled, loading

2. **Card**
   - Default card with orange accent
   - Stat card (number + label)
   - Content card (image + text)

3. **Input**
   - Text, number, email, password
   - With/without icons
   - Error states
   - Helper text

4. **Select/Dropdown**
   - Custom styled
   - Searchable variant
   - Multi-select

5. **Modal/Dialog**
   - Centered overlay
   - Backdrop blur
   - Close on escape
   - Focus trap

6. **Table**
   - Sortable columns
   - Pagination
   - Row selection
   - Responsive (horizontal scroll on mobile)

7. **Tabs**
   - Underline animation
   - Keyboard navigation

8. **Toast/Notification**
   - Success, error, warning, info
   - Auto-dismiss
   - Action buttons

9. **Sidebar**
   - Collapsible
   - Nested navigation
   - Active state

10. **Breadcrumbs**
    - Chevron separators
    - Truncate long paths

---

## 13. USER FLOWS

### Flow 1: First-Time Visitor → Creator

1. Land on homepage
2. Read hero message
3. Scroll through features
4. Click "Launch Dashboard"
5. Connect Hiro Wallet (popup)
6. Redirect to /dashboard/overview
7. See onboarding checklist:
   - [ ] Deploy revenue contract
   - [ ] Add first content
   - [ ] Generate API key
8. Complete onboarding
9. View analytics

### Flow 2: Returning Creator → Check Revenue

1. Navigate to x402pay.xyz
2. Click "Launch Dashboard" (header)
3. Auto-login (wallet already connected)
4. View /dashboard/overview
5. See revenue stats updated
6. Click "Analytics" in sidebar
7. Filter by date range
8. Export CSV

### Flow 3: Settings Configuration

1. In dashboard, click "Settings" in sidebar
2. Sidebar stays open, shows nested items
3. Click "API Keys"
4. Click "Generate New Key"
5. Modal opens
6. Name key, select permissions
7. Confirm
8. Key displayed with copy button
9. Toast: "API key created successfully"

---

## 14. EDGE CASES & ERROR STATES

### No Wallet Connected
- Show modal: "Connect your Hiro Wallet to continue"
- CTA to install Hiro
- Fallback to view-only mode (limited features)

### Network Mismatch
- Banner: "Please switch to Stacks Testnet"
- Button to switch network

### No Content Yet
- Empty state illustration
- "You haven't monetized any content yet"
- CTA: "Add Your First Content"

### No Payments Yet
- Empty state: "No payments received yet"
- Share link to your content

### API Error
- Toast notification
- Retry button
- Error logged to console

### Slow Loading
- Skeleton screens for cards/tables
- Loading spinners
- Progress indicators

---

## 15. WIREFRAMES (ASCII)

### Landing Page (Full Page)

```
╔═══════════════════════════════════════════════════════════════╗
║ [LOGO]          Docs    Pricing    GitHub    [DASHBOARD] ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║     ┌─────────────────────────────────────────────────────┐   ║
║     │ Background: Stacks blockchain image (dark overlay)  │   ║
║     │                                                      │   ║
║     │          ONE LINE OF CODE.                          │   ║
║     │       BITCOIN-NATIVE PAYMENTS.                      │   ║
║     │    CREATOR-FIRST MONETIZATION.                      │   ║
║     │                                                      │   ║
║     │     [GET STARTED]      [VIEW DOCS]                  │   ║
║     │                                                      │   ║
║     │  $ npm install @x402pay/sdk                        │   ║
║     │  ┌────────────────────────────────────────┐        │   ║
║     │  │ <PaywallButton                         │        │   ║
║     │  │   contentId="article-1"                │        │   ║
║     │  │   price={0.10}                         │        │   ║
║     │  │ />                                     │        │   ║
║     │  └────────────────────────────────────────┘        │   ║
║     └─────────────────────────────────────────────────────┘   ║
╠═══════════════════════════════════════════════════════════════╣
║                 WHY PAYSTACK WINS                             ║
║                                                               ║
║  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      ║
║  │   [ICON]    │    │   [ICON]    │    │   [ICON]    │      ║
║  │             │    │             │    │             │      ║
║  │  BITCOIN    │    │  CLARITY    │    │  AI AGENT   │      ║
║  │  NATIVE     │    │  CONTRACTS  │    │  ECONOMY    │      ║
║  │             │    │             │    │             │      ║
║  │  Accept     │    │  Programmable│   │  Tap into   │      ║
║  │  sBTC, STX, │    │  revenue     │   │  agentic    │      ║
║  │  USDCx with │    │  splits with │   │  payments   │      ║
║  │  Bitcoin... │    │  Clarity...  │   │  from AI... │      ║
║  │             │    │             │    │             │      ║
║  │  [Learn More]│   │  [Learn More]│   │  [Learn More]│     ║
║  └─────────────┘    └─────────────┘    └─────────────┘      ║
╠═══════════════════════════════════════════════════════════════╣
║            GET STARTED IN 3 STEPS                             ║
║                                                               ║
║  [1] ────────────────────┐                                   ║
║  INSTALL SDK             │                                   ║
║  $ npm install @x402pay/sdk                                 ║
║                          │                                   ║
║                          └──→ [2] ──────────────────┐        ║
║                               CONFIGURE              │        ║
║                               app.use(x402payMw())  │        ║
║                                                      │        ║
║                                                      └──→ [3] ║
║                                                           EARN ║
║                                                           $$$  ║
╠═══════════════════════════════════════════════════════════════╣
║  ┌─────────────┬─────────────┬─────────────┬─────────────┐  ║
║  │   $10K+     │     50+     │     20%     │    100%     │  ║
║  │   Revenue   │   Creators  │ AI Payments │   Uptime    │  ║
║  └─────────────┴─────────────┴─────────────┴─────────────┘  ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║           READY TO MONETIZE YOUR CONTENT?                    ║
║                                                               ║
║                  [LAUNCH DASHBOARD]                          ║
║                                                               ║
║           or explore our documentation first                 ║
╠═══════════════════════════════════════════════════════════════╣
║  PAYSTACK         PRODUCT           COMMUNITY                ║
║  Bitcoin Creator  Dashboard         Twitter                  ║
║  SDK              Docs              GitHub                   ║
║                   Pricing           Discord                  ║
║                                                               ║
║  © 2026 x402Pay. Built on Stacks. MIT License.             ║
╚═══════════════════════════════════════════════════════════════╝
```

### Dashboard - Overview Page

```
╔═══════════════════════════════════════════════════════════════╗
║ ┌─────────┐ Home > Dashboard > Overview    [Testnet] [@0x...]║
║ │  [≡]    │                                                   ║
║ │         │ ────────────────────────────────────────────────  ║
║ │ Overview│                                                   ║
║ │ Analytics│  OVERVIEW              Last 30 Days [▼]         ║
║ │ Content │                                                   ║
║ │ Payments│  ┌──────────┐ ┌──────────┐ ┌──────────┐         ║
║ │         │  │  $1,234  │ │   156    │ │   23%    │         ║
║ │▼Settings│  │  Revenue │ │ Payments │ │ AI Agent │         ║
║ │  Profile│  │    ↑12%  │ │   ↑8%   │ │   ↑5%   │         ║
║ │  API Key│  └──────────┘ └──────────┘ └──────────┘         ║
║ │  Notify │                                                   ║
║ │         │  ┌─────────────────────────────────────────┐     ║
║ │         │  │  REVENUE OVER TIME                      │     ║
║ │         │  │                                          │     ║
║ │         │  │   [Line Chart]                          │     ║
║ │         │  │                                          │     ║
║ │         │  │   Orange: Total                         │     ║
║ │         │  │   Purple: AI Agents                     │     ║
║ │         │  └─────────────────────────────────────────┘     ║
║ │         │                                                   ║
║ │  [<]    │  ┌────────────────┐  ┌─────────────────────┐    ║
║ └─────────┘  │ TOP CONTENT    │  │ RECENT PAYMENTS     │    ║
║              │ 1. Article A   │  │ 0x123... 0.10 STX   │    ║
║              │    $45.20      │  │ 2 mins ago          │    ║
║              │ 2. API Calls   │  │                      │    ║
║              │    $32.10      │  │ 0x456... 0.50 sBTC  │    ║
║              │ 3. Video       │  │ 5 mins ago          │    ║
║              │    $28.00      │  │                      │    ║
║              └────────────────┘  └─────────────────────┘    ║
╚═══════════════════════════════════════════════════════════════╝
```

### Dashboard - Settings (Nested in Sidebar)

```
╔═══════════════════════════════════════════════════════════════╗
║ ┌─────────┐ Home > Dashboard > Settings > API Keys [≡] Home  ║
║ │  [≡]    │                                                   ║
║ │         │ ────────────────────────────────────────────────  ║
║ │ Overview│                                                   ║
║ │ Analytics│  API KEYS                                        ║
║ │ Content │                                                   ║
║ │ Payments│  Manage your API keys for SDK integration.       ║
║ │         │                                                   ║
║ │▼Settings│  [ + GENERATE NEW KEY ]                          ║
║ │ >Profile│                                                   ║
║ │ >API Key│  ┌─────────────────────────────────────────┐     ║
║ │ >Notify │  │ Key Name: Production Key                │     ║
║ │         │  │ ┌─────────────────────────────────────┐ │     ║
║ │         │  │ │ sk_live_abc123...xyz789  [COPY] [×] │ │     ║
║ │         │  │ └─────────────────────────────────────┘ │     ║
║ │         │  │ Created: Jan 15, 2026                   │     ║
║ │         │  │ Last used: 2 hours ago                  │     ║
║ │         │  └─────────────────────────────────────────┘     ║
║ │  [<]    │                                                   ║
║ └─────────┘  ┌─────────────────────────────────────────┐     ║
║              │ Key Name: Development Key               │     ║
║              │ ┌─────────────────────────────────────┐ │     ║
║              │ │ sk_test_def456...uvw012  [COPY] [×] │ │     ║
║              │ └─────────────────────────────────────┘ │     ║
║              │ Created: Jan 10, 2026                   │     ║
║              │ Last used: Never                        │     ║
║              └─────────────────────────────────────────┘     ║
╚═══════════════════════════════════════════════════════════════╝
```

### Mobile Dashboard (Sidebar Overlay)

```
╔═══════════════════════════════════════╗
║ ┌─────────────┐ [☰]   Overview   [@]  ║
║ │  [≡]        │                       ║
║ │             │ ────────────────────  ║
║ │  Overview   │                       ║
║ │  Analytics  │  ┌──────────────┐    ║
║ │  Content    │  │   $1,234     │    ║
║ │  Payments   │  │   Revenue    │    ║
║ │             │  └──────────────┘    ║
║ │ ▼Settings   │                       ║
║ │   Profile   │  ┌──────────────┐    ║
║ │   API Keys  │  │     156      │    ║
║ │   Notify    │  │   Payments   │    ║
║ │             │  └──────────────┘    ║
║ │             │                       ║
║ │  [BACKDROP] │  ┌──────────────┐    ║
║ └─────────────┘  │     23%      │    ║
║                  │   AI Agent   │    ║
║                  └──────────────┘    ║
║                                       ║
║  [Chart - Full Width]                ║
║                                       ║
║  TOP CONTENT                         ║
║  1. Article A    $45                 ║
║  2. API Calls    $32                 ║
║                                       ║
╚═══════════════════════════════════════╝
```

### 404 Page

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                                                               ║
║                         4 0 4                                 ║
║                      (glitching)                              ║
║                                                               ║
║                   PAGE NOT FOUND                              ║
║                                                               ║
║       This page doesn't exist on the blockchain.              ║
║                                                               ║
║       Redirecting to home in 5 seconds...                    ║
║                                                               ║
║         [BACK TO HOME]        [DASHBOARD]                    ║
║                                                               ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 16. IMPLEMENTATION PRIORITIES

### Phase 1: MVP (Week 1 - Hackathon)
- [ ] Landing page (hero, features, CTA)
- [ ] Basic dashboard layout
- [ ] Sidebar (collapsible, no localStorage yet)
- [ ] Overview page with mock data
- [ ] Connect wallet functionality
- [ ] Responsive design (mobile-first)
- [ ] Deploy to Vercel

### Phase 2: Enhanced Features (Week 2-3)
- [ ] Sidebar localStorage persistence
- [ ] Settings page with nested navigation
- [ ] Analytics page with real charts
- [ ] Content management page
- [ ] Payments history page
- [ ] 404 page
- [ ] All animations/transitions
- [ ] SEO optimization

### Phase 3: Polish (Week 4)
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Browser testing (Chrome, Firefox, Safari)
- [ ] Mobile testing (iOS, Android)
- [ ] Loading states for all async operations
- [ ] Error boundary components
- [ ] Analytics integration (PostHog/Plausible)

---

## 17. DESIGN ASSETS NEEDED

### Images
- [x] Stacks blockchain background (provided)
- [ ] Creator profile avatars (generated or stock)
- [ ] Empty state illustrations
- [ ] Error state illustrations
- [ ] Logo (SVG)
- [ ] Favicon (multiple sizes)
- [ ] Open Graph image (social sharing)

### Icons
- Navigation icons (Lucide React)
- Status icons (success, error, warning)
- Asset icons (sBTC, STX, USDCx logos)
- Social media icons

### Fonts
- JetBrains Mono (Google Fonts)
- IBM Plex Sans (Google Fonts)

---

## 18. COPYWRITING

### Landing Page Headlines
- Hero: "One Line of Code. Bitcoin-Native Payments. Creator-First Monetization."
- Subhead: "The first Bitcoin-native SDK for content monetization. Built on Stacks. Powered by x402."
- CTA: "Get Started" / "Launch Dashboard" / "View Docs"

### Feature Titles
1. "Bitcoin-Native Payments" → "Accept sBTC with Bitcoin's security"
2. "Clarity Smart Contracts" → "Programmable revenue, immutable ownership"
3. "AI Agent Economy" → "Tap into autonomous payments"

### Empty States
- No content: "You haven't monetized anything yet. Start by adding your first content."
- No payments: "No payments received yet. Share your monetized content to start earning."
- No API keys: "Generate your first API key to integrate x402Pay SDK."

### Error Messages
- Wallet not connected: "Please connect your Hiro Wallet to continue."
- Network mismatch: "Switch to Stacks Testnet to use x402Pay."
- Transaction failed: "Payment failed. Please try again or contact support."

---

## 19. SUCCESS METRICS (Frontend)

### User Engagement
- Landing page → Dashboard conversion: > 15%
- Average session duration: > 3 minutes
- Bounce rate: < 40%
- Return visitor rate: > 30%

### Performance
- Lighthouse Performance: > 90
- Lighthouse Accessibility: 100
- Lighthouse Best Practices: > 90
- Lighthouse SEO: 100

### Technical
- Zero console errors
- < 3s Time to Interactive
- < 1s First Contentful Paint
- Mobile-friendly (Google test)

---

## 20. CONCLUSION

This frontend PRD provides a complete blueprint for building a distinctive, production-ready interface for x402Pay. The "Bitcoin Brutalist" aesthetic sets it apart from generic crypto dashboards while remaining highly functional and accessible.

**Key Differentiators:**
1. ✅ Bold, memorable design (not generic AI slop)
2. ✅ Bitcoin-focused visual language
3. ✅ Technical, code-first aesthetic
4. ✅ High contrast, accessible
5. ✅ Fully responsive
6. ✅ Production-ready component library
7. ✅ Comprehensive user flows
8. ✅ Performance-optimized

**Ready for implementation** with clear specs, wireframes, and technical guidance.

---

**Document Version:** 1.0  
**Last Updated:** February 9, 2026  
**Status:** Ready for Development  
**Estimated Build Time:** 7-10 days (MVP)
