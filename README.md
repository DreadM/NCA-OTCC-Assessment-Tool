# OTCC Assessment Tool

An automated tool for assessing compliance with Saudi Arabia's National Cybersecurity Authority (NCA) Operational Technology Cybersecurity Controls (OTCC).

## Overview

This Proof of Concept (POC) demonstrates an AI-powered assessment tool that allows organizations to evaluate their compliance with the OTCC framework. The system features:

- A web portal for information submission and document upload
- An AI engine that analyzes documents to identify evidence of control implementation
- Automated assessment scoring and recommendation generation
- Interactive compliance dashboard with actionable insights

## Project Structure

```
otcc-assessment-tool/
├── frontend/               # React frontend application
│   ├── public/             # Static files
│   └── src/                # React components and logic
│       ├── components/     # UI components
│       ├── contexts/       # React context for state management
│       └── services/       # API services
├── backend/                # Express.js API server
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
└── analyzer/               # Python document analysis engine
    ├── otcc_document_analyzer.py   # Core analyzer class
    ├── analyzer_cli.py             # Command-line interface
    └── requirements.txt            # Python dependencies
```

## Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- npm
- pip

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/otcc-assessment-tool.git
cd otcc-assessment-tool
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```
PORT=5000
UPLOAD_DIR=./uploads
ASSESSMENT_DIR=./assessments
```

### 3. Set up the analyzer

```bash
cd ../analyzer
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_md
```

### 4. Set up the frontend

```bash
cd ../frontend
npm install
```

## Running the Application

### 1. Start the backend server

```bash
cd backend
npm run dev # or node server.js
```

### 2. Start the frontend application

```bash
cd frontend
npm start
```

The application will be available at http://localhost:3000

## Usage

1. **Enter Company Information**: Provide basic company details including industry sector and contact information.

2. **Add Facility Information**: Enter information about your operational technology facilities, including criticality levels and systems.

3. **Upload Documentation**: Upload relevant documentation such as policies, procedures, network diagrams, etc.

4. **Submit for Assessment**: Review your information and submit for automated assessment.

5. **View Results**: Explore the comprehensive assessment results including:
   - Overall compliance score
   - Domain-specific compliance
   - Critical findings
   - Prioritized recommendations

## Development Notes

This is a Proof of Concept implementation with the following limitations:

- Uses in-memory storage instead of a database
- Simplified document analysis engine
- Mock assessment process for demonstration purposes

For a production implementation, consider:

- Adding user authentication and authorization
- Implementing proper database storage (MongoDB/PostgreSQL)
- Enhancing document analysis with more sophisticated NLP techniques
- Adding integration with OT scanning tools

## Contact

You can reach out to me via LinkedIn: www.linkedin.com/in/muath-alhayani-47650a16b
