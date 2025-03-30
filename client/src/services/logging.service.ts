import { useCallback } from 'react';
import { useAuthClient } from './client';
import { AxiosInstance } from 'axios';

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * Interface for log data
 */
export interface LogData {
  level: LogLevel;
  message: string;
  context?: string;
  timestamp?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Options for browser console logging
 */
export interface LoggingOptions {
  consoleEnabled: boolean;
  fileEnabled: boolean;
  minLevel: LogLevel;
  includeCorrelationId: boolean;
}

/**
 * Default options for logging
 */
const defaultOptions: LoggingOptions = {
  consoleEnabled: true,
  fileEnabled: true,
  minLevel: LogLevel.DEBUG,
  includeCorrelationId: true
};

/**
 * Generate a unique correlation ID
 */
const generateCorrelationId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Check if the log should be processed based on log level
 */
const shouldLog = (level: LogLevel, minLevel: LogLevel): boolean => {
  const levels = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3
  };
  
  return levels[level] >= levels[minLevel];
};

/**
 * Get timestamp in ISO format
 */
const getTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Write log to file locally using API
 */
const writeToLocalFile = async (
  authClient: AxiosInstance,
  data: LogData
): Promise<void> => {
  try {
    await authClient.post('/logs', {
      level: data.level,
      message: data.message,
      context: data.context,
      correlationId: data.correlationId,
      metadata: data.metadata
    });
  } catch (error) {
    // In case of failure, at least log to console
    console.error('Failed to write log to file:', error);
  }
};

/**
 * Write log to browser console
 */
const writeToConsole = (data: LogData): void => {
  const timestamp = data.timestamp || getTimestamp();
  const context = data.context ? `[${data.context}]` : '';
  const correlationId = data.correlationId ? `[${data.correlationId}]` : '';
  const message = `${timestamp} [${data.level}] ${context} ${correlationId} ${data.message}`;
  
  switch (data.level) {
    case LogLevel.DEBUG:
      console.debug(message, data.metadata || '');
      break;
    case LogLevel.INFO:
      console.info(message, data.metadata || '');
      break;
    case LogLevel.WARN:
      console.warn(message, data.metadata || '');
      break;
    case LogLevel.ERROR:
      console.error(message, data.metadata || '');
      break;
    default:
      console.log(message, data.metadata || '');
  }
};

/**
 * Hook for logging service
 */
export const useLoggingService = (customOptions?: Partial<LoggingOptions>) => {
  const authClient = useAuthClient();
  const options = { ...defaultOptions, ...customOptions };
  const correlationId = useCallback(generateCorrelationId, [])();
  
  /**
   * Log a message with the specified level
   */
  const log = useCallback(async (
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> => {
    if (!shouldLog(level, options.minLevel)) {
      return;
    }
    
    const timestamp = getTimestamp();
    const logData: LogData = {
      level,
      message,
      context,
      timestamp,
      correlationId: options.includeCorrelationId ? correlationId : undefined,
      metadata
    };
    
    if (options.consoleEnabled) {
      writeToConsole(logData);
    }
    
    if (options.fileEnabled) {
      await writeToLocalFile(authClient, logData);
    }
  }, [authClient, options, correlationId]);
  
  /**
   * Log a debug message
   */
  const debug = useCallback((message: string, context?: string): Promise<void> => {
    return log(LogLevel.DEBUG, message, context);
  }, [log]);
  
  /**
   * Log an info message
   */
  const info = useCallback((message: string, context?: string): Promise<void> => {
    return log(LogLevel.INFO, message, context);
  }, [log]);
  
  /**
   * Log a warning message
   */
  const warn = useCallback((message: string, context?: string): Promise<void> => {
    return log(LogLevel.WARN, message, context);
  }, [log]);
  
  /**
   * Log an error message
   */
  const error = useCallback((message: string, error?: unknown, context?: string): Promise<void> => {
    let fullMessage = message;
    
    if (error) {
      // Include error details if available
      if (error instanceof Error) {
        fullMessage += ` Error: ${error.message}`;
        if (error.stack) {
          fullMessage += `\nStack: ${error.stack}`;
        }
      } else if (typeof error === 'string') {
        fullMessage += ` Error: ${error}`;
      } else {
        try {
          fullMessage += ` Error: ${JSON.stringify(error)}`;
        } catch {
          fullMessage += ` Error: ${String(error)}`;
        }
      }
    }
    
    return log(LogLevel.ERROR, fullMessage, context);
  }, [log]);
  
  return {
    debug,
    info,
    warn,
    error,
    log
  };
};

/**
 * Global logger instance for non-React code
 */
class Logger {
  private static instance: Logger;
  private options: LoggingOptions = defaultOptions;
  
  private constructor() {
    // Private constructor to enforce singleton
  }
  
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  public setOptions(options: Partial<LoggingOptions>): void {
    this.options = { ...this.options, ...options };
  }
  
  public async log(level: LogLevel, message: string, context?: string): Promise<void> {
    if (!shouldLog(level, this.options.minLevel)) {
      return;
    }
    
    const timestamp = getTimestamp();
    const logData: LogData = {
      level,
      message,
      context,
      timestamp
    };
    
    if (this.options.consoleEnabled) {
      writeToConsole(logData);
    }
    
    if (this.options.fileEnabled) {
      try {
        const response = await fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            level: logData.level,
            message: logData.message,
            context: logData.context
          })
        });
        
        if (!response.ok) {
          console.error('Failed to write log to file:', response.statusText);
        }
      } catch (error) {
        console.error('Failed to write log to file:', error);
      }
    }
  }
  
  public debug(message: string, context?: string): Promise<void> {
    return this.log(LogLevel.DEBUG, message, context);
  }
  
  public info(message: string, context?: string): Promise<void> {
    return this.log(LogLevel.INFO, message, context);
  }
  
  public warn(message: string, context?: string): Promise<void> {
    return this.log(LogLevel.WARN, message, context);
  }
  
  public error(message: string, error?: unknown, context?: string): Promise<void> {
    let fullMessage = message;
    
    if (error) {
      if (error instanceof Error) {
        fullMessage += ` Error: ${error.message}`;
        if (error.stack) {
          fullMessage += `\nStack: ${error.stack}`;
        }
      } else if (typeof error === 'string') {
        fullMessage += ` Error: ${error}`;
      } else {
        try {
          fullMessage += ` Error: ${JSON.stringify(error)}`;
        } catch {
          fullMessage += ` Error: ${String(error)}`;
        }
      }
    }
    
    return this.log(LogLevel.ERROR, fullMessage, context);
  }
}

// Export a global logger instance for use in non-React code
export const logger = Logger.getInstance(); 