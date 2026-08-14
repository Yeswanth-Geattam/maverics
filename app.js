/* ==========================================================================
   CuraMatch AI Enterprise Pro - Advanced Logic & Clinical AI Engine
   ========================================================================== */

// Global State
let activeTrial = 'NCT-048821';
let selectedPatientId = 'P-101';
let funnelChartInstance = null;
let activeDocRepo = 'master';

// Advanced FHIR Patient Store
const patients = {
    'P-101': {
        id: 'PT-10029',
        name: 'Eleanor Vance',
        age: 62,
        gender: 'Female',
        diagnosis: 'Type 2 Diabetes Mellitus (ICD-10: E11.9)',
        icd10: 'E11.9',
        hba1c: '8.4%',
        hba1cNum: 8.4,
        egfr: '58 mL/min/1.73m²',
        egfrNum: 58,
        strokeHistory: 'None',
        strokeMonthsAgo: 999,
        lvef: '55%',
        alt: '24 U/L (Normal)',
        t1d: false,
        her2Status: 'N/A',
        egfrGene: 'Wildtype',
        pdL1Score: '12%',
        medications: ['Metformin 1000mg BID', 'Atorvastatin 20mg QD'],
        lastLabDate: '2026-07-28'
    },
    'P-102': {
        id: 'PT-10034',
        name: 'Marcus Sterling',
        age: 48,
        gender: 'Male',
        diagnosis: 'Type 2 Diabetes Mellitus (ICD-10: E11.9), Essential Hypertension',
        icd10: 'E11.9',
        hba1c: '8.6%',
        hba1cNum: 8.6,
        egfr: '65 mL/min/1.73m²',
        egfrNum: 65,
        strokeHistory: 'None',
        strokeMonthsAgo: 999,
        lvef: '60%',
        alt: '28 U/L (Normal)',
        t1d: false,
        her2Status: 'N/A',
        egfrGene: 'Wildtype',
        pdL1Score: '5%',
        medications: ['Metformin 500mg BID', 'Lisinopril 10mg QD'],
        lastLabDate: '2026-08-02'
    },
    'P-103': {
        id: 'PT-10041',
        name: 'Sophia Lin',
        age: 55,
        gender: 'Female',
        diagnosis: 'HER2+ Metastatic Breast Cancer (ICD-10: C50.911)',
        icd10: 'C50.911',
        hba1c: '5.6%',
        hba1cNum: 5.6,
        egfr: '72 mL/min/1.73m²',
        egfrNum: 72,
        strokeHistory: 'None',
        strokeMonthsAgo: 999,
        lvef: '58%',
        alt: '22 U/L (Normal)',
        t1d: false,
        her2Status: 'HER2+ (IHC 3+)',
        egfrGene: 'N/A',
        pdL1Score: '45%',
        medications: ['Trastuzumab + Pertuzumab'],
        lastLabDate: '2026-08-10'
    },
    'P-104': {
        id: 'PT-10059',
        name: 'David Miller',
        age: 71,
        gender: 'Male',
        diagnosis: 'Type 2 Diabetes Mellitus, Prior Ischemic Stroke',
        icd10: 'E11.9, I63.9',
        hba1c: '7.9%',
        hba1cNum: 7.9,
        egfr: '38 mL/min/1.73m²',
        egfrNum: 38,
        strokeHistory: 'Ischemic Stroke (4 months ago)',
        strokeMonthsAgo: 4,
        lvef: '48%',
        alt: '31 U/L',
        t1d: false,
        her2Status: 'N/A',
        egfrGene: 'Wildtype',
        pdL1Score: '0%',
        medications: ['Metformin', 'Clopidogrel 75mg QD'],
        lastLabDate: '2026-06-15'
    },
    'P-105': {
        id: 'PT-10088',
        name: 'Dr. Aris Thorne',
        age: 66,
        gender: 'Male',
        diagnosis: 'Non-Small Cell Lung Cancer (NSCLC Exon 19 del)',
        icd10: 'C34.90',
        hba1c: '5.4%',
        hba1cNum: 5.4,
        egfr: '81 mL/min/1.73m²',
        egfrNum: 81,
        strokeHistory: 'None',
        strokeMonthsAgo: 999,
        lvef: '62%',
        alt: '20 U/L',
        t1d: false,
        her2Status: 'HER2-',
        egfrGene: 'EGFR Exon 19 Deletion (Positive)',
        pdL1Score: '65% (TPS)',
        medications: ['Osimertinib 80mg QD'],
        lastLabDate: '2026-08-12'
    }
};

