package com.mealmanager.api.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.ContextConfiguration;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.utility.DockerImageName;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * TestConfiguration for setting up the PostgreSQL TestContainer.
 * This class creates and configures a PostgreSQLContainer for use in tests.
 */
@TestConfiguration
public class TestContainersConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(TestContainersConfig.class);
    private static final String POSTGRES_IMAGE = "postgres:13";
    private static final String DATABASE_NAME = "testdb";
    private static final String USERNAME = "testuser";
    private static final String PASSWORD = "testpassword";
    
    /**
     * Creates a PostgreSQLContainer bean for tests.
     * The container is started when the bean is created and exposed for autowiring in tests.
     * 
     * @return the configured PostgreSQLContainer
     */
    @Bean
    public PostgreSQLContainer<?> postgresContainer() {
        PostgreSQLContainer<?> container = new PostgreSQLContainer<>(
                DockerImageName.parse(POSTGRES_IMAGE)
        )
        .withDatabaseName(DATABASE_NAME)
        .withUsername(USERNAME)
        .withPassword(PASSWORD);
        
        // Start the container
        container.start();
        
        // Log container information
        logger.info("Started PostgreSQL TestContainer");
        logger.info("JDBC URL: {}", container.getJdbcUrl());
        logger.info("Username: {}", container.getUsername());
        logger.info("Password: {}", container.getPassword());
        
        // Set system properties to override the application properties
        System.setProperty("spring.datasource.url", container.getJdbcUrl());
        System.setProperty("spring.datasource.username", container.getUsername());
        System.setProperty("spring.datasource.password", container.getPassword());
        
        return container;
    }
    
    /**
     * ApplicationContextInitializer to set the database connection properties
     * from the PostgreSQLContainer.
     */
    public static class Initializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
        
        @Override
        public void initialize(ConfigurableApplicationContext applicationContext) {
            PostgreSQLContainer<?> postgresContainer = new PostgreSQLContainer<>(POSTGRES_IMAGE)
                .withDatabaseName(DATABASE_NAME)
                .withUsername(USERNAME)
                .withPassword(PASSWORD);
            
            postgresContainer.start();
            
            TestPropertyValues.of(
                "spring.datasource.url=" + postgresContainer.getJdbcUrl(),
                "spring.datasource.username=" + postgresContainer.getUsername(),
                "spring.datasource.password=" + postgresContainer.getPassword()
            ).applyTo(applicationContext.getEnvironment());
        }
    }
} 