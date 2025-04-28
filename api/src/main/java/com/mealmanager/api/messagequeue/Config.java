package com.mealmanager.api.messagequeue;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Config {

    @Bean
    public Queue emailQueue() {
        return new Queue("email");
    }

    @Bean
    public Queue crawlerJobQueue() {
        return new Queue("crawler-job");
    }

    @Bean
    public Sender sender() {
        return new Sender();
    }

    @Bean
    public Receiver receiver() {
        return new Receiver();
    }
}