// Protocol Logic Definitions
const trialProtocols = {
    'NCT-048821': {
        title: 'NCT048821: Phase III SGLT2i Type 2 Diabetes Trial',
        minAge: 18, maxAge: 75, minHba1c: 7.5, maxHba1c: 10.5, minEgfr: 45, strokeExclusionMonths: 6
    },
    'NCT-051190': {
        title: 'NCT051190: HER2+ Advanced Breast Cancer Immunotherapy',
        minAge: 18, maxAge: 80, minHba1c: 0, maxHba1c: 14, minEgfr: 50, strokeExclusionMonths: 3
    },
    'NCT-043321': {
        title: 'NCT043321: Post-MI Cardiac Remodeling & LVEF Study',
        minAge: 21, maxAge: 85, minHba1c: 0, maxHba1c: 14, minEgfr: 30, strokeExclusionMonths: 1
    },
    'NCT-060122': {
        title: 'NCT060122: NSCLC EGFR Exon 19 Deletion Targeted Therapy',
        minAge: 18, maxAge: 80, minHba1c: 0, maxHba1c: 14, minEgfr: 45, strokeExclusionMonths: 3
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
    initTabs();
    evaluateSelectedPatient();
    renderFhirResource('Patient');
    runCriteriaExtraction();
    renderSDVTable();
    initRecruitmentChart();
    initTrialMap();
});

/* Tabs */
function initTabs() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            navBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

            btn.classList.add('active');
            const target = document.getElementById(tabId);
            if (target) target.classList.add('active');

            if (tabId === 'trial-dashboard') {
                setTimeout(() => {
                    if (window.trialGisMap) window.trialGisMap.invalidateSize();
                }, 200);
            }
        });
    });
}

function switchTrialProtocol() {
    activeTrial = document.getElementById('activeTrialSelect').value;
    evaluateSelectedPatient();
}

/* ==========================================================================
   Patient Screening & AI Matching Engine Algorithm
   ========================================================================== */

