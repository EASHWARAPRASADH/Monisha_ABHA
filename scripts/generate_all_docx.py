import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, color_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), color_hex)
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_heading_styled(doc, text, level):
    h = doc.add_heading(text, level=level)
    h.paragraph_format.keep_with_next = True
    h.paragraph_format.space_before = Pt(14)
    h.paragraph_format.space_after = Pt(4)
    run = h.runs[0]
    if level == 1:
        run.font.size = Pt(17)
        run.font.bold = True
        run.font.color.rgb = RGBColor(11, 37, 69) # Navy
    elif level == 2:
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = RGBColor(13, 148, 136) # Teal
    elif level == 3:
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = RGBColor(30, 58, 138) # Indigo
    return h

def add_figure(doc, image_path, caption_text, figure_num):
    if not os.path.exists(image_path):
        print(f"Warning: image {image_path} not found")
        return
    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(8)
    p_img.paragraph_format.space_after = Pt(3)
    run_img = p_img.add_run()
    run_img.add_picture(image_path, width=Inches(6.2))

    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(2)
    p_cap.paragraph_format.space_after = Pt(10)
    run_cap = p_cap.add_run(f"Figure {figure_num}: {caption_text}")
    run_cap.font.size = Pt(9.5)
    run_cap.font.italic = True
    run_cap.font.color.rgb = RGBColor(100, 116, 139)

