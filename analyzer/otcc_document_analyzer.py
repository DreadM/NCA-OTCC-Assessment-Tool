import os
import re
import spacy
import pandas as pd
import PyPDF2
import docx
import json
from collections import defaultdict

class OTCCDocumentAnalyzer:
    """
    A proof-of-concept document analyzer for OTCC compliance assessment.
    This class demonstrates basic NLP techniques to analyze documents for
    evidence of OTCC control implementation.
    """
    
    def __init__(self):
        """Initialize the analyzer with NLP model and OTCC control definitions."""
        # Load NLP model
        self.nlp = spacy.load("en_core_web_md")
        
        # Load OTCC control definitions (in a real implementation, this would be from a database)
        self.controls = self._load_control_definitions()
        
        # Track analyzed documents
        self.analyzed_documents = []
        
        # Store evidence findings
        self.evidence_map = defaultdict(list)
        
        # Final assessment results
        self.assessment_results = {}
        
        # Store the assessment date
        self.assessment_date = pd.Timestamp.now().strftime("%Y-%m-%d")

    def _load_control_definitions(self):
        """
        Load OTCC control definitions from a JSON file.
        For the POC, we're focusing on a subset of controls.
        """
        # In a real implementation, this would load from a database or external file
        # For this POC, we'll define a few controls inline
        return {
            "1-1-1": {
                "domain": "Cybersecurity Governance",
                "subdomain": "Cybersecurity Policies and Procedures",
                "description": "Documented, approved, and implemented cybersecurity policies and procedures for OT/ICS systems",
                "keywords": ["OT security policy", "ICS security policy", "cybersecurity policy", 
                            "OT/ICS policy", "security procedure", "policy approval"],
                "required_evidence": ["policy document", "approval record", "implementation evidence"]
            },
            "1-1-3": {
                "domain": "Cybersecurity Governance",
                "subdomain": "Cybersecurity Policies and Procedures",
                "description": "OT/ICS cybersecurity policies reviewed periodically",
                "keywords": ["policy review", "annual review", "periodic review", "review process", 
                            "policy update", "review date", "review schedule", "review record"],
                "required_evidence": ["review schedule", "review records", "update history"]
            },
            "2-4-1": {
                "domain": "Cybersecurity Defense",
                "subdomain": "Network Security Management",
                "description": "OT/ICS environment network segmentation",
                "keywords": ["network segmentation", "air gap", "firewall", "DMZ", "security zone", 
                             "network separation", "IT/OT segmentation", "security perimeter"],
                "required_evidence": ["network diagram", "firewall rules", "segmentation controls"]
            },
            "2-11-1": {
                "domain": "Cybersecurity Defense",
                "subdomain": "Cybersecurity Event Logs and Monitoring Management",
                "description": "Activation of cybersecurity event logs and audit trails",
                "keywords": ["event log", "audit trail", "log management", "security monitoring", 
                            "SIEM", "logging policy", "event monitoring", "log collection", "log retention"],
                "required_evidence": ["logging configuration", "monitoring setup", "log storage policy"]
            },
            "3-1-1": {
                "domain": "Cybersecurity Resilience",
                "subdomain": "Cybersecurity Resilience Aspects of Business Continuity Management",
                "description": "OT/ICS systems minimum operations sustainability",
                "keywords": ["business continuity", "disaster recovery", "backup", "recovery plan", 
                             "resilience", "continuity plan", "backup procedure", "BCP", "DRP"],
                "required_evidence": ["continuity plan", "recovery procedures", "backup strategy"]
            },
            "4-1-1": {
                "domain": "Third-Party Cybersecurity",
                "subdomain": "Third-Party Cybersecurity",
                "description": "Inclusion of cybersecurity requirements in OT/ICS procurement",
                "keywords": ["vendor security", "procurement security", "third-party security", 
                            "supplier security", "vendor management", "security requirement", "vendor assessment"],
                "required_evidence": ["procurement policy", "vendor requirements", "security clauses"]
            }
        }

    def extract_text_from_pdf(self, pdf_path):
        """Extract text content from a PDF file."""
        text = ""
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            print(f"Error extracting text from PDF {pdf_path}: {e}")
        return text

    def extract_text_from_docx(self, docx_path):
        """Extract text content from a Word document."""
        text = ""
        try:
            doc = docx.Document(docx_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception as e:
            print(f"Error extracting text from DOCX {docx_path}: {e}")
        return text

    def analyze_document(self, file_path, document_type=None):
        """
        Analyze a document for OTCC control evidence.
        
        Args:
            file_path: Path to the document
            document_type: Optional type classification (policy, procedure, etc.)
        """
        # Extract text based on file type
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext == '.pdf':
            text = self.extract_text_from_pdf(file_path)
        elif file_ext in ['.docx', '.doc']:
            text = self.extract_text_from_docx(file_path)
        elif file_ext in ['.txt', '.md']:
            with open(file_path, 'r', encoding='utf-8') as file:
                text = file.read()
        else:
            print(f"Unsupported file type: {file_ext}")
            return
        
        # Store document in analyzed list
        doc_info = {
            "file_path": file_path, 
            "file_name": os.path.basename(file_path),
            "document_type": document_type or self._guess_document_type(os.path.basename(file_path)),
            "text_length": len(text)
        }
        self.analyzed_documents.append(doc_info)
        
        # Process with NLP
        doc = self.nlp(text)
        
        # For each control, check for keyword matches and extract context
        for control_id, control_info in self.controls.items():
            self._find_evidence_for_control(control_id, control_info, doc, text, doc_info)
    
    def _find_evidence_for_control(self, control_id, control_info, nlp_doc, full_text, doc_info):
        """Find evidence for a specific control within the document text."""
        
        # Check for keyword matches
        for keyword in control_info["keywords"]:
            # Look for the keyword in the text (case insensitive)
            matches = re.finditer(re.escape(keyword), full_text, re.IGNORECASE)
            
            for match in matches:
                # Get some context around the match
                start = max(0, match.start() - 150)
                end = min(len(full_text), match.end() + 150)
                context = full_text[start:end]
                
                # Add to evidence map
                self.evidence_map[control_id].append({
                    "document": doc_info["file_name"],
                    "document_type": doc_info["document_type"],
                    "keyword": keyword,
                    "context": context.replace("\n", " ").strip(),
                    "confidence": self._calculate_confidence(keyword, context, control_info)
                })
    
    def _calculate_confidence(self, keyword, context, control_info):
        """
        Calculate a confidence score for the evidence based on:
        - Presence of multiple keywords in the context
        - Presence of required evidence terms
        - Whether the context appears to be a header, policy statement, etc.
        
        This is a simplified version for the POC.
        """
        confidence = 0.5  # Base confidence for a keyword match
        
        # Check for multiple keywords
        additional_keywords = sum(1 for kw in control_info["keywords"] 
                                if kw != keyword and kw.lower() in context.lower())
        confidence += additional_keywords * 0.1  # Boost for each additional keyword
        
        # Check for required evidence terms
        evidence_terms = sum(1 for term in control_info["required_evidence"] 
                           if term.lower() in context.lower())
        confidence += evidence_terms * 0.1
        
        # Look for policy language indicators
        policy_indicators = ["shall", "must", "required", "policy", "procedure", "standard"]
        if any(indicator in context.lower() for indicator in policy_indicators):
            confidence += 0.1
        
        return min(0.95, confidence)  # Cap at 0.95 for POC
    
    def analyze_directory(self, directory_path):
        """Analyze all supported documents in a directory."""
        supported_extensions = ['.pdf', '.docx', '.doc', '.txt', '.md']
        
        for filename in os.listdir(directory_path):
            file_path = os.path.join(directory_path, filename)
            if os.path.isfile(file_path) and any(filename.lower().endswith(ext) for ext in supported_extensions):
                # Make a basic guess about document type from filename
                doc_type = self._guess_document_type(filename)
                self.analyze_document(file_path, doc_type)
    
    def _guess_document_type(self, filename):
        """Make a basic guess about document type from filename."""
        filename_lower = filename.lower()
        
        if any(term in filename_lower for term in ["policy", "policies"]):
            return "policy"
        elif any(term in filename_lower for term in ["procedure", "process"]):
            return "procedure"
        elif any(term in filename_lower for term in ["standard", "guideline"]):
            return "standard"
        elif any(term in filename_lower for term in ["diagram", "architecture"]):
            return "diagram"
        elif any(term in filename_lower for term in ["log", "report"]):
            return "report"
        else:
            return "unknown"
    
    def generate_assessment(self):
        """
        Generate assessment results based on the evidence collected.
        For each control, determine compliance status and confidence.
        """
        results = {}
        
        for control_id, control_info in self.controls.items():
            evidence_items = self.evidence_map.get(control_id, [])
            
            if not evidence_items:
                # No evidence found
                status = "Non-compliant"
                confidence = 0.9  # High confidence that it's non-compliant (nothing found)
                evidence_strength = 0
            else:
                # Analyze the collected evidence
                evidence_strength = self._evaluate_evidence_strength(evidence_items, control_info)
                
                if evidence_strength >= 0.7:
                    status = "Compliant"
                    confidence = min(0.9, evidence_strength)
                elif evidence_strength >= 0.3:
                    status = "Partial"
                    confidence = 0.7
                else:
                    status = "Non-compliant"
                    confidence = 0.8
            
            # Store results
            results[control_id] = {
                "control_id": control_id,
                "domain": control_info["domain"],
                "subdomain": control_info["subdomain"],
                "description": control_info["description"],
                "status": status,
                "confidence": confidence,
                "evidence_strength": evidence_strength,
                "evidence_count": len(evidence_items),
                "evidence_items": evidence_items
            }
        
        self.assessment_results = results
        return results
    
    def _evaluate_evidence_strength(self, evidence_items, control_info):
        """
        Evaluate the strength of the collected evidence for a control.
        This is a simplified version for the POC.
        """
        if not evidence_items:
            return 0
        
        # Get the average confidence of the evidence items
        avg_confidence = sum(item["confidence"] for item in evidence_items) / len(evidence_items)
        
        # Check for evidence diversity (different document types)
        doc_types = set(item["document_type"] for item in evidence_items if item["document_type"] != "unknown")
        type_diversity = min(1.0, len(doc_types) / 3)  # Normalize to max of 1.0
        
        # Check for required evidence types
        required_count = 0
        for req in control_info["required_evidence"]:
            # Check if any evidence context contains this required element
            if any(req.lower() in item["context"].lower() for item in evidence_items):
                required_count += 1
        
        required_coverage = required_count / len(control_info["required_evidence"])
        
        # Calculate overall strength (weighted average)
        strength = (
            avg_confidence * 0.4 +
            type_diversity * 0.3 +
            required_coverage * 0.3
        )
        
        return strength
    
    def generate_recommendations(self):
        """
        Generate recommendations based on the assessment results.
        For non-compliant and partially compliant controls, provide
        specific recommendations.
        """
        recommendations = []
        
        for control_id, result in self.assessment_results.items():
            if result["status"] == "Non-compliant":
                recommendations.append({
                    "control_id": control_id,
                    "priority": "High" if control_id in ["2-11-1", "4-1-1"] else "Medium",
                    "recommendation": f"Implement {self.controls[control_id]['description']}",
                    "details": self._generate_recommendation_details(control_id, result),
                    "expected_improvement": "10-15%" if control_id in ["2-11-1", "4-1-1"] else "5-10%"
                })
            elif result["status"] == "Partial":
                recommendations.append({
                    "control_id": control_id,
                    "priority": "Medium",
                    "recommendation": f"Enhance {self.controls[control_id]['description']}",
                    "details": self._generate_recommendation_details(control_id, result),
                    "expected_improvement": "5-10%"
                })
        
        return sorted(recommendations, key=lambda x: {"High": 0, "Medium": 1, "Low": 2}[x["priority"]])
    
    def _generate_recommendation_details(self, control_id, result):
        """Generate specific recommendation details based on the assessment."""
        control_info = self.controls[control_id]
        
        if result["status"] == "Non-compliant":
            missing_evidence = control_info["required_evidence"]
            recommendation = f"Develop and implement {control_info['description']}. "
            recommendation += f"Documentation should include: {', '.join(missing_evidence)}."
            
        elif result["status"] == "Partial":
            # Identify what evidence is missing
            found_evidence = set()
            for item in result["evidence_items"]:
                for req in control_info["required_evidence"]:
                    if req.lower() in item["context"].lower():
                        found_evidence.add(req)
            
            missing_evidence = [req for req in control_info["required_evidence"] if req not in found_evidence]
            
            if missing_evidence:
                recommendation = f"Enhance existing documentation with: {', '.join(missing_evidence)}."
            else:
                recommendation = f"Strengthen implementation evidence for {control_info['description']}."
        
        return recommendation
    
    def get_overall_compliance(self):
        """Calculate the overall compliance score."""
        if not self.assessment_results:
            return 0
        
        # Calculate score based on control statuses
        statuses = [result["status"] for result in self.assessment_results.values()]
        compliant_count = statuses.count("Compliant")
        partial_count = statuses.count("Partial")
        total_controls = len(self.assessment_results)
        
        # Calculate percentage (each partial counts as 0.5)
        score = (compliant_count + (partial_count * 0.5)) / total_controls * 100
        return round(score, 2)
    
    def get_domain_scores(self):
        """Calculate scores for each domain."""
        if not self.assessment_results:
            return {}
        
        domain_scores = defaultdict(list)
        
        # Group results by domain
        for result in self.assessment_results.values():
            domain = result["domain"]
            status = result["status"]
            
            # Convert status to a numeric value
            if status == "Compliant":
                score = 1.0
            elif status == "Partial":
                score = 0.5
            else:
                score = 0.0
                
            domain_scores[domain].append(score)
        
        # Calculate average score for each domain
        return {
            domain: round(sum(scores) / len(scores) * 100, 2)
            for domain, scores in domain_scores.items()
        }
    
    def export_results_to_json(self, output_path):
        """Export assessment results to a JSON file."""
        if not self.assessment_results:
            self.generate_assessment()
        
        overall_compliance = self.get_overall_compliance()
        recommendations = self.generate_recommendations()
        
        export_data = {
            "overall_compliance": overall_compliance,
            "assessment_date": pd.Timestamp.now().strftime("%Y-%m-%d"),
            "controls_assessed": len(self.assessment_results),
            "documents_analyzed": len(self.analyzed_documents),
            "control_results": self.assessment_results,
            "recommendations": recommendations
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2)
        
        return output_path

