// src/components/ProcessingScreen.js
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyContext } from '../contexts/CompanyContext';

const ProcessingScreen = () => {
  const { documents, processingStatus, setProcessingStatus, setAssessmentResults } = useContext(CompanyContext);
  const navigate = useNavigate();
  
  // Simulate the assessment process
  useEffect(() => {
    const simulateProcessing = async () => {
      const steps = [
        { step: 'Validating uploaded documents', time: 2000 },
        { step: 'Extracting text from documents', time: 3000 },
        { step: 'Analyzing policies and procedures', time: 3500 },
        { step: 'Evaluating cybersecurity governance', time: 2500 },
        { step: 'Assessing defense mechanisms', time: 3000 },
        { step: 'Analyzing resilience capabilities', time: 2000 },
        { step: 'Evaluating third-party security', time: 2500 },
        { step: 'Generating compliance scores', time: 2000 },
        { step: 'Preparing recommendations', time: 3000 },
        { step: 'Finalizing assessment report', time: 2500 }
      ];
      
      let completedSteps = [];
      
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        // Update status to current step
        setProcessingStatus({
          isProcessing: true,
          progress: Math.round(((i) / steps.length) * 100),
          status: step.step,
          completedSteps
        });
        
        // Wait for the step duration
        await new Promise(resolve => setTimeout(resolve, step.time));
        
        // Add to completed steps
        completedSteps = [...completedSteps, step.step];
      }
      
      // Create sample assessment results
      const sampleResults = generateSampleResults(documents);
      setAssessmentResults(sampleResults);
      
      // Complete processing
      setProcessingStatus({
        isProcessing: false,
        progress: 100,
        status: 'Assessment complete!',
        completedSteps
      });
      
      // Navigate to results page
      navigate('/results');
    };
    
    simulateProcessing();
    
    // Cleanup function
    return () => {
      // Any cleanup needed
    };
  }, []);
  
  return (
    <div className="card processing-card">
      <h2>Processing Your Assessment</h2>
      
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${processingStatus.progress}%` }}
          ></div>
        </div>
        <div className="progress-percentage">{processingStatus.progress}%</div>
      </div>
      
      <div className="processing-status">
        <div className="status-icon">
          <i className="fas fa-cog fa-spin"></i>
        </div>
        <div className="status-text">{processingStatus.status}</div>
      </div>
      
      <div className="completed-steps">
        <h3>Completed Steps:</h3>
        <ul>
          {processingStatus.completedSteps.map((step, index) => (
            <li key={index} className="completed-step">
              <i className="fas fa-check-circle"></i>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="processing-note">
        <i className="fas fa-info-circle"></i>
        <p>This assessment is being processed using AI to analyze your documentation.</p>
      </div>
    </div>
  );
};

// Helper function to generate sample assessment results
const generateSampleResults = (documents) => {
  // Calculate a score based on the number and types of documents
  const policyDocs = documents.filter(doc => doc.category === 'Policy').length;
  const procedureDocs = documents.filter(doc => doc.category === 'Procedure').length;
  const architectureDocs = documents.filter(doc => doc.category === 'Architecture').length;
  const inventoryDocs = documents.filter(doc => doc.category === 'Inventory').length;
  
  // Base score between 35-55 depending on document count
  const docScore = Math.min(55, 35 + (documents.length * 2));
  
  // Adjust score based on document types
  let score = docScore;
  if (policyDocs > 0) score += 5;
  if (procedureDocs > 0) score += 5;
  if (architectureDocs > 0) score += 5;
  if (inventoryDocs > 0) score += 5;
  
  // Cap at 95
  score = Math.min(95, score);
  
  // Generate domain scores
  const domainScores = [
    { domain: "Cybersecurity Governance", score: Math.min(100, score + getRandomInt(-10, 10)) },
    { domain: "Cybersecurity Defense", score: Math.min(100, score + getRandomInt(-15, 5)) },
    { domain: "Cybersecurity Resilience", score: Math.min(100, score + getRandomInt(-20, 0)) },
    { domain: "Third-Party Cybersecurity", score: Math.min(100, score + getRandomInt(-25, -5)) }
  ];
  
  // Generate findings
  const findings = [];
  
  // Governance findings
  if (policyDocs === 0) {
    findings.push({
      controlId: "1-1-1",
      domain: "Cybersecurity Governance",
      issue: "No OT/ICS cybersecurity policies found",
      impact: "Critical",
      recommendation: "Develop and implement comprehensive OT/ICS cybersecurity policies"
    });
  }
  
  findings.push({
    controlId: "1-1-3",
    domain: "Cybersecurity Governance",
    issue: "No evidence of periodic review for OT/ICS policies",
    impact: "High",
    recommendation: "Establish a formal review process for OT/ICS cybersecurity policies"
  });
  
  // Defense findings
  if (architectureDocs === 0) {
    findings.push({
      controlId: "2-4-1",
      domain: "Cybersecurity Defense",
      issue: "No evidence of network segmentation for OT/ICS environment",
      impact: "Critical",
      recommendation: "Implement proper network segmentation between IT and OT networks"
    });
  }
  
  findings.push({
    controlId: "2-11-1",
    domain: "Cybersecurity Defense",
    issue: "Insufficient cybersecurity event logs and audit trails",
    impact: "High",
    recommendation: "Implement comprehensive logging across all OT/ICS assets"
  });
  
  // Third-party findings
  findings.push({
    controlId: "4-1-1",
    domain: "Third-Party Cybersecurity",
    issue: "No formal process for cybersecurity in OT/ICS procurement",
    impact: "Medium",
    recommendation: "Establish cybersecurity requirements for OT/ICS vendors"
  });
  
  // Generate recommendations
  const recommendations = [
    {
      title: "Implement Event Logging",
      impact: "High",
      effort: "Medium",
      description: "Implement comprehensive logging across all OT/ICS assets and establish centralized monitoring.",
      complianceImprovement: 15
    },
    {
      title: "Develop Third-Party Security Program",
      impact: "Medium",
      effort: "Medium",
      description: "Establish formal cybersecurity requirements for OT/ICS vendors and implement security assessments.",
      complianceImprovement: 10
    },
    {
      title: "Establish Policy Review Process",
      impact: "Medium",
      effort: "Low",
      description: "Create a documented review cadence for all OT/ICS cybersecurity policies.",
      complianceImprovement: 5
    }
  ];
  
  return {
    overallScore: Math.round(score),
    assessmentDate: new Date().toISOString(),
    domainScores,
    findings,
    recommendations,
    controlsAssessed: 10,
    documentsAnalyzed: documents.length
  };
};

// Helper function to get random integer in range
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export default ProcessingScreen;