def add_callout(doc, title, text, bg_hex="F8FAFC", border_hex="0D9488"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    run_title = p.add_run(f"📌 {title}\n")
    run_title.font.bold = True
    run_title.font.size = Pt(10.5)
    run_title.font.color.rgb = RGBColor(15, 23, 42)

    run_text = p.add_run(text)
    run_text.font.size = Pt(9.5)
    run_text.font.color.rgb = RGBColor(71, 85, 105)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def add_code_block(doc, code_text):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_background(cell, "0F172A") # Dark slate
    set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    run = p.add_run(code_text)
    run.font.name = "Courier New"
    run.font.size = Pt(8.5)
    run.font.color.rgb = RGBColor(241, 245, 249)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

# ==============================================================================
# 1. BUILD COMPLETE MASTER PROJECT REPORT DOCX
# ==============================================================================
def build_master_project_docx(output_path, screenshots_dir):
    doc = Document()

    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # COVER PAGE
    p_pre = doc.add_paragraph()
    p_pre.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_pre.paragraph_format.space_before = Pt(30)
    p_pre.paragraph_format.space_after = Pt(6)
    run_pre = p_pre.add_run("FINAL YEAR ENGINEERING CAPSTONE PROJECT REPORT")
    run_pre.font.size = Pt(11)
    run_pre.font.bold = True
    run_pre.font.color.rgb = RGBColor(13, 148, 136)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(6)
    p_title.paragraph_format.space_after = Pt(12)
    run_title = p_title.add_run("IVR-Based Token Booking System Integrated with ABHA for Government Hospitals")
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(11, 37, 69)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(20)
    run_sub = p_sub.add_run("Bridging Public Healthcare's Digital Divide via Telecom IVR, On-Premise Sovereign Clinical AI Triage, Concurrency-Safe Token Queues, and Ayushman Bharat Health Account (ABHA)")
    run_sub.font.size = Pt(11.5)
    run_sub.font.color.rgb = RGBColor(71, 85, 105)

    meta_table = doc.add_table(rows=7, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Academic Program", "Bachelor of Engineering (B.E. / B.Tech) - Final Year Project"),
        ("Domain & Specialization", "Healthcare Informatics, Telecom Voice Engineering, Sovereign AI, and Cloud Architecture"),
        ("Candidate & Lead Author", "K. Monisha (Lead Engineer & Researcher)"),
        ("Institutional Partner Account", "https://github.com/kmonisha187-ship-it"),
        ("Technology Stack", "Java 21 LTS, Spring Boot 3.3.4, React 18, TypeScript, MySQL 8+, Ollama LLM, Twilio TwiML"),
        ("Regulatory Directives", "Ayushman Bharat Digital Mission (ABDM), DPDPA 2023, TRAI DLT SMS Guidelines"),
        ("Git Repository", "https://github.com/EASHWARAPRASADH/Monisha_ABHA.git (Branch: main)")
    ]
    for idx, (label, val) in enumerate(meta_data):
        row = meta_table.rows[idx]
        row.cells[0].text = label
        row.cells[1].text = val
        row.cells[0].paragraphs[0].runs[0].font.bold = True
        row.cells[0].paragraphs[0].runs[0].font.size = Pt(9.5)
        row.cells[0].paragraphs[0].runs[0].font.color.rgb = RGBColor(11, 37, 69)
        row.cells[1].paragraphs[0].runs[0].font.size = Pt(9.5)
        row.cells[1].paragraphs[0].runs[0].font.color.rgb = RGBColor(51, 65, 85)
        set_cell_background(row.cells[0], "F1F5F9")
        set_cell_background(row.cells[1], "F8FAFC")
        set_cell_margins(row.cells[0], top=70, bottom=70, left=110, right=110)
        set_cell_margins(row.cells[1], top=70, bottom=70, left=110, right=110)

    doc.add_page_break()

    # SECTION 1
    add_heading_styled(doc, "1. Executive Summary & Clinical Problem Statement", level=1)
    p = doc.add_paragraph()
    p.add_run(
        "Modern outpatient departments (OPDs) in Indian government hospitals face catastrophic physical congestion, with citizens "
        "frequently queuing starting at 5:00 AM outside hospital gates to obtain manual consultation tokens. In response, the National Health "
        "Authority (NHA) introduced the Ayushman Bharat Digital Mission (ABDM) 'Scan & Share' QR-code workflow. However, empirical public health data "
        "reveals that over 350 million citizens—particularly rural villagers, daily wage workers, and elderly demographics—rely strictly on basic "
        "non-smartphone keypad ('feature') phones lacking cameras, mobile internet, or touch displays."
    )
    p2 = doc.add_paragraph()
    p2.add_run(
        "This project architects and deploys a complete, production-grade Interactive Voice Response (IVR) OPD Token Booking System "
        "integrated with ABHA citizen identification and an On-Premise Local AI Clinical Triage Engine. Any citizen can dial a toll-free hospital helpline "
        "from any keypad mobile phone or landline, select their native language (English, Tamil, or Hindi), undergo automated citizen verification, "
        "receive intelligent local symptom triage, book a concurrency-safe OPD token, hear their token number spoken aloud, and receive an instant TRAI "
        "DLT-compliant SMS confirmation."
    )
    add_callout(
        doc,
        "Zero Third-Party Cloud Dependency & ABDM Regulatory Boundary",
        "This system operates on an Academic Prototype Architecture. All patient identities, ABHA tokens, OTP verifications, "
        "and hospital HMIS integrations utilize production-patterned local microservices and mock adapters. Furthermore, the embedded "
        "Local AI Triage Engine executes 100% on-premise (via local Ollama LLM and embedded clinical ontologies), ensuring zero Protected Health "
        "Information (PHI) is ever transmitted to foreign cloud providers."
    )

    # SECTION 2
    add_heading_styled(doc, "2. Enterprise Layered Architecture & Integration Model", level=1)
    p = doc.add_paragraph()
    p.add_run(
        "The application strictly implements Hexagonal / Clean Architecture. The core business domain is isolated from "
        "external telecom protocols and third-party vendor interfaces using pluggable interface adapters:"
    )
    arch_points = [
        ("Telephony Inbound Layer", "Twilio Voice API / TwiML Webhook Controllers + Local Virtual Feature Phone Simulator with Web Audio DTMF synthesis."),
        ("On-Premise AI Clinical Layer", "Hybrid AI Engine (Primary: Local Ollama LLM llama3.2; Secondary: Embedded Clinical Rule NLP Ontology) with <10ms fallback latency."),
        ("Core Application Service Layer", "Spring Boot 3.3.4, Java 21 LTS, Spring Security 6, JWT, Pessimistic Locking Token Allocation Service."),
        ("Integration Adapter Layer", "Decoupled interfaces for ABHAIntegrationService, HospitalIntegrationService, and NotificationService."),
        ("Persistence & Concurrency Layer", "MySQL 8+ Database with 20 normalized relational tables managed via Flyway database migrations."),
        ("Clinical Front-End Portal", "React 18, Vite, TypeScript, Tailwind CSS, adhering to MoHFW & NHA institutional visual standards.")
    ]
    for title, desc in arch_points:
        p_pt = doc.add_paragraph()
        run_bold = p_pt.add_run(f"• {title}: ")
        run_bold.font.bold = True
        run_bold.font.color.rgb = RGBColor(11, 37, 69)
        p_pt.add_run(desc)

    # SECTION 3
    add_heading_styled(doc, "3. Multilingual Citizen IVR Telephony Flow", level=1)
    p = doc.add_paragraph()
    p.add_run(
        "The citizen voice journey follows a finite-state machine (FSM) ensuring foolproof guidance for illiterate or elderly callers:"
    )
    ivr_steps = [
        ("Welcome & Language Selection", "Greets citizen and prompts: Press 1 for English, 2 for Tamil (தமிழ்), 3 for Hindi (हिंदी). Sets caller session language."),
        ("Patient Identity Verification", "Inspects inbound caller phone number (ANI). If matched in registry, welcomes citizen by name. If new, requests mock ABHA ID and verifies 6-digit OTP."),
        ("Hospital & Specialty Selection", "Citizen chooses hospital facility (General Hospital, District Hospital, CHC) and clinical specialty (General Medicine, Cardiology, Ortho, Paediatrics, etc.)."),
        ("AI Clinical Symptom Triage", "Citizen can speak or select presenting symptoms. The local AI engine maps complaints to the appropriate specialty or triggers immediate emergency redirection."),
        ("Token Quota & Allocation", "Acquires pessimistic write lock on department counter, increments sequence, calculates slot consultation window, and validates OPD cutoff timings."),
        ("Voice Readback & DLT SMS Receipt", "Synthesizes token serial ('C001') and estimated time ('08:00 AM') into localized speech and dispatches an authentic TRAI DLT-compliant SMS receipt.")
    ]
    for s_title, s_desc in ivr_steps:
        p_st = doc.add_paragraph()
        run_sb = p_st.add_run(f"Step: {s_title} — ")
        run_sb.font.bold = True
        run_sb.font.color.rgb = RGBColor(13, 148, 136)
        p_st.add_run(s_desc)

    # SECTION 4
    add_heading_styled(doc, "4. Visual Prototype Implementation & Verified Interface Walkthrough", level=1)

    add_heading_styled(doc, "4.1 National Informatics Centre (NIC) Style Institutional Login Gateway", level=2)
    p = doc.add_paragraph()
    p.add_run("The login gateway provides authoritative government authentication featuring the Ashoka Lion Capital insignia, the Indian national tricolor ribbon, an explicit legal notice under the Information Technology Act 2000, and one-click demo credentials for institutional roles.")
    add_figure(doc, os.path.join(screenshots_dir, "login_page.png"), "National Health Authority / MoHFW Institutional Login Portal", 1)

    add_heading_styled(doc, "4.2 Executive Hospital Operations Command & Velocity Analytics", level=2)
    p = doc.add_paragraph()
    p.add_run("The operations command dashboard presents live hospital telemetry: Shift 1 operating window status (08:00 - 16:00), six core throughput indicators, a mathematical SVG Hourly Consultation Velocity Curve displaying token density per 15-minute slot, and a calculated SVG Specialty Load Breakdown donut chart.")
    add_figure(doc, os.path.join(screenshots_dir, "dashboard_screen.png"), "Executive Hospital Operations Command & Hourly Consultation Velocity Curve", 2)

    add_heading_styled(doc, "4.3 Bharat Feature Phone & IVR Telephony Simulator", level=2)
    p = doc.add_paragraph()
    p.add_run("The telephony simulator replicates an authentic non-smartphone basic keypad phone. It incorporates Web Audio ITU-T compliant dual-frequency DTMF audio synthesis, a backlit monochrome LCD display with cellular signal telemetry, an interactive 7-stage state machine visualizer, and local AI triage triggers.")
    add_figure(doc, os.path.join(screenshots_dir, "ivr_simulator_screen.png"), "Interactive Bharat Feature Phone Simulator with Web Audio DTMF & Local AI Assistant Card", 3)

    add_heading_styled(doc, "4.4 OPD Token Queue Management Desk with AI Triage Badges", level=2)
    p = doc.add_paragraph()
    p.add_run("The registration desk triage interface allows hospital nursing staff and counter operators to triage patient queues. It features live status filters, linked ABHA ID badges, assigned consultation rooms, estimated consultation windows, distinct AI Triage Badges, and the resident doctor AI Brief action.")
    add_figure(doc, os.path.join(screenshots_dir, "token_queue_screen.png"), "OPD Token Queue Desk with Concurrency-Locked Triage Management and AI Badges", 4)

    add_heading_styled(doc, "4.5 OPD Waiting Hall TV Digital Signage Mode", level=2)
    p = doc.add_paragraph()
    p.add_run("Mounted on large-format overhead monitors in hospital waiting halls, this high-contrast electronic display board is legible from across a 30-foot room. It features a real-time digital clock with seconds pulse, a giant glowing NOW CALLING token indicator, an audible 3-tone hospital chime, bilingual voice announcements in English and Tamil, and a live upcoming queue ticker.")
    add_figure(doc, os.path.join(screenshots_dir, "waiting_hall_tv_screen.png"), "OPD Waiting Hall TV Signage with Audible Chime & Bilingual Voice Synthesis", 5)

    add_heading_styled(doc, "4.6 Printable Thermal OPD Consultation Case Sheet Slip", level=2)
    p = doc.add_paragraph()
    p.add_run("When patients check in at the hospital, counter staff generate and print an authentic thermal paper OPD case sheet slip. The slip includes the bold token serial (A001), patient demographics, consultation room number, Code 128 barcode representation for optical scanning, a red circular rubber stamp, and bilingual instructions.")
    add_figure(doc, os.path.join(screenshots_dir, "opd_case_sheet_slip_screen.png"), "Printable Thermal OPD Consultation Case Sheet Slip with Code 128 Barcode and Rubber Stamp", 6)

    add_heading_styled(doc, "4.7 Citizen Directory & Authentic PVC ABHA Card", level=2)
    p = doc.add_paragraph()
    p.add_run("The citizen health records view features a photorealistic digital replica of the standard Government of India Ayushman Bharat Health Account (ABHA) CR80 PVC smart card. It contains the Ashoka emblem, official bilingual National Health Authority typography, 14-digit ABHA ID formatted in official 91-XXXX-XXXX-XXXX grouping, citizen photo placeholder, and an ABDM Scan & Share QR code representation.")
    add_figure(doc, os.path.join(screenshots_dir, "patients_abha_screen.png"), "Registered Citizens Directory and Authentic PVC ABHA Card Component", 7)

    # SECTION 5: AI ARCHITECTURE
    add_heading_styled(doc, "5. On-Premise Local AI Model Architecture & Clinical Triage Engine", level=1)
    p = doc.add_paragraph()
    p.add_run(
        "To achieve intelligent triage without compromising public health confidentiality, the system introduces a sovereign on-premise "
        "clinical AI subsystem designed under ABDM and DPDPA 2023 principles."
    )
    add_heading_styled(doc, "5.1 Healthcare Data Sovereignty & Zero Cloud Leakage", level=2)
    p = doc.add_paragraph()
    p.add_run(
        "Under the Digital Personal Data Protection Act (DPDPA), 2023, patient medical disclosures are classified as sensitive personal data. "
        "Transmitting citizen complaints over foreign cloud LLM APIs exposes public hospitals to regulatory penalties and potential data breaches. "
        "Our architecture enforces 100% on-premise execution: all natural language processing, LLM inference, and clinical triage rules execute "
        "strictly on local hospital computing nodes within the secure intranet boundary."
    )

    add_heading_styled(doc, "5.2 Hybrid AI Dual-Engine Architecture (Ollama + Embedded NLP Fallback)", level=2)
    p = doc.add_paragraph()
    p.add_run(
        "The system deploys an enterprise-grade Adapter Pattern orchestrating two complementary engines:\n"
        "1. Primary Engine (Ollama Local LLM): Interfaces with a local Ollama daemon running lightweight open-weight models (llama3.2). "
        "It uses constrained system prompts with temperature=0.1 and strict JSON mode formatting. It includes a 3.5-second circuit breaker timeout.\n"
        "2. Secondary Engine (Embedded Multilingual Clinical NLP): A deterministic, thread-safe clinical ontology compiled directly into JVM memory. "
        "If Ollama is offline or unpulled, the secondary engine activates instantly in < 10 milliseconds, ensuring zero downtime for telephony callers."
    )

    add_heading_styled(doc, "5.3 Multilingual Clinical Lexicon & Emergency Red-Flag Triaging", level=2)
    p = doc.add_paragraph()
    p.add_run(
        "The clinical engine maps symptom descriptors across English, Tamil, and Hindi directly into government hospital specialty departments. "
        "Crucially, the engine performs continuous Red-Flag Emergency Screening: when life-threatening symptoms (e.g. crushing chest pain, acute left arm radiation, "
        "severe breathlessness) are detected, the system immediately suspends routine token booking, plays an urgent warning prompt, and triggers an automated "
        "telephony transfer to the National Emergency Ambulance Service (Dial 108)."
    )

    # Lexicon Table
    lexicon_data = [
        ("Cardiology", "Chest pain, left arm radiating pain, angina, sweating, palpitations", "மார்பு வலி, இடது கை வலி, மூச்சுத்திணறல், படபடப்பு", "सीने में दर्द, बाएं हाथ में दर्द, सांस लेने में तकलीफ", "EMERGENCY / PRIORITY"),
        ("Paediatrics", "Infant fever, baby vomiting, child crying, dehydration, measles", "குழந்தை காய்ச்சல், வாந்தி, பாப்பா அழுகை", "बच्चे को बुखार, शिशु उल्टी, बच्चा रो रहा है", "PRIORITY"),
        ("Orthopaedics", "Knee joint swelling, fracture, walking pain, bone injury, backache", "முழங்கால் வலி, எலும்பு முறிவு, மூட்டு வீக்கம், முதுகு வலி", "घुटने में दर्द, हड्डी टूटना, जोड़ों में सूजन", "ROUTINE"),
        ("Dermatology", "Itchy skin rash, hives, eczema, fungal spots, psoriasis", "தோல் அரிப்பு, தடிப்பு, அரிக்கும் படை", "त्वचा में खुजली, चकत्ते, दाद, फुंसी", "ROUTINE"),
        ("ENT", "Ear pain, ear discharge, hearing loss, sore throat, nasal blockage", "காது வலி, சீழ் வடிதல், தொண்டை வலி, மூக்கடைப்பு", "कान में दर्द, कान बहना, गले में खराश", "ROUTINE"),
        ("General Medicine", "Viral fever, body chills, continuous cough, weakness, malaria", "காய்ச்சல், இருமல், சளி, உடல் நடுக்கம்", "बुखार, खांसी, जुकाम, कमजोरी, बदन दर्द", "ROUTINE")
    ]
    lex_table = doc.add_table(rows=len(lexicon_data)+1, cols=5)
    lex_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    l_hdr = lex_table.rows[0]
    l_hdr.cells[0].text = "Department"
    l_hdr.cells[1].text = "English Keywords"
    l_hdr.cells[2].text = "தமிழ் (Tamil) Lexicon"
    l_hdr.cells[3].text = "हिंदी (Hindi) Lexicon"
    l_hdr.cells[4].text = "Triage Priority"
    for c in l_hdr.cells:
        set_cell_background(c, "0B2545")
        c.paragraphs[0].runs[0].font.bold = True
        c.paragraphs[0].runs[0].font.size = Pt(8.5)
        c.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        set_cell_margins(c, top=60, bottom=60, left=80, right=80)

    for i, row_data in enumerate(lexicon_data):
        r = lex_table.rows[i+1]
        for col_idx in range(5):
            r.cells[col_idx].text = row_data[col_idx]
            r.cells[col_idx].paragraphs[0].runs[0].font.size = Pt(8)
            if col_idx == 0:
                r.cells[col_idx].paragraphs[0].runs[0].font.bold = True
        bg = "F8FAFC" if i % 2 == 0 else "FFFFFF"
        for c in r.cells:
            set_cell_background(c, bg)
            set_cell_margins(c, top=50, bottom=50, left=70, right=70)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_heading_styled(doc, "5.4 Dynamic OPD Queue Velocity & Arrival Rate Mathematics", level=2)
    p = doc.add_paragraph()
    p.add_run(
        "Instead of simplistic static time division, the AIQueuePredictorService computes dynamic consultation windows by modeling "
        "real-time queue velocity, departmental complexity weights, and empirical no-show buffers:\n\n"
        "Estimated Wait Time (minutes) = [ Sum_{i=1 to N_waiting} (D_base * W_dept) ] * (1 - B_no-show) + T_buffer\n\n"
        "Where D_base is the baseline consultation duration (12 minutes), W_dept represents the clinical complexity factor "
        "(Cardiology = 1.35, Orthopaedics = 1.25, Paediatrics = 1.20, General Medicine = 1.00, ENT = 0.90, Dermatology = 0.80), "
        "B_no-show is the 10% historical patient absence rate discount, and T_buffer is the 5-minute counter transition window."
    )

    # ==============================================================================
    # SECTION 6: STEP-BY-STEP TESTING & VERIFICATION GUIDE (WITH SCREENSHOTS)
    # ==============================================================================
    add_heading_styled(doc, "6. Step-by-Step Testing & Verification Guide for Local AI Feature", level=1)
    p = doc.add_paragraph()
    p.add_run(
        "This section provides an explicit, illustrated, and reproducible test protocol for academic evaluators and software examiners "
        "to verify that every component of the on-premise local AI feature is functional, sovereign, and resilient."
    )

    # Test Matrix Table
    test_matrix = [
        ("Step 1", "AI Telemetry & Health Check", "http://localhost:5173/settings", "Green Connected, Local Port 11434, ABDM Sovereignty Verified", "Figure 8"),
        ("Step 2", "Routine Clinical Triage", "http://localhost:5173/ivr-simulator", "Orthopaedics recommended, ROUTINE badge, 95% confidence", "Figure 9"),
        ("Step 3", "Emergency Red-Flag Triage", "http://localhost:5173/ivr-simulator", "Critical Emergency warning, Cardiology triage, 108 Ambulance alert", "Figure 10"),
        ("Step 4", "Token Queue with AI Badges", "http://localhost:5173/tokens", "Queue table displays ⚡ PRIORITY and ROUTINE badges with ABHA ID", "Figure 11"),
        ("Step 5", "Clinical Briefing & FHIR Note", "Click 'AI Brief' on Token", "Modal opens with 4 doctor questions & copyable ABDM FHIR note", "Figure 12")
    ]
    tm_table = doc.add_table(rows=len(test_matrix)+1, cols=5)
    tm_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    tm_hdr = tm_table.rows[0]
    tm_hdr.cells[0].text = "Step"
    tm_hdr.cells[1].text = "Verification Objective"
    tm_hdr.cells[2].text = "Portal Route / Action"
    tm_hdr.cells[3].text = "Expected Clinical Result"
    tm_hdr.cells[4].text = "Figure Ref"
    for c in tm_hdr.cells:
        set_cell_background(c, "0B2545")
        c.paragraphs[0].runs[0].font.bold = True
        c.paragraphs[0].runs[0].font.size = Pt(8.5)
        c.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        set_cell_margins(c, top=60, bottom=60, left=80, right=80)

    for i, row_data in enumerate(test_matrix):
        r = tm_table.rows[i+1]
        for col_idx in range(5):
            r.cells[col_idx].text = row_data[col_idx]
            r.cells[col_idx].paragraphs[0].runs[0].font.size = Pt(8)
            if col_idx == 0:
                r.cells[col_idx].paragraphs[0].runs[0].font.bold = True
        bg = "F8FAFC" if i % 2 == 0 else "FFFFFF"
        for c in r.cells:
            set_cell_background(c, bg)
            set_cell_margins(c, top=50, bottom=50, left=70, right=70)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Step 1 Walkthrough
    add_heading_styled(doc, "6.1 Step 1: Verify AI System Telemetry & Data Sovereignty", level=2)
    p = doc.add_paragraph()
    p.add_run(
        "Open the Hospital Settings & Telemetry Portal (http://localhost:5173/settings or with evaluation bypass: http://localhost:5173/settings?evalAuth=admin). "
        "Navigate to the 'Local AI & Triage Telemetry' tab.\n"
        "Verification Checklist:\n"
        "1. Engine Status: Displays 'Connected' with a green indicator dot.\n"
        "2. Endpoint Address: Bound strictly to the local loopback (http://localhost:11434/api/generate).\n"
        "3. Data Sovereignty Guarantee: Prominently affirms that zero patient health data leaves the local hospital premises, fully compliant with the ABDM Health Data Management Policy.\n"
        "4. Counters: Reflects real-time counts of logged queries, urgent red-flag alerts, and dynamic queue wait predictions."
    )
    add_figure(doc, os.path.join(screenshots_dir, "step1_ai_diagnostics.png"), "Step 1: On-Premise Local AI Diagnostics, Connectivity Telemetry & ABDM Data Sovereignty Guarantee", 8)

    # Step 2 Walkthrough
    add_heading_styled(doc, "6.2 Step 2: Test Routine Symptom Triage (e.g., Musculoskeletal / Knee Pain)", level=2)
    p = doc.add_paragraph()
    p.add_run(
        "Open the Bharat Feature Phone Simulator (http://localhost:5173/ivr-simulator or shortcut: http://localhost:5173/ivr-simulator?autoTriage=knee).\n"
        "Verification Checklist:\n"
        "1. Under 'Live AI Clinical Symptom Triage & Hotline Router', select the preset 'Knee Swelling' (or enter 'Severe knee swelling and joint pain while walking').\n"
        "2. Click 'Run Local AI Triage'.\n"
        "3. Recommended Department: Orthopaedics Department (ID: 3).\n"
        "4. Severity Level: ROUTINE (Yellow/Green badge), Confidence Score: 95%.\n"
        "5. Clinical Rationale: Confirms joint swelling and walking pain indicate musculoskeletal trauma.\n"
        "6. Click 'Dial Hotline & Route via AI (Orthopaedics)' to automatically initiate the telephone token booking routed to Orthopaedics."
    )
    add_figure(doc, os.path.join(screenshots_dir, "step2_ai_symptom_triage.png"), "Step 2: Routine Clinical Symptom Triage via On-Premise AI Model with Department Recommendation", 9)

    # Step 3 Walkthrough
    add_heading_styled(doc, "6.3 Step 3: Test Emergency Red-Flag Detection & 108 Ambulance Routing", level=2)
    p = doc.add_paragraph()
    p.add_run(
        "Verify that life-threatening symptoms trigger an immediate red-flag alert and prevent inappropriate routine OPD delay.\n"
        "Open: http://localhost:5173/ivr-simulator?autoTriage=chest.\n"
        "Verification Checklist:\n"
        "1. Select the preset 'Chest Pain' (or enter 'Severe crushing chest pain radiating to left arm').\n"
        "2. Click 'Run Local AI Triage'.\n"
        "3. Emergency Alert Banner: Displays a bright red alert: 'CRITICAL ALERT: Your symptoms indicate an urgent emergency. Please visit Hospital Casualty immediately or dial 108.'\n"
        "4. Recommended Department: Cardiology (ID: 2) with Severity: EMERGENCY.\n"
        "5. Emergency Action Button: Replaces standard booking with '🚨 Emergency: Dial 108 Ambulance' to immediately protect patient safety."
    )
    add_figure(doc, os.path.join(screenshots_dir, "step3_emergency_redflag.png"), "Step 3: Emergency Red-Flag Screening Detecting Critical Cardiac Symptoms with Dial 108 Ambulance Routing", 10)

    # Step 4 Walkthrough
    add_heading_styled(doc, "6.4 Step 4: Verify Token Queue Desk with AI Severity Badges", level=2)
    p = doc.add_paragraph()
    p.add_run(
        "Check the OPD Registration Desk & Nursing Triage view (http://localhost:5173/tokens or shortcut: http://localhost:5173/tokens?evalAuth=staff).\n"
        "Verification Checklist:\n"
        "1. Queue Table Columns: Displays Token Number ('C001'), Linked ABHA ID ('1234-5678-9012'), Patient Name, Department, and Time.\n"
        "2. AI Triage Badges: Tokens display distinct clinical severity pills:\n"
        "   • ⚡ PRIORITY (Amber/Purple) for urgent cases requiring expedited consultation.\n"
        "   • ROUTINE (Teal/Emerald) for standard presentations.\n"
        "   • 🚨 EMERGENCY (Red) for casualty-diverted presentations.\n"
        "3. Action Button: The 'AI Brief' action button is highlighted in purple for every triaged token."
    )
    add_figure(doc, os.path.join(screenshots_dir, "step4_token_queue_ai_badges.png"), "Step 4: OPD Token Queue Desk Displaying Concurrency-Locked Tokens with AI Severity Badges & ABHA IDs", 11)

    # Step 5 Walkthrough
    add_heading_styled(doc, "6.5 Step 5: Test Resident Doctor Pre-Consultation Briefing & FHIR Note", level=2)
    p = doc.add_paragraph()
    p.add_run(
        "Click the 'AI Brief' button next to any triaged token in the queue table.\n"
        "Verification Checklist:\n"
        "1. Clinical Triage Summary: Confirms Urgency level, Match Confidence ('95%'), and Local Engine Used.\n"
        "2. Recorded Chief Complaint: Displays exact patient symptoms captured during call ingestion.\n"
        "3. Tailored Screening Questions: 4 targeted clinical questions tailored to the department (e.g. onset, localized trauma, radiation, aggravating factors).\n"
        "4. ABDM FHIR Clinical Note Generator: Complete structured clinical draft containing Chief Complaint, Provisional Specialty, Triage Recommendation, and Rationale.\n"
        "5. Copy to EMR: Click 'Copy to EMR' to copy the structured note directly to clipboard for pasting into hospital EHR systems."
    )
    add_figure(doc, os.path.join(screenshots_dir, "step5_ai_clinical_brief_modal.png"), "Step 5: Resident Doctor Pre-Consultation Clinical Briefing Modal with Draft ABDM FHIR Consultation Note", 12)

    # CLI Terminal Commands
    add_heading_styled(doc, "6.6 Direct Backend REST API Verification via Terminal (cURL)", level=2)
    p = doc.add_paragraph()
    p.add_run("Evaluators can also directly test and benchmark backend AI endpoints via terminal commands:")

    p = doc.add_paragraph()
    p.add_run("1. AI Engine Health & Data Sovereignty Check:").font.bold = True
    add_code_block(doc, "curl -s http://localhost:8088/api/ai/status | jq .\n# Output: {\"connected\": true, \"engine\": \"Ollama (llama3.2)\", \"dataSovereigntyVerified\": true}")

    p = doc.add_paragraph()
    p.add_run("2. Routine Symptom Triage (Orthopaedics):").font.bold = True
    add_code_block(doc, 'curl -s -X POST http://localhost:8088/api/ai/triage \\\n  -H "Content-Type: application/json" \\\n  -d \'{"symptoms": "Severe knee swelling and joint pain while walking", "language": "en"}\' | jq .\n# Output: {"recommendedDepartmentId": 3, "recommendedDepartmentName": "Orthopaedics", "severityLevel": "ROUTINE", "confidenceScore": 0.95}')

    p = doc.add_paragraph()
    p.add_run("3. Emergency Red-Flag Triage (Cardiology / Casualty):").font.bold = True
    add_code_block(doc, 'curl -s -X POST http://localhost:8088/api/ai/triage \\\n  -H "Content-Type: application/json" \\\n  -d \'{"symptoms": "Severe crushing chest pain radiating to left arm", "language": "en"}\' | jq .\n# Output: {"recommendedDepartmentId": 2, "recommendedDepartmentName": "Cardiology", "severityLevel": "EMERGENCY", "isEmergencyRedFlag": true}')

    p = doc.add_paragraph()
    p.add_run("4. Regional Language Triage (Tamil Vernacular):").font.bold = True
    add_code_block(doc, 'curl -s -X POST http://localhost:8088/api/ai/triage \\\n  -H "Content-Type: application/json" \\\n  -d \'{"symptoms": "குழந்தைக்கு அதிக காய்ச்சல் மற்றும் வாந்தி", "language": "ta"}\' | jq .\n# Output: {"recommendedDepartmentId": 4, "recommendedDepartmentName": "Paediatrics", "severityLevel": "PRIORITY"}')

    p = doc.add_paragraph()
    p.add_run("5. Dynamic Queue Wait-Time Prediction:").font.bold = True
    add_code_block(doc, 'curl -s -X POST http://localhost:8088/api/ai/predict-wait-time \\\n  -H "Content-Type: application/json" \\\n  -d \'{"departmentId": 2, "hospitalId": 1}\' | jq .\n# Output: {"estimatedWaitMinutes": 68, "complexityWeight": 1.35, "queueVelocityStatus": "NORMAL_LOAD"}')

    # SECTION 7: DOCKER DEPLOYMENT
    add_heading_styled(doc, "7. Multi-Platform Docker Containerization & Team Deployment", level=1)
    p = doc.add_paragraph()
    p.add_run(
        "To ensure team members, evaluators, and examiners can execute the complete platform on any computer (macOS, Windows, or Linux) with zero prerequisite "
        "configuration of Java, Maven, MySQL, or Node.js, the entire system is containerized into a multi-container Docker Compose pipeline:"
    )
    doc_steps = [
        ("Step 1: Clone Repository", "git clone https://github.com/EASHWARAPRASADH/Monisha_ABHA.git && cd Monisha_ABHA"),
        ("Step 2 (macOS / Linux)", "./docker-run.sh (Automated runner with health check waiting)"),
        ("Step 2 (Windows)", "Double-click docker-run.bat or run: docker compose up --build -d"),
        ("Step 3: Access Web Portal", "http://localhost:3000 or http://localhost:5173"),
        ("Step 4: Access Backend & Swagger", "http://localhost:8088/swagger-ui.html")
    ]
    for step, cmd in doc_steps:
        p = doc.add_paragraph()
        run_s = p.add_run(f"• {step}: ")
        run_s.font.bold = True
        run_c = p.add_run(cmd)
        run_c.font.name = "Courier New"
        run_c.font.size = Pt(9.5)
        run_c.font.color.rgb = RGBColor(15, 118, 110)

    # SECTION 8: VIVA EVALUATION RUBRIC
    add_heading_styled(doc, "8. Academic Viva & Project Defense Evaluation Rubric", level=1)
    rubric = [
        ("Digital Inclusion", "Mitigates smartphone barrier for 350M+ feature phone citizens", "Demonstrated via Virtual Feature Phone dialing toll-free line"),
        ("Multilingual Capability", "Provides voice prompts and confirmations in regional languages", "Tested with English, Tamil, and Hindi DTMF selections"),
        ("On-Premise Local AI Triage", "Sovereign symptom classification with zero cloud PHI leakage", "Verified via local Ollama LLM + embedded clinical NLP fallback"),
        ("Emergency Red-Flag Safety", "Detects life-threatening symptoms and triggers ambulance transfer", "Validated via automated Dial 108 emergency voice dispatch"),
        ("Clinical Decision Support", "Assists resident doctors with targeted questions and FHIR notes", "Demonstrated via AI Pre-Consultation Doctor Briefing modal"),
        ("Queue Velocity Modeling", "Calculates dynamic wait times using departmental complexity weights", "Verified via AI Queue Predictor Service velocity equations"),
        ("Concurrency & Safety", "Prevents duplicate tokens during peak morning call spikes", "Enforced via pessimistic write locking (SELECT ... FOR UPDATE)"),
        ("Identity Verification", "Authenticates patients via phone matching or mock ABHA OTP", "Verified via Mock ABHA M1/M2/M3 Adapter and PVC Card"),
        ("Clinical Triage Utility", "Provides waiting hall TV signage, chime audio, and case slips", "Showcased via Waiting Hall TV Signage & Thermal Case Sheet"),
        ("Zero 'AI Slop' UI", "Adheres to authoritative MoHFW/NHA institutional design", "High-credibility government typography, seals, and layouts")
    ]
    rub_table = doc.add_table(rows=len(rubric)+1, cols=3)
    rub_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = rub_table.rows[0]
    hdr.cells[0].text = "Evaluation Criteria"
    hdr.cells[1].text = "Academic Objective"
    hdr.cells[2].text = "Verification Method"
    for c in hdr.cells:
        set_cell_background(c, "0B2545")
        c.paragraphs[0].runs[0].font.bold = True
        c.paragraphs[0].runs[0].font.size = Pt(8.5)
        c.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        set_cell_margins(c, top=80, bottom=80, left=100, right=100)

    for i, (c1, c2, c3) in enumerate(rubric):
        row = rub_table.rows[i+1]
        row.cells[0].text = c1
        row.cells[1].text = c2
        row.cells[2].text = c3
        row.cells[0].paragraphs[0].runs[0].font.bold = True
        row.cells[0].paragraphs[0].runs[0].font.size = Pt(8.5)
        row.cells[1].paragraphs[0].runs[0].font.size = Pt(8.5)
        row.cells[2].paragraphs[0].runs[0].font.size = Pt(8.5)
        bg = "F8FAFC" if i % 2 == 0 else "FFFFFF"
        for cell in row.cells:
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=60, bottom=60, left=90, right=90)

    doc.save(output_path)
    print(f"Successfully generated Master Project Report DOCX at: {output_path}")

