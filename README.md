# Gig Loan Eligibility Explainer for Gig Workers

A full-stack web application that helps gig workers understand their loan eligibility using alternative financial data. Built with React, FastAPI, PostgreSQL, and Google Gemini AI.

## Features

- **User Input Form**: Collects gig worker financial data
- **Eligibility Score Engine**: Calculates transparent 100-point score
- **Factor Analysis**: Shows what helped and hurt the score
- **Improvement Suggestions**: Actionable recommendations to improve eligibility
- **Fraud Risk Flag**: Detects inconsistent financial data
- **Gemini AI Explanation**: Simple language explanations (EN/HI/TA)
- **What-If Simulator**: Instant score recalculation with different values
- **Loan Product Matcher**: Matches users with eligible micro-loan products
- **Score History Tracker**: Visual timeline of score changes

## Tech Stack

- **Frontend**: React + Tailwind CSS + Chart.js
- **Backend**: Python FastAPI
- **Database**: PostgreSQL
- **AI**: Google Gemini API

## Project Structure

```
gig-loan-eligibility/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app
│   │   ├── database.py       # Database config
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── routers/          # API endpoints
│   │   └── services/         # Business logic
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/        # API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env
├── render.yaml              # Render deployment config
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL database

### Backend Setup

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Linux/Mac
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables in `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/gig_loan
   GOOGLE_GEMINI_API_KEY=your-api-key
   CORS_ORIGIN=http://localhost:5173
   ```

5. Run the backend:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/calculate-score` | POST | Calculate eligibility score |
| `/api/score-history/{user_id}` | GET | Get user's score history |
| `/api/fraud-check` | POST | Detect financial inconsistencies |
| `/api/ai-explanation` | POST | Get AI explanation |
| `/api/loan-match` | POST | Match loan products |
| `/api/whatif-simulate` | POST | What-if simulation |

## Deployment on Render

1. Create a PostgreSQL database on Render
2. Push code to GitHub
3. Connect GitHub repo to Render
4. Set environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `GOOGLE_GEMINI_API_KEY`: Your Gemini API key
5. Deploy using `render.yaml`

## Score Calculation

| Factor | Weight | Max Points |
|--------|--------|------------|
| Income Stability | 30% | 30 |
| Expense Ratio | 25% | 25 |
| EMI Burden | 20% | 20 |
| Digital Payment | 15% | 15 |
| Savings | 10% | 10 |

## License

MIT License
