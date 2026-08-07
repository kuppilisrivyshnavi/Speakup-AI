# 🎤 SpeakUp AI — AI-Powered Mock Interview Platform

SpeakUp AI is an AI-powered mock interview platform designed to help students and job seekers practice interviews in a realistic environment.

The platform allows users to upload their resume, choose an interview type, participate in a voice-based mock interview using their microphone and camera, receive AI-based evaluation for their answers, and review detailed interview reports and previous interview performance.

---

## 🚀 Key Features

### 🔐 User Authentication

* User registration and login
* JWT-based authentication
* Protected application routes
* Automatic token handling for API requests

### 📄 Resume-Based Interview Preparation

* Upload your resume
* Use resume information to generate personalized interview questions
* Supports interview preparation based on the candidate's background and skills

### 🎯 Multiple Interview Types

Users can choose from:

* **Technical Interview**
* **HR Interview**
* **Mixed Interview**

### 🎥 Real-Time Interview Environment

* Camera access for a realistic interview experience
* Microphone access for answering questions
* Browser-based speech recognition
* Real-time speech-to-text transcription
* Recording/listening status indicators

### 🤖 AI Answer Evaluation

Each submitted answer is evaluated and provides:

* Answer score
* Detailed feedback
* Strengths
* Areas for improvement
* Model/reference answer

### 📊 Interview Reports

After completing an interview, users can view a detailed report containing:

* Overall score
* Technical score
* Communication score
* Confidence score
* Question-wise evaluation
* Strengths
* Weaknesses
* Improvement suggestions
* Performance summary

### 📚 Interview History

Users can review their previous interviews, including:

* Interview type
* Overall score
* Technical score
* Communication score
* Confidence score
* Number of questions
* Completion status
* Interview summary

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router
* JavaScript (ES6+)
* Web Speech API
* Browser Media APIs

### Backend

* Python
* Flask
* REST APIs
* JWT Authentication
* Python Virtual Environment

### Database

* MySQL

### Development Tools

* Visual Studio Code
* Git
* GitHub
* Postman

---

## 🏗️ Project Architecture

```text
SpeakUp-Ai/
│
├── backend/
│   ├── database/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── app.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🔄 Application Workflow

```text
                ┌─────────────────┐
                │   User Register │
                │     / Login     │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │    Dashboard    │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │   Upload Resume │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Select Interview│
                │      Type       │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  Start Mock     │
                │    Interview    │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ AI Generates /  │
                │ Provides        │
                │ Questions       │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Voice Answer +  │
                │ Speech-to-Text  │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ AI Evaluation   │
                │ & Feedback      │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Final Interview │
                │     Report      │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Interview       │
                │ History         │
                └─────────────────┘
```

---

## 💡 Why SpeakUp AI?

Traditional interview preparation often depends on practicing with friends or repeatedly answering questions without receiving meaningful feedback.

SpeakUp AI provides a more structured practice environment by combining:

* AI-generated interview questions
* Voice-based interaction
* Speech-to-text transcription
* Automated answer evaluation
* Performance scoring
* Detailed improvement suggestions
* Historical performance tracking

This allows candidates to identify weaknesses and continuously improve their interview performance.

---

## ⚙️ Installation & Setup

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Python 3.x
* MySQL
* Git

---

### 1. Clone the Repository

git clone https://github.com/kuppilisrivyshnavi/SpeakUp-Ai.git
cd SpeakUp-Ai

## 🐍 Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

### Windows

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
DATABASE_URL=your_database_connection
JWT_SECRET_KEY=your_secret_key
```

Add any other environment variables required by your local configuration.

> ⚠️ Never commit your `.env` file or API keys to GitHub.

---

## ▶️ Run the Backend

From the `backend` directory:

```bash
python app.py
```

The Flask backend should start on your configured local port.

---

## ⚛️ Frontend Setup

Open another terminal and navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The Vite development server will provide a local URL, typically:

```text
http://localhost:5173
```

---

## 🎤 Browser Permissions

Because SpeakUp AI uses the browser's camera and microphone APIs, the browser must be given permission to access:

* Camera
* Microphone

For the best speech-recognition experience, use a modern browser such as Google Chrome.

---

## 📊 Example Interview Report

The platform generates a detailed report after an interview.

Example metrics include:

| Metric              | Score |
| ------------------- | ----: |
| Overall Score       |    82 |
| Technical Score     |    85 |
| Communication Score |    80 |
| Confidence Score    |    88 |

The report also contains:

* Question-wise scores
* Detailed feedback
* Strengths
* Weaknesses
* Improvement suggestions
* Overall performance summary

---

## 🔒 Security

The application includes authentication and protected API communication using JWT tokens.

The frontend automatically attaches the authentication token to API requests and handles invalid or expired authentication sessions.

Sensitive configuration such as:

* Database credentials
* JWT secrets
* API keys

should be stored in environment variables rather than committed to the repository.

---

## 📌 Future Enhancements

Potential improvements include:

* Real-time facial expression analysis
* Advanced confidence analysis
* More detailed performance analytics
* Interview difficulty selection
* Industry-specific interview modes
* Personalized preparation plans
* Interview performance charts
* Cloud deployment
* Mobile application
* Improved AI-generated follow-up questions

---

## 🎯 Learning Outcomes

Through this project, I gained practical experience in:

* Full-stack application development
* React.js and component-based UI development
* REST API integration
* Flask backend development
* JWT authentication
* Database integration
* Speech recognition
* Browser Media APIs
* AI-powered application development
* API testing with Postman
* Git and GitHub workflow
* Structuring a scalable frontend and backend project

---

## 👩‍💻 Project

**SpeakUp AI — AI-Powered Mock Interview Platform**

Built as a full-stack AI project to provide an interactive and personalized interview preparation experience.

---

## ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.
