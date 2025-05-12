package com.mealmanager.api;

import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ContextConfiguration;
import com.mealmanager.api.config.TestContainersConfig;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Main application test that ensures the Spring context loads correctly.
 */
class ApiApplicationTests extends BaseTestContainersTest {
	private static final Logger logger = LoggerFactory.getLogger(ApiApplicationTests.class);
	
	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void contextLoads() {
		// This test ensures that the Spring application context loads successfully
		// with the TestContainers PostgreSQL database
		logger.info("Running contextLoads test");
		
		// Verify that the PostgreSQL container is running
		assertTrue(postgresContainer.isRunning(), "PostgreSQL container should be running");
		logger.info("PostgreSQL container is running: {}", postgresContainer.isRunning());
		logger.info("PostgreSQL container JDBC URL: {}", postgresContainer.getJdbcUrl());
		
		// Verify that we can connect to the database
		String databaseName = jdbcTemplate.queryForObject("SELECT current_database()", String.class);
		logger.info("Connected to database: {}", databaseName);
		
		// Verify that we can execute a simple query
		Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
		logger.info("Query result: {}", result);
	}
}
