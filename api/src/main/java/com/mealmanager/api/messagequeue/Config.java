package com.mealmanager.api.messagequeue;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Profile({"api", "receiver"})
@Configuration
public class Config {

    @Bean
    public Queue email() {
        return new Queue("email");
    }

    @Bean
    @Profile("receiver")
    public Receiver receiver() {
        return new Receiver();
    }

    @Bean
    @Profile("api")
    public Sender sender() {
        return new Sender();
    }
}
