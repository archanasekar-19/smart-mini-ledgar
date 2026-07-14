# 💡 Smart Ledger ($martLedger)

A lightweight, full-stack financial ledger application built with **React 19 (Vite)**, **NestJS**, and **PostgreSQL**. It features a warm beige-sand background with architectural vertical stripes, slate-navy typography, and bronze-gold accents.

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
4. The `.env` file is pre-configured with active **Twilio credentials** and defaults to the test recipient number (`+919384257033`) for automated SMS notifications out-of-the-box.

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

### 🗺️ 1. Left Sidebar Navigation & SMS Testing Console
- **Navigation Sidebar:** Toggle between **Dashboard** (metrics, charts, heatmap calendar, assistant tips) and **Transactions Ledger** (table, pop-up dialog, filters).
- **Topbar SMS Controller (Notification Bell Modal):** Clicking the notification bell in the topbar opens a centered dialog console pre-configured with active Twilio API credentials.
- **Quick Report Templates:** Features three buttons inside the dialog that dynamically draft SMS reports using the active client state data:
  - **Balance Stats:** Auto-drafts a report detailing Net Balance, Total Income, Total Expenses, and Net Savings Rate.
  - **Top Expense:** Identifies the highest expense category and drafts an alert with its spent value.
  - **7-Day Forecast:** Drafts balance predictions and daily spending velocity calculated by the Least Squares Linear Regression backend service.

### 🗂️ 2. Full-Width Ledger & Pop-up Transaction Form
- **Full-Width Table:** The Transactions Ledger tab displays a spacious, full-width table layout for reading records easily.
- **Pop-up Dialog Modal:** Clicking the **"+ Add Transaction"** button in the ledger header opens a centered overlay dialog containing the manual transaction input form.
- **Status Column:** The table features a dedicated **Status** column showing:
  - `🟢 Clear` for standard verified entries.
  - `⚠️ Review` for entries flagged by the smart assistant.

### 💡 3. Smart Budget Assistant (User-Centric Tips)
We added a static analysis auditor checking for transaction discrepancies using simple, everyday language:
- **Status Tag:** Flagged items show a clear status badge `⚠️ Review` inside the **Transaction History** table ledger.
- **User-Centric Classifications:**
  - *Double Entry:* Labeled as **"Possible Double Charge"** ("We found two identical entries on this date. Did you log this twice by mistake?").
  - *Large Purchase:* Labeled as **"Large Expense"** ("This expense is much higher than what you normally spend on this category.").
  - *Description Flag:* Labeled as **"Check Description"** ("The text in this entry looks unusual compared to your normal description tags.").
  - *Frequency Check:* Labeled as **"Busy Spending Day"** ("An unusually high number of transaction entries were logged on this date.").

### 📅 4. Nivo Daily Savings & Cash Flow Heatmap
We added a custom data visualizer utilizing the `@nivo/calendar` library:
- **120-Day Contributions Matrix:** Renders daily squares for the last 120 days (4 months) showing months separators.
- **Savings vs Deficit Colors:** Neutral days show a light beige grid square; positive savings days glow green (intensity mapped to surplus value); spending deficit days glow red (intensity mapped to spending value).
- **Interactive Tooltips:** Hovering over cells displays a custom tooltip showing the calendar date and the exact net cash flow surplus or deficit amount.
- **Themed Labels & Margins:** Set text size to `8px` and configured padding/margins to prevent overlapping month indicators.

### 📈 5. Recharts Area & Bar Analytics (Gradients & Curves)
- **Area Chart (Balance History & Forecast):** Renders smooth Bezier curve lines using monotone interpolation. History (Solid Cobalt line, soft blue fill) and Forecast (Dotted Gold line, soft gold fill) connect.
- **Income vs Expense Column Chart:** Renders vertical bar columns with rounded top corners, allowing users to hover and inspect values.
- **Category Expense Column Chart:** Renders a vertical column for each expense category with rounded top corners.

### 📲 6. Automated Twilio SMS Event Triggers
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
- **The Issue:** Native SQLite drivers compile C++ binaries under the hood on installation, which crashes on Windows machines lacking Visual Studio C++ Compiler tools and Python.
- **Human Resolution:** Bypassed native drivers entirely, integrating pure Node node-postgres (`pg`). We built an automated database connection service in NestJS that checks if the database exists on boot, auto-creates it, and applies schema migrations. This delivers a zero-barrier startup experience.

#### 3. TypeScript Implicit Typings (Compiler Crash)
- **The AI Oversight:** Inside the linear regression forecasting loop, the AI initialized prediction arrays using `const forecast = [];`. Under strict compiler settings, TypeScript inferred this as `never[]`, throwing type errors when pushing forecast models.
- **Human Resolution:** Declared strict interfaces (`ForecastPoint[]`) to satisfy strict typing rules and allow compilation.

#### 4. Avoiding Complex Broker Overengineering (Neat Ledger Architecture)
- **The AI Oversight:** AI models suggested deploying heavy message queues (like RabbitMQ or BullMQ) to queue and dispatch Twilio SMS alerts.
- **Human Resolution:** Kept the ledger simple, neat, and highly performant (avoiding microservice overhead) by routing dispatches as background promises directly inside the NestJS transactional lifecycle. Dispatches fail silently in the background if Twilio's REST API is unreachable, preventing transaction saves from locking up.
