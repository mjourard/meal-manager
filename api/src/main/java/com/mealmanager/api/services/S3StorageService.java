package com.mealmanager.api.services;

import com.mealmanager.api.model.CrawlerJob;
import com.mealmanager.api.model.CrawlerStorage;
import com.mealmanager.api.repository.CrawlerStorageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import javax.annotation.PostConstruct;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service for handling storage of crawled content in S3
 */
@Service
public class S3StorageService {

    private final Logger logger = LoggerFactory.getLogger(S3StorageService.class);

    @Value("${aws.s3.bucket-name}")
    private String bucketName;
    
    @Value("${aws.endpoint:#{null}}")
    private String endpoint;
    
    @Value("${app.environment:dev}")
    private String environment;

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final CrawlerStorageRepository crawlerStorageRepository;

    @Autowired
    public S3StorageService(S3Client s3Client, S3Presigner s3Presigner, CrawlerStorageRepository crawlerStorageRepository) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.crawlerStorageRepository = crawlerStorageRepository;
        
        // Log S3 configuration on startup
        logger.info("S3StorageService initialized with bucket: {}", bucketName);
        logger.info("Using S3 endpoint: {}", endpoint != null ? endpoint : "Default AWS S3");
    }
    
    /**
     * Test S3 connectivity by uploading and retrieving a simple test file
     * Only runs in development mode for safety
     */
    @PostConstruct
    public void testS3Connectivity() {
        // Only run this test in development mode
        if (!"dev".equalsIgnoreCase(environment)) {
            logger.info("Skipping S3 connectivity test in non-dev environment");
            return;
        }
        
        String testKey = "test/connectivity-test-" + UUID.randomUUID() + ".txt";
        String testContent = "This is a test file created at " + LocalDateTime.now();
        
        logger.info("Testing S3 connectivity with test file upload/download");
        
        try {
            // Upload test file
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(testKey)
                    .contentType("text/plain")
                    .build();
            
            s3Client.putObject(putRequest, RequestBody.fromString(testContent));
            logger.info("Successfully uploaded test file to S3: bucket={}, key={}", bucketName, testKey);
            
            // Download test file
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(testKey)
                    .build();
            
            ResponseInputStream<GetObjectResponse> response = s3Client.getObject(getRequest);
            String downloadedContent = readInputStream(response);
            
            if (testContent.equals(downloadedContent)) {
                logger.info("Successfully verified S3 connectivity: content matches");
            } else {
                logger.warn("S3 connectivity test: content mismatch! Expected: {}, Actual: {}", 
                        testContent, downloadedContent);
            }
        } catch (S3Exception e) {
            logger.error("S3 connectivity test failed: errorCode={}, errorMessage={}", 
                    e.awsErrorDetails().errorCode(), e.awsErrorDetails().errorMessage());
            logger.error("S3 endpoint: {}", endpoint != null ? endpoint : "Default AWS S3");
        } catch (Exception e) {
            logger.error("Unexpected error during S3 connectivity test: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Helper method to read an InputStream to String
     */
    private String readInputStream(InputStream input) throws IOException {
        ByteArrayOutputStream result = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int length;
        while ((length = input.read(buffer)) != -1) {
            result.write(buffer, 0, length);
        }
        return result.toString("UTF-8");
    }

    /**
     * Stores content in S3 and creates a new CrawlerStorage record
     * 
     * @param crawlerJob The crawler job associated with this content
     * @param content The content to store
     * @param contentType The MIME type of the content
     * @param path The path within the S3 folder structure (e.g., index.html, images/logo.png)
     * @return The created CrawlerStorage record
     */
    public CrawlerStorage storeContent(CrawlerJob crawlerJob, byte[] content, String contentType, String path) {
        // Generate folder path based on job and user
        String folderPath = generateFolderPath(crawlerJob);
        String objectKey = folderPath + "/" + path;
        
        logger.debug("Attempting to store content in S3: bucket={}, key={}, contentType={}, contentSize={} bytes", 
                bucketName, objectKey, contentType, content.length);
        
        try {
            // Upload content to S3
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .contentType(contentType)
                    .build();
            
            logger.debug("Executing PutObject request to S3...");
            s3Client.putObject(putRequest, RequestBody.fromBytes(content));
            logger.info("Successfully stored content in S3: bucket={}, key={}", bucketName, objectKey);
            
            // Create storage record
            CrawlerStorage storage = new CrawlerStorage(crawlerJob, bucketName, folderPath);
            CrawlerStorage savedStorage = crawlerStorageRepository.save(storage);
            logger.info("Created crawler storage record with ID: {}", savedStorage.getId());
            
            return savedStorage;
        } catch (S3Exception e) {
            logger.error("S3 error storing content: errorCode={}, errorMessage={}", 
                    e.awsErrorDetails().errorCode(), e.awsErrorDetails().errorMessage());
            logger.error("S3 request details: bucket={}, key={}, endpoint={}", bucketName, objectKey, endpoint);
            throw new RuntimeException("Failed to store content in S3: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Error storing content in S3: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to store content in S3: " + e.getMessage(), e);
        }
    }

    /**
     * Generates a presigned URL to access the crawled content
     * 
     * @param storage The CrawlerStorage record
     * @param path The path within the S3 folder structure
     * @param expirationMinutes How long the URL should be valid (in minutes)
     * @return The presigned URL
     */
    public String generatePresignedUrl(CrawlerStorage storage, String path, int expirationMinutes) {
        String objectKey = storage.getS3FolderPath() + "/" + path;
        
        logger.debug("Generating presigned URL for: bucket={}, key={}, expiration={} minutes", 
                storage.getS3BucketName(), objectKey, expirationMinutes);
        
        try {
            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(expirationMinutes))
                    .getObjectRequest(req -> req.bucket(storage.getS3BucketName()).key(objectKey))
                    .build();
            
            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            String url = presignedRequest.url().toString();
            
            logger.debug("Generated presigned URL: {}", url);
            return url;
        } catch (Exception e) {
            logger.error("Error generating presigned URL: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate presigned URL: " + e.getMessage(), e);
        }
    }

    /**
     * Generates a unique folder path for a crawler job
     * 
     * @param crawlerJob The crawler job
     * @return The folder path
     */
    private String generateFolderPath(CrawlerJob crawlerJob) {
        String timestamp = LocalDateTime.now().toString().replace(":", "-");
        String userId = String.valueOf(crawlerJob.getUser().getId());
        String jobId = String.valueOf(crawlerJob.getId());
        String uuid = UUID.randomUUID().toString();
        
        String folderPath = String.format("crawled-content/%s/%s/%s-%s", userId, jobId, timestamp, uuid);
        logger.debug("Generated folder path: {}", folderPath);
        return folderPath;
    }
} 
