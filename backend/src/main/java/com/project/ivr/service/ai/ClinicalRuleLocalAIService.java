package com.project.ivr.service.ai;

import com.project.ivr.dto.ai.SymptomTriageRequest;
import com.project.ivr.dto.ai.SymptomTriageResponse;
import com.project.ivr.entity.Department;
import com.project.ivr.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Embedded Multilingual Clinical Ontology & Rule-Based NLP Engine.
 * Operates 100% locally with zero external network dependencies and sub-5ms latency.
 * Aligned with standard OPD department taxonomy in Indian Government Civil Hospitals.
 */
@Service
@RequiredArgsConstructor
public class ClinicalRuleLocalAIService {

    private static final Logger log = LoggerFactory.getLogger(ClinicalRuleLocalAIService.class);

    private final DepartmentRepository departmentRepository;

    // Emergency red-flag patterns
    private static final List<String> EMERGENCY_PATTERNS = Arrays.asList(
            "radiating", "left arm", "chest crushing", "heart attack", "unconscious", "collapse",
            "severe breathing", "gasping", "heavy bleeding", "stroke", "paralysis", "sudden numbness",
            "மாரடைப்பு", "தீவிர நெஞ்சு வலி", "மூச்சு திணறல்", "மயக்கம்",
            "दिल का दौरा", "अचानक बेहोश", "सांस रुकना", "गंभीर सीने में दर्द"
    );

    // Department matchers
    private static final Map<String, List<String>> DEPT_KEYWORDS = new LinkedHashMap<>();

    static {
        // Cardiology (Dept ID 2)
        DEPT_KEYWORDS.put("Cardiology", Arrays.asList(
                "chest pain", "angina", "chest pressure", "palpitations", "heart", "cardiac",
                "breathless", "high bp", "hypertension", "pulse irregular",
                "நெஞ்சு வலி", "இதய", "படபடப்பு", "மாரடைப்பு", "இரத்த அழுத்தம்",
                "सीने में दर्द", "दिल", "धड़कन", "छाती", "बीपी", "हाई बीपी"
        ));

        // Paediatrics (Dept ID 6)
        DEPT_KEYWORDS.put("Paediatrics", Arrays.asList(
                "baby", "child", "infant", "newborn", "toddler", "pediatric", "vaccination", "immunization",
                "குழந்தை", "பாப்பா", "தடுப்பூசி", "சிறுவன்", "சிறுமி",
                "बच्चा", "शिशु", "बालक", "टीकाकरण", "बच्चों"
        ));

        // Orthopaedics (Dept ID 3)
        DEPT_KEYWORDS.put("Orthopaedics", Arrays.asList(
                "knee", "bone", "joint", "fracture", "swelling", "back pain", "spine", "arthritis", "sprain", "ligament", "walking difficulty",
                "மூட்டு வலி", "எலும்பு", "முறிவு", "இடுப்பு வலி", "முழங்கால்", "வீக்கம்",
                "घुटने", "हड्डी", "जोड़", "कमर दर्द", "मोच", "फ्रैक्चर", "सूजन"
        ));

        // Dermatology (Dept ID 4)
        DEPT_KEYWORDS.put("Dermatology", Arrays.asList(
                "skin", "rash", "itching", "eczema", "allergy", "fungal", "spots", "pimples", "hives", "psoriasis",
                "தோல்", "அரிப்பு", "தடிப்பு", "படை", "சொறி", "தோல் நோய்",
                "त्वचा", "खुजली", "चकत्ते", "दाद", "फुंसी", "एलर्जी", "स्किन"
        ));

        // ENT (Dept ID 5)
        DEPT_KEYWORDS.put("ENT", Arrays.asList(
                "ear", "nose", "throat", "sinus", "hearing", "tonsil", "hoarseness", "swallowing pain", "ear discharge",
                "காது", "மூக்கு", "தொண்டை", "சைனஸ்", "காது வலி", "தொண்டை வலி",
                "कान", "नाक", "गला", "टॉन्सिल", "कान दर्द", "गले में खराश"
        ));

        // General Medicine (Dept ID 1 - Default fallback for fever/internal)
        DEPT_KEYWORDS.put("General Medicine", Arrays.asList(
                "fever", "cough", "cold", "headache", "vomiting", "stomach", "diarrhea", "typhoid", "malaria", "dengue", "weakness", "fatigue", "body pain",
                "காய்ச்சல்", "இருமல்", "சளி", "தலைவலி", "வாந்தி", "வயிற்று வலி", "சோர்வு",
                "बुखार", "खांसी", "जुकाम", "सिरदर्द", "उल्टी", "पेट दर्द", "कमजोरी"
        ));
    }