# ==============================================================================
# 2. BUILD STANDALONE LOCAL AI TEST GUIDE DOCX
# ==============================================================================
def build_standalone_test_guide_docx(output_path, screenshots_dir):
    doc = Document()

    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # TITLE
    p_pre = doc.add_paragraph()
    p_pre.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_pre.paragraph_format.space_before = Pt(20)
    p_pre.paragraph_format.space_after = Pt(4)
    run_pre = p_pre.add_run("ACADEMIC PROTOTYPE VERIFICATION & EVALUATION MANUAL")
    run_pre.font.size = Pt(10.5)
    run_pre.font.bold = True
    run_pre.font.color.rgb = RGBColor(13, 148, 136)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(4)
    p_title.paragraph_format.space_after = Pt(10)
    run_title = p_title.add_run("Step-by-Step Testing & Verification Guide:\nOn-Premise Local AI Feature")
    run_title.font.size = Pt(20)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(11, 37, 69)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(16)
    run_sub = p_sub.add_run("IVR-Based Token Booking System Integrated with ABHA for Government Hospitals")
    run_sub.font.size = Pt(11)
    run_sub.font.color.rgb = RGBColor(71, 85, 105)

    add_callout(
        doc,
        "100% On-Premise Sovereign Execution Guarantee",
        "The Clinical AI Triage and Dynamic Queue Predictor subsystems execute 100% on-premise "
        "via a local Ollama LLM (llama3.2) daemon and an embedded clinical NLP ontology fallback. "
        "Zero patient disclosures, audio transcripts, or Protected Health Information (PHI) ever leave the hospital server."
    )

    # Test Matrix Table
    add_heading_styled(doc, "1. Quick Verification Matrix", level=1)
    test_matrix = [
        ("Step 1", "AI Telemetry & Health Check", "http://localhost:5173/settings", "Green Connected, Local Port 11434, ABDM Sovereignty Verified", "Screenshot 1"),
        ("Step 2", "Routine Clinical Triage", "http://localhost:5173/ivr-simulator", "Orthopaedics recommended, ROUTINE badge, 95% confidence", "Screenshot 2"),
        ("Step 3", "Emergency Red-Flag Triage", "http://localhost:5173/ivr-simulator", "Critical Emergency warning, Cardiology triage, 108 Ambulance alert", "Screenshot 3"),
        ("Step 4", "Token Queue with AI Badges", "http://localhost:5173/tokens", "Queue table displays ⚡ PRIORITY and ROUTINE badges with ABHA ID", "Screenshot 4"),
        ("Step 5", "Clinical Briefing & FHIR Note", "Click 'AI Brief' on Token", "Modal opens with 4 doctor questions & copyable ABDM FHIR note", "Screenshot 5")
    ]
    tm_table = doc.add_table(rows=len(test_matrix)+1, cols=5)
    tm_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    tm_hdr = tm_table.rows[0]
    tm_hdr.cells[0].text = "Step"
    tm_hdr.cells[1].text = "Verification Objective"
    tm_hdr.cells[2].text = "Target Portal Route / Action"
    tm_hdr.cells[3].text = "Expected Result"
    tm_hdr.cells[4].text = "Reference"
    for c in tm_hdr.cells:
        set_cell_background(c, "0B2545")
        c.paragraphs[0].runs[0].font.bold = True
        c.paragraphs[0].runs[0].font.size = Pt(8.5)
        c.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        set_cell_margins(c, top=60, bottom=60, left=80, right=80)

    for i, row_data in enumerate(test_matrix):
        r = tm_table.rows[i+1]
        for col_idx in range(5):
            r.cells[col_idx].text = row_data[col_idx]
            r.cells[col_idx].paragraphs[0].runs[0].font.size = Pt(8)
            if col_idx == 0:
                r.cells[col_idx].paragraphs[0].runs[0].font.bold = True
        bg = "F8FAFC" if i % 2 == 0 else "FFFFFF"
        for c in r.cells:
            set_cell_background(c, bg)
            set_cell_margins(c, top=50, bottom=50, left=70, right=70)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Step 1
    add_heading_styled(doc, "Step 1: Verify AI System Telemetry & Sovereignty", level=1)
    p = doc.add_paragraph()
    p.add_run(
        "Open the Hospital Settings & Telemetry Portal:\n"
        "• URL: http://localhost:5173/settings\n"
        "• Direct Evaluation Link: http://localhost:5173/settings?evalAuth=admin\n"
        "• Tab: 'Local AI & Triage Telemetry'\n\n"
        "Verification Checklist:\n"
        "1. Engine Status: Shows 'Connected' with a green indicator.\n"
        "2. Endpoint Address: http://localhost:11434/api/generate (local loopback).\n"
        "3. Data Sovereignty: Guarantees zero cloud leakage under ABDM rules.\n"
        "4. Counters: Real-time queries logged and urgent alerts tracked."
    )
    add_figure(doc, os.path.join(screenshots_dir, "step1_ai_diagnostics.png"), "Step 1: Local AI Telemetry, Connectivity Status & ABDM Sovereignty Panel", 1)

    # Step 2
    add_heading_styled(doc, "Step 2: Test Routine Clinical Symptom Triage", level=1)
    p = doc.add_paragraph()
    p.add_run(
        "Open the Bharat Feature Phone Simulator:\n"
        "• URL: http://localhost:5173/ivr-simulator\n"
        "• Shortcut: http://localhost:5173/ivr-simulator?autoTriage=knee\n\n"
        "Testing Procedure:\n"
        "1. Select the preset 'Knee Swelling' (or enter 'Severe knee swelling and joint pain while walking').\n"
        "2. Click 'Run Local AI Triage'.\n"
        "3. Expected Department: Orthopaedics Department (ID: 3).\n"
        "4. Severity Level: ROUTINE, Confidence: 95%.\n"
        "5. Click 'Dial Hotline & Route via AI' to trigger the telephone booking directly for Orthopaedics."
    )
    add_figure(doc, os.path.join(screenshots_dir, "step2_ai_symptom_triage.png"), "Step 2: Routine Symptom Triage via On-Premise AI Model with Department Recommendation", 2)

    # Step 3
    add_heading_styled(doc, "Step 3: Test Emergency Red-Flag Triage & 108 Ambulance Routing", level=1)
    p = doc.add_paragraph()
    p.add_run(
        "Verify emergency detection for acute conditions:\n"
        "• URL: http://localhost:5173/ivr-simulator\n"
        "• Shortcut: http://localhost:5173/ivr-simulator?autoTriage=chest\n\n"
        "Testing Procedure:\n"
        "1. Select the preset 'Chest Pain' (or enter 'Severe crushing chest pain radiating to left arm').\n"
        "2. Click 'Run Local AI Triage'.\n"
        "3. Expected Outcome: Bright red banner: 'CRITICAL ALERT: Your symptoms indicate an urgent emergency. Please visit Hospital Casualty immediately or dial 108.'\n"
        "4. Severity Badge: Red EMERGENCY badge.\n"
        "5. Safety Action: Button dynamically updates to '🚨 Emergency: Dial 108 Ambulance'."
    )
    add_figure(doc, os.path.join(screenshots_dir, "step3_emergency_redflag.png"), "Step 3: Emergency Red-Flag Screening with Dial 108 Ambulance Routing", 3)

    # Step 4
    add_heading_styled(doc, "Step 4: Verify Token Queue with AI Severity Badges", level=1)
    p = doc.add_paragraph()
    p.add_run(
        "Open the Token Queue Desk:\n"
        "• URL: http://localhost:5173/tokens\n"
        "• Direct Evaluation Link: http://localhost:5173/tokens?evalAuth=staff\n\n"
        "Verification Checklist:\n"
        "1. Table Columns: Displays Token Number ('C001'), Linked ABHA ID, Patient Name, and Department.\n"
        "2. Badges: Tokens display ⚡ PRIORITY or ROUTINE pills.\n"
        "3. Action Button: Purple 'AI Brief' button is accessible on every triaged token."
    )
    add_figure(doc, os.path.join(screenshots_dir, "step4_token_queue_ai_badges.png"), "Step 4: OPD Token Queue Desk with AI Severity Badges and Linked ABHA IDs", 4)

    # Step 5
    add_heading_styled(doc, "Step 5: Test Resident Doctor Pre-Consultation Briefing & FHIR Note", level=1)
    p = doc.add_paragraph()
    p.add_run(
        "Click 'AI Brief' on any triaged token in the queue table.\n\n"
        "Verification Checklist:\n"
        "1. Modal Header: Displays triage severity, confidence score (95%), and engine.\n"
        "2. Chief Complaint: Displays recorded symptoms.\n"
        "3. Screening Questions: 4 tailored clinical questions for the resident doctor.\n"
        "4. ABDM FHIR Note: Complete structured clinical summary ready for export.\n"
        "5. Click 'Copy to EMR' to copy the text to clipboard."
    )
    add_figure(doc, os.path.join(screenshots_dir, "step5_ai_clinical_brief_modal.png"), "Step 5: Resident Doctor Pre-Consultation Clinical Briefing Modal with Draft ABDM FHIR Consultation Note", 5)

    # Terminal Testing
    add_heading_styled(doc, "Terminal / cURL API Verification Commands", level=1)
    p = doc.add_paragraph()
    p.add_run("1. AI Engine Health & Data Sovereignty Check:").font.bold = True
    add_code_block(doc, "curl -s http://localhost:8088/api/ai/status | jq .")

    p = doc.add_paragraph()
    p.add_run("2. Routine Symptom Triage (Orthopaedics):").font.bold = True
    add_code_block(doc, 'curl -s -X POST http://localhost:8088/api/ai/triage \\\n  -H "Content-Type: application/json" \\\n  -d \'{"symptoms": "Severe knee swelling and joint pain while walking", "language": "en"}\' | jq .')

    p = doc.add_paragraph()
    p.add_run("3. Emergency Red-Flag Triage (Cardiology / Casualty):").font.bold = True
    add_code_block(doc, 'curl -s -X POST http://localhost:8088/api/ai/triage \\\n  -H "Content-Type: application/json" \\\n  -d \'{"symptoms": "Severe crushing chest pain radiating to left arm", "language": "en"}\' | jq .')

    p = doc.add_paragraph()
    p.add_run("4. Regional Language Triage (Tamil Vernacular):").font.bold = True
    add_code_block(doc, 'curl -s -X POST http://localhost:8088/api/ai/triage \\\n  -H "Content-Type: application/json" \\\n  -d \'{"symptoms": "குழந்தைக்கு அதிக காய்ச்சல் மற்றும் வாந்தி", "language": "ta"}\' | jq .')

    p = doc.add_paragraph()
    p.add_run("5. Dynamic Queue Wait-Time Prediction:").font.bold = True
    add_code_block(doc, 'curl -s -X POST http://localhost:8088/api/ai/predict-wait-time \\\n  -H "Content-Type: application/json" \\\n  -d \'{"departmentId": 2, "hospitalId": 1}\' | jq .')

    doc.save(output_path)
    print(f"Successfully generated Standalone Test Guide DOCX at: {output_path}")

if __name__ == "__main__":
    screenshots_path = "/Users/eash/Documents/antigravity/dazzling-darwin/docs/screenshots"
    
    # 1. Generate Master Project Report DOCX
    master_out = "/Users/eash/Documents/antigravity/dazzling-darwin/PROJECT_DOCUMENTATION_REPORT.docx"
    build_master_project_docx(master_out, screenshots_path)

    # 2. Generate Standalone Local AI Test Guide DOCX
    guide_out = "/Users/eash/Documents/antigravity/dazzling-darwin/docs/LOCAL_AI_TEST_GUIDE.docx"
    build_standalone_test_guide_docx(guide_out, screenshots_path)
