package com.mealmanager.api.messagequeue;

import com.mealmanager.api.dto.EmailTemplateData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

public class Sender {

    private final Logger logger = LoggerFactory.getLogger(Sender.class);

    @Autowired
    private RabbitTemplate template;

    @Autowired
    @Qualifier("emailQueue")
    private Queue queue;

    public void send(EmailTemplateData data) {
        this.template.convertAndSend(queue.getName(), data);
    }
}
