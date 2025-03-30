# Environment Configuration

This application uses Spring profiles to configure different environments. The following profiles are available:

## Profiles

- **dev**: Development environment (default)
  - Enables debug logging
  - Enables detailed JWT token debugging
  - Sets database to update mode

- **prod**: Production environment
  - Disables all debug features
  - Minimal logging
  - Sets database to validate mode (safer for production)

## How to Use

### Running Locally

To run the application with a specific profile:

```bash
# Using Maven
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Using Java
java -jar app.jar --spring.profiles.active=prod
```

### Environment Variables

You can also set these environment variables to control the application behavior:

- `APP_ENVIRONMENT`: Set to `dev` or `prod` (defaults to `dev`)
- `APP_DEBUG_ENABLED`: Set to `true` or `false` (defaults to `false`)

For example:

```bash
export APP_ENVIRONMENT=prod
export APP_DEBUG_ENABLED=false
./mvnw spring-boot:run
```

### Security Considerations

- Never enable debug mode in production environments
- JWT debug logging will output sensitive information about tokens that should not be exposed in production
- Always use the `prod` profile in production environments

## JWT Authentication

When using Clerk authentication, the application expects:

1. A Bearer token in the Authorization header
2. The token must be a valid JWT signed by Clerk
3. The token must have a valid key ID that can be validated against Clerk's JWKS endpoint
4. The token must have the expected issuer

The application will validate these tokens using Clerk's JWKS endpoint configured in `application.properties`. 