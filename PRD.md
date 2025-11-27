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

### Multi-Agent Conversational Product Discovery
- **Functionality**: AI-powered chat interface with specialized agents (Budget, Nutrition, Dietary, Meal Planning, Coordinator) that collaborate to provide comprehensive guidance on products, recipes, ingredients, and dietary requirements through natural language
- **Purpose**: Transform complex procurement searches into intelligent conversations where specialized agents work together to address budget constraints, nutritional goals, dietary restrictions, and menu planning simultaneously, reducing cognitive load and decision time for institutional buyers
- **Trigger**: User types query in chatbot popup (bottom-right corner) or clicks suggested conversation starters
- **Progression**: User asks question → Coordinator Agent analyzes query → Routes to relevant specialized agents → Each applicable agent analyzes independently → Budget Agent provides cost optimization and bulk deals → Nutrition Agent ensures balanced nutritional profiles → Dietary Agent validates allergen compliance and restrictions → Meal Planning Agent suggests complete meals and menus → Agents present responses sequentially with color-coded avatars and badges → Display metadata cards (budget summaries, nutrition averages, dietary compliance) → Show relevant products and meals → User refines query or adds items to cart → Agents suggest complementary items
- **Success criteria**: Multi-agent responses provide comprehensive guidance in single conversation; 90%+ relevance when multiple agents respond; Users identify optimal products 40% faster with agent collaboration; Clear visual distinction between agent types; Metadata summaries (budget/nutrition/dietary) display accurately

### Recipe-to-Cart Mapping
- **Functionality**: Transform complete recipes into optimized bulk orders with automatic SKU matching and quantity calculations
- **Purpose**: Eliminate manual recipe-to-ingredient conversion work that wastes hours of institutional buyer time
- **Trigger**: User pastes recipe, uploads menu plan, or asks AI to "order ingredients for [dish]"
- **Progression**: Recipe input → AI extracts ingredients & quantities → System maps to available SKUs → Displays matched products with bulk options → User reviews substitutions → Confirms and adds to cart
- **Success criteria**: 90%+ ingredient matching rate; bulk quantity suggestions align with institutional serving sizes

### Allergen & Compliance Validator
- **Functionality**: Real-time allergen scanning across cart items with visual warnings and detailed nutritional transparency
- **Purpose**: Protect institutions from compliance risks and health emergencies through automated, reliable allergen detection
- **Trigger**: Automatic on cart changes; manual trigger via "Check Allergens" button
- **Progression**: User builds cart → System scans all items for allergens → Highlights items with detected allergens (nuts, dairy, gluten, etc.) → Displays nutritional summaries → Suggests allergen-free alternatives → User makes informed decisions
- **Success criteria**: Zero false negatives on common allergens; clear visual hierarchy for risk levels; alternative suggestions for 100% of flagged items

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

### Meal Planning & Menu Management
- **Functionality**: Weekly meal planning interface with horizontal day layout showing meal cards, meal catalog browsing for complete dishes from Apetito menu, comprehensive AI-powered capabilities including auto-generation, custom natural language requests, and deep nutritional analysis, smart recommendations based on institutional requirements, dietary restrictions, budget constraints, and person count, and automatic shopping list generation with cost estimation
- **Purpose**: Enable institutional buyers to plan weekly menus in advance by selecting complete meals from Apetito's catalog, leverage advanced AI to optimize nutritional balance and variety based on specific institutional needs, receive intelligent meal suggestions tailored to custom requirements through natural language, visualize nutritional totals across days, and track estimated costs per person
- **Trigger**: User navigates to "Plan" tab; clicks "Create New Meal Plan" or selects existing plan; browses meals in "Meals" tab; accesses "AI Assistant" tab with three modes (Generate, Custom, Analyze); configures institutional parameters (people count, dietary restrictions, budget); types natural language requests for plan modifications; clicks "Auto-Fill Week" for AI-generated complete weekly plans; requests analysis of current plan balance
- **Progression**: User creates weekly plan → Accesses AI Assistant with tabbed interface → **Generate Mode**: Enters institutional parameters (number of people, dietary restrictions like "vegetarian, gluten-free", budget per meal) → Clicks "Auto-Fill Entire Week" → AI generates complete balanced plan with reasoning for each day's meal selection → **Custom Mode**: Types natural language requests ("Make Monday lighter", "Add more protein", "Swap meals with nuts", "Make Friday special") → AI interprets request and modifies specific days or entire week accordingly → Provides summary of changes made → **Analyze Mode**: Clicks "Analyze Current Plan" → AI evaluates nutritional balance showing daily averages (calories, protein, carbs, fat), meal variety score, and cost per day → Generates actionable insights with severity levels (warnings for nutritional gaps, success for balanced plans, info for optimization opportunities) → Each insight includes specific action buttons (e.g., "Add High-Calorie Meals", "Suggest Lighter Meals", "Add Protein", "Add Variety", "Optimize Costs") → User reviews AI-generated plan in Calendar view with color-coded days → Each meal shows AI reasoning for selection → Shopping list view shows consolidated meal summary with total servings and cost estimates
- **Success criteria**: Meal plans persist across sessions; AI auto-fill generates balanced plans within 5 seconds; Custom requests successfully interpret 90%+ of natural language inputs; Analysis completes within 2 seconds; Generated plans meet 2000-2200 kcal/day target with 60-80g protein; AI respects dietary restrictions 100% of the time; Budget constraints honored when specified; Institutional parameters (people count) properly scale serving suggestions; Natural language changes apply to correct days; AI reasoning displayed for transparency; Cost estimation accurate per serving; Multi-tab interface clearly separates generation, customization, and analysis workflows

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

