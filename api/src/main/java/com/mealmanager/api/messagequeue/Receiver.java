package com.mealmanager.api.messagequeue;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;

@RabbitListener(queues = "email")
public class Receiver {

    private final Logger logger = LoggerFactory.getLogger(Receiver.class);

    @RabbitHandler
    public void receive(String in) {
        logger.info("[x] Received '" + in + "'");
    }

}