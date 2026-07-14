# 💡 Smart Ledger ($martLedger)

A lightweight, full-stack financial ledger application built with **React 19 (Vite)**, **NestJS**, and **PostgreSQL**. It features a modern **purple-to-magenta gradient** design theme styled entirely in the **Poppins** typography family, slate-violet text details, and soft lavender background highlights.

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js** (v20 or higher recommended)
- **PostgreSQL** running locally

### 🛠️ Configuration
1. Go to the `backend` folder:
   ```bash
   cd backend
   ```
2. Copy the template `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your PostgreSQL database configurations.
   *(Note: The database connection automatically initializes the `smart_ledger` database and its tables on boot!)*
4. The `.env` file is pre-configured with active **Twilio credentials** and defaults to the configured testing phone number (`+919384257033`) for automated dispatches out-of-the-box.

---

### 💻 Running the Application

Open two terminals:

#### Terminal 1: Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```

#### Terminal 2: Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## ✨ Features & Architecture

### 🗺️ 1. Purple-to-Magenta Theme & Layout
- **Poppins Typography:** All headings, dashboard text metrics, tables, and settings use the **Poppins** font family.
- **Full-Width Topbar Banner:** Renders a sticky top header spanning 100% of the screen width, styled with a horizontal gradient going from royal purple (`#820AD1`) to hot pink/magenta (`#FF006E`). It displays the bold white brand title **SmartLedger** on the left, and control actions (Sync, Twilio SMS test bell, and **+ Add Transaction**) on the right.
- **Glassmorphic Topbar Actions:** All buttons inside the top banner are styled as white translucent glass capsules (`rgba(255,255,255,0.15)` background and thin borders) to blend with the purple-to-pink gradient.
- **Left Sidebar Navigation:** Sits below the header banner with a white background. Inactive items display in purple, and the active menu tab has a rounded purple-to-magenta gradient background with white text.
- **Tab Background:** The content area is styled with a soft lavender-pink tint background (`#FAF6FD`).
- **Tab Favicon:** Custom SVG favicon displaying a bold white dollar sign (`$`) centered on a circle containing the purple-magenta gradient.

### 📊 2. Stats Grid Row
- Displays four stats cards with clear colored accent tags (blue for Net Balance, green for Total Income, pink for Total Expenses, cyan for Savings Rate).
- Lists comparison trend details under each large amount value (e.g. `▲ 12.5% vs last month`).

### 📈 3. Spline Curve & Doughnut Charts
- **Balance History Spline:** Monotone Bezier curve in blue with circle point coordinates outlined in white. Features a soft blue gradient fill underneath and a customized dark card tooltip showing date/amounts on hover.
- **Expense by Category Doughnut:** Renders a clean segmented ring with an interactive vertical legend list displaying color dots and category percentages.

### 🗂️ 4. Full-Width Ledger & Pop-up Transaction Form
- **Full-Width Table:** The Transactions Ledger tab displays a spacious, full-width table layout for reading records easily.
- **Pop-up Dialog Modal:** Clicking the **"+ Add Transaction"** button next to the select dropdown opens a centered overlay dialog containing the manual transaction input form.
- **Status Column:** The table features a dedicated **Status** column showing:
  - `🟢 Clear` for standard verified entries.
  - `⚠️ Review` for entries requiring double-check review.

### 💡 5. Smart Budget Assistant (User-Centric Tips)
We added a static analysis auditor checking for transaction discrepancies using simple, everyday language:
- **Status Tag:** Flagged items show a clear status badge `⚠️ Review` inside the **Transaction History** table ledger.
- **User-Centric Classifications:**
  - *Double Entry:* Labeled as **"Possible Double Charge"** ("We found two identical entries on this date. Did you log this twice by mistake?").
  - *Large Purchase:* Labeled as **"Large Expense"** ("This expense is much higher than what you normally spend on this category.").
  - *Description Flag:* Labeled as **"Check Description"** ("The text in this entry looks unusual compared to your normal description tags.").
  - *Frequency Check:* Labeled as **"Busy Spending Day"** ("An unusually high number of transaction entries were logged on this date.").

