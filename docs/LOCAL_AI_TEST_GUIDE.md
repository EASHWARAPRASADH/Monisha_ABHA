# Step-by-Step Testing & Verification Guide: On-Premise Local AI Feature

> **System:** IVR-Based Token Booking System Integrated with ABHA for Government Hospitals  
> **Subsystem:** On-Premise Clinical AI Triage & Queue Intelligence  
> **Architecture Guarantee:** 100% On-Premise Sovereign Execution (Ollama `llama3.2` + Embedded Clinical NLP Fallback). Zero Cloud API Transmission of Protected Health Information (PHI).

---

## 1. Quick Verification Matrix

| Step | Test Objective | Target URL / Action | Expected Result | Screenshot Reference |
| :---: | :--- | :--- | :--- | :---: |
| **Step 1** | AI Telemetry & Health Check | `http://localhost:5173/settings` | Green status: Connected, Local Port 11434, ABDM Sovereignty Verified | `step1_ai_diagnostics.png` |
| **Step 2** | Routine Clinical Triage | `http://localhost:5173/ivr-simulator` | Orthopaedics dept recommended, `ROUTINE` badge, 95% confidence | `step2_ai_symptom_triage.png` |
| **Step 3** | Emergency Red-Flag Triage | `http://localhost:5173/ivr-simulator` | Critical Emergency warning, Cardiology triage, 108 Ambulance alert | `step3_emergency_redflag.png` |
| **Step 4** | Token Queue with AI Badges | `http://localhost:5173/tokens` | Queue table displays `⚡ PRIORITY` and `ROUTINE` badges with ABHA ID | `step4_token_queue_ai_badges.png` |
| **Step 5** | Clinical Briefing & FHIR Note | Click **AI Brief** on Token | Modal opens with 4 doctor questions & copyable ABDM FHIR clinical note | `step5_ai_clinical_brief_modal.png` |

---

## Step 1: Verify AI System Telemetry & Data Sovereignty

