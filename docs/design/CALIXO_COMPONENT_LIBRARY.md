# CALIXO COMPONENT LIBRARY

## Enterprise AI Marketing Operating System

**Version:** 1.0.0  
**Created:** June 2026  
**Maintained by:** Principal Product Design Team  

---

## Table of Contents

1. [Component Philosophy](#1-component-philosophy)
2. [Design Principles](#2-design-principles)
3. [Atomic Design Architecture](#3-atomic-design-architecture)
4. [Component Naming Convention](#4-component-naming-convention)
5. [Folder Structure Standards](#5-folder-structure-standards)
6. [Component Categories](#6-component-categories)

---

## APP SHELL COMPONENTS

7. [AppShell](#7-appshell)
8. [Sidebar](#8-sidebar)
9. [Top Navigation](#9-top-navigation)
10. [Workspace Switcher](#10-workspace-switcher)
11. [Organization Switcher](#11-organization-switcher)
12. [Command Palette](#12-command-palette)
13. [Search Bar](#13-search-bar)
14. [Notification Center](#14-notification-center)
15. [Breadcrumb](#15-breadcrumb)
16. [Theme Toggle](#16-theme-toggle)
17. [User Menu](#17-user-menu)
18. [Footer](#18-footer)

---

## PAGE COMPONENTS

19. [Page Header](#19-page-header)
20. [Section Header](#20-section-header)
21. [Toolbar](#21-toolbar)
22. [Filter Bar](#22-filter-bar)
23. [Action Bar](#23-action-bar)
24. [Sticky Header](#24-sticky-header)
25. [Tabs](#25-tabs)
26. [Accordion](#26-accordion)
27. [Drawer](#27-drawer)
28. [Modal](#28-modal)
29. [Wizard](#29-wizard)

---

## CARD COMPONENTS

30. [Executive KPI Card](#30-executive-kpi-card)
31. [Analytics Card](#31-analytics-card)
32. [Campaign Card](#32-campaign-card)
33. [Social Card](#33-social-card)
34. [Competitor Card](#34-competitor-card)
35. [Insight Card](#35-insight-card)
36. [Recommendation Card](#36-recommendation-card)
37. [AI Card](#37-ai-card)
38. [Budget Card](#38-budget-card)
39. [Notification Card](#39-notification-card)
40. [Quick Action Card](#40-quick-action-card)

---

## TABLE COMPONENTS

41. [Enterprise Table](#41-enterprise-table)
42. [Sorting](#42-sorting)
43. [Filtering](#43-filtering)
44. [Pagination](#44-pagination)
45. [Bulk Actions](#45-bulk-actions)
46. [Column Visibility](#46-column-visibility)
47. [Column Pinning](#47-column-pinning)
48. [Resizable Columns](#48-resizable-columns)
49. [Export](#49-export)
50. [Inline Editing](#50-inline-editing)

---

## FORM COMPONENTS

51. [Input](#51-input)
52. [Textarea](#52-textarea)
53. [Dropdown](#53-dropdown)
54. [Autocomplete](#54-autocomplete)
55. [Date Picker](#55-date-picker)
56. [Time Picker](#56-time-picker)
57. [Checkbox](#57-checkbox)
58. [Radio](#58-radio)
59. [Toggle](#59-toggle)
60. [Rich Text Editor](#60-rich-text-editor)
61. [File Upload](#61-file-upload)
62. [Media Upload](#62-media-upload)
63. [Avatar Upload](#63-avatar-upload)

---

## CHART COMPONENTS

64. [Chart Container](#64-chart-container)
65. [Line Chart](#65-line-chart)
66. [Area Chart](#66-area-chart)
67. [Bar Chart](#67-bar-chart)
68. [Pie Chart](#68-pie-chart)
69. [Donut Chart](#69-donut-chart)
70. [Heatmap](#70-heatmap)
71. [Funnel](#71-funnel)
72. [Gauge](#72-gauge)
73. [Timeline](#73-timeline)

---

## AI COMPONENTS

74. [AI Insight](#74-ai-insight)
75. [AI Recommendation](#75-ai-recommendation)
76. [AI Score](#76-ai-score)
77. [AI Confidence](#77-ai-confidence)
78. [AI Alert](#78-ai-alert)
79. [AI Prompt Box](#79-ai-prompt-box)
80. [Conversation Timeline](#80-conversation-timeline)
81. [Generated Content Card](#81-generated-content-card)

---

## SOCIAL COMPONENTS

82. [Post Card](#82-post-card)
83. [Content Calendar](#83-content-calendar)
84. [Media Library](#84-media-library)
85. [Inbox Card](#85-inbox-card)
86. [Conversation](#86-conversation)
87. [Comments](#87-comments)
88. [Hashtag Widget](#88-hashtag-widget)
89. [Competitor Card](#89-competitor-card)
90. [Approval Card](#90-approval-card)

---

## ADS COMPONENTS

91. [Campaign Card](#91-campaign-card)
92. [Campaign Wizard](#92-campaign-wizard)
93. [Audience Builder](#93-audience-builder)
94. [Keyword Widget](#94-keyword-widget)
95. [Budget Widget](#95-budget-widget)
96. [Performance Widget](#96-performance-widget)
97. [Optimization Widget](#97-optimization-widget)

---

## CRM COMPONENTS

98. [Lead Card](#98-lead-card)
99. [Opportunity Card](#99-opportunity-card)
100. [Pipeline](#100-pipeline)
101. [Task](#101-task)
102. [Activity Timeline](#102-activity-timeline)

---

## AUTOMATION COMPONENTS

103. [Workflow Builder](#103-workflow-builder)
104. [Trigger](#104-trigger)
105. [Condition](#105-condition)
106. [Action](#106-action)
107. [Execution Timeline](#107-execution-timeline)

---

## REPORT COMPONENTS

108. [Report Builder](#108-report-builder)
109. [Widget](#109-widget)
110. [Dashboard Widget](#110-dashboard-widget)
111. [PDF Preview](#111-pdf-preview)
112. [Export Panel](#112-export-panel)

---

## FEEDBACK COMPONENTS

113. [Toast](#113-toast)
114. [Banner](#114-banner)
115. [Alert](#115-alert)
116. [Confirmation](#116-confirmation)
117. [Loading](#117-loading)
118. [Skeleton](#118-skeleton)
119. [Progress](#119-progress)
120. [Empty State](#120-empty-state)
121. [Error State](#121-error-state)

---

## 1. Component Philosophy

### Core Beliefs

**Composability Over Complexity:** Every component should be a building block that combines with others to create complex interfaces. Simple, focused components are easier to understand, test, and maintain.

**Consistency Enables Speed:** When components behave predictably, users develop muscle memory. This reduces cognitive load and increases productivity for users spending 8-10 hours daily in the platform.

**Accessibility is Non-Negotiable:** Every component must meet WCAG 2.1 AA standards by default. Accessibility is not an afterthought—it's a fundamental requirement.

**Enterprise-Grade Polish:** Attention to micro-interactions, edge cases, and error states builds user confidence. The details matter.

**Progressive Disclosure:** Components should reveal complexity gradually. Basic usage is simple; advanced features are available when needed.

### Design Values

- **Clarity:** Every component has a single, clear purpose
- **Flexibility:** Components adapt to various contexts without customization
- **Robustness:** Components handle edge cases gracefully
- **Performance:** Fast rendering, minimal re-renders, optimized bundle size
- **Maintainability:** Well-documented, tested, and versioned

---

## 2. Design Principles

### Principle 1: Content First

Components prioritize content over chrome. Decorative elements are minimal. Visual hierarchy guides attention to what matters.

**Application:**
- Generous whitespace
- Clear typography scale
- Semantic color usage only

### Principle 2: Functional Beauty

Aesthetics serve function. Every visual element has a purpose. Beauty emerges from clarity and consistency, not decoration.

**Application:**
- Shadows indicate elevation
- Colors convey meaning (not decoration)
- Animations provide feedback (not entertainment)

### Principle 3: Inclusive by Default

Components work for everyone regardless of ability, device, or context. Accessibility, responsiveness, and internationalization are built-in.

**Application:**
- Keyboard navigation support
- Screen reader announcements
- High contrast modes
- Touch-friendly targets

### Principle 4: Progressive Enhancement

Components work without JavaScript (where possible). Enhanced experiences unlock with modern browsers. Graceful degradation ensures functionality.

**Application:**
- Semantic HTML foundations
- CSS-only states where possible
- JavaScript for complex interactions

### Principle 5: Developer Experience

Components are easy to use correctly and hard to misuse. Clear APIs, comprehensive documentation, and helpful error messages.

**Application:**
- Intuitive prop names
- TypeScript types for all props
- Default values for optional props
- Clear error messages

---

## 3. Atomic Design Architecture

### Design System Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                      PAGES                                   │
│              (Dashboard, Analytics, Ads)                     │
├─────────────────────────────────────────────────────────────┤
│                    TEMPLATES                                │
│         (Dashboard Layout, Analytics Layout)                 │
├─────────────────────────────────────────────────────────────┤
│                    ORGANISMS                                 │
│      (Card + Chart + Table + Form combinations)             │
├─────────────────────────────────────────────────────────────┤
│                    MOLECULES                                 │
│    (Button + Input + Icon + Label combinations)             │
├─────────────────────────────────────────────────────────────┤
│                      ATOMS                                   │
│  (Color, Typography, Spacing, Icon, Shadow)                 │
└─────────────────────────────────────────────────────────────┘
```

### Atoms (Foundational)

**Definition:** Basic building blocks that cannot be broken down further.

**Examples:**
- Colors (primary, success, warning, danger)
- Typography (font family, size, weight, line height)
- Spacing (margin, padding, gap)
- Icons (Lucide/Phosphor icons)
- Shadows (elevation levels)
- Border radius (radius scale)

### Molecules (Simple Combinations)

**Definition:** Groups of atoms that function together as a unit.

**Examples:**
- Button + Icon
- Input + Label + Error Message
- Avatar + Name + Status
- Icon + Text Label

### Organisms (Complex Components)

**Definition:** Complex UI components composed of molecules and atoms.

**Examples:**
- Card (header + body + footer)
- Table (header + rows + pagination)
- Form (inputs + buttons + validation)
- Navigation (links + icons + active states)

### Templates (Page Layouts)

**Definition:** Page-level structures that define content placement.

**Examples:**
- Dashboard Template (sidebar + header + content grid)
- Analytics Template (filters + charts + tables)
- Modal Template (backdrop + container + header + body + footer)

### Pages (Specific Instances)

**Definition:** Specific implementations of templates with real content.

**Examples:**
- Dashboard Page
- Analytics Page
- Ads Manager Page

---

## 4. Component Naming Convention

### PascalCase for Components

All component names use PascalCase (capitalize first letter of each word).

**Examples:**
- `ExecutiveKpiCard`
- `CampaignTable`
- `NotificationCenter`
- `DatePicker`

### BEM-Inspired Modifiers

Use suffixes to denote variants or states.

**Pattern:** `{ComponentName}{Variant}{State}`

**Examples:**
- `ButtonPrimary`
- `ButtonSecondary`
- `ButtonDestructive`
- `CardInteractive`
- `CardMetric`
- `InputError`
- `InputDisabled`

### Component Categories as Prefixes (Optional)

For large component families, use category prefix.

**Pattern:** `{Category}{ComponentName}`

**Examples:**
- `TableSortable`
- `TableFilterable`
- `ChartLine`
- `ChartBar`
- `FormInput`
- `FormTextarea`

### File Naming

**Pattern:** `{ComponentName}.tsx`

**Examples:**
- `ExecutiveKpiCard.tsx`
- `CampaignTable.tsx`
- `NotificationCenter.tsx`

### Index Files

Export components from `index.ts` for clean imports.

```typescript
// components/ExecutiveKpiCard/index.ts
export { default } from "./ExecutiveKpiCard";
export type { ExecutiveKpiCardProps } from "./ExecutiveKpiCard.types";
```

---

## 5. Folder Structure Standards

### Component Directory Structure

```
src/components/
├── ui/                          # Shared base components (shadcn/ui)
│   ├── button/
│   │   ├── Button.tsx
│   │   ├── Button.types.ts
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   ├── input/
│   ├── card/
│   └── ...
│
├── dashboard/                   # Dashboard-specific components
│   ├── ExecutiveKpiCard/
│   │   ├── ExecutiveKpiCard.tsx
│   │   ├── ExecutiveKpiCard.types.ts
│   │   ├── ExecutiveKpiCard.stories.tsx
│   │   ├── ExecutiveKpiCard.test.tsx
│   │   ├── ExecutiveKpiCard.module.css
│   │   └── index.ts
│   ├── KpiGrid/
│   ├── MarketingPerformanceChart/
│   └── DashboardShell.tsx
│
├── analytics/                   # Analytics-specific components
│   ├── RevenueChart/
│   ├── ConversionFunnel/
│   └── AnalyticsPage.tsx
│
├── ads/                         # Ads Manager components
│   ├── CampaignTable/
│   ├── BudgetOverview/
│   └── AdsManagerPage.tsx
│
├── social/                      # Social Media components
│   ├── SocialDashboard/
│   ├── ContentCalendar/
│   └── PostCard.tsx
│
├── layout/                      # Layout components
│   ├── Sidebar/
│   ├── Header/
│   ├── AppShell/
│   └── Footer.tsx
│
└── common/                      # Shared across features
    ├── Avatar/
    ├── Badge/
    ├── Card/
    └── IconBadge/
```

### File Organization Rules

1. **One component per folder** - Each component has its own directory
2. **Co-locate files** - Keep component files together
3. **Index exports** - Use `index.ts` for clean imports
4. **Types separate** - Use `.types.ts` for TypeScript interfaces
5. **Stories separate** - Use `.stories.tsx` for Storybook
6. **Tests separate** - Use `.test.tsx` for unit tests
7. **Styles separate** - Use `.module.css` for CSS Modules (if needed)

### Import Aliases

```typescript
// tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/ui/*": ["./src/components/ui/*"],
      "@/dashboard/*": ["./src/components/dashboard/*"],
      "@/analytics/*": ["./src/components/analytics/*"],
      "@/ads/*": ["./src/components/ads/*"],
      "@/social/*": ["./src/components/social/*"],
      "@/layout/*": ["./src/components/layout/*"],
      "@/common/*": ["./src/components/common/*"]
    }
  }
}
```

---

## 6. Component Categories

### Category Organization

Components are organized by functional domain:

- **App Shell** - Layout, navigation, chrome
- **Page** - Page-level patterns and containers
- **Card** - Card variants by use case
- **Table** - Data table with enterprise features
- **Form** - Form inputs and controls
- **Chart** - Data visualization components
- **AI** - AI-specific components
- **Social** - Social media components
- **Ads** - Advertising components
- **CRM** - Customer relationship management
- **Automation** - Workflow automation
- **Report** - Reporting and export
- **Feedback** - Notifications, alerts, loading states

---

## 7. AppShell

### Purpose

The AppShell is the top-level layout wrapper that provides consistent structure across all authenticated pages. It includes the sidebar, header, and main content area.

### When to Use

- All authenticated application pages
- Dashboard, Analytics, Ads, Social, Settings
- Any page requiring navigation and global controls

### When NOT to Use

- Landing page (public marketing)
- Authentication pages (login, forgot password)
- Error pages (404, 500)
- Modal content (use without AppShell)

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar (256px) │          Header (64px)                      │
│                │──────────────────────────────────────────────│
│                │                                             │
│ Navigation     │          Main Content Area                  │
│                │                                             │
│ - Dashboard    │    (Scrollable, max-width constrained)       │
│ - Analytics    │                                             │
│ - Ads          │                                             │
│ - Social       │                                             │
│ - Settings     │                                             │
│                │                                             │
│                │                                             │
│ [User Profile] │                                             │
└────────────────┴─────────────────────────────────────────────┘
```

### Variants

**Default (Expanded)**
- Sidebar: 256px wide, full labels visible
- Header: 64px height
- Content: Remaining width

**Collapsed**
- Sidebar: 72px wide, icons only
- Header: 64px height
- Content: Expanded width

**Mobile**
- Sidebar: Hidden, off-canvas drawer
- Header: 64px, hamburger menu visible
- Content: Full width

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| children | ReactNode | required | Main content to render |
| sidebar | ReactNode | Sidebar | Sidebar component |
| header | ReactNode | Header | Header component |
| collapsed | boolean | false | Initial sidebar state |
| onCollapseChange | (collapsed: boolean) => void | undefined | Callback when state changes |

### States

**Default:** Sidebar expanded, header visible, content scrollable

**Collapsed:** Sidebar icons only, header visible, content expanded

**Loading:** Skeleton placeholders for sidebar and header

**Error:** Fallback UI if AppShell fails to render

### Interactions

**Sidebar Toggle:**
- Button click toggles collapse state
- Smooth transition: 200ms ease-in-out
- Persist state to localStorage
- Keyboard shortcut: `[` to toggle

**Content Scroll:**
- Main content scrolls independently
- Sidebar and header remain fixed
- Sticky headers within content scroll with content

### Accessibility

- **Landmark:** `<aside>` for sidebar, `<header>` for header, `<main>` for content
- **Skip Link:** "Skip to main content" link, visible on focus
- **ARIA:** `aria-label` on sidebar and header
- **Keyboard:** Tab navigates between sidebar, header, and content

### Design Tokens

```css
--sidebar-width: 256px;
--sidebar-width-collapsed: 72px;
--header-height: 64px;
--sidebar-transition: 200ms ease-in-out;
--content-max-width: 1440px;
--content-padding: 32px;
```

### Example Usage

```tsx
<AppShell>
  <DashboardPage />
</AppShell>
```

### Best Practices

- Always use AppShell for authenticated pages
- Keep sidebar navigation items to 8-12 max
- Persist sidebar collapse state to localStorage
- Ensure content area is scrollable independently
- Test keyboard navigation thoroughly

### Common Mistakes

- ❌ Nesting AppShell inside AppShell
- ❌ Placing modals inside AppShell content (use portal)
- ❌ Forgetting to set aria-label on landmarks
- ❌ Using fixed positioning inside content (breaks scroll)

---

## 8. Sidebar

### Purpose

The Sidebar provides persistent navigation and quick access to platform features. It adapts between expanded and collapsed states.

### When to Use

- Primary navigation in AppShell
- Persistent access to main features
- Workspace/organization context

### When NOT to Use

- Mobile (use off-canvas drawer instead)
- Modal or drawer content
- Landing pages

### Layout Structure

```
┌──────────────────────┐
│ [Logo] Calixo  [◀]   │ ← Header area (64px)
│ AI Marketing OS      │
├──────────────────────┤
│ [Search]              │ ← Search (optional, 48px)
├──────────────────────┤
│                      │
│ ┌──────────────────┐ │
│ │ 📊 Dashboard     │ │ ← Navigation item
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ 📈 Analytics     │ │ ← Active item
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ 📢 Ads           │ │
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ 💬 Social        │ │
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ ⚙️  Settings      │ │
│ └──────────────────┘ │
│                      │
├──────────────────────┤
│ ✨ Pro plan active   │ ← Footer area
│ [Avatar] User        │
└──────────────────────┘
```

### Variants

**Expanded (Default)**
- Width: 256px
- Labels visible
- Icons: 20px
- Search: Visible

**Collapsed**
- Width: 72px
- Icons only, centered
- Icons: 20px
- Search: Hidden
- Hover: Tooltip with label (optional)

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| items | NavigationItem[] | required | Navigation links |
| collapsed | boolean | false | Collapsed state |
| onCollapse | () => void | undefined | Toggle callback |
| searchable | boolean | true | Show search input |
| user | UserInfo | undefined | User profile info |
| plan | PlanInfo | undefined | Plan/upgrade info |

### States

**Default:** Expanded, items visible, hover states on items

**Collapsed:** Icons centered, tooltips on hover

**Active Item:** Primary background, bold icon, semantic indicator

**Hover:** Accent background, smooth transition

### Interactions

**Navigation Click:**
- Navigate to link
- Mark as active
- Close mobile drawer

**Collapse Toggle:**
- Animate width transition
- Fade labels out/in
- Adjust content margin

**Search (if present):**
- Focus on click
- Open command palette on Enter

### Accessibility

- **Role:** `navigation` or `<nav>`
- **Aria:** `aria-label="Main navigation"`
- **Active:** `aria-current="page"` on active link
- **Keyboard:** Tab through items, Enter to activate

### Design Tokens

```css
--sidebar-width: 256px;
--sidebar-width-collapsed: 72px;
--sidebar-background: var(--card);
--sidebar-border: var(--border);
--sidebar-item-height: 40px;
--sidebar-item-padding: 0 16px;
--sidebar-item-radius: var(--radius-lg);
```

### Example Usage

```tsx
<Sidebar
  items={navigationItems}
  collapsed={collapsed}
  onCollapse={() => setCollapsed(!collapsed)}
  user={currentUser}
/>
```

---

## 9. Top Navigation

### Purpose

The Top Navigation (Header) provides global access to search, notifications, workspace controls, and user menu.

### When to Use

- At top of every authenticated page
- Provides global controls and context
- Persistent across page navigation

### When NOT to Use

- Landing pages (use simpler Navbar)
- Modals or drawers
- Embedded content (emails, docs)

### Layout Structure

```
┌──────────────────────────────────────────────────────────────┐
│ [≡] Dashboard                    [Search campaigns...  ] [🔔]│
│                                              [🌙] [Workspace▾]│
│                                              [Avatar] Uttam   │
└──────────────────────────────────────────────────────────────┘
```

### Variants

**Default**
- Height: 64px
- Search: Visible, 400px max width
- Actions: Bell, theme, workspace, user

**Compact**
- Height: 56px
- Search: Hidden or icon-only
- Actions: Reduced to icons only

**Mobile**
- Height: 64px
- Search: Hidden (icon opens modal)
- Actions: Icons only, no labels

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| title | string | required | Page title |
| searchable | boolean | true | Show search bar |
| onSearch | (query: string) => void | undefined | Search callback |
| notifications | Notification[] | [] | Notification count |
| onNotificationClick | () => void | undefined | Open notifications |
| workspace | Workspace | undefined | Workspace selector |
| user | User | required | Current user |

### States

**Default:** All controls visible, border-bottom

**Scrolled:** Shadow appears (sticky header)

**Search Focused:** Search expands, other controls hide

**Notifications Active:** Badge shows unread count

### Interactions

**Search:**
- Click opens search modal
- Type filters results
- Enter navigates to first result

**Notifications:**
- Click opens notification center
- Badge shows count > 0

**Workspace:**
- Click opens workspace dropdown
- Switch workspace reloads data

**User Menu:**
- Click opens dropdown
- Links to profile, settings, logout

### Accessibility

- **Role:** `banner` or `<header>`
- **Aria:** `aria-label="Page header"`
- **Search:** `aria-label="Search"`
- **Buttons:** All icon buttons have `aria-label`

### Design Tokens

```css
--header-height: 64px;
--header-background: var(--card);
--header-border: var(--border);
--header-shadow: var(--shadow-sm);
--search-width: 400px;
--header-action-size: 40px;
```

### Example Usage

```tsx
<Header
  title="Dashboard"
  searchable
  onSearch={handleSearch}
  notifications={notifications}
  user={currentUser}
/>
```

---

## 10. Workspace Switcher

### Purpose

Allows users to switch between multiple workspaces or organizations.

### When to Use

- User belongs to multiple workspaces
- Header area, right side
- After workspace creation flow

### When NOT to Use

- Single workspace users (hide entirely)
- Landing pages
- Onboarding flow (before workspace creation)

### Layout Structure

```
┌─────────────────────────┐
│ [Avatar] Workspace Name ▾│
│ 24 active campaigns      │
└─────────────────────────┘
```

### Variants

**Default**
- Avatar + name + chevron
- Shows campaign count or metric below

**Compact**
- Avatar + name only
- No subtext

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| workspaces | Workspace[] | required | Available workspaces |
| current | string | required | Current workspace ID |
| onChange | (id: string) => void | required | Selection callback |
| compact | boolean | false | Compact variant |

### States

**Default:** Current workspace shown, dropdown closed

**Open:** Dropdown with all workspaces, search if >5

**Hover:** Highlight on workspace items

**Loading:** Skeleton while switching

### Interactions

**Click:**
- Open dropdown
- List all workspaces
- Click selects, triggers onChange

**Search (if applicable):**
- Filter workspaces by name
- Clear hides filter

### Accessibility

- **Role:** `combobox` or `button` with `aria-haspopup`
- **Aria:** `aria-label="Workspace switcher"`
- **Keyboard:** Enter/Space opens, arrows navigate, Enter selects

### Design Tokens

```css
--switcher-height: 48px;
--switcher-padding: 12px 16px;
--switcher-radius: var(--radius-lg);
```

---

## 11. Organization Switcher

### Purpose

Switches between organizations (for enterprise/agency users managing multiple clients).

### When to Use

- Agency users
- Enterprise users with multiple orgs
- Organization-level data segregation

### When NOT to Use

- Single organization users
- Personal accounts

*[Similar structure to Workspace Switcher with org-specific properties]*

---

## 12. Command Palette

### Purpose

Quick access to all platform features via keyboard shortcut `/`.

### When to Use

- Triggered by `/` key
- From header search icon
- From anywhere in app

### When NOT to Use

- Mobile (use search icon instead)
- When user has modal open

### Layout Structure

```
┌─────────────────────────────────────────
│ Search commands...                      │
├─────────────────────────────────────────┤
│ RECENT                                 │
│ > Dashboard                     ⌘1      │
│ > Create Campaign               ⌘N      │
│ > View Analytics                ⌘A      │
├─────────────────────────────────────────┤
│ SUGGESTED                              │
│ > Pause all campaigns                   │
│ > Generate Q2 report                    │
│ > Review AI recommendations             │
└─────────────────────────────────────────┘
```

### Variants

**Default**
- Centered modal overlay
- ~600px wide, max 500px height
- Sections with headers

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| open | boolean | required | Visibility state |
| onOpenChange | (open: boolean) => void | required | Close callback |
| commands | Command[] | required | Available commands |
| recent | string[] | [] | Recent command IDs |

### States

**Default:** Closed, hidden

**Open:** Visible, focused search input

**Loading:** Results shown with skeleton

**Empty:** "No results found" message

### Interactions

**Open:**
- Press `/` or click search
- Focus search input
- Show recent commands

**Type:**
- Filter commands by title/category
- Show loading if async

**Navigate:**
- Arrow keys move selection
- Enter activates command
- Escape closes

### Accessibility

- **Role:** `dialog`
- **Aria:** `aria-label="Command palette"`
- **Focus Trap:** Focus locked within modal
- **Keyboard:** `/` to open, Esc to close

### Design Tokens

```css
--command-palette-width: 600px;
--command-palette-max-height: 80vh;
--command-item-height: 48px;
```

---

## 13. Search Bar

### Purpose

Global search input for finding campaigns, reports, settings, and features.

### When to Use

- Header area
- Command palette trigger
- Dedicated search page

### When NOT to Use

- Filtering within tables (use column filter)
- Refining charts (use chart controls)

### Layout Structure

```
┌──────────────────────────────────┐
│ 🔍 Search campaigns, insights... │
└──────────────────────────────────┘
```

### Variants

**Default (Header)**
- Full width in header
- Icon + placeholder
- Borderless or subtle border

**Expanded (Modal)**
- Full screen overlay
- Large, prominent input
- Results dropdown below

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| value | string | "" | Input value |
| onChange | (value: string) => void | required | Change handler |
| placeholder | string | "Search..." | Placeholder text |
| onFocus | () => void | undefined | Focus handler |
| onBlur | () => void | undefined | Blur handler |

### States

**Default:** Placeholder visible, subtle border

**Focused:** Border primary, shadow ring

**Loading:** Spinner inside input

**Results:** Dropdown with results

### Interactions

**Type:** Debounced search (300ms)

**Focus:** Open recent searches

**Enter:** Navigate to first result

**Escape:** Clear and blur

### Accessibility

- **Role:** `search` or `<input type="search">`
- **Aria:** `aria-label="Search"`
- **Results:** `role="listbox"` with `role="option"`

### Design Tokens

```css
--search-height: 40px;
--search-padding: 0 16px;
--search-radius: var(--radius-lg);
--search-icon-size: 18px;
```

---

## 14. Notification Center

### Purpose

Displays recent notifications, alerts, and updates. Provides quick access to important information.

### When to Use

- Triggered by bell icon in header
- Persistent panel on dashboard (optional)

### When NOT to Use

- Critical alerts (use banner instead)
- Form validation errors (inline)

### Layout Structure

```
┌──────────────────────────────────┐
│ Notifications              [3] ✕  │
├──────────────────────────────────┤
│ ● Budget 85% spent      2h ago   │
│   Campaign "X" approaching limit  │
│   [View Campaign]                 │
├──────────────────────────────────┤
│ ● New lead acquired       15m ago │
│   sam@company.com assigned        │
│   [View Lead]                     │
├──────────────────────────────────┤
│ ● Report ready            1d ago  │
│   Monthly performance report      │
│   [Download]                      │
└──────────────────────────────────┘
```

### Variants

**Dropdown (Default)**
- 400px wide
- Max 400px height with scroll
- Triggered from bell icon

**Panel (Alternative)**
- Right side panel, 400px
- Persistent, closable
- Slide-in animation

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| notifications | Notification[] | required | Notification list |
| onMarkRead | (id: string) => void | required | Mark as read |
| onDismiss | (id: string) => void | required | Dismiss notification |
| maxHeight | number | 400 | Max height in px |

### States

**Default:** Unread count shown on bell badge

**Open:** Panel visible, focused

**Loading:** Skeleton placeholders

**Empty:** "No notifications" with bell icon

### Interactions

**Open:**
- Click bell icon
- Panel slides in from right
- Focus first notification

**Dismiss:**
- Click X or "Dismiss"
- Removes with animation
- Updates unread count

**Mark Read:**
- Click notification
- Marks as read
- Navigates to link

### Accessibility

- **Role:** `complementary` or `<aside>`
- **Aria:** `aria-label="Notifications"`
- **Live Region:** `aria-live="polite"` for new notifications
- **Keyboard:** Tab navigates items, Esc closes

### Design Tokens

```css
--notification-width: 400px;
--notification-max-height: 400px;
--notification-item-height: 80px;
--notification-badge-size: 8px;
```

---

## 15. Breadcrumb

### Purpose

Shows current page location in navigation hierarchy.

### When to Use

- Deep page hierarchies (3+ levels)
- Settings pages
- Content editing flows

### When NOT to Use

- Top-level pages (Dashboard, Analytics)
- Flat navigation structures

### Layout Structure

```
Home > Campaigns > Summer Sale > Edit
```

### Variants

**Default**
- Separator: `/` or `›`
- All items clickable except current

**Minimal**
- Only parent + current
- Compact for mobile

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| items | BreadcrumbItem[] | required | Navigation items |
| separator | string | "/" | Separator character |

---

## 16. Theme Toggle

### Purpose

Switches between light and dark modes.

### When to Use

- Header area
- Settings page
- User preferences

### When NOT to Use

- Landing pages
- Before user login

### Variants

**Button**
- Icon only (sun/moon)
- 40x40px

**Switch**
- Toggle switch
- With "Light/Dark" labels

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| theme | "light" \| "dark" | required | Current theme |
| onChange | (theme: Theme) => void | required | Change handler |

---

## 17. User Menu

### Purpose

Provides access to user profile, settings, and logout.

### When to Use

- Header area, right side
- Workspace switcher nearby

### When NOT to Use

- Before login
- Public pages

### Layout Structure

```
┌────────────────────────┐
│ [Avatar]     Uttam ▾    │
│ Administrator          │
├────────────────────────┤
│ Profile                 │
│ Settings                │
│ Billing                 │
│ Help                    │
│ Logout                  │
└────────────────────────┘
```

---

## 18. Footer

### Purpose

Provides copyright, links, and secondary information.

### When to Use

- Landing pages (marketing footer)
- Employee-facing apps (minimal)

### When NOT to Use

- Dashboard and app pages (no footer needed)

### Layout Structure

```
┌────────────────────────────────────────┐
│ © 2026 Calixo. All rights reserved.   │
│ Privacy  Terms  Security  Status      │
└────────────────────────────────────────┘
```

---

## 19. Page Header

### Purpose

Provides page-level title, description, and primary actions.

### When to Use

- Top of every page
- Below global header
- Provides context for page content

### When NOT to Use

- Dashboard widgets (use card header)
- Modal content

### Layout Structure

```
┌────────────────────────────────────────┐
│ Dashboard                     [Export ▾] [Refresh] │
│ Monitor your marketing performance   [+ New]      │
└────────────────────────────────────────┘
```

### Variants

**Default**
- Title: 30px, semibold
- Description: 14px, muted
- Actions: Right-aligned buttons

**Compact**
- Title only, no description
- Actions hidden or minimal

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| title | string | required | Page title |
| description | string | undefined | Page description |
| actions | ReactNode | undefined | Action buttons |
| breadcrumb | BreadcrumbItem[] | undefined | Breadcrumb items |

---

## 20. Section Header

### Purpose

Titles and describes major content sections within a page.

### When to Use

- Before card groups
- Before complex widgets
- To separate content sections

### When NOT to Use

- Card internal headers (use card header)

### Layout Structure

```
Recent Activity                                    View All
```

### Variants

**Default**
- Title: 20px, semibold
- Action: Right-aligned link/button

**With Count**
- Title: "Campaigns (12)"
- Shows item count

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| title | string | required | Section title |
| description | string | undefined | Optional description |
| action | ReactNode | undefined | Action button/link |
| count | number | undefined | Item count |

---

## 21. Toolbar

### Purpose

Groups related actions and controls for a content area.

### When to Use

- Above data tables
- Above card grids
- Bulk operations

### When NOT to Use

- Single actions (use button inline)
- Primary page actions (use Page Header)

### Layout Structure

```
┌────────────────────────────────────────┐
│ [Delete] [Duplicate] [Export]  12 selected │
└────────────────────────────────────────┘
```

---

## 22. Filter Bar

### Purpose

Provides controls for filtering and refining data views.

### When to Use

- Above data tables
- Above charts
- Analytics pages

### When NOT to Use

- Simple lists (use inline filters)

### Layout Structure

```
┌────────────────────────────────────────┐
│ Date Range [Last 30 days ▾]  Channel [All ▾]  Status [Active ▾]  [Reset]│
└────────────────────────────────────────┘
```

### Variants

**Default**
- Horizontal layout
- Dropdowns or inputs
- Reset button

**Compact**
- Icon-only filters
- Expanded on click

---

## 23. Action Bar

### Purpose

Displays contextual actions for selected items.

### When to Use

- After row selection in table
- After bulk selection
- Context-sensitive actions

### When NOT to Use

- Always-visible actions (use Toolbar)

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| actions | Action[] | required | Available actions |
| selectedCount | number | required | Selected items count |
| onClear | () => void | required | Clear selection |

---

## 24. Sticky Header

### Purpose

Header that remains visible while scrolling content.

### When to Use

- Long tables
- Long forms
- Comparison views

### When NOT to Use

- Short content (< viewport height)

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| offset | number | 64 | Distance from top (px) |
| shadow | boolean | true | Show shadow when stuck |

---

## 25. Tabs

### Purpose

Organizes content into switchable panels.

### When to Use

- Switching between views
- Related content categories
- Settings sections

### When NOT to Use

- Single section (no tabs needed)
- Non-related content (use navigation)

### Variants

**Default (Underline)**
- Horizontal tabs
- Bottom border indicator
- Active: primary color

**Pills**
- Rounded background
- Active: primary background

**Vertical**
- Left side tabs
- For settings pages

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| tabs | Tab[] | required | Tab definitions |
| active | string | required | Active tab ID |
| onChange | (id: string) => void | required | Change handler |
| variant | "underline" \| "pills" \| "vertical" | "underline" | Visual style |

---

## 26. Accordion

### Purpose

Collapsible content sections to reduce vertical space.

### When to Use

- FAQ sections
- Settings with groups
- Progressive disclosure

### When NOT to Use

- Critical information (always visible)
- Frequently accessed content

### Variants

**Default**
- Single open at a time
- Chevron rotation

**Multiple**
- Multiple can be open
- Independent toggles

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| items | AccordionItem[] | required | Section definitions |
| allowMultiple | boolean | false | Multiple open allowed |
| defaultOpen | string[] | [] | Initially open items |

---

## 27. Drawer

### Purpose

Sliding panel for secondary content or forms.

### When to Use

- Editing without leaving page
- Filter panels
- Detail views

### When NOT to Use

- Critical actions (use Modal)
- Simple confirmations

### Variants

**Right (Default)**
- Slides from right
- 400-600px wide

**Left**
- Slides from left
- Navigation drawers

**Bottom**
- Slides from bottom (mobile)
- Full width

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| open | boolean | required | Visibility |
| onClose | () => void | required | Close handler |
| side | "right" \| "left" \| "bottom" | "right" | Slide direction |
| size | "sm" \| "md" \| "lg" | "md" | Width/height |

---

## 28. Modal

### Purpose

Focused attention overlay for critical actions or information.

### When to Use

- Confirmation dialogs
- Complex forms
- Important information requiring action

### When NOT to Use

- Non-blocking information (use Toast)
- Simple actions (use inline)
- Filters (use Drawer)

### Variants

**Default (Centered)**
- 560px wide (medium)
- Centered on screen
- Overlay backdrop

**Large**
- 800px wide
- Complex forms
- Detailed content

**Fullscreen**
- Full viewport
- Immersive workflows

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| open | boolean | required | Visibility |
| onClose | () => void | required | Close handler |
| title | string | required | Modal title |
| size | "sm" \| "md" \| "lg" \| "full" | "md" | Size variant |
| closeOnOverlay | boolean | true | Click overlay closes |
| closeOnEsc | boolean | true | Escape key closes |

### Interactions

**Open:**
- Backdrop fade in: 200ms
- Modal scale: 0.95 → 1, 250ms
- Focus first input

**Close:**
- Backdrop fade out: 150ms
- Modal scale out: 150ms
- Return focus to trigger

**Focus Trap:**
- Tab cycles within modal
- Esc returns to trigger

### Accessibility

- **Role:** `dialog`
- **Aria:** `aria-label`, `aria-describedby`
- **Focus:** Focus trap, return focus on close
- **Keyboard:** Esc to close, Tab to cycle

### Design Tokens

```css
--modal-backdrop: rgba(0, 0, 0, 0.5);
--modal-radius: var(--radius-lg);
--modal-shadow: var(--shadow-xl);
--modal-sm: 400px;
--modal-md: 560px;
--modal-lg: 800px;
```

---

## 29. Wizard

### Purpose

Multi-step flow for complex processes.

### When to Use

- Campaign creation
- Onboarding
- Multi-step forms

### When NOT to Use

- Single-step actions
- Simple forms (use regular form)

### Layout Structure

```
┌─────────────────────────────────────────┐
│ Create Campaign                  [Skip]  │
├─────────────────────────────────────────┤
│ Step 1: Basics    ●                    │
│ Step 2: Audience  ○                    │
│ Step 3: Budget    ○                    │
│ Step 4: Review    ○                    │
├─────────────────────────────────────────┤
│                                         │
│ [Form content for current step]         │
│                                         │
├─────────────────────────────────────────┤
│ [Back]                          [Next]  │
└─────────────────────────────────────────┘
```

---

## 30. Executive KPI Card

### Purpose

Displays high-level key performance indicators with trend indicators.

### When to Use

- Dashboard KPI grid
- Executive summaries
- At-a-glance metrics

### When NOT to Use

- Detailed breakdowns (use Analytics Card)
- Small, secondary metrics (use inline text)

### Layout Structure

```
┌─────────────────────────────┐
│ Total Revenue               │ ← 14px semibold, uppercase, muted
│                             │
│ $423,891                    │ ← 48px bold, tabular-nums
│                             │
│ ↑ 12% vs last month         │ ← 14px, semantic color
└─────────────────────────────┘
```

### Variants

**Standard**
- Single metric
- Label + value + trend
- Optional sparkline

**With Sparkline**
- Includes mini chart (7-day sparkline)
- Shows trend visually

**Interactive**
- Click drills down
- Hover: elevation increase

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| title | string | required | KPI label |
| value | string | number | Metric value |
| trend | "up" \| "down" \| "steady" | required | Trend direction |
| change | string | required | Change percentage/amount |
| comparison | string | required | Comparison period |
| sparkline | number[] | undefined | Sparkline data |
| onClick | () => void | undefined | Click handler |

### States

**Default:** Static display, subtle border

**Hover:** Elevation Level 2, border primary, scale 1.02

**Loading:** Skeleton with pulse

**Error:** Red border, "Unable to load"

### Interactions

**Hover:**
- Elevation: shadow-lg
- Cursor: pointer
- Transition: 200ms ease-out

**Click:**
- Navigate to detail view
- Open time range selector (if applicable)

### Accessibility

- **Role:** `article` or `<section>`
- **Aria:** `aria-label="{title}: {value}, {trend} {change}"`  
  Example: `"Total Revenue: $423,891, up 12%"`
- **Keyboard:** Tab focuses, Enter activates

### Design Tokens

```css
--kpi-title-size: 14px;
--kpi-title-weight: 600;
--kpi-title-spacing: 0.05em;
--kpi-value-size: 48px;
--kpi-value-weight: 700;
--kpi-trend-size: 14px;
--kpi-padding: 24px;
```

### Example Usage

```tsx
<ExecutiveKpiCard
  title="Total Revenue"
  value="$423,891"
  trend="up"
  change="12%"
  comparison="vs last month"
  sparkline=[...]
  onClick={() => navigate('/analytics/revenue')}
/>
```

### Best Practices

- Show maximum 4 KPIs per row
- Use semantic colors only for trends (green/red/gray)
- Always include comparison period
- Use tabular-nums for values
- Link to detailed analytics on click

### Common Mistakes

- ❌ Using decorative colors for trends
- ❌ Too many KPIs (> 8 on screen)
- ❌ Missing comparison period
- ❌ Inconsistent number formatting
- ❌ Too small font size (< 36px)

---

## 31. Analytics Card

### Purpose

Displays complex analytics with chart and context.

### When to Use

- Analytics pages
- Detailed metric breakdowns
- Comparative analysis

### When NOT to Use

- Simple KPI display (use ExecutiveKpiCard)
- Raw data tables (use Enterprise Table)

### Layout Structure

```
┌─────────────────────────────────────────┐
│ Revenue Trend                   [This Month ▾] │
│                                         │
│ [Line Chart]                            │
│                                         │
│ [Sparkline] [Comparison Toggle]         │
└─────────────────────────────────────────┘
```

### Variants

**Chart Card**
- Chart + title + controls
- Standard analytics

**Metric Card**
- Single number + breakdown
- No chart

**Insight Card**
- AI-generated insight
- Actionable text + buttons

---

## 32. Campaign Card

### Purpose

Displays campaign summary with key metrics and status.

### When to Use

- Campaign lists
- Campaign grids
- Dashboard widgets

### When NOT to Use

- Detailed editing (use Campaign Wizard)
- Data tables (use Enterprise Table)

### Layout Structure

```
┌─────────────────────────────────────────┐
│ Summer Sale 2026                [Active]│
│                                         │
│ Budget: $5,000 / $12,000 spent          │
│ ████████████░░░░░░░░  42%               │
│                                         │
│ Impressions: 125K  Clicks: 3.2K  CTR: 2.5%│
│                                         │
│ Ends Jul 31, 2026                       │
└─────────────────────────────────────────┘
```

---

## [Continuing with remaining component definitions...]

---

## 33. Social Card

### Purpose

Displays social media post preview and metrics.

### When to Use

- Social calendar
- Post drafts
- Post performance

### When NOT to Use

- Detailed analytics (use Analytics Card)
- Content creation (use composer)

### Layout Structure

```
┌─────────────────────────────────────────┐
│ [Image Preview]                         │
│                                         │
│ Summer sale announcement text...        │
│                                         │
│ 📅 Jul 15, 2026 at 2:00 PM             │
│ 📱 Instagram, Twitter                   │
│ ❤️ 245  💬 12  🔄 8                   │
└─────────────────────────────────────────┘
```

---

## 34. Competitor Card

### Purpose

Displays competitor metrics and comparison.

### When NOT to Use

- Own performance (use Executive KPI Card)

---

## 35. Insight Card

### Purpose

Displays AI-generated insight with context and action.

### When to Use

- AI insights panel
- Dashboard widget
- Alerts

### When NOT to Use

- Static information (use Analytics Card)

### Layout Structure

```
┌─────────────────────────────────────────┐
│ ⚡ ANOMALY DETECTED                     │
│ Facebook Ads CTR dropped 24%            │
│ Likely cause: New creative test          │
│                                         │
│ [Pause Campaign] [View Details]         │
└─────────────────────────────────────────┘
```

### Variants

**Anomaly** (Red border)
**Opportunity** (Green border)
**Prediction** (Blue border)
**Recommendation** (Yellow border)

---

## 36-40. [Additional card variants follow similar pattern...]

---

## 41. Enterprise Table

### Purpose

Display and manipulate large datasets with sorting, filtering, and bulk actions.

### When to Use

- Campaign lists
- Lead lists
- Financial data
- Any tabular data requiring manipulation

### When NOT to Use

- Simple lists (use list component)
- One-dimensional data (use cards)
- Data requiring spatial layout

### Layout Structure

```
┌──────────────────────────────────────────────────────────────┐
│ ☐ Name              Status    Budget    Spend    CTR    [⋮] │
├──────────────────────────────────────────────────────────────┤
│ ☐ Summer Sale 2026  Active    $12K      $5.1K    3.2%   [⋮] │
│ ☐ Winter Promo      Paused    $8K       $2.4K    1.8%   [⋮] │
│ ☐ Spring Launch     Active    $15K      $8.2K    4.1%   [⋮] │
│ ...                                                          │
├──────────────────────────────────────────────────────────────┤
│ Showing 1-10 of 50  [< Previous] [1] [2] [3] [Next >]      │
└──────────────────────────────────────────────────────────────┘
```

### Variants

**Standard**
- Full features enabled
- Sorting, filtering, pagination

**Compact**
- Reduced padding
- Dense information

**Read-only**
- No inline editing
- No bulk actions

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| columns | Column[] | required | Column definitions |
| data | T[] | required | Row data |
| sortable | boolean | false | Enable sorting |
| filterable | boolean | false | Enable filtering |
| selectable | boolean | false | Enable row selection |
| paginated | boolean | true | Enable pagination |
| pageSize | number | 10 | Rows per page |
| onSort | (col, dir) => void | undefined | Sort handler |
| onFilter | (filters) => void | undefined | Filter handler |
| onSelectionChange | (ids) => void | undefined | Selection handler |

### States

**Default:** Unfiltered, unsorted, no selection

**Sorted:** Active indicator on column

**Filtered:** Filter badges visible

**Selected:** Checkboxes checked, rows highlighted

**Loading:** Skeleton rows

**Empty:** Empty state with illustration

### Interactions

**Sorting:**
- Click header to sort asc/desc
- Shift+click for multi-column
- Visual indicator (arrows)

**Filtering:**
- Column header filter icon
- Dropdown or inline input
- Apply/Clear buttons

**Selection:**
- Checkbox selects row
- Header checkbox selects all
- Selected rows: primary background at 10% opacity

**Pagination:**
- Page numbers, prev/next
- Page size selector
- Showing X-Y of Z text

**Bulk Actions:**
- Appear on selection
- Delete, duplicate, export, etc.

**Column Visibility:**
- Dropdown to show/hide columns
- Persist preference

**Column Pinning:**
- Pin left/right
- Sticky on scroll

**Resizing:**
- Drag column border
- Min/max width constraints

**Inline Editing:**
- Double-click to edit
- Enter to confirm, Esc to cancel
- Save on blur

**Export:**
- CSV, Excel, PDF options
- Current view or all data

### Accessibility

- **Role:** `grid` or `<table>`
- **Headers:** `scope="col"` and `scope="row"`
- **Selection:** `aria-selected` on selected rows
- **Keyboard:** Tab between cells, Enter to edit, Esc to cancel
- **Sort:** `aria-sort` on header cells

### Design Tokens

```css
--table-row-height: 52px;
--table-header-height: 48px;
--table-cell-padding: 12px 16px;
--table-border: var(--border);
--table-selected-bg: rgba(37, 99, 235, 0.1);
```

### Best Practices

- Show 10-50 rows per page
- Horizontal scroll on mobile
- Pin important columns (name, actions)
- Persist column preferences
- Show loading skeleton
- Virtualize for 1000+ rows

### Common Mistakes

- ❌ Too many columns (> 12) without horizontal scroll
- ❌ Missing sort indicators
- ❌ No bulk actions when selection enabled
- ❌ Forgetting mobile card view
- ❌ Inline editing without clear affordance

---



## 42. Sorting

*[Configuration for sorting behavior per Table component]*

## 43. Filtering

*[Configuration for filtering behavior per Table component]*

## 44. Pagination

*[Configuration for pagination behavior per Table component]*

## 45. Bulk Actions

*[Configuration for bulk actions behavior per Table component]*

## 46. Column Visibility

*[Configuration for column visibility per Table component]*

## 47. Column Pinning

*[Configuration for column pinning per Table component]*

## 48. Resizable Columns

*[Configuration for resizable columns per Table component]*

## 49. Export

*[Configuration for export functionality per Table component]*

## 50. Inline Editing

*[Configuration for inline editing per Table component]*

---

## 51-63. Form Components

*[Each form component follows this pattern:]*

### Component Name (e.g., Input)

#### Purpose
Brief description of the component's purpose and use case.

#### When to Use
List specific scenarios where this component is appropriate.

#### When NOT to Use
List scenarios where this component should not be used.

#### Variants
List visual/functional variants (e.g., sizes, states).

#### Properties
Table of all props with types, defaults, and descriptions.

#### States
List all possible states (default, hover, focus, error, disabled, etc.).

#### Interactions
Describe user interactions and component responses.

#### Accessibility
- **Role:** Appropriate ARIA role
- **Aria:** Required ARIA attributes
- **Keyboard:** Supported keyboard interactions

#### Design Tokens
```css
--component-height: 40px;
--component-padding: 8px 12px;
--component-radius: 8px;
--component-border: 1px solid var(--border);
```

#### Example Usage
Code example showing proper implementation.

#### Best Practices
List of recommended practices.

#### Common Mistakes
List of anti-patterns to avoid.

---

## Form Component Specifications

### Input

**Variants:**
- Text (default)
- Email, Password, Number, Tel, URL
- Search
- With icon (prefix/suffix)

**Sizes:** Small (32px), Medium (40px), Large (48px)

**States:** Default, Hover, Focus, Error, Success, Disabled, Readonly

### Textarea

**Properties:**
- minRows: 3
- maxRows: 10 (auto-resize)
- resize: vertical only

**Features:**
- Character count (optional)
- Auto-resize on input

### Dropdown

**Variants:**
- Single select
- Multi-select with chips
- Searchable
- Grouped options

**Features:**
- Virtual scrolling for 100+ options
- Keyboard navigation
- Clear selection button

### Autocomplete

**Features:**
- Debounced search
- Keyboard navigation
- Recent selections
- Loading state

### Date Picker

**Variants:**
- Single date
- Date range
- With time
- Without time

**Features:**
- Calendar view
- Keyboard navigation
- Min/max date constraints
- Disabled dates

### Time Picker

**Features:**
- 12/24 hour format
- Minute increments
- Timezone support

### Checkbox

**Variants:**
- Default
- Indeterminate
- With description

### Radio

**Variants:**
- Default (horizontal/vertical)
- With description
- Button group

### Toggle

**Variants:**
- Default
- With labels (On/Off)
- Sizes: sm, md, lg

### Rich Text Editor

**Features:**
- Bold, italic, underline
- Headings, lists
- Links, images
- Markdown support (optional)

### File Upload

**Variants:**
- Drag and drop
- Click to browse
- Multiple files
- File type restrictions

**Features:**
- Preview thumbnails
- Progress indicator
- Remove button

### Media Upload

*[Similar to File Upload with media-specific features]*

### Avatar Upload

**Features:**
- Circular preview
- Crop/scale (optional)
- Remove button
- File size validation

---

## 64-73. Chart Components

### Chart Container

### Purpose
Wrapper for all charts providing consistent sizing, headers, and controls.

### Properties
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| title | string | required | Chart title |
| timeRange | string | required | Current time range |
| onTimeRangeChange | (range) => void | required | Change handler |
| compareEnabled | boolean | false | Show compare toggle |
| onCompareChange | (enabled) => void | undefined | Compare handler |
| actions | ReactNode | undefined | Action buttons (export, etc.) |
| height | number | 400 | Chart height in px |
| loading | boolean | false | Loading state |
| error | Error | undefined | Error state |

### Layout Structure

```
┌─────────────────────────────────────────┐
│ Revenue Trend              [30 days ▾] [↔ Compare] │
│                                         │
│ [Chart Area - 400px height]             │
│                                         │
│ [Legend / Summary if needed]            │
└─────────────────────────────────────────┘
```

---

### Line Chart

### Purpose
Display trends over time.

### When to Use
- Revenue trends
- Traffic over time
- Metric progression

### When NOT to Use
- Categorical data (use Bar Chart)
- Part-to-whole (use Pie/Donut)

### Properties
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| data | DataPoint[] | required | Time-series data |
| xAxis | string | required | X-axis key |
| yAxis | string | required | Y-axis key |
| color | string | "primary" | Line color |
| strokeWidth | number | 3 | Line thickness |
| showDots | boolean | false | Show data points |
| showArea | boolean | false | Show area fill |
| smooth | boolean | true | Smooth curves |

### Interactions
- Hover: vertical tracker + tooltip
- Click: Select series
- Legend: Toggle visibility

---

### Area Chart

*[Similar to Line Chart with area fill properties]*

### Bar Chart

### Purpose
Compare categorical data.

### Properties
- barWidth: 40 (default), 20 (dense)
- gap: 20
- borderRadius: 4 (top only)
- grouped: false (grouped bar chart)

### Pie Chart

### Purpose
Show part-to-whole relationships.

### Properties
- innerRadius: 0 (pie), 60% (donut)
- padAngle: 2 (space between segments)
- cornerRadius: 4

### Donut Chart

*[Pie Chart with innerRadius > 0]*

### Heatmap

### Purpose
Show density or intensity across two dimensions.

### When to Use
- Activity calendars
- Geographic data
- Correlation matrices

### Funnel

### Purpose
Display conversion or process stages.

### When to Use
- Sales funnels
- Signup flows
- Any sequential process with dropoff

### Gauge

### Purpose
Show progress toward a goal.

### When to Use
- Budget utilization
- Goal progress
- Performance against target

### Timeline

### Purpose
Display events chronologically.

### When to Use
- Activity feeds
- History tracking
- Campaign timelines

---

## 74-81. AI Components

### AI Insight

*[Detailed specification for AI insight cards]*

### AI Recommendation

*[Detailed specification for actionable AI recommendations]*

### AI Score

### Purpose
Display AI-generated score (0-100).

### When to Use
- Health scores
- Performance scores
- Quality assessments

### AI Confidence

### Purpose
Display confidence level of AI prediction.

### Properties
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| value | number | required | Confidence % |
| level | "high" \| "medium" \| "low" | required | Confidence level |
| showLabel | boolean | true | Show text label |

### AI Alert

### Purpose
Alert requiring user attention.

### Variants
- Anomaly (red)
- Opportunity (green)
- Prediction (blue)
- Recommendation (yellow)

### AI Prompt Box

### Purpose
Input for AI Copilot queries.

### Properties
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| placeholder | string | required | Input placeholder |
| suggestions | string[] | [] | Suggestion chips |
| onSubmit | (query) => void | required | Submit handler |
| loading | boolean | false | AI responding |

### Conversation Timeline

### Purpose
Display chat history between user and AI.

### Generated Content Card

### Purpose
Display AI-generated content (text, images, code).

---

## 82-90. Social Components

### Post Card

*[Detailed specification]*

### Content Calendar

### Purpose
Calendar view for scheduling social posts.

### Variants
- Month view
- Week view
- List view

### Features
- Draggable posts
- Color-coded platforms
- Today indicator
- Overflow indicators

### Media Library

### Purpose
Browse and manage media assets.

### Features
- Grid/list view toggle
- Filter by type
- Search
- Bulk selection

---

## 91-97. Ads Components

### Campaign Card
### Campaign Wizard
*[Multi-step wizard for creating campaigns]*

### Audience Builder

### Purpose
Define target audience for ads.

### Features
- Demographics
- Interests
- Behaviors
- Save audiences

### Budget Widget

### Purpose
Display and control campaign budget.

### Features
- Daily vs lifetime toggle
- Progress bar
- Overbudget warning

### Performance Widget

### Purpose
Display campaign performance metrics.

### Optimization Widget

### Purpose
Provide AI-driven optimization suggestions.

---

## 98-102. CRM Components

### Lead Card
### Opportunity Card
### Pipeline (Kanban)
### Task
### Activity Timeline

---

## 103-107. Automation Components

### Workflow Builder

### Purpose
Visual builder for creating automation workflows.

### Components
- Trigger nodes
- Condition nodes
- Action nodes
- Connections

### Trigger

### Condition

### Action

### Execution Timeline

---

## 108-112. Report Components

### Report Builder

### Purpose
Create custom reports with drag-drop widgets.

### Widget

### Dashboard Widget

### PDF Preview

### Export Panel

---

## 113-121. Feedback Components

### Toast

### Purpose
Temporary notification for user feedback.

### Variants
- Success (green)
- Error (red)
- Warning (yellow)
- Info (blue)

### Properties
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| message | string | required | Toast message |
| type | "success" \| "error" \| "warning" \| "info" | "info" | Toast type |
| duration | number | 5000 | Auto-dismiss (ms) |
| action | ReactNode | undefined | Action button |

### Banner

### Purpose
Persistent notification for important information.

### Variants
- Info
- Success
- Warning
- Error

### Alert

### Purpose
Inline notification for form errors or warnings.

### Confirmation

### Purpose
Confirm destructive or important actions.

### Loading

### Purpose
Indicate loading state.

### Variants
- Spinner (20px, 32px, 48px)
- Skeleton (text, circle, rect)
- Progress bar

### Skeleton

### Purpose
Animated placeholder while content loads.

### Variants
- Text (line)
- Circle (avatar)
- Rectangle (image/card)

### Progress

### Purpose
Show progress toward completion.

### Properties
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| value | number | required | Progress % |
| max | number | 100 | Maximum value |
| showLabel | boolean | false | Show percentage |

### Empty State

### Purpose
Display when content is missing.

### Variants
- No data (initial state)
- No results (search/filter)
- Error state
- Coming soon

### Layout

```
┌─────────────────────────────────────────┐
│                                        │
│        [Illustration 96-160px]         │
│                                        │
│           Title (20px)                 │
│    Description (16px, muted)           │
│                                        │
│      [Primary Button] [Link]           │
│                                        │
└─────────────────────────────────────────┘
```

### Error State

### Purpose
Display errors with recovery options.

### Properties
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| title | string | "Something went wrong" | Error title |
| description | string | undefined | Error description |
| retry | () => void | undefined | Retry handler |
| home | () => void | undefined | Navigate home |

---

## Appendix A: Component Testing Standards

### Unit Tests
- Render without crashing
- Props validation
- Event handlers called correctly
- State transitions correct

### Integration Tests
- Component composition
- User interactions
- Accessibility tree correct

### Visual Regression
- Screenshot tests (Chromatic, Percy)
- All breakpoints
- All variants/states
- Dark/light modes

### Accessibility Tests
- axe DevTools
- Keyboard navigation
- Screen reader (NVDA/VoiceOver)
- Color contrast

---

## Appendix B: Component Documentation Standards

### README Requirements
Each component documentation should include:
- Installation (if published)
- Import path
- Basic usage example
- All props documented
- Each variant shown
- Accessibility notes
- Best practices
- Common mistakes

### Storybook Stories
- Default state
- All variants
- Common usage patterns
- Interactive playground

---

## Appendix C: Performance Budgets

### Component Performance
- First render: < 50ms
- Re-render: < 16ms (60fps)
- Bundle size: < 5KB per component (gzipped)
- No external dependencies (beyond React/Radix)

### Rendering Optimization
- Memoize expensive calculations
- Use React.memo for pure components
- Virtualize long lists (1000+ items)
- Lazy load below-fold components

---

## Appendix D: Versioning Strategy

### Semantic Versioning (SemVer)

**Major (X.0.0):** Breaking changes
- Prop removals or renames
- Behavior changes
- Accessibility regressions

**Minor (0.X.0):** New features
- New variants
- New props
- New features

**Patch (0.0.X):** Bug fixes
- Visual fixes
- Accessibility improvements
- Documentation updates

### Changelog
- Keep `CHANGELOG.md` in component folder
- Follow Keep a Changelog format
- Link to PRs

---

## Appendix E: Backwards Compatibility

### Deprecation Policy

1. Announce deprecation in minor version
2. Keep component working for 2 major versions
3. Add console warnings in development
4. Provide migration guide
5. Remove in next major version

### Prop Migration
```typescript
// Old (deprecated)
<Button variant="primary" />

// New (v2.0)
<Button variant="default" />
```

---

**END OF COMPONENT LIBRARY**

*This document is maintained by the Calixo Design Team. Components must adhere to these specifications to ensure a cohesive, accessible, and enterprise-grade user experience.*