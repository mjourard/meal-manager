# Debugging Meal Manager

This document provides information on how to debug common issues in the Meal Manager application.

## Logging System

Meal Manager includes a comprehensive logging system that captures both API and client-side events. These logs can be instrumental in diagnosing issues.

### Accessing Logs

Logs are stored in the following directories:

- **API Logs**: `logs/api/api_YYYY-MM-DD.log`
- **Client Logs**: `logs/client/client_YYYY-MM-DD.log`

### Enabling Logging

#### API (Server) Logging

1. In the `application-dev.properties` file, ensure the following properties are set:
   ```properties
   app.logging.file.enabled=true
   app.logging.directory=../logs/api
   ```

2. Run the API with the dev profile:
   ```bash
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
   ```

#### Client (Frontend) Logging

The client logging system is enabled by default in development mode. Logs are sent to both the browser console and the API for centralized logging.

To modify logging behavior in a component:

```typescript
import { useLoggingService, LogLevel } from '../../services/logging.service';

// Inside your component
const logger = useLoggingService({
  fileEnabled: true,       // Enable/disable file logging
  consoleEnabled: true,    // Enable/disable console logging
  minLevel: LogLevel.DEBUG // Set minimum log level
});

// Usage
logger.debug("Detailed information", "ComponentName");
logger.info("Notable events", "ComponentName");
logger.warn("Warning conditions", "ComponentName");
logger.error("Error conditions", "ComponentName");
```

## Common Issues and Debugging Steps

### API Connection Issues

If the client is unable to connect to the API:

1. Check the browser console for error messages
2. Verify API is running (`./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`)
3. Review API logs in `logs/api/`
4. Confirm CORS settings in `application.properties`

### Authentication Problems

For issues with Clerk authentication:

1. Check browser console for JWT-related errors
2. Review API logs for authentication failures
3. Verify Clerk configuration in `application.properties`:
   ```properties
   auth.jwt.jwks-uri=${CLERK_JWKS_URI:...}
   auth.jwt.issuer=${CLERK_ISSUER:...}
   ```
4. Set `app.debug.enabled=true` in `application-dev.properties` for detailed JWT processing logs

### Component Rendering Issues

For problems with React components:

1. Use the React Developer Tools browser extension
2. Check component logs for mounting/unmounting issues
3. Review API requests in the Network tab of browser dev tools
4. Verify data flow by examining logs in the CreateOrder component

### Database Connection Issues

If the application can't connect to the database:

1. Check API logs for database connection errors
2. Verify database configuration in `application.properties`
3. Ensure PostgreSQL is running (`docker compose up -d db`)
4. Review connection logs in the database server

## Using Console Logging for Immediate Debugging

For quick debugging, you can add console logging statements to any component:

```typescript
import { logger } from '../../services/logging.service';

// Log an object
logger.debug(`Current state: ${JSON.stringify(state)}`, "ComponentName");

// Log request/response
logger.info(`API Response: ${response.status}`, "ServiceName");

// Log errors
try {
  // code that might throw
} catch (error) {
  logger.error("Operation failed", error, "ComponentName");
}
```

## Monitoring API Requests

To monitor all API requests:

1. Open Browser Developer Tools (F12)
2. Go to the Network tab
3. Filter by "XHR" or "Fetch" to see AJAX requests
4. Check request/response headers and body
5. Match timestamps with logs for comprehensive debugging

## Need More Help?

If you're still having issues:

1. Enable verbose logging with `logging.level.com.mealmanager.api=TRACE` in `application-dev.properties`
2. Add detailed logging statements to problematic components
3. Check both API and client logs at the same time to correlate issues
4. Use the browser's performance tools to identify potential bottlenecks 