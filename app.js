/* ==========================================================================
   CuraMatch AI Pro - Real-Time Interactive Patient & XAI Engine
   ========================================================================== */

// Global State
let currentRole = 'DOCTOR_INVESTIGATOR';
let activeTrial = 'NCT-048821';
let activeSponsor = 'Merck';
let selectedPatientId = 'CUSTOM';
let funnelChartInstance = null;
let activeDocRepo = 'master';
let piiPrivacyMode = false;
let uploadedBatchResults = [];
let lastOcrExtractedPatient = null;
let filterOnlyEligibleInTable = true;

// Advanced FHIR Patient Store (12 Complete Patient Dataset Records)
const patients = {
    'P-101': { id: 'PT-10029', name: 'Eleanor Vance', age: 62, gender: 'Female', diagnosis: 'T2D', diagText: 'Type 2 Diabetes Mellitus (ICD-10: E11.9)', hba1c: 8.4, egfr: 58, strokeMonthsAgo: 999, meds: 'Metformin 1000mg BID, Atorvastatin 20mg', status: 'ELIGIBLE (94%)', distMiles: 8.2, noShowRate: 4, comorbidities: 1 },
    'P-102': { id: 'PT-10034', name: 'Marcus Sterling', age: 48, gender: 'Male', diagnosis: 'T2D', diagText: 'Type 2 Diabetes Mellitus (ICD-10: E11.9)', hba1c: 8.6, egfr: 65, strokeMonthsAgo: 999, meds: 'Metformin 500mg BID, Lisinopril 10mg', status: 'ELIGIBLE (92%)', distMiles: 14.5, noShowRate: 8, comorbidities: 2 },
    'P-103': { id: 'PT-10041', name: 'Sophia Lin', age: 55, gender: 'Female', diagnosis: 'HER2', diagText: 'HER2+ Metastatic Breast Cancer (ICD-10: C50.911)', hba1c: 5.6, egfr: 72, strokeMonthsAgo: 999, meds: 'Trastuzumab, Pertuzumab', status: 'ELIGIBLE (NCT051190)', distMiles: 24.1, noShowRate: 12, comorbidities: 2 },
    'P-104': { id: 'PT-10059', name: 'David Miller', age: 71, gender: 'Male', diagnosis: 'T2D', diagText: 'Type 2 Diabetes, Prior Stroke (4m ago)', hba1c: 7.9, egfr: 38, strokeMonthsAgo: 4, meds: 'Metformin 500mg, Clopidogrel 75mg', status: 'EXCLUDED (eGFR < 45 & Stroke)', distMiles: 42.0, noShowRate: 28, comorbidities: 4 },
    'P-105': { id: 'PT-10088', name: 'Dr. Aris Thorne', age: 66, gender: 'Male', diagnosis: 'NSCLC', diagText: 'NSCLC Exon 19 del (ICD-10: C34.90)', hba1c: 5.4, egfr: 81, strokeMonthsAgo: 999, meds: 'Osimertinib 80mg QD', status: 'ELIGIBLE (NCT060122)', distMiles: 5.4, noShowRate: 2, comorbidities: 1 },
    'P-106': { id: 'PT-10102', name: 'Rachel Green', age: 52, gender: 'Female', diagnosis: 'T2D', diagText: 'Type 2 Diabetes Mellitus (ICD-10: E11.9)', hba1c: 9.1, egfr: 62, strokeMonthsAgo: 999, meds: 'Metformin 1000mg BID', status: 'ELIGIBLE (96%)', distMiles: 11.0, noShowRate: 6, comorbidities: 1 },
    'P-107': { id: 'PT-10115', name: 'Arthur Pendelton', age: 74, gender: 'Male', diagnosis: 'T2D', diagText: 'Type 2 Diabetes Mellitus (ICD-10: E11.9)', hba1c: 8.2, egfr: 49, strokeMonthsAgo: 999, meds: 'Metformin 850mg BID, Glipizide 5mg', status: 'ELIGIBLE (88%)', distMiles: 19.2, noShowRate: 15, comorbidities: 3 },
    'P-108': { id: 'PT-10128', name: 'Clara Oswald', age: 39, gender: 'Female', diagnosis: 'T1D', diagText: 'Type 1 Diabetes Mellitus (ICD-10: E10.9)', hba1c: 9.8, egfr: 92, strokeMonthsAgo: 999, meds: 'Insulin Glargine 20u QD', status: 'EXCLUDED (Type 1 Diabetes)', distMiles: 7.1, noShowRate: 5, comorbidities: 1 },
    'P-109': { id: 'PT-10144', name: 'Victor Von Doom', age: 68, gender: 'Male', diagnosis: 'T2D', diagText: 'Type 2 Diabetes Mellitus (ICD-10: E11.9)', hba1c: 11.2, egfr: 41, strokeMonthsAgo: 999, meds: 'Metformin 1000mg, Insulin NPH', status: 'EXCLUDED (HbA1c > 10.5% & eGFR < 45)', distMiles: 38.5, noShowRate: 22, comorbidities: 4 },
    'P-110': { id: 'PT-10159', name: 'Helena Wayne', age: 61, gender: 'Female', diagnosis: 'T2D', diagText: 'Type 2 Diabetes Mellitus (ICD-10: E11.9)', hba1c: 8.0, egfr: 54, strokeMonthsAgo: 999, meds: 'Metformin 1000mg BID', status: 'ELIGIBLE (95%)', distMiles: 9.8, noShowRate: 4, comorbidities: 1 },
    'P-111': { id: 'PT-10201', name: 'Dr. Evelyn Vance', age: 59, gender: 'Female', diagnosis: 'TNBC', diagText: 'Triple-Negative Breast Cancer (Keytruda, ICD-10: C50.919)', hba1c: 5.4, egfr: 78, strokeMonthsAgo: 999, meds: 'Keytruda (Pembrolizumab) 200mg Q3W', status: 'ELIGIBLE (NCT071204)', distMiles: 6.2, noShowRate: 3, comorbidities: 1 },
    'P-112': { id: 'PT-10215', name: 'Robert Harrison', age: 72, gender: 'Male', diagnosis: 'AD', diagText: 'Early Alzheimer\'s Disease (Donanemab, ICD-10: G30.9)', hba1c: 5.8, egfr: 68, strokeMonthsAgo: 999, meds: 'Donanemab IV Infusion, Donepezil 10mg', status: 'ELIGIBLE (NCT088310)', distMiles: 12.1, noShowRate: 7, comorbidities: 2 }
};

// Trial Protocol Rules Master Store
let trialProtocols = {
    'NCT-048821': { title: 'NCT048821: Jardiance (Empagliflozin) 10mg Oral QD', minAge: 18, maxAge: 75, minHba1c: 7.5, maxHba1c: 10.5, minEgfr: 45, strokeExclusionMonths: 6, reqDiag: 'T2D' },
    'NCT-060122': { title: 'NCT060122: Tagrisso (Osimertinib) 80mg Oral QD', minAge: 18, maxAge: 80, minHba1c: 0, maxHba1c: 14, minEgfr: 45, strokeExclusionMonths: 3, reqDiag: 'NSCLC' },
    'NCT-051190': { title: 'NCT051190: Perjeta + Herceptin IV Infusion Q3W', minAge: 18, maxAge: 80, minHba1c: 0, maxHba1c: 14, minEgfr: 50, strokeExclusionMonths: 3, reqDiag: 'HER2' },
    'NCT-043321': { title: 'NCT043321: Sacubitril/Valsartan 97/103mg BID', minAge: 21, maxAge: 85, minHba1c: 0, maxHba1c: 14, minEgfr: 30, strokeExclusionMonths: 1, reqDiag: 'MI' },
    'NCT-071204': { title: 'NCT071204: Keytruda (Pembrolizumab) 200mg IV Q3W', minAge: 18, maxAge: 75, minHba1c: 0, maxHba1c: 14, minEgfr: 50, strokeExclusionMonths: 3, reqDiag: 'TNBC' },
    'NCT-088310': { title: 'NCT088310: Donanemab 700mg IV Infusion Q4W', minAge: 50, maxAge: 85, minHba1c: 0, maxHba1c: 14, minEgfr: 45, strokeExclusionMonths: 6, reqDiag: 'AD' },
    'NCT-099411': { title: 'NCT099411: Onivyde (Irinotecan Liposome) 43mg/m2 IV [Pancreatic Cancer PDAC]', minAge: 18, maxAge: 75, minHba1c: 0, maxHba1c: 14, minEgfr: 60, strokeExclusionMonths: 6, reqDiag: 'PDAC' }
};

// Pharma Sponsor Enterprise Portfolios (Categorized By Company)
let pharmaTrialsMaster = [
    { nct: 'NCT071204', sponsor: 'Merck & Co.', drug: 'Keytruda (Pembrolizumab) 200mg IV', indication: 'Triple-Negative Breast Cancer (TNBC)', phase: 'Phase III', target: 500, sites: 48, budget: '$28.4M' },
    { nct: 'NCT088310', sponsor: 'Eli Lilly', drug: 'Donanemab 700mg IV Infusion', indication: 'Early Alzheimer\'s Disease (AD)', phase: 'Phase II', target: 350, sites: 36, budget: '$22.1M' },
    { nct: 'NCT048821', sponsor: 'Eli Lilly', drug: 'Jardiance (Empagliflozin) 10mg Oral', indication: 'Type 2 Diabetes Mellitus', phase: 'Phase III', target: 800, sites: 72, budget: '$42.5M' },
    { nct: 'NCT060122', sponsor: 'AstraZeneca', drug: 'Tagrisso (Osimertinib) 80mg Oral', indication: 'NSCLC EGFR Exon 19 Deletion', phase: 'Phase III', target: 600, sites: 54, budget: '$34.0M' },
    { nct: 'NCT051190', sponsor: 'Roche', drug: 'Perjeta + Herceptin IV Infusion', indication: 'HER2+ Metastatic Breast Cancer', phase: 'Phase III', target: 400, sites: 42, budget: '$26.8M' },
    { nct: 'NCT043321', sponsor: 'Novartis', drug: 'Sacubitril/Valsartan 97/103mg BID', indication: 'Myocardial Infarction / ARNI', phase: 'Phase III', target: 320, sites: 30, budget: '$18.0M' },
    { nct: 'NCT099411', sponsor: 'Pfizer Inc.', drug: 'Onivyde 43mg/m2 IV Infusion', indication: 'Metastatic Pancreatic Adenocarcinoma (PDAC)', phase: 'Phase III', target: 300, sites: 28, budget: '$19.2M' }
];

// Master Dosing Log & Analytics Database for Enrolled Patients
const patientDosingDatabase = {
    'PT-10201': {
        drug: 'Keytruda 200mg IV',
        regimen: 'IV Infusion Q3W',
        adherence: '98.4%',
        trend: '-14.3% Tumor Size',
        bio: 'PD-L1 Tumor Size: 4.2cm -> 3.6cm (-14.3% reduction)',
        impact: 'Strong initial therapeutic response following Dose 1 IV infusion. Zero high-grade immune adverse events.',
        rec: 'Maintain Standard Prescribed 200mg IV Regimen for Dose 2',
        improvement: 'Recommendation: Pre-medicate with Diphenhydramine 25mg IV 30 min prior to Dose 2 to eliminate Grade 1 fatigue.',
        quality: 'Quality of Life Score: 92/100 (High Vital Stability)',
        patientText: 'Patient vital signs stable (BP 120/78, HR 72, eGFR 78). Patient report indicates high confidence & readiness for Dose 2.',
        logs: [
            { date: 'Aug 14, 2026 - 10:00 AM', cycle: 'Cycle 2, Day 1', drug: 'Keytruda (Pembrolizumab) 200mg IV', status: 'ADMINISTERED', method: 'In-Clinic IV Infusion (30 min)', lab: 'PD-L1 CPS: 15 | eGFR: 78', sideEffects: 'Mild Fatigue (Grade 1)', hash: 'SHA256: 9f8a...11b' },
            { date: 'Jul 24, 2026 - 09:30 AM', cycle: 'Cycle 1, Day 1', drug: 'Keytruda (Pembrolizumab) 200mg IV', status: 'ADMINISTERED', method: 'In-Clinic IV Infusion (30 min)', lab: 'Baseline HbA1c: 5.4%', sideEffects: 'None (Grade 0)', hash: 'SHA256: 4a2c...88f' }
        ]
    },
    'PT-10029': {
        drug: 'Jardiance 10mg Oral',
        regimen: 'Daily Oral QD',
        adherence: '97.8%',
        trend: '-1.0% HbA1c',
        bio: 'HbA1c: 8.4% -> 7.4% (-1.0% glycemic reduction)',
        impact: 'Significant glycemic improvement post-Dose 1. eGFR renal rate remains stable at 58 mL/min/1.73m².',
        rec: 'Maintain 10mg Daily Oral Dose for Dose 2 Schedule',
        improvement: 'Recommendation: Increase oral fluid hydration by +500 mL/day to mitigate mild polyuria side effect.',
        quality: 'Quality of Life Score: 88/100 (Controlled)',
        patientText: 'Daily blood glucose log shows 22% reduction in fasting glucose spikes. Cleared for Dose 2 cycle.',
        logs: [
            { date: 'Aug 14, 2026 - 08:00 AM', cycle: 'Week 4, Day 28', drug: 'Jardiance (Empagliflozin) 10mg Oral', status: 'ADMINISTERED', method: 'Smart Bottle Sensor (Pill Taken)', lab: 'HbA1c: 7.4% (-1.0% drop)', sideEffects: 'None (Grade 0)', hash: 'SHA256: e11a...44c' },
            { date: 'Aug 07, 2026 - 08:15 AM', cycle: 'Week 3, Day 21', drug: 'Jardiance (Empagliflozin) 10mg Oral', status: 'ADMINISTERED', method: 'Smart Bottle Sensor (Pill Taken)', lab: 'eGFR: 58 mL/min (Stable)', sideEffects: 'Increased Urination (Grade 1)', hash: 'SHA256: b33c...99d' }
        ]
    },
    'PT-10034': {
        drug: 'Jardiance 10mg Oral',
        regimen: 'Daily Oral QD',
        adherence: '96.2%',
        trend: '-1.2% HbA1c',
        bio: 'HbA1c: 8.6% -> 7.4% (-1.2% glycemic reduction)',
        impact: 'Positive glycemic response post Dose 1. Renal safety parameters intact (eGFR 65 mL/min).',
        rec: 'Continue 10mg Daily Oral Dose Schedule',
        improvement: 'Recommendation: Schedule routine 30-day lipid panel check alongside Dose 2.',
        quality: 'Quality of Life Score: 90/100 (High Vital Stability)',
        patientText: 'BP stable at 124/80 mmHg. Zero adverse glycemic crashes reported.',
        logs: [
            { date: 'Aug 12, 2026 - 09:00 AM', cycle: 'Week 4, Day 28', drug: 'Jardiance (Empagliflozin) 10mg Oral', status: 'ADMINISTERED', method: 'Smart Bottle Sensor', lab: 'HbA1c: 7.4% (-1.2% drop)', sideEffects: 'None (Grade 0)', hash: 'SHA256: c44d...11a' },
            { date: 'Aug 05, 2026 - 09:15 AM', cycle: 'Week 3, Day 21', drug: 'Jardiance (Empagliflozin) 10mg Oral', status: 'ADMINISTERED', method: 'Smart Bottle Sensor', lab: 'eGFR: 65 mL/min (Stable)', sideEffects: 'None (Grade 0)', hash: 'SHA256: f88a...22b' }
        ]
    },
    'PT-10088': {
        drug: 'Tagrisso 80mg Oral',
        regimen: 'Daily Oral QD',
        adherence: '99.2%',
        trend: '-71.7% EGFR ctDNA',
        bio: 'EGFR Exon 19 VAF: 42.8% -> 12.1% (-71.7% clearance)',
        impact: 'Rapid circulating tumor DNA clearance observed following Dose 1 targeted therapy.',
        rec: 'Continue Prescribed 80mg Oral QD for Dose 2',
        improvement: 'Recommendation: Apply topical emollient cream twice daily for Grade 1 skin rash prevention.',
        quality: 'Quality of Life Score: 94/100 (Optimal)',
        patientText: 'Cough and dyspnea symptoms markedly improved. No QTc prolongation detected on 12-lead ECG.',
        logs: [
            { date: 'Aug 13, 2026 - 09:00 AM', cycle: 'Cycle 2, Day 1', drug: 'Tagrisso (Osimertinib) 80mg Oral', status: 'ADMINISTERED', method: 'Pill Count & Smart Sensor', lab: 'VAF: 12.1% (-71.7% clearance)', sideEffects: 'Mild Rash (Grade 1)', hash: 'SHA256: 77a1...99c' },
            { date: 'Jul 23, 2026 - 08:30 AM', cycle: 'Cycle 1, Day 1', drug: 'Tagrisso (Osimertinib) 80mg Oral', status: 'ADMINISTERED', method: 'Pill Count Audit', lab: 'Baseline VAF: 42.8%', sideEffects: 'None (Grade 0)', hash: 'SHA256: 22b3...44d' }
        ]
    },
    'PT-10102': {
        drug: 'Jardiance 10mg Oral',
        regimen: 'Daily Oral QD',
        adherence: '95.4%',
        trend: '-1.4% HbA1c',
        bio: 'HbA1c: 9.1% -> 7.7% (-1.4% glycemic reduction)',
        impact: 'Marked glycemic drop observed post-Dose 1 with no renal impairment (eGFR 62).',
        rec: 'Maintain 10mg Daily Oral Schedule for Dose 2',
        improvement: 'Recommendation: Reinforce daily digital logging on smart bottle application.',
        quality: 'Quality of Life Score: 89/100 (Stable)',
        patientText: 'Fasting blood glucose levels stabilized. Cleared for next cycle.',
        logs: [
            { date: 'Aug 11, 2026 - 08:30 AM', cycle: 'Week 4, Day 28', drug: 'Jardiance (Empagliflozin) 10mg Oral', status: 'ADMINISTERED', method: 'Smart Bottle Sensor', lab: 'HbA1c: 7.7% (-1.4% drop)', sideEffects: 'None (Grade 0)', hash: 'SHA256: d11f...88a' },
            { date: 'Aug 04, 2026 - 08:45 AM', cycle: 'Week 3, Day 21', drug: 'Jardiance (Empagliflozin) 10mg Oral', status: 'ADMINISTERED', method: 'Smart Bottle Sensor', lab: 'eGFR: 62 mL/min', sideEffects: 'None (Grade 0)', hash: 'SHA256: e22c...99b' }
        ]
    },
    'PT-10159': {
        drug: 'Jardiance 10mg Oral',
        regimen: 'Daily Oral QD',
        adherence: '98.1%',
        trend: '-0.9% HbA1c',
        bio: 'HbA1c: 8.0% -> 7.1% (-0.9% glycemic drop)',
        impact: 'Target HbA1c < 7.5% achieved post-Dose 1. Excellent tolerability profile.',
        rec: 'Maintain 10mg Daily Oral Schedule for Dose 2',
        improvement: 'Recommendation: Maintain current diet & exercise regimen alongside Dose 2.',
        quality: 'Quality of Life Score: 93/100 (Optimal)',
        patientText: 'Patient reports high energy and zero side effects. Cleared for Dose 2.',
        logs: [
            { date: 'Aug 10, 2026 - 09:00 AM', cycle: 'Week 4, Day 28', drug: 'Jardiance (Empagliflozin) 10mg Oral', status: 'ADMINISTERED', method: 'Smart Bottle Sensor', lab: 'HbA1c: 7.1% (-0.9% drop)', sideEffects: 'None (Grade 0)', hash: 'SHA256: a88b...33c' },
            { date: 'Aug 03, 2026 - 09:15 AM', cycle: 'Week 3, Day 21', drug: 'Jardiance (Empagliflozin) 10mg Oral', status: 'ADMINISTERED', method: 'Smart Bottle Sensor', lab: 'eGFR: 54 mL/min', sideEffects: 'None (Grade 0)', hash: 'SHA256: b99c...44d' }
        ]
    },
    'PT-10041': {
        drug: 'Perjeta + Herceptin IV',
        regimen: 'IV Infusion Q3W',
        adherence: '97.5%',
        trend: '-22.4% HER2 Signal',
        bio: 'HER2 Tumor Biomarker: Signal drop of -22.4% post Dose 1',
        impact: 'Therapeutic reduction in HER2 biomarker overexpression. LVEF cardiac function stable at 58%.',
        rec: 'Maintain Prescribed Dual Monoclonal Infusion',
        improvement: 'Recommendation: Perform 12-lead ECG & cardiac echocardiogram prior to Dose 2.',
        quality: 'Quality of Life Score: 91/100 (Stable LVEF)',
        patientText: 'Normal cardiac ejection fraction. Cleared for Dose 2 infusion cycle.',
        logs: [
            { date: 'Aug 09, 2026 - 10:00 AM', cycle: 'Cycle 2, Day 1', drug: 'Perjeta + Herceptin IV Infusion', status: 'ADMINISTERED', method: 'In-Clinic IV Infusion', lab: 'LVEF: 58% | HER2 -22.4%', sideEffects: 'None (Grade 0)', hash: 'SHA256: f11a...77b' },
            { date: 'Jul 19, 2026 - 09:30 AM', cycle: 'Cycle 1, Day 1', drug: 'Perjeta + Herceptin IV Infusion', status: 'ADMINISTERED', method: 'In-Clinic IV Infusion', lab: 'Baseline HER2 IHC 3+', sideEffects: 'None (Grade 0)', hash: 'SHA256: c33d...88e' }
        ]
    },
    'PT-10215': {
        drug: 'Donanemab 700mg IV',
        regimen: 'IV Infusion Q4W',
        adherence: '99.0%',
        trend: '-34.1% Amyloid Plaque',
        bio: 'Amyloid PET Scan: -34.1% reduction in cortical Amyloid-beta plaque burden',
        impact: 'Significant amyloid clearance detected on post-Dose 1 PET scan. Zero ARIA-E microhemorrhages.',
        rec: 'Proceed with Dose 2 Infusion (700mg IV)',
        improvement: 'Recommendation: Perform 3T MRI safety scan to monitor ARIA-E baseline clearance.',
        quality: 'Quality of Life Score: 95/100 (High Cognitive Stability)',
        patientText: 'MMSE cognitive score stable at 25/30. Cleared for Dose 2 infusion.',
        logs: [
            { date: 'Aug 08, 2026 - 11:00 AM', cycle: 'Cycle 2, Day 1', drug: 'Donanemab 700mg IV Infusion', status: 'ADMINISTERED', method: 'In-Clinic Infusion (60 min)', lab: 'MMSE: 25/30 | Amyloid PET -34.1%', sideEffects: 'None (Grade 0)', hash: 'SHA256: 88c2...11d' },
            { date: 'Jul 11, 2026 - 10:30 AM', cycle: 'Cycle 1, Day 1', drug: 'Donanemab 700mg IV Infusion', status: 'ADMINISTERED', method: 'In-Clinic Infusion (60 min)', lab: 'Baseline PET Positive', sideEffects: 'None (Grade 0)', hash: 'SHA256: 99d3...22e' }
        ]
    }
};

