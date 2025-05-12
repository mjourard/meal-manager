# Meal Manager API

This is an API written using Java's Spring Boot to power the Meal Manager web app. 

## Development Setup

### Java Version

You'll need the correct java version. 
This is managed locally using sdkman. 

The commands for setting the java version are as follows:
```
sdk list java
sdk use java 11.0.19-amzn
sdk default java java 11.0.19-amzn
java -version
```

### Environment Variables

These are managed locally by the env-file-maven-plugin, as long as you specify the appropriate file on startup. 
For local development, that would be `-Pdev`

## Running the Application

### Development Mode

Development mode enables debug features and verbose logging, which is useful for local development and troubleshooting:

```bash
# Using Maven with profile flag
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev -Pdev

# Using environment variables
export APP_ENVIRONMENT=dev
export APP_DEBUG_ENABLED=true
./mvnw spring-boot:run -Pdev
```

In development mode:
- JWT token debugging is enabled (useful for authentication troubleshooting)
- Database schema is set to update mode
- Detailed logging is activated

### Production Mode

Production mode disables all debugging features for secure deployment:

```bash
# Using Maven with profile flag
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod

# Using environment variables (recommended for deployment)
export APP_ENVIRONMENT=prod
export APP_DEBUG_ENABLED=false
./mvnw spring-boot:run
```

In production mode:
- JWT token debugging is disabled for security
- Database schema is set to validate mode (safer)
- Minimal logging is configured

### Environment Variables for Deployment

When deploying to production, use these environment variables:

```bash
# Core application settings
export APP_ENVIRONMENT=prod
export APP_DEBUG_ENABLED=false

# Database connection
export DB_HOST=your-db-host
export DB_PORT=your-db-port

# CORS settings
export CORS_ALLOWED_ORIGIN=https://your-frontend-domain.com

# Clerk authentication
# Make sure these match your Clerk instance settings
export CLERK_JWKS_URI=https://your-clerk-instance.clerk.accounts.dev/.well-known/jwks.json
export CLERK_ISSUER=https://your-clerk-instance.clerk.accounts.dev
```

## Running Automated Tests

The application includes automated tests that can be run using Maven. These tests include unit tests and integration tests using JUnit 5, Spring Boot Test, and TestContainers.

### Running All Tests

To run all tests in the project:

```bash
# Run all tests with the default configuration
./mvnw test

# Run tests with a specific profile (e.g., dev)
./mvnw test -Pdev
```

### Running Specific Test Classes

To run a specific test class:

```bash
./mvnw test -Dtest=TestClassName
```

For example:

```bash
./mvnw test -Dtest=UserServiceTest
```

### Running Tests with Coverage Reports

To generate test coverage reports:

```bash
./mvnw test jacoco:report
```

The coverage report will be generated in the `target/site/jacoco` directory.

### Test Environment

Tests use TestContainers to run a real PostgreSQL database in a Docker container during testing. This ensures that:

1. Tests run against the same database type as production
2. SQL syntax compatibility issues are avoided (such as comment handling differences)
3. Flyway migrations are tested exactly as they would run in production

The TestContainers configuration:
- Automatically starts a PostgreSQL container when tests run
- Configures Spring Boot to connect to the container
- Runs Flyway migrations against the test database
- Cleans up resources after tests complete

#### Requirements for TestContainers

To run tests with TestContainers, you need:
- Docker installed and running on your machine
- Docker daemon accessible to your user account
- Sufficient resources allocated to Docker (at least 2GB of memory recommended)

#### Test Configuration

Test-specific configuration is defined in `application-test.properties` and loaded using the `@ActiveProfiles("test")` annotation. Common test setup is available in the `BaseTestContainersTest` class, which all database tests should extend.

#### Database Authentication

The TestContainers PostgreSQL instance is configured with the following default credentials:
- Username: `postgres`
- Password: `postgres`
- Database: `testdb`

These credentials are automatically provided to Spring Boot by the TestContainersConfig class, so you don't need to specify them in your application properties.

#### Debugging TestContainers Setup

If you're having issues with TestContainers, you can run the debug test class:

```bash
./mvnw test -Dtest=TestContainersDebugTest
```

This test will:
1. Verify that the PostgreSQL container is running
2. Check the database connection
3. Execute a test query
4. Log detailed information about the container and database

You can also increase logging verbosity by adding these parameters:

```bash
./mvnw test -Dtest=TestContainersDebugTest -Dlogging.level.org.testcontainers=DEBUG -Dlogging.level.com.github.dockerjava=DEBUG
```

To check if Docker is properly configured for TestContainers:

```bash
# Verify Docker is running
docker ps

# Check Docker permissions
docker info

# Ensure your user has Docker permissions
groups | grep docker
```

### Common Test Issues and Solutions

#### Docker Not Running

If tests fail with errors related to connecting to Docker, ensure that:
- Docker is installed and running
- Your user has permissions to access the Docker daemon
- You can run `docker ps` without sudo

#### Authentication Failures

If you see authentication errors like:
```
Unable to obtain connection from database: FATAL: password authentication failed for user "test"
```

This typically means there's a mismatch between the credentials TestContainers is using and what your application is trying to use. Make sure you're extending the `BaseTestContainersTest` class in your test classes and that you're not overriding the database connection properties.

#### Container Not Starting

If the TestContainers PostgreSQL container isn't starting:

1. Check Docker logs:
   ```bash
   docker ps -a
   docker logs <container-id>
   ```

2. Verify Docker has sufficient resources:
   ```bash
   docker system info
   ```

3. Try restarting Docker:
   ```bash
   sudo systemctl restart docker
   ```

#### Out of Memory Errors

If tests fail with out of memory errors:
- Increase memory allocation to Docker
- Reduce parallel test execution by using `-Dsurefire.parallel=none`

## Authentication

This application uses Clerk for authentication. JWT tokens from Clerk are validated using:

1. Signature verification using Clerk's JWKS endpoint
2. Issuer validation to ensure the token comes from your Clerk instance
3. Subject extraction to identify the user

For more details about the authentication configuration, see the `README.md` in `src/main/resources/`. 