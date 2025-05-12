package com.mealmanager.api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import javax.annotation.PostConstruct;
import java.net.URI;

/**
 * Configuration for AWS S3 client and presigner
 */
@Configuration
public class S3Config {
    private final Logger logger = LoggerFactory.getLogger(S3Config.class);

    @Value("${aws.region}")
    private String region;

    @Value("${aws.access-key}")
    private String accessKey;

    @Value("${aws.secret-key}")
    private String secretKey;

    @Value("${aws.endpoint:#{null}}")
    private String endpoint;
    
    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    /**
     * Creates an S3 client bean.
     * Will use either AWS S3 or a custom endpoint (e.g., LocalStack)
     */
    @Bean
    public S3Client s3Client() {
        StaticCredentialsProvider credentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));
        
        // Configure S3 to use path-style access (important for LocalStack compatibility)
        S3Configuration s3Configuration = S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .checksumValidationEnabled(false)
                .build();

        if (endpoint != null && !endpoint.isEmpty()) {
            // Use custom endpoint (e.g., for LocalStack)
            logger.info("Creating S3 client with custom endpoint: {}", endpoint);
            return S3Client.builder()
                    .credentialsProvider(credentialsProvider)
                    .region(Region.of(region))
                    .endpointOverride(URI.create(endpoint))
                    .serviceConfiguration(s3Configuration)
                    .build();
        } else {
            // Use AWS S3
            logger.info("Creating S3 client with AWS endpoint for region: {}", region);
            return S3Client.builder()
                    .credentialsProvider(credentialsProvider)
                    .region(Region.of(region))
                    .build();
        }
    }

    /**
     * Creates an S3 presigner bean.
     * Will use either AWS S3 or a custom endpoint (e.g., LocalStack)
     */
    @Bean
    public S3Presigner s3Presigner() {
        StaticCredentialsProvider credentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));
        
        // Configure S3 to use path-style access (important for LocalStack compatibility)
        S3Configuration s3Configuration = S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .checksumValidationEnabled(false)
                .build();

        if (endpoint != null && !endpoint.isEmpty()) {
            // Use custom endpoint (e.g., for LocalStack)
            logger.info("Creating S3 presigner with custom endpoint: {}", endpoint);
            return S3Presigner.builder()
                    .credentialsProvider(credentialsProvider)
                    .region(Region.of(region))
                    .endpointOverride(URI.create(endpoint))
                    .serviceConfiguration(s3Configuration)
                    .build();
        } else {
            // Use AWS S3
            logger.info("Creating S3 presigner with AWS endpoint for region: {}", region);
            return S3Presigner.builder()
                    .credentialsProvider(credentialsProvider)
                    .region(Region.of(region))
                    .build();
        }
    }
    
    /**
     * Verify that we can connect to S3 and access the bucket.
     * This will run after the beans are created.
     */
    @PostConstruct
    public void checkS3Connection() {
        logger.info("Checking S3 connection to bucket: {}", bucketName);
        try {
            HeadBucketRequest headBucketRequest = HeadBucketRequest.builder()
                    .bucket(bucketName)
                    .build();
            
            s3Client().headBucket(headBucketRequest);
            logger.info("Successfully connected to S3 bucket: {}", bucketName);
        } catch (S3Exception e) {
            logger.error("Failed to connect to S3 bucket {}: {} - {}", 
                    bucketName, e.awsErrorDetails().errorCode(), e.awsErrorDetails().errorMessage());
            logger.error("Make sure the bucket exists and is accessible from the application");
            logger.error("S3 endpoint: {}", endpoint != null ? endpoint : "Default AWS S3");
            // We don't throw an exception here to allow the application to start anyway
            // This helps with development and troubleshooting
        } catch (Exception e) {
            logger.error("Unexpected error when connecting to S3: {}", e.getMessage(), e);
        }
    }
} 
