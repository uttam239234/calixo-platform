# CALIXO DASHBOARD BLUEPRINT

## Executive Command Center

**Version:** 1.0.0  
**Created:** June 2026  

---

## Table of Contents

1. [Dashboard Overview](#1-dashboard-overview)
2. [Layout Architecture](#2-layout-architecture)
3. [Section Order & Priority](#3-section-order--priority)
4. [KPI Cards Row](#4-kpi-cards-row)
5. [Primary Analytics Chart](#5-primary-analytics-chart)
6. [Secondary Insights Panel](#6-secondary-insights-panel)
6. [Secondary Charts Row](#7-secondary-charts-row)
7. [Recent Activity Feed](#8-recent-activity-feed)
8. [Quick Actions](#9-quick-actions)
10. [Notifications Panel](#10-notifications-panel)
11. [AI Insights Section](#11-ai-insights-section)
12. [Responsive Behavior](#12-responsive-behavior)
13. [User Personas & Customization](#13-user-personas--customization)
14. [Interaction Patterns](#14-interaction-patterns)

---

## 1. Dashboard Overview

### Purpose

The Calixo Dashboard serves as the **Executive Command Center**—the single pane of glass that gives CEOs, CMOs, and Marketing Directors immediate visibility into marketing performance without requiring deep data diving.

### Design Philosophy

**Information Hierarchy:** Not all data is equal. The dashboard uses visual weight, size, and placement to guide executive attention to what matters most.

**At-a-Glance Intelligence:** Executives spend 8-10 hours daily in the platform. They need to answer "How are we doing?" in under 5 seconds.

**Actionable Context:** Every metric displayed should answer a question or suggest an action. Cold data without context is noise.

### Dashboard Objectives

1. **Quick Pulse** - System health and key performance indicators
2. **Trend Awareness** - Directional indicators (up/down/stable) for critical metrics
3. **Anomaly Detection** - AI flags issues requiring attention
4. **Action Gateway** - Quick access to common tasks without losing context

---

## 2. Layout Architecture

### Top-Level Grid Structure

The Dashboard uses a **12-column, 24px-gutter grid** with **32px page margins**.

```
+----------------------------------------------------------+
| Header (64px height)                                      |
| [Page Title] [Time Selector]                 [Search] [User] |
+----------------------------------------------------------+
|                                                          |
| +--------+ +--------+ +--------+ +--------+             |
| | KPI 1  | | KPI 2  | | KPI 3  | | KPI 4  |             |
| +--------+ +--------+ +--------+ +--------+             |
|                                                          |
| +------------------------------+ +-----------+           |
| |                              | |           |           |
| | Main Chart                   | | Secondary |           |
| |                              | | Panel     |           |
| |                              | |           |           |
| +------------------------------+ +-----------+           |
|                                                          |
| +----------------------------+ +---------------------+    |
| | Bar Chart                  | | AI Insights         |   |
| +----------------------------+ +---------------------+    |
|                                                          |
| +----------------------------+ +---------------------+    |
| | Recent Activity            | | Quick Actions       |   |
| +----------------------------+ +---------------------+    |
|                                                          |
+----------------------------------------------------------+
```

### Layout Zones

**Zone 1: Global Header** (Full Width)
- Persistent across all pages
- Contains page title, controls, user menu

**Zone 2: KPI Highway** (Full Width)
- 4 KPI cards in a single row
- Quick-glance performance indicators

**Zone 3: Primary Analytics** (8 columns) + Secondary Panel (4 columns)
- Dominant visual focus for primary metric
- Supporting context panel

**Zone 4: Secondary Analytics** (6 columns each, 2 cards)
- Supporting visualizations
- Breakdown charts

**Zone 5: Intelligence Feed** (6 columns each, 2 cards)
- Recent activity + AI insights
- Human + AI-generated content

**Zone 6: Action Layer** (12 columns)
- Quick actions + notifications
- User controls and alerts

---

## 3. Section Order & Priority

### Information Architecture Priority

```
P1 (Top of page) - Critical, hard numbers
  ↓ Time selector
  ↓ KPI cards
  ↓ Primary chart

P2 (Upper middle) - Analytical context
  ↓ Secondary panels
  ↓ Breakdown charts

P3 (Lower middle) - Intelligence
  ↓ AI-generated insights
  ↓ Recent user activity

P4 (Bottom) - Actions & notifications
  ↓ Quick actions
  ↓ Notification queue
```

### Rationale for Ordering

**KPI Cards First:** Executives need to know "Are we winning or losing?" in under 3 seconds. Color-coded trend arrows provide instant directional awareness.

**Primary Chart Second:** After the quick numbers, show the trend. Line chart placing the current month in context against history answers "What's driving this number?"

**Secondary Panels Third:** Supportive context without competing. Details that educate, not alarm.

**Intelligence Feed Fourth:** AI insights and activity provide narrative. "Here's why the numbers look this way."

**Action Layer Bottom:** What can I do about it? Actions are critical but should follow data review.

---

## 4. KPI Cards Row

### ASCII Wireframe

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ Total Revenue           │  │ Leads Generated         │  │ Conversion Rate         │  │ Active Campaigns        │
│ $423,891                │  │ 2,847                   │  │ 3.24%                   │  │ 12                      │
│ ↑ 12% vs last month     │  │ ↓ 3% vs last month      │  │ ↑ 0.5% vs last month    │  │ ↑ 2 new this week       │
│ vs Jun 2026             │  │                         │  │                         │  │                         │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
  ↑ Green arrow (positive)    ↑ Red arrow (negative)     ↑ Green arrow (positive)    ↑ Green arrow (positive)
```

### Component Specifications

**Card Anatomy**
- Container: White/dark card background, 1px border, 12px radius
- Padding: 24px
- Header: 14px semibold label
- Body: 48px bold number (display-xl)
- Footer: 14px with trend indicator

**Visual Hierarchy**

```
┌─────────────────────────────┐
│ LABEL (14px semibold)       │ ← Muted-foreground, uppercase, tracking-wide
│                             │
│ $423,891   (48px bold)      │ ← Main number, foreground, tabular-nums
│                             │
│ ↑ 12%  vs last month        │ ← 14px, semantic color (green/red/gray)
└─────────────────────────────┘
```

### KPI Selection

**Default KPIs (shown to all users):**
1. **Total Revenue** - Primary business outcome
2. **Leads Generated** - Pipeline health
3. **Conversion Rate** - Efficiency metric
4. **Active Campaigns** - Operational activity

**Role-Based Customization:**

**CMO / CEO View:**
- Total Revenue
- Marketing ROI
- Brand Awareness Score
- Pipeline Contribution

**Marketing Director View:**
- Active Campaigns
- Leads by Channel
- Cost-per-Acquisition
- Social Engagement

**Analytics View:**
- Traffic Sources
- Bounce Rate
- Session Duration
- Page Views

### KPI Behavior

**Hover State:**
- Elevation: Level 2 (shadow lg)
- Cursor: pointer
- Click: Opens detailed analytics for that KPI

**Trend Indicators:**
- Compared against: Previous period (default: last month)
- Directional arrows: 16px, colored (green up, red down, gray flat)
- Format: `↑ 12%` or `↓ 3%` with optional text "vs last month"

**Time Filtering:**
- KPI values react to time range selector (7d, 30d, 90d, 1y)
- Smooth transition when changing periods

**Alerting:**
- Threshold breach (e.g., conversion rate < 2%): Yellow warning indicator
- Critical failure (e.g., ad spend > 120% budget): Red danger indicator

---

## 5. Primary Analytics Chart

### ASCII Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│ Revenue Trend                                    [This Month ▾] │
│                                                              │
│ 500K ┤                                        ╱╲              │
│ 450K ┤                                      ╱    ╲            │
│ 400K ┤                                    ╱        ╲          │
│ 350K ┤                                  ╱            ╲        │
│ 300K ┤                                ╱                ╲      │
│ 250K ┤                              ╱                    ╲    │
│ 200K ┤                            ╱                        ╲  │
│ 150K ┤                          ╱                            ╲
│ 100K ┤                        ╱
│  50K ┤                      ╱
│      └──────────────────────────────────────────────────────►
│        Week1   Week2   Week3   Week4   Week5   Week6        │
└────────────────────────────────────────────────────────────────┘
```

### Component Specifications

**Chart Card**
- Header area: 48px height, title + time selector
- Chart area: Min-height 400px, max-height 500px
- Footer area (optional): Legend, export button

**Primary Chart Type:** Line Chart

**Visual Specifications:**
- Line stroke: 3px, primary color
- Data points: 6px circles on hover, hidden by default
- Area fill (optional): 20% opacity gradient to bottom
- Grid lines: 1px dashed, border color, 20% opacity

**Axes:**
- Y-axis: Currency format, 0 to max with padding
- X-axis: Date format based on granularity
- Grid lines: Horizontal only (simplifies reading)
- Labels: 12px, muted color

**Interaction Behaviors:**
1. **Hover**
   - Vertical tracker line showing exact value
   - Tooltip: "Week 3: $412,500" (centered above point)
   - Smooth 100ms fade-in

2. **Time Range Selector**
   - Dropdown: 7d, 30d, 90d, 1y, custom
   - Smooth transition between ranges (300ms redraw)

3. **Compare Toggle**
   - Switch: "Compare to previous period"
   - Shows second line (muted gray) behind primary line
   - Legend updates to show both periods

### Why This Section Exists

Executives need **temporal context**. A single number tells you current state; a trend tells you trajectory. This 400px-tall chart answers "Are we improving?" without requiring a meeting.

**Placement:** Zone 3 (8 columns) - Dominant visual, largest chart area
**Priority:** P1 - Essential for executive decision-making

---

## 6. Secondary Insights Panel

### ASCII Wireframe

```
┌─────────────────────────────┐
│ Context & Insights          │
│                             │
│ ┌─ AI INSIGHT ────────────┐ │
│ │ ⚡ Revenue is up 12%    │ │
│ │ driven by Google Ads    │ │
│ │ (+$48K vs last month)   │ │
│ │                         │ │
│ │ [View Details]          │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─ METRIC BREAKDOWN ──────┐ │
│ │ By Channel:             │ │
│ │ ████████████ Google     │ │
│ │ ██████ Meta             │ │
│ │ ███ LinkedIn             │ │
│ │ ██ Direct               │ │
│ │                         │ │
│ │ Google    $312K  (74%)  │ │
│ │ Meta      $89K   (21%)  │ │
│ │ LinkedIn  $18K   (4%)   │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### Component Specifications

**Insights Panel Card**
- Header: 24px semibold title + filter icon
- Body: Scrollable, 400px height

**AI Insight Card**
- Border-left: 4px solid primary
- Background: accent color (subtle)
- Padding: 16px
- Structure:
  - Sparkle icon (20px) + "AI Insight" label (12px semibold, primary)
  - Headline (14px semibold)
  - Description (14px normal)
  - Action button (optional, primary style)

**Metric Breakdown**
- Horizontal bar chart (20px height each)
- Gradient from primary to muted
- Labels: 14px semibold left, tabular numbers right
- Percentage in parentheses

### Section Components

**AI-Generated Insights (Top 70%)**
- 2-3 insight cards stacked
- Each card addresses:
  - Anomaly detected ("Campaign X underperforming")
  - Opportunity identified ("Best time to post: 2PM Wed-Fri")
  - Performance highlight ("Google Ads ROAS up 34%")

**Metric Breakdown (Bottom 30%)**
- Contextual breakdown based on primary chart
- Examples: Revenue by channel, leads by source, clicks by device

**Interaction:**
- Click insight: Opens detailed view or jumps to relevant page
- Click breakdown bar: Filters main chart to that segment

### Why This Section Exists

Data without interpretation is tedious. AI insights transform raw numbers into **actionable intelligence**. Executives can read "Revenue up 12%" in 2 seconds vs. sifting through charts for 2 minutes.

**Placement:** Zone 3 (4 columns) - Supporting context, not competing visually
**Priority:** P1 - Differentiating feature for AI-first platform

---

## 7. Secondary Charts Row

### ASCII Wireframe

```
┌──────────────────────────────┐  ┌──────────────────────────────┐
│ Campaign Performance         │  │ Channel Distribution          │
│                              │  │                              │
│ Bar Chart                    │  │ Pie Chart                    │
│                              │  │                              │
│ $250K ┤                      │  │        Google    [===] 74%   │
│ $200K ┤ █                    │  │        Meta      [==]  21%   │
│ $150K ┤ █ █                  │  │        LinkedIn  [=]    4%    │
│ $100K ┤ █ █ █                │  │        Direct    [=]    1%    │
│  $50K ┤ █ █ █ █              │  │                              │
│    0  └─────────────────►    │  └──────────────────────────────┘
│        Camp1  Camp2  Camp3   │
└──────────────────────────────┘
```

### Component Specifications

**Two cards side-by-side**, each 6 columns wide, separated by 24px gutter.

**Left Card: Campaign Performance (Bar Chart)**
- Chart type: Grouped bar chart or sorted single bars
- Dimensions: 400px height, full card width
- X-axis: Campaign names (truncated if >20 chars)
- Y-axis: Currency or percentage
- Bars: 40px wide, 4px corner radius top only
- Colors: Sequential blue palette (primary to muted)

**Right Card: Channel Distribution (Donut Chart)**
- Chart type: Donut chart (pie with hole)
- Dimensions: 400px height, centered
- Hole diameter: 60% of chart size
- Segments: Up to 6 colors max
- Legend: Right-aligned, 14px, with color swatches
- Labels inside segments (if large enough) or in legend

### Why These Sections Exist

Secondary charts provide **compositional context**. The primary chart shows total revenue trend; secondary charts break it down by campaign and channel—answering "where is our performance coming from?"

**Placement:** Zone 4 (6+6 columns) - Supporting data, not competing with primary
**Priority:** P2 - Important for analysts, optional for C-suite

---

## 8. Recent Activity Feed

### ASCII Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│ Recent Activity                                        [View All]│
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ [Avatar 32px]  Sarah updated "Summer Sale" campaign       │ │
│ │               Sarah Chen • 2 min ago                    │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ [Avatar 32px]  New lead acquired: sam@company.com         │ │
│ │               System • 15 min ago                       │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ [Avatar 32px]  Budget alert: Facebook Ads 85% spent      │ │
│ │               AI Copilot • 1 hour ago                    │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ [Avatar 32px]  Monthly report generated                   │ │
│ │               System • 2 hours ago                       │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ [Load more...]                                                  │
└────────────────────────────────────────────────────────────────┘
```

### Component Specifications

**Activity Feed Card**
- Header: "Recent Activity" (24px semibold) + "View All" link (14px, primary, right-aligned)
- List: 4-6 items visible, 32px avatar + text
- Footer: "Load more" link (if paginated)

**Activity Item**
- Avatar: 32px circle (user initials or image)
- Name: 14px semibold (system vs. person)
- Action text: 14px normal
- Target: 14px, primary color (clickable)
- Timestamp: 12px, muted-foreground

**Activity Types**

1. **User Actions**
   - "Sarah updated 'Summer Sale' campaign"
   - "Mike duplicated social post for LinkedIn"

2. **System Events**
   - "New lead acquired from Google Ads"
   - "Campaign 'Winter Promo' ended"

3. **AI Events**
   - "Budget alert: Facebook Ads 85% consumed"
   - "Insight: Best posting time is 2PM Wed"

4. **Integrations**
   - "Salesforce sync completed"
   - "HubSpot data imported"

**Status Indicators**
- Success: Green dot
- Warning: Yellow dot
- Info: Blue dot
- Error: Red dot

### Why This Section Exists

Executives need **social and system context**. A dashboard without human activity feels sterile. This section humanizes the platform—showing team activity, automated triggers, and AI interventions in chronological order.

**Placement:** Zone 5 (6 columns) - Supporting narrative
**Priority:** P2 - Connects numbers to real-world actions

---

## 9. Quick Actions

### ASCII Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│ Quick Actions                                                  │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌─────────┐ │
│  │ [ + ]     │  │ [ 📊 ]    │  │ [ 📅 ]    │  │ [ 💬 ]  │ │
│  │ Create    │  │ Create    │  │ Schedule  │  │ Ask     │ │
│  │ Campaign  │  │ Report    │  │ Post      │  │ AI      │ │
│  └────────────┘  └────────────┘  └────────────┘  └─────────┘ │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### Component Specifications

**Quick Actions Card**
- Header: 24px semibold title
- Grid: 4 columns, 80px buttons each
- Gap: 16px between buttons

**Button Specifications**
- Shape: Square or 1:1 aspect ratio
- Size: 80px × 80px
- Border radius: 12px
- Background: Accent color
- Icon: 32px centered
- Label: 12px semibold below icon

**Action Items**

**Primary Actions (up to 4 visible):**

1. **Create Campaign**
   - Icon: Rocket or target
   - Destination: Campaign creation wizard

2. **Create Report**
   - Icon: Chart/bar
   - Destination: Report builder

3. **Schedule Post**
   - Icon: Calendar or clock
   - Destination: Social composer

4. **Ask AI Copilot**
   - Icon: Sparkle or chat
   - Destination: Opens AI Copilot panel

5. **Upload Media**
   - Icon: Upload/image
   - Destination: Media library

6. **Add Team Member**
   - Icon: User-plus
   - Destination: Team management

7. **Import Data**
   - Icon: Download/import
   - Destination: Import tool

**Behavior:**
- Hover: Background darkens, slight shadow increase
- Click: Navigates or opens modal
- Users can customize (drag to reorder) in settings

### Why This Section Exists

Executives are **task-driven**. After reviewing dashboard data, they know what they want to do next. Quick actions reduce friction by placing common tasks (Create Campaign, Ask AI) one click away.

**Placement:** Zone 6 (full width row, 4 buttons centered) - Accessible but not distracting
**Priority:** P2 - Reduces time-to-action, increases platform stickiness

---

## 10. Notifications Panel

### ASCII Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│ Notifications                                         [3] [Mark all read]│
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ● Google Ads budget 85% spent                   2h ago  [×] │ │
│ │   Campaign "Summer Sale" is approaching budget limit.       │ │
│ │   [View Campaign]                                         │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ● New lead: sam@company.com                         15m ago [×]│ │
│ │   High-value lead from Google Ads. Assigned to Sarah.      │ │
│ │   [View Lead]                                             │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │   Monthly report ready for review                    1d ago [×]│ │
│ │   Your July performance report is available.               │ │
│ │   [Download PDF]                                          │ │
│ └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Component Specifications

**Notifications Panel**
- Header: "Notifications" + count badge + "Mark all read"
- List: 3-5 items visible
- Empty state: "No new notifications" with bell icon

**Notification Item**
- Type indicator: Colored dot (red=alert, blue=info, green=success)
- Headline: 14px semibold
- Description: 14px normal, max 2 lines
- Timestamp: 12px, muted (relative: "2h ago", "15m ago")
- Action link: "View Campaign" (12px, primary, bold)
- Dismiss: 16px X icon (top-right of item)

**Severity Levels**

**Critical (Red):**
- Budget exceeded
- Campaign paused due to error
- System outage

**Warning (Yellow):**
- Budget > 80%
- Conversion rate drop > 20%
- Security alert

**Info (Blue):**
- New lead assigned
- Report generated
- Team mention

**Success (Green):**
- Goal achieved
- Campaign milestone
- Export complete

**Notification Center (Dropdown from icon):**
- Trigger: Bell icon in header
- Opens dropdown with same list + "View all" link
- Red dot indicates unread count
- Auto-refresh every 60 seconds

### Why This Section Exists

Executives need to **act on exceptions**. A dashboard without alerts feels inert. The notifications panel surfaces AI-detected issues, system events, and team activity requiring attention—transforming passive monitoring into active management.

**Placement:** Zone 6 or slide-out panel from bell icon
**Priority:** P3 - Important but not interrupting workflow

---

## 11. AI Insights Section

### ASCII Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│ AI Insights - June 2026 Performance                           │
│                                                                  │
│ +----------------------------------------------------------------+│
│ | ⚡ ANOMALY DETECTED                                           ||
│ |                                                                ||
│ | Facebook Ads CTR dropped 24% in last 3 days.                  ||
│ | Likely cause: New ad creative underperforming.                 ||
│ |                                                                ||
│ | [Pause Campaign] [View Creative] [Dismiss]                    ||
│ +----------------------------------------------------------------+│
│                                                                  │
│ +----------------------------------------------------------------+│
│ | 💡 OPPORTUNITY                                                 ||
│ |                                                                ||
│ | LinkedIn engagement is 2.3x higher Tue-Thu.                   ||
│ | Consider increasing ad spend on those days.                    ||
│ |                                                                ||
│ | [Apply Schedule] [Dismiss]                                    ||
│ +----------------------------------------------------------------+│
│                                                                  │
│ +----------------------------------------------------------------+│
│ | 🎯 PREDICTION                                                 ||
│ |                                                                ||
│ | Based on current trajectory, you'll exceed Q2 revenue target  ||
│ | by 18%.                                                        ||
│ |                                                                ||
│ | [View Forecast] [Dismiss]                                     ||
│ +----------------------------------------------------------------+│
└────────────────────────────────────────────────────────────────┘
```

### Component Specifications

**AI Insights Card**
- Header: "AI Insights" (24px semibold) + date range
- List: 3-5 insight cards, scrollable
- Each card: Semantic left border + icon + content + actions

**Insight Card Anatomy**

```
┌────────────────────────────────────────────────────────────┐
│ [4px colored border]                                        │
│                                                             │
│ ⚡  ANOMALY DETECTED                         2h ago    [×]  │
│                                                             │
│ Facebook Ads CTR dropped 24% in last 3 days.               │
│ Likely cause: New ad creative underperforming.             │
│                                                             │
│ [Pause Campaign]  [View Creative]                           │
└────────────────────────────────────────────────────────────┘
```

**Insight Categories**

1. **Anomaly Detected** (Red border)
   - Sudden metric change (up or down)
   - Root cause analysis (AI-generated)
   - Suggested actions

2. **Opportunity** (Green border)
   - Pattern identified (e.g., "Best time to post")
   - Expected impact
   - One-click apply action

3. **Prediction** (Blue border)
   - Forecast based on trends
   - Confidence interval
   - Action to influence outcome

4. **Recommendation** (Yellow border)
   - Optimization suggestion
   - A/B test setup
   - Expected improvement

**Confidence Scoring**
- High confidence (>85%): Show prediction
- Medium confidence (60-85%): Show with "likely" qualifier
- Low confidence (<60%): Show "might" qualifier, include disclaimer

**Actions**
- Primary action: One-click execution (e.g., "Pause Campaign")
- Secondary action: "View Details" (navigates)
- Tertiary: "Dismiss" (removes from list)
- Feedback: Toast on action execution

### Why This Section Exists

AI insights are the **competitive moat**. They transform Calixo from a reporting tool into an intelligent assistant. Executives can't monitor 200 metrics—AI surfaces only what matters, with suggested actions.

**Placement:** Zone 5 or separate full-width section below secondary charts
**Priority:** P1 - Unique value proposition

---

## 12. Responsive Behavior

### Desktop Layout (> 1024px)

**Full Command Center**

```
12-column grid, 24px gutters

+----------------------------------------------------------+
│ Sidebar (256px) | Content Area (12 columns)             |
|                  |                                        |
| Navigation       | KPI Cards (4 × span-3)                |
|                  |                                        |
|                  | Main Chart (span-8) + Panel (span-4)   |
|                  |                                        |
|                  | Secondary Charts (2 × span-6)           |
|                  |                                        |
|                  | Activity + AI Insights (2 × span-6)     |
|                  |                                        |
|                  | Quick Actions (12 columns)              |
+----------------------------------------------------------+
```

**Breakpoints:**
- Desktop Large (> 1536px): 1440px content, centered
- Desktop Medium (1280-1535px): 1200px content, 32px margins
- Desktop Small (1024-1279px): 960px content, 24px margins

### Tablet Layout (640px - 1023px)

**Condensed Command Center**

```
+----------------------------------------------------------+
│ Sidebar (collapsed: 72px) | Content Area (8 columns)      |
|                           |                                |
| Icons only                | KPI Cards (2 × span-4)         |
|                           |                                |
|                           | Main Chart (span-8)            |
|                           |                                |
|                           | Secondary (span-4 each)         |
|                           |                                |
|                           | Activity + AI (span-4 each)     |
|                           |                                |
|                           | Actions (span-8)                |
+----------------------------------------------------------+
```

**Changes:**
- Sidebar collapses to 72px (icons only, labels on hover)
- KPIs: 2 per row instead of 4
- Main chart: Full width (span-8)
- Secondary panels: Stacked or 2-column grid
- Content width: 640px centered

### Mobile Layout (< 640px)

**Focused Command Center**

```
+------------------------------------------------------------------+
│ Header (64px height)                                             |
| [≡] [Dashboard]                               [Search] [User]   |
+------------------------------------------------------------------+
|                                                                  |
| +----------------------------------------------------------+     |
| | Total Revenue         (KPI 1 of 4, horizontal scroll)    |     |
| | $423,891                                             |     |
| +----------------------------------------------------------+     |
|                                                                  |
| +----------------------------------------------------------+     |
| | Revenue Trend (Main Chart)                               |     |
| | [Scroll horizontally for full chart]                     |     |
| +----------------------------------------------------------+     |
|                                                                  |
| +----------------------------------------------------------+     |
| | Campaign Performance (Bar Chart)                         |     |
| +----------------------------------------------------------+     |
|                                                                  |
| +----------------------------------------------------------+     |
| | AI Insights (Stacked cards)                              |     |
| +----------------------------------------------------------+     |
|                                                                  |
| +----------------------------------------------------------+     |
| | Activity Feed                                            |     |
| +----------------------------------------------------------+     |
|                                                                  |
| +----------------------------------------------------------+     |
| | Quick Actions (Horizontal scroll: [Create] [Report]...) |     |
| +----------------------------------------------------------+     |
|                                                                  |
| [Bottom Tab Bar: Home | Analytics | Campaigns | Profile]         |
+------------------------------------------------------------------+
```

**Changes:**
- Sidebar hidden, replaced by hamburger menu (off-canvas drawer)
- KPI cards: Horizontal scroll, 1 visible at a time, snap scroll
- Charts: Full width, horizontal scroll if needed
- Single column layout throughout
- Bottom tab bar for primary navigation
- Quick actions: Horizontal scrollable row

### Responsive Behavior Rules

**Navigation:**
- Desktop (≥ 1024px): Full sidebar with labels
- Tablet (640-1023px): Collapsed sidebar (icons), expandable on hover
- Mobile (< 640px): Hidden sidebar, hamburger opens drawer

**KPI Cards:**
- Desktop (≥ 1024px): 4 columns (span-3 each)
- Tablet (≥ 640px): 2 columns (span-4 each)
- Mobile (< 640px): Horizontal scroll, 1 card at a time

**Charts:**
- Desktop (≥ 1024px): Full width, min-height 400px
- Tablet (≥ 640px): Full width, min-height 350px
- Mobile (< 640px): Full width, min-height 250px, horizontal scroll if overflow

**Panels:**
- Desktop (≥ 1024px): Side-by-side (span-8 + span-4)
- Tablet (≥ 640px): Stacked or 50/50 split
- Mobile (< 640px): Full width, stacked

**Actions:**
- Desktop (≥ 1024px): 4 buttons per row
- Tablet (≥ 640px): 4 buttons per row
- Mobile (< 640px): Horizontal scroll

**Tables:**
- Desktop (≥ 1024px): Full width with horizontal scroll
- Tablet (≥ 640px): Full width with horizontal scroll
- Mobile (< 640px): Card view (stack key-value pairs)

### Touch Considerations (Mobile/Tablet)

- Minimum touch target: 44px × 44px
- Spacing: 8px between targets
- Pull-to-refresh: Supported
- Swipe gestures: For KPI cards and notifications

---

## 13. User Personas & Customization

### Persona-Based Defaults

**1. CEO / Executive**

```
Layout Priority:
1. High-level KPIs (Revenue, ROI)
2. Department performance summary
3. AI-synthesized executive brief
4. Critical alerts only

Shows: 3 KPI cards + 1 AI brief panel + 1 alerts list
Hides: Granular charts, detailed tables
```

**2. CMO / Marketing Director**

```
Layout Priority:
1. Marketing KPIs (leads, conversions, spend)
2. Channel performance charts
3. Campaign list with status
4. AI insights and recommendations

Shows: 4 KPI cards + all charts + activity + AI insights
Default view
```

**3. Digital Marketing Manager**

```
Layout Priority:
1. Campaign metrics
2. Detailed performance tables
3. Social media calendar status
4. Team activity and upcoming tasks

Shows: 4 KPIs + campaign table + charts + activity
Add: Quick actions for campaign management
```

**4. Agency User**

```
Layout Priority:
1. Client-specific KPI summary
2. Multi-client comparison charts
3. Budget utilization across clients
4. Team workload and task completion

Shows: Client selector dropdown + 4 KPI cards + charts
Custom: Multi-client aggregate view
```

### Customization Features

**1. Drag-and-Drop Layout**
- User can drag cards to reorder
- System remembers position per user
- Reset to default available

**2. KPI Selection**
- User selects 4 KPIs from 20+ available
- Industry-specific templates (higher ed, e-commerce, SaaS)
- Saved as custom view

**3. Chart Preferences**
- Toggle time range (7d, 30d, 90d)
- Compare to previous period (on/off)
- Granularity (day, week, month)

**4. AI Insight Filters**
- Show only: Anomalies, Opportunities, All
- Dismiss permanently from list
- Priority level filter

**5. Notifications Settings**
- Channels: Email, in-app, Slack
- Frequency: Real-time, hourly digest, daily
- Categories: Budget, leads, campaign, system

**6. Shortcuts**
- `/` - Open command palette
- `K` - Focus search
- `N` - New campaign
- `A` - Toggle AI Copilot
- `?` - Show shortcuts

---

## 14. Interaction Patterns

### Loading States

**Initial Load (Page Refresh)**
```
1. Show skeleton screen matching dashboard structure
2. Staggered skeleton rendering: KPI cards → Charts → Feed
3. Total load time: < 1s on fast networks
4. Fallback: "Loading..." text if > 3s

Skeleton pattern:
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ ████████│  │ ████████│  │ ████████│  │ ████████│
│ ████████│  │ ████████│  │ ████████│  │ ████████│
│         │  │         │  │         │  │         │
└─────────┘  └─────────┘  └─────────┘  └─────────┘
(Pulse animation at 1.5s)
```

**Data Refresh (Time Range Change)**
- KPI cards: 200ms fade out → number update → 200ms fade in
- Charts: 300ms crossfade between old and new
- Activity feed: No loading (cached), append new at top

**Action Loading (e.g., "Create Campaign")**
- Button: Shows spinner + "Creating..." text
- Modal: Opens immediately, content loads progressively
- Toast: "Campaign created successfully" on completion

### Error Handling

**Data Load Failure**
```
┌───────────────────────────────────────────────────────┐
│ [Icon: Warning]                                      │
│                                                       │
│ Unable to load dashboard data                        │
│                                                       │
│ Please check your connection and try again.           │
│                                                       │
│ [Retry]                [View Status Page]            │
└───────────────────────────────────────────────────────┘
```

**Partial Failure (Some KPIs failed)**
- Show loaded KPIs, mark failed with "-" or "N/A"
- Red border on failed card
- Tooltip: "Unable to load, click to retry"

### Empty States

**No Data Available (New User)**
```
┌──────────────────────────────────────────────────────┐
│ [Icon: Rocket 96px]                                   │
│                                                       │
│ Welcome to your Dashboard                             │
│                                                       │
│ Create your first campaign to see performance data.   │
│                                                       │
│ [Create Campaign]  [Take a Tour]                      │
└──────────────────────────────────────────────────────┘
```

**No Activity Yet**
- Show: "No recent activity. Start by creating a campaign."
- Action: Primary CTA

### Keyboard Navigation

**Tab Order:**
1. Skip to main content link
2. Time range selector
3. KPI cards (focusable with hover)
4. Main chart (aria-describedby)
5. Secondary panels
6. Activity items
7. Quick action buttons
8. Notification items

**Keyboard Shortcuts:**
- `/` - Focus search
- `N` - New campaign (from dashboard)
- `T` - Toggle time range (7d/30d)
- `R` - Refresh data
- `?` - Show keyboard shortcuts modal

### Micro-Interactions

**KPI Card Hover:**
- Elevation: Level 2 (shadow lg)
- Border: 1px solid primary
- Cursor: pointer
- Scale: 1.02
- Transition: 200ms ease-out

**Chart Tooltip:**
- Fade in: 100ms
- Follow mouse: Instant (no lag)
- Max opacity: 0.95
- Position: Offset 12px from cursor

**Scroll Behavior:**
- Dashboard: Smooth scroll anchor links
- Charts: Smooth zoom (if enabled)
- Activity feed: Infinite scroll (load 50 more on scroll)

---

## Appendix A: Wireframe Variations

### Variation A: Minimalist CEO View

```
+----------------------------------------------------------+
│ Dashboard                                         [Jul 2026 ▾]│
+----------------------------------------------------------+
|                                                          |
| +--------------+ +--------------+ +--------------+      |
| | Revenue      | | ROI          | | Team         |      |
| | $1.2M        | | 340%         | | Efficiency   |      |
| | ↑ 18%        | | ↑ 12%        | | 87%          |      |
| +--------------+ +--------------+ +--------------+      |
|                                                          |
| +------------------------------------------------------+ |
| | Performance Trend                                    | |
| | [Large chart: 24-month revenue]                      | |
| |                                                     | |
| +------------------------------------------------------+ |
|                                                          |
| +------------------------------------------------------+ |
| | AI Executive Brief                                   | |
| |                                                     | |
| | Month summary, key wins, risks, next actions         | |
| |                                                     | |
| +------------------------------------------------------+ |
|                                                          |
+----------------------------------------------------------+
```

**When to use:** Executive C-suite, board prep mode
**Rationale:** Stripped of operational noise, focuses on outcome metrics

### Variation B: Data-Heavy Marketing Director View

```
+----------------------------------------------------------+
│ Dashboard                                         [30 days ▾]│
+----------------------------------------------------------+
|                                                          |
| +----------+ +----------+ +----------+ +----------+      |
| | Revenue  | | Leads    | | CVR      | | Spend    |      |
| $423K ↑12%| 2,847 ↓3% | 3.24%↑0.5 |$125K↓3%  |      |
| +----------+ +----------+ +----------+ +----------+      |
|                                                          |
| +------------------------------+ +---------------------+ |
| | Revenue Trend (Line)         | | Channel Mix         | |
| |                              | |                     | |
| +------------------------------+ +---------------------+ |
|                                                          |
| +------------------------------+ +---------------------+ |
| | Campaign Perf. (Bar)         | | Funnel Conversion   | |
| |                              | |                     | |
| +------------------------------+ +---------------------+ |
|                                                          |
| +---------------------------------+ +------------------+ |
| | Team Activity Feed              | | Quick Actions    | |
| |                                 | |                  | |
| +---------------------------------+ +------------------+ |
|                                                          |
+----------------------------------------------------------+
```

**When to use:** Standard marketing director, daily ops monitoring
**Rationale:** Full command center with all data layers

### Variation C: Focused Analytics View

```
+----------------------------------------------------------+
│ Analytics Dashboard                              [Custom ▾]│
+----------------------------------------------------------+
|                                                          |
| [Filters: Date range ▾] [Channel ▾] [Compare ☐] [Refresh]|
|                                                          |
| Revenue: $423,891  (↑ 12% vs last month)                 |
|                                                          |
| +------------------------------------------------------+ |
| | Trend Line (16px bold number, 12px label, chart)      | |
| |                                                     | |
| +------------------------------------------------------+ |
|                                                          |
| +----------+ +----------+ +----------+ +----------+       |
| | Google   | | Meta     | | LinkedIn | | Direct  |       |
| | $312K    | | $89K     | | $18K     | | $4K     |       |
| +----------+ +----------+ +----------+ +----------+       |
|                                                          |
| +------------------------------------------------------+ |
| | Detailed breakdown table                             | |
| | [Sortable, filterable, exportable]                   | |
| +------------------------------------------------------+ |
|                                                          |
+----------------------------------------------------------+
```

**When to use:** Tactical analysis, drill-down sessions
**Rationale:** Removes navigation noise, maximizes chart real estate

---

## Appendix B: Dashboard State Machine

### States

**Default State:**
- All sections visible in defined order
- KPIs show current period
- Charts show primary view
- Activity feed shows last 20 events
- Quick actions visible

**Filtered State:**
- Time range: 7d/30d/90d/1y/custom
- Channel filter: Google/Meta/LinkedIn/All
- Campaign filter: Active/Paused/All
- Compare mode: Enabled/disabled
- Granularity: Hour/Day/Week/Month

**Collapsed State (Scroll):**
- Header: Compact (48px), shows title only
- KPI cards: Hidden (replaced by floating pill showing primary KPI)
- Activity: Collapsed to 2 items

**Fullscreen State (Browser fullscreen API):**
- All margins removed
- Charts expand to fill space
- Sidebar collapses to icons

### State Transitions

```
Default → (Select time range) → Filtered → (Clear) → Default
Default → (Scroll down) → Collapsed → (Scroll top) → Default
Default → (F11) → Fullscreen → (Esc) → Default
```

---

## Appendix C: Data & Performance

### Data Requirements

**Dashboard Load:**
- KPIs: 4 API calls (parallel), < 200ms each
- Charts: 2 API calls, < 300ms each
- Activity feed: 1 API call, < 200ms, paginated (50 per page)
- AI insights: 1 API call, < 500ms, cached 15 minutes
- Total data: < 100KB per load

**Refresh Intervals:**
- KPIs: 5 minutes (auto-refresh in background)
- Charts: User-initiated or 15 minutes
- Activity: Real-time (WebSocket) or 1 minute polling
- AI insights: 15 minutes (cached)

### Performance Budgets

- Time to Interactive: < 2s on 4G (90th percentile)
- Chart render: < 500ms
- KPI update: < 100ms
- Skeleton display: < 50ms

### Optimization Strategies

- Lazy load charts below fold
- Cache chart data for time range (30 min TTL)
- Virtualize activity feed (render first 20, load more on scroll)
- Prefetch AI insights on dashboard hover (predictive)
- Service worker for offline dashboard state

---

## Appendix D: Accessibility Notes

### Keyboard Navigation

- **Tab:** Navigate between KPI cards, buttons, chart elements
- **Enter:** Activate focused element
- **Escape:** Close any open panel/modal
- **Arrow keys:** Navigate within dropdown menus

### Screen Reader Announcements

- KPIs: Announced as "Total Revenue: $423,891, up 12% from last month"
- Charts: Summary text: "Line chart showing revenue trend from June 1 to July 1"
- Activity: Read aloud as list items

### Color Independence

- All status conveyed by icon + shape + color
- Trend indicators: Arrow direction + color + text ("up 12%")
- Charts: Patterns (stripes, dots) for color-blind users (optional)

### Reduced Motion

- Disable chart animations (instant draw instead of animated)
- Disable hover elevation (card stays flat)
- Skip skeleton → show blank (no pulse animation)

---

## Appendix E: Design Token Alignment

### Token Usage in Dashboard

**Layout:**
```
Container: max-w-1440px, mx-auto, px-8 (desktop)
Grid: grid-cols-12, gap-6
Sidebar: w-64
Header: h-16
```

**Spacing:**
```
Section spacing: space-y-6 (24px)
Card padding: p-6 (24px)
KPI title: mb-2 (8px)
KPI value: mb-1 (4px)
```

**Colors:**
```
Background: bg-background
Card: bg-card
KPI label: text-muted-foreground
KPI value: text-foreground
Positive trend: text-success
Negative trend: text-destructive
```

**Typography:**
```
KPI label: text-xs font-medium uppercase tracking-wider
KPI value: text-4xl font-bold tabular-nums
Chart titles: text-lg font-semibold
Section titles: text-2xl font-bold
```

**Elevation & Shadows:**
```
Cards: shadow-none (default), shadow-lg (hover)
Modals: shadow-xl
Dropdowns: shadow-lg
```

---

## Appendix F: Component Interaction Map

```
┌──────────────────────────────────────────────────────────────┐
│                      DASHBOARD                                 │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐  ┌────────────────────────────────────┐ │
│  │ Time Selector  │  │                                    │ │
│  │ ┌──────────┐   │  │  ┌──────┐  ┌──────┐  ┌──────┐    │ │
│  │ │ Last 30d ▾│   │  │  │ KPI1 │  │ KPI2 │  │ KPI3 │    │ │
│  │ └──────────┘   │  │  │      │  │      │  │      │    │ │
│  └────────────────┘  │  └──────┘  └──────┘  └──────┘    │ │
│                     │                                    │ │
│  ┌────────────────┐  │  ┌──────────────────────────────┐ │ │
│  │ KPI 1 Click →  │  │  │     Main Chart               │ │ │
│  │ Drill down     │  │  │     [Line chart]             │ │ │
│  │ Analytics Page │  │  │                              │ │ │
│  └────────────────┘  │  └──────────────────────────────┘ │ │
│                      │                                    │ │
│  ┌────────────────┐  │  ┌──────────────────────────────┐ │ │
│  │ KPI 2 Click →  │  │  │  2AI Insights Panel  │       │ │
│  │ Alert Detail   │  │  │  [Anomaly, Opp, Predict]    │ │ │
│  └────────────────┘  │  └──────────────────────────────┘ │ │
│                      └────────────────────────────────────┘ │
│                                                               │
│  ┌──────────────────────────┐  ┌──────────────────────────┐ │
│  │ Secondary Charts          │  │ Notifications            │ │
│  │ [Bar chart] [Donut chart] │  │ [Feed, slide-out panel]  │ │
│  └──────────────────────────┘  └──────────────────────────┘ │
│                                                               │
│  ┌──────────────────────────┐  ┌──────────────────────────┐ │
│  │ Recent Activity           │  │ Quick Actions            │ │
│  │ [Chronological list]      │  │ [Create, Report, AI]     │ │
│  └──────────────────────────┘  └──────────────────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

**END OF DASHBOARD BLUEPRINT**

*This blueprint is maintained by the Calixo Design Team. Implementation should follow alongside CALIXO_DESIGN_SYSTEM.md and UI guidelines.*