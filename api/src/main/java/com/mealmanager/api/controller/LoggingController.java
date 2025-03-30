package com.mealmanager.api.controller;

import com.mealmanager.api.util.LoggingUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * Controller to handle client-side logging requests.
 * This allows the client to send logs to the server for consolidated logging.
 */
@RestController
@RequestMapping("/api/logs")
public class LoggingController {

    private final LoggingUtil loggingUtil;

    @Autowired
    public LoggingController(LoggingUtil loggingUtil) {
        this.loggingUtil = loggingUtil;
    }

    /**
     * Endpoint to receive log messages from the client.
     *
     * @param logData Map containing log details: level, message, context (optional), correlationId (optional), metadata (optional)
     * @param request The HTTP request
     * @return 200 OK response
     */
    @PostMapping
    public ResponseEntity<Void> logClientMessage(
            @RequestBody Map<String, Object> logData,
            HttpServletRequest request) {
        
        String clientId = request.getRemoteAddr();
        String level = String.valueOf(logData.getOrDefault("level", "INFO")).toUpperCase();
        String message = String.valueOf(logData.getOrDefault("message", ""));
        String context = String.valueOf(logData.getOrDefault("context", ""));
        String correlationId = String.valueOf(logData.getOrDefault("correlationId", ""));
        
        @SuppressWarnings("unchecked")
        Map<String, Object> metadata = (Map<String, Object>) logData.getOrDefault("metadata", Map.of());
        
        if (!message.isEmpty()) {
            loggingUtil.logClientMessage(clientId, level, message, context, correlationId, metadata);
        }
        
        return ResponseEntity.ok().build();
    }
} 