The design should evoke trust and efficiency—a professional, clean interface that feels authoritative yet approachable, balancing data density with conversational warmth. This is an enterprise tool that respects institutional buyers' expertise while reducing their cognitive burden. Minimal interface with purposeful information hierarchy serves the mission-critical nature of compliance and ordering accuracy.

## Color Selection

Complementary (opposite colors) - A professional blue representing trust and efficiency paired with warm accent tones to humanize the AI interactions and highlight compliance states (warnings, confirmations).

- **Primary Color**: Deep Professional Blue `oklch(0.45 0.12 250)` - Communicates reliability, institutional trust, and technological capability without feeling cold
- **Secondary Colors**: 
  - Neutral Gray `oklch(0.95 0.005 250)` for backgrounds - reduces eye strain during long procurement sessions
  - Soft Blue-Gray `oklch(0.85 0.02 250)` for secondary elements - maintains visual cohesion
- **Accent Color**: Warm Amber `oklch(0.72 0.14 70)` - Highlights CTAs, AI responses, and positive confirmations with approachable warmth
- **Destructive/Warning**: Alert Red `oklch(0.60 0.22 25)` - Allergen warnings and critical compliance alerts
- **Success**: Fresh Green `oklch(0.65 0.18 145)` - Compliance confirmations and successful validations

**Foreground/Background Pairings**:
- Background (Neutral `oklch(0.98 0.005 250)`): Foreground Dark `oklch(0.25 0.02 250)` - Ratio 12.8:1 ✓
- Card (White `oklch(1 0 0)`): Card Foreground `oklch(0.25 0.02 250)` - Ratio 13.5:1 ✓
- Primary (Deep Blue `oklch(0.45 0.12 250)`): White text `oklch(1 0 0)` - Ratio 7.2:1 ✓
- Secondary (Soft Blue-Gray `oklch(0.85 0.02 250)`): Dark text `oklch(0.25 0.02 250)` - Ratio 9.8:1 ✓
- Accent (Warm Amber `oklch(0.72 0.14 70)`): Dark text `oklch(0.20 0.02 250)` - Ratio 8.5:1 ✓
- Destructive (Alert Red `oklch(0.60 0.22 25)`): White text `oklch(1 0 0)` - Ratio 5.1:1 ✓
- Muted (Light Gray `oklch(0.92 0.005 250)`): Muted Foreground `oklch(0.50 0.02 250)` - Ratio 6.2:1 ✓

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
- **Chat Message Component**: Custom layout with Avatar + animation states for AI vs user messages, with embedded product cards and action buttons
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
- **AI Features**: `Sparkle` for AI indicators and coordinator, `TrendUp` for predictive, `ArrowsClockwise` for reorder, `Fire` for trending
- **Specialized Agents**: `CurrencyDollar` for Budget Agent, `ForkKnife` for Nutrition Agent, `ShieldCheck` for Dietary Agent, `ChefHat` for Meal Planning Agent
- **Seasonal**: `Snowflake` for winter/Christmas, `Sun` for summer, `Leaf` for spring, `CloudRain` for autumn
- **Insights**: `ChartLine` for analytics, `ShoppingCart` for orders, `Clock` for time-based data
- **Chat/AI**: `ChatsCircle`, `Sparkle` for AI indicators, `PaperPlaneTilt` for send
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
