package com.mealmanager.api.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.test.context.TestPropertySource;

import javax.mail.internet.MimeMessage;
import java.util.Properties;

/**
 * Test configuration for email services unit tests.
 * Provides mock email components to avoid sending real emails during unit tests.
 * This configuration is only used by unit tests, not by integration tests.
 */
@TestConfiguration
@TestPropertySource(properties = {
    "from.email.address=test@example.com"
})
public class TestEmailConfig {

    /**
     * Creates a JavaMailSenderImpl bean configured for unit testing.
     * This mail sender is configured to not connect to any real server.
     *
     * @return A JavaMailSenderImpl configured for testing
     */
    @Bean
    @Primary
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        // Configure with dummy values - these won't be used in unit tests
        // as the actual JavaMailSender will be mocked
        mailSender.setHost("localhost");
        mailSender.setPort(25);
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "false");
        props.put("mail.smtp.starttls.enable", "false");
        props.put("mail.debug", "true");
        
        return mailSender;
    }
} 