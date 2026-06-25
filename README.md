# ResumeAI Pro 🚀

> An AI-powered resume analyzer that gives you an **ATS score**, **strengths**, **missing skills**, **improvement suggestions**, **technology recommendations**, **project ideas**, and **job role matches** — all in seconds.

Built with **Spring Boot 3 · React + Vite · MySQL · Groq AI (Llama 3.3 70B)**

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🔐 JWT Auth | Secure register / login with BCrypt password hashing |
| 📄 PDF Upload | Drag-and-drop PDF upload with Apache PDFBox text extraction |
| 🤖 Groq AI | Deep resume analysis via Llama 3.3 70B (free & fast) |
| 📊 ATS Scoring | 0–100 score with visual ring + breakdown bars |
| 💡 Insights | Strengths, missing skills, suggestions, technologies, projects, job roles |
| 🕒 History | Full paginated history with search, sort, and delete |
| ⬇️ Export | Download plain-text analysis report |
| 📱 Responsive | Mobile-friendly dark UI |

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+
- Groq API key (free at https://console.groq.com/keys)

### 1 — Clone and setup

```bash
git clone https://github.com/YOUR_USERNAME/resumeai-pro.git
cd resumeai-pro
```

### 2 — Backend setup

```bash
cd backend

# Copy example files and fill in your values
cp src/main/resources/application.properties.example src/main/resources/application.properties
cp .env.example .env
```

Edit `application.properties` with your real values:
- `spring.datasource.password` → your MySQL password
- `app.groq.api-key` → your Groq API key (from https://console.groq.com/keys)

### 3 — Create MySQL database

```sql
CREATE DATABASE resume_analyzer;
```

### 4 — Run backend

```bash
./mvnw spring-boot:run
```

Backend starts at **http://localhost:8080/api**

### 5 — Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend starts at **http://localhost:5173**

---

## 🔑 Environment Variables

### Backend (`application.properties`)

| Variable | Description |
|----------|-------------|
| `spring.datasource.username` | MySQL username |
| `spring.datasource.password` | MySQL password |
| `app.jwt.secret` | 256-bit hex JWT secret |
| `app.groq.api-key` | Groq API key (get free at console.groq.com) |

### Getting a Groq API Key (Free)
1. Go to https://console.groq.com/keys
2. Sign up with Google
3. Click "Create API Key"
4. Copy the key starting with `gsk_...`

---

## 🗂️ Project Structure

```
resumeai-pro/
├── backend/                    # Spring Boot 3 API
│   └── src/main/java/com/resumeanalyzer/
│       ├── ai/                 # Groq AI integration
│       ├── config/             # Security, WebClient
│       ├── controller/         # REST endpoints
│       ├── dto/                # Request/Response DTOs
│       ├── entity/             # JPA entities
│       ├── exception/          # Global exception handler
│       ├── repository/         # Spring Data JPA
│       ├── security/           # JWT filter + utils
│       ├── service/            # Business logic
│       └── util/               # PDF extractor
├── frontend/                   # React + Vite
│   └── src/
│       ├── contexts/           # AuthContext
│       ├── layouts/            # Dashboard layout
│       ├── pages/              # All pages
│       ├── routes/             # Protected routes
│       ├── services/           # API calls
│       └── styles/             # Global CSS
├── schema.sql                  # Manual DB setup
├── .gitignore                  # Protects secrets
└── README.md
```

---

## 🔌 REST API

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new account |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET  | `/api/auth/me` | ✅ | Get current user |

### Resume
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resume/analyze` | Upload PDF + run analysis |
| GET  | `/api/resume/history` | Get all analyses |
| GET  | `/api/resume/{id}` | Get analysis by ID |
| DELETE | `/api/resume/{id}` | Delete analysis |

---

## 🛠️ Tech Stack

**Backend:** Java 17 · Spring Boot 3.2 · Spring Security · Spring Data JPA · MySQL 8 · Apache PDFBox 3 · JJWT 0.12 · WebFlux

**Frontend:** React 18 · Vite 5 · React Router 6 · Bootstrap 5 · Axios

**AI:** Groq API · Llama 3.3 70B Versatile (free tier)

---

## 📜 License

MIT — free to use and modify.