Open the **Hospital Settings & Telemetry Portal**:
- **URL:** [http://localhost:5173/settings](http://localhost:5173/settings) (or with auto-auth: `http://localhost:5173/settings?evalAuth=admin`)
- Navigate to the **"Local AI & Triage Telemetry"** tab.

![Step 1 - AI System Diagnostics & Telemetry](screenshots/step1_ai_diagnostics.png)

### What to verify:
1. **Engine Status:** Status chip displays `Connected` with green indicator.
2. **Local Model Engine:** Indicates `Ollama (llama3.2)` or `Embedded Clinical NLP Ontology (Active Fallback)`.
3. **Endpoint Address:** Shows local loopback binding (`http://localhost:11434/api/generate`).
4. **Data Sovereignty Guarantee:** Prominently affirms that **zero patient health data leaves the local hospital premises**, fully compliant with ABDM Health Data Management Policy.
5. **Real-Time Counters:** Displays Total Queries Processed, Urgent Interventions, and Dynamic Wait Predictions.

---

## Step 2: Test Routine Symptom Triage (e.g. Musculoskeletal / Knee Pain)

Open the **Bharat Feature Phone & IVR Simulator**:
- **URL:** [http://localhost:5173/ivr-simulator](http://localhost:5173/ivr-simulator)
- **Deep-Link Shortcut:** [http://localhost:5173/ivr-simulator?autoTriage=knee](http://localhost:5173/ivr-simulator?autoTriage=knee)

![Step 2 - AI Routine Symptom Triage](screenshots/step2_ai_symptom_triage.png)

### Testing Procedure:
1. Under **"Live AI Clinical Symptom Triage & Hotline Router"**, select the preset **"Knee Swelling"** (or type `Severe knee swelling and joint pain while walking`).
2. Click **"Run Local AI Triage"**.
3. **Inspect the Output Card:**
   - **Recommended Department:** `Orthopaedics Department (ID: 3)`
   - **Severity Level:** `ROUTINE` (Yellow/Green badge)
   - **Confidence Score:** `95%`
   - **Inference Engine:** `OLLAMA_LOCAL (llama3.2)` or `EMBEDDED_CLINICAL_NLP` (< 50ms)
   - **Clinical Rationale:** Clear medical reasoning explaining musculoskeletal involvement.
4. Click **"Dial Hotline & Route via AI (Orthopaedics)"** to automatically trigger the simulated voice call routed directly to the Orthopaedics OPD counter.

---

## Step 3: Test Emergency Red-Flag Detection & 108 Ambulance Routing

Verify that life-threatening symptoms trigger an immediate red-flag alert and prevent inappropriate routine OPD delay.

- **URL:** [http://localhost:5173/ivr-simulator](http://localhost:5173/ivr-simulator)
- **Deep-Link Shortcut:** [http://localhost:5173/ivr-simulator?autoTriage=chest](http://localhost:5173/ivr-simulator?autoTriage=chest)

![Step 3 - Emergency Red-Flag Triage & 108 Routing](screenshots/step3_emergency_redflag.png)

### Testing Procedure:
1. Select the preset **"Chest Pain"** (or type `Severe crushing chest pain radiating to left arm`).
2. Click **"Run Local AI Triage"**.
3. **Inspect the Output Card:**
   - **Emergency Alert:** Bright red banner reading:  
     `CRITICAL ALERT: Your symptoms indicate an urgent emergency. Please visit Hospital Casualty immediately or dial 108.`
   - **Recommended Department:** `Cardiology (ID: 2)`
   - **Severity Level:** Red `EMERGENCY` badge
   - **Emergency Action:** The button switches to **"🚨 Emergency: Dial 108 Ambulance"**, warning patient against waiting for a scheduled routine OPD token.

---

## Step 4: Verify Token Queue with AI Severity Badges

Check the OPD Nurse & Counter Registrar triage view:
- **URL:** [http://localhost:5173/tokens](http://localhost:5173/tokens) (or with auto-auth: `http://localhost:5173/tokens?evalAuth=staff`)

![Step 4 - Token Queue with AI Badges](screenshots/step4_token_queue_ai_badges.png)

### What to verify:
1. **Queue Table Columns:** Includes Token Number (`C001`), Linked ABHA ID (`1234-5678-9012`), Patient Name, Department, and Booking Time.
2. **AI Triage Badges:** Tokens display distinct clinical severity pills:
   - `⚡ PRIORITY` (Amber/Purple) for urgent cases requiring expedited consultation.
   - `ROUTINE` (Teal/Emerald) for standard presentations.
   - `🚨 EMERGENCY` (Red) for casualty-diverted presentations.
3. **Action Button:** The **"AI Brief"** action button is highlighted in purple for every triaged token.

---

## Step 5: Test Resident Doctor Pre-Consultation Briefing & FHIR Note

Click the **"AI Brief"** button next to any triaged token in the queue table.

![Step 5 - Resident Doctor Clinical Briefing Modal](screenshots/step5_ai_clinical_brief_modal.png)

### What to verify inside the Modal:
1. **Clinical Triage Summary:** Shows Urgency, Match Confidence (`95%`), and Engine Used.
2. **Recorded Chief Complaint:** Displays exact patient symptoms captured during telephony ingestion.
3. **Tailored Resident Doctor Screening Questions:** 4 targeted clinical questions tailored to the department (e.g. onset, localized trauma, radiation, aggravating factors).
4. **ABDM FHIR Clinical Note Generator:** A complete structured clinical draft:
   - `Chief Complaint`
   - `Provisional Specialty`
   - `Triage Recommendation`
   - `Clinical Rationale`
5. **Copy to EMR:** Click **"Copy to EMR"** to copy the structured note directly to clipboard for pasting into hospital EHR systems.

---

## Command-Line / Terminal Verification (Backend REST APIs)

You can also test and verify the on-premise AI subsystem directly via `curl` terminal commands:

### 1. Check AI Engine Health & Connection
```bash
curl -s http://localhost:8088/api/ai/status | jq .
```
**Expected Response:**
```json
{
  "connected": true,
  "engine": "Ollama (llama3.2)",
  "endpoint": "http://localhost:11434/api/generate",
  "activeModel": "llama3.2",
  "totalQueriesLogged": 14,
  "urgentAlertsLogged": 3,
  "dataSovereigntyVerified": true
}
```

### 2. Test Symptom Triage (English - Orthopaedics)
```bash
curl -s -X POST http://localhost:8088/api/ai/triage \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "Severe knee swelling and joint pain while walking", "language": "en"}' | jq .
```
**Expected Response:**
```json
{
  "recommendedDepartmentId": 3,
  "recommendedDepartmentName": "Orthopaedics",
  "severityLevel": "ROUTINE",
  "isEmergencyRedFlag": false,
  "confidenceScore": 0.95,
  "aiEngine": "OLLAMA_LOCAL (llama3.2)"
}
```

### 3. Test Emergency Red-Flag Triage (Chest Pain)
```bash
curl -s -X POST http://localhost:8088/api/ai/triage \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "Severe crushing chest pain radiating to left arm", "language": "en"}' | jq .
```
**Expected Response:**
```json
{
  "recommendedDepartmentId": 2,
  "recommendedDepartmentName": "Cardiology",
  "severityLevel": "EMERGENCY",
  "isEmergencyRedFlag": true,
  "confidenceScore": 0.98,
  "patientFriendlyAdvice": "CRITICAL ALERT: Your symptoms indicate an urgent emergency. Please visit Hospital Casualty immediately or dial 108."
}
```

### 4. Test Regional Language Triage (Tamil Vernacular)
```bash
curl -s -X POST http://localhost:8088/api/ai/triage \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "குழந்தைக்கு அதிக காய்ச்சல் மற்றும் வாந்தி", "language": "ta"}' | jq .
```
**Expected Response:**
```json
{
  "recommendedDepartmentId": 4,
  "recommendedDepartmentName": "Paediatrics",
  "severityLevel": "PRIORITY",
  "isEmergencyRedFlag": false,
  "confidenceScore": 0.92
}
```

### 5. Test Dynamic Queue Velocity Prediction
```bash
curl -s -X POST http://localhost:8088/api/ai/predict-wait-time \
  -H "Content-Type: application/json" \
  -d '{"departmentId": 2, "hospitalId": 1}' | jq .
```
**Expected Response:**
```json
{
  "departmentId": 2,
  "hospitalId": 1,
  "departmentName": "Cardiology",
  "waitingPatientCount": 5,
  "estimatedWaitMinutes": 68,
  "complexityWeight": 1.35,
  "queueVelocityStatus": "NORMAL_LOAD"
}
```

---

## Troubleshooting Checklist

| Symptom | Cause | Resolution |
| :--- | :--- | :--- |
| Telemetry shows `Connected (Fallback Mode)` | Ollama daemon is not running on port 11434. | The system automatically uses the embedded clinical NLP engine. To use Ollama Llama 3.2, run `ollama serve` and `ollama pull llama3.2`. |
| Symptom triage returns General Medicine for rare symptom | Input string did not match localized keywords. | Provide more descriptive clinical context or select one of the 4 quick test preset chips. |
| Queue table does not show tokens | Filter is set to another hospital/department or date. | Reset filter to "Today" and select "Rajiv Gandhi Government General Hospital". |
