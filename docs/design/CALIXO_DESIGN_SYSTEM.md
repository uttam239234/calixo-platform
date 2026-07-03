# CALIXO DESIGN SYSTEM

## Enterprise AI Marketing Operating System

**Version:** 1.0.0  
**Last Updated:** June 2026  
**Maintained by:** Principal Product Design Team  

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Grid System](#4-grid-system)
5. [Spacing Scale](#5-spacing-scale)
6. [Border Radius](#6-border-radius)
7. [Shadows](#7-shadows)
8. [Elevation](#8-elevation)
9. [Icons](#9-icons)
10. [Buttons](#10-buttons)
11. [Inputs](#11-inputs)
12. [Dropdowns](#12-dropdowns)
13. [Cards](#13-cards)
14. [Tables](#14-tables)
15. [Charts](#15-charts)
16. [Modals](#16-modals)
17. [Notifications](#17-notifications)
18. [Empty States](#18-empty-states)
19. [Loading States](#19-loading-states)
20. [Sidebar](#20-sidebar)
21. [Header](#21-header)
22. [Dashboard Layout](#22-dashboard-layout)
23. [Analytics Layout](#23-analytics-layout)
24. [Ads Manager Layout](#24-ads-manager-layout)
25. [Social Media Layout](#25-social-media-layout)
26. [AI Copilot Layout](#26-ai-copilot-layout)
27. [Responsive Breakpoints](#27-responsive-breakpoints)
28. [Accessibility Standards](#28-accessibility-standards)
29. [Animation Guidelines](#29-animation-guidelines)
30. [UX Principles](#30-ux-principles)

---

## 1. Design Philosophy

### Core Principles

**Clarity Over Cleverness:** Every pixel serves a purpose. Information density is balanced with breathing room to reduce cognitive load for executives managing complex marketing portfolios.

**Professional Confidence:** The interface radiates competence. Timeless design choices ensure the system feels authoritative and trustworthy without relying on trendy aesthetics.

**Intelligent Guidance:** The AI copilot is not an afterthought—it's a first-class citizen that augments human decision-making without overshadowing user agency.

**Speed as a Feature:** Users spend 8-10 hours daily in the platform. Every interaction must feel instantaneous. Decisions about visual weight are made with performance in mind.

**Enterprise-Grade Polish:** Attention to micro-interactions, smooth transitions, and consistent behavior builds confidence in the system's capabilities.

### Design Manifesto

Calixo's interface embodies **Executive Confidence**—a balance between powerful capabilities and an interface that doesn't intimidate. We don't burden CMOs with complexity; we reveal it progressively.

**We believe in:**
- **Transparency**: Data should be illuminate, not obscure
- **Efficiency**: Every click should bring value; no decorative complexity
- **Trust**: Visual consistency breeds operational confidence
- **Empowerment**: The AI copilot suggests, never forces
- **Inclusivity**: Accessible by design, not as an afterthought

---

## 2. Color Palette

### Brand Colors

**Primary Blue**
- Dark Mode: `#3B82F6`
- Light Mode: `#2563EB`
- Usage: Primary actions, navigation highlights, key data points
- WCAG AA compliant for large text and interactive elements on white

**Secondary Gray**
- Light: `#F3F4F6` (backgrounds)
- Dark: `#1E293B` (backgrounds)
- Usage: Secondary surfaces, disabled states, structural dividers

**Accent Slate**
- Light: `#F1F5F9` (hover states)
- Dark: `#334155` (hover states)
- Usage: Subtle backgrounds, interaction feedback

### Semantic Colors

**Success**
- Light: `#22C55E`
- Dark: `#16A34A`
- Usage: Positive metrics, completion states, success notifications

**Warning**
- Light: `#F59E0B`
- Dark: `#D97706`
- Usage: Attention-needed states, caution indicators, budget alerts

**Danger / Destructive**
- Light: `#EF4444`
- Dark: `#DC2626`
- Usage: Critical alerts, delete actions, error states, negative ROI indicators

### Neutral Scale

**Light Mode:**
- Background: `#F8FAFC`
- Foreground: `#111827`
- Card: `#FFFFFF`
- Muted: `#94A3B8`
- Border: `#E5E7EB`
- Input: `#E5E7EB`
- Ring (focus): `#2563EB`

**Dark Mode:**
- Background: `#0F172A`
- Foreground: `#F8FAFC`
- Card: `#1E293B`
- Muted: `#64748B`
- Border: `#334155`
- Input: `#334155`
- Ring (focus): `#3B82F6`

### Color Usage Rules

1. **Never use color alone to convey meaning** - always pair with icons or text labels
2. **Primary blue** is reserved for key actions and active states
3. **Success/Warning/Danger** are restricted to semantic feedback only
4. **Contrast ratios** must meet WCAG AA (4.5:1 for text, 3:1 for large text)
5. **Data visualization** uses a sequential blue scale (primary to muted)
6. **A/B test variations** use muted gray tones to maintain visual hierarchy

---

## 3. Typography

### Font Family

**System Font Stack** (primary):
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

**Monospace** (for data, code, reports):
```css
font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace;
```

### Type Scale

| Token | Size | Weight | Line Height | Use Case |
|-------|------|--------|-------------|----------|
| display-2xl | 60px | 700 | 1.1 | Hero sections, major reports |
| display-xl | 48px | 700 | 1.15 | Page titles, dashboard headers |
| display-lg | 36px | 600 | 1.2 | Section titles, card headers |
| display-md | 30px | 600 | 1.3 | Subsection titles |
| text-2xl | 24px | 400 | 1.4 | Large body text, summaries |
| text-xl | 20px | 400 | 1.45 | Subheadings, emphasized content |
| text-lg | 18px | 400 | 1.5 | Primary body text |
| text-base | 16px | 400 | 1.5 | Standard body text, inputs |
| text-sm | 14px | 400 | 1.5 | Secondary text, captions |
| text-xs | 12px | 500 | 1.4 | Labels, metadata, timestamps |
| text-2xs | 11px | 500 | 1.4 | Microcopy, legal text |

### Typography Styles

**Headings:**
- Use semibold (600) for hierarchy
- Letter spacing: -0.01em for display sizes, normal for body
- Avoid all-caps except for very small metadata

**Body Text:**
- Regular weight (400) is standard
- Line height: 1.5 for readability
- Max line length: 75 characters
- Paragraph spacing: 16px

**Data Display:**
- Tabular numbers for metrics: `font-variant-numeric: tabular-nums`
- Right-aligned for comparison
- Monospace for precise figures

### Text Colors

- **Primary Text** (foreground): Main content
- **Secondary Text** (foreground/secondary): Supporting content, descriptions
- **Muted Text** (muted-foreground): Placeholders, disabled text, timestamps
- **Inverse Text**: On dark backgrounds (primary) or colored buttons

### Font Weights Available

- 400 (Regular): Body text, controls
- 500 (Medium): Emphasis within text, metadata
- 600 (Semibold): Subheadings, button text
- 700 (Bold): Headings, page titles

---

## 4. Grid System

### 12-Column Grid

All layouts use a **12-column grid** for consistency and flexibility.

**Grid Gutters:**
- Desktop: 24px
- Tablet: 20px
- Mobile: 16px

**Grid Margins:**
- Desktop: 32px (content starts 32px from viewport edge)
- Tablet: 20px
- Mobile: 16px

### Breakpoint-Based Columns

| Screen | Content Area | Columns | Gutter | Margin |
|--------|--------------|---------|--------|--------|
| < 640px | Full width | 4 (implicit) | 16px | 16px |
| 640px - 1024px | 640px | 8 | 20px | 20px |
| 1024px - 1280px | 960px | 12 | 24px | 24px |
| 1280px - 1536px | 1200px | 12 | 24px | 32px |
| > 1536px | 1440px | 12 | 24px | auto-centered |

### Grid Usage Patterns

**Dashboard Cards:**
- 3 columns on desktop (each card spans 4 columns)
- 2 columns on tablet
- 1 column on mobile

**Analytics Charts:**
- 2 columns (primary metric + detail)
- 1 column for focused analysis

**Data Tables:**
- Full width with 24px margins
- Horizontal scroll on small screens

### Nested Grids

- Nested grids use same gutter size
- Maximum nesting depth: 2 levels
- Use gap property for spacing within cards

---

## 5. Spacing Scale

### Base Unit

All spacing is based on a **4px base unit**. This creates a rhythmic, harmonious layout system.

### Scale

| Token | Value | Use Case |
|-------|-------|----------|
| 0 | 0px | No spacing |
| 0.5 | 2px | Tight spacing, icon padding |
| 1 | 4px | Minimal spacing, icon gaps |
| 1.5 | 6px | Compact padding |
| 2 | 8px | Button padding, small gaps |
| 3 | 12px | List item spacing, input padding |
| 4 | 16px | Standard padding, card padding |
| 5 | 20px | Medium spacing |
| 6 | 24px | Section spacing, card margins |
| 8 | 32px | Large spacing, component margins |
| 10 | 40px | Extra large spacing |
| 12 | 48px | Major section breaks |
| 16 | 64px | Page-level spacing |
| 20 | 80px | Hero sections |
| 24 | 96px | Maximum spacing |

### Spacing Patterns

**Vertical Rhythm:**
- Body text line height: 24px (1.5em × 16px)
- Section spacing: multiples of 8px
- Component margins: 24px standard

**Horizontal Spacing:**
- Sidebar width: 256px (64 × 4px)
- Header height: 64px (16 × 4px)
- Card padding: 24px (6 × 4px)

**Component Internal Spacing:**
- Button padding: 8px 16px (2, 4)
- Input padding: 10px 12px
- List item padding: 12px 16px
- Card padding: 24px
- Modal padding: 32px

---

## 6. Border Radius

### Radius Scale

| Token | Value | Use Case |
|-------|-------|----------|
| none | 0px | Sharp corners, tables |
| sm | 4px | Small elements, badges, chips |
| md | 8px | Buttons, inputs, small cards |
| lg | 12px | Cards, modals, dropdowns |
| xl | 16px | Large cards, panels, hero elements |
| 2xl | 24px | Special cases, modals |
| full | 9999px | Pills, circular buttons, avatars |

### Application Rules

**Buttons:**
- Default: 8px (md)
- Icon-only: 8px
- Pill buttons: 9999px (full)

**Inputs:**
- Default: 8px (md)
- Dropdowns: 8px (md)

**Cards:**
- Standard cards: 12px (lg)
- Dashboard widgets: 12px (lg)
- Feature cards: 16px (xl)

**Modals:**
- Default: 12px (lg)

**Tables:**
- Header row: 8px (md) top corners
- Data rows: Square (0)
- Alternative: 8px for all corners on modern feel

**Dropdowns & Popovers:**
- 12px (lg)

**Charts:**
- Charts themselves: 8px
- Chart containers: 12px

### Consistency

- Maintain radius consistency within component families
- Primary surfaces (cards): 12px
- Interactive elements (buttons, inputs): 8px
- Never mix more than 2 radius values in single view

---

## 7. Shadows

### Shadow Scale

| Token | Properties | Use Case |
|-------|-----------|----------|
| none | 0, 0, 0, 0, transparent | Flat elements, tables |
| sm | 0 1px 2px 0 rgba(0,0,0,0.05) | Elevated inputs, subtle depth |
| md | 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06) | Dropdowns, menu items |
| lg | 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05) | Cards, modals |
| xl | 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04) | Floating panels, tooltips |
| 2xl | 0 25px 50px -12px rgba(0,0,0,0.25) | Full modals, hero sections |

### Shadow Usage

**Cards:**
- Default: md
- Hovered: lg
- Dragging: xl

**Modals:**
- Always: xl
- Backdrop: md (on overlay)

**Dropdowns:**
- Default: lg

**Floating Elements:**
- Tooltips: xl
- Context menus: lg
- Notifications: lg

**Navigation:**
- Sidebar: none (flat design)
- Header: sm (on scroll)

**Inputs:**
- Default: none
- Focus: ring (use ring utility instead of shadow)

**Tables:**
- None on table itself
- Header: sm (sticky)

### Dark Mode Shadows

Shadows are reduced or removed in dark mode. Use subtle borders instead:
- Light mode: shadows as defined above
- Dark mode: 1px borders with low opacity (border-white/5 or border-black/20)

---

## 8. Elevation

### Elevation System

Elevation combines shadows, borders, and background colors to create visual hierarchy.

### Elevation Levels

**Level 0 - Base**
- Card background (white/dark)
- No shadow
- Example: Static cards

**Level 1 - Low**
- Dropdown open state
- Shadow: sm
- Example: Menu items, dropdown triggers

**Level 2 - Medium**
- Button hover, active inputs
- Shadow: md
- Example: Cards on hover

**Level 3 - High**
- Floating panels, drawers
- Shadow: lg
- Example: Filter panels, side drawers

**Level 4 - Very High**
- Modals, dialogs
- Shadow: xl
- Backdrop: rgba(0,0,0,0.5)
- Example: Confirmation dialogs, settings panels

**Level 5 - Maximum**
- Full-screen overlays, command palette
- Shadow: 2xl
- Backdrop: rgba(0,0,0,0.7)
- Example: Search, AI Copilot full screen

### Elevation Patterns

**Navigation:**
- Sidebar: Level 0
- Header: Level 1 on scroll

**Content Areas:**
- Background: Level 0
- Cards: Level 0 (Level 2 on hover)
- Modals: Level 4

**Overlays:**
- Tooltips: Level 3
- Notifications: Level 3
- Context menus: Level 3

**Focus Management:**
- Focused inputs: Ring (border)
- Focused cards: Ring + Level 1

---

## 9. Icons

### Icon System

**Library:** Phosphor Icons (primary) with custom brand icons

### Icon Sizes

| Token | Size | Line Height | Use Case |
|-------|------|-------------|----------|
| xs | 12px | 1 | Inline with text, badges |
| sm | 16px | 1 | Button icons, small UI |
| md | 20px | 1 | Standard icons, navigation |
| lg | 24px | 1 | Featured icons, cards |
| xl | 32px | 1 | Hero sections, empty states |
| 2xl | 48px | 1 | Empty state illustrations |

### Icon Weights

- **Regular** (32 variants): Primary navigation, data visualization, general UI
- **Bold** (32 variants): Active states, selected items, high-emphasis
- **Fill** (32 variants): Selected navigation, active toggles
- **Duotone** (32 variants): Decorative elements, subtle indicators

### Icon Application Rules

**Navigation:**
- Sidebar: 24px (md) Regular
- Active state: 24px (md) Bold
- Top-level: 20px (md)

**Buttons:**
- Icon-only: 20px (md)
- With text: 16px (sm) for small buttons, 20px for medium/large
- Loading state: 20px animated spinner

**Status Indicators:**
- 16px colored icons for status (success green, warning yellow, danger red)
- Use consistent selection: Phosphor's standard semantics

**Lists & Tables:**
- Row actions: 16px (sm)
- Row indicators: 16px (gray or semantic)

### Custom Brand Icons

**Calixo Logo:**
- Primary: Custom SVG with gradient
- Minimum size: 32px height
- Do not recolor; use as provided

**Product-Specific:**
- Campaign icon: Rocket/bullhorn
- Analytics icon: Chart/trending up
- AI Copilot: Sparkle/brain
- Social: Speech bubbles
- Ads: Megaphone/target

### Icon Colors

- Default: current foreground color
- Muted: muted-foreground
- Interactive: primary on hover
- Semantic: use success/warning/danger sparingly
- Never use decorative colors; functional only

---

## 10. Buttons

### Button Anatomy

Every button consists of:
- Container (background, border)
- Content (text, icon, both)
- State layers (hover, active, focus, disabled, loading)

### Button Variants

**Primary**
- Purpose: Main actions, "Create", "Save", "Continue"
- Background: Primary color
- Text: Primary-foreground
- Hover: Darken by 10%
- Active: Darken by 20%
- Shadow: sm
- Use: Page-primary actions (max 1-2 per view)

**Secondary**
- Purpose: Supporting actions, "Cancel", "Back"
- Background: Secondary background
- Text: Secondary-foreground
- Hover: Accent background
- Shadow: none
- Use: Secondary actions in dialogs

**Outline**
- Purpose: Tertiary actions, "Learn More", "Edit"
- Background: transparent
- Border: 1px solid border color
- Text: foreground
- Hover: accent background
- Shadow: none
- Use: Forms, supplementary actions

**Ghost**
- Purpose: Low-priority actions, icon buttons
- Background: transparent
- Text: foreground
- Hover: accent background
- Shadow: none
- Use: Toolbar, secondary panels

**Destructive**
- Purpose: Destructive actions, "Delete", "Remove"
- Background: destructive color
- Text: white
- Hover: darken 10%
- Shadow: sm
- Use: Rarely; only for destructive actions

**Success**
- Purpose: Confirmations, "Approve", "Publish"
- Background: success color
- Text: white
- Hover: darken 10%
- Shadow: sm
- Use: Rare; specific workflow actions

### Button Sizes

**Small (sm)**
- Height: 32px
- Padding: 6px 12px
- Font size: 14px
- Use: Dense tables, inline actions

**Medium (md)** - Default
- Height: 40px
- Padding: 8px 16px
- Font size: 14px (16px acceptable)
- Use: Standard actions, forms

**Large (lg)**
- Height: 48px
- Padding: 12px 24px
- Font size: 16px
- Use: Hero sections, modals primary action, prominent CTAs

**Icon Button**
- No text
- Height: matches size (sm/md/lg)
- Width: equals height
- Padding: none
- Justify content center

### Button States

**Default:** Resting state

**Hover:** Darken background by 10%, add subtle shadow

**Active (Pressed):** Darken background by 20%, slight scale (0.98)

**Focus:** 2px ring in primary color, 2px offset

**Disabled:** Opacity 0.5, no pointer events

**Loading:** Show spinner (20px), disable pointer events, reveal loading text if desired

### Button Composition Rules

**With Icons:**
- Icon left of text (default)
- Icon-only buttons must have aria-label
- Gap between icon and text: 8px
- Icon aligns with text baseline

**Button Groups:**
- Connected buttons: remove border radius on connecting edges
- Separated buttons: standard spacing between (8px)

**Full Width:**
- Width: 100%
- Use sparingly; only on mobile or single-purpose views

---

## 11. Inputs

### Input Types

**Text Input**
- Single line text entry
- Placeholder: muted color
- Label: 14px semibold, positioned above

**Textarea**
- Multi-line text entry
- Minimum height: 80px
- Resize: vertical only
- Character count: 12px, right-aligned below

**Number Input**
- Numeric entry with stepper
- Stepper: 16px arrows
- Format: tabular numbers right-aligned

**Search Input**
- Contains search icon (20px)
- Clear button (X) appears on input
- Larger touch target on mobile

### Input Sizes

**Small**
- Height: 32px
- Font size: 14px
- Padding: 4px 10px
- Label: 12px bold

**Medium** - Default
- Height: 40px
- Font size: 16px
- Padding: 8px 12px
- Label: 14px semibold

**Large**
- Height: 48px
- Font size: 18px
- Padding: 10px 14px
- Label: 16px semibold

### Input States

**Default:** Background: card, border: input-border

**Hover:** Border color darkens by 15%

**Focus:** 2px ring, offset 0, border color becomes primary

**Error:** Border: danger color, error message below in danger

**Success:** Border: success color, success icon (optional)

**Disabled:** Opacity 0.5, cursor not-allowed, gray background

**Readonly:** Background: secondary, cursor default

### Input Patterns

**With Label:**
- Label above input
- Required indicator: red asterisk (12px bold)
- Spacing: 8px between label and input

**With Helper Text:**
- Below input, 12px
- Color: muted-foreground
- Max 2 lines, truncate with ellipsis

**With Error:**
- Below input, 12px
- Color: danger
- Include alert icon (12px)

**With Icon:**
- Icon positioned left, vertically centered
- Input padding left: 40px (medium)
- Icon color: muted

**Search Input:**
- Search icon: 20px, positioned left
- Clear button: positioned right, appears on focus/value

**Input Groups:**
- Connect inputs for related fields (e.g., first/last name)
- Zero spacing between connected inputs
- Independent inputs separate by 16px

---

## 12. Dropdowns

### Dropdown Anatomy

- Trigger: Button or clickable area
- Menu: Absolute positioned container
- Items: Interactive rows within menu
- Icons: Optional leading/trailing icons

### Dropdown Sizes

**Small (sm)**
- Item height: 32px
- Font size: 14px
- Padding: 4px 12px
- Icon size: 16px

**Medium (md)** - Default
- Item height: 40px
- Font size: 14px
- Padding: 8px 12px
- Icon size: 20px

### Dropdown Patterns

**Select Menu:**
- Single selection from list
- Checkmark on selected item
- Close on selection (or close selection if allowed)

**Multi-select:**
- Checkboxes on items
- "Select All" option at top
- Selected items shown as chips in button

**Dropdown with Search:**
- Search input at top
- Results filtered as user types
- No results message

**Dropdown with Sections:**
- Section headers (14px semibold, 8px padding)
- Divider between sections
- Items within sections

### Dropdown Positioning

- Default: Below trigger, left-aligned
- Above trigger: When near bottom of viewport
- Flip: Automatically adjust horizontal
- Offset: 8px from trigger
- z-index: Higher than other overlays (level 50+)

### Dropdown States

**Default:** Elevation Level 3, border: 1px solid border

**Hover (Item):** Accent background, semi-transparent

**Active (Selected):** Primary background, primary-foreground text, or checkmark

**Disabled:** Opacity 0.5, no hover state

### Dropdown Behavior

- Open on click
- Close on click outside, Escape, or selection
- Keyboard: Up/Down arrows navigate, Enter selects
- Focus: First item on open
- Scroll: List height max 400px, scrollable if overflow

---

## 13. Cards

### Card Anatomy

- Container (background, border, shadow, radius)
- Header (title, optional actions)
- Body (padding: 24px)
- Divider (optional between header/body/footer)
- Footer (optional actions)

### Card Variants

**Standard Card**
- Background: Card (white/dark)
- Border: 1px solid border-color
- Border radius: 12px (lg)
- Shadow: none (Level 0), lg on elevation
- Padding: 24px
- Width: Full or constrained grid

**Interactive Card**
- Standard card + hover state
- Hover: shadow lg, slight translateY(-2px)
- Cursor: pointer
- Use: Navigational cards, feature highlights

**Metric Card**
- Large number display (display-lg or display-md)
- Label above (text-sm semibold)
- Trend indicator (↑ 12% with arrow icon)
- Period: "vs last month"
- Color: Semantic if needed

**Feature Card**
- Icon (48px)
- Title (display-md semibold)
- Description (text-base)
- Optional CTA button
- Hover: subtle background shift

**Chart Card**
- Header with title and time period selector
- Chart area (flex-grow)
- Optional legend below chart

### Card Grid Patterns

**Dashboard:**
- 3 columns desktop, 2 tablet, 1 mobile
- Gap: 24px

**Feature Grid:**
- 3 or 4 columns desktop, 2 tablet, 1 mobile
- Gap: 24px

**Settings Panel:**
- 2 columns desktop, 1 tablet/mobile
- Gap: 24px between sections

### Card Behavior

**Hover:**
- Interactive cards: shadow lg, background shifts slightly to accent
- Transition: 150ms ease-out

**Active:**
- Scale: 0.98
- Background: darker shade

**Loading:**
- Skeleton screen within card body
- Card remains visible (no layout shift)

---

## 14. Tables

### Table Anatomy

- Container (overflow-x: auto for scroll)
- Header (sticky top, background: card)
- Header cells: semibold, text-sm, uppercase tracking-wide
- Body rows: alternating colors (optional), hover state
- Footer (optional): summary rows, pagination

### Table Sizes

**Compact**
- Row height: 40px
- Font size: 14px
- Padding: 8px 12px
- Use: Data-dense tables, tools

**Standard** - Default
- Row height: 52px
- Font size: 14px
- Padding: 12px 16px
- Use: Primary data tables

**Comfortable**
- Row height: 64px
- Font size: 16px
- Padding: 16px 20px
- Use: List views with actions

### Table Patterns

**Data Table:**
- Standard table with sortable columns
- Sort indicator: arrows, primary color when active
- Row hover: accent background

**Selection Table:**
- Checkbox column (leftmost)
- Selected rows: primary background at 10% opacity
- Header checkbox: select all/none

**Expandable Rows:**
- Toggle icon (chevron) at row start
- Expandable content: indented with left border or full-width below
- Animation: smooth height transition

**Tree Table:**
- Indent per level (20px)
- Expand/collapse icons
- Parent rows: semibold

### Table Styling

**Borders:**
- Outer: 1px solid border
- Inner: none (row separation via whitespace or alternating colors)
- Alternatively: striped (zebra alternating rows) for high density

**Header:**
- Background: secondary or card with border-bottom
- Text: uppercase, text-xs, tracking-wider, 12px, color: muted-foreground
- Sticky on scroll
- z-index above body

**Row States:**
- Default: no background
- Hover: accent background
- Selected: primary background (10% opacity)
- Disabled: opacity 0.5

### Table Behavior

**Sorting:**
- Click column header to sort
- Sort indicator: 16px arrow, primary when active
- Multi-column sort: Shift+Click or up to 3 columns with priority numbers

**Filtering:**
- Filter rows above table
- Filter pills: 8px radius, semibold, 12px
- Clear all: 16px button

**Pagination:**
- Below table, right-aligned
- Show: "Showing 1-10 of 50"
- Page numbers: primary for current, default for others
- Per page selector: dropdown on right

---

## 15. Charts

### Chart Types

**Line Chart**
- Purpose: Trends over time
- Use: Performance metrics, trends, forecasts
- Data points: Circles, 8px diameter
- Line: 3px stroke
- Area fill (optional): gradient to bottom

**Bar Chart**
- Purpose: Comparisons, categorical data
- Use: Campaign comparison, channel breakdown
- Bar width: 40px standard, 20px for dense
- Gap: 20px
- Corner radius: 4px top only

**Area Chart**
- Purpose: Volume over time
- Use: Total reach, impression trends
- Fill opacity: 20% primary, gradient to bottom
- Stroke: 2px

**Pie/Donut Chart**
- Purpose: Part-to-whole relationships
- Use: Budget allocation, audience breakdown
- Inner radius for donut: 60%
- Labels: Outside or inside with leader lines
- Legend: Right-aligned

**Scatter Plot**
- Purpose: Correlation analysis
- Use: Cost vs. conversion, bid vs. performance
- Point size: 8px, semi-transparent

**Funnel Chart**
- Purpose: Conversion funnels
- Use: Sales funnels, onboarding flows
- Segments: Color gradient (primary to muted)
- Labels: Inside segments, centered

### Chart Styling

**Axes:**
- Grid lines: 1px dashed, border color, 20% opacity
- Ticks: 4px length, matching border color
- Labels: 12px, 44 color
- Don't show on small charts

**Data Colors:**
- Sequential: Primary to muted
- Diverging: Success on left, danger on right
- Qualitative: Use up to 6 colors max

**Tooltips:**
- Default: xl shadow, dark background, white text
- Format: Label, value (tabular numbers, bold)
- Animation: 100ms fade-in

### Chart Containers

**Standard Chart Card**
- Header: title + time period selector
- Body: chart
- Height: 400px standard, 300px dense
- Width: Full card width

### Chart Behavior

**Interactions:**
- Hover: Highlight series, show value in tooltip
- Click: Select series (if multi-series)
- Legend: Toggle series visibility
- Zoom: Mouse wheel (when enabled)

**Animation:**
- Entrance: draw from left to right, 500ms
- Updates: smooth transition of 300ms

---

## 16. Modals

### Modal Anatomy

- Backdrop overlay (rgba(0,0,0,0.5))
- Modal container (centered)
- Header: Title + Close button
- Body: Content
- Footer: Action buttons (right-aligned)

### Modal Sizes

**Small (sm)**
- Width: 400px
- Use: Confirmations, simple forms

**Medium (md)** - Default
- Width: 560px
- Use: Standard dialogs, forms

**Large (lg)**
- Width: 800px
- Max-height: 90vh
- Use: Complex forms, detailed views

**Fullscreen**
- Width: 100vw
- Height: 100vh
- Use: AI Copilot, immersive workflows

### Modal Positioning

- Centered: Top 50%, left 50%, translate -50%, -50%
- Alternative: Bottom sheet on mobile (slide up from bottom)
- Offset from edges: 32px

### Modal States

**Default:** Elevation Level 4 (xl shadow)

**Open:** Fade in backdrop (200ms), scale modal from 0.95 to 1 (200ms)

**Close:** Reverse animation, 150ms

**Draggable:** 
- Only for large modals or panels
- Drag handle: 48px tall header area
- Constrain within viewport

### Modal Behavior

**Open Triggers:**
- Button clicks
- Keyboard shortcuts (if applicable)
- Context menu actions

**Close Triggers:**
- Close button (top right)
- Click backdrop
- Escape key
- Success action (form submit)

**Focus Trap:**
- Focus locks within modal
- Esc returns to trigger
- Focus moves to first interactive element on open

---

## 17. Notifications

### Notification Types

**Info**
- Border: primary blue (left border, 4px)
- Icon: Info circle (16px)
- Use: Informational messages, updates

**Success**
- Border: success green (left border, 4px)
- Icon: Check circle (16px)
- Use: Completed actions, successful uploads

**Warning**
- Border: warning yellow (left border, 4px)
- Icon: Warning (16px)
- Use: Caution, attention-needed

**Error/Danger**
- Border: danger red (left border, 4px)
- Icon: Warning circle (16px)
- Use: Errors, failures, critical info

### Notification Sizes

**Compact**
- Padding: 12px 16px
- Font size: 14px
- Icon: 16px
- Use: Inline within content, table rows

**Standard**
- Padding: 16px 20px
- Font size: 14px
- Icon: 20px
- Title: 14px semibold

**Prominent**
- Padding: 20px 24px
- Font size: 16px
- Icon: 24px
- Title: 18px semibold
- Use: Page-level alerts

### Notification Patterns

**Toast (Floating)**
- Position: Top-right or bottom-right
- Auto-dismiss after 5 seconds
- Close button: Required
- Stack: Multiple toasts stack vertically

**Inline Alert**
- Within page flow
- Cannot be dismissed
- Full width of container

**Notification Center**
- Badge on notification icon: red dot or count
- Panel: Slide from right or dropdown
- List: Chronological, grouped by date
- Actions: Mark all read, dismiss

### Notification Behavior

**Entrance:**
- Slide in from right: 200ms ease-out
- Fade in: 150ms

**Dismiss:**
- Slide out right: 150ms ease-in
- Fade out: 100ms

**Progress:**
- Show progress bar if timed (5s)
- Animation: Shrink from right (5s linear)

### Notification Actions

- Primary action: "Undo", "View", etc. (primary button)
- Secondary action: "Dismiss"
- Link: "Learn more" (text link, primary color)

---

## 18. Empty States

### Empty State Anatomy

- Illustration: SVG or icon (96px x 96px)
- Title: 20px semibold
- Description: 16px normal, muted color
- Action: Primary button (optional)
- Secondary action: Text link (optional)

### Empty State Patterns

**Initial State (No Data)**
- Illustration: Team or workspace illustration or icon
- Title: "No campaigns yet"
- Description: "Create your first campaign to get started with AI-powered marketing."
- Action: "Create Campaign" button (primary)
- Secondary: "Learn how" link

**No Results State**
- Illustration: Search or empty box icon
- Title: "No results for 'AI tools'"
- Description: "Try adjusting your search or filter criteria."
- Action: "Clear filters" button (secondary)

**Error State**
- Illustration: Warning icon
- Title: "Something went wrong"
- Description: "We couldn't load your data. Please try again."
- Action: "Retry" button (primary)

**Coming Soon**
- Illustration: Sparkle or calendar icon
- Title: "Coming Soon"
- Description: "This feature is being built and will be available soon."
- No action (or "Join waitlist")

### Empty State Sizes

**Standard**
- Illustration: 96px
- Title: 20px
- Description: 16px
- Padding: 64px vertical

**Compact**
- Illustration: 64px
- Title: 18px
- Description: 14px
- Padding: 32px vertical

**Hero (Full Page)**
- Illustration: 160px
- Title: 24px
- Description: 18px
- Centered in viewport
- Padding: 128px vertical

### Empty State Behavior

- No animations
- Static presentation
- Allow actions to persist (user might act)
- Respect reduced motion preferences

---

## 19. Loading States

### Loading Patterns

**Spinner**
- Size: 20px (inline), 32px (card), 48px (page)
- Color: Primary or muted
- Animation: Rotate 360°, 1s linear, infinite
- Position: Centered in container

**Skeleton Screen**
- Pulse animation: background opacity 50% to 100%, 1.5s infinite
- Shape: Mimics content structure (rectangles, circles)
- Use: Cards, lists, tables while loading

**Skeleton Variants:**
- Text: 1px height, width 60-100%
- Circle: For avatars
- Rectangle: For images, cards
- Bar chart: Multiple varying heights

**Progress Bar**
- Height: 8px
- Fill: Primary gradient or solid
- Background: secondary
- Animation: Continuous or determinate

**Shimmer**
- Linear gradient sweep across skeleton
- Angle: -45deg
- Duration: 2s infinite
- More engaging than simple pulse

### Loading Usage

**Page Load:**
- Show skeleton for each major section
- Keep structure static

**Component Load:**
- Inline spinner (20px) next to content
- Or skeleton in component area

**Action Load:**
- Disable button, show spinner inside
- Keep button dimensions (no layout shift)

**Form Submit:**
- Button shows spinner + "Saving..."
- Prevent duplicate submissions

### Loading Behavior

**Minimum display time:** 200ms (prevent flicker)

**Maximum display time:** Show "Still loading..." if > 5s

**Error state:** If load fails, show error + retry

### Animation Details

**Spinner:**
- rotate 0deg to 360deg, 1s linear infinite

**Pulse:**
- opacity 0.5 to 1.0, 1.5s ease-in-out infinite

**Shimmer:**
- translateX -100% to 100%, 2s linear infinite

---

## 20. Sidebar

### Sidebar Structure

**Width:** 256px (16rem)

**Sections (from top to bottom):**

1. **Logo Area**
   - Height: 64px
   - Calixo logo + wordmark
   - Collapse button (optional)

2. **Search** (Optional)
   - Height: 48px
   - Quick search across platform
   - Icon: 20px magnifying glass

3. **Navigation Items**
   - Padding: 8px vertical between items
   - Active item: primary left border (4px) + background accent
   - Inactive: transparent background, foreground color

4. **Divider** (between sections)

5. **Workspace Selector** (enteprise)
   - Dropdown for switching organizations
   - Avatar + organization name
   - Chevron down icon

6. **User Profile** (bottom)
   - Avatar (32px)
   - Name + role
   - Bottom-aligned

### Navigation Item Patterns

**Single Level**
- Icon: 24px
- Label: 14px semibold when active, 14px normal when inactive
- Padding: 8px 16px
- Gap: 32px between icon and label

**With Badge**
- Notification or count badge
- Position: Absolute right of label
- Style: Primary background, white text, rounded-full, 16px, 14px semibold

**With Nested Submenu**
- Expandable: Chevron icon rotates 90deg
- Sub-items: Indented 32px right from parent
- Height: 32px each

### Sidebar Behavior

**Collapse States:**

- **Expanded:** Show labels, 256px wide
- **Collapsed:** Show icons only (centered), 72px wide
- **Hover on collapsed:** Expand on hover (optional: tooltip shows label)
- **Transition:** 200ms ease-in-out on width

**Scroll:**
- Sidebar scrolls independently if needed
- Max height: calc(100vh - header height)

**Active States:**
- Primary background at 10% opacity or accent
- Primary left indicator (4px border)
- Icon: Bold weight
- Text: 14px semibold, primary color

**Hover States:**
- Background: accent (10% opacity)
- Smooth transition: 150ms

### Sidebar Styling

**Background:** Card background (white/dark)

**Border:** Right border only (1px solid border)

**Shadow:** None when sidebar is adjacent to header

---

## 21. Header

### Header Structure

**Height:** 64px

**Elements:**

1. **Left Section**
   - Page title: 20px semibold
   - Breadcrumbs (optional): 14px, separator "/` or arrow

2. **Center Section** (optional)
   - Global search trigger
   - Width: 400px max

3. **Right Section**
   - Notifications: Bell icon (24px) with badge
   - Messages: Chat icon (24px) with badge (or integration)
   - Help: Question mark icon (24px)
   - User menu: 32px avatar + name

### Header States

**Default:** Card background (white/dark), bottom border (1px border)

**On Scroll:**
- For tables-heavy pages
- Elevation increases: shadow sm
- Background remains card color

**Sticky:** Fixed position when scrolling vertically

### Header Elements

**Search Bar:**
- Height: 40px
- Width: 100% max 400px
- Icon: 20px, left
- Placeholder: "Search..."
- Border radius: 8px
- Opens modal with results on Enter

**Notification Badge:**
- Red circle, 8px
- Position: Top right of bell icon
- Count > 99: "99+"

**User Menu:**
- Avatar: 32px circle
- Dropdown menu: position absolute, right 0, top 64px
- Menu items: email, settings, logout

### Header Spacing

- Left section: 16px padding
- Right section: 16px padding
- Horizontal padding: 24px each side
- Vertical: Centered within 64px

---

## 22. Dashboard Layout

### Layout Structure

**Grid Pattern:** 12-column system with 24px gutters

**Typical Sections:**

1. **Header Area** (full width)
   - Page title: "Dashboard"
   - Time range selector: Dropdown (shortcut: Last 7 days, 30 days, etc.)
   - Add widget button

2. **KPI Cards Row** (3 columns)
   - 3-4 metric cards
   - Each: 4 columns wide (span 4)
   - Examples: Total Revenue, Leads Generated, Conversion Rate, Ad Spend

3. **Main Chart** (8 columns, right-aligned)
   - Line chart showing primary metric
   - Time-based granularity
   - Comparison toggle (vs. previous period)

4. **Secondary Panel** (4 columns)
   - Feed or list
   - Recent activities or quick insights

5. **Secondary Charts** (4 columns each, 2 below)
   - Bar chart + pie chart
   - Or campaign performance table

6. **Quick Actions** (optional)
   - User's frequent actions
   - 2-4 icon cards

### Dashboard Specifics

**Widget Management:**
- Drag to reorder (optional)
- Resize handle (optional)
- Customize button: Edit mode
- Remove: X button on widget

**Widget States:**
- Default: Card with title, chart/table
- Loading: Skeleton matching widget structure

**Time Selector:**
- Dropdown: 7d, 30d, 90d, 1y, custom range
- Date range picker for custom
- Cached for 30 minutes

**Date Format:**
- Short dates: "Jun 15, 2026"
- Long dates: "Monday, June 15, 2026"
- Relative: "Yesterday", "Last week" (optional)

---

## 23. Analytics Layout

### Layout Structure

**Pattern:** Focused data analysis with flexible views

**Typical Sections:**

1. **Filters Row** (full width)
   - Date range picker (custom or preset)
   - Dimension selector: dropdown (channel, campaign, region)
   - Compare toggle: checkbox
   - Refresh button

2. **Primary Metric** (12 columns)
   - Large number: 48px bold
   - Period comparison: small text above/below
   - Trend indicator: ↑ 12% (green) or ↓ 5% (red)

3. **Charts Area** (8 columns)
   - Line chart: Primary metric trend
   - Granularity: daily, weekly, monthly toggle

4. **Details Panel** (4 columns)
   - Segmented breakdown
   - Interactive legend
   - Top 5 list

5. **Data Grid** (12 columns)
   - Detailed table with sort/filter
   - Pagination: Bottom
   - Export: CSV button top right

### Analytics Specifics

**Granularity Controls:**
- Hour, Day, Week, Month, Quarter, Year
- Contextual: Based on date range selected
- Display: Button group or segmented control

**Compare Mode:**
- Toggle: Compare vs. previous period
- Shows two lines/lines on chart
- Diverging colors: previous muted, current primary

**Breakdowns:**
- Dropdown: "Breakdown by": campaign, channel, device, region
- Updates chart type if needed
- Table below shows details

**Insights Panel:**
- AI-generated insights: "Highest performing campaign: X"
- Auto-generated cards
- User can dismiss or action them

### Data Presentation

**Primary Metric:**
- Position: Top of page
- Font size: display-xl (48px)
- Label: 14px semibold, uppercase
- Subtext: 14px, date range

**Trend Indicators:**
- Format: ↑ 12% vs. last period
- Arrows: 16px (green up, red down, gray flat)
- Color: green for positive, red for negative, gray for flat

**Numbers:**
- Tabular numbers: Always
- Format: Commas for thousands, 2 decimal places for currency
- Abbreviations: 1.2K, 1.5M (optional for large tables)

---

## 24. Ads Manager Layout

### Layout Structure

**Pattern:** Multi-channel campaign management

**Typical Sections:**

1. **Top Filters** (full width)
   - Account picker: Dropdown (Google Ads, Facebook)
   - Time range: Preset + custom
   - Status filter: All, Active, Paused, Ended
   - Campaign type: Search, Display, Video, Shopping

2. **Campaign Summary** (12 columns)
   - Cards: 4 per row
   - Total campaigns, Active, Budget consumed, Conversions
   - Click card to filter

3. **Chart Area** (8 columns)
   - Bar chart: Spend vs. conversions by channel
   - Toggle: Compare period or vs. budget

4. **Channel Breakdown** (4 columns)
   - Pie chart: Budget allocation
   - Table: Channel metrics

5. **Campaign Table** (12 columns)
   - Columns: Name, Status, Budget, Spend, Impressions, Clicks, Conversions, CTR
   - Actions: Edit, Pause, View
   - Sortable, filterable columns

6. **Bottom Actions**
   - Create Campaign button (primary)
   - Bulk actions: Pause, Duplicate

### Ads Specific Patterns

**Budget Indicators:**
- Progress bar: green under budget (>50%), yellow (80-99%), red (>100%)
- Show delivered vs. budget
- Daily vs. lifetime toggle

**Status Badges:**
- Active: success green filled
- Paused: warning yellow outline
- Ended: muted gray
- Error: danger red with tooltip

**Channel Selector:**
- Tabs or dropdown for Google Ads, Meta, LinkedIn
- Each channel: Different UI theme accent (subtle)
- Keep consistent structure across channels

**Performance Metrics:**
- CTR: Click-through rate, low = issue
- CPC: Cost-per-click
- CPA: Cost-per-acquisition
- ROAS: Return on ad spend (green if > 400%)

---

## 25. Social Media Layout

### Layout Structure

**Pattern:** Content calendar and publisher

**Typical Sections:**

1. **Calendar Header** (full width)
   - Month/year: Large display text (24px)
   - View toggle: Month/Week/List
   - Quick filters: Platform (Instagram, Twitter, LinkedIn), All, Scheduled, Published

2. **Calendar Grid** (main area)
   - Week view: 7 columns (day columns), time slots in rows
   - Month view: 7 columns (S M T W T F S), dates in rows
   - Draggable posts between dates/times
   - Today indicator: Primary colored circle or line

3. **Drafts Panel** (sidebar or right panel, 4 columns)
   - List of drafts, sorted by scheduled date
   - Each draft: Thumbnail (if image), caption preview, date/time
   - Drag to calendar to schedule

4. **Create Post Modal** (overlay)
   - Full screen on mobile, centered modal (lg) desktop
   - Platform selector (multi-checkbox)
   - Text area: Caption
   - Character count: Live, red when over limit
   - Media uploader: Drag & drop or click
   - Schedule picker: Date + time or "Now"
   - Preview panel: Real-time preview

5. **Analytics** (below calendar or tab)
   - Engagement metrics: Likes, comments, shares
   - Reach: Total audience reached
   - Best time to post: Suggestion based on data

### Social Media Specifics

**Post Thumbnails:**
- Square 1:1 aspect ratio
- 40px on desktop, 32px mobile
- Rounded corners: 8px
- Click to preview

**Calendar Cells:**
- Height: Equal aspect ratio based on view
- Min-height in month: 80px
- Month view: 2 posts overflow indicator (+2 more)
- Click empty cell: Create new post for that date

**Platform Icons:**
- Instagram: Camera icon
- Twitter: Bird icon
- LinkedIn: Briefcase icon
- Use brand colors sparingly (only for icons, not backgrounds)

**Engagement Colors:**
- Likes: heart icon, red or muted
- Comments: speech bubble, blue
- Shares: retweet, green

---

## 26. AI Copilot Layout

### Layout Structure

**Pattern:** Sidebar panel or full-screen overlay

**Layout A: Right Sidebar (Default)**
- Width: 400px or full height panel
- Position: Right side, slides in
- Header: "AI Copilot" title + minimize button
- Agent mode selector: Campaign Manager, Analytics Expert, etc.
- Chat interface: Scrollable
- Input area: Bottom, 48px height

**Layout B: Fullscreen Overlay**
- Width: 100vw, height: 100vh
- Two-column: Chat (40%) + Context (60%)
- Header: Back button, title
- Context panel: Shows relevant data, recent conversations

### Chat Interface

**Messages:**
- Right-aligned: User (primary bubble)
- Left-aligned: AI (card background)
- Max width: 80% of container
- Gap: 16px between messages

**User Message:**
- Background: primary
- Text: primary-foreground
- Border radius: 16px (top-left with cut)
- Padding: 12px 16px

**AI Message:**
- Background: card
- Border: 1px border-color
- Border radius: 16px (top-right with cut)
- Padding: 12px 16px

**Message Types:**
- Text: Standard
- Markdown: Render as formatted text
- Code: Monospace, 12px, 8px padding, border
- Chart: Inline chart component
- Action card: Card with action button

### Input Area

**Input:**
- Height: 48px
- Expandable: Multi-line up to 200px
- Placeholder: "Ask anything about your marketing..."
- Send button: Right, turns into spinner on loading

**Toolbar (optional):**
- Attachment button
- Voice input button
- Image upload

### Suggestion Chips

- Horizontal chips below input or above chat
- 8px gap between chips
- Height: 32px, padding 8px 16px
- Background: accent
- Hover: Primary
- Click: Sends as query

### Context Panel (Fullscreen Mode)

**Data Context:**
- Shows relevant metrics for query
- Table of data used
- Source citations

**Insights:**
- Auto-generated insights based on query
- Related questions

---

## 27. Responsive Breakpoints

### Breakpoint System

**Mobile First Approach**

```css
/* Base styles: Mobile */
/* Min-width: 0px */
body { font-size: 16px; }

/* Tablet */
@media (min-width: 640px) {
  body { font-size: 16px; }
}

/* Desktop Small */
@media (min-width: 1024px) {
  body { font-size: 16px; }
}

/* Desktop Medium */
@media (min-width: 1280px) {
  body { font-size: 16px; }
}

/* Desktop Large */
@media (min-width: 1536px) {
  body { font-size: 16px; }
}
```

### Breakpoint Definitions

| Name | Min Width | Max Width | Container | Use Case |
|------|-----------|-----------|-----------|----------|
| Mobile | 0px | 639px | 100% - 32px padding | Phones (< 640px) |
| Tablet | 640px | 1023px | 640px centered | Large phones, small tablets |
| Desktop Sm | 1024px | 1279px | 960px centered | Small laptops |
| Desktop Md | 1280px | 1535px | 1200px centered | Standard laptops |
| Desktop Lg | 1536px | ∞ | 1440px centered | Large monitors |

### Responsive Patterns

**Navigation:**
- Mobile: Bottom tab bar (primary actions) + hamburger menu
- Tablet: Sidebar collapsed (icons only)
- Desktop: Full sidebar with labels

**Layouts:**
- Mobile: Single column, stacked sections
- Tablet: 2-column where applicable
- Desktop: Full grid (3 columns for dashboard)

**Tables:**
- Mobile: Horizontal scroll
- Tablet: Horizontal scroll (rarely stacked)
- Desktop: Full display with 24px margins

**Modals:**
- Mobile: Fullscreen or bottom sheet
- Tablet: Centered modal (max-width 560px)
- Desktop: Centered modal

**Forms:**
- Mobile: Single column, stacked fields
- Tablet: 2 columns if space permits
- Desktop: 2-3 columns in organized groupings

### Device-Specific Considerations

**Touch Targets (Mobile/Tablet):**
- Minimum: 44px × 44px
- Spacing between targets: 8px
- Buttons: 48px minimum height

**Typography Scaling:**
- Use relative units (rem) for accessibility
- Base font remains 16px; scale via media queries

**Images & Media:**
- Responsive images: srcset, sizes
- Max width: 100%
- Aspect ratios: Maintain for charts

---

## 28. Accessibility Standards

### WCAG 2.1 AA Compliance

Calixo targets **WCAG 2.1 Level AA** as minimum, striving for AAA where feasible.

### Color Contrast

**Text on Background:**
- Normal text: 4.5:1 minimum
- Large text (18px+ or 14px bold): 3:1 minimum
- UI components: 3:1 minimum

**Current System Status:**
- Light mode: Primary text exceeds requirements
- Dark mode: Verify contrast ratios during implementation

### Keyboard Navigation

**Focus Indicators:**
- 2px ring in primary color
- 2px offset from element
- Never remove outline without alternative
- Visible on all interactive elements

**Focus Order:**
- Logical tab sequence
- DOM order follows visual order
- Skip to main content link (s+1 to main)

**Keyboard Shortcuts:**
- Docs: / for search, ? for shortcuts
- Modal: Esc to close, Tab to cycle
- Tables: Arrow keys to navigate cells

### Screen Reader Support

**Semantic HTML:**
- Use proper elements: button, nav, main, header
- Landmarks: role or HTML5 elements
- Headings: h1-h6 hierarchy, no skipping

**ARIA Labels:**
- Icon-only buttons: aria-label
- Complex widgets: aria-describedby
- Live regions: aria-live for dynamic updates

**Alternative Text:**
- Images: Descriptive alt text
- Decorative images: alt=""
- Charts: Summary text equivalent

### Forms

**Labels:**
- Every input has visible label
- Associated via for/id
- Required: Asterisk + aria-required

**Error Messages:**
- Inline with input
- aria-describedby pointing to error
- aria-invalid="true"

**Instructions:**
- Provided via aria-describedby or visible text
- Error prevention: Confirm destructive actions

### Motion & Animation

**Respect Preferences:**
- Reduce motion: prefers-reduced-motion
- Animations: Disable or simplify
- Slide/fade → instant show/hide

**Timing:**
- Animations: <200ms for micro-interactions
- Page transitions: <300ms
- Continuous: Optional user control

---

## 29. Animation Guidelines

### Core Principles

**Faster is better:** Keep animations under 200ms for micro-interactions. Animation should feel instantaneous to users.

**Functional, not decorative:** Every animation serves a purpose: transition, feedback, or spatial grounding.

**Respect system preferences:** Honor prefers-reduced-motion.

**Smooth easing:** Use ease-out for enter, ease-in for exit, ease-in-out for movement.

### Animation Categories

**Micro-interactions** (100-200ms)
- Button hover/press
- Checkbox/radio toggle
- Switch/toggle
- Tooltip appearance
- Usage: Immediate feedback

**Transitional** (200-300ms)
- Modal open/close
- Drawer slide
- Dropdown expand
- Page content transitions
- Usage: Spatial awareness

**Loading** (continuous or infinite)
- Spinners
- Skeleton animations
- Progress bars
- Usage: Asynchronous operations

**Entrance** (300-500ms)
- Page load
- Dashboard widget render
- Staggered list appearance
- Usage: Content presentation

### Easing Functions

**Standard:**
- ease-out: cubic-bezier(0, 0, 0.2, 1) - Default for enter
- ease-in: cubic-bezier(0.4, 0, 1, 1) - Default for exit
- ease-in-out: cubic-bezier(0.4, 0, 0.2, 1) - Movement

**Spring** (use sparingly):
- iOS-like: 340, 34, 20, 750
- Elastic: For playful moments (rare in enterprise)

### Animation Properties

**Transform vs. Position:**
- Use transform: translateX/Y for movement (GPU accelerated)
- Avoid animating top, left, width, height when possible
- Use opacity for fade

**Performance:**
- Animate only opacity and transform
- Will-change: Use sparingly, remove after animation
- Test on low-end devices

### Common Animations

**Button Press:**
- Scale: 0.98
- Duration: 100ms
- Easing: ease-out

**Card Hover:**
- TranslateY: -2px
- Shadow: None → lg
- Duration: 200ms
- Easing: ease-out

**Modal:**
- Backdrop: Opacity 0 → 1, 200ms
- Modal: Scale 0.95 → 1, 250ms, spring (subtle)
- Close: Reverse, 150ms, ease-in

**Sidebar Expand/Collapse:**
- Width: 72px → 256px, 200ms, ease-in-out
- Labels: Fade + translateX, 100ms delay

**List Row Enter:**
- Opacity: 0 → 1
- TranslateY: 4px → 0
- Stagger: 30ms delay per row
- Total: 300ms

**Skeleton Loader:**
- Pulse: Opacity 0.4 ↔ 0.8, 1.5s infinite
- Shimmer: Gradient translate, 2s linear infinite

---

## 30. UX Principles

### User-Centric Design

Users are executives and marketing professionals with limited time and specific goals. The interface must **anticipate needs, not demand attention.**

### Core UX Principles

**1. Progressive Disclosure**
- Show essentials first, details on demand
- Advanced options: Collapsible sections, "More" buttons
- Avoid overwhelming new users with power features

**2. Instant Feedback**
- Every action responds within 100ms visually
- Loading states always shown
- Success/error messages clear and actionable

**3. Forgiveness**
- Undo actions when possible (especially destructive)
- Confirmation dialogs for critical actions
- Never lose user data without recovery option

**4. Consistency**
- Same patterns across all modules
- Predictable behavior for common elements
- Platform-specific patterns (URLs same everywhere)

**5. Error Prevention**
- Inline validation for forms
- Disable actions when unable to execute
- Clear labels prevent mistakes
- Confirm dangerous actions

**6. Recognition over Recall**
- Show options, don't require memorization
- Recent items, suggestions based on history
- Clear labels, not cryptic symbols alone

**7. Flexibility & Efficiency**
- Keyboard shortcuts for power users
- Bulk actions
- Templates for common tasks
- Defaults that match common use cases

**8. Aesthetic & Minimalist**
- Only relevant information in interfaces
- Remove unnecessary elements
- Content-focused, not decoration-focused

**9. Help Users Recognize & Recover**
- Clear error messages with solutions
- 404/500 pages with useful alternatives
- Human-readable codes (not "Error 0x7A3F")

**10. Help & Documentation**
- Contextual help: ? icons with tooltips
- Onboarding tours for new features
- Searchable knowledge base

### Interaction Principles

**Click Targets:**
- Minimum 44px (touch devices)
- Spacing: 8px between targets

**Scroll Behavior:**
- Smooth scroll for UX features (anchors, load more)
- Restore scroll position on back navigation
- Sticky headers/footers where content is long

**Form UX:**
- Real-time validation
- Clear error messages near fields
- Submit on Enter (where appropriate)
- Remember inputs on validation errors

**Data Entry:**
- Smart defaults based on user history
- Auto-format inputs (phone, CC, dates)
- Suggestions and autocomplete

**Wizard/Onboarding:**
- Clear progress indicator
- Allow skipping, resume later
- Remember progress across sessions

---

## Appendix A: Design Tokens

### Token Naming Convention

**Format:** `--{category}-{property}-{variant}`

**Examples:**
- `--color-primary`
- `--spacing-md`
- `--radius-lg`
- `--shadow-md`
- `--font-size-lg`

### Implementation Notes

All tokens map to CSS custom properties for theming flexibility.

```css
:root {
  --color-primary: #2563EB;
  --color-primary-foreground: #FFFFFF;
  --spacing-md: 16px;
  --radius-lg: 12px;
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
}
```

Dark mode overrides:
```css
.dark {
  --color-primary: #3B82F6;
  --color-background: #0F172A;
}
```

---

## Appendix B: Component Library

### Core Components

Based on Radix UI primitives + Tailwind CSS classes

**Forms:**
- Button (all variants)
- Input (text, email, password, search)
- Textarea
- Select (single, multi)
- Checkbox, Radio, Switch
- Date picker

**Data Display:**
- Table (with selection, sorting, filtering)
- Card (static, interactive, metric)
- Badge/Status indicator
- Avatar
- Tooltip, Popover

**Feedback:**
- Alert
- Toast/Notification
- Spinner/Loading
- Progress bar
- Empty state (various patterns)

**Navigation:**
- Sidebar
- Header
- Breadcrumbs
- Tabs
- Pagination
- Command palette

**Layout:**
- Grid system (12-col)
- Container
- Dialog
- Drawer
- Sheet

**Overlays:**
- Modal
- Dropdown menu
- Context menu
- Command palette

---

## Appendix C: Brand Guidelines

### Voice & Tone

**Voice:** Professional, confident, helpful, authoritative

**Tone by Context:**
- Errors: Apologetic, solution-focused
- Success: Enthusiastic but not giddy
- Empty states: Encouraging, informative
- AI Copilot: Collaborative, smart, reassuring

### Visual Language

- **Clarity** > trendiness
- **Function** > decoration
- **Trust** > flash
- **Speed** > complexity

### Messaging

- Use "you" and "your" for addressing user
- Avoid jargon unless necessary (define terms)
- Be concise (users are busy)
- Lead with action verbs

---

## Appendix D: Version History

**Version 1.0** (June 2026)
- Initial comprehensive design system
- All 27 sections defined
- Token system established
- Component library specified

---

*This document is maintained by the Calixo Design Team. Updates are scheduled monthly. Changes require design review and validation against design tokens.*