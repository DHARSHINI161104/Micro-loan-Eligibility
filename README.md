# Micro Loan Eligibility App

A complete mobile application for micro loan eligibility assessment with Flutter, Node.js backend, and Python FastAPI scoring engine.

## Project Structure

```
Micro Loan Eligibility/
├── scoring_engine/       # Python FastAPI scoring engine
│   ├── main.py           # FastAPI application
│   └── requirements.txt  # Python dependencies
├── backend/              # Node.js Express backend
│   ├── server.js         # Express server with all APIs
│   └── package.json      # Node.js dependencies
├── flutter_app/          # Flutter mobile app
│   ├── lib/
│   │   └── main.dart     # Complete Flutter application
│   ├── pubspec.yaml
│   └── assets/
│       └── images/
└── README.md
```

## Features Implemented

### Flutter App Screens
1. **User Registration** - Name, Indian citizen checkbox, ID proof upload (Aadhaar/PAN)
2. **Financial Input** - Earnings history, expenses, EMI, digital payment slider, job history, bank details
3. **Eligibility Result** - Score meter (0-100), breakdown chart, helped/hurt factors
4. **Loan Product Matcher** - MUDRA, KreditBee, MoneyTap with eligibility reasons and links
5. **What-if Simulator** - Instant score recalculation with slider adjustments
6. **Score History Timeline** - Previous eligibility scores across sessions
7. **Loan Coach** - Tips to improve eligibility within 90 days
8. **Document Checklist** - Required documents (Aadhaar, Bank statement, etc.)
9. **Vernacular Mode** - Toggle between English, Hindi, Tamil
10. **Chatbot** - Simple chatbot answering loan questions

### Backend APIs
- `POST /user/register` - User registration
- `POST /user/financial-data` - Save financial data and calculate score
- `GET /user/score-history` - Get score history
- `POST /loan-matcher` - Match user with loan products
- `POST /chatbot` - Chatbot for loan questions
- `GET /health` - Health check

### Scoring Engine
- Income Stability (40%)
- Expense Ratio (25%)
- Existing EMI (20%)
- Digital Payment Behaviour (15%)
- Fraud detection with warnings

## Installation & Running

### Prerequisites
- Node.js 18+
- Python 3.9+
- Flutter SDK 3.0+
- MongoDB (local or Atlas)

### 1. Start Python Scoring Engine

```bash
cd scoring_engine
pip install -r requirements.txt
python main.py
```
Runs on: http://localhost:8000

### 2. Start Node.js Backend

```bash
cd backend
npm install
npm start
```
Runs on: http://localhost:3000

Make sure MongoDB is running. Set MONGODB_URI in environment if needed.

### 3. Run Flutter App

```bash
cd flutter_app
flutter pub get
flutter run
```

For Android Emulator, the API connects to 10.0.2.2 (localhost mapping).

## Scoring Weights

| Factor | Weight |
|--------|--------|
| Income Stability | 40% |
| Expense Ratio | 25% |
| Existing EMI | 20% |
| Digital Payment | 15% |

## Loan Products

- **MUDRA Loan** - Min score 50, up to ₹10L
- **KreditBee** - Min score 55, up to ₹5L
- **MoneyTap** - Min score 60, up to ₹5L

## API Endpoints

### Scoring Engine
```
POST /calculate-score
{
  "earnings_history": [30000, 32000, 31000],
  "monthly_expenses": 15000,
  "emi": 5000,
  "digital_payment_ratio": 70,
  "job_history": 2
}
```

### Backend
```
POST /user/register
POST /user/financial-data
GET /user/score-history?userId=xxx
POST /loan-matcher
POST /chatbot
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/microloan
SCORING_API_URL=http://localhost:8000
PORT=3000
```

## Tech Stack

- **Frontend**: Flutter, fl_chart, shared_preferences
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Scoring**: Python, FastAPI, Pydantic

## License

MIT License
