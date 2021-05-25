package com.mealmanager.api;

import com.mealmanager.api.messagequeue.MessagingApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

@SpringBootApplication
public class ApiApplication {

    private final Logger logger = LoggerFactory.getLogger(ApiApplication.class);

    @Bean
    public CommandLineRunner tutorial() {
        return new MessagingApplication();
    }

    public static void main(String[] args) {
        SpringApplication.run(ApiApplication.class, args
        );
    }
}