### 📅 6. Nivo Daily Savings & Cash Flow Heatmap
We added a custom data visualizer utilizing the `@nivo/calendar` library:
- **120-Day Contributions Matrix:** Renders daily squares for the last 120 days (4 months) showing months separators.
- **Savings vs Deficit Colors:** Neutral days show a light beige grid square; positive savings days glow green (intensity mapped to surplus value); spending deficit days glow red (intensity mapped to spending value).
- **Interactive Tooltips:** Hovering over cells displays a custom tooltip showing the calendar date and the exact net cash flow surplus or deficit amount.
- **Themed Labels & Margins:** Set text size to `8px` and configured padding/margins to prevent overlapping month indicators.

### 📲 7. Automated Twilio SMS Event Triggers
- **Transaction Add SMS:** Whenever a transaction is created, the system automatically compiles and sends a live Twilio SMS notification to the configured number (`TWILIO_TEST_RECIPIENT_NUMBER`).
- **Transaction Delete SMS:** Whenever a transaction is deleted, the system queries the details, removes the record, and automatically dispatches a Twilio SMS notification describing the deleted transaction.

---

## 🤖 AI Acceleration & Human Engineering Judgment

### 🛠️ How AI Accelerated Development
During the building process, **Gemini 3.5 Flash** and **GitHub Copilot** were used to speed up coding:
1. **Boilerplate Setup:** Generated NestJS module structures, dependency injection imports, and standard SQL entity mapping decorators.
2. **Regression Logic:** Provided quick formula templates for the Least Squares Linear Regression projection logic.
3. **SVG & Layout Calculations:** Generated visual coordinates for complex curved charts, which were later mapped to Recharts.

---

### 🧠 Where the AI Fell Short & How Human Judgment Fixed It

AI is great for speed, but standard generated boilerplates frequently break under real-world environment setups, typings, and packaging. Here is how human engineering judgment resolved these issues:

#### 1. React 19 Peer-Dependency Resolution (Installer Failure)
- **The AI Oversight:** The AI recommended installing standard graphing libraries (like `Recharts` and `@nivo/calendar`) without accounting for React 19's updated type definition signatures. Standard `npm install` crashed due to peer-dependency version conflicts.
- **Human Resolution:** Installed packages using `--legacy-peer-deps` to bypass npm version blocks. Additionally, when Vite's bundler (Rolldown) crashed because it couldn't resolve nested imports in Recharts (`react-is`), we manually installed `react-is` to guarantee clean production compilation.

#### 2. Windows SQLite Compilation Bottlenecks (Database Architecture)
- **The AI Oversight:** To avoid setting up PostgreSQL local databases, the AI recommended using native SQL containers like `better-sqlite3`.
- **The Issue:** Windows SQLite compilation native C++ SQLite drivers require local compiler toolchains, which frequently fail during installation.
- **Human Resolution:** Integrated node-postgres (`pg`) with an automated connection bootstrap layer that auto-creates the database if not found.

#### 3. TypeScript Implicit Typings (Compiler Crash)
- **The AI Oversight:** Inside the linear regression forecasting loop, the AI initialized prediction arrays using `const forecast = [];`. Under strict compiler settings, TypeScript inferred this as `never[]`, throwing type errors when pushing forecast models.
- **Human Resolution:** Declared strict interfaces (`ForecastPoint[]`) to satisfy strict typing rules and allow compilation.

#### 4. Avoiding Complex Broker Overengineering (Neat Ledger Architecture)
- **The AI Oversight:** AI models suggested deploying heavy message queues (like RabbitMQ or BullMQ) to queue and dispatch Twilio SMS alerts.
- **Human Resolution:** Routed alerts as background promises directly in NestJS transactional lifecycles, avoiding excessive infrastructure overhead.