function evaluateSelectedPatient() {
    selectedPatientId = document.getElementById('patientSelect').value;
    const patient = patients[selectedPatientId];
    const trial = trialProtocols[activeTrial];

    if (!patient || !trial) return;

    // Render Patient Dossier Card
    const profileBox = document.getElementById('patientProfileCard');
    profileBox.innerHTML = `
        <div class="profile-header-row">
            <div class="profile-name">
                <h4>${patient.name} <span style="font-size:0.8rem; font-weight:600; color:var(--text-muted);">(${patient.id})</span></h4>
                <span class="profile-meta">${patient.age} yrs • ${patient.gender} • ${patient.diagnosis}</span>
            </div>
            <span class="badge-tag"><i class="fa-solid fa-calendar-check"></i> Lab Date: ${patient.lastLabDate}</span>
        </div>

        <div class="vitals-grid">
            <div class="vital-card">
                <span class="vital-label">HbA1c Level</span>
                <span class="vital-val">${patient.hba1c}</span>
            </div>
            <div class="vital-card">
                <span class="vital-label">eGFR (Renal Function)</span>
                <span class="vital-val">${patient.egfr}</span>
            </div>
            <div class="vital-card">
                <span class="vital-label">Cardiac LVEF</span>
                <span class="vital-val">${patient.lvef}</span>
            </div>
            <div class="vital-card">
                <span class="vital-label">Stroke History</span>
                <span class="vital-val" style="font-size:0.8rem; color:${patient.strokeMonthsAgo < 6 ? 'var(--danger)' : 'var(--text-main)'};">
                    ${patient.strokeHistory}
                </span>
            </div>
            <div class="vital-card">
                <span class="vital-label">Liver ALT</span>
                <span class="vital-val" style="font-size:0.8rem;">${patient.alt}</span>
            </div>
            <div class="vital-card">
                <span class="vital-label">Genomic EGFR / PD-L1</span>
                <span class="vital-val" style="font-size:0.78rem;">${patient.egfrGene} (${patient.pdL1Score})</span>
            </div>
        </div>

        <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.3rem;">
            <strong>Active Medications:</strong> ${patient.medications.join(', ')}
        </div>
    `;

    // Rule Evaluation Engine
    let isEligible = true;
    let failReasons = [];
    let criteriaResults = [];

    if (activeTrial === 'NCT-048821') {
        const agePass = patient.age >= trial.minAge && patient.age <= trial.maxAge;
        criteriaResults.push({ label: 'Age (18-75 years)', pass: agePass, note: `Patient age: ${patient.age}` });
        if (!agePass) isEligible = false;

        const hba1cPass = patient.hba1cNum >= trial.minHba1c && patient.hba1cNum <= trial.maxHba1c;
        criteriaResults.push({ label: 'Type 2 Diabetes with HbA1c 7.5% - 10.5%', pass: hba1cPass, note: `Patient HbA1c: ${patient.hba1c}` });
        if (!hba1cPass) isEligible = false;

        const egfrPass = patient.egfrNum >= trial.minEgfr;
        criteriaResults.push({ label: 'Renal Safety (eGFR >= 45 mL/min)', pass: egfrPass, note: `Patient eGFR: ${patient.egfrNum}` });
        if (!egfrPass) { isEligible = false; failReasons.push('eGFR below 45 safety limit'); }

        const strokePass = patient.strokeMonthsAgo >= trial.strokeExclusionMonths;
        criteriaResults.push({ label: 'EXCLUSION: No Stroke within past 6 months', pass: strokePass, note: strokePass ? 'No recent stroke' : `Stroke recorded ${patient.strokeMonthsAgo} mos ago` });
        if (!strokePass) { isEligible = false; failReasons.push('Stroke recorded within last 6 months (Hard Exclusion)'); }
    } else if (activeTrial === 'NCT-051190') {
        const her2Pass = patient.her2Status.includes('HER2+');
        criteriaResults.push({ label: 'HER2+ Tumor Status', pass: her2Pass, note: patient.her2Status });
        if (!her2Pass) isEligible = false;
    } else if (activeTrial === 'NCT-060122') {
        const egfrGenePass = patient.egfrGene.includes('Exon 19');
        criteriaResults.push({ label: 'EGFR Exon 19 Deletion Biomarker', pass: egfrGenePass, note: patient.egfrGene });
        if (!egfrGenePass) isEligible = false;
    } else {
        criteriaResults.push({ label: 'Recent Myocardial Infarction', pass: false, note: 'No recent MI in record' });
        isEligible = false;
    }

    // Update Scorecard UI
    const scoreValEl = document.getElementById('matchScoreVal');
    const scoreCircle = document.getElementById('matchScoreCircle');
    const heading = document.getElementById('matchStatusHeading');
    const subText = document.getElementById('matchSubText');

    if (isEligible) {
        scoreValEl.textContent = '94%';
        scoreCircle.className = 'score-circle score-high';
        heading.className = 'status-eligible';
        heading.innerHTML = '<i class="fa-solid fa-circle-check"></i> HIGH ELIGIBILITY MATCH';
        subText.textContent = `Patient ${patient.name} satisfies all inclusion criteria & safety rules for ${activeTrial}.`;
        document.getElementById('vectorConfVal').textContent = '94.8%';
        document.getElementById('vectorConfFill').style.width = '94.8%';
    } else {
        scoreValEl.textContent = '0%';
        scoreCircle.className = 'score-circle score-fail';
        heading.className = 'status-excluded';
        heading.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> EXCLUDED / INELIGIBLE';
        subText.textContent = `Patient excluded due to: ${failReasons.join('; ') || 'Criteria mismatch for selected protocol'}.`;
        document.getElementById('vectorConfVal').textContent = '12.4%';
        document.getElementById('vectorConfFill').style.width = '12.4%';
    }

    // Render Criteria List
    const criteriaListEl = document.getElementById('criteriaList');
    criteriaListEl.innerHTML = '';
    criteriaResults.forEach(res => {
        const div = document.createElement('div');
        div.className = `criteria-item ${res.pass ? 'pass' : 'fail'}`;
        div.innerHTML = `
            <div>
                <strong>${res.label}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted);">${res.note}</div>
            </div>
            <span class="criteria-status ${res.pass ? 'pass' : 'fail'}">
                ${res.pass ? '<i class="fa-solid fa-check"></i> PASS' : '<i class="fa-solid fa-xmark"></i> FAIL'}
            </span>
        `;
        criteriaListEl.appendChild(div);
    });
}

/* ==========================================================================
   FHIR R4 Dossier Explorer
   ========================================================================== */

function selectFhirResource(resourceType) {
    document.querySelectorAll('.fhir-res-item').forEach(i => i.classList.remove('active'));
    event.currentTarget.classList.add('active');
    renderFhirResource(resourceType);
}

