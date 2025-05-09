package com.mealmanager.api.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;

@Service
public class EmailService {
    @Value("${from.email.address}")
    private String fromEmailAddress;

    @Autowired
    private JavaMailSender mailSender;

    private final Logger logger = LoggerFactory.getLogger(EmailService.class);


    public void sendEmail(String recipient, String subject, String content) throws UnsupportedEncodingException, MessagingException {
        String[] arr = new String[]{recipient};
        sendEmail(arr, subject, content);
    }

    @Async
    public void sendEmail(String[] recipient, String subject, String content) throws UnsupportedEncodingException, MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmailAddress, "No Reply (Meal Manager)");
        helper.setTo(recipient);
        helper.setSubject(subject);
        helper.setText(content, true);
        mailSender.send(message);
    }
}
