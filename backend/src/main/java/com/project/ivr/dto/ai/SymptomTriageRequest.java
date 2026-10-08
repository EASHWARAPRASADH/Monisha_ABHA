package com.project.ivr.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SymptomTriageRequest {

    @NotBlank(message = "Symptom description or text is required")
    private String symptoms;

    @Builder.Default
    private String language = "en"; // en, ta, hi

    private String patientMobile;

    private String callSid;

    private Long hospitalId;
}
