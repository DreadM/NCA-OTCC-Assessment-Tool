// src/components/ReviewSubmit.js - Real API submission
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyContext } from '../contexts/CompanyContext';

const ReviewSubmit = () => {
  const { companyInfo, facilities, documents, setProcessingStatus } = useContext(CompanyContext);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const navigate = useNavigate();
  
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Initialize processing status
      setProcessingStatus({
        isProcessing: true,
        progress: 0,
        status: 'Initializing assessment...',
        completedSteps: []
      });
      
      console.log('Starting assessment submission process');
      
      // 1. Create a company record
      console.log('Creating company record:', companyInfo);
      const companyResponse = await fetch('http://localhost:5001/api/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyInfo),
      });
      
      if (!companyResponse.ok) {
        throw new Error('Failed to create company record');
      }
      
      const companyData = await companyResponse.json();
      const companyId = companyData.id;
      console.log('Company created with ID:', companyId);
      
      // 2. Add facilities
      console.log('Adding facilities:', facilities.length);
      for (const facility of facilities) {
        const facilityData = {
          ...facility,
          companyId
        };
        
        const facilityResponse = await fetch('http://localhost:5001/api/facility', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(facilityData),
        });
        
        if (!facilityResponse.ok) {
          throw new Error('Failed to create facility record');
        }
      }
      
      // 3. Upload documents
      console.log('Uploading documents:', documents.length);
      const formData = new FormData();
      formData.append('companyId', companyId);
      
      for (const doc of documents) {
        formData.append('documents', doc.file);
        // Add category metadata
        formData.append(`categories[${doc.id}]`, doc.category);
      }
      
      const uploadResponse = await fetch('http://localhost:5001/api/document/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload documents');
      }
      
      const uploadedDocs = await uploadResponse.json();
      console.log('Documents uploaded:', uploadedDocs.length);
      
      // 4. Start assessment
      console.log('Starting assessment with documents:', uploadedDocs.map(d => d.id));
      const assessmentResponse = await fetch('http://localhost:5001/api/assessment/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          documents: uploadedDocs.map(doc => doc.id)
        }),
      });
      
      if (!assessmentResponse.ok) {
        throw new Error('Failed to start assessment');
      }
      
      const assessmentData = await assessmentResponse.json();
      const assessmentId = assessmentData.assessmentId;
      
      console.log('Assessment started with ID:', assessmentId);
      localStorage.setItem('currentAssessmentId', assessmentId);
      
      // Navigate to processing screen
      navigate('/processing');
      
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setSubmitError(error.message);
      
      // Reset processing status
      setProcessingStatus({
        isProcessing: false,
        progress: 0,
        status: '',
        completedSteps: []
      });
    } finally {
      setIsSubmitting(false);
    }
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
      
      {submitError && (
        <div className="error-box">
          <i className="fas fa-exclamation-circle"></i>
          <p>Error: {submitError}</p>
        </div>
      )}
      
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
          disabled={isSubmitting}
        >
          Back
        </button>
        <button 
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!termsAccepted || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit for Assessment'}
        </button>
      </div>
    </div>
  );
};

export default ReviewSubmit;
