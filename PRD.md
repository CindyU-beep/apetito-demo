# Planning Guide

Streamline institutional foodservice procurement through an intelligent, conversational interface that handles menu planning, allergen compliance, and bulk ordering in a single, efficient workflow.

**Experience Qualities**:
1. **Efficient** - Minimize time-to-order through predictive AI and natural conversation flows that understand institutional procurement needs
2. **Trustworthy** - Build confidence through transparent allergen detection, nutritional data, and compliance validation at every step
3. **Intelligent** - Anticipate buyer needs with recipe-aware recommendations, ingredient substitutions, and menu-based ordering

**Complexity Level**: Complex Application (advanced functionality, accounts)
  - Requires sophisticated AI integration, multi-step workflows, conversational interfaces, recipe mapping, compliance validation, and personalized recommendation engines typical of enterprise B2B platforms

## Essential Features

### Home Page with AI-Powered Ordering
- **Functionality**: Central hub featuring hero carousel with seasonal promotions, AI-driven quick reorder, predictive ordering suggestions, seasonal menus (including Christmas specials), trending meals, and ordering insights dashboard
- **Purpose**: Provide institutional buyers with an intelligent, personalized entry point that surfaces the most relevant ordering options based on their patterns, the current season, and market trends
- **Trigger**: User lands on application or navigates to "Home" tab
- **Progression**: User views hero carousel highlighting current promotions → Reviews AI insights showing order statistics → Explores tabbed interface with Predictive/Reorder/Seasonal options → Browses AI-suggested meals with confidence scores → Reviews trending meals section → Adds items directly to cart → Navigates to other sections as needed
- **Success criteria**: Users find relevant meals within 3 clicks; 40%+ of orders initiated from home page suggestions; AI predictions achieve 75%+ relevance rating from users

### Organization Profile & Context Management
- **Functionality**: Comprehensive profile system accessible via user icon in header that stores organization details (name, type, contact), dietary preferences, allergen exclusions, budget targets, serving capacity, order history, and special requirements. Profile data automatically feeds into AI agent context for personalized recommendations across all interactions.
- **Purpose**: Enable AI agents to provide highly personalized, institution-specific recommendations by understanding organizational constraints, dietary requirements, budget limits, and historical preferences. Eliminates repetitive specification of dietary needs in every conversation.
- **Trigger**: User clicks profile icon in header → Opens profile dialog → Views/edits profile across four tabs (General, Preferences, History, AI Context)
- **Progression**: User opens profile dialog → **General Tab**: Edits organization name, type (hospital/school/care-home/etc.), contact info, serving capacity, address, budget per serving target → **Preferences Tab**: Toggles allergen exclusions (nuts, shellfish, dairy, etc.), selects dietary restrictions (vegetarian, vegan, halal, kosher, pescatarian), adds special requirements in text area → **History Tab**: Views total orders, total spent, average order value, recent order details with dates and statuses → **AI Context Tab**: Reviews how each agent uses profile data (Budget Agent considers budget targets, Dietary Agent auto-filters allergens, Nutrition Agent tailors by org type, Order History informs recommendations) → Views current profile summary with active restrictions highlighted → Saves profile → All AI agents immediately reference updated profile in subsequent conversations → Cart validation automatically flags items violating profile allergen exclusions → Load sample profile button pre-fills hospital example data
- **Success criteria**: Profile data persists across sessions; AI agents reference profile context in 100% of recommendations; Automatic allergen filtering reduces manual query specification by 80%; Budget targets correctly influence cost optimization suggestions; Order history influences product recommendations; Profile summary accurately reflects all settings; Sample data provides realistic hospital example

