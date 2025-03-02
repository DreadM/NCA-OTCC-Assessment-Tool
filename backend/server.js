const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');
require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up upload directories
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const ASSESSMENT_DIR = process.env.ASSESSMENT_DIR || './assessments';

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

if (!fs.existsSync(ASSESSMENT_DIR)) {
  fs.mkdirSync(ASSESSMENT_DIR, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const companyId = req.body.companyId || 'temp';
    const dir = path.join(UPLOAD_DIR, companyId);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/plain',
      'text/markdown',
      'image/png',
      'image/jpeg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, XLSX, TXT, MD, PNG, and JPG files are allowed.'));
    }
  }
});

// In-memory database for POC (would use MongoDB/PostgreSQL in production)
const db = {
  companies: [],
  facilities: [],
  documents: [],
  assessments: []
};

// API Routes
// Company routes
app.post('/api/company', (req, res) => {
  const company = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date()
  };
  
  db.companies.push(company);
  res.status(201).json(company);
});

app.get('/api/company/:id', (req, res) => {
  const company = db.companies.find(c => c.id === req.params.id);
  
  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  res.json(company);
});

// Facility routes
app.post('/api/facility', (req, res) => {
  const facility = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date()
  };
  
  db.facilities.push(facility);
  res.status(201).json(facility);
});

app.get('/api/facility/company/:companyId', (req, res) => {
  const facilities = db.facilities.filter(f => f.companyId === req.params.companyId);
  res.json(facilities);
});

// Document routes
app.post('/api/document/upload', upload.array('documents', 10), (req, res) => {
  try {
    const uploadedDocs = req.files.map(file => {
      const document = {
        id: uuidv4(),
        companyId: req.body.companyId,
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        category: req.body.category || guessDocumentCategory(file.originalname),
        uploadedAt: new Date()
      };
      
      db.documents.push(document);
      return document;
    });
    
    res.status(201).json(uploadedDocs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/document/company/:companyId', (req, res) => {
  const documents = db.documents.filter(d => d.companyId === req.params.companyId);
  res.json(documents);
});

// Assessment routes
app.post('/api/assessment/start', (req, res) => {
  const { companyId, documents } = req.body;
  
  if (!companyId || !documents || !documents.length) {
    return res.status(400).json({ error: 'Company ID and documents are required' });
  }
  
  // Create a new assessment
  const assessment = {
    id: uuidv4(),
    companyId,
    documentIds: documents.map(doc => doc.id),
    status: 'processing',
    progress: 0,
    startedAt: new Date(),
    completedAt: null,
    results: null
  };
  
  db.assessments.push(assessment);
  
  // Start the assessment process asynchronously
  processAssessment(assessment);
  
  res.status(201).json({ assessmentId: assessment.id });
});

app.get('/api/assessment/:id/status', (req, res) => {
  const assessment = db.assessments.find(a => a.id === req.params.id);
  
  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found' });
  }
  
  res.json({
    id: assessment.id,
    status: assessment.status,
    progress: assessment.progress,
    startedAt: assessment.startedAt,
    completedAt: assessment.completedAt
  });
});

app.get('/api/assessment/:id/results', (req, res) => {
  const assessment = db.assessments.find(a => a.id === req.params.id);
  
  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found' });
  }
  
  if (assessment.status !== 'completed') {
    return res.status(400).json({ error: 'Assessment is not completed yet' });
  }
  
  res.json(assessment.results);
});

app.get('/api/assessment/:id/report', (req, res) => {
  const assessment = db.assessments.find(a => a.id === req.params.id);
  
  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found' });
  }
  
  if (assessment.status !== 'completed') {
    return res.status(400).json({ error: 'Assessment is not completed yet' });
  }
  
  // In a real implementation, you would generate a PDF here
  // For the POC, we'll just send a JSON file
  const reportPath = path.join(ASSESSMENT_DIR, assessment.id, 'results.json');
  
  if (fs.existsSync(reportPath)) {
    res.download(reportPath, `OTCC_Assessment_Report_${assessment.id}.json`);
  } else {
    // If the file doesn't exist, create it
    const resultsJson = JSON.stringify(assessment.results, null, 2);
    fs.writeFileSync(reportPath, resultsJson);
    res.download(reportPath, `OTCC_Assessment_Report_${assessment.id}.json`);
  }
});

