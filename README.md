# SolarWise ☀️⚡

> **Intelligent Solar Generation Forecasting, Load Optimization & PV Health Sentinel Platform**

**Smart India Hackathon (SIH 2026)**  
**Problem Statement ID:** SIH26200  
**Category:** Software — Renewable / Sustainable Energy  

---

## 📌 Project Overview

**SolarWise** is a renewable-energy intelligence prototype designed to maximize on-site solar self-consumption, minimize grid dependency, and detect solar array underperformance. 

Commercial and industrial rooftop solar installations frequently suffer from two fundamental inefficiencies:
1. **Load Mismatch:** Solar power peaks around midday, while high-energy commercial and residential loads often run during morning or evening peak tariff windows, leading to unrewarded grid curtailment or low feed-in returns.
2. **Delayed Fault Detection:** Physical faults (string fuse trips, shading, severe soiling) often go unnoticed for weeks because operators cannot easily distinguish weather-induced dips (cloud cover, rain) from genuine persistent hardware anomalies.

SolarWise bridges this gap with three core operational pillars: **Predict**, **Optimize**, and **Detect**, complemented by a comprehensive **Analytics** suite.

---

## 🎯 Problem Statement (SIH26200)

Renewable energy systems need intelligent software tooling to:
- Accurately anticipate solar power availability and facility electricity demand.
- Guide operators to schedule flexible electrical loads when surplus clean energy is abundant.
- Reliably detect persistent operational degradation without raising false alarms during normal overcast or stormy weather conditions.

---

## 💡 Our Solution

SolarWise delivers a unified, interactive software dashboard built around three specialized capabilities:

```
                  ┌─────────────────────────────────────────┐
                  │             SOLARWISE ENGINE            │
                  └────────────────────┬────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
   🔮 PREDICT                    ⚡ OPTIMIZE                     🩺 DETECT
  Solar & Demand               Opportunity Window            PV Health Sentinel
  Generation Forecast          Flexible Load Dispatch        Persistence Anomaly
  (Today / Tomorrow)           (LOW / MED / HIGH Tiers)      (Multi-Day Screening)
         │                             │                             │
         └─────────────────────────────┼─────────────────────────────┘
                                       ▼
                              📊 UNIFIED ANALYTICS
                         Self-Consumption & Grid Balance
```

1. **Predict (Solar & Demand Forecasting):** Generates 24-hour day-ahead generation and consumption profiles, predicting peak output windows, daily kWh yields, and net surplus/deficit balances.
2. **Optimize (Opportunity Window Engine):** Automatically scans forecasted solar surplus curves to classify availability (**LOW**, **MEDIUM**, **HIGH**) and recommends optimal time windows for high-power flexible loads (EV charging, water pumps, washing machines, HVAC pre-cooling, battery storage).
3. **Detect (PV Health Sentinel):** Evaluates multi-period generation persistence against theoretical clear-sky physics models to isolate true hardware defects (e.g. open circuits, soiling) from transient overcast weather events.
4. **Analytics & Performance Intelligence:** Provides interactive audit ledgers and multi-horizon charts (Today, 7 Days, 30 Days) for self-consumption rates, grid import/export flows, and estimated $\text{CO}_2$ abatement.

---

## 🚀 Core Modules

### 1. 🔮 Predict — Solar & Demand Forecast
- **24-Hour Horizon Trajectory:** Hourly predicted solar generation (kW) alongside building electricity demand curves.
- **Confidence Scoring:** Natural-language confidence assessments (e.g. High / 97.4%) with upper and lower confidence error bounds.
- **Peak Identification:** Clear calculation of peak generation and peak demand hours with estimated daily kWh totals.
- **Dynamic Summaries:** Contextual operational recommendations for upcoming shifts.

### 2. ⚡ Optimize — Opportunity Windows & Load Scheduling
- **Solar Availability Categorization:** Classifies every hour of tomorrow into **LOW** (<90 kW), **MEDIUM** (90–250 kW), or **HIGH** (>250 kW) solar availability.
- **Automated Opportunity Windows:** Automatically identifies surplus time brackets (e.g., Morning Solar Ramp, Prime Solar Peak, Afternoon Yield Buffer) with opportunity ratings (up to 98/100).
- **Flexible Load Catalog:** Built-in profiles for heavy flexible loads:
  - Washing Machines (3.5 kW)
  - Water Pumps (7.5 kW)
  - EV Charging Hubs (60 kW)
  - Water Heaters (18 kW)
  - Battery Energy Storage (45 kW)
  - HVAC Pre-cooling (55 kW)
