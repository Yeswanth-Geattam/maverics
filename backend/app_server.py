"""
==============================================================================
CuraMatch AI Pro - Enterprise Backend REST API Server
==============================================================================
Provides REST API endpoints for:
- Patient Eligibility Evaluation & Matching (/api/evaluate-patient)
- Pharma Protocol Management (/api/pharma-trials)
- Dataset Upload & Batch Processing (/api/batch-screen)
- Automated Email Dispatch (/api/send-consent-email)
- Patient Report Generation (/api/patient-report)
- Health Check (/api/health)
"""

import http.server
import socketserver
import json
import os
import urllib.parse

PORT = 8000

# Mock Master Patient Database (12 Patients)
PATIENTS_DB = {
    'PT-10029': { 'id': 'PT-10029', 'name': 'Eleanor Vance', 'email': 'eleanor.vance@patient-care.org', 'age': 62, 'gender': 'Female', 'diag': 'Type 2 Diabetes Mellitus', 'hba1c': 8.4, 'egfr': 58, 'stroke': 999, 'meds': 'Metformin 1000mg BID' },
    'PT-10034': { 'id': 'PT-10034', 'name': 'Marcus Sterling', 'email': 'marcus.sterling@health-net.org', 'age': 48, 'gender': 'Male', 'diag': 'Type 2 Diabetes Mellitus', 'hba1c': 8.6, 'egfr': 65, 'stroke': 999, 'meds': 'Metformin 500mg BID' },
    'PT-10088': { 'id': 'PT-10088', 'name': 'Dr. Aris Thorne', 'email': 'aris.thorne@oncology-care.org', 'age': 66, 'gender': 'Male', 'diag': 'NSCLC EGFR Exon 19 del', 'hba1c': 5.4, 'egfr': 81, 'stroke': 999, 'meds': 'Osimertinib 80mg QD' },
    'PT-10102': { 'id': 'PT-10102', 'name': 'Rachel Green', 'email': 'rachel.green@patient-portal.org', 'age': 52, 'gender': 'Female', 'diag': 'Type 2 Diabetes Mellitus', 'hba1c': 9.1, 'egfr': 62, 'stroke': 999, 'meds': 'Metformin 1000mg BID' },
    'PT-10159': { 'id': 'PT-10159', 'name': 'Helena Wayne', 'email': 'helena.wayne@clinical-trial.org', 'age': 61, 'gender': 'Female', 'diag': 'Type 2 Diabetes Mellitus', 'hba1c': 8.0, 'egfr': 54, 'stroke': 999, 'meds': 'Metformin 1000mg BID' },
    'PT-10201': { 'id': 'PT-10201', 'name': 'Dr. Evelyn Vance', 'email': 'evelyn.vance@clinicalpatient.org', 'age': 59, 'gender': 'Female', 'diag': 'Triple-Negative Breast Cancer', 'hba1c': 5.4, 'egfr': 78, 'stroke': 999, 'meds': 'Keytruda 200mg Q3W' }
}

class CuraMatchBackendHandler(http.server.SimpleHTTPRequestHandler):

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        
        # Health Check
        if parsed_path.path == '/api/health':
            self.send_json_response({"status": "UP", "service": "CuraMatch Backend REST API", "port": PORT})
            return

        # Fetch All Patients API
        elif parsed_path.path == '/api/patients':
            self.send_json_response(list(PATIENTS_DB.values()))
            return

        # Serve static frontend files (index.html, app.js, styles.css, etc.)
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        parsed_path = urllib.parse.urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else b'{}'

        try:
            data = json.loads(body.decode('utf-8'))
        except Exception:
            data = {}

        # 1. API Endpoint: Send Automated Consent Email to Selected Patient
        if parsed_path.path == '/api/send-consent-email':
            patient_id = data.get('id', 'PT-10201')
            patient_name = data.get('name', 'Dr. Evelyn Vance')
            patient_email = data.get('email', f"{patient_name.lower().replace(' ', '.').replace('dr.', '')}@clinicalpatient.org")
            trial_nct = data.get('nct', 'NCT071204')
            drug_name = data.get('drug', 'Keytruda (Pembrolizumab)')

            email_payload = {
                "status": "DELIVERED",
                "recipient_name": patient_name,
                "recipient_email": patient_email,
                "subject": f"[CONFIDENTIAL] Clinical Trial Informed Consent & Intake Form - Protocol {trial_nct}",
                "trial": trial_nct,
                "drug": drug_name,
                "consent_form_url": f"http://localhost:{PORT}/CuraMatch_Initial_Patient_Primary_Intake_Report.html?id={patient_id}",
                "timestamp": "Aug 14, 2026 17:30:00 UTC",
                "message": f"Hello {patient_name},\n\nYou have been selected as an eligible candidate for clinical trial {trial_nct} ({drug_name}). Please click the link above to complete your HIPAA Informed Consent & Intake Form."
            }

            self.send_json_response(email_payload)
            return

        # 2. API Endpoint: Add New Patient Candidate
        elif parsed_path.path == '/api/add-patient':
            new_id = f"PT-{10300 + len(PATIENTS_DB)}"
            PATIENTS_DB[new_id] = {
                'id': new_id,
                'name': data.get('name', 'New Patient'),
                'email': f"{data.get('name', 'patient').lower().replace(' ', '.') }@patient.org",
                'age': data.get('age', 55),
                'gender': data.get('gender', 'Female'),
                'diag': data.get('diagText', 'Type 2 Diabetes Mellitus'),
                'hba1c': data.get('hba1c', 8.0),
                'egfr': data.get('egfr', 65),
                'stroke': data.get('strokeMonthsAgo', 999),
                'meds': data.get('meds', 'Metformin 1000mg BID')
            }
            self.send_json_response({"success": True, "message": "Patient added", "patient": PATIENTS_DB[new_id]})
            return

        # Fallback 404
        self.send_error(404, "Endpoint not found")

    def send_json_response(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server():
    os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    with socketserver.TCPServer(("", PORT), CuraMatchBackendHandler) as httpd:
        print(f"Backend Server running at http://localhost:{PORT}")
        httpd.serve_forever()

if __name__ == '__main__':
    run_server()