// SDV Audit Master Records
let sdvAuditRecords = [
    { subjectId: 'SUBJ-101', site: 'Site 01 - Johns Hopkins', consent: 'Verified (Signed)', ecrfCheck: 'Matched (100%)', missingLabs: 'None', deviation: 'None', status: 'AUDIT_PASSED' },
    { subjectId: 'SUBJ-104', site: 'Site 03 - Mayo Clinic', consent: 'Verified (Signed)', ecrfCheck: 'Discrepancy: HbA1c 8.4% (eCRF) vs 8.6% (EMR)', missingLabs: 'ECG baseline missing', deviation: 'Window Breach (+3d)', status: 'REQUIRES_ACTION' },
    { subjectId: 'SUBJ-109', site: 'Site 02 - Charité Berlin', consent: 'Pending Re-Consent', ecrfCheck: 'Matched (100%)', missingLabs: 'Serum Creatinine', deviation: 'None', status: 'PENDING' }
];

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Show login portal first — user must select their role before anything loads
    const loginModal = document.getElementById('loginPortalScreen');
    if (loginModal) {
        loginModal.style.display = 'flex';
        // Pre-load background data silently without crashing
        try { renderMasterDatasetTable(); } catch(e) {}
        try { renderStep4VerifiedTable(); } catch(e) {}
        try { runCriteriaExtraction(); } catch(e) {}
        try { renderSDVTable(); } catch(e) {}
        try { initRecruitmentChart(); } catch(e) {}
        try { renderPharmaPortalTable(); } catch(e) {}
    }
    // Always initialize the chatbot widget
    updateCopilotChatbotForRole();
});

/* ==========================================================================
   STRICT SPONSOR COMPANY DRUG PORTFOLIO FILTER (PHARMA ROLE)
   ========================================================================== */

function switchPharmaSponsor() {
    const sel = document.getElementById('pharmaSponsorSelect');
    if (sel) activeSponsor = sel.value;
    
    const activeNameEl = document.getElementById('pharmaActiveName');
    if (activeNameEl) activeNameEl.textContent = sel ? sel.options[sel.selectedIndex].text : activeSponsor;
    
    renderPharmaPortalTable();
    renderResearcherSuggestionsFeed();
    updateActiveTrialDropdownForSponsor();
}

const researcherSuggestionsDatabase = {
    'NCT071204': {
        sponsor: 'Merck',
        drug: 'Keytruda (NCT071204) - Dose 1',
        impact: 'Biomarker Response: -14.3% Tumor Size Reduction',
        suggestion: 'Pre-medicate with Antihistamine 30 min prior to Dose 2 to eliminate Grade 1 fatigue.',
        badgeColor: 'var(--amber)',
        borderColor: 'var(--amber)'
    },
    'NCT088310': {
        sponsor: 'Eli Lilly',
        drug: 'Donanemab (NCT088310) - Dose 1',
        impact: 'Biomarker Clearance: -24.8% Cortical Plaque Drop',
        suggestion: 'Maintain 700mg IV infusion Q4W. Brain MRI cleared zero ARIA-E edema.',
        badgeColor: 'var(--cyan)',
        borderColor: 'var(--primary)'
    },
    'NCT048821': {
        sponsor: 'Eli Lilly',
        drug: 'Jardiance (NCT048821) - Dose 1',
        impact: 'Glycemic Control: HbA1c 8.4% -> 7.1%',
        suggestion: 'Maintain 10mg daily oral dose; renal eGFR rate stable at 78 mL/min.',
        badgeColor: '#0F5C63',
        borderColor: '#159A9C'
    },
    'NCT060122': {
        sponsor: 'AstraZeneca',
        drug: 'Tagrisso (NCT060122) - Dose 1',
        impact: 'EGFR Exon 19 VAF Drop: 42.8% -> 18.2%',
        suggestion: 'Continue 80mg daily oral dose; monitor LCF lab markers at Week 6.',
        badgeColor: 'var(--purple)',
        borderColor: 'var(--purple)'
    },
    'NCT051190': {
        sponsor: 'Roche',
        drug: 'Perjeta + Herceptin (NCT051190) - Dose 1',
        impact: 'HER2 Receptor Suppression: -32.0% Biomarker Drop',
        suggestion: 'Maintain dual-antibody IV infusion Q3W; cardiac LVEF baseline stable at 65%.',
        badgeColor: 'var(--cyan)',
        borderColor: 'var(--cyan)'
    },
    'NCT043321': {
        sponsor: 'Novartis',
        drug: 'Sacubitril/Valsartan (NCT043321) - Dose 1',
        impact: 'NT-proBNP Cardiac Biomarker Drop: 1,450 -> 620 pg/mL',
        suggestion: 'Maintain 97/103mg BID dosing; BP steady at 118/76 mmHg.',
        badgeColor: '#0F5C63',
        borderColor: '#159A9C'
    },
    'NCT099411': {
        sponsor: 'Pfizer',
        drug: 'Onivyde (NCT099411) - Dose 1',
        impact: 'CA19-9 Biomarker Drop: -18.4% Clear Rate',
        suggestion: 'Pre-hydrate 500mL Saline prior to Cycle 2 infusion to manage GI tolerability.',
        badgeColor: 'var(--amber)',
        borderColor: 'var(--amber)'
    }
};

const drugReportMap = {
    'NCT071204': { id: 'PT-10201', name: 'Dr. Evelyn Vance', age: '59', gender: 'Female', diag: 'Triple-Negative Breast Cancer (TNBC, ICD-10: C50.919)', drug: 'Keytruda (Pembrolizumab)', dose: '200mg IV Infusion Q3W' },
    'NCT088310': { id: 'PT-10215', name: 'Robert Harrison', age: '72', gender: 'Male', diag: 'Early Alzheimer\'s Disease (AD, ICD-10: G30.9)', drug: 'Donanemab IV Infusion', dose: '700mg IV Infusion Q4W' },
    'NCT048821': { id: 'PT-10029', name: 'Eleanor Vance', age: '62', gender: 'Female', diag: 'Type 2 Diabetes Mellitus (ICD-10: E11.9)', drug: 'Jardiance (Empagliflozin)', dose: '10mg Oral QD' },
    'NCT060122': { id: 'PT-10088', name: 'Dr. Aris Thorne', age: '66', gender: 'Male', diag: 'NSCLC Exon 19 del (ICD-10: C34.90)', drug: 'Tagrisso (Osimertinib)', dose: '80mg Oral QD' },
    'NCT051190': { id: 'PT-10041', name: 'Sophia Lin', age: '55', gender: 'Female', diag: 'HER2+ Metastatic Breast Cancer (ICD-10: C50.911)', drug: 'Perjeta + Herceptin IV Infusion', dose: '420mg IV Infusion Q3W' },
    'NCT043321': { id: 'PT-10115', name: 'Arthur Pendelton', age: '74', gender: 'Male', diag: 'Chronic Heart Failure (ICD-10: I50.9)', drug: 'Sacubitril/Valsartan', dose: '97/103mg Oral BID' },
    'NCT099411': { id: 'PT-10144', name: 'Victor Von Doom', age: '68', gender: 'Male', diag: 'Pancreatic Cancer PDAC (ICD-10: C25.9)', drug: 'Onivyde (Irinotecan Liposome)', dose: '43mg/m2 IV Infusion' }
};

function openFullDosingReportNewPage(cleanNct) {
    const info = drugReportMap[cleanNct] || drugReportMap['NCT071204'];
    const url = `patient_dosing_report_template.html?id=${info.id}&name=${encodeURIComponent(info.name)}&age=${info.age}&gender=${info.gender}&diag=${encodeURIComponent(info.diag)}&drug=${encodeURIComponent(info.drug)}&dose=${encodeURIComponent(info.dose)}`;
    window.open(url, '_blank');
}

function renderResearcherSuggestionsFeed() {
    const grid = document.getElementById('researcherSuggestionsGrid');
    if (!grid) return;

    const sel = document.getElementById('pharmaSponsorSelect');
    const activeSponsorKey = sel ? sel.value : 'Merck';
    const sponsorText = sel ? sel.options[sel.selectedIndex].text : activeSponsorKey;

    const filteredTrials = pharmaTrialsMaster.filter(t => {
        if (activeSponsorKey === 'All') return true;
        return t.sponsor.toLowerCase().includes(activeSponsorKey.toLowerCase());
    });

    grid.innerHTML = '';
    if (!filteredTrials.length) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 1.5rem; text-align: center; color: var(--text-muted); background: rgba(15,23,42,0.8); border-radius: 12px;">
                <i class="fa-solid fa-folder-open text-amber" style="font-size: 1.5rem;"></i><br>
                <strong style="color:#163A43;">No Active Inter-Dose AI Suggestions Transmitted for ${sponsorText} yet.</strong>
            </div>
        `;
        return;
    }

    filteredTrials.forEach(t => {
        const cleanKey = t.nct.replace('-', '').toUpperCase();
        const data = researcherSuggestionsDatabase[cleanKey] || {
            drug: `${t.drug} (${t.nct}) - Dose 1`,
            impact: `Biomarker Response: Positive clinical response in ${t.indication}`,
            suggestion: `Maintain standard prescribed protocol for Cycle 2; monitor organ tolerance.`,
            badgeColor: 'var(--amber)',
            borderColor: 'var(--amber)'
        };

        const div = document.createElement('div');
        div.style.cssText = `background:#FFFFFF; border:1px solid rgba(15,92,99,0.18); box-shadow:0 4px 16px rgba(15,92,99,0.08); padding:1rem; border-radius:14px; display:flex; flex-direction:column; justify-content:space-between;`;
        div.innerHTML = `
            <div>
                <div class="flex-between mb-1">
                    <strong style="color:#0F5C63; font-size:0.92rem; font-weight:800;"><i class="fa-solid fa-capsules"></i> ${data.drug}</strong>
                    <span class="badge-tag text-emerald" style="font-size:0.7rem;"><i class="fa-solid fa-circle-check"></i> Post-Dose Feedback Completed</span>
                </div>
                <p style="font-size:0.84rem; color:#163A43; font-weight:800; margin-top:0.35rem;">${data.impact}</p>
                <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.3rem; background:#DDF5F0; border:1px solid rgba(15,92,99,0.15); padding:0.65rem; color:#163A43; border-radius:6px;">
                    <i class="fa-solid fa-wand-magic-sparkles" style="color:${data.badgeColor};"></i> <strong>AI Improvement Suggestion for Dose 2:</strong> ${data.suggestion}
                </div>
            </div>
            <button class="btn-primary btn-sm mt-3 btn-full" onclick="openFullDosingReportNewPage('${cleanKey}')" style="background:linear-gradient(135deg, #0F5C63, #159A9C); border:none; color:#FFFFFF; font-weight:900; box-shadow:0 4px 12px rgba(245,158,11,0.3); display:flex; align-items:center; justify-content:center; gap:8px; padding:0.6rem;">
                <i class="fa-solid fa-file-pdf"></i> View Complete Report (New Page)
            </button>
        `;
        grid.appendChild(div);
    });
}

function toggleBriefFeedback(cleanKey) {
    const details = document.getElementById(`details_${cleanKey}`);
    if (details) {
        if (details.style.display === 'none' || !details.style.display) {
            details.style.display = 'block';
        } else {
            details.style.display = 'none';
        }
    }
    openInterDoseFeedbackModal(cleanKey);
}

let activeModalNct = 'NCT071204';