- **Before vs. Recommended Schedule:** Side-by-side comparison showing solar utilization improvement (e.g., shifting loads from 12% to 98% clean solar match).
- **Custom Load Dispatcher:** Interactive modal allowing operators to register custom flexible loads and calculate instant window matches.

### 3. 🩺 Detect — PV Health Sentinel
- **Multi-Period Persistence Engine:** Evaluates multi-day generation streaks rather than triggering false-positive alerts on a single cloudy day.
  - *Normal:* Array operating within expected parameters.
  - *Transient Weather Dip:* *"Temporary generation reduction — continue monitoring."*
  - *Persistent Anomaly:* *"Persistent PV underperformance detected."*
- **Interactive Expected vs. Actual Charts:** Inspect hourly and daily telemetry against theoretical clear-sky physical output.
- **Root-Cause Telemetry Matrix:** Evaluates environmental indicators (solar irradiance, temperature, cloud attenuation) to propose plausible contributors (*"Possible contributor"* / *"Requires investigation"*) without making unsubstantiated hardware claims.
- **Interactive Demo Scenario Switcher:** Switch between **Normal Performance**, **Weather-Related Reduction**, and **Persistent Underperformance** to observe dynamic state updates.
- **Array Diagnostic Matrix:** Visual status of 16 DC strings across 3 inverter clusters.

### 4. 📊 Analytics — Energy Balance & Performance
- **Key Performance Indicators:**
  - Total Solar Generation (kWh)
  - Solar Self-Consumption (kWh & %)
  - Utility Grid Import vs. Grid Export
  - Solar Utilization Percentage
  - PV Performance Ratio (PR)
  - Forecast Accuracy Percentage
  - Estimated $\text{CO}_2$ Avoided (Tons $\text{CO}_2\text{e}$)
- **Interactive Time-Series Charts:**
  1. Solar Generation vs. Electricity Demand
  2. Solar Self-Consumption vs. Grid Usage
  3. Expected vs. Actual PV Generation
  4. 7-Day Solar Performance Trend
- **Multi-Horizon Range Selector:** Toggle between **Today (24h)**, **Last 7 Days**, and **Last 30 Days**.
- **Consolidated Ledger:** Tabular energy accounting ledger with CSV export simulation.

---

## 🛠️ Technology Stack

This project is built using a modern frontend architecture without external backend dependencies:

| Technology | Purpose |
|---|---|
| **React 19** | Core UI library for declarative component architecture |
| **TypeScript** | Type-safe domain models, energy calculations, and component props |
| **Vite 8** | High-performance build tool and local development server |
| **Tailwind CSS v4** | Modern utility-first styling with responsive design |
| **Lucide React** | Consistent iconography across dashboards and navigation |
| **Motion** | Fluid transitions and UI micro-interactions |

---

## 📂 Project Structure

```
solarwise/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx              # Top app bar with site selector & live metrics
│   │   │   └── Sidebar.tsx             # Primary navigation sidebar
│   │   └── pages/
│   │       ├── DashboardPage.tsx       # Central operational dashboard overview
│   │       ├── ForecastPage.tsx        # Predict module (Solar & Demand forecasts)
│   │       ├── OpportunityWindowsPage.tsx # Optimize module (Load scheduling & windows)
│   │       ├── PVHealthSentinelPage.tsx   # Detect module (Persistence anomaly detection)
│   │       ├── AnalyticsPage.tsx       # Analytics & energy audit ledger
│   │       └── SettingsPage.tsx        # System preferences & plant capacity settings
│   ├── data/
│   │   ├── energyEngine.ts             # Mathematical simulation & physics calculation engine
│   │   └── mockData.ts                 # Base site metadata, flexible load catalogs & defaults
│   ├── types/
│   │   └── index.ts                    # TypeScript interfaces and domain data models
│   ├── App.tsx                         # Root component & active tab state management
│   ├── index.css                       # Global Tailwind CSS entry point
│   └── main.tsx                        # React application DOM mount
├── index.html                          # HTML5 template entry point
├── metadata.json                       # Applet configuration metadata
├── package.json                        # Project dependencies and npm scripts
├── tsconfig.json                       # TypeScript compiler configuration
└── vite.config.ts                      # Vite build & plugin configuration
```

