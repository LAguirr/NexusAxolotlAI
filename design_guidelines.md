# Design Guidelines: Le Nexus Connecté - L'Écho Personnalisé

## Design Approach

**Reference-Based Approach**: Drawing from SFEIR's sophisticated tech aesthetic combined with futuristic AI interfaces. This creates a professional yet innovative experience that balances corporate credibility with cutting-edge technology.

**Core Principles**:
- Clean minimalism with purposeful accents
- Technology-forward without overwhelming users
- Trust-building through clarity and polish
- Guided journey with persistent AI companion

## Color System

**Primary Palette**:
- **Deep Blue** (#1E40AF to #2563EB): Primary actions, AI elements, trust indicators
- **Electric Blue** (#3B82F6 to #60A5FA): Accents, hover states, AI glow effects
- **Cool Gray** (#F8FAFC to #F1F5F9): Backgrounds, cards, neutral spaces
- **Slate** (#64748B to #94A3B8): Secondary text, borders
- **Pure White** (#FFFFFF): Primary backgrounds, high contrast elements
- **Dark Slate** (#1E293B to #334155): Primary text, headers

**Functional Colors**:
- Success: Emerald green (#10B981) for confirmations
- Warning: Amber (#F59E0B) for form validation
- Subtle gradients: Blue-to-cyan for premium elements

## Typography

**Font Stack**: Inter (via Google Fonts CDN) for its clean, modern, tech-forward aesthetic

**Hierarchy**:
- **Hero Headlines**: 4xl to 6xl, font-weight 700, tight tracking
- **Section Headers**: 3xl to 4xl, font-weight 600
- **AI Dialogue**: xl to 2xl, font-weight 500, conversational tone
- **Body Text**: base to lg, font-weight 400, optimized line-height (1.6-1.7)
- **Form Labels**: sm, font-weight 500, uppercase tracking-wide
- **Buttons**: base, font-weight 600

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm

**Container Strategy**:
- Max-width: 7xl (1280px) for main content
- Section padding: py-16 to py-24 (desktop), py-12 (mobile)
- Card spacing: p-6 to p-8
- Form field gaps: 6 to 8

**Grid Patterns**:
- Mission cards: 2x2 grid (lg:grid-cols-2)
- Form layouts: Single column for simplicity, max-w-2xl centered
- AI integration: Fixed position top-right, does not disrupt content flow

## Component Library

### 1. AI Companion (Axolotl)

**Positioning**: Fixed top-right corner, z-50, always visible
- Avatar container: w-20 h-20 (mobile), w-24 h-24 (desktop)
- Rounded-full with subtle blue glow effect (shadow-xl with blue tint)
- Speech bubble: max-w-sm, positioned relative to avatar, tail pointing to avatar
- Bubble styling: bg-white with border-2 border-blue-500, rounded-2xl, p-4
- Dialogue text: Changes per page context, animates in with subtle fade

**Visual Treatment**:
- Avatar image: Gradient robot illustration with blue/cyan tones
- Glow effect: Pulsing subtle animation (3s duration)
- Entrance: Slides in from right on page load

### 2. Mission Selection Cards (Homepage)

**Layout**: 2x2 grid, equal height cards
- Card size: Generous padding (p-8), min-h-64
- Visual hierarchy: Icon (top), Title (bold 2xl), Description (text-gray-600)
- Hover state: Lift effect (translateY -2, shadow-2xl), subtle blue border glow
- Icons: Heroicons, size-16, text-blue-600

**Cards**:
1. **Don** - Currency/gift icon
2. **Bénévolat** - Users/hands icon
3. **Contact** - Chat/message icon
4. **Informations** - Information/question icon

### 3. Dynamic Forms

**Container**: max-w-2xl centered, bg-white, rounded-2xl, shadow-xl, p-8 to p-12

**Field Styling**:
- Input/textarea: border-2 border-gray-300, rounded-lg, p-3, focus:border-blue-500 with ring
- Labels: Above fields, font-medium, text-sm, text-gray-700
- Validation: Red border + message for errors, green checkmark for success
- Placeholders: Contextual, helpful text in gray-400

**Mission-Specific Elements**:
- **Don**: Amount selector (preset buttons + custom input), frequency toggle (one-time/monthly)
- **Bénévolat**: Skills checkboxes, availability calendar widget
- **Contact**: Message type dropdown, textarea with character count
- **Informations**: Category selector, priority indicator

**Submit Button**: Full-width (mobile) or centered (desktop), bg-blue-600, text-white, py-3 px-8, rounded-lg, font-semibold, hover:bg-blue-700 with smooth transition

### 4. Confirmation Pages

**Layout**: Centered content, max-w-3xl
- Hero section: AI-generated message in large, friendly typography (2xl to 3xl)
- User name highlighted in blue
- Mission reference included
- Year (2025) prominently mentioned
- Decorative elements: Confetti animation (subtle) or success checkmark
- Secondary CTA: "Return to missions" or "Track your contribution"

## Page-Specific Designs

### Homepage: Mission Selection

**Hero Section** (80vh):
- Centered layout with gradient background (blue-900 to slate-900)
- Main headline: "Salutations, voyageur des flux de données !" (4xl, white)
- AI introduction: Axolotl's greeting below headline (xl, blue-200)
- Background: Subtle tech pattern or grid lines (very low opacity)

**Mission Grid**: Immediately below hero, py-20, bg-gray-50
- AI prompt above grid: "Quelle mission choisis-tu, voyageur ?" (3xl, centered)
- 4 cards as described above

### Form Pages

**Header**: bg-gradient-to-r from-blue-600 to-blue-800, py-8
- Breadcrumb: Home > [Mission Name]
- AI prompt: Contextual guidance in speech bubble

**Form Section**: White background, centered, generous vertical padding
- Progressive disclosure: Show/hide fields based on selections
- Real-time validation feedback

### Confirmation Pages

**Full-screen centered**: bg-gradient-to-b from-blue-50 to-white
- Large success icon or animation
- AI-generated message in storytelling format
- Personalization tokens: {Name}, {Mission}, {Year}, {Amount/Topic}
- Next steps clearly outlined

## Animations

**Minimal but purposeful**:
- Page transitions: 200ms fade
- Card hover: 150ms transform + shadow
- AI avatar: 3s pulse glow (continuous)
- Form field focus: 200ms border color + ring
- Success animations: 500ms scale + fade for checkmarks
- Speech bubble: 300ms slide-in when text changes

## Images

**AI Avatar**: Futuristic robot illustration with gradient blue/cyan tones (use provided visual reference concept)
- Placement: Top-right corner, all pages
- Style: Modern, friendly, tech-forward (not intimidating)

**Background Elements**:
- Homepage hero: Subtle geometric pattern or abstract tech visualization (low opacity)
- No large photographic hero - focus on clean interface and AI companion

## Responsive Behavior

**Breakpoints**:
- Mobile (base): Single column, AI avatar smaller (w-16), cards stacked
- Tablet (md): 2-column grid begins, AI avatar medium (w-20)
- Desktop (lg): Full 2x2 grid, AI avatar full size (w-24), optimal spacing

**AI Companion Mobile**: Shrinks to bottom-right corner, tap to expand speech bubble

## Accessibility

- High contrast ratios (4.5:1 minimum)
- Focus states clearly visible with blue ring
- Form labels always visible (no placeholder-only)
- ARIA labels for icons and interactive elements
- Keyboard navigation fully supported