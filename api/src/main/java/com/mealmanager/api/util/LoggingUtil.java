package com.mealmanager.api.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Utility class for handling file-based logging in addition to standard SLF4J logging.
 * This is primarily for development and debugging purposes.
 */
@Component
public class LoggingUtil {
    private static final Logger log = LoggerFactory.getLogger(LoggingUtil.class);
    private static final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss.SSS");
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    private final String logDirectory;
    private final boolean fileLoggingEnabled;
    private final boolean includeMetadata;
    private final boolean includeCorrelationId;
    
    public LoggingUtil(
            @Value("${app.logging.directory:../logs/api}") String logDirectory,
            @Value("${app.logging.file.enabled:false}") boolean fileLoggingEnabled,
            @Value("${app.logging.include-metadata:true}") boolean includeMetadata,
            @Value("${app.logging.include-correlation-id:true}") boolean includeCorrelationId) {
        this.logDirectory = logDirectory;
        this.fileLoggingEnabled = fileLoggingEnabled;
        this.includeMetadata = includeMetadata;
        this.includeCorrelationId = includeCorrelationId;
        
        if (fileLoggingEnabled) {
            // Create log directory if it doesn't exist
            File directory = new File(logDirectory);
            if (!directory.exists()) {
                boolean created = directory.mkdirs();
                if (!created) {
                    log.warn("Failed to create log directory: {}", logDirectory);
                }
            }
            
            log.info("File logging enabled. Log directory: {}", logDirectory);
            log.info("Include metadata: {}", includeMetadata);
            log.info("Include correlation IDs: {}", includeCorrelationId);
        } else {
            log.info("File logging disabled");
        }
    }
    
    /**
     * Logs a debug message to both SLF4J and a file if file logging is enabled.
     *
     * @param source The source of the log (class or component name)
     * @param message The message to log
     */
    public void debug(String source, String message) {
        log.debug("[{}] {}", source, message);
        if (fileLoggingEnabled) {
            writeToFile("DEBUG", source, message, null, null);
        }
    }
    
    /**
     * Logs a debug message with correlation ID to both SLF4J and a file.
     *
     * @param source The source of the log (class or component name)
     * @param message The message to log
     * @param correlationId The correlation ID for tracking related logs
     */
    public void debug(String source, String message, String correlationId) {
        log.debug("[{}] [{}] {}", correlationId, source, message);
        if (fileLoggingEnabled) {
            writeToFile("DEBUG", source, message, correlationId, null);
        }
    }
    
    /**
     * Logs an info message to both SLF4J and a file if file logging is enabled.
     *
     * @param source The source of the log (class or component name)
     * @param message The message to log
     */
    public void info(String source, String message) {
        log.info("[{}] {}", source, message);
        if (fileLoggingEnabled) {
            writeToFile("INFO", source, message, null, null);
        }
    }
    
    /**
     * Logs an info message with correlation ID to both SLF4J and a file.
     *
     * @param source The source of the log (class or component name)
     * @param message The message to log
     * @param correlationId The correlation ID for tracking related logs
     */
    public void info(String source, String message, String correlationId) {
        log.info("[{}] [{}] {}", correlationId, source, message);
        if (fileLoggingEnabled) {
            writeToFile("INFO", source, message, correlationId, null);
        }
    }
    
    /**
     * Logs a warning message to both SLF4J and a file if file logging is enabled.
     *
     * @param source The source of the log (class or component name)
     * @param message The message to log
     */
    public void warn(String source, String message) {
        log.warn("[{}] {}", source, message);
        if (fileLoggingEnabled) {
            writeToFile("WARN", source, message, null, null);
        }
    }
    
    /**
     * Logs a warning message with correlation ID to both SLF4J and a file.
     *
     * @param source The source of the log (class or component name)
     * @param message The message to log
     * @param correlationId The correlation ID for tracking related logs
     */
    public void warn(String source, String message, String correlationId) {
        log.warn("[{}] [{}] {}", correlationId, source, message);
        if (fileLoggingEnabled) {
            writeToFile("WARN", source, message, correlationId, null);
        }
    }
    
    /**
     * Logs an error message to both SLF4J and a file if file logging is enabled.
     *
     * @param source The source of the log (class or component name)
     * @param message The message to log
     */
    public void error(String source, String message) {
        log.error("[{}] {}", source, message);
        if (fileLoggingEnabled) {
            writeToFile("ERROR", source, message, null, null);
        }
    }
    
    /**
     * Logs an error message with correlation ID to both SLF4J and a file.
     *
     * @param source The source of the log (class or component name)
     * @param message The message to log
     * @param correlationId The correlation ID for tracking related logs
     */
    public void error(String source, String message, String correlationId) {
        log.error("[{}] [{}] {}", correlationId, source, message);
        if (fileLoggingEnabled) {
            writeToFile("ERROR", source, message, correlationId, null);
        }
    }
    
    /**
     * Logs an error message with exception details to both SLF4J and a file if file logging is enabled.
     *
     * @param source The source of the log (class or component name)
     * @param message The message to log
     * @param throwable The exception to log
     */
    public void error(String source, String message, Throwable throwable) {
        log.error("[{}] {}", source, message, throwable);
        if (fileLoggingEnabled) {
            writeToFile("ERROR", source, message + " - " + throwable.toString(), null, null);
        }
    }
    
