package com.project.ivr.controller;

import com.project.ivr.dto.ApiResponse;
import com.project.ivr.entity.IvrSession;
import com.project.ivr.ivr.IVRService;
import com.project.ivr.ivr.IVRSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ivr")
@RequiredArgsConstructor
@Tag(name = "IVR Twilio Voice API", description = "Twilio Voice Webhooks and interactive phone call simulation")
public class IVRController {

    private static final Logger log = LoggerFactory.getLogger(IVRController.class);

    private final IVRService ivrService;
    private final IVRSessionService sessionService;

    @PostMapping(value = "/incoming", produces = {MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_XML_VALUE})
    @Operation(summary = "Twilio Webhook: Initial incoming phone call")
    public ResponseEntity<String> incoming(
            @RequestParam(value = "CallSid", required = false) String callSid,
            @RequestParam(value = "From", required = false) String from,
            @RequestParam(required = false) Map<String, String> body) {

        String safeCallSid = resolveParam(callSid, body, "CallSid", "SIM_" + UUID.randomUUID().toString().substring(0, 8));
        String safeFrom = resolveParam(from, body, "From", "9876543210");

        log.info("[IVR INCOMING] CallSid: {}, From: {}", safeCallSid, safeFrom);
        String twiml = ivrService.handleIncoming(safeCallSid, safeFrom);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_XML).body(twiml);
    }

    @PostMapping(value = "/language", produces = {MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_XML_VALUE})
    @Operation(summary = "Twilio Webhook: Handle language selection digit")
    public ResponseEntity<String> selectLanguage(
            @RequestParam(value = "CallSid", required = false) String callSid,
            @RequestParam(value = "Digits", required = false) String digits,
            @RequestParam(value = "From", required = false) String from,
            @RequestParam(required = false) Map<String, String> body) {

        String safeCallSid = resolveParam(callSid, body, "CallSid", "");
        String safeDigits = resolveParam(digits, body, "Digits", "1");
        String safeFrom = resolveParam(from, body, "From", "9876543210");

        log.info("[IVR LANGUAGE] CallSid: {}, Digits: {}", safeCallSid, safeDigits);
        String twiml = ivrService.handleLanguage(safeCallSid, safeDigits, safeFrom);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_XML).body(twiml);
    }

    @PostMapping(value = "/verify", produces = {MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_XML_VALUE})
    @Operation(summary = "Twilio Webhook: Handle verification, ABHA or OTP input")
    public ResponseEntity<String> verify(
            @RequestParam(value = "CallSid", required = false) String callSid,
            @RequestParam(value = "Digits", required = false) String digits,
            @RequestParam(value = "From", required = false) String from,
            @RequestParam(required = false) Map<String, String> body) {

        String safeCallSid = resolveParam(callSid, body, "CallSid", "");
        String safeDigits = resolveParam(digits, body, "Digits", "");
        String safeFrom = resolveParam(from, body, "From", "9876543210");

        log.info("[IVR VERIFY] CallSid: {}, Digits: {}", safeCallSid, safeDigits);
        String twiml = ivrService.handleVerify(safeCallSid, safeDigits, safeFrom);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_XML).body(twiml);
    }

    @PostMapping(value = "/hospital", produces = {MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_XML_VALUE})
    @Operation(summary = "Twilio Webhook: Handle hospital selection digit")
    public ResponseEntity<String> selectHospital(
            @RequestParam(value = "CallSid", required = false) String callSid,
            @RequestParam(value = "Digits", required = false) String digits,
            @RequestParam(value = "From", required = false) String from,
            @RequestParam(required = false) Map<String, String> body) {

        String safeCallSid = resolveParam(callSid, body, "CallSid", "");
        String safeDigits = resolveParam(digits, body, "Digits", "1");
        String safeFrom = resolveParam(from, body, "From", "9876543210");

        log.info("[IVR HOSPITAL] CallSid: {}, Digits: {}", safeCallSid, safeDigits);
        String twiml = ivrService.handleHospital(safeCallSid, safeDigits, safeFrom);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_XML).body(twiml);
    }

    @PostMapping(value = "/department", produces = {MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_XML_VALUE})
    @Operation(summary = "Twilio Webhook: Handle department selection digit")
    public ResponseEntity<String> selectDepartment(
            @RequestParam(value = "CallSid", required = false) String callSid,
            @RequestParam(value = "Digits", required = false) String digits,
            @RequestParam(value = "From", required = false) String from,
            @RequestParam(required = false) Map<String, String> body) {

        String safeCallSid = resolveParam(callSid, body, "CallSid", "");
        String safeDigits = resolveParam(digits, body, "Digits", "1");
        String safeFrom = resolveParam(from, body, "From", "9876543210");

        log.info("[IVR DEPARTMENT] CallSid: {}, Digits: {}", safeCallSid, safeDigits);
        String twiml = ivrService.handleDepartment(safeCallSid, safeDigits, safeFrom);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_XML).body(twiml);
    }

    @PostMapping(value = "/token", produces = {MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_XML_VALUE})
    @Operation(summary = "Twilio Webhook: Confirm token generation")
    public ResponseEntity<String> confirmToken(
            @RequestParam(value = "CallSid", required = false) String callSid,
            @RequestParam(value = "Digits", required = false) String digits,
            @RequestParam(value = "From", required = false) String from,
            @RequestParam(required = false) Map<String, String> body) {

        String safeCallSid = resolveParam(callSid, body, "CallSid", "");
        String safeDigits = resolveParam(digits, body, "Digits", "1");
        String safeFrom = resolveParam(from, body, "From", "9876543210");

        String twiml = ivrService.handleToken(safeCallSid, safeDigits, safeFrom);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_XML).body(twiml);
    }

    @PostMapping(value = "/cancel", produces = {MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_XML_VALUE})
    @Operation(summary = "Twilio Webhook: Cancel token via voice call")
    public ResponseEntity<String> cancelToken(
            @RequestParam(value = "CallSid", required = false) String callSid,
            @RequestParam(value = "Digits", required = false) String digits,
            @RequestParam(value = "From", required = false) String from,
            @RequestParam(required = false) Map<String, String> body) {

        String safeCallSid = resolveParam(callSid, body, "CallSid", "");
        String safeDigits = resolveParam(digits, body, "Digits", "");
        String safeFrom = resolveParam(from, body, "From", "9876543210");

        String twiml = ivrService.handleCancel(safeCallSid, safeDigits, safeFrom);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_XML).body(twiml);
    }

    @PostMapping(value = "/reschedule", produces = {MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_XML_VALUE})
    @Operation(summary = "Twilio Webhook: Reschedule token via voice call")
    public ResponseEntity<String> rescheduleToken(
            @RequestParam(value = "CallSid", required = false) String callSid,
            @RequestParam(value = "Digits", required = false) String digits,
            @RequestParam(value = "From", required = false) String from,
            @RequestParam(required = false) Map<String, String> body) {

        String safeCallSid = resolveParam(callSid, body, "CallSid", "");
        String safeDigits = resolveParam(digits, body, "Digits", "");
        String safeFrom = resolveParam(from, body, "From", "9876543210");

        String twiml = ivrService.handleReschedule(safeCallSid, safeDigits, safeFrom);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_XML).body(twiml);
    }

    @PostMapping(value = "/officer", produces = {MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_XML_VALUE})
    @Operation(summary = "Twilio Webhook: Connect call to hospital helpdesk officer")
    public ResponseEntity<String> officerTransfer(
            @RequestParam(value = "CallSid", required = false) String callSid,
            @RequestParam(value = "From", required = false) String from,
            @RequestParam(required = false) Map<String, String> body) {

        String safeCallSid = resolveParam(callSid, body, "CallSid", "");
        String safeFrom = resolveParam(from, body, "From", "9876543210");

        String twiml = ivrService.handleOfficer(safeCallSid, safeFrom);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_XML).body(twiml);
    }

    @PostMapping(value = "/symptom", produces = {MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_XML_VALUE})
    @Operation(summary = "Twilio Webhook: Handle AI Clinical Symptom Input")
    public ResponseEntity<String> handleSymptom(
            @RequestParam(value = "CallSid", required = false) String callSid,
            @RequestParam(value = "Digits", required = false) String digits,
            @RequestParam(value = "SpeechResult", required = false) String speechResult,
            @RequestParam(value = "From", required = false) String from,
            @RequestParam(required = false) Map<String, String> body) {

        String safeCallSid = resolveParam(callSid, body, "CallSid", "");
        String safeDigits = resolveParam(digits, body, "Digits", "");
        String safeSpeech = resolveParam(speechResult, body, "SpeechResult", "");
        String safeFrom = resolveParam(from, body, "From", "9876543210");

        log.info("[IVR AI SYMPTOM] CallSid: {}, Digits: {}, Speech: {}", safeCallSid, safeDigits, safeSpeech);
        String twiml = ivrService.handleSymptom(safeCallSid, safeDigits, safeSpeech, safeFrom);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_XML).body(twiml);
    }

    @PostMapping(value = "/confirm-ai-token", produces = {MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_XML_VALUE})
    @Operation(summary = "Twilio Webhook: Confirm or modify AI-recommended token")
    public ResponseEntity<String> confirmAiToken(
            @RequestParam(value = "CallSid", required = false) String callSid,
            @RequestParam(value = "Digits", required = false) String digits,
            @RequestParam(value = "From", required = false) String from,
            @RequestParam(required = false) Map<String, String> body) {

        String safeCallSid = resolveParam(callSid, body, "CallSid", "");
        String safeDigits = resolveParam(digits, body, "Digits", "1");
        String safeFrom = resolveParam(from, body, "From", "9876543210");

        log.info("[IVR AI CONFIRM TOKEN] CallSid: {}, Digits: {}", safeCallSid, safeDigits);
        String twiml = ivrService.handleConfirmAiToken(safeCallSid, safeDigits, safeFrom);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_XML).body(twiml);
    }

    @GetMapping("/session/{callSid}")
    @Operation(summary = "Get current IVR session state (for web phone simulator)")
    public ResponseEntity<ApiResponse<IvrSession>> getSessionState(@PathVariable String callSid) {
        return sessionService.getSession(callSid)
                .map(s -> ResponseEntity.ok(ApiResponse.success(s)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Session not found", "SESSION_NOT_FOUND")));
    }

    private String resolveParam(String paramVal, Map<String, String> body, String key, String defaultVal) {
        if (paramVal != null && !paramVal.isBlank()) {
            return paramVal;
        }
        if (body != null && body.containsKey(key) && body.get(key) != null && !body.get(key).isBlank()) {
            return body.get(key);
        }
        if (body != null && body.containsKey(key.toLowerCase()) && body.get(key.toLowerCase()) != null && !body.get(key.toLowerCase()).isBlank()) {
            return body.get(key.toLowerCase());
        }
        return defaultVal;
    }
}
