// src/components/ReviewSubmit.js
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyContext } from '../contexts/CompanyContext';

const ReviewSubmit = () => {
  const { companyInfo, facilities, documents, setProcessingStatus } = useContext(CompanyContext);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = () => {
    // Initialize processing status
    setProcessingStatus({
      isProcessing: true,
      progress: 0,
      status: 'Initializing assessment...',
      completedSteps: []
    });
    
    // Navigate to processing screen
    navigate('/processing');
  };
  
  return (
    <div className="card">
      <h2>Review & Submit</h2>
      <p className="help-text">
        Please review your information before submitting for assessment.
      </p>
      
      <div className="review-section">
        <h3>Company Information</h3>
        <div className="review-grid">
          <div className="review-item">
            <span className="label">Company Name:</span>
            <span className="value">{companyInfo.name}</span>
          </div>
          <div className="review-item">
            <span className="label">Industry:</span>
            <span className="value">{companyInfo.industry}</span>
          </div>
          <div className="review-item">
            <span className="label">Contact Person:</span>
            <span className="value">{companyInfo.contactName}</span>
          </div>
          <div className="review-item">
            <span className="label">Email:</span>
            <span className="value">{companyInfo.contactEmail}</span>
          </div>
          <div className="review-item">
            <span className="label">Phone:</span>
            <span className="value">{companyInfo.contactPhone}</span>
          </div>
        </div>
      </div>
      
      <div className="review-section">
        <h3>Facilities ({facilities.length})</h3>
        {facilities.map((facility, index) => (
          <div className="facility-card" key={facility.id}>
            <h4>{facility.name || `Facility ${index + 1}`}</h4>
            <div className="review-grid">
              <div className="review-item">
                <span className="label">Criticality Level:</span>
                <span className="value">{facility.criticalityLevel || 'Not specified'}</span>
              </div>
              <div className="review-item">
                <span className="label">Systems:</span>
                <span className="value">{facility.systems || 'Not specified'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="review-section">
        <h3>Uploaded Documents ({documents.length})</h3>
        {documents.length > 0 ? (
          <div className="documents-summary">
            <div className="document-categories">
              {['Policy', 'Procedure', 'Architecture', 'Inventory', 'Logs', 'Other'].map(category => {
                const count = documents.filter(doc => doc.category === category).length;
                return count > 0 ? (
                  <div className="category-badge" key={category}>
                    {category}: {count}
                  </div>
                ) : null;
              })}
            </div>
            <ul className="document-list">
              {documents.map(doc => (
                <li key={doc.id}>
                  <span className="document-name">{doc.name}</span>
                  <span className="document-category">{doc.category}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="warning-box">
            <i className="fas fa-exclamation-triangle"></i>
            <p>No documents uploaded. Assessment may be limited without supporting documentation.</p>
          </div>
        )}
      </div>
      
      <div className="terms-section">
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="terms" 
            checked={termsAccepted}
            onChange={() => setTermsAccepted(!termsAccepted)}
            required 
          />
          <label htmlFor="terms">
            I confirm that I am authorized to submit this information for assessment and that the information provided is accurate.
          </label>
        </div>
      </div>
      
      <div className="form-actions">
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/documents')}
        >
          Back
        </button>
        <button 
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!termsAccepted}
        >
          Submit for Assessment
        </button>
      </div>
    </div>
  );
};

export default ReviewSubmit;