### Multi-Agent Conversational Product Discovery
- **Functionality**: AI-powered chat interface with agent selector dropdown and specialized agents (Budget, Nutrition, Dietary, Meal Planning, Coordinator) that collaborate to provide comprehensive guidance on products, recipes, ingredients, and dietary requirements through natural language. Agents automatically reference organization profile for context-aware recommendations. Users can toggle between "Auto Mode" (coordinator routes to all relevant agents) and direct chat with individual specialized agents via dropdown menu with arrow indicator.
- **Purpose**: Transform complex procurement searches into intelligent conversations where specialized agents work together to address budget constraints, nutritional goals, dietary restrictions, and menu planning simultaneously, reducing cognitive load and decision time for institutional buyers. Profile integration ensures recommendations respect organizational requirements without repetitive specification. Agent selector empowers users to directly consult specific agents when they know their exact need.
- **Trigger**: User clicks chatbot button (bottom-right corner) → Opens chat popup → Selects agent mode from dropdown (default: Auto Mode) → Types query in text input field or clicks suggested conversation starters
- **Progression**: User selects agent mode from dropdown menu (Auto/Coordinator/Budget/Nutrition/Dietary/Meal Planning) → Types question in text input field → Agents automatically load organization profile and order history for context → **Auto Mode**: Coordinator analyzes query with profile context → Routes to relevant specialized agents → Multiple agents respond sequentially with color-coded avatars → **Direct Mode**: Selected agent analyzes query directly with profile awareness → Single agent responds with specialized guidance → Budget Agent considers budget per serving and serving capacity from profile → Nutrition Agent tailors recommendations based on organization type → Dietary Agent auto-filters products based on profile allergen exclusions and dietary restrictions → Meal Planning Agent respects profile preferences in menu creation → Coordinator orchestrates all agents for complex queries → Agents present responses with color-coded avatars and badges → Display metadata cards (budget summaries, nutrition averages, dietary compliance) → Show relevant products and meals inline → User types follow-up questions → Agents maintain conversation and profile context → User refines query, switches agents, or adds items to cart → Clear chat option to start fresh conversation
- **Success criteria**: Multi-agent responses provide comprehensive guidance in single conversation; 90%+ relevance when multiple agents respond; Users identify optimal products 40% faster with agent collaboration; Profile context integration eliminates 80% of repetitive dietary specifications; Clear visual distinction between agent types via colored avatars; Agent dropdown selection persists throughout conversation; Direct agent mode responses stay focused on agent specialty; Metadata summaries (budget/nutrition/dietary) display accurately; Text input accepts natural language queries; Chat history persists and scrolls smoothly; Agent switching does not lose conversation or profile context; Agents explicitly reference profile data in responses (e.g., "Based on St. Mary's Hospital's profile...")

### Recipe-to-Cart Mapping
- **Functionality**: Transform complete recipes into optimized bulk orders with automatic SKU matching and quantity calculations
- **Purpose**: Eliminate manual recipe-to-ingredient conversion work that wastes hours of institutional buyer time
- **Trigger**: User pastes recipe, uploads menu plan, or asks AI to "order ingredients for [dish]"
- **Progression**: Recipe input → AI extracts ingredients & quantities → System maps to available SKUs → Displays matched products with bulk options → User reviews substitutions → Confirms and adds to cart
- **Success criteria**: 90%+ ingredient matching rate; bulk quantity suggestions align with institutional serving sizes

### Allergen & Compliance Validator
- **Functionality**: Real-time allergen scanning across cart items and meal plans with AI-powered warnings, visual indicators, and intelligent contextual alerts based on organization profile. When users attempt to add meals containing restricted allergens (especially nuts), the system immediately detects violations, generates personalized AI warnings explaining the risks specific to their organization type (hospital, school, etc.), and provides options to remove the item or proceed with caution.
- **Purpose**: Protect institutions from compliance risks and health emergencies through automated, reliable allergen detection with intelligent AI assistance that understands organizational context and provides actionable safety guidance
- **Trigger**: Automatic on meal selection in meal planner; automatic during cart changes; automatic during Apetito Analysis of meal plans; manual trigger via "Check Allergens" button
- **Progression**: User selects meal with restricted allergen → System immediately detects violation by comparing meal allergens against organization profile exclusions → Visual warning icon appears on meal card (red border, warning badge) → Toast notification alerts user of specific allergen violation → AI generates contextual warning message explaining risk for their organization type → User attempts to save meal → AI-powered dialog appears with detailed safety message and "Add Anyway" option → If user proceeds, meal is added with persistent visual indicators (red left border, warning icon in calendar view) → During Apetito Analysis, AI scans entire meal plan for violations → Generates critical alert listing all violating meals by day with AI-generated compliance warning → Visual indicators persist throughout meal plan calendar showing which meals contain restricted allergens
- **Success criteria**: 100% detection rate for profile-excluded allergens; AI warnings generated within 2 seconds; Visual indicators appear immediately on meal selection; Warnings reference organization name and type in messaging; Apetito Analysis identifies all allergen violations with day-by-day breakdown; Users can still add restricted items but with multiple confirmation steps; Visual allergen badges on all meal cards show which specific allergens are present; Red warning styling for restricted allergens vs. neutral styling for non-restricted allergens

