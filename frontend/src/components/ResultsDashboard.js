// src/components/ResultsDashboard.js
import React, { useContext } from 'react';
import { CompanyContext } from '../contexts/CompanyContext';

const ResultsDashboard = () => {
  const { companyInfo, assessmentResults } = useContext(CompanyContext);
  
  if (!assessmentResults) {
    return (
      <div className="card">
        <h2>No Assessment Results</h2>
        <p>No assessment results are available. Please submit an assessment first.</p>
      </div>
    );
  }
  
  return (
    <div className="results-dashboard">
      <div className="dashboard-header">
        <div className="company-info">
          <h1>{companyInfo.name}</h1>
          <p>OTCC Compliance Assessment Results</p>
          <p className="assessment-date">
            Assessment Date: {new Date(assessmentResults.assessmentDate).toLocaleDateString()}
          </p>
        </div>
        <div className="overall-score">
          <div className="score-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${assessmentResults.overallScore}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">
                {assessmentResults.overallScore}%
              </text>
            </svg>
          </div>
          <div className="score-label">Overall Compliance</div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-row">
          {/* Domain Scores */}
          <div className="dashboard-card">
            <h2>Domain Compliance</h2>
            <div className="domain-scores">
              {assessmentResults.domainScores.map((domain, index) => (
                <div className="domain-score-item" key={index}>
                  <div className="domain-name">{domain.domain}</div>
                  <div className="domain-score-bar">
                    <div 
                      className="domain-score-fill"
                      style={{ 
                        width: `${domain.score}%`,
                        backgroundColor: getScoreColor(domain.score)
                      }}
                    ></div>
                  </div>
                  <div className="domain-score-value">{Math.round(domain.score)}%</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Assessment Stats */}
          <div className="dashboard-card">
            <h2>Assessment Overview</h2>
            <div className="assessment-stats">
              <div className="stat-item">
                <div className="stat-value">{assessmentResults.controlsAssessed}</div>
                <div className="stat-label">Controls Assessed</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{assessmentResults.documentsAnalyzed}</div>
                <div className="stat-label">Documents Analyzed</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{assessmentResults.findings.length}</div>
                <div className="stat-label">Findings</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{assessmentResults.recommendations.length}</div>
                <div className="stat-label">Recommendations</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-row">
          {/* Critical Findings */}
          <div className="dashboard-card">
            <h2>Critical Findings</h2>
            <div className="findings-table">
              <div className="table-header">
                <div className="col-control">Control ID</div>
                <div className="col-domain">Domain</div>
                <div className="col-issue">Issue</div>
                <div className="col-impact">Impact</div>
              </div>
              
              {assessmentResults.findings.map((finding, index) => (
                <div className="table-row" key={index}>
                  <div className="col-control">{finding.controlId}</div>
                  <div className="col-domain">{finding.domain}</div>
                  <div className="col-issue">{finding.issue}</div>
                  <div className="col-impact">
                    <span className={`impact-badge impact-${finding.impact.toLowerCase()}`}>
                      {finding.impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="dashboard-row">
          {/* Recommendations */}
          <div className="dashboard-card">
            <h2>Recommended Actions</h2>
            <div className="recommendations-grid">
              {assessmentResults.recommendations.map((rec, index) => (
                <div className="recommendation-card" key={index}>
                  <div className="recommendation-header">
                    <h3>{rec.title}</h3>
                    <span className={`impact-badge impact-${rec.impact.toLowerCase()}`}>
                      {rec.impact} Impact
                    </span>
                  </div>
                  <p className="recommendation-description">{rec.description}</p>
                  <div className="recommendation-metrics">
                    <div className="metric">
                      <span className="metric-label">Effort:</span>
                      <span className="metric-value">{rec.effort}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Improvement:</span>
                      <span className="metric-value">+{rec.complianceImprovement}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="dashboard-actions">
          <button className="btn btn-primary">Download Full Report</button>
          <button className="btn btn-secondary">Schedule Consultation</button>
        </div>
      </div>
    </div>
  );
};

// Helper function to get color based on score
const getScoreColor = (score) => {
  if (score >= 80) return '#4CAF50'; // Green
  if (score >= 60) return '#FFC107'; // Yellow
  if (score >= 40) return '#FF9800'; // Orange
  return '#F44336'; // Red
};

export default ResultsDashboard;
