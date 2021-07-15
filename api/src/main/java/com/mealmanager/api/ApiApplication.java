package com.mealmanager.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class ApiApplication {

    private final Logger logger = LoggerFactory.getLogger(ApiApplication.class);

    @Value("${cors.allowed.origin}")
    private String corsAllowedOrigin;

    public static void main(String[] args) {
        SpringApplication.run(ApiApplication.class, args
        );
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                logger.info("Allowing the following origin on /api/**: " + corsAllowedOrigin);
                registry.addMapping("/api/**").allowedOrigins(corsAllowedOrigin);
            }
        };
    }
}
