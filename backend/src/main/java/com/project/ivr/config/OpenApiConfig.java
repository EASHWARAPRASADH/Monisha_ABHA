package com.project.ivr.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("IVR-Based Token Booking System Integrated with ABHA for Government Hospitals")
                        .description("Academic Prototype REST API documentation for automated OPD token booking, " +
                                "ABHA verification (mock), Twilio Voice IVR webhooks, queue management, and SMS delivery. " +
                                "\n\n**NOTE**: This is an academic research prototype. All ABDM/ABHA, HMIS, and SMS integrations are simulated.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Healthcare Systems Engineering Team")
                                .email("project.ivr@health.gov.in"))
                        .license(new License().name("Apache 2.0").url("https://springdoc.org")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter JWT Bearer token obtained from /api/auth/login")));
    }
}