function renderFhirResource(resourceType) {
    const patient = patients[selectedPatientId] || patients['P-101'];
    let jsonOutput = {};

    if (resourceType === 'Patient') {
        jsonOutput = {
            resourceType: "Patient",
            id: patient.id,
            active: true,
            name: [{ use: "official", family: patient.name.split(' ')[1] || "Vance", given: [patient.name.split(' ')[0]] }],
            gender: patient.gender.toLowerCase(),
            birthDate: `${2026 - patient.age}-04-12`,
            address: [{ city: "Boston", state: "MA", country: "USA" }]
        };
    } else if (resourceType === 'Condition') {
        jsonOutput = {
            resourceType: "Condition",
            id: `cond-${patient.id}`,
            clinicalStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }] },
            code: { coding: [{ system: "http://hl7.org/fhir/sid/icd-10-cm", code: patient.icd10, display: patient.diagnosis }] },
            subject: { reference: `Patient/${patient.id}` }
        };
    } else if (resourceType === 'Observation') {
        jsonOutput = {
            resourceType: "Observation",
            id: `obs-hba1c-${patient.id}`,
            status: "final",
            code: { coding: [{ system: "http://loinc.org", code: "4548-4", display: "HbA1c in Blood" }] },
            subject: { reference: `Patient/${patient.id}` },
            valueQuantity: { value: patient.hba1cNum, unit: "%", system: "http://unitsofmeasure.org", code: "%" }
        };
    } else {
        jsonOutput = {
            resourceType: "MedicationStatement",
            id: `med-${patient.id}`,
            status: "active",
            medicationCodeableConcept: { text: patient.medications.join(', ') },
            subject: { reference: `Patient/${patient.id}` }
        };
    }

    document.getElementById('fhirJsonDisplay').textContent = JSON.stringify(jsonOutput, null, 2);
}

function copyFhirJson() {
    const text = document.getElementById('fhirJsonDisplay').textContent;
    navigator.clipboard.writeText(text);
    alert('FHIR JSON copied to clipboard!');
}

/* ==========================================================================
   Protocol Criteria Extraction Engine & Visual Graph Node
   ========================================================================== */

function runCriteriaExtraction() {
    const rawText = document.getElementById('rawProtocolText').value;

    const extractedSchema = {
        protocolId: "NCT048821",
        targetIndication: "Type 2 Diabetes Mellitus",
        extractedLogicTree: {
            demographics: { minAge: 18, maxAge: 75 },
            requiredLabBounds: [
                { labName: "HbA1c", min: 7.5, max: 10.5, unit: "%" },
                { labName: "eGFR", min: 45, unit: "mL/min/1.73m2" }
            ],
            exclusionConditions: [
                { disease: "Ischemic Stroke", maxRecencyMonths: 6 },
                { disease: "Type 1 Diabetes Mellitus", constraint: "STRICT_EXCLUSION" }
            ]
        },
        confidence: 0.984
    };

    document.getElementById('schemaJsonOutput').textContent = JSON.stringify(extractedSchema, null, 2);

    // Render Visual Logic Node Graph
    const graphBox = document.getElementById('logicGraphContainer');
    graphBox.innerHTML = `
        <div class="node-group">
            <span><i class="fa-solid fa-cake-candles text-cyan"></i> Age Rule: 18 <= Patient.Age <= 75</span>
            <span class="node-operator">AND</span>
        </div>
        <div class="node-group">
            <span><i class="fa-solid fa-vial text-emerald"></i> Lab Bounds: 7.5% <= HbA1c <= 10.5%</span>
            <span class="node-operator">AND</span>
        </div>
        <div class="node-group">
            <span><i class="fa-solid fa-kidneys text-emerald"></i> Safety: eGFR >= 45 mL/min/1.73m²</span>
            <span class="node-operator">AND NOT</span>
        </div>
        <div class="node-group" style="border-left:4px solid var(--danger);">
            <span><i class="fa-solid fa-ban text-red"></i> Exclusion: Prior Stroke (< 6 Months) OR T1D</span>
            <span class="node-operator" style="background:var(--danger);">EVAL PASSED</span>
        </div>
    `;
}

/* ==========================================================================
   Research Document RAG Query Engine
   ========================================================================== */

function selectDocRepo(repoKey) {
    document.querySelectorAll('.doc-item').forEach(i => i.classList.remove('active'));
    event.currentTarget.classList.add('active');
    activeDocRepo = repoKey;
}