    /**
     * Logs an error message with exception details and correlation ID to both SLF4J and a file.
     *
     * @param source The source of the log (class or component name)
     * @param message The message to log
     * @param throwable The exception to log
     * @param correlationId The correlation ID for tracking related logs
     */
    public void error(String source, String message, Throwable throwable, String correlationId) {
        log.error("[{}] [{}] {}", correlationId, source, message, throwable);
        if (fileLoggingEnabled) {
            writeToFile("ERROR", source, message + " - " + throwable.toString(), correlationId, null);
        }
    }
    
    /**
     * Logs a message received from the client to a file.
     *
     * @param clientId Identifier for the client (e.g., user ID, IP, or session ID)
     * @param level Log level
     * @param message The message to log
     */
    public void logClientMessage(String clientId, String level, String message) {
        log.info("Client log [{}] [{}]: {}", clientId, level, message);
        if (fileLoggingEnabled) {
            try {
                LocalDateTime now = LocalDateTime.now();
                String dateStr = now.format(dateFormatter);
                String timeStr = now.format(timeFormatter);
                
                String filename = String.format("%s/client_%s.log", logDirectory, dateStr);
                
                try (FileWriter fw = new FileWriter(filename, true);
                     PrintWriter pw = new PrintWriter(fw)) {
                    pw.println(String.format("[%s] [%s] [%s] %s", 
                            timeStr, level, clientId, message));
                }
            } catch (IOException e) {
                log.error("Failed to write client log to file", e);
            }
        }
    }
    
    /**
     * Logs a message received from the client to a file with enhanced details.
     *
     * @param clientId Identifier for the client (e.g., user ID, IP, or session ID)
     * @param level Log level
     * @param message The message to log
     * @param context The context (component/module) that generated the log
     * @param correlationId The correlation ID for tracking related logs
     * @param metadata Additional metadata to include in the log
     */
    public void logClientMessage(String clientId, String level, String message, 
                                 String context, String correlationId, Map<String, Object> metadata) {
        boolean useCorrelationId = includeCorrelationId && 
                correlationId != null && !correlationId.equals("null") && !correlationId.isEmpty();
                
        if (useCorrelationId) {
            log.info("Client log [{}] [{}] [{}] [{}]: {}", 
                    correlationId, clientId, level, context, message);
        } else {
            log.info("Client log [{}] [{}] [{}]: {}", 
                    clientId, level, context, message);
        }
        
        if (fileLoggingEnabled) {
            try {
                LocalDateTime now = LocalDateTime.now();
                String dateStr = now.format(dateFormatter);
                String timeStr = now.format(timeFormatter);
                
                String filename = String.format("%s/client_%s.log", logDirectory, dateStr);
                
                try (FileWriter fw = new FileWriter(filename, true);
                     PrintWriter pw = new PrintWriter(fw)) {
                    
                    String logLine;
                    String contextInfo = context != null && !context.equals("null") && !context.isEmpty() ? 
                            String.format("[%s]", context) : "";
                    
                    String correlationInfo = useCorrelationId ? 
                            String.format("[%s]", correlationId) : "";
                    
                    String metadataInfo = "";
                    if (includeMetadata && metadata != null && !metadata.isEmpty()) {
                        try {
                            metadataInfo = " - " + objectMapper.writeValueAsString(metadata);
                        } catch (Exception e) {
                            log.warn("Failed to serialize metadata for logging", e);
                        }
                    }
                    
                    logLine = String.format("[%s] [%s] [%s] %s %s %s%s", 
                            timeStr, level, clientId, contextInfo, correlationInfo, message, metadataInfo);
                    
                    pw.println(logLine);
                }
            } catch (IOException e) {
                log.error("Failed to write client log to file", e);
            }
        }
    }
    
    private void writeToFile(String level, String source, String message, String correlationId, Map<String, Object> metadata) {
        try {
            LocalDateTime now = LocalDateTime.now();
            String dateStr = now.format(dateFormatter);
            String timeStr = now.format(timeFormatter);
            
            String filename = String.format("%s/api_%s.log", logDirectory, dateStr);
            
            try (FileWriter fw = new FileWriter(filename, true);
                 PrintWriter pw = new PrintWriter(fw)) {
                
                String correlationInfo = includeCorrelationId && correlationId != null && !correlationId.isEmpty() ? 
                        String.format("[%s]", correlationId) : "";
                
                String metadataInfo = "";
                if (includeMetadata && metadata != null && !metadata.isEmpty()) {
                    try {
                        metadataInfo = " - " + objectMapper.writeValueAsString(metadata);
                    } catch (Exception e) {
                        log.warn("Failed to serialize metadata for logging", e);
                    }
                }
                
                pw.println(String.format("[%s] [%s] [%s] %s %s%s", 
                        timeStr, level, source, correlationInfo, message, metadataInfo));
            }
        } catch (IOException e) {
            log.error("Failed to write log to file", e);
        }
    }
} 