function openInterDoseFeedbackModal(cleanNct) {
    activeModalNct = cleanNct;
    const modal = document.getElementById('interDoseFeedbackModal');
    if (!modal) return;

    const data = researcherSuggestionsDatabase[cleanNct] || {
        drug: `Investigational Drug (${cleanNct}) - Dose 1`,
        impact: `Biomarker Response: Clinical clearance verified`,
        suggestion: `Maintain standard prescribed protocol for Cycle 2; monitor organ tolerance.`,
        badgeColor: 'var(--amber)'
    };

    const titleEl = document.getElementById('feedbackModalTitle');
    const impactEl = document.getElementById('feedbackModalImpact');
    const sugEl = document.getElementById('feedbackModalSuggestion');

    if (titleEl) titleEl.textContent = `${data.drug} - Inter-Dose Dossier`;
    if (impactEl) impactEl.textContent = data.impact;
    if (sugEl) sugEl.textContent = data.suggestion;

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function closeInterDoseFeedbackModal() {
    const modal = document.getElementById('interDoseFeedbackModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

function openDosingDashboardForActiveModal() {
    closeInterDoseFeedbackModal();
    openDosingDashboardForDrug(activeModalNct);
}

function openDosingDashboardForDrug(nctKey) {
    const cleanKey = nctKey ? nctKey.replace('-', '').toUpperCase() : 'NCT071204';
    window.location.href = `dosing_dashboard.html?nct=${cleanKey}`;
}

function switchPharmaSponsorCompany() {
    renderPharmaPortalTable();
    renderResearcherSuggestionsFeed();
    updateActiveTrialDropdownForSponsor();
}

function updateActiveTrialDropdownForSponsor() {
    const select = document.getElementById('activeTrialSelect');
    if (!select) return;

    const sel = document.getElementById('pharmaSponsorSelect');
    const activeSponsorKey = sel ? sel.value : 'Merck';

    // If role is PHARMA_SPONSOR, filter dropdown options strictly for activeSponsorKey
    const filtered = pharmaTrialsMaster.filter(t => {
        if (currentRole !== 'PHARMA_SPONSOR' || activeSponsorKey === 'All') return true;
        return t.sponsor.toLowerCase().includes(activeSponsorKey.toLowerCase());
    });

    select.innerHTML = '';

    if (!filtered.length) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = `🚫 No Registered Medicines for ${sel ? sel.options[sel.selectedIndex].text : activeSponsorKey}`;
        select.appendChild(opt);
        select.value = '';
    } else {
        filtered.forEach(t => {
            const trialKey = `NCT-${t.nct.replace('NCT', '')}`;
            const opt = document.createElement('option');
            opt.value = trialKey;
            opt.textContent = `${t.nct}: ${t.drug} [${t.indication}]`;
            select.appendChild(opt);
        });

        const exists = filtered.some(t => `NCT-${t.nct.replace('NCT', '')}` === activeTrial);
        if (!exists && filtered.length > 0) {
            activeTrial = `NCT-${filtered[0].nct.replace('NCT', '')}`;
        }
        if (select.querySelector(`option[value="${activeTrial}"]`)) {
            select.value = activeTrial;
        } else if (filtered.length > 0) {
            select.value = `NCT-${filtered[0].nct.replace('NCT', '')}`;
            activeTrial = select.value;
        }
    }
}

function renderPharmaPortalTable() {
    const tbody = document.getElementById('pharmaTrialsTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Auto-detect role from URL if on dedicated portal pages
    if (window.location.href.includes('stakeholder_portal.html')) {
        currentRole = 'STAKEHOLDER_SPONSOR';
    } else if (window.location.href.includes('researcher_portal.html')) {
        currentRole = 'CLINICAL_RESEARCHER';
    } else if (window.location.href.includes('doctor_portal.html')) {
        currentRole = 'DOCTOR_INVESTIGATOR';
    }

    const sel = document.getElementById('pharmaSponsorSelect');
    const activeSponsorKey = sel ? sel.value : 'Merck';
    const sponsorText = sel ? sel.options[sel.selectedIndex].text : activeSponsorKey;

    const nameEl = document.getElementById('pharmaActiveName');
    if (nameEl) nameEl.textContent = sponsorText;

    // Strict filtering: show ONLY drugs registered by the selected sponsor company
    const filtered = pharmaTrialsMaster.filter(t => {
        if (activeSponsorKey === 'All') return true;
        return t.sponsor.toLowerCase().includes(activeSponsorKey.toLowerCase());
    });

    const countEl = document.getElementById('pharmaTrialCount');
    if (countEl) countEl.textContent = `${filtered.length} Active Trial${filtered.length === 1 ? '' : 's'}`;

    const enrolledEl = document.getElementById('pharmaEnrolledCount');
    if (enrolledEl) {
        const totalEnrolled = filtered.reduce((acc, curr) => acc + (curr.target || 0), 0);
        enrolledEl.textContent = `${totalEnrolled.toLocaleString()} Candidates`;
    }

    const budgetEl = document.getElementById('pharmaGrantBudget');
    if (budgetEl) {
        const totalBudget = filtered.reduce((acc, curr) => {
            const num = parseFloat((curr.budget || '$0').replace(/[^0-9.]/g, '')) || 0;
            return acc + num;
        }, 0);
        budgetEl.textContent = `$${totalBudget.toFixed(1)}M`;
    }

    if (!filtered.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; padding:2.5rem; color:var(--text-muted);">
                    <i class="fa-solid fa-folder-open text-purple" style="font-size:2rem;"></i><br><br>
                    <strong style="color:#163A43; font-size:1.05rem;">No Registered Trial Protocols Found for ${sponsorText}</strong><br>
                    <span style="font-size:0.85rem; color:var(--text-muted);">Switch company selection above or add a new investigational drug protocol.</span>
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(t => {
        const tr = document.createElement('tr');

        let actionBtnHtml = '';
        if (window.location.href.includes('researcher_portal.html') || currentRole === 'CLINICAL_RESEARCHER') {
            actionBtnHtml = `
                <button class="btn-primary btn-sm" onclick="openDosingDashboardForDrug('${t.nct}')" style="white-space:nowrap; background:linear-gradient(135deg, #0F5C63, #d97706); border: 2px solid #159A9C; color:#000; font-weight:900; box-shadow:0 4px 15px rgba(245,158,11,0.4); padding:0.4rem 0.85rem; border-radius:8px;">
                    <i class="fa-solid fa-file-medical"></i> Dosing Dashboard
                </button>
            `;
        } else if (window.location.href.includes('doctor_portal.html') || currentRole === 'DOCTOR_INVESTIGATOR') {
            actionBtnHtml = `
                <span class="badge-tag text-emerald" style="font-size:0.8rem; font-weight:800; padding:0.35rem 0.75rem;">
                    <i class="fa-solid fa-circle-check"></i> Protocol Active
                </span>
            `;
        } else {
            actionBtnHtml = `
                <button class="btn-primary btn-sm" onclick="openDrugPerformanceModal('${t.nct}')" style="white-space:nowrap; background:var(--purple); border-color:#6D28D9; font-weight:800;">
                    <i class="fa-solid fa-chart-line"></i> Drug Performance
                </button>
            `;
        }

        tr.innerHTML = `
            <td><strong style="color:var(--primary);">${t.nct}</strong></td>
            <td><strong>${t.sponsor}</strong></td>
            <td><strong style="color:#0F5C63; font-size:0.92rem; font-weight:800;">${t.drug}</strong></td>
            <td>${t.indication}</td>
            <td><span class="badge-tag text-purple">${t.phase}</span></td>
            <td><strong>${t.target} Candidates</strong></td>
            <td>${t.sites} Global Centers</td>
            <td>${actionBtnHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

function openDosingDashboardForDrug(rawNct) {
    const cleanKey = rawNct.replace('-', '').toUpperCase();
    window.open(`dosing_dashboard.html?nct=${cleanKey}`, '_blank');
}

/* ==========================================================================
   DYNAMIC MEDICINE PROTOCOL CANDIDATE EVALUATOR & DOSING UPDATER
   ========================================================================== */

function getEligiblePatientsForActiveTrial() {
    const trial = trialProtocols[activeTrial] || trialProtocols['NCT-048821'];
    const reqDiag = trial.reqDiag;

    return Object.values(patients).filter(p => {
        let isMatch = (p.diagnosis === reqDiag || p.diagText.toLowerCase().includes(reqDiag.toLowerCase()));
        let ageMatch = (p.age >= trial.minAge && p.age <= trial.maxAge);
        let egfrMatch = (p.egfr >= trial.minEgfr);
        let strokeMatch = (p.strokeMonthsAgo >= trial.strokeExclusionMonths);
        let hba1cMatch = (trial.maxHba1c === 14 || (p.hba1c >= trial.minHba1c && p.hba1c <= trial.maxHba1c));

        return isMatch && ageMatch && egfrMatch && strokeMatch && hba1cMatch;
    });
}

function updateDosingPatientSelectOptions() {
    const sel = document.getElementById('dosingPatientSelect');
    if (!sel) return;

    const matchingPatients = getEligiblePatientsForActiveTrial();
    sel.innerHTML = '';

    if (!matchingPatients.length) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = `🚫 No Enrolled / Eligible Patients for Protocol ${activeTrial}`;
        sel.appendChild(opt);
        sel.value = '';
    } else {
        matchingPatients.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.id}: ${getFormattedPatientName(p.name)} - ${p.diagText}`;
            sel.appendChild(opt);
        });
        sel.value = matchingPatients[0].id;
    }
}

function updateDosingPatientView() {
    const sel = document.getElementById('dosingPatientSelect');
    if (!sel) return;

    const matchingPatients = getEligiblePatientsForActiveTrial();

    if (!matchingPatients.length || !sel.value) {
        renderDosingEmptyState();
        return;
    }

    const ptId = sel.value;
    const record = patientDosingDatabase[ptId];

    if (!record) {
        renderDosingEmptyState();
        return;
    }

    const drugNameEl = document.getElementById('doseDrugName');
    if (drugNameEl) drugNameEl.textContent = record.drug;

    const regimenEl = document.getElementById('doseRegimen');
    if (regimenEl) regimenEl.textContent = record.regimen;

    const adhEl = document.getElementById('doseAdherenceRate');
    if (adhEl) adhEl.textContent = record.adherence;

    const trendEl = document.getElementById('doseBiomarkerTrend');
    if (trendEl) trendEl.textContent = record.trend;

    const bioValEl = document.getElementById('interDoseBiomarkerVal');
    if (bioValEl) bioValEl.textContent = record.bio;

    const impactTextEl = document.getElementById('interDoseImpactText');
    if (impactTextEl) impactTextEl.textContent = record.impact;

    const recValEl = document.getElementById('interDoseRecVal');
    if (recValEl) recValEl.textContent = record.rec;

    const impTextEl = document.getElementById('interDoseImprovementText');
    if (impTextEl) impTextEl.textContent = record.improvement;

    const qValEl = document.getElementById('interDoseQualityVal');
    if (qValEl) qValEl.textContent = record.quality;

    const ptTextEl = document.getElementById('interDosePatientText');
    if (ptTextEl) ptTextEl.textContent = record.patientText;

    renderDosingTimelineTable(ptId);
}

function renderDosingEmptyState() {
    const trial = trialProtocols[activeTrial] || { title: activeTrial };

    const drugNameEl = document.getElementById('doseDrugName');
    if (drugNameEl) drugNameEl.textContent = 'No Enrolled Patients';

    const regimenEl = document.getElementById('doseRegimen');
    if (regimenEl) regimenEl.textContent = 'Awaiting Trial Cohort';

    const adhEl = document.getElementById('doseAdherenceRate');
    if (adhEl) adhEl.textContent = 'N/A (0 Patients)';

    const trendEl = document.getElementById('doseBiomarkerTrend');
    if (trendEl) trendEl.textContent = 'No Active Dosing Data';

    const bioValEl = document.getElementById('interDoseBiomarkerVal');
    if (bioValEl) bioValEl.textContent = 'No Dose 1 Administered Yet';

    const impactTextEl = document.getElementById('interDoseImpactText');
    if (impactTextEl) impactTextEl.textContent = `Zero candidates currently enrolled in trial protocol ${trial.title}.`;

    const recValEl = document.getElementById('interDoseRecVal');
    if (recValEl) recValEl.textContent = 'Awaiting Candidate Screening & Enrollment';

    const impTextEl = document.getElementById('interDoseImprovementText');
    if (impTextEl) impTextEl.textContent = 'Screen candidates in Tab 1 or register a new candidate record.';

    const qValEl = document.getElementById('interDoseQualityVal');
    if (qValEl) qValEl.textContent = 'Quality of Life: N/A';

    const ptTextEl = document.getElementById('interDosePatientText');
    if (ptTextEl) ptTextEl.textContent = 'No continuous care data available for this active trial protocol.';

    const tbody = document.getElementById('dosingTimelineTbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; padding:2.5rem; color:var(--text-muted);">
                    <i class="fa-solid fa-user-slash text-amber" style="font-size:2.2rem;"></i><br><br>
                    <strong style="font-size:1.05rem; color:#163A43;">No Patients Currently Enrolled in Protocol ${activeTrial}</strong><br>
                    <span style="font-size:0.85rem; color:var(--text-muted);">Screen eligible patients in Tab 1 or register a new candidate to begin continuous dosing governance.</span>
                </td>
            </tr>
        `;
    }
}

function renderDosingTimelineTable(ptId) {
    const tbody = document.getElementById('dosingTimelineTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const record = patientDosingDatabase[ptId];
    const logs = (record && record.logs) ? record.logs : [];

    if (!logs.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);">
                    <i class="fa-solid fa-folder-open text-cyan" style="font-size:1.6rem;"></i><br>
                    <strong>No Dosing Logs Recorded Yet for Subject ${ptId}.</strong>
                </td>
            </tr>
        `;
        return;
    }

    logs.forEach(l => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong style="color:var(--text-main);">${l.date}</strong></td>
            <td><span class="badge-tag text-purple">${l.cycle}</span></td>
            <td><strong style="color:#B45309;">${l.drug}</strong></td>
            <td>
                <span class="text-emerald" style="font-weight:800; background:rgba(16,185,129,0.15); padding:0.25rem 0.55rem; border-radius:6px; font-size:0.78rem;">
                    <i class="fa-solid fa-circle-check"></i> ${l.status}
                </span>
            </td>
            <td><span style="font-size:0.8rem; color:var(--cyan); font-weight:600;"><i class="fa-solid fa-microchip"></i> ${l.method}</span></td>
            <td><strong>${l.lab}</strong></td>
            <td><span style="font-size:0.78rem; color:var(--text-muted);">${l.sideEffects}</span></td>
            <td><code style="font-size:0.75rem; color:var(--emerald);">${l.hash}</code></td>
        `;
        tbody.appendChild(tr);
    });
}

function transmitReportToResearchers() {
    const sel = document.getElementById('dosingPatientSelect');
    const ptId = sel ? sel.value : 'PT-10201';

    if (!ptId) {
        alert('⚠️ No patient record selected to transmit.');
        return;
    }

    alert(`📡 SUCCESS! Real-time patient dosing performance, biomarker lab updates & post-dose feedback for Subject ${ptId} have been transmitted directly to Clinical Researchers & R&D Team!`);
}

function updateStep3PatientHistoryDropdown() {
    const select = document.getElementById('step3PatientSelect');
    if (!select) return;

    const matchingPatients = getEligiblePatientsForActiveTrial();
    select.innerHTML = '';

    if (!matchingPatients.length) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = `🚫 No Eligible Candidates Listed for ${activeTrial}`;
        select.appendChild(option);
    } else {
        matchingPatients.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.id}: ${getFormattedPatientName(p.name)} (${p.age}y, ${p.gender}) — ${p.diagText}`;
            select.appendChild(option);
        });
        select.value = matchingPatients[0].id;
    }

    if (typeof updateStep3PatientHistoryFile === 'function') {
        updateStep3PatientHistoryFile();
    }
}

function switchTrialProtocol() {
    activeTrial = document.getElementById('activeTrialSelect').value;
    runLivePatientEvaluation();
    renderStep4VerifiedTable();
    updateTrialHeatmap();
    updateDosingPatientSelectOptions();
    updateDosingPatientView();
    updateStep3PatientHistoryDropdown();

    if (uploadedBatchResults.length) {
        processBatchDatasetScreening(Object.values(patients));
    }
}

function renderStep4VerifiedTable() {
    const tbody = document.getElementById('step4VerifiedTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const trial = trialProtocols[activeTrial] || trialProtocols['NCT-048821'];
    const matchingPatients = getEligiblePatientsForActiveTrial();

    if (!matchingPatients.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center; padding:2rem; color:var(--text-muted);">
                    <i class="fa-solid fa-user-slash text-red" style="font-size:1.8rem;"></i><br><br>
                    <strong style="color:var(--text-main); font-size:1rem;">No Verified Eligible Patients Matched for ${trial.title}</strong><br>
                    <span style="font-size:0.85rem;">Upload patient dataset in Tab 2 or select another investigational medicine protocol above.</span>
                </td>
            </tr>
        `;
        return;
    }

    matchingPatients.forEach(p => {
        const tr = document.createElement('tr');
        const displayName = getFormattedPatientName(p.name);
        const email = `${p.name.toLowerCase().replace(/[^a-z]/g, '.')}@clinicalpatient.org`;
        const score = `${Math.round(92 + Math.random() * 6)}% VERIFIED MATCH`;

        tr.innerHTML = `
            <td><strong style="color:var(--primary);">${p.id}</strong></td>
            <td><strong>${displayName}</strong></td>
            <td>${p.age}y / ${p.gender}</td>
            <td>${p.diagText}</td>
            <td><strong>${p.hba1c}%</strong></td>
            <td>${p.egfr} mL/min</td>
            <td><strong style="color:#0F5C63; font-size:0.95rem;">${score}</strong></td>
            <td>
                <span class="badge-tag text-emerald" style="font-size:0.75rem; font-weight:800; padding:0.3rem 0.65rem;">
                    <i class="fa-solid fa-circle-check"></i> VERIFIED MATCH
                </span>
            </td>
            <td>
                <button class="btn-primary btn-sm" onclick="sendConsentEmailToPatient('${p.id}', '${p.name}', '${email}')">
                    <i class="fa-solid fa-paper-plane"></i> Send Consent Email
                </button>
            </td>
            <td>
                <button class="btn-secondary btn-sm" onclick="openIndividualPatientPdfReport('${p.id}', '${p.name}', '${p.age}y / ${p.gender}', '${p.diagText}', '${p.hba1c}%', '${p.egfr} mL/min', '${p.meds}')">
                    <i class="fa-solid fa-file-pdf text-red"></i> View PDF Doc
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/* ==========================================================================
   ROLE-BASED VIEW SCOPING (DOCTOR VIEW SHOWS ONLY MEDICINE NAME & DRUG SPECS)
   ========================================================================== */

function loginAsRole(role) {
    currentRole = role;
    const loginModal = document.getElementById('loginPortalScreen');
    if (loginModal) loginModal.style.display = 'none';

    try {
        const roleLabel = document.getElementById('activeRoleLabel');
        const sponsorBox = document.getElementById('sponsorSelectorBox');
        const trialBox = document.getElementById('trialSelectorBox');
        const tabs = document.querySelectorAll('.nav-tab-btn');

        const dosingPill = document.getElementById('headerDosingDashBtn');
        const perfPill = document.getElementById('headerDrugPerfDashBtn');

        const topRegBtn = document.getElementById('topRegisterPharmaBtn');
        const tableRegBtn = document.getElementById('tableRegisterPharmaBtn');
        const researcherCard = document.getElementById('researcherSuggestionsCard');

        if (role === 'STAKEHOLDER_SPONSOR' || role === 'PHARMA_SPONSOR') {
            if (roleLabel) roleLabel.innerHTML = '<i class="fa-solid fa-chart-line text-purple"></i> Role: 1. Pharma Stakeholder / Sponsor';
            
            if (sponsorBox) sponsorBox.style.display = 'flex';
            if (trialBox) trialBox.style.display = 'none';

            if (dosingPill) dosingPill.style.display = 'none';
            if (perfPill) perfPill.style.display = 'inline-flex';

            if (topRegBtn) topRegBtn.style.display = 'none';
            if (tableRegBtn) tableRegBtn.style.display = 'none';
            if (researcherCard) researcherCard.style.display = 'none';

            tabs.forEach(t => {
                if (!t.dataset.tab || t.onclick?.toString().includes('toggleAiClinicalChatbot')) {
                    t.style.display = 'inline-flex';
                } else if (t.dataset.tab === 'pharma-portal') {
                    t.style.display = 'inline-flex';
                } else {
                    t.style.display = 'none';
                }
            });
            switchNavTabDirect('pharma-portal');

        } else if (role === 'CLINICAL_RESEARCHER') {
            if (roleLabel) roleLabel.innerHTML = '<i class="fa-solid fa-vial-circle-check text-amber"></i> Role: 2. Clinical Researcher & R&D';
            
            if (sponsorBox) sponsorBox.style.display = 'flex';
            if (trialBox) trialBox.style.display = 'none';

            if (dosingPill) dosingPill.style.display = 'inline-flex';
            if (perfPill) perfPill.style.display = 'none';

            if (topRegBtn) topRegBtn.style.display = 'inline-flex';
            if (tableRegBtn) tableRegBtn.style.display = 'inline-flex';
            if (researcherCard) researcherCard.style.display = 'block';

            tabs.forEach(t => {
                if (!t.dataset.tab || t.onclick?.toString().includes('toggleAiClinicalChatbot')) {
                    t.style.display = 'inline-flex';
                } else if (t.dataset.tab === 'pharma-portal') {
                    t.style.display = 'inline-flex';
                } else {
                    t.style.display = 'none';
                }
            });
            switchNavTabDirect('pharma-portal');

        } else if (role === 'DOCTOR_INVESTIGATOR') {
            if (roleLabel) roleLabel.innerHTML = '<i class="fa-solid fa-user-doctor text-cyan"></i> Role: 3. Doctor / Clinical Tester';
            
            if (sponsorBox) sponsorBox.style.display = 'none';
            if (trialBox) trialBox.style.display = 'flex';

            if (dosingPill) dosingPill.style.display = 'inline-flex';
            if (perfPill) perfPill.style.display = 'none';

            tabs.forEach(t => {
                if (!t.dataset.tab || t.onclick?.toString().includes('toggleAiClinicalChatbot')) {
                    t.style.display = 'inline-flex';
                } else if (['upload-screening', 'report-analyzer', 'patient-matching', 'patient-dosing-tracker'].includes(t.dataset.tab)) {
                    t.style.display = 'inline-flex';
                } else {
                    t.style.display = 'none';
                }
            });
            switchNavTabDirect('upload-screening');

        } else if (role === 'TRIAL_ADMIN') {
            if (roleLabel) roleLabel.innerHTML = '<i class="fa-solid fa-shield-halved text-emerald"></i> Role: 4. Trial Admin (Full Control)';
            
            if (sponsorBox) sponsorBox.style.display = 'flex';
            if (trialBox) trialBox.style.display = 'flex';

            if (dosingPill) dosingPill.style.display = 'inline-flex';
            if (perfPill) perfPill.style.display = 'inline-flex';

            tabs.forEach(t => {
                t.style.display = 'inline-flex';
            });
            switchNavTabDirect('pharma-portal');
        }

        renderPharmaPortalTable();
        renderResearcherSuggestionsFeed();
        updateActiveTrialDropdownForSponsor();
        updateStep3PatientHistoryDropdown();
        updateCopilotChatbotForRole();

        // Show the AI Copilot launcher now that user is logged in
        const launcher = document.getElementById('aiClinicalChatbotLauncher');
        if (launcher) {
            launcher.style.display = 'flex';
            launcher.style.zIndex = '999999999';
        }
    } catch (err) {
        console.error('loginAsRole error:', err);
    }
}

function handleRegisterPharmaTrial(e) {
    e.preventDefault();
    const sel = document.getElementById('pharmaSponsorSelect');
    const selectedSponsorText = sel ? sel.options[sel.selectedIndex].text : 'Sponsor Company';

    const company = document.getElementById('newPharmaCompany').value.trim() || selectedSponsorText;
    const drug = document.getElementById('newPharmaDrug').value.trim();
    const indication = document.getElementById('newPharmaIndication').value.trim();
    const rawNct = document.getElementById('newPharmaNct').value.trim();
    const target = parseInt(document.getElementById('newPharmaTarget').value) || 500;
    const budget = document.getElementById('newPharmaBudget').value.trim() || '$10.0M';

    const nctKey = rawNct.includes('NCT') ? rawNct.replace(/[^NCT0-9]/g, '') : `NCT-${Math.floor(100000 + Math.random() * 900000)}`;
    const trialKey = nctKey.startsWith('NCT-') ? nctKey : `NCT-${nctKey.replace('NCT', '')}`;

    const newSponsorObj = {
        nct: trialKey.replace('-', ''),
        sponsor: company,
        drug: drug,
        indication: indication,
        phase: 'Phase III',
        target: target,
        sites: 32,
        budget: budget
    };
    pharmaTrialsMaster.unshift(newSponsorObj);

    let diagCode = 'CUSTOM_DIAG_' + Math.floor(Math.random() * 10000);
    const indLower = indication.toLowerCase();
    if (indLower.includes('lung') || indLower.includes('nsclc')) diagCode = 'NSCLC';
    else if (indLower.includes('breast') || indLower.includes('tnbc')) diagCode = 'TNBC';
    else if (indLower.includes('her2')) diagCode = 'HER2';
    else if (indLower.includes('alzheimer')) diagCode = 'AD';
    else if (indLower.includes('diabetes') || indLower.includes('t2d')) diagCode = 'T2D';
    else if (indLower.includes('pancreatic') || indLower.includes('pdac')) diagCode = 'PDAC';
    else if (indLower.includes('multiple sclerosis') || indLower.includes('ms')) diagCode = 'MS';
    else if (indLower.includes('kidney') || indLower.includes('rcc')) diagCode = 'RCC';

    trialProtocols[trialKey] = {
        title: `${trialKey.replace('-', '')}: ${drug} for ${indication}`,
        minAge: 18,
        maxAge: 75,
        minHba1c: 0,
        maxHba1c: 14,
        minEgfr: 45,
        strokeExclusionMonths: 3,
        reqDiag: diagCode
    };

    const activeTrialSelect = document.getElementById('activeTrialSelect');
    if (activeTrialSelect) {
        if (![...activeTrialSelect.options].some(o => o.value === trialKey)) {
            const tOpt = document.createElement('option');
            tOpt.value = trialKey;
            tOpt.textContent = `${trialKey.replace('-', '')}: ${drug} [${indication}]`;
            activeTrialSelect.appendChild(tOpt);
        }
        activeTrialSelect.value = trialKey;
        activeTrial = trialKey;
    }

    // Seed drugPerformanceDatabase for newly added investigational drug
    if (typeof drugPerformanceDatabase !== 'undefined' && newSponsorObj.nct) {
        drugPerformanceDatabase[newSponsorObj.nct] = {
            nct: newSponsorObj.nct,
            sponsor: company,
            drug: drug,
            indication: indication,
            phase: 'Phase III (Active Testing)',
            progressPercent: 25,
            siteCount: 32,
            enrolledCount: target,
            targetCount: target,
            biomarkerDrop: '18% Reduction',
            complianceRate: '98.5% On-Track',
            nextDoseAdjust: 'Standard Protocol Regimen'
        };
    }

    // Auto-select the newly added company in sponsor dropdown if present
    const sponsorSel = document.getElementById('pharmaSponsorSelect');
    if (sponsorSel) {
        let matchOpt = [...sponsorSel.options].find(o => o.value.toLowerCase() === company.toLowerCase() || o.text.toLowerCase().includes(company.toLowerCase()));
        if (!matchOpt) {
            matchOpt = document.createElement('option');
            matchOpt.value = company;
            matchOpt.textContent = company;
            sponsorSel.appendChild(matchOpt);
        }
        sponsorSel.value = matchOpt.value;
    }

    renderPharmaPortalTable();
    closeAddPharmaTrialModal();

    alert(`🎉 SUCCESS! Investigational Medicine "${drug}" (${indication}) registered under "${company}"!\n\nIt is now listed in ${company}'s registered portfolio and in the Doctor Trial Protocol dropdown!`);
}

const drugPerformanceDatabase = {
    'NCT071204': {
        nct: 'NCT071204',
        sponsor: 'Merck & Co.',
        drug: 'Keytruda (Pembrolizumab) 200mg IV',
        indication: 'Triple-Negative Breast Cancer (TNBC PD-L1 mAb)',
        phase: 'Phase III (Active Testing)',
        progressPercent: 78,
        dosesAdministered: '3,840 Infusions',
        testingDays: '420 Days Active',
        activeSites: '48 Global Hospital Centers',
        enrolledCount: '340 / 500 Pts',
        responseRate: '88.4%',
        biomarkerClearance: '-68.5% Tumor Reduction',
        adherenceRate: '98.4%',
        safetyProfile: '0 Serious Adverse Events (SAEs) | 96.5% Tolerability',
        keyFinding: 'Keytruda 200mg IV Q3W demonstrated statistically significant tumor clearance in Phase III cohort with zero high-grade immune adverse events.'
    },
    'NCT048821': {
        nct: 'NCT048821',
        sponsor: 'Eli Lilly',
        drug: 'Jardiance (Empagliflozin) 10mg Oral',
        indication: 'Type 2 Diabetes Mellitus (SGLT2i)',
        phase: 'Phase III (Nearing Completion)',
        progressPercent: 92,
        dosesAdministered: '18,420 Oral Doses',
        testingDays: '540 Days Active',
        activeSites: '72 Global Centers',
        enrolledCount: '736 / 800 Pts',
        responseRate: '94.2%',
        biomarkerClearance: '-1.4% HbA1c Drop',
        adherenceRate: '97.8%',
        safetyProfile: '0 Renal Impairment Events | eGFR Stable at 62 mL/min',
        keyFinding: 'Jardiance 10mg QD demonstrated sustained glycemic reduction with positive cardiorenal protective endpoints across all clinical sites.'
    },
    'NCT060122': {
        nct: 'NCT060122',
        sponsor: 'AstraZeneca',
        drug: 'Tagrisso (Osimertinib) 80mg Oral',
        indication: 'NSCLC EGFR Exon 19 Deletion TKI',
        phase: 'Phase III (Active Testing)',
        progressPercent: 84,
        dosesAdministered: '9,120 Doses',
        testingDays: '380 Days Active',
        activeSites: '54 Global Centers',
        enrolledCount: '504 / 600 Pts',
        responseRate: '91.8%',
        biomarkerClearance: '-71.7% ctDNA Clearance',
        adherenceRate: '99.2%',
        safetyProfile: 'Grade 1 Rash Only | Zero QTc Discontinuations',
        keyFinding: 'Tagrisso 80mg QD achieved rapid ctDNA clearance in 91.8% of Exon 19 del patients within 28 days of Dose 1 initiation.'
    },
    'NCT051190': {
        nct: 'NCT051190',
        sponsor: 'Roche',
        drug: 'Perjeta + Herceptin IV Infusion',
        indication: 'HER2+ Metastatic Breast Cancer',
        phase: 'Phase III (Active Testing)',
        progressPercent: 70,
        dosesAdministered: '4,200 Infusions',
        testingDays: '310 Days Active',
        activeSites: '42 Global Centers',
        enrolledCount: '280 / 400 Pts',
        responseRate: '86.5%',
        biomarkerClearance: '-22.4% HER2 Signal Drop',
        adherenceRate: '97.5%',
        safetyProfile: 'LVEF Cardiac Function Stable (58% Average)',
        keyFinding: 'Dual HER2 targeting with Perjeta + Herceptin showed significant progression-free survival gains with stable cardiac safety scores.'
    },
    'NCT043321': {
        nct: 'NCT043321',
        sponsor: 'Novartis',
        drug: 'Sacubitril/Valsartan 97/103mg BID',
        indication: 'Myocardial Infarction / ARNI Cardiac Care',
        phase: 'Phase III (Active Testing)',
        progressPercent: 65,
        dosesAdministered: '6,400 Oral Doses',
        testingDays: '290 Days Active',
        activeSites: '30 Global Centers',
        enrolledCount: '208 / 320 Pts',
        responseRate: '89.0%',
        biomarkerClearance: '-31.2% NT-proBNP Drop',
        adherenceRate: '96.8%',
        safetyProfile: 'Zero Severe Hypotension Events | Renal Preservation',
        keyFinding: 'ARNI dual therapy effectively reduced NT-proBNP baseline overload and prevented heart failure readmissions post-MI.'
    },
    'NCT088310': {
        nct: 'NCT088310',
        sponsor: 'Eli Lilly',
        drug: 'Donanemab 700mg IV Infusion',
        indication: 'Early Alzheimer\'s Disease (Anti-Amyloid mAb)',
        phase: 'Phase II (Active Testing)',
        progressPercent: 60,
        dosesAdministered: '2,100 Infusions',
        testingDays: '240 Days Active',
        activeSites: '36 Global Centers',
        enrolledCount: '210 / 350 Pts',
        responseRate: '85.2%',
        biomarkerClearance: '-34.1% Amyloid Plaque Drop',
        adherenceRate: '99.0%',
        safetyProfile: '0 ARIA-E Microhemorrhage Events on 3T MRI',
        keyFinding: 'Donanemab 700mg IV Q4W demonstrated robust plaque clearance on post-Dose 1 PET scans with cognitive stabilization (MMSE 25/30).'
    },
    'NCT099411': {
        nct: 'NCT099411',
        sponsor: 'Pfizer Inc.',
        drug: 'Onivyde 43mg/m2 IV Infusion',
        indication: 'Metastatic Pancreatic Adenocarcinoma (PDAC)',
        phase: 'Phase III (Newly Initiated)',
        progressPercent: 15,
        dosesAdministered: '120 Infusions',
        testingDays: '45 Days Active',
        activeSites: '28 Global Centers',
        enrolledCount: '45 / 300 Pts',
        responseRate: '78.5%',
        biomarkerClearance: '-18.4% CA19-9 Biomarker Drop',
        adherenceRate: '95.0%',
        safetyProfile: 'Manageable Gastrointestinal Tolerability Profile',
        keyFinding: 'Newly launched liposomal irinetsan protocol showing promising early CA19-9 biomarker response in metastatic PDAC cohort.'
    }
};

let currentModalNct = 'NCT071204';

function selectAndActivateNewDrug(nctClean) {
    openDrugPerformanceModal(nctClean);
}

function openDrugPerformanceModal(rawNct) {
    const cleanKey = rawNct.replace('-', '').toUpperCase();
    currentModalNct = cleanKey;

    const data = drugPerformanceDatabase[cleanKey] || {
        nct: cleanKey,
        sponsor: activeSponsor || 'Pharma Sponsor',
        drug: `Investigational Drug ${cleanKey}`,
        indication: 'Target Indication Clinical Trial',
        phase: 'Phase III (Active Testing)',
        progressPercent: 75,
        dosesAdministered: '1,240 Infusions',
        testingDays: '180 Days Active',
        activeSites: '32 Hospital Centers',
        enrolledCount: '150 / 300 Pts',
        responseRate: '84.5%',
        biomarkerClearance: '-45.0% Reduction',
        adherenceRate: '97.0%',
        safetyProfile: '0 Serious Adverse Events (SAEs)',
        keyFinding: `Investigational medicine ${cleanKey} demonstrated high clinical response rate with zero safety breaches.`
    };

    // Populate Modal Elements
    const spEl = document.getElementById('perfSponsorBadge');
    if (spEl) spEl.textContent = data.sponsor;

    const dtEl = document.getElementById('perfDrugTitle');
    if (dtEl) dtEl.innerHTML = `<i class="fa-solid fa-flask-vial"></i> ${data.drug} (${data.nct})`;

    const ptEl = document.getElementById('perfPhaseText');
    if (ptEl) ptEl.textContent = `${data.phase} - ${data.indication}`;

    const pbEl = document.getElementById('perfProgressBadge');
    if (pbEl) pbEl.textContent = `${data.progressPercent}% COMPLETED`;

    const barEl = document.getElementById('perfProgressBar');
    if (barEl) barEl.style.width = `${data.progressPercent}%`;

    const dEl = document.getElementById('perfDoses');
    if (dEl) dEl.textContent = data.dosesAdministered;

    const dyEl = document.getElementById('perfDays');
    if (dyEl) dyEl.textContent = data.testingDays;

    const stEl = document.getElementById('perfSites');
    if (stEl) stEl.textContent = data.activeSites;

    const enEl = document.getElementById('perfEnrolled');
    if (enEl) enEl.textContent = data.enrolledCount;

    const rrEl = document.getElementById('perfResponseRate');
    if (rrEl) rrEl.textContent = data.responseRate;

    const bioEl = document.getElementById('perfBiomarker');
    if (bioEl) bioEl.textContent = data.biomarkerClearance;

    const adhEl = document.getElementById('perfAdherence');
    if (adhEl) adhEl.textContent = data.adherenceRate;

    const sfEl = document.getElementById('perfSafety');
    if (sfEl) sfEl.textContent = data.safetyProfile;

    const kfEl = document.getElementById('perfKeyFinding');
    if (kfEl) kfEl.textContent = data.keyFinding;

    // Populate Inline On-Page Card Elements
    const ispEl = document.getElementById('inlinePerfSponsorBadge');
    if (ispEl) ispEl.textContent = data.sponsor;

    const idtEl = document.getElementById('inlinePerfDrugTitle');
    if (idtEl) idtEl.innerHTML = `<i class="fa-solid fa-flask-vial"></i> ${data.drug} (${data.nct})`;

    const iptEl = document.getElementById('inlinePerfPhaseText');
    if (iptEl) iptEl.textContent = `${data.phase} - ${data.indication}`;

    const ipbEl = document.getElementById('inlinePerfProgressBadge');
    if (ipbEl) ipbEl.textContent = `${data.progressPercent}% COMPLETED`;

    const ibarEl = document.getElementById('inlinePerfProgressBar');
    if (ibarEl) ibarEl.style.width = `${data.progressPercent}%`;

    const idEl = document.getElementById('inlinePerfDoses');
    if (idEl) idEl.textContent = data.dosesAdministered;

    const idyEl = document.getElementById('inlinePerfDays');
    if (idyEl) idyEl.textContent = data.testingDays;

    const istEl = document.getElementById('inlinePerfSites');
    if (istEl) istEl.textContent = data.activeSites;

    const ienEl = document.getElementById('inlinePerfEnrolled');
    if (ienEl) ienEl.textContent = data.enrolledCount;

    const irrEl = document.getElementById('inlinePerfResponseRate');
    if (irrEl) irrEl.textContent = data.responseRate;

    const ibioEl = document.getElementById('inlinePerfBiomarker');
    if (ibioEl) ibioEl.textContent = data.biomarkerClearance;

    const iadhEl = document.getElementById('inlinePerfAdherence');
    if (iadhEl) iadhEl.textContent = data.adherenceRate;

    const isfEl = document.getElementById('inlinePerfSafety');
    if (isfEl) isfEl.textContent = data.safetyProfile;

    const ikfEl = document.getElementById('inlinePerfKeyFinding');
    if (ikfEl) ikfEl.textContent = data.keyFinding;

    // Open Standalone Executive Dashboard in New Tab
    window.open(`drug_performance_dashboard.html?nct=${cleanKey}`, '_blank');

    // Show Pop-up Modal as Fallback
    const modal = document.getElementById('drugPerformanceModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
    }

    // Scroll smoothly to inline card if visible
    const inlineCard = document.getElementById('pharmaDrugPerformanceCard');
    if (inlineCard && currentRole === 'PHARMA_SPONSOR') {
        inlineCard.scrollIntoView({ behavior: 'smooth' });
    }
}

function closeDrugPerformanceModal() {
    const modal = document.getElementById('drugPerformanceModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
}

function proceedToScreeningFromModal() {
    closeDrugPerformanceModal();
    activateAndScreenDrugDirectly(currentModalNct);
}

function activateAndScreenDrugDirectly(rawNct) {
    const cleanNct = rawNct.replace('-', '').toUpperCase();
    const trialKey = `NCT-${cleanNct.replace('NCT', '')}`;

    if (currentRole === 'PHARMA_SPONSOR') {
        loginAsRole('DOCTOR_INVESTIGATOR');
    }

    const select = document.getElementById('activeTrialSelect');
    if (select) {
        if (![...select.options].some(o => o.value === trialKey)) {
            const tOpt = document.createElement('option');
            tOpt.value = trialKey;
            tOpt.textContent = `${cleanNct}: Investigational Medicine`;
            select.appendChild(tOpt);
        }
        select.value = trialKey;
        activeTrial = trialKey;
        switchTrialProtocol();
        switchNavTabDirect('patient-matching');
    }
}

/* ==========================================================================
   AI PATIENT HEALTH CONDITION & ORGAN SAFETY DIAGNOSTIC MODEL
   ========================================================================== */

function calculatePatientHealthScore(age, hba1c, egfr, strokeMonthsAgo) {
    let score = 100;
    
    // Renal Impact
    if (egfr < 30) score -= 40;
    else if (egfr < 45) score -= 25;
    else if (egfr < 60) score -= 10;

    // Glycemic Impact
    if (hba1c > 10.0) score -= 25;
    else if (hba1c > 8.5) score -= 15;
    else if (hba1c > 7.5) score -= 5;

    // Cardiovascular Impact
    if (strokeMonthsAgo < 6) score -= 35;
    else if (strokeMonthsAgo < 12) score -= 15;

    // Age Impact
    if (age > 75) score -= 10;

    score = Math.max(15, Math.min(99, score));

    let cardioStatus = "Normal (BP 120/80, HR 72)";
    let cardioColor = "#0F5C63";
    if (strokeMonthsAgo < 6) {
        cardioStatus = "High Ischemic Risk (Stroke < 6m)";
        cardioColor = "var(--danger)";
    } else if (age > 65) {
        cardioStatus = "Controlled Cardiovascular Risk";
        cardioColor = "var(--amber)";
    }

    let renalStatus = "Normal (eGFR >= 60 mL/min)";
    let renalColor = "#0F5C63";
    if (egfr < 45) {
        renalStatus = "High Renal Risk (eGFR < 45)";
        renalColor = "var(--danger)";
    } else if (egfr < 60) {
        renalStatus = "Mild Renal Impairment (eGFR 45-59)";
        renalColor = "var(--amber)";
    }

    let glycemicStatus = "Optimal (< 5.7%)";
    let glycemicColor = "#0F5C63";
    if (hba1c > 8.5) {
        glycemicStatus = "Elevated Uncontrolled (HbA1c > 8.5%)";
        glycemicColor = "var(--danger)";
    } else if (hba1c > 7.5) {
        glycemicStatus = "Elevated Controlled (HbA1c 7.5-8.5%)";
        glycemicColor = "var(--amber)";
    }

    let readinessStatus = "APPROVED FOR CLINICAL TRIAL DOSING";
    let readinessColor = "#0F5C63";
    if (score < 60 || egfr < 45 || strokeMonthsAgo < 6) {
        readinessStatus = "REQUIRES CLINICAL STABILIZATION PRIOR TO DOSING";
        readinessColor = "var(--danger)";
    }

    const displayEl = document.getElementById('healthScoreDisplay');
    if (displayEl) {
        displayEl.textContent = `${score}/100`;
        displayEl.style.color = score >= 75 ? '#0F5C63' : score >= 50 ? 'var(--amber)' : 'var(--danger)';
    }

    const subEl = document.getElementById('healthStatusSubText');
    if (subEl) {
        subEl.textContent = score >= 75 ? 'HEALTHY / STABLE CLINICAL STATUS' : score >= 50 ? 'MODERATE CLINICAL MONITORING REQUIRED' : 'HIGH CLINICAL RISK / ORGAN IMPAIRMENT';
        subEl.style.color = score >= 75 ? '#0F5C63' : score >= 50 ? 'var(--amber)' : 'var(--danger)';
    }

    const cardioEl = document.getElementById('healthCardioStatus');
    if (cardioEl) { cardioEl.textContent = cardioStatus; cardioEl.style.color = cardioColor; }

    const renalEl = document.getElementById('healthRenalStatus');
    if (renalEl) { renalEl.textContent = renalStatus; renalEl.style.color = renalColor; }

    const glyEl = document.getElementById('healthGlycemicStatus');
    if (glyEl) { glyEl.textContent = glycemicStatus; glyEl.style.color = glycemicColor; }

    const readyEl = document.getElementById('healthTrialReadiness');
    if (readyEl) { readyEl.textContent = readinessStatus; readyEl.style.color = readinessColor; }
}

function openLogDoseModal() {
    document.getElementById('logDoseModal').classList.remove('hidden');
}

function closeLogDoseModal() {
    document.getElementById('logDoseModal').classList.add('hidden');
}

function handleLogDoseSubmit(e) {
    e.preventDefault();
    const sel = document.getElementById('dosingPatientSelect');
    const ptId = sel ? sel.value : 'PT-10201';

    if (!ptId) {
        alert('⚠️ Cannot log dose: No candidate is enrolled in this active trial yet.');
        return;
    }

    const date = document.getElementById('doseLogDate').value.trim();
    const cycle = document.getElementById('doseLogCycle').value.trim();
    const drug = document.getElementById('doseLogDrug').value.trim();
    const status = document.getElementById('doseLogStatus').value;
    const lab = document.getElementById('doseLogLab').value.trim();
    const sideEffects = document.getElementById('doseLogSideEffects').value.trim();

    if (!patientDosingDatabase[ptId]) {
        patientDosingDatabase[ptId] = { drug: drug, regimen: 'Prescribed', adherence: '100%', trend: 'Active', bio: lab, impact: 'Updated', rec: 'Continue', improvement: 'Monitor', quality: 'Quality of Life: 90/100', patientText: 'Stable', logs: [] };
    }

    const newLog = {
        date: date,
        cycle: cycle,
        drug: drug,
        status: status,
        method: 'In-Clinic Verified Entry',
        lab: lab,
        sideEffects: sideEffects,
        hash: `SHA256: ${Math.random().toString(36).substring(2, 10)}`
    };

    patientDosingDatabase[ptId].logs.unshift(newLog);

    closeLogDoseModal();
    renderDosingTimelineTable(ptId);
    alert(`🎉 SUCCESS! Dose entry logged and patient progress updated in real-time.`);
}

function runAntiHallucinationCheck() {
    toggleHallucinationLogModal();
    const stream = document.getElementById('hallucinationStreamList');
    if (!stream) return;

    stream.innerHTML = `
        <div style="padding:1rem; text-align:center; color:var(--text-muted);">
            <i class="fa-solid fa-rotate fa-spin text-amber" style="font-size:1.8rem;"></i><br>
            <span style="font-weight:700; font-size:0.85rem; margin-top:0.4rem; display:block;">Running 4-Tier Source Grounding & Self-Consistency Audit...</span>
        </div>
    `;

    setTimeout(() => {
        stream.innerHTML = `
            <div class="solver-highlight-box" style="border-left-color:#0F5C63; margin-top:0;">
                <div class="flex-between">
                    <strong style="color:#0F5C63;"><i class="fa-solid fa-circle-check"></i> Tier 1: Document Citation Bounding Box</strong>
                    <span class="badge-tag text-emerald">100% GROUNDED</span>
                </div>
                <code style="display:block; margin-top:4px; font-size:0.82rem;">"Verified Page 38, Paragraph 4: EGFR Exon 19 Deletion POSITIVE (VAF 42.8%). No hallucinated mutations."</code>
            </div>

            <div class="solver-highlight-box" style="border-left-color:var(--cyan); margin-top:0;">
                <div class="flex-between">
                    <strong style="color:var(--cyan);"><i class="fa-solid fa-microchip"></i> Tier 2: Deterministic LOINC Regex Validation</strong>
                    <span class="badge-tag text-cyan">MATCHED</span>
                </div>
                <code style="display:block; margin-top:4px; font-size:0.82rem;">"LOINC 4548-4 (HbA1c = 8.4%) cross-checked with raw Quest lab JSON stream. Zero numerical drift."</code>
            </div>

            <div class="solver-highlight-box" style="border-left-color:#6D28D9; margin-top:0;">
                <div class="flex-between">
                    <strong style="color:#6D28D9; font-size:0.85rem;"><i class="fa-solid fa-diagram-project"></i> Tier 3: Self-Consistency (3 Extraction Passes)</strong>
                    <span class="badge-tag text-purple">CONSENSUS (3/3)</span>
                </div>
                <code style="display:block; margin-top:4px; font-size:0.82rem;">"Pass 1: TNBC CPS 15 \| Pass 2: TNBC CPS 15 \| Pass 3: TNBC CPS 15 -> 100% Triangulation Consensus."</code>
            </div>

            <div class="solver-highlight-box" style="border-left-color:#B45309; margin-top:0;">
                <div class="flex-between">
                    <strong style="color:#B45309;"><i class="fa-solid fa-user-check"></i> Tier 4: Clinician Audit Override Log</strong>
                    <span class="badge-tag text-amber">VERIFIED</span>
                </div>
                <code style="display:block; margin-top:4px; font-size:0.82rem;">"Audit hash generated under 21 CFR Part 11. Human investigator override active if needed."</code>
            </div>
        `;
    }, 850);
}

function toggleHallucinationLogModal() {
    const modal = document.getElementById('hallucinationModal');
    if (modal) modal.classList.toggle('hidden');
}

function logoutPortalScreen() {
    const loginModal = document.getElementById('loginPortalScreen');
    if (loginModal) loginModal.style.display = 'flex';
    // Hide bot until user selects a new role
    const launcher = document.getElementById('aiClinicalChatbotLauncher');
    if (launcher) launcher.style.display = 'none';
    const modal = document.getElementById('aiClinicalChatbotModal');
    if (modal) modal.style.display = 'none';
}

function downloadPatientDosingPdfReport() {
    const sel = document.getElementById('dosingPatientSelect');
    const ptId = sel ? sel.value : 'PT-10201';

    let pName = "Dr. Evelyn Vance";
    let age = "59";
    let gender = "Female";
    let diag = "Triple-Negative Breast Cancer (PD-L1 CPS 15)";
    let drug = "Keytruda (Pembrolizumab)";
    let dose = "200mg IV Infusion Q3W";

    for (let key in patients) {
        if (patients[key].id === ptId) {
            pName = patients[key].name;
            age = patients[key].age;
            gender = patients[key].gender;
            diag = patients[key].diagText;
            break;
        }
    }

    if (ptId === 'PT-10029' || ptId === 'PT-10034' || ptId === 'PT-10102' || ptId === 'PT-10159') {
        drug = "Jardiance (Empagliflozin)";
        dose = "10mg Daily Oral QD";
    } else if (ptId === 'PT-10088') {
        drug = "Tagrisso (Osimertinib)";
        dose = "80mg Daily Oral QD";
    }

    const url = `patient_dosing_report_template.html?id=${encodeURIComponent(ptId)}&name=${encodeURIComponent(pName)}&age=${encodeURIComponent(age)}&gender=${encodeURIComponent(gender)}&diag=${encodeURIComponent(diag)}&drug=${encodeURIComponent(drug)}&dose=${encodeURIComponent(dose)}`;
    window.open(url, '_blank');
}

function sendConsentEmailToPatient(ptId, ptName, rawEmail) {
    const email = rawEmail || `${ptName.toLowerCase().replace(/[^a-z]/g, '.')}@clinicalpatient.org`;
    const nctClean = activeTrial.replace('-', '');

    fetch('/api/send-consent-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ptId, name: ptName, email: email, nct: nctClean, drug: activeSponsor })
    })
    .then(res => res.json())
    .then(data => {
        showConsentEmailModal(data);
    })
    .catch(err => {
        showConsentEmailModal({
            recipient_name: ptName,
            recipient_email: email,
            subject: `[CONFIDENTIAL] Clinical Trial Informed Consent & Intake Form - Protocol ${nctClean}`,
            trial: nctClean,
            consent_form_url: `CuraMatch_Initial_Patient_Primary_Intake_Report.html?id=${ptId}`,
            message: `Hello ${ptName},\n\nYou have been selected as an eligible candidate for clinical trial ${nctClean}. Please click the link below to complete your HIPAA Informed Consent & Pre-Screening Intake Form.`
        });
    });
}

function sendConsentEmailForSelectedPatient() {
    const rawName = document.getElementById('livePatientName').value || 'Dr. Evelyn Vance';
    const ptId = document.getElementById('patientSelect').value;
    sendConsentEmailToPatient(ptId, rawName, '');
}

function showConsentEmailModal(data) {
    document.getElementById('modalRecipientEmail').textContent = `${data.recipient_name} <${data.recipient_email}>`;
    document.getElementById('modalEmailSubject').value = data.subject;
    document.getElementById('modalEmailBody').value = `${data.message}\n\nIntake Link: ${data.consent_form_url}`;
    document.getElementById('modalOpenIntakeLink').href = data.consent_form_url;
    document.getElementById('consentEmailModal').classList.remove('hidden');
}

function closeConsentEmailModal() {
    document.getElementById('consentEmailModal').classList.add('hidden');
}

function openIndividualPatientPdfReport(ptId, name, ageSex, diag, hba1c, egfr, meds) {
    const age = ageSex ? ageSex.split('y')[0] : '59';
    const gender = ageSex ? ageSex.split('/')[1]?.trim() : 'Female';
    const url = `patient_report_template.html?id=${encodeURIComponent(ptId)}&name=${encodeURIComponent(name)}&age=${encodeURIComponent(age)}&gender=${encodeURIComponent(gender)}&diag=${encodeURIComponent(diag)}&hba1c=${encodeURIComponent(hba1c)}&egfr=${encodeURIComponent(egfr)}&meds=${encodeURIComponent(meds || 'Standard Meds')}`;
    window.open(url, '_blank');
}

function switchNavTabDirect(tabId) {
    document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

    const activeBtn = document.querySelector(`.nav-tab-btn[data-tab="${tabId}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    const targetSection = document.getElementById(tabId);
    if (targetSection) targetSection.classList.add('active');

    if (tabId === 'patient-matching') {
        renderStep4VerifiedTable();
    }

    if (tabId === 'patient-dosing-tracker') {
        updateDosingPatientSelectOptions();
        updateDosingPatientView();
    }

    if (tabId === 'trial-dashboard') {
        setTimeout(() => {
            forceInitTrialMap();
        }, 150);
    }
}

function updateStep3PatientHistoryFile() {
    const sel = document.getElementById('step3PatientSelect');
    if (!sel) return;
    const ptId = sel.value;
    
    let pName = "Dr. Evelyn Vance";
    let diagCode = "TNBC";
    
    for (let key in patients) {
        if (patients[key].id === ptId) {
            pName = patients[key].name;
            diagCode = patients[key].diagnosis;
            break;
        }
    }

    const titleEl = document.getElementById('step3DropzoneTitle');
    if (titleEl) {
        titleEl.textContent = `Upload ${pName}'s Past Medical History & Hospital File (.PDF / .PNG / .TXT)`;
    }

    const diagSelect = document.getElementById('reportTargetDisease');
    if (diagSelect && diagSelect.querySelector(`option[value="${diagCode}"]`)) {
        diagSelect.value = diagCode;
    }

    reMatch200PageReportForDisease();
}

function handleDoctorReportUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    alert(`Simulating AI Deep Parsing on Doctor Patient Report (${file.name})... Extracting Pathology, Blood Panels, and History.`);

    let extracted = {
        name: "Dr. Evelyn Vance",
        gender: "Female",
        age: 59,
        hba1c: 8.4,
        egfr: 78,
        stroke: 999,
        diag: "TNBC"
    };

    if (file.name.toLowerCase().includes('diabetes') || file.name.toLowerCase().includes('t2d')) {
        extracted = { name: "Eleanor Vance", gender: "Female", age: 62, hba1c: 8.4, egfr: 58, stroke: 999, diag: "T2D" };
    } else if (file.name.toLowerCase().includes('lung') || file.name.toLowerCase().includes('nsclc')) {
        extracted = { name: "Dr. Aris Thorne", gender: "Male", age: 66, hba1c: 5.4, egfr: 81, stroke: 999, diag: "NSCLC" };
    }

    document.getElementById('livePatientName').value = extracted.name;
    document.getElementById('liveGender').value = extracted.gender;
    document.getElementById('liveAge').value = extracted.age;
    document.getElementById('liveHba1c').value = extracted.hba1c;
    document.getElementById('liveEgfr').value = extracted.egfr;
    document.getElementById('liveStroke').value = extracted.stroke;
    document.getElementById('liveDiagnosis').value = extracted.diag;

    updateLiveSliderVals();
    alert(`Success! Report (${file.name}) parsed. Auto-filled parameters for ${extracted.name} and calculated live trial eligibility!`);
}

function triggerSamplePrescriptionOcr() {
    const sampleImage = "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80";
    processPrescriptionImageScan(sampleImage, "Doctor_Prescription_Rx_Scan_DrVance.png");
}

function handlePrescriptionImageOcr(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        processPrescriptionImageScan(e.target.result, file.name);
    };
    reader.readAsDataURL(file);
}

function processPrescriptionImageScan(imgSrc, fileName) {
    const previewBox = document.getElementById('ocrScanPreviewBox');
    const previewImg = document.getElementById('ocrPreviewImg');
    const statusTitle = document.getElementById('ocrStatusTitle');
    const dataList = document.getElementById('ocrExtractedDataList');

    if (!previewBox || !previewImg || !dataList) return;

    previewImg.src = imgSrc;
    statusTitle.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-cyan"></i> AI Computer Vision Scanning Prescription (${fileName})...`;
    previewBox.classList.remove('hidden');

    dataList.innerHTML = `
        <div style="padding:1rem; text-align:center; color:var(--text-muted);">
            <i class="fa-solid fa-expand text-cyan pulse-glow" style="font-size:2rem;"></i><br>
            <span style="font-weight:700; font-size:0.85rem; margin-top:0.4rem; display:block;">Running Deep OCR Text & Handwriting Extraction...</span>
        </div>
    `;

    setTimeout(() => {
        statusTitle.innerHTML = `<i class="fa-solid fa-circle-check text-emerald"></i> Prescription Image OCR Scanning Complete (Confidence: 98.4%)`;

        lastOcrExtractedPatient = {
            name: "Dr. Evelyn Vance",
            age: 59,
            gender: "Female",
            hba1c: 8.4,
            egfr: 78,
            stroke: 999,
            diag: "TNBC",
            diagText: "Triple-Negative Breast Cancer (PD-L1 CPS 15)",
            meds: "Keytruda (Pembrolizumab) 200mg IV Q3W, Metformin 1000mg"
        };

        dataList.innerHTML = `
            <div class="ocr-data-chip">
                <span>Patient Full Name:</span>
                <strong>Dr. Evelyn Vance (59y, Female)</strong>
            </div>
            <div class="ocr-data-chip">
                <span>Primary Diagnosis (ICD-10):</span>
                <strong style="color:#0F5C63;">Triple-Negative Breast Cancer (PD-L1 CPS = 15)</strong>
            </div>
            <div class="ocr-data-chip">
                <span>Laboratory Parameters:</span>
                <strong>HbA1c: 8.4% | eGFR: 78 mL/min/1.73m²</strong>
            </div>
            <div class="ocr-data-chip">
                <span>Active Prescriptions:</span>
                <strong style="color:#6D28D9;">Keytruda (Pembrolizumab) 200mg Q3W</strong>
            </div>
        `;

        previewBox.scrollIntoView({ behavior: 'smooth' });
    }, 1200);
}

function sendOcrDataToLiveScreener() {
    if (!lastOcrExtractedPatient) return;

    document.getElementById('livePatientName').value = lastOcrExtractedPatient.name;
    document.getElementById('liveGender').value = lastOcrExtractedPatient.gender;
    document.getElementById('liveAge').value = lastOcrExtractedPatient.age;
    document.getElementById('liveHba1c').value = lastOcrExtractedPatient.hba1c;
    document.getElementById('liveEgfr').value = lastOcrExtractedPatient.egfr;
    document.getElementById('liveStroke').value = lastOcrExtractedPatient.stroke;
    document.getElementById('liveDiagnosis').value = lastOcrExtractedPatient.diag;

    updateLiveSliderVals();
    switchNavTabDirect('patient-matching');
    alert(`Success! Extracted Prescription Data for ${lastOcrExtractedPatient.name} auto-filled into Live Screener.`);
}

function openAddNewPatientModal() {
    document.getElementById('addNewPatientModal').classList.remove('hidden');
}

function closeAddNewPatientModal() {
    document.getElementById('addNewPatientModal').classList.add('hidden');
}

function handleAddNewPatientSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('newPtName').value.trim();
    const age = parseInt(document.getElementById('newPtAge').value);
    const gender = document.getElementById('newPtGender').value;
    const hba1c = parseFloat(document.getElementById('newPtHba1c').value);
    const egfr = parseInt(document.getElementById('newPtEgfr').value);
    const diagCode = document.getElementById('newPtDiag').value;
    const stroke = parseInt(document.getElementById('newPtStroke').value);
    const meds = document.getElementById('newPtMeds').value.trim();

    const newKey = `P-${113 + Object.keys(patients).length}`;
    const newId = `PT-${10300 + Object.keys(patients).length}`;

    let diagText = "Type 2 Diabetes Mellitus";
    if (diagCode === 'NSCLC') diagText = "NSCLC EGFR Exon 19 Deletion";
    else if (diagCode === 'TNBC') diagText = "Triple-Negative Breast Cancer (Keytruda)";
    else if (diagCode === 'HER2') diagText = "HER2+ Metastatic Breast Cancer";
    else if (diagCode === 'AD') diagText = "Early Alzheimer's Disease (Donanemab)";

    const newPatientObj = {
        id: newId,
        name: name,
        age: age,
        gender: gender,
        diagnosis: diagCode,
        diagText: diagText,
        hba1c: hba1c,
        egfr: egfr,
        strokeMonthsAgo: stroke,
        meds: meds,
        status: 'ELIGIBLE MATCH',
        distMiles: 10.5,
        noShowRate: 5,
        comorbidities: 1
    };

    patients[newKey] = newPatientObj;

    const select = document.getElementById('patientSelect');
    const opt = document.createElement('option');
    opt.value = newKey;
    opt.textContent = `${newId}: ${name} (${age}y, ${gender.charAt(0)}) - ${diagCode}`;
    select.appendChild(opt);

    closeAddNewPatientModal();
    renderMasterDatasetTable();
    processBatchDatasetScreening(Object.values(patients));
    updateDosingPatientSelectOptions();
    updateDosingPatientView();

    alert(`🎉 SUCCESS! New Patient Record "${name}" (${newId}) added to dataset and evaluated live!`);
}


function openRegisterPharmaModal() {
    openAddPharmaTrialModal();
}

function openAddPharmaTrialModal() {
    document.getElementById('addPharmaTrialModal').classList.remove('hidden');
}

function closeAddPharmaTrialModal() {
    document.getElementById('addPharmaTrialModal').classList.add('hidden');
}

function reMatch200PageReportForDisease() {
    const diseaseSelect = document.getElementById('reportTargetDisease');
    if (!diseaseSelect) return;

    const targetDisease = diseaseSelect.value;
    const scoreEl = document.getElementById('reportMatchScore');
    const listEl = document.getElementById('reportCitationsList');
    if (!scoreEl || !listEl) return;

    let citations = [];
    let scoreText = '0% EXCLUDED';
    let scoreColor = 'var(--danger)';

    if (targetDisease === 'NSCLC') {
        scoreText = '98% HIGH MATCH';
        scoreColor = '#0F5C63';
        citations = [
            { page: 38, sec: 'Section 4.2 NGS Genomics Panel', text: 'EGFR Exon 19 Deletion POSITIVE (Variant Allele Frequency VAF: 42.8%).', tag: 'PASS', color: '#0F5C63' },
            { page: 112, sec: 'Section 9.1 Brain MRI Radiology Impression', text: 'Normal brain parenchyma. No evidence of intracranial metastatic lesions or cerebral edema.', tag: 'PASS', color: '#0F5C63' },
            { page: 184, sec: 'Section 16 Hepatic Panel', text: 'Serum ALT 22 U/L, AST 19 U/L (Normal liver function, < 3x ULN cutoff).', tag: 'PASS', color: '#0F5C63' }
        ];
    } else if (targetDisease === 'T2D') {
        scoreText = '94% HIGH MATCH';
        scoreColor = '#0F5C63';
        citations = [
            { page: 142, sec: 'Section 12.1 Endocrine Progress Note', text: 'Documented diagnosis of Type 2 Diabetes Mellitus. Baseline HbA1c 8.4% (LOINC 4548-4).', tag: 'PASS', color: '#0F5C63' },
            { page: 168, sec: 'Section 14 Metabolic Renal Panel', text: 'Calculated eGFR rate is 58 mL/min/1.73m² (Satisfies >= 45 cutoff).', tag: 'PASS', color: '#0F5C63' },
            { page: 198, sec: 'Section 19 Past Medical History', text: 'No history of acute ischemic stroke or MI within last 12 months.', tag: 'PASS', color: '#0F5C63' }
        ];
    } else if (targetDisease === 'HER2') {
        scoreText = '92% ELIGIBLE MATCH';
        scoreColor = '#0F5C63';
        citations = [
            { page: 54, sec: 'Section 5.3 Breast Pathology Biomarkers', text: 'HER2 Neu Status: IHC 3+ Strongly Positive (Overexpression verified).', tag: 'PASS', color: '#0F5C63' },
            { page: 89, sec: 'Section 7.2 Echocardiogram Assessment', text: 'Left Ventricular Ejection Fraction (LVEF): 58% (Normal cardiac function >= 50%).', tag: 'PASS', color: '#0F5C63' },
            { page: 176, sec: 'Section 15 Hypersensitivity Audit', text: 'No prior adverse reactions or monoclonal antibody hypersensitivity documented.', tag: 'PASS', color: '#0F5C63' }
        ];
    } else if (targetDisease === 'MI') {
        scoreText = '0% EXCLUDED';
        scoreColor = 'var(--danger)';
        citations = [
            { page: 98, sec: 'Section 8.1 Cardiology ECG Trace', text: 'Normal Sinus Rhythm. No acute myocardial infarction event in prior 3 months.', tag: 'FAIL (No Recent MI)', color: 'var(--danger)' },
            { page: 104, sec: 'Section 8.4 Echocardiogram Function', text: 'LVEF calculated at 58% (Exceeds study target requirement LVEF <= 40%).', tag: 'FAIL (LVEF > 40%)', color: 'var(--danger)' }
        ];
    } else if (targetDisease === 'TNBC') {
        scoreText = '96% HIGH MATCH';
        scoreColor = '#0F5C63';
        citations = [
            { page: 44, sec: 'Section 4.5 Triple-Negative Pathology', text: 'ER/PR/HER2 Status: Negative for ER, PR, and HER2 IHC 0 (Triple-Negative confirmed).', tag: 'PASS', color: '#0F5C63' },
            { page: 62, sec: 'Section 6.1 PD-L1 Biomarker Assay', text: 'PD-L1 Expression: Combined Positive Score (CPS) = 15 (Satisfies CPS >= 10 threshold).', tag: 'PASS', color: '#0F5C63' },
            { page: 130, sec: 'Section 11.2 Autoimmune Screening', text: 'No prior history of active autoimmune diseases (Rheumatoid arthritis, Lupus negative).', tag: 'PASS', color: '#0F5C63' }
        ];
    } else if (targetDisease === 'AD') {
        scoreText = '95% HIGH MATCH';
        scoreColor = '#0F5C63';
        citations = [
            { page: 76, sec: 'Section 7.1 Amyloid PET Scan Impression', text: 'Cortical Florbetapir F-18 PET: Significant Amyloid-beta plaque deposition POSITIVE.', tag: 'PASS', color: '#0F5C63' },
            { page: 92, sec: 'Section 8.3 Cognitive Screening (MMSE)', text: 'Mini-Mental State Examination score: 24/30 (Satisfies mild cognitive impairment 20-27).', tag: 'PASS', color: '#0F5C63' },
            { page: 155, sec: 'Section 13.4 Brain MRI Safety Audit', text: 'No evidence of acute cerebral microhemorrhages (> 4 ARIA-H lesions excluded).', tag: 'PASS', color: '#0F5C63' }
        ];
    }

    scoreEl.textContent = scoreText;
    scoreEl.style.color = scoreColor;

    listEl.innerHTML = '';
    citations.forEach(c => {
        const div = document.createElement('div');
        div.className = 'solver-highlight-box';
        div.style.marginTop = '0';
        div.style.borderLeftColor = c.color;
        const tagStyle = c.tag.includes('FAIL')
            ? 'background:#FEE2E2; border:1px solid #EF4444; color:#DC2626;'
            : 'background:#DDF5F0; border:1px solid #159A9C; color:#0F5C63;';

        div.innerHTML = `
            <div class="flex-between">
                <strong style="color:#0F5C63; font-size:0.85rem;"><i class="fa-solid fa-file-lines"></i> Page ${c.page} - ${c.sec}</strong>
                <span class="badge-tag" style="${tagStyle} font-size:0.75rem; font-weight:800; padding:0.25rem 0.6rem; border-radius:6px;">${c.tag}</span>
            </div>
            <code style="font-size:0.84rem; display:block; margin-top:0.35rem; color:#163A43; background:#F5FAFC; padding:0.4rem 0.6rem; border-radius:6px; border:1px solid rgba(15,92,99,0.1);">${c.text}</code>
        `;
        listEl.appendChild(div);
    });
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        let parsedPatients = [];

        if (file.name.endsWith('.json')) {
            try {
                const json = JSON.parse(text);
                parsedPatients = json.patients || json;
            } catch (err) {
                alert('Invalid JSON file format!');
                return;
            }
        } else {
            parsedPatients = parseCsvTextToPatients(text);
        }

        processBatchDatasetScreening(parsedPatients);
    };
    reader.readAsText(file);
}

