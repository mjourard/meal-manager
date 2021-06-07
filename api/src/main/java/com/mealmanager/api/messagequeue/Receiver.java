package com.mealmanager.api.messagequeue;

import com.mealmanager.api.dto.EmailTemplateData;
import com.mealmanager.api.services.EmailService;
import com.mealmanager.api.services.TemplateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;

import javax.mail.MessagingException;
import java.io.UnsupportedEncodingException;
import java.util.List;

@RabbitListener(queues = "email")
public class Receiver {

    private final Logger logger = LoggerFactory.getLogger(Receiver.class);

    @Autowired
    private EmailService emailService;

    @Autowired
    private TemplateService templateService;

    @RabbitHandler
    public void receive(EmailTemplateData data) {
        if (data.getToAddresses().isEmpty()) {
            logger.error("No TO: addresses specified");
            throw new UnsupportedOperationException("No target email addresses specified");
        }
        SpringTemplateEngine engine = templateService.thymeleafTemplateEngine(templateService.thymeleafTemplateResolver());
        final Context ctx = new Context();
        for(String dataKey : data.getDataMap().keySet()) {
            logger.debug(dataKey, data.getDataMap().get(dataKey));
            ctx.setVariable(dataKey, data.getDataMap().get(dataKey));
        }
        String htmlContent = engine.process(data.getTemplateName(), ctx);

        try {
            emailService.sendEmail((String[]) data.getToAddresses().toArray(new String[0]), data.getSubject(), htmlContent);
            logger.info("Email sent.");
        } catch (UnsupportedEncodingException e) {
            logger.error("Unable to send email", e);
        } catch (MessagingException e) {
            e.printStackTrace();
            logger.error("Unable to send email", e);
        }

    }

}