function askPresetQuery(type) {
    const inputs = {
        washout: "What is the baseline Metformin washout period required?",
        dosage: "What is the investigational drug dosing protocol?",
        safety: "What are the primary safety endpoints and adverse event protocols?"
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
        let answer = "According to Section 4.3 of NCT048821 Master Protocol, baseline Metformin therapy should be maintained at a stable dose (>= 1000mg/day) for at least 8 weeks prior to screening. No washout is required for Metformin, but sulfonylureas require a 14-day washout period.";
        
        if (query.toLowerCase().includes('dose') || query.toLowerCase().includes('dosing')) {
            answer = "Section 5.1 specifies: Investigation drug (SGLT2i 10mg) administered orally once daily in the morning with or without food. Double-blind placebo control arms 1:1 ratio.";
        } else if (query.toLowerCase().includes('safety')) {
            answer = "Section 8.2 outlines safety monitoring: eGFR lab monitoring at Week 4, 12, 24; hepatic ALT/AST monitoring; mandatory reporting of any SAE within 24 hours to IRB.";
        }
        
        history.innerHTML += `
            <div class="msg msg-bot">
                ${answer}
                <div style="font-size:0.7rem; color:var(--primary); margin-top:0.4rem;">
                    <i class="fa-solid fa-quote-left"></i> Citation: NCT048821_Master_Protocol_v3.2.pdf (Page 42, Vector Chunk 104)
                </div>
            </div>
        `;
        history.scrollTop = history.scrollHeight;
    }, 700);
}

/* ==========================================================================
   SDV & GCP Audit Table
   ========================================================================== */

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

/* ==========================================================================
   Trial Command Center Charts & Maps
   ========================================================================== */

function initRecruitmentChart() {
    const ctx = document.getElementById('recruitmentFunnelChart');
    if (!ctx) return;

    funnelChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['EHR Records Screened', 'Criteria Pre-Filtered', 'Eligible Candidates', 'Informed Consent Signed', 'Randomized & Enrolled'],
            datasets: [{
                label: 'Patient Count',
                data: [1420, 580, 318, 194, 150],
                backgroundColor: ['rgba(0, 242, 254, 0.3)', 'rgba(0, 242, 254, 0.5)', 'rgba(16, 185, 129, 0.6)', 'rgba(114, 9, 183, 0.7)', 'rgba(16, 185, 129, 0.9)'],
                borderColor: ['#00f2fe', '#00f2fe', '#10b981', '#7209b7', '#10b981'],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}

function initTrialMap() {
    const mapEl = document.getElementById('trialMap');
    if (!mapEl) return;

    const map = L.map('trialMap').setView([20.0, 0.0], 2);
    window.trialGisMap = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 18
    }).addTo(map);

    const sites = [
        { name: 'Johns Hopkins Hospital (Site 01)', lat: 39.2965, lng: -76.5927, patients: 84 },
        { name: 'Mayo Clinic Rochester (Site 03)', lat: 44.0225, lng: -92.4669, patients: 62 },
        { name: 'Charité Universitätsmedizin Berlin (Site 02)', lat: 52.5251, lng: 13.3779, patients: 45 },
        { name: 'Singapore General Hospital (Site 05)', lat: 1.2794, lng: 103.8349, patients: 38 }
    ];

    sites.forEach(s => {
        L.circleMarker([s.lat, s.lng], {
            radius: 8,
            fillColor: '#00f2fe',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.85
        }).addTo(map).bindPopup(`<b>${s.name}</b><br>Enrolled Subjects: ${s.patients}`);
    });
}

/* Modals & Custom Patient Generator */
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
    const diag = document.getElementById('synthDiagnosis').value;
    const stroke = parseInt(document.getElementById('synthStroke').value);

    const newId = `P-${Math.floor(200 + Math.random() * 800)}`;
    patients[newId] = {
        id: `PT-${Math.floor(20000 + Math.random() * 80000)}`,
        name: name,
        age: age,
        gender: gender,
        diagnosis: diag,
        icd10: 'E11.9',
        hba1c: `${hba1c}%`,
        hba1cNum: hba1c,
        egfr: `${egfr} mL/min/1.73m²`,
        egfrNum: egfr,
        strokeHistory: stroke < 6 ? `Ischemic Stroke (${stroke} mos ago)` : 'None',
        strokeMonthsAgo: stroke,
        lvef: '56%',
        alt: '25 U/L',
        t1d: false,
        her2Status: 'N/A',
        egfrGene: 'Wildtype',
        pdL1Score: '10%',
        medications: ['Metformin 1000mg BID'],
        lastLabDate: '2026-08-14'
    };

    const sel = document.getElementById('patientSelect');
    const opt = document.createElement('option');
    opt.value = newId;
    opt.textContent = `${patients[newId].id}: ${name} (${age}y, ${gender.charAt(0)}) - ${diag}`;
    sel.appendChild(opt);
    sel.value = newId;

    closeSyntheticPatientModal();
    evaluateSelectedPatient();
    alert(`Success! Synthetic patient ${name} registered in FHIR store and evaluated.`);
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