### Personalized Menu Recommendations
- **Functionality**: AI-driven product suggestions based on ordering history, seasonal trends, and institutional dietary patterns
- **Purpose**: Drive repeat orders and discover relevant products through intelligent upselling that respects institutional constraints
- **Trigger**: Displayed on dashboard, during search, and at checkout; "Build Menu for Me" action
- **Progression**: System analyzes order history & preferences → Generates menu suggestions for specific meal types → Displays products with relevance scores → User explores recommendations → Adds items or requests variations
- **Success criteria**: 30%+ click-through on recommendations; measurable increase in order value through suggested additions

### Bulk Order Management
- **Functionality**: Smart cart with institutional pricing, bulk optimization, and order scheduling for recurring deliveries
- **Purpose**: Streamline high-volume ordering with pricing transparency and delivery coordination that matches institutional procurement cycles
- **Trigger**: Add to cart actions; "Schedule Recurring Order" feature
- **Progression**: User adds items → System suggests bulk quantities & pricing tiers → Displays total with institutional discounts → User sets delivery schedule → Reviews compliance summary → Confirms order → Receives confirmation with allergen report
- **Success criteria**: Clear display of volume discounts; delivery scheduling reduces repeat ordering time by 50%

### Food Safety & Sustainability Information
- **Functionality**: Comprehensive European food safety labeling and sustainability metrics integrated throughout the application, including EU nutrition labels (Regulation 1169/2011), food safety certifications (IFS, BRC, ISO 22000, HACCP, EU Organic, Halal, Kosher), traceability codes, storage conditions, CO₂ footprint per serving, regional sourcing indicators, organic certification, sustainability scores (0-100), recyclable packaging information, transport distance, and seasonal product badges. Information displayed via compact badges on product/meal cards and detailed panels with explanatory tooltips.
- **Purpose**: Enable institutional buyers to make informed purchasing decisions aligned with sustainability goals and regulatory compliance requirements, meet European food safety standards, demonstrate environmental responsibility to stakeholders, and reduce carbon footprint while maintaining food safety certifications required for hospitals, schools, and care facilities.
- **Trigger**: Information automatically displayed on all product and meal cards; detailed view accessible via tooltips; sustainability analysis included in meal plan AI analysis
- **Progression**: User views product/meal card → Sees compact sustainability badges (sustainability score with color coding: green ≥80, amber ≥60, gray <60; CO₂ footprint in kg; regional sourcing indicator; organic certification; recyclable packaging icon; seasonal product badge) → Hovers over badges for detailed tooltips → Sees food safety certification badges (count of certifications if multiple; EU nutrition label indicator) → Meal plan analysis includes sustainability metrics (average sustainability score across plan, total CO₂ footprint, count of regional/organic/seasonal meals) → AI provides sustainability insights ("Excellent Sustainability" for avg ≥80 or "Sustainability Improvement Available" for avg <70) → User can prioritize products/meals with higher sustainability scores, lower CO₂ footprint, regional sourcing, or specific certifications
- **Success criteria**: Sustainability badges visible on 100% of products/meals with data; Food safety certifications display on certified items; Tooltips provide clear explanations of each metric; Meal plan analysis calculates aggregate sustainability metrics accurately; AI sustainability insights appear when meals have sustainability data; Visual hierarchy distinguishes excellent (green), good (amber), and needs-improvement (gray) sustainability scores; Regional sourcing, organic, and seasonal badges clearly identifiable; CO₂ footprint helps compare environmental impact; Packaging recyclability information promotes sustainable choices; EU nutrition label compliance clearly indicated