---

## ⚙️ How to Run Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/solarwise.git
   cd solarwise
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Open [http://localhost:3000](http://localhost:3000) (or the URL shown in your terminal) to explore the SolarWise prototype.

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🧪 Simulation Engine & Demo Data

All calculations in SolarWise are driven by an internal mathematical physics simulation (`src/data/energyEngine.ts`):
- **Solar Generation Model:** Uses solar elevation angles, global horizontal irradiance ($GHI$ in $\text{W/m}^2$), and nominal plant capacity ($\text{kWp}$) with temperature and inverter clipping factors.
- **Demand Curve Model:** Models standard commercial facility load profiles with day-shift ramps and baseload consumption.
- **Opportunity Window Matching:** Algorithmically intersects surplus solar generation curves against flexible load power ratings and minimum duration requirements.
- **Persistence Detection Logic:** Multi-period statistical variance screener calculating deviation percentages across consecutive observation days.

---

## ⚠️ Prototype Disclaimer

> **Important Note for Evaluators & Reviewers:**  
> SolarWise is currently an **interactive software prototype and conceptual demonstration** developed for Smart India Hackathon (SIH 2026).  
> - All solar generation, facility demand, string voltage/current, and weather telemetry are **simulated using internal physics-based logic**.
> - This prototype does **not** claim active live connection to real solar inverters, SCADA hardware, physical pyranometers, or proprietary OEM cloud APIs.
> - The application operates entirely in the browser using TypeScript/React state without external databases or live sensor ingestion pipelines.

---

## 🔮 Future Scope & Roadmap

- [ ] **Real-World Inverter Integration:** Ingestion adapter for Modbus TCP/RTU, SunSpec protocols, and OEM APIs (SolarEdge, Enphase, SMA, Huawei).
- [ ] **Machine Learning Forecasting:** Integration of localized ML models (e.g. XGBoost, LSTM) trained on historical pyranometer and NWP weather forecast feeds.
- [ ] **Automated IoT Load Dispatch:** Standardized smart relay and EV charger protocol support (OCPP 1.6/2.0.1, OpenADR, Shelly/Matter smart plugs).
- [ ] **Dynamic Time-of-Use (ToU) Tariffs:** Real-time electricity market price ingestion to maximize financial arbitrage with battery storage.
- [ ] **Multi-Tenant Site Fleet Management:** Centralized multi-facility management with role-based access control (RBAC).

---

## 📸 Screenshots

*(Replace the placeholder links below with actual screenshots of your running application)*

| Dashboard Overview | Solar & Demand Forecast (Predict) |
|---|---|
| ![Dashboard Screenshot](https://placehold.co/600x350/f8fafc/0f172a?text=SolarWise+Dashboard+Overview) | ![Predict Screenshot](https://placehold.co/600x350/f8fafc/0f172a?text=Predict+Forecast+Module) |

| Opportunity Windows (Optimize) | PV Health Sentinel (Detect) |
|---|---|
| ![Optimize Screenshot](https://placehold.co/600x350/f8fafc/0f172a?text=Opportunity+Windows+Optimization) | ![Detect Screenshot](https://placehold.co/600x350/f8fafc/0f172a?text=PV+Health+Sentinel+Detection) |

| Renewable Analytics | String Array Matrix |
|---|---|
| ![Analytics Screenshot](https://placehold.co/600x350/f8fafc/0f172a?text=Renewable+Analytics+Dashboard) | ![String Matrix Screenshot](https://placehold.co/600x350/f8fafc/0f172a?text=Array+Diagnostic+Matrix) |

---

## 👥 Development Team

- **Project:** SolarWise (SIH 2026 Prototype)
- **Track:** Smart India Hackathon — Renewable Energy Intelligence
- **Submission Category:** Software — Problem Statement ID: SIH26200

---

*Built with ❤️ for a cleaner, smarter, and more resilient clean energy grid.*
