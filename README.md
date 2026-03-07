# Micro Loan Eligibility App

A complete web application for micro loan eligibility assessment built with Python FastAPI and React, deployable on Vercel.

## Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18 + Vite |
| **Backend** | Python FastAPI |
| **Database** | MongoDB Atlas |
| **Charts** | Recharts |
| **Deployment** | Vercel |

## Project Structure

```
micro-loan-eligibility/
├── api/                    # Python FastAPI Backend
│   ├── main.py            # All API endpoints
│   ├── scoring.py         # Scoring logic
│   ├── models.py          # Pydantic models
│   ├── requirements.txt   # Python dependencies
│   └── vercel.json        # Vercel config
├── web/                   # React Frontend
│   ├── src/
│   │   ├── App.jsx       # Main app with all pages
│   │   ├── services/api.js
│   │   └── index.css
│   ├── package.json
│   └── vercel.json
├── vercel.json            # Root Vercel config
└── README.md
```

## Features

### 10 Screens
1. **Registration** - Name, phone, Indian citizen checkbox, ID proof
2. **Financial Input** - Earnings, expenses, EMI, digital payment slider, job history
3. **Eligibility Result** - Score meter (0-100), pie chart, helped/hurt factors
4. **Loan Products** - MUDRA, KreditBee, MoneyTap with eligibility
5. **What-if Simulator** - Instant score recalculation with sliders
6. **Score History** - Timeline of past scores
7. **Loan Coach** - Tips to improve eligibility (30-90 days)
8. **Document Checklist** - Required documents
9. **Language Toggle** - English, Hindi, Tamil
10. **Chatbot** - Loan Q&A assistant

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/health` | GET | Health check |
| `/user/register` | POST | Register user |
| `/user/financial-data` | POST | Save financial data & calculate score |
| `/user/score-history` | GET | Get score history |
| `/calculate-score` | POST | Direct scoring |
| `/loan-matcher` | POST | Match loan products |
| `/chatbot` | POST | Chatbot response |

---

## Deployment to Vercel

### Prerequisites
1. Vercel account (vercel.com)
2. MongoDB Atlas account (mongodb.com/cloud/atlas)

### Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster (Free tier)
4. Create a database user
5. Get the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/microloan
   ```

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

**Option B: Using GitHub**

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Import your repository
4. Add environment variable:
   - Key: `MONGODB_URI`
   - Value: Your MongoDB Atlas connection string
5. Deploy

### Step 3: Configure Frontend API URL

After deployment, update the frontend to point to your API:

```javascript
// In web/src/services/api.js
const API_BASE = 'https://your-project.vercel.app/api';
```

Or set environment variable:
```
VITE_API_URL=https://your-project.vercel.app/api
```

---

## Running Locally

### Backend Only

```bash
cd api
pip install -r requirements.txt
python main.py
```
Runs on: http://localhost:8000

### Frontend Only

```bash
cd web
npm install
npm run dev
```
Runs on: http://localhost:5173

### Both (Development)

1. Start backend: `cd api && python main.py`
2. Start frontend: `cd web && npm run dev`
3. Update `web/src/services/api.js` to use `http://localhost:8000`

---

## Scoring Algorithm

| Factor | Weight |
|--------|--------|
| Income Stability | 40% |
| Expense Ratio | 25% |
| Existing EMI | 20% |
| Digital Payment | 15% |

### Fraud Detection
- Unusually high savings rate with high income
- Extremely low expenses with moderate income
- Sudden income spikes

---

## Loan Products

| Product | Min Score | Max Loan | Interest Rate |
|---------|-----------|----------|---------------|
| MUDRA Loan | 50 | ₹10L | 10-15% |
| KreditBee | 55 | ₹5L | 18-36% |
| MoneyTap | 60 | ₹5L | 13-24% |

---

## License

MIT License
