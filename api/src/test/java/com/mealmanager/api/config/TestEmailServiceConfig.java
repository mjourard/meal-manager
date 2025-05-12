package com.mealmanager.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import com.mealmanager.api.services.EmailService;

@Configuration
@Profile("test")
public class TestEmailServiceConfig {

    private static final Logger log = LoggerFactory.getLogger(TestEmailServiceConfig.class);

    @Bean
    @Primary
    public EmailService emailService() {
        return new EmailService() {
            @Override
            public void sendEmail(String recipient, String subject, String content) {
                // Test implementation that doesn't actually send emails
                log.info("Test email service: Would send email to: {}, subject: {}", recipient, subject);
            }
            
            @Override
            public void sendEmail(String[] recipients, String subject, String content) {
                // Test implementation
                log.info("Test email service: Would send email to multiple recipients, subject: {}", subject);
            }
        };
    }
} 