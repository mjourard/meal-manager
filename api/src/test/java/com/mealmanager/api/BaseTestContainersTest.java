package com.mealmanager.api;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ContextConfiguration;
import org.testcontainers.containers.PostgreSQLContainer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import com.mealmanager.api.config.TestContainersConfig;

/**
 * Base class for integration tests that require a PostgreSQL database.
 * Extends this class in your test classes to get access to a shared PostgreSQL container.
 */
@SpringBootTest
@ContextConfiguration(
    classes = {TestContainersConfig.class},
    initializers = {TestContainersConfig.Initializer.class}
)
@AutoConfigureTestDatabase(replace = Replace.NONE) // Use the TestContainers PostgreSQL instead of an embedded database
public abstract class BaseTestContainersTest {
    
    /**
     * The PostgreSQL container that is used for testing.
     * This is automatically wired by Spring from the TestContainersConfig.
     */
    @Autowired
    protected PostgreSQLContainer<?> postgresContainer;
    
    /**
     * Checks if the PostgreSQL container is running.
     * 
     * @return true if the container is running, false otherwise
     */
    protected boolean isContainerRunning() {
        return postgresContainer != null && postgresContainer.isRunning();
    }
} 