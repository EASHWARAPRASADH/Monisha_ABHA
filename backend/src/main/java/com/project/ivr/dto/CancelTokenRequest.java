package com.project.ivr.dto;

import com.project.ivr.entity.RequestChannel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancelTokenRequest {
    private String reason;
    private String callerMobile;
    @Builder.Default
    private RequestChannel channel = RequestChannel.WEB;
}