// Helper functions
function guessDocumentCategory(filename) {
  const lowerFilename = filename.toLowerCase();
  if (lowerFilename.includes('policy')) return 'Policy';
  if (lowerFilename.includes('procedure')) return 'Procedure';
  if (lowerFilename.includes('diagram') || lowerFilename.includes('arch')) return 'Architecture';
  if (lowerFilename.includes('invent')) return 'Inventory';
  if (lowerFilename.includes('log')) return 'Logs';
  return 'Other';
}

// Function to process the assessment using the Python analyzer
function processAssessment(assessment) {
  // Get the document paths
  const documents = db.documents.filter(d => assessment.documentIds.includes(d.id));
  const documentPaths = documents.map(d => d.path);
  
  // Create temp directory for assessment
  const assessmentDir = path.join(ASSESSMENT_DIR, assessment.id);
  if (!fs.existsSync(assessmentDir)) {
    fs.mkdirSync(assessmentDir, { recursive: true });
  }
  
  // Create a document manifest file
  const manifestPath = path.join(assessmentDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    assessmentId: assessment.id,
    companyId: assessment.companyId,
    documents: documents.map(d => ({
      id: d.id,
      path: d.path,
      name: d.originalName,
      category: d.category
    }))
  }));
  
  // Update progress
  updateAssessmentProgress(assessment.id, 10, 'Documents validated');
  
  // In a real implementation, we would call the Python analyzer here
  // For the POC, we'll simulate the analysis with timeouts
  simulateAnalysis(assessment.id, assessmentDir);
}

function updateAssessmentProgress(assessmentId, progress, status) {
  const assessment = db.assessments.find(a => a.id === assessmentId);
  if (assessment) {
    assessment.progress = progress;
    assessment.status = progress >= 100 ? 'completed' : 'processing';
    
    // Log progress (would be websocket in production)
    console.log(`Assessment ${assessmentId}: ${progress}% - ${status}`);
  }
}

function simulateAnalysis(assessmentId, assessmentDir) {
  const steps = [
    { progress: 20, status: 'Extracting text from documents', delay: 3000 },
    { progress: 30, status: 'Analyzing policies and procedures', delay: 3500 },
    { progress: 40, status: 'Evaluating cybersecurity governance', delay: 2500 },
    { progress: 60, status: 'Assessing defense mechanisms', delay: 3000 },
    { progress: 70, status: 'Analyzing resilience capabilities', delay: 2000 },
    { progress: 80, status: 'Evaluating third-party security', delay: 2500 },
    { progress: 90, status: 'Generating compliance scores', delay: 2000 },
    { progress: 95, status: 'Preparing recommendations', delay: 2500 }
  ];
  
  let stepIndex = 0;
  
  const processNextStep = () => {
    if (stepIndex < steps.length) {
      const step = steps[stepIndex];
      updateAssessmentProgress(assessmentId, step.progress, step.status);
      
      setTimeout(() => {
        stepIndex++;
        processNextStep();
      }, step.delay);
    } else {
      // Final step: Complete the assessment
      completeAssessment(assessmentId, assessmentDir);
    }
  };
  
  processNextStep();
}

