package com.mealmanager.api.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "crawler_storage")
public class CrawlerStorage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crawler_job_id", nullable = false)
    private CrawlerJob crawlerJob;

    @Column(name = "s3_bucket_name", nullable = false)
    private String s3BucketName;

    @Column(name = "s3_folder_path", nullable = false)
    private String s3FolderPath;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public CrawlerStorage() {
        this.createdAt = LocalDateTime.now();
    }

    public CrawlerStorage(CrawlerJob crawlerJob, String s3BucketName, String s3FolderPath) {
        this();
        this.crawlerJob = crawlerJob;
        this.s3BucketName = s3BucketName;
        this.s3FolderPath = s3FolderPath;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CrawlerJob getCrawlerJob() {
        return crawlerJob;
    }

    public void setCrawlerJob(CrawlerJob crawlerJob) {
        this.crawlerJob = crawlerJob;
    }

    public String getS3BucketName() {
        return s3BucketName;
    }

    public void setS3BucketName(String s3BucketName) {
        this.s3BucketName = s3BucketName;
    }

    public String getS3FolderPath() {
        return s3FolderPath;
    }

    public void setS3FolderPath(String s3FolderPath) {
        this.s3FolderPath = s3FolderPath;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * Generates a presigned URL to access the crawled content.
     * 
     * @param expirationMinutes how long the URL should be valid (in minutes)
     * @return presigned URL to access the crawled content
     */
    public String generatePresignedUrl(int expirationMinutes) {
        // Implementation will be added in the S3StorageService
        return null;
    }
} 