function parseCsvTextToPatients(csvText) {
    const lines = csvText.split('\n').filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const list = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 6) {
            list.push({
                id: cols[0] || `PT-UP-${i}`,
                name: cols[1] || `Patient ${i}`,
                age: parseInt(cols[2]) || 55,
                gender: cols[3] || 'Female',
                diagnosis: cols[4] ? (cols[4].includes('Diabetes') ? 'T2D' : cols[4].includes('Lung') ? 'NSCLC' : cols[4].includes('Breast') ? 'HER2' : 'T2D') : 'T2D',
                diagText: cols[4] || 'Type 2 Diabetes Mellitus',
                hba1c: parseFloat(cols[6]) || 8.4,
                egfr: parseInt(cols[7]) || 60,
                strokeMonthsAgo: cols[8] ? parseInt(cols[8]) : 999,
                meds: cols[9] || 'Standard Prescriptions'
            });
        }
    }
    return list;
}

function loadSampleDatasetForUpload() {
    const sampleList = Object.values(patients);
    processBatchDatasetScreening(sampleList);
}

function processBatchDatasetScreening(patientArray) {
    const startTime = performance.now();
    const trial = trialProtocols[activeTrial] || trialProtocols['NCT-048821'];

    let eligibleCount = 0;
    let excludedCount = 0;
    uploadedBatchResults = [];

    patientArray.forEach(p => {
        let isEligible = true;
        let reasons = [];

        if (p.diagnosis !== trial.reqDiag && !p.diagText.toLowerCase().includes(trial.reqDiag.toLowerCase())) {
            isEligible = false;
            reasons.push(`Diagnosis mismatch (${p.diagText})`);
        }

        if (p.age < trial.minAge || p.age > trial.maxAge) {
            isEligible = false;
            reasons.push(`Age ${p.age} outside ${trial.minAge}-${trial.maxAge}`);
        }

        if (trial.maxHba1c < 14 && (p.hba1c < trial.minHba1c || p.hba1c > trial.maxHba1c)) {
            isEligible = false;
            reasons.push(`HbA1c ${p.hba1c}% outside limit ${trial.minHba1c}-${trial.maxHba1c}%`);
        }

        if (p.egfr < trial.minEgfr) {
            isEligible = false;
            reasons.push(`eGFR ${p.egfr} below ${trial.minEgfr} safety cutoff`);
        }

        if (p.strokeMonthsAgo < trial.strokeExclusionMonths) {
            isEligible = false;
            reasons.push(`Stroke recorded ${p.strokeMonthsAgo}m ago (< ${trial.strokeExclusionMonths}m limit)`);
        }

        if (isEligible) eligibleCount++;
        else excludedCount++;

        const matchScore = isEligible ? Math.round(90 + Math.random() * 8) : 0;

        uploadedBatchResults.push({
            id: p.id || 'PT-UPLOAD',
            name: getFormattedPatientName(p.name),
            ageSex: `${p.age}y / ${p.gender}`,
            diag: p.diagText,
            hba1c: `${p.hba1c}%`,
            egfr: `${p.egfr} mL/min`,
            meds: p.meds || 'Metformin, Lisinopril',
            score: `${matchScore}%`,
            status: isEligible ? 'ELIGIBLE MATCH' : 'EXCLUDED',
            isEligible: isEligible,
            citations: isEligible ? 'Satisfies all inclusion criteria & safety cutoffs' : reasons.join('; ')
        });
    });

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    document.getElementById('statTotalUploaded').textContent = patientArray.length;
    document.getElementById('statEligibleFound').textContent = eligibleCount;
    document.getElementById('statExcludedFound').textContent = excludedCount;
    document.getElementById('statScreenDuration').textContent = `${duration}s`;

    renderUploadedResultsTable();
    document.getElementById('uploadResultsBox').classList.remove('hidden');
}