function completeAssessment(assessmentId, assessmentDir) {
  const assessment = db.assessments.find(a => a.id === assessmentId);
  if (!assessment) return;
  
  // Generate results (in a real implementation, this would come from the Python analyzer)
  const results = generateSampleResults();
  
  // Save results
  assessment.results = results;
  assessment.status = 'completed';
  assessment.progress = 100;
  assessment.completedAt = new Date();
  
  // Save results file
  const resultsPath = path.join(assessmentDir, 'results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  console.log(`Assessment ${assessmentId} completed successfully`);
}

function generateSampleResults() {
  // This function simulates the results that would come from the Python analyzer
  // In a real implementation, this would be replaced with actual analysis results
  
  // Calculate random compliance scores (45-65% range for the POC)
  const overallScore = Math.floor(Math.random() * 20) + 45;
  
  // Domain scores
  const domainScores = [
    { domain: "Cybersecurity Governance", score: Math.min(100, overallScore + getRandomInt(-10, 15)) },
    { domain: "Cybersecurity Defense", score: Math.min(100, overallScore + getRandomInt(-15, 5)) },
    { domain: "Cybersecurity Resilience", score: Math.min(100, overallScore + getRandomInt(-5, 10)) },
    { domain: "Third-Party Cybersecurity", score: Math.min(100, overallScore + getRandomInt(-25, -5)) }
  ];
  
  // Generate findings
  const findings = [
    {
      controlId: "1-1-3",
      domain: "Cybersecurity Governance",
      subdomain: "Cybersecurity Policies and Procedures",
      issue: "No evidence of periodic review for OT/ICS policies",
      impact: "High",
      recommendation: "Establish a formal review process for OT/ICS cybersecurity policies"
    },
    {
      controlId: "2-11-1",
      domain: "Cybersecurity Defense",
      subdomain: "Cybersecurity Event Logs and Monitoring Management",
      issue: "Insufficient cybersecurity event logs and audit trails",
      impact: "Critical",
      recommendation: "Implement comprehensive logging across all OT/ICS assets"
    },
    {
      controlId: "4-1-1",
      domain: "Third-Party Cybersecurity",
      subdomain: "Third-Party Cybersecurity",
      issue: "No formal process for cybersecurity in OT/ICS procurement",
      impact: "Medium",
      recommendation: "Establish cybersecurity requirements for OT/ICS vendors"
    }
  ];
  
  // Generate recommendations
  const recommendations = [
    {
      title: "Implement Event Logging",
      impact: "High",
      effort: "Medium",
      description: "Implement comprehensive logging across all OT/ICS assets and establish centralized monitoring.",
      complianceImprovement: 15,
      estimatedCost: "$20-30K", 
      timeToImplement: "4-6 weeks"
    },
    {
      title: "Develop Third-Party Security Program",
      impact: "Medium",
      effort: "Medium",
      description: "Establish formal cybersecurity requirements for OT/ICS vendors and implement security assessments.",
      complianceImprovement: 10,
      estimatedCost: "$15-25K", 
      timeToImplement: "6-8 weeks"
    },
    {
      title: "Establish Policy Review Process",
      impact: "Medium",
      effort: "Low",
      description: "Create a documented review cadence for all OT/ICS cybersecurity policies.",
      complianceImprovement: 5,
      estimatedCost: "$5-10K", 
      timeToImplement: "2-3 weeks"
    }
  ];
  
  // Generate projected compliance after implementing recommendations
  const projectedCompliance = [
    { month: 1, score: overallScore },
    { month: 2, score: overallScore + 5 },
    { month: 3, score: overallScore + 15 },
    { month: 4, score: overallScore + 25 },
    { month: 5, score: overallScore + 30 },
    { month: 6, score: Math.min(95, overallScore + 35) }
  ];
  
  return {
    overallScore,
    domainScores,
    findings,
    recommendations,
    projectedCompliance,
    controlsAssessed: 10,
    complianceStatus: overallScore < 50 ? "Non-Compliant" : "Partially Compliant",
    assessmentDate: new Date().toISOString()
  };
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Connect Document Analyzer with Express (for a real implementation)
// This shows how you would call the Python analyzer in a production environment
function callDocumentAnalyzer(assessmentId, documentPaths, outputDir) {
  return new Promise((resolve, reject) => {
    // Call the Python script
    const python = spawn('python3', [
      'analyzer/otcc_document_analyzer.py',
      '--assessment-id', assessmentId,
      '--documents', JSON.stringify(documentPaths),
      '--output-dir', outputDir
    ]);
    
    let dataString = '';
    
    // Collect data from script
    python.stdout.on('data', (data) => {
      dataString += data.toString();
      // Parse progress updates and update assessment status
      try {
        const progressData = JSON.parse(data.toString());
        if (progressData.progress) {
          updateAssessmentProgress(
            assessmentId, 
            progressData.progress, 
            progressData.status || 'Processing'
          );
        }
      } catch (e) {
        // Not JSON data, just log output
        console.log(`Analyzer output: ${data}`);
      }
    });
    
    // Handle errors
    python.stderr.on('data', (data) => {
      console.error(`Analyzer error: ${data}`);
    });
    
    // Finalize when done
    python.on('close', (code) => {
      if (code !== 0) {
        console.error(`Analyzer process exited with code ${code}`);
        reject(`Process exited with code ${code}`);
        return;
      }
      
      // Read results file
      try {
        const resultsPath = path.join(outputDir, 'results.json');
        const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
        resolve(results);
      } catch (error) {
        reject(`Error reading results: ${error.message}`);
      }
    });
  });
}

// Start the server
app.listen(port, () => {
  console.log(`OTCC Assessment API running on port ${port}`);
});