### Meal Planning & Menu Management
- **Functionality**: Weekly meal planning interface with horizontal day layout showing meal cards, meal catalog browsing for complete dishes from Apetito menu, comprehensive AI-powered capabilities including auto-generation, custom natural language requests, and deep nutritional analysis, smart recommendations based on institutional requirements, dietary restrictions, budget constraints, and person count, and automatic shopping list generation with cost estimation. **AI Assistant automatically loads and references organization profile context** to provide personalized recommendations without requiring repetitive specification of dietary needs, allergen exclusions, budget targets, or serving capacity.
- **Purpose**: Enable institutional buyers to plan weekly menus in advance by selecting complete meals from Apetito's catalog, leverage advanced AI to optimize nutritional balance and variety based on specific institutional needs **with automatic integration of organization profile data**, receive intelligent meal suggestions tailored to custom requirements through natural language **that respect saved allergen exclusions and dietary preferences**, visualize nutritional totals across days, and track estimated costs per person **against organization budget targets**
- **Trigger**: User navigates to "Plan" tab; clicks "Create New Meal Plan" or selects existing plan; browses meals in "Meals" tab; accesses "AI Assistant" tab with three modes (Generate, Custom, Analyze); **profile data auto-loads from saved organization settings**; configures additional institutional parameters (people count defaults to profile serving capacity, dietary restrictions pre-populate from profile, budget defaults to profile per-serving target); types natural language requests for plan modifications; clicks "Auto-Fill Week" for AI-generated complete weekly plans; requests analysis of current plan balance
- **Progression**: User creates weekly plan → Accesses AI Assistant with tabbed interface → **Profile context banner displays** showing active organization (name, type, capacity, budget target, allergen exclusions highlighted in red, dietary preferences highlighted in green, special requirements) → **Generate Mode**: Views pre-filled institutional parameters from profile (number of people defaults to serving capacity, dietary restrictions auto-populate from profile preferences, budget per meal shows profile target) → Can override defaults if needed → Clicks "Auto-Fill Entire Week" → **AI generates complete balanced plan using profile context** (excludes all meals containing profile allergen exclusions, prioritizes meals matching profile dietary preferences, considers profile budget per serving, scales to profile serving capacity) → Plan shows reasoning explicitly mentioning profile alignment ("Selected for vegetarian preference at St. Mary's Hospital", "Within $3.75/serving budget target") → **Custom Mode**: Types natural language requests ("Make Monday lighter", "Add more protein", "Swap meals with nuts", "Make Friday special") → **AI interprets request with full awareness of organization profile** (automatically excludes allergens, respects dietary preferences, considers budget constraints, references order history) → Provides summary of changes made with profile compliance noted → **Analyze Mode**: Clicks "Analyze Current Plan" → **Visual animation shows each day being analyzed sequentially with pulsing ring effect** → AI evaluates nutritional balance showing daily averages (calories, protein, carbs, fat), meal variety score, cost per day, **and comprehensive sustainability metrics** (average sustainability score, CO₂ footprint, regional/organic/seasonal meal counts, transport distance, recyclable packaging percentage) → **Profile-aware insights include**: Critical allergen violation warnings if any meals contain excluded allergens (highlighted in red with organization name), budget target comparison showing cost per serving vs. profile target, dietary preference alignment check, **detailed sustainability performance rating with actionable recommendations based on score tiers (Excellent 80+: celebrates achievements with specific percentages and highlights alignment with Apetito sustainability commitments; Good 60-79: acknowledges baseline with specific improvement suggestions; Action Needed <60: provides concrete alternatives and emphasizes Apetito's high-sustainability options)** → Generates actionable insights with severity levels prioritizing profile compliance → Each insight includes specific action buttons filtered by profile (e.g., meal suggestions automatically exclude profile allergens) → User reviews AI-generated plan in Calendar view with color-coded days → Each meal shows AI reasoning for selection including profile considerations → Shopping list view shows consolidated meal summary with total servings and cost estimates compared to budget target
- **Success criteria**: Meal plans persist across sessions; **Organization profile loads automatically in AI Assistant 100% of the time**; **Profile context visible in UI banner with color-coded allergen/dietary highlights**; **AI prompts explicitly include profile data** (organization name, type, allergen exclusions, dietary preferences, budget targets, special requirements); AI auto-fill generates balanced plans within 5 seconds **that comply with profile allergen exclusions 100%**; Custom requests successfully interpret 90%+ of natural language inputs **while maintaining profile compliance**; **Analysis animation shows each day being processed with visual feedback (400ms per day)**; Analysis completes within 2 seconds; Generated plans meet 2000-2200 kcal/day target with 60-80g protein; **AI excludes all meals containing profile allergen exclusions without manual specification**; **AI prioritizes meals matching profile dietary restrictions** (vegetarian, vegan, etc.); Budget constraints honored from profile **with automatic cost-per-serving calculations against target**; Institutional parameters (people count) default to profile serving capacity; Natural language changes apply to correct days **while respecting profile constraints**; **AI explicitly references profile in reasoning** ("Based on St. Mary's Hospital's requirements...", "Aligned with vegetarian preference"); **Allergen violation warnings appear prominently** if plan contains restricted allergens; **All meal suggestion functions filter by profile allergens**; Cost estimation accurate per serving **with comparison to profile budget target**; **Sustainability insights appear when average score >0 with three-tier commentary system: Excellent (≥80) provides detailed percentage breakdowns of regional/organic/seasonal/recyclable metrics with Apetito sustainability alignment messaging; Good (60-79) shows current metrics with specific improvement recommendations; Action Needed (<60) emphasizes environmental impact with guidance toward Apetito's high-sustainability alternatives**; Multi-tab interface clearly separates generation, customization, and analysis workflows

## Edge Case Handling

- **Unknown Ingredients**: AI requests clarification or suggests closest matches with confidence scores
- **Out-of-Stock Items**: Proactive alternative suggestions with similarity rankings and compliance matching
- **Ambiguous Allergen Data**: Display "unverified" status with contact option for manual verification
- **Recipe Parsing Failures**: Graceful fallback to manual ingredient entry with AI-assisted autocomplete
- **Complex Dietary Restrictions**: Multi-filter support (vegan + gluten-free + nut-free) with clear "no matches" messaging
- **Unmatched Ingredients**: Shopping list now shows meal summaries with cost per serving instead of raw ingredients
- **Empty Meal Plans**: Guide users to create first plan with clear benefits and example use cases; AI offers to auto-fill week with institutional parameters
- **Overlapping Meal Plans**: Allow multiple plans but clearly indicate which is "active" for shopping list generation
- **Meal Selection**: Browsing 20+ prepared meals from Apetito catalog with search, category filters, allergen exclusions, and AI-powered suggestions
- **AI Generation Failures**: Graceful fallback to manual selection with cached suggestions; retry option with timeout handling; clear error messaging
- **Poor Nutritional Balance**: AI proactively identifies issues (low protein, high calories, limited variety) and suggests specific meal swaps with one-click actions
- **Budget Constraints**: AI considers price when generating suggestions and auto-fill plans; offers budget optimization recommendations; warns when requirements conflict
- **Invalid Institutional Parameters**: Validates number of people (positive integers), budget values (positive numbers); provides helpful error messages
- **Complex Natural Language Requests**: AI attempts best interpretation; requests clarification if ambiguous; shows what changes will be made before applying
- **Dietary Restriction Conflicts**: AI warns if requested restrictions eliminate too many meal options; suggests relaxing constraints or adding more meal variety
- **Day-Specific Preferences**: AI learns patterns (e.g., lighter meals mid-week) and adapts suggestions accordingly; custom mode allows targeting specific days
- **Analysis on Empty Plans**: Prompts user to add meals before analysis; offers to auto-generate plan as starting point
- **Large Orders**: Performance optimization with progressive loading and cart summarization
- **Offline Mode**: Queue actions locally with sync indicators and retry logic

## Design Direction

The design should embody Apetito's modern, fresh, and trustworthy brand identity—using their signature green to communicate health, quality, and sustainability while maintaining the efficiency and professionalism institutional buyers expect. The interface should feel clean, contemporary, and approachable, balancing Apetito's warm food service heritage with cutting-edge AI technology. The design must prominently feature Apetito's logo and brand colors throughout, creating immediate brand recognition and trust. Minimal interface with purposeful information hierarchy serves both the welcoming nature of food service and the mission-critical accuracy of compliance and ordering.

## Color Selection

Analogous (Apetito brand colors) - Using Apetito's signature fresh green as the primary brand color (#83bb26) paired with their accent red (#dd052b) for important actions and warnings, creating a clean, modern, and trustworthy institutional food service experience that aligns with Apetito's established brand identity.

- **Primary Color**: Apetito Green `oklch(0.70 0.18 130)` (#83bb26) - Communicates freshness, quality food, health, and growth; represents Apetito's commitment to nutritious meals
- **Secondary Colors**: 
  - Neutral Light Gray `oklch(0.96 0.01 260)` for backgrounds - clean, modern feel that keeps focus on content
  - Soft Gray `oklch(0.90 0.005 260)` for borders and inputs - subtle definition without harshness
- **Accent Color**: Apetito Red `oklch(0.55 0.22 25)` (#dd052b) - Used for critical actions, allergen warnings, and important notifications; creates visual hierarchy and urgency where needed
- **Success**: Apetito Green `oklch(0.70 0.18 130)` - Reinforces positive actions with brand color consistency
- **Destructive/Warning**: Apetito Red `oklch(0.55 0.22 25)` - Allergen warnings and critical compliance alerts using brand red

**Foreground/Background Pairings**:
- Background (Clean White `oklch(0.99 0 0)`): Foreground Dark `oklch(0.20 0.01 260)` - Ratio 14.2:1 ✓
- Card (Pure White `oklch(1 0 0)`): Card Foreground `oklch(0.20 0.01 260)` - Ratio 14.8:1 ✓
- Primary (Apetito Green `oklch(0.70 0.18 130)`): White text `oklch(1 0 0)` - Ratio 5.8:1 ✓
- Secondary (Light Gray `oklch(0.96 0.01 260)`): Dark text `oklch(0.20 0.01 260)` - Ratio 13.1:1 ✓
- Accent (Apetito Red `oklch(0.55 0.22 25)`): White text `oklch(1 0 0)` - Ratio 6.2:1 ✓
- Muted (Soft Gray `oklch(0.96 0.005 260)`): Muted Foreground `oklch(0.48 0.01 260)` - Ratio 7.4:1 ✓

## Font Selection

Typography should convey precision and clarity while maintaining approachability—sans-serif fonts with excellent legibility at various scales, supporting both data-dense tables and conversational interface elements.

- **Primary Typeface**: Inter - Modern, highly legible, optimized for UI with excellent number rendering for SKUs and quantities
- **Secondary Typeface**: System UI Stack - Native feel for maximum performance in data-heavy views

**Typographic Hierarchy**:
- H1 (Page Title): Inter Bold / 32px / -0.02em letter spacing / 1.2 line height
- H2 (Section Headers): Inter SemiBold / 24px / -0.01em / 1.3 line height
- H3 (Subsections): Inter SemiBold / 18px / normal / 1.4 line height
- Body (Primary Content): Inter Regular / 15px / normal / 1.6 line height
- Body Small (Supporting Info): Inter Regular / 13px / normal / 1.5 line height
- Labels (Form/Data Labels): Inter Medium / 13px / 0.01em / 1.4 line height
- Captions (Metadata): Inter Regular / 12px / normal / 1.4 line height
- Chat AI Messages: Inter Regular / 15px / normal / 1.6 line height with slightly increased spacing
- Product SKUs/Data: Inter Medium / 14px / tabular numbers / 1.3 line height

## Animations

Animations should feel purposeful and professional—subtle micro-interactions that confirm actions and guide attention without delaying workflows or feeling playful in a context that demands efficiency and trust.

- **Purposeful Meaning**: Motion reinforces the conversational flow of AI interactions (message typing indicators, smooth scrolls to responses) and validates critical actions like compliance checks (success pulses, warning fades)
- **Hierarchy of Movement**: Highest priority on AI typing indicators and compliance badge updates; moderate animation on cart updates and recommendations; minimal animation on navigation to avoid distraction during data review

### Animation Specifications:
- **AI Message Appearance**: Fade-up with 200ms ease-out - feels like natural conversation flow
- **Compliance Badge Updates**: Scale + color transition 300ms - draws attention to critical state changes
- **Cart Item Add**: Slide-in from product position 250ms with subtle bounce - confirms action success
- **Allergen Warnings**: Gentle pulse animation 400ms on first appearance - ensures visibility without alarm
- **Loading States**: Skeleton shimmer for product lists, typing indicator for AI responses - maintains engagement during processing
- **Hover States**: 150ms color/shadow transitions on interactive elements - immediate feedback
- **Panel Transitions**: 300ms slide animations for sidebars and modals - maintains spatial context

## Component Selection

**Components**:
- **Logo**: Apetito's official logo prominently displayed in header, using the brand's signature green (#83bb26) and red (#dd052b) colors to establish immediate brand recognition and trust
- **Carousel**: Hero carousel with auto-play for seasonal promotions, Christmas menus, and featured content with navigation controls
- **Dialog/Sheet**: For recipe upload modal, allergen detail views, and compliance reports (responsive: Sheet on mobile, Dialog on desktop)
- **Card**: Primary container for products, recipe matches, recommendation groups, insights cards, and meal displays with hover states
- **Command**: Enhanced search with keyboard shortcuts for power users (Cmd+K trigger)
- **Tabs**: Switch between "Home", "Chat", "Browse", "Orders" in main interface; also used for Predictive/Reorder/Seasonal on home page
- **Badge**: Allergen indicators, compliance status, stock levels, confidence scores, trending indicators with color-coded variants
- **Button**: Primary (add to cart), Secondary (view details), Ghost (navigation) with loading states
- **Input/Textarea**: Chat input with auto-grow, recipe paste area, search refinement
- **ScrollArea**: Chat history, product lists, ingredient tables for smooth scrolling in dense content
- **Separator**: Visual breaks between chat exchanges and product groupings
- **Avatar**: AI assistant identity with animated typing indicator
- **Alert**: Compliance warnings, allergen notifications with icon variants
- **Checkbox**: Multi-select for dietary filters and allergen exclusions
- **Select/Dropdown**: Bulk quantity selection, delivery scheduling with grouped options
- **Tooltip**: Contextual help for AI capabilities, allergen abbreviations, SKU details
- **Skeleton**: Loading states for products and AI responses during search
- **Progress**: Order processing steps, allergen scan progress for transparency
- **Table**: Order history, nutritional data with sortable columns and responsive collapse

**Customizations**:
- **Hero Carousel Component**: Auto-rotating slides with manual navigation, featuring seasonal promotions, special menus, and educational content with CTA buttons
- **AI Insights Dashboard**: Stats cards showing total orders, average order value, completion rate, and time since last order with icon-driven visual hierarchy
- **Predictive Meal Cards**: Meal cards enhanced with AI confidence badges showing match percentage and reasoning for recommendations
- **Quick Reorder Cards**: Order history cards with expandable item lists, individual item re-add buttons, and bulk reorder functionality
- **Seasonal Menu Browser**: Season-themed card layouts with winter/spring/summer/autumn filtering and special holiday menu sections (Christmas, Easter)
- **Trending Section**: Grid of popular meals with ranking badges (#1, #2, #3 trending indicators)
- **Simple Meal Card Component**: Streamlined meal card for home page with quick add-to-cart, dietary tags, allergen badges, and nutritional preview
- **Product Card Component**: Custom layout combining Card + Badge + Button with image, SKU, pricing tiers, allergen badges, and quick-add functionality
- **Meal Card Component**: Custom layout for complete meals showing image, name, components list, dietary tags, nutritional info, allergen badges, and "Add to Plan" action
- **Agent Selector Dropdown**: Dropdown menu with arrow indicator allowing users to toggle between Auto Mode (all agents collaborate) and direct chat with individual specialized agents (Budget, Nutrition, Dietary, Meal Planning, Coordinator). Each agent option displays colored icon, label, and brief description of specialty.
- **Chat Message Component**: Custom layout with Avatar + animation states for AI vs user messages, with embedded product cards and action buttons. AI messages show agent-specific colored avatars with specialty badges.
- **Chat Input Component**: Enhanced text input field with placeholder text adapting to selected agent mode, send button, loading state, and clear chat option in footer
- **Compliance Summary Panel**: Custom visualization showing allergen matrix, risk levels, and nutritional totals with clear visual hierarchy
- **Recipe Mapper**: Custom interface showing original recipe → matched products with confidence indicators and manual override options
- **Weekly Calendar Layout**: Horizontal day-by-day layout with color-coded day headers (Monday=emerald, Tuesday=sky, etc.) showing meal cards with images, components, and nutritional totals
- **Meal Selection Dialog**: Custom meal browser with search, grid layout of meal cards, selection state, and serving quantity input
- **Shopping List Summary**: Consolidated meal overview showing unique meals, total servings, and estimated costs with checkboxes for tracking

**States**:
- **Buttons**: Default, Hover (subtle lift + shadow), Active (pressed scale), Loading (spinner), Disabled (reduced opacity)
- **Inputs**: Default with border, Focus (accent ring + border), Error (destructive border + message), Success (success border + checkmark)
- **Product Cards**: Default, Hover (lift + shadow increase), Selected (accent border), Loading (skeleton overlay)
- **Allergen Badges**: Info (muted), Warning (amber), Danger (destructive) with consistent iconography
- **Chat Input**: Idle, Typing (character count), Sending (loading), Error (shake animation + retry)

**Icon Selection**:
- **Home/Navigation**: `House` for home page, `ChatsCircle` for chat, `Calendar` for planning
- **AI Features**: `Sparkle` for AI indicators and coordinator, `TrendUp` for predictive, `ArrowsClockwise` for reorder, `Fire` for trending, `CaretDown` for dropdown selectors
- **Specialized Agents**: `CurrencyDollar` for Budget Agent, `ForkKnife` for Nutrition Agent, `ShieldCheck` for Dietary Agent, `ChefHat` for Meal Planning Agent, `Sparkle` for Coordinator
- **Seasonal**: `Snowflake` for winter/Christmas, `Sun` for summer, `Leaf` for spring, `CloudRain` for autumn
- **Insights**: `ChartLine` for analytics, `ShoppingCart` for orders, `Clock` for time-based data
- **Chat/AI**: `ChatsCircle`, `Sparkle` for AI indicators, `PaperPlaneTilt` for send, `User` for user messages
- **Products**: `ShoppingCart`, `Package`, `Barcode` for SKUs
- **Allergen/Compliance**: `Warning`, `ShieldCheck`, `FirstAid`, `X` for clearance
- **Food/Recipe**: `ForkKnife`, `CookingPot`, `ListChecks` for ingredients
- **Planning**: `Calendar` for meal planning, `Plus` for adding meals, `Trash` for removing
- **Actions**: `Plus`, `Minus`, `TrashSimple`, `ArrowsClockwise` for refresh, `PencilSimple` for editing, `Check` for completion
- **Navigation**: `MagnifyingGlass`, `List`, `ClockCounterClockwise` for history, `CaretLeft`/`CaretRight` for carousel
- **Data**: `ChartLine`, `DownloadSimple`, `FileText` for reports

**Spacing**:
- Base unit: 4px (Tailwind's default)
- Component internal padding: `p-4` (16px) for cards, `p-6` (24px) for dialogs
- Section gaps: `gap-6` (24px) for product grids, `gap-4` (16px) for form groups
- Page margins: `px-4 md:px-8 lg:px-12` responsive scaling
- Chat messages: `space-y-4` for comfortable reading rhythm
- Tight groups (badges, labels): `gap-2` (8px)

**Mobile**:
- Stack sidebar navigation into bottom sheet or hamburger menu
- Chat interface remains primary view with full-screen focus
- Product cards switch from grid (desktop: 3-4 columns) to single column stack
- Tabs convert to horizontal scroll or dropdown selector on narrow screens
- Tables collapse to card views with expandable rows for details
- Sticky "Add to Cart" button at bottom for quick access
- Command palette remains accessible but triggered via visible button instead of keyboard shortcut only
- Form inputs expand to full width with larger touch targets (min 44px height)
- Compliance summary becomes accordion-style expandable sections