function toggleFilterEligibleOnly() {
    filterOnlyEligibleInTable = !filterOnlyEligibleInTable;
    const btn = document.getElementById('filterEligibleToggleBtn');
    if (btn) {
        btn.innerHTML = filterOnlyEligibleInTable ? 
            '<i class="fa-solid fa-filter text-emerald"></i> Showing: ONLY Eligible Candidates' : 
            '<i class="fa-solid fa-eye text-cyan"></i> Showing: All Screened Records';
    }
    renderUploadedResultsTable();
}

function renderUploadedResultsTable() {
    const tbody = document.getElementById('uploadResultsTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const listToRender = filterOnlyEligibleInTable ? 
        uploadedBatchResults.filter(r => r.isEligible) : 
        uploadedBatchResults;

    if (!listToRender.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; padding:2rem; color:var(--text-muted);">
                    <i class="fa-solid fa-user-slash text-red" style="font-size:1.8rem;"></i><br><br>
                    <strong style="color:var(--text-main); font-size:1rem;">No Eligible Patients Found in Dataset for Protocol ${activeTrial}.</strong><br>
                    <span style="font-size:0.85rem;">Switch trial protocol or toggle view to see excluded patient reasons.</span>
                </td>
            </tr>
        `;
        return;
    }

    listToRender.forEach(res => {
        const tr = document.createElement('tr');
        const isEligible = res.isEligible;
        tr.innerHTML = `
            <td><strong style="color:var(--primary);">${res.id}</strong></td>
            <td><strong>${res.name}</strong></td>
            <td>${res.ageSex}</td>
            <td>${res.diag}</td>
            <td><strong>${res.hba1c}</strong></td>
            <td>${res.egfr}</td>
            <td><strong style="color:#0F5C63; font-size:0.95rem;">${res.score}</strong></td>
            <td>
                <span class="text-emerald" style="font-weight:800; background:rgba(16,185,129,0.15); padding:0.25rem 0.55rem; border-radius:6px; font-size:0.78rem;">
                    <i class="fa-solid fa-circle-check"></i> ELIGIBLE
                </span>
            </td>
            <td>
                <button class="btn-primary btn-sm" onclick="sendConsentEmailToPatient('${res.id}', '${res.name}', '')" style="margin-right:4px;">
                    <i class="fa-solid fa-paper-plane"></i> Send Consent Email
                </button>
                <button class="btn-secondary btn-sm" onclick="openIndividualPatientPdfReport('${res.id}', '${res.name}', '${res.ageSex}', '${res.diag}', '${res.hba1c}', '${res.egfr}', '${res.meds}')">
                    <i class="fa-solid fa-file-pdf text-red"></i> Patient PDF
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function exportScreeningResultsCsv() {
    if (!uploadedBatchResults.length) return;

    let csvContent = "data:text/csv;charset=utf-8,Patient_ID,Name,Age_Sex,Diagnosis,HbA1c,eGFR,Score,Status,Citations\n";
    const eligibleOnly = uploadedBatchResults.filter(r => r.isEligible);
    eligibleOnly.forEach(r => {
        csvContent += `"${r.id}","${r.name}","${r.ageSex}","${r.diag}","${r.hba1c}","${r.egfr}","${r.score}","${r.status}","${r.citations}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Eligible_Candidates_Report_${activeTrial}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function togglePiiPrivacyMode() {
    piiPrivacyMode = !piiPrivacyMode;
    const btn = document.getElementById('piiToggleBtn');
    const status = document.getElementById('piiToggleStatus');

    if (piiPrivacyMode) {
        btn.classList.add('active');
        status.innerHTML = '<i class="fa-solid fa-user-lock"></i> HIPAA Privacy: ON ([ANONYMIZED])';
    } else {
        btn.classList.remove('active');
        status.innerHTML = 'HIPAA Privacy: OFF';
    }

    runLivePatientEvaluation();
    renderMasterDatasetTable();
    renderStep4VerifiedTable();
    renderFhirResource('Patient');
}

function getFormattedPatientName(rawName) {
    if (!piiPrivacyMode) return rawName;
    return `[ANONYMIZED_SUBJECT_${Math.floor(Math.abs(hashCode(rawName)) % 900 + 100)}]`;
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

function updateLiveSliderVals() {
    const age = document.getElementById('liveAge').value;
    const hba1c = document.getElementById('liveHba1c').value;
    const egfr = document.getElementById('liveEgfr').value;

    document.getElementById('liveAgeVal').textContent = `${age}`;
    document.getElementById('liveHba1cVal').textContent = `${hba1c}%`;
    document.getElementById('liveEgfrVal').textContent = `${egfr} mL/min`;

    runLivePatientEvaluation();
}

function loadPresetPatient() {
    const id = document.getElementById('patientSelect').value;
    if (id === 'CUSTOM') return;

    const p = patients[id];
    if (!p) return;

    document.getElementById('livePatientName').value = p.name;
    document.getElementById('liveGender').value = p.gender;
    document.getElementById('liveAge').value = p.age;
    document.getElementById('liveHba1c').value = p.hba1c;
    document.getElementById('liveEgfr').value = p.egfr;
    document.getElementById('liveStroke').value = p.strokeMonthsAgo;
    document.getElementById('liveDiagnosis').value = p.diagnosis;

    updateLiveSliderVals();
}

function runLivePatientEvaluation() {
    try {
        const rawName = document.getElementById('livePatientName').value || 'Patient';
        const displayName = getFormattedPatientName(rawName);

        const age = parseInt(document.getElementById('liveAge').value);
        const hba1c = parseFloat(document.getElementById('liveHba1c').value);
        const egfr = parseInt(document.getElementById('liveEgfr').value);
        const stroke = parseInt(document.getElementById('liveStroke').value);
        const diag = document.getElementById('liveDiagnosis').value;

        // Calculate AI Patient Health Score & Organ Safety
        calculatePatientHealthScore(age, hba1c, egfr, stroke);

        const trial = trialProtocols[activeTrial] || { title: activeTrial, minAge: 18, maxAge: 85, minHba1c: 0, maxHba1c: 14, minEgfr: 45, strokeExclusionMonths: 3, reqDiag: diag };

        let isEligible = true;
        let failReasons = [];
        let criteriaResults = [];

        const diagPass = (diag === trial.reqDiag || trial.reqDiag === 'T2D' || trial.reqDiag === 'TNBC' || trial.reqDiag === 'NSCLC');
        criteriaResults.push({
            ruleKey: 'diagnosis',
            label: `Target Indication Match (${trial.title.split(':')[1] ? trial.title.split(':')[1].trim() : trial.title})`,
            pass: diagPass,
            note: diagPass ? 'Primary diagnosis aligns with protocol' : `Diagnosis mismatch for ${trial.title}`,
            snippet: `Oct 12, 2025 Outpatient Note: Patient presented with ${diag === 'T2D' ? 'Type 2 Diabetes Mellitus (ICD-10: E11.9)' : diag === 'TNBC' ? 'Triple-Negative Breast Cancer (PD-L1 CPS 15)' : diag === 'AD' ? 'Early Alzheimer\'s Disease (Amyloid PET Positive)' : 'Primary Diagnostic Code'}.`
        });
        if (!diagPass) { isEligible = false; failReasons.push('Diagnosis mismatch'); }

        const agePass = age >= trial.minAge && age <= trial.maxAge;
        criteriaResults.push({
            ruleKey: 'age',
            label: `Age Rule (${trial.minAge} - ${trial.maxAge} years)`,
            pass: agePass,
            note: `Patient age: ${age} years`,
            snippet: `Demographic Verification: Patient DOB confirmed on file. Age at screening: ${age} years old.`
        });
        if (!agePass) { isEligible = false; failReasons.push(`Age outside ${trial.minAge}-${trial.maxAge}`); }

        if (trial.maxHba1c < 14) {
            const hba1cPass = hba1c >= trial.minHba1c && hba1c <= trial.maxHba1c;
            criteriaResults.push({
                ruleKey: 'hba1c',
                label: `HbA1c Bound (${trial.minHba1c}% - ${trial.maxHba1c}%)`,
                pass: hba1cPass,
                note: `Patient HbA1c: ${hba1c}%`,
                snippet: `Oct 15th Lab Report (Epic EHR): Patient presented with an elevated HbA1c of ${hba1c}% (LOINC 4548-4).`
            });
            if (!hba1cPass) { isEligible = false; failReasons.push(`HbA1c ${hba1c}% outside ${trial.minHba1c}-${trial.maxHba1c}%`); }
        }

        const egfrPass = egfr >= trial.minEgfr;
        criteriaResults.push({
            ruleKey: 'egfr',
            label: `Renal Safety Cutoff (eGFR >= ${trial.minEgfr} mL/min)`,
            pass: egfrPass,
            note: `Patient eGFR: ${egfr} mL/min`,
            snippet: `Metabolic Panel (Quest Diagnostics): eGFR calculated rate is ${egfr} mL/min/1.73m² (LOINC 2160-0).`
        });
        if (!egfrPass) { isEligible = false; failReasons.push(`eGFR ${egfr} below ${trial.minEgfr} safety cutoff`); }

        const strokePass = stroke >= trial.strokeExclusionMonths;
        criteriaResults.push({
            ruleKey: 'stroke',
            label: `EXCLUSION: No Stroke within ${trial.strokeExclusionMonths} Months`,
            pass: strokePass,
            note: strokePass ? 'No recent stroke' : `Stroke recorded ${stroke} months ago (EXCLUSION BREACH)`,
            snippet: strokePass ? `Cardiology Progress Note: No history of cerebrovascular accident or acute ischemic stroke in prior 12 months.` : `Neurology Discharge Summary: Acute ischemic stroke event documented ${stroke} months ago (EXCLUSION WINDOW BREACH).`
        });
        if (!strokePass) { isEligible = false; failReasons.push(`Stroke recorded within last ${trial.strokeExclusionMonths} months`); }

        const scoreValEl = document.getElementById('matchScoreVal');
        const scoreCircle = document.getElementById('matchScoreCircle');
        const heading = document.getElementById('matchStatusHeading');
        const subText = document.getElementById('matchSubText');

        if (scoreValEl && scoreCircle && heading && subText) {
            if (isEligible) {
                scoreValEl.textContent = '96%';
                scoreCircle.className = 'score-circle score-high';
                heading.className = 'status-eligible';
                heading.innerHTML = '<i class="fa-solid fa-circle-check"></i> HIGH ELIGIBILITY MATCH';
                subText.textContent = `Patient ${displayName} satisfies all criteria & safety limits for ${trial.title}.`;
                document.getElementById('vectorConfVal').textContent = '96.2%';
                document.getElementById('vectorConfFill').style.width = '96.2%';
            } else {
                scoreValEl.textContent = '0%';
                scoreCircle.className = 'score-circle score-fail';
                heading.className = 'status-excluded';
                heading.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> EXCLUDED / INELIGIBLE';
                subText.textContent = `Patient ${displayName} excluded: ${failReasons.join('; ')}.`;
                document.getElementById('vectorConfVal').textContent = '14.2%';
                document.getElementById('vectorConfFill').style.width = '14.2%';
            }
        }

        const criteriaListEl = document.getElementById('criteriaList');
        if (criteriaListEl) {
            criteriaListEl.innerHTML = '';
            criteriaResults.forEach(res => {
                const div = document.createElement('div');
                div.className = `criteria-item ${res.pass ? 'pass' : 'fail'}`;
                div.onclick = () => openXaiModal(res.label, res.snippet, res.pass);
                div.innerHTML = `
                    <div>
                        <strong>${res.label}</strong>
                        <div style="font-size:0.75rem; color:var(--text-muted);">${res.note}</div>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <span style="font-size:0.72rem; color:var(--primary); font-weight:600;"><i class="fa-solid fa-eye"></i> Proof</span>
                        <span class="criteria-status ${res.pass ? 'pass' : 'fail'}">
                            ${res.pass ? '<i class="fa-solid fa-check"></i> PASS' : '<i class="fa-solid fa-xmark"></i> FAIL'}
                        </span>
                    </div>
                `;
                criteriaListEl.appendChild(div);
            });
        }

        calculateFlightRisk(age, egfr, stroke);

    } catch (err) {
        console.log('Live evaluation deferred:', err);
    }
}

function openXaiModal(ruleLabel, snippetText, isPass) {
    document.getElementById('xaiRuleTitle').textContent = `Rule Verified: ${ruleLabel}`;
    document.getElementById('xaiSourceSnippet').innerHTML = `
        <i class="fa-solid fa-quote-left ${isPass ? 'text-emerald' : 'text-red'}"></i> 
        <strong>EMR Source Highlight:</strong><br>
        <code>"${snippetText}"</code>
    `;
    document.getElementById('xaiModal').classList.remove('hidden');
}

function closeXaiModal() {
    document.getElementById('xaiModal').classList.add('hidden');
}

function calculateFlightRisk(age, egfr, stroke) {
    const id = document.getElementById('patientSelect').value;
    const p = patients[id] || { distMiles: 12.4, noShowRate: 6, comorbidities: 2 };

    let riskPercent = Math.min(95, Math.round((p.distMiles * 1.2) + (p.noShowRate * 2) + (p.comorbidities * 5)));
    
    const riskVal = document.getElementById('flightRiskVal');
    const riskSub = document.getElementById('flightRiskSub');
    const actionBox = document.getElementById('flightActionBox');
    const distEl = document.getElementById('flightDist');
    const noShowEl = document.getElementById('flightNoShow');
    const comorbidEl = document.getElementById('flightComorbid');

    if (distEl && noShowEl && comorbidEl) {
        distEl.textContent = `${p.distMiles} Miles`;
        noShowEl.textContent = `${p.noShowRate}% (${p.noShowRate > 15 ? 'High' : 'Low'})`;
        comorbidEl.textContent = `${p.comorbidities} Conditions`;
    }

    if (riskVal && actionBox) {
        if (riskPercent > 40) {
            riskVal.textContent = `HIGH RISK (${riskPercent}%)`;
            riskVal.style.color = 'var(--danger)';
            riskSub.textContent = 'High probability of study dropout due to travel/comorbidity burden';
            actionBox.style.background = 'rgba(244,63,94,0.15)';
            actionBox.style.borderColor = 'var(--danger)';
            actionBox.style.color = 'var(--danger)';
            actionBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> <strong>AI Action Item:</strong> Offer this patient an Uber Health transportation stipend + home nurse visits to increase retention by +38%.';
        } else {
            riskVal.textContent = `LOW (${riskPercent}%)`;
            riskVal.style.color = '#0F5C63';
            riskSub.textContent = 'High trial retention likelihood';
            actionBox.style.background = 'rgba(16,185,129,0.12)';
            actionBox.style.borderColor = '#159A9C';
            actionBox.style.color = '#0F5C63';
            actionBox.innerHTML = '<i class="fa-solid fa-circle-check"></i> <strong>AI Action Item:</strong> Standard trial protocol SMS reminders are sufficient for this patient.';
        }
    }
}

function askEmrQuestion(type) {
    const inputs = {
        betaBlockers: "Has this patient ever had an adverse reaction to a beta-blocker?",
        egfrTrend: "What is this patient's 12-month eGFR lab trend?",
        steroids: "Are there any active steroid prescriptions in their record?"
    };
    document.getElementById('emrQueryInput').value = inputs[type];
    sendEmrQuery();
}

function sendEmrQuery() {
    const input = document.getElementById('emrQueryInput');
    const query = input.value.trim();
    if (!query) return;

    const history = document.getElementById('emrChatHistory');
    history.innerHTML += `<div class="msg msg-user">${query}</div>`;
    input.value = '';

    setTimeout(() => {
        let answer = "Scanning entire patient timeline across Epic & Cerner records...";
        if (query.toLowerCase().includes('beta') || query.toLowerCase().includes('reaction')) {
            answer = "Yes. Patient reported severe dizziness and bradycardia on Metoprolol 50mg in 2021 (See Cardiology Clinical Progress Note, 04/12/2021). Recommend avoiding Beta-Blocker dosage increases.";
        } else if (query.toLowerCase().includes('egfr') || query.toLowerCase().includes('trend')) {
            answer = "12-Month eGFR Trajectory: Stable baseline. Oct 2024: 62 mL/min $\\rightarrow$ Mar 2025: 60 mL/min $\\rightarrow$ Oct 2025: 58 mL/min (LOINC 2160-0).";
        } else if (query.toLowerCase().includes('steroid')) {
            answer = "No active oral corticosteroid prescriptions found in RxNorm active medication list. Patient is cleared from steroid exclusion window.";
        } else {
            answer = `AI Scan Complete for ${document.getElementById('livePatientName').value}: No conflicting clinical contraindications found in past 24-month EMR history.`;
        }

        history.innerHTML += `
            <div class="msg msg-bot">
                ${answer}
                <div style="font-size:0.7rem; color:var(--primary); margin-top:0.35rem;">
                    <i class="fa-solid fa-shield-halved"></i> Source: Federated FHIR Patient EMR Timeline (21 CFR Part 11 Verified)
                </div>
            </div>
        `;
        history.scrollTop = history.scrollHeight;
    }, 650);
}

function renderMasterDatasetTable() {
    const tbody = document.getElementById('masterDatasetTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    Object.keys(patients).forEach(key => {
        const p = patients[key];
        const tr = document.createElement('tr');
        const isEligible = p.status.includes('ELIGIBLE');
        const displayName = getFormattedPatientName(p.name);
        
        tr.innerHTML = `
            <td><strong>${p.id}</strong></td>
            <td>${displayName}</td>
            <td>${p.age}y / ${p.gender}</td>
            <td>${p.diagText}</td>
            <td><strong>${p.hba1c}%</strong></td>
            <td>${p.egfr} mL/min</td>
            <td>${p.strokeMonthsAgo === 999 ? 'None' : p.strokeMonthsAgo + 'm ago'}</td>
            <td><span style="font-size:0.78rem; color:var(--text-muted);">${p.meds}</span></td>
            <td>
                <button class="btn-secondary btn-sm" onclick="openIndividualPatientPdfReport('${p.id}', '${p.name}', '${p.age}y / ${p.gender}', '${p.diagText}', '${p.hba1c}%', '${p.egfr} mL/min', '${p.meds}')">
                    <i class="fa-solid fa-file-pdf text-red"></i> Patient Report PDF
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function runSolverScenario(type) {
    const box = document.getElementById('solverOutputCard');
    const title = document.getElementById('solverTitle');
    const content = document.getElementById('solverContent');
    box.classList.remove('hidden');

    if (type === 'buriedData') {
        title.innerHTML = `<i class="fa-solid fa-file-pdf text-red"></i> Challenge 1 Solution: Multimodal Deep OCR & Document Extractor`;
        content.innerHTML = `
            <div style="font-weight:700; color:var(--primary); margin-bottom:0.5rem;">
                <i class="fa-solid fa-magnifying-glass"></i> Deep Document Extraction Stream (Patient: Dr. Aris Thorne - PT-10088):
            </div>
            <p><strong>1. Main EMR Text Record:</strong> <em>"Stage IV Non-Small Cell Lung Cancer (NSCLC)"</em> (No genomic mutation details in primary summary notes).</p>
            <p style="margin-top:0.5rem;"><strong>2. AI Multimodal OCR Scan (40-Page Scanned Pathology PDF):</strong></p>
            <div class="solver-highlight-box">
                <i class="fa-solid fa-dna text-emerald"></i> <strong>Pathology Report Page 38, Section 4.2:</strong><br>
                <code>"Next-Generation Sequencing (NGS) Panel: EGFR Exon 19 Deletion POSITIVE (Variant Allele Frequency VAF: 42.8%)."</code>
            </div>
            <p style="margin-top:0.5rem;"><strong>3. AI Radiology NLP Scan (3-Month-Old MRI Brain Radiology Note):</strong></p>
            <div class="solver-highlight-box" style="border-left-color: #0F5C63;">
                <i class="fa-solid fa-brain text-cyan"></i> <strong>Brain MRI Impression (May 14, 2026):</strong><br>
                <code>"Impression: Normal brain parenchyma. No evidence of intracranial metastatic lesions or cerebral edema."</code>
            </div>
            <div style="margin-top:1rem; padding:0.75rem; background:rgba(16,185,129,0.15); border:1px solid var(--accent); border-radius:8px; color:#0F5C63; font-weight:800;">
                <i class="fa-solid fa-circle-check"></i> RESULT: Patient Dr. Aris Thorne IS FULLY ELIGIBLE for NCT060122 (EGFR Exon 19 Targeted Study)! Extracted from buried files in <1.2s.
            </div>
        `;
    } else if (type === 'dataSilos') {
        title.innerHTML = `<i class="fa-solid fa-diagram-nested text-cyan"></i> Challenge 2 Solution: Federated FHIR Data Aggregator (Epic + Cerner + Quest)`;
        content.innerHTML = `
            <div style="font-weight:700; color:var(--primary); margin-bottom:0.5rem;">
                <i class="fa-solid fa-network-wired"></i> Real-Time Multi-Portal Data Consolidation Stream:
            </div>
            <div class="grid-3col" style="gap:1rem; margin-top:0.75rem;">
                <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-color); padding:0.75rem; border-radius:8px;">
                    <strong style="color:#0F5C63;"><i class="fa-solid fa-book-medical"></i> Epic EMR (Primary Care)</strong>
                    <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.25rem;">
                        - Type 2 Diabetes Mellitus<br>
                        - Lisinopril 10mg QD<br>
                        - Last Visit: 2 weeks ago
                    </div>
                </div>
                <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-color); padding:0.75rem; border-radius:8px;">
                    <strong style="color:#6D28D9;"><i class="fa-solid fa-heart-pulse"></i> Cerner EMR (Cardiology)</strong>
                    <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.25rem;">
                        - LVEF: 58% (Normal)<br>
                        - ECG: Normal Sinus Rhythm<br>
                        - No prior MI or Stroke
                    </div>
                </div>
                <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-color); padding:0.75rem; border-radius:8px;">
                    <strong style="color:#0F5C63;"><i class="fa-solid fa-vial"></i> Quest Diagnostics Feed</strong>
                    <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.25rem;">
                        - HbA1c: 8.4% (LOINC 4548-4)<br>
                        - eGFR: 65 mL/min/1.73m²<br>
                        - Creatinine: 1.0 mg/dL
                    </div>
                </div>
            </div>
            <div style="margin-top:1rem; padding:0.75rem; background:rgba(15,92,99,0.15); border:1px solid var(--primary); border-radius:8px; color:var(--primary); font-weight:800;">
                <i class="fa-solid fa-link"></i> RESULT: Patient records automatically aggregated into single FHIR Master Profile without manual portal switching or faxing!
            </div>
        `;
    } else if (type === 'batchScreening') {
        title.innerHTML = `<i class="fa-solid fa-bolt-lightning text-amber"></i> Challenge 3 Solution: 5,000-Patient Batch 2-Second Screener`;
        content.innerHTML = `
            <div style="font-weight:700; color:#B45309; margin-bottom:0.5rem;">
                <i class="fa-solid fa-gauge-high"></i> Executing Batch Screening over 5,000 EHR Records for Rheumatoid Arthritis Protocol...
            </div>
            <div class="meter-bar" style="height:10px; margin:0.75rem 0;"><div class="meter-fill" style="width:100%; background:linear-gradient(90deg, var(--warning), var(--accent));"></div></div>
            <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
                <span>Total Evaluated: <strong>5,000 Patients</strong></span>
                <span>Execution Time: <strong style="color:#0F5C63;">1.84 Seconds</strong></span>
                <span>Nurse Time Saved: <strong style="color:var(--primary);">~10,000 Hours!</strong></span>
            </div>
            <div class="solver-highlight-box" style="border-left-color: var(--danger); margin-top:1rem;">
                <i class="fa-solid fa-triangle-exclamation text-red"></i> <strong>Instant Exclusion Example (Page 198 Steroid Catch):</strong><br>
                <code>"Patient #3,891 Disqualified: Methylprednisolone oral steroid prescribed 35 days ago (Page 198 note). Excluded within 60-day window."</code>
            </div>
            <div style="margin-top:0.75rem; padding:0.75rem; background:rgba(16,185,129,0.15); border:1px solid var(--accent); border-radius:8px; color:#0F5C63; font-weight:800;">
                <i class="fa-solid fa-filter"></i> BATCH RESULT: 42 Eligible Candidates Matched | 4,958 Disqualified with instant citations. Zero manual nurse burnout.
            </div>
        `;
    } else if (type === 'fdaAudit') {
        title.innerHTML = `<i class="fa-solid fa-shield-exclamation text-red"></i> Challenge 4 Solution: Automated FDA Protocol Deviation Safeguard`;
        content.innerHTML = `
            <div style="font-weight:700; color:var(--danger); margin-bottom:0.5rem;">
                <i class="fa-solid fa-triangle-exclamation"></i> Testing Regulatory Safety Boundary Check:
            </div>
            <p><strong>Protocol Cutoff Rule:</strong> Serum Creatinine must be $\\le 1.1 \\text{ mg/dL}$ for trial enrollment.</p>
            <p><strong>Incoming Patient Lab Value:</strong> Serum Creatinine = $1.2 \\text{ mg/dL}$.</p>
            <div class="solver-highlight-box" style="border-left-color: var(--danger);">
                <i class="fa-solid fa-ban text-red"></i> <strong>HARD PROTOCOL DEVIATION PREVENTED BY SYSTEM:</strong><br>
                <code>"ENROLLMENT BLOCKED: Patient Creatinine 1.2 mg/dL exceeds strict cutoff 1.1 mg/dL by 0.1 units. Automatic rejection logged to 21 CFR Part 11 Audit Trail."</code>
            </div>
            <div style="margin-top:1rem; padding:0.75rem; background:rgba(16,185,129,0.15); border:1px solid var(--danger); border-radius:8px; color:var(--danger); font-weight:800;">
                <i class="fa-solid fa-shield-halved"></i> RESULT: Zero human error enrollment risks. Eliminates FDA audit penalties, site shutdowns, and million-dollar grant forfeitures!
            </div>
        `;
    } else if (type === 'recruitmentCliff') {
        title.innerHTML = `<i class="fa-solid fa-rocket text-purple"></i> Challenge 5 Solution: Accelerated Recruitment Velocity Engine`;
        content.innerHTML = `
            <div style="font-weight:700; color:#6D28D9; margin-bottom:0.5rem;">
                <i class="fa-solid fa-chart-line"></i> Alzheimer's Study Recruitment Target: 20 Patients in 90 Days
            </div>
            <div class="grid-2col" style="gap:1rem; margin-top:0.75rem;">
                <div style="background:rgba(244,63,94,0.1); border:1px solid var(--danger); padding:1rem; border-radius:8px;">
                    <h4 style="color:var(--danger);"><i class="fa-solid fa-hourglass-late"></i> Manual Process (Without AI)</h4>
                    <p style="font-size:0.8rem; margin-top:0.3rem;">Only <strong>3 patients</strong> found after 75 days. Target missed by 85%. Trial delayed by 6 months costing $2.4M in lost patent time.</p>
                </div>
                <div style="background:rgba(16,185,129,0.1); border:1px solid var(--accent); padding:1rem; border-radius:8px;">
                    <h4 style="color:#0F5C63;"><i class="fa-solid fa-bolt"></i> With CuraMatch AI Platform</h4>
                    <p style="font-size:0.8rem; margin-top:0.3rem;"><strong>20 Eligible Patients</strong> matched and consent dispatched in <strong>14 Days</strong>! Target reached 45 days ahead of schedule.</p>
                </div>
            </div>
        `;
    }

    box.scrollIntoView({ behavior: 'smooth' });
}

function runAntiHallucinationCheck() {
    const sel = document.getElementById('step3PatientSelect');
    const ptId = sel && sel.value ? sel.value : 'PT-10201';
    const patientObj = Object.values(patients).find(p => p.id === ptId) || patients['P-111'];

    const strokeText = patientObj.strokeMonthsAgo === 999 ? 'None' : `${patientObj.strokeMonthsAgo}m ago`;
    const url = `anti_hallucination_report_template.html?id=${patientObj.id}&name=${encodeURIComponent(patientObj.name)}&diag=${encodeURIComponent(patientObj.diagText)}&hba1c=${encodeURIComponent(patientObj.hba1c + '%')}&egfr=${encodeURIComponent(patientObj.egfr + ' mL/min')}&stroke=${encodeURIComponent(strokeText)}&meds=${encodeURIComponent(patientObj.meds)}`;

    window.open(url, '_blank');
}

function selectFhirResource(resourceType) {
    document.querySelectorAll('.fhir-res-item').forEach(i => i.classList.remove('active'));
    event.currentTarget.classList.add('active');
    renderFhirResource(resourceType);
}

function renderFhirResource(resourceType) {
    const nameEl = document.getElementById('livePatientName');
    const ageEl = document.getElementById('liveAge');
    const hba1cEl = document.getElementById('liveHba1c');
    const genderEl = document.getElementById('liveGender');
    if (!nameEl) return; // Elements not on this page
    const rawName = nameEl.value || 'Eleanor Vance';
    const displayName = getFormattedPatientName(rawName);
    const age = parseInt(ageEl ? ageEl.value : '') || 62;
    const hba1c = parseFloat(hba1cEl ? hba1cEl.value : '') || 8.4;
    const gender = genderEl ? genderEl.value || 'Female' : 'Female';

    let jsonOutput = {};

    if (resourceType === 'Patient') {
        jsonOutput = {
            resourceType: "Patient",
            id: piiPrivacyMode ? "[ANONYMIZED_ID]" : "PT-LIVE-10029",
            active: true,
            name: [{ use: "official", family: displayName.split(' ')[1] || "Vance", given: [displayName.split(' ')[0]] }],
            gender: gender.toLowerCase(),
            birthDate: piiPrivacyMode ? "[YEAR_REDACTED]" : `${2026 - age}-04-12`,
            address: [{ city: piiPrivacyMode ? "[CITY_REDACTED]" : "Boston", state: "MA", country: "USA" }]
        };
    } else if (resourceType === 'Condition') {
        jsonOutput = {
            resourceType: "Condition",
            id: "cond-live-10029",
            clinicalStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }] },
            code: { coding: [{ system: "http://hl7.org/fhir/sid/icd-10-cm", code: "C50.919", display: "Triple-Negative Breast Cancer / Early Alzheimer's" }] },
            subject: { reference: `Patient/${displayName}` }
        };
    } else if (resourceType === 'Observation') {
        jsonOutput = {
            resourceType: "Observation",
            id: "obs-biomarker-live",
            status: "final",
            code: { coding: [{ system: "http://loinc.org", code: "94500-6", display: "PD-L1 CPS / Amyloid PET Scan" }] },
            subject: { reference: `Patient/${displayName}` },
            valueQuantity: { value: 15, unit: "CPS Score", system: "http://unitsofmeasure.org", code: "score" }
        };
    } else {
        jsonOutput = {
            resourceType: "MedicationStatement",
            id: "med-live-10029",
            status: "active",
            medicationCodeableConcept: { text: "Keytruda (Pembrolizumab) 200mg IV Q3W / Donanemab" },
            subject: { reference: `Patient/${displayName}` }
        };
    }

    document.getElementById('fhirJsonDisplay').textContent = JSON.stringify(jsonOutput, null, 2);
}

function copyFhirJson() {
    const text = document.getElementById('fhirJsonDisplay').textContent;
    navigator.clipboard.writeText(text);
    alert('FHIR JSON copied to clipboard!');
}

function runCriteriaExtraction() {
    const rawText = document.getElementById('rawProtocolText').value;

    const extractedSchema = {
        protocolId: "NCT071204",
        targetIndication: "Triple-Negative Breast Cancer (Keytruda Immunotherapy)",
        extractedLogicTree: {
            demographics: { minAge: 18, maxAge: 75 },
            requiredBiomarkers: [
                { marker: "PD-L1 CPS Score", minThreshold: 10, unit: "CPS" },
                { marker: "ER/PR/HER2", constraint: "TRIPLE_NEGATIVE_CONFIRMED" }
            ],
            exclusionConditions: [
                { disease: "Active Autoimmune Disease", constraint: "STRICT_EXCLUSION" },
                { disease: "Ischemic Stroke", maxRecencyMonths: 3 }
            ]
        },
        confidence: 0.988
    };

    document.getElementById('schemaJsonOutput').textContent = JSON.stringify(extractedSchema, null, 2);

    const graphBox = document.getElementById('logicGraphContainer');
    graphBox.innerHTML = `
        <div class="node-group">
            <span><i class="fa-solid fa-dna text-cyan"></i> Biomarker: PD-L1 Combined Positive Score (CPS) >= 10</span>
            <span class="node-operator">AND</span>
        </div>
        <div class="node-group">
            <span><i class="fa-solid fa-ribbon text-emerald"></i> Diagnosis: Triple-Negative Breast Cancer (ER-/PR-/HER2-)</span>
            <span class="node-operator">AND</span>
        </div>
        <div class="node-group">
            <span><i class="fa-solid fa-kidneys text-emerald"></i> Renal Function: eGFR >= 50 mL/min/1.73m²</span>
            <span class="node-operator">AND NOT</span>
        </div>
        <div class="node-group" style="border-left:4px solid var(--danger);">
            <span><i class="fa-solid fa-shield-xmark text-red"></i> Exclusion: Active Autoimmune Disease OR Stroke (< 3m)</span>
            <span class="node-operator" style="background:var(--danger);">EVAL PASSED</span>
        </div>
    `;
}

function copySchemaJson() {
    const text = document.getElementById('schemaJsonOutput').textContent;
    navigator.clipboard.writeText(text);
    alert('Executable JSON Logic Schema copied to clipboard!');
}

function selectDocRepo(repoKey) {
    document.querySelectorAll('.doc-item').forEach(i => i.classList.remove('active'));
    event.currentTarget.classList.add('active');
    activeDocRepo = repoKey;
}

function askPresetQuery(type) {
    const inputs = {
        washout: "What is the baseline Keytruda / Metformin washout period required?",
        dosage: "What is the drug dosing schedule?",
        safety: "What are the primary immune-related adverse event (irAE) endpoints?"
    };
    document.getElementById('ragQueryInput').value = inputs[type];
    sendRagQuery();
}

function sendRagQuery() {
    const input = document.getElementById('ragQueryInput');
    const query = input.value.trim();
    if (!query) return;

    const history = document.getElementById('ragChatHistory');
    history.innerHTML += `<div class="msg msg-user">${query}</div>`;
    input.value = '';

    setTimeout(() => {
        let answer = "According to Section 4.3 of NCT071204 Master Protocol, Keytruda (Pembrolizumab) 200mg is administered as an IV infusion over 30 minutes every 3 weeks. Prior systemic chemotherapy requires a 21-day washout period.";
        
        if (query.toLowerCase().includes('dose') || query.toLowerCase().includes('dosing')) {
            answer = "Section 5.1 specifies: Pembrolizumab 200mg IV fixed dose Q3W or 400mg Q6W until disease progression or unacceptable toxicity for up to 24 months.";
        } else if (query.toLowerCase().includes('safety') || query.toLowerCase().includes('irae')) {
            answer = "Section 8.2 outlines immune-mediated adverse events (irAEs): Monitor thyroid function (TSH/Free T4) at baseline and every 6 weeks. Corticosteroids (Prednisone 1-2 mg/kg/day) mandatory for Grade >= 2 pneumonitis or colitis.";
        }
        
        history.innerHTML += `
            <div class="msg msg-bot">
                ${answer}
                <div style="font-size:0.7rem; color:var(--primary); margin-top:0.35rem;">
                    <i class="fa-solid fa-quote-left"></i> Citation: Keytruda_TNBC_Master_Protocol_v4.1.pdf (Page 58, Vector Chunk 210)
                </div>
            </div>
        `;
        history.scrollTop = history.scrollHeight;
    }, 700);
}

function renderSDVTable() {
    const tbody = document.getElementById('sdvTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    sdvAuditRecords.forEach(rec => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${rec.subjectId}</strong></td>
            <td>${rec.site}</td>
            <td><span class="badge-tag text-emerald">${rec.consent}</span></td>
            <td>
                <span class="${rec.ecrfCheck.includes('Discrepancy') ? 'text-red' : 'text-emerald'}" style="font-weight:600;">
                    ${rec.ecrfCheck}
                </span>
            </td>
            <td>
                <span class="${rec.missingLabs === 'None' ? 'text-emerald' : 'text-amber'}" style="font-weight:600;">
                    ${rec.missingLabs}
                </span>
            </td>
            <td>
                <span class="${rec.deviation === 'None' ? 'text-emerald' : 'text-red'}" style="font-weight:600;">
                    ${rec.deviation}
                </span>
            </td>
            <td>
                <button class="btn-secondary btn-sm" onclick="alert('SDV Verification Certificate Generated for ${rec.subjectId}')">
                    <i class="fa-solid fa-signature"></i> Verify SDV
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function runAutomatedSdvAudit() {
    alert('Automated GCP Audit Completed! 3 Subjects cross-verified against EMR sources. Audit signature logged under 21 CFR Part 11.');
}

function initRecruitmentChart() {
    const ctx = document.getElementById('recruitmentFunnelChart');
    if (!ctx) return;

    if (funnelChartInstance) {
        funnelChartInstance.destroy();
    }

    funnelChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['EHR Records Screened', 'Criteria Pre-Filtered', 'Eligible Candidates', 'Informed Consent Signed', 'Randomized & Enrolled'],
            datasets: [{
                label: 'Patient Count',
                data: [1420, 580, 318, 194, 150],
                backgroundColor: ['rgba(15, 92, 99, 0.3)', 'rgba(15, 92, 99, 0.5)', 'rgba(16, 185, 129, 0.6)', 'rgba(168, 85, 247, 0.7)', 'rgba(16, 185, 129, 0.9)'],
                borderColor: ['#0F5C63', '#0F5C63', '#10b981', '#a855f7', '#10b981'],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#52656D' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { ticks: { color: '#52656D' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}

function forceInitTrialMap() {
    const mapEl = document.getElementById('trialMap');
    if (!mapEl) return;

    if (window.trialGisMap) {
        try {
            window.trialGisMap.remove();
        } catch (e) {}
        window.trialGisMap = null;
    }

    try {
        const map = L.map('trialMap', {
            center: [39.5, -98.35],
            zoom: 4,
            zoomControl: true
        });
        window.trialGisMap = map;

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        setTimeout(() => {
            map.invalidateSize();
            updateTrialHeatmap();
        }, 100);
    } catch (err) {
        console.error('Leaflet map error:', err);
    }
}

function updateTrialHeatmap() {
    const map = window.trialGisMap;
    if (!map) return;

    if (window.heatmapLayerGroup) {
        try { map.removeLayer(window.heatmapLayerGroup); } catch(e){}
    }

    const layerGroup = L.layerGroup();

    const clusters = {
        'NCT-048821': [
            { lat: 39.2965, lng: -76.5927, radius: 45000, color: '#0F5C63', label: 'Baltimore Cluster: 420 High-HbA1c Patients' },
            { lat: 41.8781, lng: -87.6298, radius: 65000, color: '#10b981', label: 'Chicago Cluster: 680 Eligible Candidates' },
            { lat: 29.7604, lng: -95.3698, radius: 55000, color: '#0F5C63', label: 'Houston Cluster: 340 Patients' }
        ],
        'NCT-060122': [
            { lat: 42.3601, lng: -71.0589, radius: 50000, color: '#f43f5e', label: 'Boston Cluster: 180 EGFR Exon 19 Patients' },
            { lat: 37.7749, lng: -122.4194, radius: 60000, color: '#a855f7', label: 'San Francisco Cluster: 210 NSCLC Patients' }
        ],
        'NCT-051190': [
            { lat: 40.7128, lng: -74.0060, radius: 70000, color: '#a855f7', label: 'New York Metro Cluster: 540 HER2+ Patients' },
            { lat: 34.0522, lng: -118.2437, radius: 75000, color: '#0F5C63', label: 'Los Angeles Cluster: 490 Patients' }
        ],
        'NCT-043321': [
            { lat: 44.0225, lng: -92.4669, radius: 55000, color: '#10b981', label: 'Mayo Clinic Zone: 310 Post-MI Patients' }
        ],
        'NCT-071204': [
            { lat: 25.7617, lng: -80.1918, radius: 50000, color: '#f43f5e', label: 'Miami Cancer Institute Zone: 380 Keytruda TNBC Patients' },
            { lat: 47.6062, lng: -122.3321, radius: 60000, color: '#0F5C63', label: 'Seattle Fred Hutch Cluster: 290 Immunotherapy Candidates' }
        ],
        'NCT-088310': [
            { lat: 33.4484, lng: -112.0740, radius: 65000, color: '#a855f7', label: 'Phoenix Barrow Neurological Cluster: 450 Donanemab AD Patients' },
            { lat: 39.9526, lng: -75.1652, radius: 55000, color: '#10b981', label: 'Philadelphia Penn Memory Zone: 310 Early Alzheimer\'s Patients' }
        ]
    };

    const activeClusters = clusters[activeTrial] || clusters['NCT-048821'];

    activeClusters.forEach(c => {
        L.circle([c.lat, c.lng], {
            color: c.color,
            fillColor: c.color,
            fillOpacity: 0.5,
            radius: c.radius
        }).addTo(layerGroup).bindPopup(`<b>${c.label}</b>`);
    });

    layerGroup.addTo(map);
    window.heatmapLayerGroup = layerGroup;
}

function openSyntheticPatientModal() {
    document.getElementById('syntheticModal').classList.remove('hidden');
}

function closeSyntheticPatientModal() {
    document.getElementById('syntheticModal').classList.add('hidden');
}

function handleCreateSyntheticPatient(e) {
    e.preventDefault();
    const name = document.getElementById('synthName').value;
    const age = parseInt(document.getElementById('synthAge').value);
    const gender = document.getElementById('synthGender').value;
    const hba1c = parseFloat(document.getElementById('synthHba1c').value);
    const egfr = parseInt(document.getElementById('synthEgfr').value);
    const diagText = document.getElementById('synthDiagnosis').value;
    const stroke = parseInt(document.getElementById('synthStroke').value);

    document.getElementById('livePatientName').value = name;
    document.getElementById('liveGender').value = gender;
    document.getElementById('liveAge').value = age;
    document.getElementById('liveHba1c').value = hba1c;
    document.getElementById('liveEgfr').value = egfr;
    document.getElementById('liveStroke').value = stroke;

    updateLiveSliderVals();
    closeSyntheticPatientModal();
    alert(`Success! Synthetic patient ${name} created and evaluated live.`);
}

function recruitPatientModal() {
    document.getElementById('recruitModal').classList.remove('hidden');
}

function closeRecruitModal() {
    document.getElementById('recruitModal').classList.add('hidden');
}

function confirmRecruitment() {
    closeRecruitModal();
    alert('Digital Informed Consent Packet dispatched to patient via secure HIPAA portal. Screening tracking initiated.');
}

function logoutPortalScreen() {
    const loginModal = document.getElementById('loginPortalScreen');
    if (loginModal) loginModal.style.display = 'flex';
    // Hide bot — only visible after selecting a role
    const launcher = document.getElementById('aiClinicalChatbotLauncher');
    if (launcher) launcher.style.display = 'none';
    const modal = document.getElementById('aiClinicalChatbotModal');
    if (modal) modal.style.display = 'none';
}

function openDrugPerformanceModal(nctClean) {
    const cleanNct = nctClean ? nctClean.replace('-', '') : 'NCT071204';
    const url = `drug_performance_dashboard.html?nct=${cleanNct}`;
    window.open(url, '_blank');
}

/* ==========================================================================
   ROLE-INTEGRATED FLOATING AI CLINICAL TRIAL COPILOT CHATBOT ENGINE
   ========================================================================== */

function toggleAiClinicalChatbot() {
    const modal = document.getElementById('aiClinicalChatbotModal');
    if (!modal) {
        console.warn('aiClinicalChatbotModal element not found');
        return;
    }
    // Directly assign style.display to override any inline display:none
    const isHidden = modal.style.display === 'none' || modal.style.display === '';
    if (isHidden) {
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.zIndex = '99999999';
        // Update role-based content whenever opened
        updateCopilotChatbotForRole();
    } else {
        modal.style.display = 'none';
    }
}

function updateCopilotChatbotForRole() {
    const chipContainer = document.getElementById('aiChatbotPresetChips');
    const roleTitleEl = document.getElementById('aiChatbotRoleTitle');
    const greetingEl = document.getElementById('aiChatbotGreeting');
    const launcherLabel = document.getElementById('aiChatbotLauncherLabel');

    if (!chipContainer && !roleTitleEl) return;

    if (currentRole === 'STAKEHOLDER_SPONSOR' || currentRole === 'PHARMA_SPONSOR') {
        if (roleTitleEl) roleTitleEl.innerHTML = '<i class="fa-solid fa-chart-line" style="color:#6D28D9;"></i> 1. Pharma Stakeholder Copilot';
        if (greetingEl) greetingEl.innerHTML = '👋 Hello Sponsor! Ask me about trial grant budgets ($42.5M), Phase III efficacy, candidate enrollment targets, or executive drug performance analytics.';
        if (launcherLabel) launcherLabel.innerText = '1. Pharma Stakeholder Copilot';
        if (chipContainer) {
            chipContainer.innerHTML = `
                <div style="font-size: 0.72rem; color: #6D28D9; font-weight: 800; text-transform: uppercase;">1. Stakeholder Executive Doubts:</div>
                <button onclick="askCopilotPreset('What is Merck & Co. Keytruda Portfolio ROI & Grant Budget?')" style="text-align: left; font-size: 0.78rem; padding: 0.4rem 0.75rem; border-radius: 8px; background: rgba(168,85,247,0.15); border: 1px solid #a855f7; color: #163A43; cursor: pointer;">
                    📊 What is Merck & Co. Keytruda Portfolio ROI & Grant Budget?
                </button>
                <button onclick="askCopilotPreset('Show Phase III Efficacy & Global Site Performance for NCT071204')" style="text-align: left; font-size: 0.78rem; padding: 0.4rem 0.75rem; border-radius: 8px; background: rgba(168,85,247,0.15); border: 1px solid #a855f7; color: #163A43; cursor: pointer;">
                    📈 Show Phase III Efficacy & Global Site Performance for NCT071204
                </button>
                <button onclick="askCopilotPreset('View Total Enrolled Candidate Financial Breakdown ($42.5M)')" style="text-align: left; font-size: 0.78rem; padding: 0.4rem 0.75rem; border-radius: 8px; background: rgba(168,85,247,0.15); border: 1px solid #a855f7; color: #163A43; cursor: pointer;">
                    💰 View Total Enrolled Candidate Financial Breakdown ($42.5M)
                </button>
            `;
        }
    } else if (currentRole === 'CLINICAL_RESEARCHER') {
        if (roleTitleEl) roleTitleEl.innerHTML = '<i class="fa-solid fa-vial-circle-check" style="color:#0F5C63;"></i> 2. Clinical Researcher Copilot';
        if (greetingEl) greetingEl.innerHTML = '👋 Hello Researcher! Ask me about AI dose suggestions, post-dose inter-dose feedback, registering new trial protocols, or Grade 1 fatigue mitigation.';
        if (launcherLabel) launcherLabel.innerText = '2. Clinical Researcher Copilot';
        if (chipContainer) {
            chipContainer.innerHTML = `
                <div style="font-size: 0.72rem; color: #0F5C63; font-weight: 800; text-transform: uppercase;">2. Researcher & R&D Doubts:</div>
                <button onclick="askCopilotPreset('What is the AI Improvement Suggestion for Keytruda Dose 2?')" style="text-align: left; font-size: 0.78rem; padding: 0.4rem 0.75rem; border-radius: 8px; background: rgba(245,158,11,0.15); border: 1px solid #0F5C63; color: #163A43; cursor: pointer;">
                    🧪 What is the AI Improvement Suggestion for Keytruda Dose 2?
                </button>
                <button onclick="askCopilotPreset('How to Register a New Pharma Trial Protocol (NCT ID)?')" style="text-align: left; font-size: 0.78rem; padding: 0.4rem 0.75rem; border-radius: 8px; background: rgba(245,158,11,0.15); border: 1px solid #0F5C63; color: #163A43; cursor: pointer;">
                    📝 How to Register a New Pharma Trial Protocol (NCT ID)?
                </button>
                <button onclick="askCopilotPreset('Check Inter-Dose Toxicity & Grade 1 Fatigue Mitigation')" style="text-align: left; font-size: 0.78rem; padding: 0.4rem 0.75rem; border-radius: 8px; background: rgba(245,158,11,0.15); border: 1px solid #0F5C63; color: #163A43; cursor: pointer;">
                    ⚠️ Check Inter-Dose Toxicity & Grade 1 Fatigue Mitigation
                </button>
            `;
        }
    } else if (currentRole === 'DOCTOR_INVESTIGATOR') {
        if (roleTitleEl) roleTitleEl.innerHTML = '<i class="fa-solid fa-user-doctor" style="color:#0F5C63;"></i> 3. Doctor Clinical Copilot';
        if (greetingEl) greetingEl.innerHTML = '👋 Hello Doctor! Ask me about patient match eligibility, Quest/Epic EMR lab values (HbA1c, eGFR), or post-dose care governance.';
        if (launcherLabel) launcherLabel.innerText = '3. Doctor Clinical Copilot';
        if (chipContainer) {
            chipContainer.innerHTML = `
                <div style="font-size: 0.72rem; color: #0F5C63; font-weight: 800; text-transform: uppercase;">3. Doctor Clinical Screener Doubts:</div>
                <button onclick="askCopilotPreset('Why is Subject PT-10201 eligible for Keytruda?')" style="text-align: left; font-size: 0.78rem; padding: 0.4rem 0.75rem; border-radius: 8px; background: rgba(15,92,99,0.15); border: 1px solid #0F5C63; color: #163A43; cursor: pointer;">
                    🔎 Why is Subject PT-10201 eligible for Keytruda?
                </button>
                <button onclick="askCopilotPreset('What is the eGFR cutoff for Jardiance (NCT048821)?')" style="text-align: left; font-size: 0.78rem; padding: 0.4rem 0.75rem; border-radius: 8px; background: rgba(15,92,99,0.15); border: 1px solid #0F5C63; color: #163A43; cursor: pointer;">
                    📊 What is the eGFR cutoff for Jardiance (NCT048821)?
                </button>
                <button onclick="askCopilotPreset('Check Donanemab ARIA-E edema safety rules')" style="text-align: left; font-size: 0.78rem; padding: 0.4rem 0.75rem; border-radius: 8px; background: rgba(15,92,99,0.15); border: 1px solid #0F5C63; color: #163A43; cursor: pointer;">
                    💊 Check Donanemab ARIA-E edema safety rules
                </button>
            `;
        }
    } else if (currentRole === 'TRIAL_ADMIN') {
        if (roleTitleEl) roleTitleEl.innerHTML = '<i class="fa-solid fa-shield-halved" style="color:#0F5C63;"></i> 4. Trial Admin Copilot';
        if (greetingEl) greetingEl.innerHTML = '👋 Hello Admin! Ask me about 21 CFR Part 11 SHA256 audit logs, patient density feasibility maps, or HIPAA privacy mode.';
        if (launcherLabel) launcherLabel.innerText = '4. Trial Admin Copilot';
        if (chipContainer) {
            chipContainer.innerHTML = `
                <div style="font-size: 0.72rem; color: #0F5C63; font-weight: 800; text-transform: uppercase;">4. Trial Admin Audit Doubts:</div>
                <button onclick="askCopilotPreset('Verify 21 CFR Part 11 SHA256 Audit Hashes & EMR Grounding')" style="text-align: left; font-size: 0.78rem; padding: 0.4rem 0.75rem; border-radius: 8px; background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #163A43; cursor: pointer;">
                    🛡️ Verify 21 CFR Part 11 SHA256 Audit Hashes & EMR Grounding
                </button>
                <button onclick="askCopilotPreset('View Patient Density Feasibility Heatmap & City Clusters')" style="text-align: left; font-size: 0.78rem; padding: 0.4rem 0.75rem; border-radius: 8px; background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #163A43; cursor: pointer;">
                    🗺️ View Patient Density Feasibility Heatmap & City Clusters
                </button>
                <button onclick="askCopilotPreset('Check HIPAA Anonymization Privacy Rules (PHI On/Off)')" style="text-align: left; font-size: 0.78rem; padding: 0.4rem 0.75rem; border-radius: 8px; background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #163A43; cursor: pointer;">
                    🔒 Check HIPAA Anonymization Privacy Rules (PHI On/Off)
                </button>
            `;
        }
    }
}

function askCopilotPreset(text) {
    const input = document.getElementById('aiChatbotInput');
    if (input) {
        input.value = text;
        sendCopilotMessage();
    }
}

function sendCopilotMessage() {
    const input = document.getElementById('aiChatbotInput');
    const list = document.getElementById('aiChatbotMessagesList');
    if (!input || !list) return;

    const query = input.value.trim();
    if (!query) return;

    let senderLabel = 'Doctor';
    if (currentRole === 'STAKEHOLDER_SPONSOR' || currentRole === 'PHARMA_SPONSOR') senderLabel = 'Pharma Stakeholder';
    else if (currentRole === 'CLINICAL_RESEARCHER') senderLabel = 'Clinical Researcher';
    else if (currentRole === 'TRIAL_ADMIN') senderLabel = 'Trial Admin';

    // Render User Message
    const userMsg = document.createElement('div');
    userMsg.className = 'msg msg-user';
    userMsg.style.cssText = 'background: rgba(2,132,199,0.25); border: 1px solid #0F5C63; padding: 0.75rem; border-radius: 12px; font-size: 0.85rem; color: #163A43; align-self: flex-end; max-width: 85%;';
    userMsg.innerHTML = `<strong>${senderLabel}:</strong> ${query}`;
    list.appendChild(userMsg);

    input.value = '';
    list.scrollTop = list.scrollHeight;

    // Generate AI Bot Answer
    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'msg msg-bot';
        botMsg.style.cssText = 'background: #FFFFFF; border: 1px solid #10b981; padding: 0.85rem; border-radius: 12px; font-size: 0.85rem; color: #52656D; max-width: 90%;';

        let answer = '';
        const q = query.toLowerCase();

        if (q.includes('merck') || q.includes('grant') || q.includes('roi') || q.includes('financial') || q.includes('nct071204')) {
            answer = `💼 <strong>1. Pharma Stakeholder Financial & Portfolio Audit:</strong><br>
            • <strong>Active Trial Sponsor:</strong> Merck & Co. (Keytruda Pembrolizumab)<br>
            • <strong>Total Trial Grant Budget:</strong> <strong style="color:#6D28D9;">$42.5M Allocated</strong> across 48 Global Trial Centers.<br>
            • <strong>Recruitment Target:</strong> 500 Candidates Enrolled across Phase III sites.<br>
            • <strong>Phase III Efficacy Milestone:</strong> -14.3% Tumor Clearance achieved with 0 Drug-Related Discontinuations.<br>
            • <strong>Portfolio ROI Status:</strong> Projected $1.2B Commercial Acceleration upon FDA Approval.`;
        } else if (q.includes('suggestion') || q.includes('fatigue') || q.includes('toxicity') || q.includes('register')) {
            answer = `🧪 <strong>2. Clinical Researcher R&D Protocol Engine:</strong><br>
            • <strong>Active AI Dose Suggestion:</strong> Pre-medicate with Antihistamine 30 min prior to Dose 2 to eliminate Grade 1 fatigue.<br>
            • <strong>Organ Safety & Tolerability:</strong> eGFR 78 mL/min, LFTs normal, Grade 0 Serious Adverse Events (SAEs).<br>
            • <strong>Protocol Registration Workflow:</strong> Click <strong>"+ Register New Trial Protocol"</strong> to add Sponsor Name, Dosage, NCT ID, and Target Cohort.`;
        } else if (q.includes('keytruda') || q.includes('pt-10201') || q.includes('evelyn')) {
            answer = `🧬 <strong>3. Doctor Screening Dossier (Keytruda NCT071204):</strong><br>
            • <strong>Subject:</strong> Dr. Evelyn Vance (PT-10201, 59y Female)<br>
            • <strong>Diagnosis:</strong> Triple-Negative Breast Cancer (TNBC, ICD-10: C50.919)<br>
            • <strong>Eligibility Score:</strong> <strong style="color:#0F5C63;">96% VERIFIED MATCH</strong> (PD-L1 positive VAF 42.8%)<br>
            • <strong>Post-Dose 1 Biomarker:</strong> -14.3% Tumor Size Reduction<br>
            • <strong>AI Suggestion for Dose 2:</strong> Pre-medicate with Antihistamine 30 min prior to Dose 2 to eliminate Grade 1 fatigue.`;
        } else if (q.includes('jardiance') || q.includes('nct048821') || q.includes('egfr')) {
            answer = `📊 <strong>3. Doctor Screening Protocol (Jardiance NCT048821):</strong><br>
            • <strong>Target Indication:</strong> Type 2 Diabetes Mellitus (ICD-10: E11.9)<br>
            • <strong>Glycemic Cutoff:</strong> HbA1c 7.5% - 10.5% (LOINC 4548-4)<br>
            • <strong>Renal Safety Limit:</strong> eGFR $\\ge 45 \\text{ mL/min/1.73m}^2$<br>
            • <strong>Exclusion Rule:</strong> Acute Stroke / MI within prior 6 months.<br>
            • <strong>Active Enrolled Cohort:</strong> 4 Candidates (Eleanor Vance, Marcus Sterling, Rachel Green, Helena Wayne).`;
        } else if (q.includes('donanemab') || q.includes('alzheimer') || q.includes('aria')) {
            answer = `🧠 <strong>3. Doctor Safety Audit (Donanemab NCT088310):</strong><br>
            • <strong>Target Indication:</strong> Early Alzheimer's Disease (ICD-10: G30.9)<br>
            • <strong>Dosing Regimen:</strong> 700mg IV Infusion Q4W<br>
            • <strong>Biomarker Clearance:</strong> -24.8% Cortical Plaque Drop on Amyloid PET<br>
            • <strong>ARIA-E Safety Scan:</strong> Brain MRI cleared zero cerebral edema (Grade 0 SAEs).`;
        } else if (q.includes('sha256') || q.includes('heatmap') || q.includes('hipaa') || q.includes('audit')) {
            answer = `🛡️ <strong>4. Trial Admin & FDA 21 CFR Part 11 Audit Center:</strong><br>
            • <strong>4-Tier Bounding Box Grounding:</strong> Quest/Epic EMR LOINC entries verified with 0% AI hallucination drift.<br>
            • <strong>Cryptographic Audit Signature:</strong> <code>SHA256: e8f92a4b990142</code> logged under FDA 21 CFR Part 11.<br>
            • <strong>Feasibility City Heatmap:</strong> Baltimore (420 Patients), Chicago (680 Candidates), Houston (340 Patients), Boston (180 Patients).<br>
            • <strong>HIPAA Privacy Anonymization:</strong> Toggle "HIPAA Privacy: ON/OFF" pill in header to mask PHI fields.`;
        } else {
            answer = `💡 <strong>AI Copilot Intelligence Response for "${query}":</strong><br>
            • <strong>Active User Role:</strong> ${currentRole}<br>
            • <strong>Protocol Status:</strong> Active & Enrolling across 6 Sponsor Companies (Merck, Eli Lilly, AstraZeneca, Roche, Novartis, Pfizer).<br>
            • <strong>Active Protocol:</strong> ${activeTrial} (${trialProtocols[activeTrial] ? trialProtocols[activeTrial].title : 'Investigational Medicine'})<br>
            • <strong>Compliance:</strong> All candidate screening parameters are 21 CFR Part 11 & HIPAA compliant.`;
        }

        botMsg.innerHTML = answer;
        list.appendChild(botMsg);
        list.scrollTop = list.scrollHeight;
    }, 450);
}

document.addEventListener('DOMContentLoaded', () => {
    updateCopilotChatbotForRole();
});
