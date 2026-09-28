package com.project.ivr.ivr;

import com.project.ivr.dto.*;
import com.project.ivr.entity.*;
import com.project.ivr.exception.DuplicateBookingException;
import com.project.ivr.exception.InvalidOtpException;
import com.project.ivr.exception.OtpExhaustedException;
import com.project.ivr.exception.TokenUnavailableException;
import com.project.ivr.integration.abha.ABHAIntegrationService;
import com.project.ivr.integration.hospital.HospitalIntegrationService;
import com.project.ivr.repository.*;
import com.twilio.twiml.VoiceResponse;
import com.twilio.twiml.voice.Dial;
import com.twilio.twiml.voice.Gather;
import com.twilio.twiml.voice.Hangup;
import com.twilio.twiml.voice.Say;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IVRService {

    private static final Logger log = LoggerFactory.getLogger(IVRService.class);

    private final IVRSessionService sessionService;
    private final IVRPromptService promptService;
    private final HospitalIntegrationService hospitalIntegrationService;
    private final ABHAIntegrationService abhaIntegrationService;
    private final PatientRepository patientRepository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final TokenRepository tokenRepository;

    @Value("${app.ivr.base-url:http://localhost:8080}")
    private String ivrBaseUrl;

    public String handleIncoming(String callSid, String from) {
        String cleanPhone = cleanMobile(from);
        IvrSession session = sessionService.getOrCreateSession(callSid, cleanPhone);
        sessionService.updateStep(callSid, IvrState.LANGUAGE_SELECTION);

        String welcome = promptService.getPrompt("ivr.welcome", "en");
        String langMenu = promptService.getPrompt("ivr.language.select", "en");

        Gather gather = new Gather.Builder()
                .action(ivrBaseUrl + "/api/ivr/language")
                .numDigits(1)
                .timeout(8)
                .say(new Say.Builder(welcome + " " + langMenu).language(Say.Language.EN_IN).build())
                .build();

        return new VoiceResponse.Builder()
                .gather(gather)
                .say(new Say.Builder(promptService.getPrompt("ivr.error.timeout", "en")).language(Say.Language.EN_IN).build())
                .hangup(new Hangup.Builder().build())
                .build()
                .toXml();
    }

    public String handleLanguage(String callSid, String digits, String from) {
        String cleanPhone = cleanMobile(from);
        IvrSession session = sessionService.getOrCreateSession(callSid, cleanPhone);

        String lang = "en";
        if ("2".equals(digits)) {
            lang = "ta";
        } else if ("3".equals(digits)) {
            lang = "hi";
        }
        sessionService.updateLanguage(callSid, lang);
        Say.Language sayLang = getSayLanguage(lang);

        // Check if caller mobile is recognized in Patient / ABHA database
        Optional<Patient> patientOpt = patientRepository.findByMobileNumber(cleanPhone);

        if (patientOpt.isPresent()) {
            Patient patient = patientOpt.get();
            sessionService.updatePatient(callSid, patient.getId());
            sessionService.updateStep(callSid, IvrState.MAIN_MENU);

            String greeting = promptService.getPrompt("ivr.patient.recognized", lang, patient.getFullName());
            String menu = promptService.getPrompt("ivr.main.menu", lang);

            Gather gather = new Gather.Builder()
                    .action(ivrBaseUrl + "/api/ivr/verify")
                        .numDigits(1)
                    .timeout(10)
                    .say(new Say.Builder(greeting + " " + menu).language(sayLang).build())
                    .build();

            return new VoiceResponse.Builder()
                    .gather(gather)
                    .say(new Say.Builder(promptService.getPrompt("ivr.error.timeout", lang)).language(sayLang).build())
                    .hangup(new Hangup.Builder().build())
                    .build()
                    .toXml();
        } else {
            // Unregistered caller: Ask for mock ABHA ID or 0
            sessionService.updateStep(callSid, IvrState.IDENTITY_VERIFICATION);
            String abhaPrompt = promptService.getPrompt("ivr.patient.enter.abha", lang);

            Gather gather = new Gather.Builder()
                    .action(ivrBaseUrl + "/api/ivr/verify")
                        .finishOnKey("#")
                    .timeout(12)
                    .say(new Say.Builder(abhaPrompt).language(sayLang).build())
                    .build();

            return new VoiceResponse.Builder()
                    .gather(gather)
                    .say(new Say.Builder(promptService.getPrompt("ivr.error.timeout", lang)).language(sayLang).build())
                    .hangup(new Hangup.Builder().build())
                    .build()
                    .toXml();
        }
    }

    public String handleVerify(String callSid, String digits, String from) {
        String cleanPhone = cleanMobile(from);
        IvrSession session = sessionService.getOrCreateSession(callSid, cleanPhone);
        String lang = session.getLanguage();
        Say.Language sayLang = getSayLanguage(lang);

        IvrState state = session.getCurrentStep();

        if (state == IvrState.MAIN_MENU) {
            return switch (digits) {
                case "1" -> buildHospitalMenu(callSid, lang, sayLang);
                case "2" -> {
                    sessionService.updateStep(callSid, IvrState.CANCEL_TOKEN);
                    String cancelPrompt = promptService.getPrompt("ivr.cancel.prompt", lang);
                    Gather gather = new Gather.Builder()
                            .action(ivrBaseUrl + "/api/ivr/cancel")
                                        .finishOnKey("#")
                            .timeout(10)
                            .say(new Say.Builder(cancelPrompt).language(sayLang).build())
                            .build();
                    yield new VoiceResponse.Builder().gather(gather).build().toXml();
                }
                case "3" -> {
                    sessionService.updateStep(callSid, IvrState.RESCHEDULE_TOKEN);
                    String reschedPrompt = promptService.getPrompt("ivr.cancel.prompt", lang);
                    Gather gather = new Gather.Builder()
                            .action(ivrBaseUrl + "/api/ivr/reschedule")
                                        .finishOnKey("#")
                            .timeout(10)
                            .say(new Say.Builder(reschedPrompt).language(sayLang).build())
                            .build();
                    yield new VoiceResponse.Builder().gather(gather).build().toXml();
                }
                case "4" -> buildOfficerTransfer(lang, sayLang);
                default -> {
                    String invalid = promptService.getPrompt("ivr.error.invalid.input", lang);
                    String menu = promptService.getPrompt("ivr.main.menu", lang);
                    Gather gather = new Gather.Builder()
                            .action(ivrBaseUrl + "/api/ivr/verify")
                                        .numDigits(1)
                            .say(new Say.Builder(invalid + " " + menu).language(sayLang).build())
                            .build();
                    yield new VoiceResponse.Builder().gather(gather).build().toXml();
                }
            };
        } else if (state == IvrState.IDENTITY_VERIFICATION) {
            // Patient entered mock ABHA number or 0
            if (digits == null || digits.isBlank() || "0".equals(digits.trim())) {
                // Register caller as citizen with mock profile
                abhaIntegrationService.createOrLinkMockPatient(cleanPhone, null, "Citizen " + cleanPhone.substring(Math.max(0, cleanPhone.length() - 4)));
            } else {
                abhaIntegrationService.createOrLinkMockPatient(cleanPhone, digits.trim(), "Citizen " + cleanPhone.substring(Math.max(0, cleanPhone.length() - 4)));
            }

            // Dispatch OTP
            abhaIntegrationService.sendOtp(cleanPhone);
            sessionService.updateStep(callSid, IvrState.OTP_VERIFICATION);

            String otpPrompt = promptService.getPrompt("ivr.otp.sent", lang);
            Gather gather = new Gather.Builder()
                    .action(ivrBaseUrl + "/api/ivr/verify")
                        .numDigits(6)
                    .timeout(15)
                    .say(new Say.Builder(otpPrompt).language(sayLang).build())
                    .build();

            return new VoiceResponse.Builder().gather(gather).build().toXml();
        } else if (state == IvrState.OTP_VERIFICATION) {
            // Verify entered OTP
            try {
                boolean verified = abhaIntegrationService.verifyOtp(cleanPhone, digits != null ? digits.trim() : "");
                if (verified) {
                    Patient patient = patientRepository.findByMobileNumber(cleanPhone).orElse(null);
                    if (patient != null) {
                        sessionService.updatePatient(callSid, patient.getId());
                    }
                    return buildHospitalMenu(callSid, lang, sayLang);
                }
            } catch (InvalidOtpException ex) {
                String invalidOtp = promptService.getPrompt("ivr.otp.invalid", lang, 2);
                Gather gather = new Gather.Builder()
                        .action(ivrBaseUrl + "/api/ivr/verify")
                                .numDigits(6)
                        .say(new Say.Builder(invalidOtp).language(sayLang).build())
                        .build();
                return new VoiceResponse.Builder().gather(gather).build().toXml();
            } catch (OtpExhaustedException ex) {
                String exhausted = promptService.getPrompt("ivr.otp.exhausted", lang);
                sessionService.markCallFailed(callSid, "OTP_ATTEMPTS_EXHAUSTED");
                return new VoiceResponse.Builder()
                        .say(new Say.Builder(exhausted).language(sayLang).build())
                        .hangup(new Hangup.Builder().build())
                        .build()
                        .toXml();
            }
        }

        return buildHospitalMenu(callSid, lang, sayLang);
    }

    public String handleHospital(String callSid, String digits, String from) {
        String cleanPhone = cleanMobile(from);
        IvrSession session = sessionService.getOrCreateSession(callSid, cleanPhone);
        String lang = session.getLanguage();
        Say.Language sayLang = getSayLanguage(lang);

        Long hospitalId = 1L;
        if ("2".equals(digits)) {
            hospitalId = 2L;
        } else if ("3".equals(digits)) {
            hospitalId = 3L;
        }

        sessionService.updateHospital(callSid, hospitalId);
        sessionService.updateStep(callSid, IvrState.DEPARTMENT_SELECTION);

        String deptMenu = promptService.getPrompt("ivr.department.select", lang);
        Gather gather = new Gather.Builder()
                .action(ivrBaseUrl + "/api/ivr/department")
                .numDigits(1)
                .timeout(10)
                .say(new Say.Builder(deptMenu).language(sayLang).build())
                .build();

        return new VoiceResponse.Builder()
                .gather(gather)
                .say(new Say.Builder(promptService.getPrompt("ivr.error.timeout", lang)).language(sayLang).build())
                .hangup(new Hangup.Builder().build())
                .build()
                .toXml();
    }

    public String handleDepartment(String callSid, String digits, String from) {
        String cleanPhone = cleanMobile(from);
        IvrSession session = sessionService.getOrCreateSession(callSid, cleanPhone);
        String lang = session.getLanguage();
        Say.Language sayLang = getSayLanguage(lang);

        Long deptId = 1L;
        try {
            int d = Integer.parseInt(digits);
            if (d >= 1 && d <= 6) {
                deptId = (long) d;
            }
        } catch (Exception ignored) {}

        sessionService.updateDepartment(callSid, deptId);
        return handleTokenGeneration(callSid, session.getHospitalId(), deptId, cleanPhone, lang, sayLang);
    }

    public String handleToken(String callSid, String digits, String from) {
        String cleanPhone = cleanMobile(from);
        IvrSession session = sessionService.getOrCreateSession(callSid, cleanPhone);
        String lang = session.getLanguage();
        Say.Language sayLang = getSayLanguage(lang);

        Long deptId = session.getDepartmentId() != null ? session.getDepartmentId() : 1L;
        Long hospId = session.getHospitalId() != null ? session.getHospitalId() : 1L;

        return handleTokenGeneration(callSid, hospId, deptId, cleanPhone, lang, sayLang);
    }

    public String handleCancel(String callSid, String digits, String from) {
        String cleanPhone = cleanMobile(from);
        IvrSession session = sessionService.getOrCreateSession(callSid, cleanPhone);
        String lang = session.getLanguage();
        Say.Language sayLang = getSayLanguage(lang);

        List<TokenStatus> active = Arrays.asList(TokenStatus.BOOKED, TokenStatus.CONFIRMED, TokenStatus.CALLED);
        List<Token> tokens = tokenRepository.findActiveTokensByMobile(cleanPhone, active);

        if (tokens.isEmpty()) {
            String notFound = promptService.getPrompt("ivr.cancel.not.found", lang);
            return new VoiceResponse.Builder()
                    .say(new Say.Builder(notFound).language(sayLang).build())
                    .hangup(new Hangup.Builder().build())
                    .build()
                    .toXml();
        }

        Token tokenToCancel = tokens.get(0);
        hospitalIntegrationService.cancelToken(tokenToCancel.getId(), CancelTokenRequest.builder()
                .reason("IVR Caller Cancelled")
                .callerMobile(cleanPhone)
                .channel(RequestChannel.IVR)
                .build());

        String success = promptService.getPrompt("ivr.cancel.success", lang, tokenToCancel.getTokenNumber());
        return new VoiceResponse.Builder()
                .say(new Say.Builder(success).language(sayLang).build())
                .hangup(new Hangup.Builder().build())
                .build()
                .toXml();
    }

    public String handleReschedule(String callSid, String digits, String from) {
        String cleanPhone = cleanMobile(from);
        IvrSession session = sessionService.getOrCreateSession(callSid, cleanPhone);
        String lang = session.getLanguage();
        Say.Language sayLang = getSayLanguage(lang);

        List<TokenStatus> active = Arrays.asList(TokenStatus.BOOKED, TokenStatus.CONFIRMED, TokenStatus.CALLED);
        List<Token> tokens = tokenRepository.findActiveTokensByMobile(cleanPhone, active);

        if (tokens.isEmpty()) {
            String notFound = promptService.getPrompt("ivr.cancel.not.found", lang);
            return new VoiceResponse.Builder()
                    .say(new Say.Builder(notFound).language(sayLang).build())
                    .hangup(new Hangup.Builder().build())
                    .build()
                    .toXml();
        }

        Token oldToken = tokens.get(0);
        // Switch to General Medicine or next available department
        Long newDept = (oldToken.getDepartment().getId() == 1L) ? 2L : 1L;

        TokenDto newToken = hospitalIntegrationService.rescheduleToken(oldToken.getId(), RescheduleTokenRequest.builder()
                .newHospitalId(oldToken.getHospital().getId())
                .newDepartmentId(newDept)
                .newBookingDate(LocalDate.now())
                .callerMobile(cleanPhone)
                .channel(RequestChannel.IVR)
                .build());

        String timeStr = newToken.getEstimatedTime().format(DateTimeFormatter.ofPattern("hh:mm a"));
        String success = promptService.getPrompt("ivr.reschedule.success", lang, newToken.getTokenNumber(), timeStr);

        return new VoiceResponse.Builder()
                .say(new Say.Builder(success).language(sayLang).build())
                .hangup(new Hangup.Builder().build())
                .build()
                .toXml();
    }

    public String handleOfficer(String callSid, String from) {
        String cleanPhone = cleanMobile(from);
        IvrSession session = sessionService.getOrCreateSession(callSid, cleanPhone);
        String lang = session.getLanguage();
        Say.Language sayLang = getSayLanguage(lang);

        return buildOfficerTransfer(lang, sayLang);
    }

    private String handleTokenGeneration(String callSid, Long hospitalId, Long departmentId, String mobile, String lang, Say.Language sayLang) {
        try {
            TokenBookingRequest bookingReq = TokenBookingRequest.builder()
                    .patientMobile(mobile)
                    .hospitalId(hospitalId)
                    .departmentId(departmentId)
                    .bookingDate(LocalDate.now())
                    .channel(RequestChannel.IVR)
                    .build();

            TokenDto tokenDto = hospitalIntegrationService.bookToken(bookingReq);

            Hospital hospital = hospitalRepository.findById(hospitalId).orElse(null);
            Department department = departmentRepository.findById(departmentId).orElse(null);
            Token token = tokenRepository.findById(tokenDto.getId()).orElse(null);

            sessionService.updateTokenAndComplete(callSid, tokenDto.getId(), hospital, department, token);

            String timeStr = tokenDto.getEstimatedTime().format(DateTimeFormatter.ofPattern("hh:mm a"));
            String successMsg = promptService.getPrompt("ivr.token.success", lang, tokenDto.getTokenNumber(), timeStr);

            return new VoiceResponse.Builder()
                    .say(new Say.Builder(successMsg).language(sayLang).build())
                    .hangup(new Hangup.Builder().build())
                    .build()
                    .toXml();

        } catch (DuplicateBookingException dup) {
            log.warn("Duplicate booking detected in IVR: {}", dup.getMessage());
            String dupMsg = promptService.getPrompt("ivr.token.duplicate", lang, "EXISTING");
            sessionService.markCallFailed(callSid, "DUPLICATE_BOOKING");

            return new VoiceResponse.Builder()
                    .say(new Say.Builder(dupMsg).language(sayLang).build())
                    .hangup(new Hangup.Builder().build())
                    .build()
                    .toXml();

        } catch (TokenUnavailableException unavail) {
            log.warn("Token capacity reached in IVR: {}", unavail.getMessage());
            String unavailMsg = promptService.getPrompt("ivr.token.unavailable", lang);

            Gather gather = new Gather.Builder()
                    .action(ivrBaseUrl + "/api/ivr/verify")
                        .numDigits(1)
                    .say(new Say.Builder(unavailMsg).language(sayLang).build())
                    .build();

            return new VoiceResponse.Builder().gather(gather).build().toXml();

        } catch (Exception e) {
            log.error("Token generation error in IVR: ", e);
            sessionService.markCallFailed(callSid, e.getMessage());
            String errorMsg = promptService.getPrompt("ivr.error.invalid.input", lang);

            return new VoiceResponse.Builder()
                    .say(new Say.Builder(errorMsg).language(sayLang).build())
                    .hangup(new Hangup.Builder().build())
                    .build()
                    .toXml();
        }
    }

    private String buildHospitalMenu(String callSid, String lang, Say.Language sayLang) {
        sessionService.updateStep(callSid, IvrState.HOSPITAL_SELECTION);
        String hospitalPrompt = promptService.getPrompt("ivr.hospital.select", lang);

        Gather gather = new Gather.Builder()
                .action(ivrBaseUrl + "/api/ivr/hospital")
                .numDigits(1)
                .timeout(10)
                .say(new Say.Builder(hospitalPrompt).language(sayLang).build())
                .build();

        return new VoiceResponse.Builder()
                .gather(gather)
                .say(new Say.Builder(promptService.getPrompt("ivr.error.timeout", lang)).language(sayLang).build())
                .hangup(new Hangup.Builder().build())
                .build()
                .toXml();
    }

    private String buildOfficerTransfer(String lang, Say.Language sayLang) {
        String transfer = promptService.getPrompt("ivr.officer.transfer", lang);
        Dial dial = new Dial.Builder("+914425305000").build();

        return new VoiceResponse.Builder()
                .say(new Say.Builder(transfer).language(sayLang).build())
                .dial(dial)
                .build()
                .toXml();
    }

    private Say.Language getSayLanguage(String lang) {
        if ("ta".equalsIgnoreCase(lang)) {
            return Say.Language.TA_IN;
        } else if ("hi".equalsIgnoreCase(lang)) {
            return Say.Language.HI_IN;
        } else {
            return Say.Language.EN_IN;
        }
    }

    private String cleanMobile(String mobile) {
        if (mobile == null) return "9876543210";
        String cleaned = mobile.replaceAll("[^0-9]", "");
        if (cleaned.length() > 10) {
            cleaned = cleaned.substring(cleaned.length() - 10);
        }
        return cleaned.isEmpty() ? "9876543210" : cleaned;
    }
}
