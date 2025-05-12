package com.mealmanager.api.services;

import com.mealmanager.api.BaseEmailTestContainersTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import javax.mail.MessagingException;
import java.io.UnsupportedEncodingException;

/**
 * Integration tests for EmailService using the real email configuration.
 * These tests will only run if the EMAIL_INTEGRATION_TESTS environment variable is set to "true".
 * This prevents sending real emails during regular test runs.
 * 
 * This test class uses BaseEmailTestContainersTest, which does NOT disable RabbitMQ listeners,
 * allowing the test to interact with the real email service.
 */
@SpringBootTest
@ActiveProfiles("test")
@EnabledIfEnvironmentVariable(named = "EMAIL_INTEGRATION_TESTS", matches = "true")
class EmailServiceIntegrationTest extends BaseEmailTestContainersTest {

    @Autowired
    private EmailService emailService;

    /**
     * Tests sending an email to a single recipient.
     * This test will send an actual email using the configured email service.
     */
    @Test
    void testSendEmail_SingleRecipient() throws MessagingException, UnsupportedEncodingException {
        // Arrange
        String recipient = "test-recipient@example.com"; // Use a test email address
        String subject = "Test Email from EmailServiceIntegrationTest";
        String content = "<p>This is a test email from the EmailServiceIntegrationTest</p>";

        // Act - This will send a real email
        emailService.sendEmail(recipient, subject, content);
        
        // No assertions needed - if the email service throws an exception, the test will fail
    }

    /**
     * Tests sending an email to multiple recipients.
     * This test will send an actual email using the configured email service.
     */
    @Test
    void testSendEmail_MultipleRecipients() throws MessagingException, UnsupportedEncodingException {
        // Arrange
        String[] recipients = new String[]{"test-recipient1@example.com", "test-recipient2@example.com"};
        String subject = "Test Email for Multiple Recipients";
        String content = "<p>This is a test email for multiple recipients</p>";

        // Act - This will send a real email
        emailService.sendEmail(recipients, subject, content);
        
        // No assertions needed - if the email service throws an exception, the test will fail
    }
    
    /**
     * Tests sending an email with HTML content.
     * This test will send an actual email using the configured email service.
     */
    @Test
    void testSendEmail_WithHtmlContent() throws MessagingException, UnsupportedEncodingException {
        // Arrange
        String recipient = "test-html-recipient@example.com";
        String subject = "HTML Email Test";
        String htmlContent = "<html><body><h1>Hello</h1><p>This is an <b>HTML</b> email test.</p></body></html>";

        // Act - This will send a real email
        emailService.sendEmail(recipient, subject, htmlContent);
        
        // No assertions needed - if the email service throws an exception, the test will fail
    }
} 