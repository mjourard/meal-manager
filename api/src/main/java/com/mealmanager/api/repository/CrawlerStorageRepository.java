package com.mealmanager.api.repository;

import com.mealmanager.api.model.CrawlerJob;
import com.mealmanager.api.model.CrawlerStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrawlerStorageRepository extends JpaRepository<CrawlerStorage, Long> {
    
    List<CrawlerStorage> findByCrawlerJob(CrawlerJob crawlerJob);
    
    List<CrawlerStorage> findByS3BucketName(String bucketName);
    
    void deleteByCrawlerJob(CrawlerJob crawlerJob);
} 