    public SymptomTriageResponse triage(SymptomTriageRequest request) {
        long startTime = System.currentTimeMillis();
        String symptoms = request.getSymptoms() != null ? request.getSymptoms().toLowerCase().trim() : "";
        String lang = request.getLanguage() != null ? request.getLanguage().toLowerCase() : "en";

        // 1. Check for Emergency Red Flags
        boolean isEmergency = false;
        for (String redFlag : EMERGENCY_PATTERNS) {
            if (symptoms.contains(redFlag.toLowerCase())) {
                isEmergency = true;
                break;
            }
        }

        // 2. Score Departments based on keyword match density
        Map<String, Integer> scoreMap = new HashMap<>();
        for (Map.Entry<String, List<String>> entry : DEPT_KEYWORDS.entrySet()) {
            int score = 0;
            for (String kw : entry.getValue()) {
                if (symptoms.contains(kw.toLowerCase())) {
                    score += 2;
                }
            }
            scoreMap.put(entry.getKey(), score);
        }

        // Find highest scoring department
        String matchedDeptName = "General Medicine";
        int maxScore = 0;
        for (Map.Entry<String, Integer> entry : scoreMap.entrySet()) {
            if (entry.getValue() > maxScore) {
                maxScore = entry.getValue();
                matchedDeptName = entry.getKey();
            }
        }

        // Emergency override: severe chest symptoms go to Cardiology
        if (isEmergency && (symptoms.contains("chest") || symptoms.contains("நெஞ்சு") || symptoms.contains("सीने"))) {
            matchedDeptName = "Cardiology";
        }

        // Paediatric override: any clinical complaint involving an infant or child routes to Paediatrics
        boolean isChildComplaint = symptoms.contains("baby") || symptoms.contains("child") || symptoms.contains("infant")
                || symptoms.contains("குழந்தை") || symptoms.contains("பாப்பா")
                || symptoms.contains("बच्चा") || symptoms.contains("शिशु") || symptoms.contains("बच्चों");
        if (isChildComplaint && !isEmergency) {
            matchedDeptName = "Paediatrics";
        }

        // Resolve Department Entity from DB
        List<Department> allDepts = departmentRepository.findAll();
        final String targetName = matchedDeptName;
        Department dept = allDepts.stream()
                .filter(d -> d.getName().toLowerCase().contains(targetName.toLowerCase()))
                .findFirst()
                .orElse(allDepts.isEmpty() ? null : allDepts.get(0));

        Long deptId = dept != null ? dept.getId() : 1L;
        String deptName = dept != null ? dept.getName() : matchedDeptName;
        String deptCode = dept != null ? dept.getCode() : "MED";

        // Determine Severity
        String severityLevel;
        if (isEmergency) {
            severityLevel = "EMERGENCY";
        } else if (targetName.equals("Paediatrics") || targetName.equals("Cardiology")) {
            severityLevel = "PRIORITY";
        } else if (maxScore >= 6) {
            severityLevel = "PRIORITY";
        } else {
            severityLevel = "ROUTINE";
        }

        double confidence = maxScore > 0 ? Math.min(0.96, 0.70 + (maxScore * 0.08)) : 0.65;
        if (isEmergency) confidence = Math.max(0.92, confidence);

        long latency = System.currentTimeMillis() - startTime;

        String rationale = generateRationale(targetName, severityLevel, lang);
        String patientAdvice = generatePatientAdvice(targetName, severityLevel, lang);
        String emergencyMsg = isEmergency ? generateEmergencyInstructions(lang) : null;

        return SymptomTriageResponse.builder()
                .recommendedDepartmentId(deptId)
                .recommendedDepartmentName(deptName)
                .recommendedDepartmentCode(deptCode)
                .severityLevel(severityLevel)
                .confidenceScore(Math.round(confidence * 100.0) / 100.0)
                .clinicalRationale(rationale)
                .patientFriendlyAdvice(patientAdvice)
                .isEmergencyRedFlag(isEmergency)
                .emergencyInstructions(emergencyMsg)
                .aiEngine("EMBEDDED_CLINICAL_NLP (Ontology v1.0)")
                .latencyMs(latency)
                .build();
    }

    private String generateRationale(String dept, String severity, String lang) {
        if ("ta".equals(lang)) {
            return String.format("உங்கள் அறிகுறிகளின் அடிப்படையில் %s பிரிவு பரிந்துரைக்கப்படுகிறது. தீவிர நிலை: %s.", dept, severity);
        } else if ("hi".equals(lang)) {
            return String.format("आपके लक्षणों के विश्लेषण के आधार पर %s विभाग की सिफारिश की जाती है। गंभीरता: %s।", dept, severity);
        } else {
            return String.format("Clinical heuristic analysis maps presenting symptoms to %s department. Assigned triage priority: %s.", dept, severity);
        }
    }

    private String generatePatientAdvice(String dept, String severity, String lang) {
        if ("ta".equals(lang)) {
            if ("EMERGENCY".equals(severity)) {
                return "கவனம்: உடனடியாக அவசர சிகிச்சை பிரிவு (Casualty) செல்லவும் அல்லது 108 அழைக்கவும்.";
            }
            return String.format("தயவுசெய்து %s பிரிவில் டோக்கன் பெற்று மருத்துவரை அணுகவும்.", dept);
        } else if ("hi".equals(lang)) {
            if ("EMERGENCY".equals(severity)) {
                return "सावधानी: तुरंत अस्पताल के आपातकालीन वार्ड (Casualty) जाएं या 108 एम्बुलेंस को कॉल करें।";
            }
            return String.format("कृपया %s विभाग के लिए टोकन प्राप्त करें और डॉक्टर से परामर्श लें।", dept);
        } else {
            if ("EMERGENCY".equals(severity)) {
                return "WARNING: Urgent red-flag symptoms detected. Please proceed directly to Hospital Casualty/Emergency or call 108.";
            }
            return String.format("Please book your consultation under %s department.", dept);
        }
    }

    private String generateEmergencyInstructions(String lang) {
        if ("ta".equals(lang)) {
            return "உடனடி எச்சரிக்கை: மருத்துவ அவசர நிலை அறிகுறிகள் கண்டறியப்பட்டன. அவசர சிகிச்சை பிரிவை (Casualty) அணுகவும். ஆம்புலன்ஸ் உதவிக்கு 108 அழைக்கவும்.";
        } else if ("hi".equals(lang)) {
            return "तत्काल चेतावनी: आपातकालीन लक्षण पाए गए हैं। तुरंत अस्पताल के कैजुअल्टी वार्ड में जाएं या 108 एम्बुलेंस से संपर्क करें।";
        } else {
            return "CRITICAL ALERT: Potential high-risk emergency condition. Proceed immediately to Hospital Emergency / Casualty or call 108 Ambulance.";
        }
    }
}
