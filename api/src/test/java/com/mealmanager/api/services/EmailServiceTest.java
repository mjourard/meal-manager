package com.mealmanager.api.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.util.ReflectionTestUtils;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.mealmanager.api.BaseTestContainersTest;
import com.mealmanager.api.config.TestEmailConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Unit tests for the EmailService class.
 * Uses mocked JavaMailSender to verify email sending behavior without actually sending emails.
 * These tests focus on the behavior of the EmailService rather than the actual email delivery.
 * 
 * This test inherits DisableRabbitListenersInitializer from BaseTestContainersTest,
 * which prevents RabbitMQ listeners from starting and causing authentication errors.
 */
@SpringBootTest
@ContextConfiguration(classes = {TestEmailConfig.class})
class EmailServiceTest extends BaseTestContainersTest {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceTest.class);

    @MockBean
    private JavaMailSender mailSender;

    @Autowired
    private EmailService emailService;

    private MimeMessage mimeMessage;

    @BeforeEach
    void setUp() {
        // Set up mock MimeMessage
        mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        
        // Set the fromEmailAddress using ReflectionTestUtils since it's set by @Value
        ReflectionTestUtils.setField(emailService, "fromEmailAddress", "test@example.com");
    }

    @Test
    void testSendEmail_SingleRecipient() throws MessagingException, UnsupportedEncodingException {
        // Arrange
        String recipient = "recipient@example.com";
        String subject = "Test Subject";
        String content = "<p>Test Content</p>";

        // Act
        emailService.sendEmail(recipient, subject, content);

        // Assert
        // Verify that createMimeMessage was called
        verify(mailSender, times(1)).createMimeMessage();
        
        // Verify that send was called once on the mailSender
        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, times(1)).send(messageCaptor.capture());
    }

    @Test
    void testSendEmail_MultipleRecipients() throws MessagingException, UnsupportedEncodingException {
        // Arrange
        String[] recipients = new String[]{"recipient1@example.com", "recipient2@example.com"};
        String subject = "Test Subject for Multiple Recipients";
        String content = "<p>Test Content for Multiple Recipients</p>";

        // Act
        emailService.sendEmail(recipients, subject, content);

        // Assert
        // Verify that createMimeMessage was called
        verify(mailSender, times(1)).createMimeMessage();
        
        // Verify that send was called once on the mailSender
        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, times(1)).send(messageCaptor.capture());
    }
    
    @Test
    void testSendEmail_ExceptionHandling() {
        // Arrange
        String recipient = "recipient@example.com";
        String subject = "Test Exception";
        String content = "Test content";
        
        // Configure mock to throw an exception
        doThrow(new RuntimeException("Simulated mail sending failure"))
            .when(mailSender).send(any(MimeMessage.class));

        // Act and Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            emailService.sendEmail(recipient, subject, content);
        });
        
        assertEquals("Simulated mail sending failure", exception.getMessage());
        
        // Verify that createMimeMessage was called
        verify(mailSender, times(1)).createMimeMessage();
    }
}

