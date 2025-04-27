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

## Authentication

This application uses Clerk for authentication. JWT tokens from Clerk are validated using:

1. Signature verification using Clerk's JWKS endpoint
2. Issuer validation to ensure the token comes from your Clerk instance
3. Subject extraction to identify the user

For more details about the authentication configuration, see the `README.md` in `src/main/resources/`. 