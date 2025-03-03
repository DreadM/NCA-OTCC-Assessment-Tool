// src/components/ProcessingScreen.js - Real API connection
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyContext } from '../contexts/CompanyContext';

const ProcessingScreen = () => {
  const { setAssessmentResults } = useContext(CompanyContext);
  const [processingStatus, setProcessingStatus] = useState({
    isProcessing: true,
    progress: 0,
    status: 'Initializing assessment...',
    completedSteps: []
  });
  const navigate = useNavigate();
  
  // Process steps for UI display
  const [completedSteps, setCompletedSteps] = useState([]);
  
  useEffect(() => {
    const assessmentId = localStorage.getItem('currentAssessmentId');
    
    if (!assessmentId) {
      console.error('No assessment ID found in localStorage');
      return;
    }
    
    console.log(`Processing assessment: ${assessmentId}`);
    
    const pollAssessmentStatus = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/assessment/${assessmentId}/status`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Poll status:', data);
        
        // Map progress to a step description
        let currentStepText = getStepDescription(data.progress);
        
        // Add to completed steps if not already there
        if (currentStepText && !completedSteps.includes(currentStepText)) {
          const newCompletedSteps = [...completedSteps, currentStepText];
          setCompletedSteps(newCompletedSteps);
        }
        
        // Update the processing status based on backend response
        setProcessingStatus({
          isProcessing: data.status !== 'completed',
          progress: data.progress,
          status: data.status === 'completed' ? 'Assessment complete!' : currentStepText,
          completedSteps: completedSteps
        });
        
        // If assessment is complete, fetch results and proceed
        if (data.status === 'completed') {
          const resultsResponse = await fetch(`http://localhost:5001/api/assessment/${assessmentId}/results`);
          
          if (!resultsResponse.ok) {
            throw new Error(`HTTP error! status: ${resultsResponse.status}`);
          }
          
          const resultsData = await resultsResponse.json();
          setAssessmentResults(resultsData);
          
          // Navigate to results page
          setTimeout(() => navigate('/results'), 1000);
        } else {
          // Continue polling
          setTimeout(pollAssessmentStatus, 2000);
        }
      } catch (error) {
        console.error('Error polling assessment status:', error);
        // Continue polling even on error
        setTimeout(pollAssessmentStatus, 3000);
      }
    };
    
    // Start polling
    pollAssessmentStatus();
    
    // Cleanup function
    return () => {
      // Any cleanup needed
    };
  }, [navigate, setAssessmentResults, completedSteps]);
  
  // Helper to map progress percentage to meaningful steps
  const getStepDescription = (progress) => {
    if (progress < 10) return 'Initializing assessment...';
    if (progress < 20) return 'Validating uploaded documents';
    if (progress < 30) return 'Extracting text from documents';
    if (progress < 40) return 'Analyzing policies and procedures';
    if (progress < 50) return 'Evaluating cybersecurity governance';
    if (progress < 60) return 'Assessing defense mechanisms';
    if (progress < 70) return 'Analyzing resilience capabilities';
    if (progress < 80) return 'Evaluating third-party security';
    if (progress < 90) return 'Generating compliance scores';
    if (progress < 100) return 'Preparing recommendations';
    return 'Assessment complete!';
  };
  
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
          {completedSteps.map((step, index) => (
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

export default ProcessingScreen;
