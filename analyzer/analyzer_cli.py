#!/usr/bin/env python3
"""
OTCC Document Analyzer CLI

This script provides a command-line interface to the OTCC Document Analyzer.
It processes documents and generates an assessment report for OTCC compliance.
"""

import argparse
import json
import os
import sys
from otcc_document_analyzer import OTCCDocumentAnalyzer

def main():
    """Main entry point for the OTCC Document Analyzer CLI."""
    parser = argparse.ArgumentParser(description='OTCC Document Analyzer')
    parser.add_argument('--assessment-id', required=True, help='Assessment ID')
    parser.add_argument('--documents', required=True, help='JSON string with document paths')
    parser.add_argument('--output-dir', required=True, help='Output directory for results')
    
    args = parser.parse_args()
    
    # Parse documents
    try:
        document_paths = json.loads(args.documents)
    except json.JSONDecodeError:
        print(json.dumps({
            "error": "Invalid JSON in documents parameter",
            "status": "Failed"
        }))
        sys.exit(1)
    
    # Initialize analyzer
    analyzer = OTCCDocumentAnalyzer()
    
    # Process each document
    for i, doc_path in enumerate(document_paths):
        progress = int(10 + (i / len(document_paths) * 70))
        print(json.dumps({
            "progress": progress,
            "status": f"Analyzing document {i+1} of {len(document_paths)}"
        }))
        analyzer.analyze_document(doc_path)
    
    # Generate assessment
    print(json.dumps({
        "progress": 80,
        "status": "Generating assessment results"
    }))
    results = analyzer.generate_assessment()
    
    # Generate recommendations
    print(json.dumps({
        "progress": 90,
        "status": "Preparing recommendations"
    }))
    recommendations = analyzer.generate_recommendations()
    
    # Calculate overall compliance
    overall_compliance = analyzer.get_overall_compliance()
    domain_scores = analyzer.get_domain_scores()
    
    # Prepare final results
    final_results = {
        "overallScore": overall_compliance,
        "domainScores": [
            {"domain": domain, "score": score} 
            for domain, score in domain_scores.items()
        ],
        "findings": [
            {
                "controlId": rec["control_id"],
                "domain": analyzer.controls[rec["control_id"]]["domain"],
                "subdomain": analyzer.controls[rec["control_id"]]["subdomain"],
                "issue": rec["recommendation"],
                "impact": rec["priority"],
                "recommendation": rec["details"]
            }
            for rec in recommendations
        ],
        "recommendations": [
            {
                "title": rec["recommendation"].split('.')[0],
                "impact": rec["priority"],
                "effort": "Medium",
                "description": rec["details"],
                "complianceImprovement": int(rec["expected_improvement"].split('-')[0])
            }
            for rec in recommendations
        ],
        "controlsAssessed": len(analyzer.controls),
        "documentsAnalyzed": len(analyzer.analyzed_documents),
        "complianceStatus": "Non-Compliant" if overall_compliance < 50 else "Partially Compliant",
        "assessmentDate": analyzer.assessment_date
    }
    
    # Write results to output directory
    os.makedirs(args.output_dir, exist_ok=True)
    output_path = os.path.join(args.output_dir, 'results.json')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(final_results, f, indent=2)
    
    print(json.dumps({
        "progress": 100,
        "status": "Assessment complete"
    }))

if __name__ == "__main__":
    main()
