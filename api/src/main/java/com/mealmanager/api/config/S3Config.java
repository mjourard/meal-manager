package com.mealmanager.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

/**
 * Configuration for AWS S3 client and presigner
 */
@Configuration
public class S3Config {

    @Value("${aws.region}")
    private String region;

    @Value("${aws.access-key}")
    private String accessKey;

    @Value("${aws.secret-key}")
    private String secretKey;

    @Value("${aws.endpoint:#{null}}")
    private String endpoint;

    /**
     * Creates an S3 client bean.
     * Will use either AWS S3 or a custom endpoint (e.g., LocalStack)
     */
    @Bean
    public S3Client s3Client() {
        StaticCredentialsProvider credentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));

        if (endpoint != null && !endpoint.isEmpty()) {
            // Use custom endpoint (e.g., for LocalStack)
            return S3Client.builder()
                    .credentialsProvider(credentialsProvider)
                    .region(Region.of(region))
                    .endpointOverride(URI.create(endpoint))
                    .build();
        } else {
            // Use AWS S3
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

        if (endpoint != null && !endpoint.isEmpty()) {
            // Use custom endpoint (e.g., for LocalStack)
            return S3Presigner.builder()
                    .credentialsProvider(credentialsProvider)
                    .region(Region.of(region))
                    .endpointOverride(URI.create(endpoint))
                    .build();
        } else {
            // Use AWS S3
            return S3Presigner.builder()
                    .credentialsProvider(credentialsProvider)
                    .region(Region.of(region))
                    .build();
        }
    }
} 