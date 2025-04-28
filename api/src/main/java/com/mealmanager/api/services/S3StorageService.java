package com.mealmanager.api.services;

import com.mealmanager.api.model.CrawlerJob;
import com.mealmanager.api.model.CrawlerStorage;
import com.mealmanager.api.repository.CrawlerStorageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

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

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final CrawlerStorageRepository crawlerStorageRepository;

    @Autowired
    public S3StorageService(S3Client s3Client, S3Presigner s3Presigner, CrawlerStorageRepository crawlerStorageRepository) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.crawlerStorageRepository = crawlerStorageRepository;
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
        
        try {
            // Upload content to S3
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .contentType(contentType)
                    .build();
            
            s3Client.putObject(putRequest, RequestBody.fromBytes(content));
            
            // Create storage record
            CrawlerStorage storage = new CrawlerStorage(crawlerJob, bucketName, folderPath);
            return crawlerStorageRepository.save(storage);
        } catch (Exception e) {
            logger.error("Error storing content in S3: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to store content in S3", e);
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
        
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(expirationMinutes))
                .getObjectRequest(req -> req.bucket(storage.getS3BucketName()).key(objectKey))
                .build();
        
        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
        return presignedRequest.url().toString();
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
        
        return String.format("crawled-content/%s/%s/%s-%s", userId, jobId, timestamp, uuid);
    }
} 
