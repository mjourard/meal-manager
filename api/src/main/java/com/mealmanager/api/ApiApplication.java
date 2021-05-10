package com.mealmanager.api;

import com.mealmanager.api.repository.RecipeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ApiApplication {

    private final Logger logger = LoggerFactory.getLogger(ApiApplication.class);

    @Autowired
    private RecipeRepository repository;


    public static void main(String[] args) {
        SpringApplication.run(ApiApplication.class, args);
    }
}
