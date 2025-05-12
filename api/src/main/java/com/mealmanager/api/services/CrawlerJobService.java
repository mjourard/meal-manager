package com.mealmanager.api.services;

import com.mealmanager.api.model.CrawlerJob;
import com.mealmanager.api.model.CrawlerStorage;
import com.mealmanager.api.model.Recipe;
import com.mealmanager.api.model.SysUser;
import com.mealmanager.api.repository.CrawlerJobRepository;
import com.mealmanager.api.repository.CrawlerStorageRepository;
import com.mealmanager.api.repository.RecipeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing crawler jobs
 */
@Service
public class CrawlerJobService {

    private final Logger logger = LoggerFactory.getLogger(CrawlerJobService.class);
    
    private final CrawlerJobRepository crawlerJobRepository;
    private final CrawlerStorageRepository crawlerStorageRepository;
    private final RecipeRepository recipeRepository;
    private final WebCrawlerService webCrawlerService;
    private final UrlValidationService urlValidationService;
    
    @Autowired
    public CrawlerJobService(
            CrawlerJobRepository crawlerJobRepository,
            CrawlerStorageRepository crawlerStorageRepository,
            RecipeRepository recipeRepository,
            WebCrawlerService webCrawlerService,
            UrlValidationService urlValidationService) {
        this.crawlerJobRepository = crawlerJobRepository;
        this.crawlerStorageRepository = crawlerStorageRepository;
        this.recipeRepository = recipeRepository;
        this.webCrawlerService = webCrawlerService;
        this.urlValidationService = urlValidationService;
    }
    
    /**
     * Creates a new crawler job for the given URL and user
     * 
     * @param url The URL to crawl
     * @param user The user who created the job
     * @param crawlDepth The depth to crawl (maximum 5)
     * @param recipeName The name for the recipe
     * @param recipeDescription The description for the recipe
     * @param forceOverrideValidation Whether to force the job even if URL validation fails
     * @return The created crawler job
     * @throws IllegalArgumentException if the URL is invalid and override is not forced
     */
    @Transactional
    public CrawlerJob createCrawlerJob(
            String url,
            SysUser user,
            Integer crawlDepth,
            String recipeName,
            String recipeDescription,
            boolean forceOverrideValidation) {
        
        // Validate URL if override is not forced
        if (!forceOverrideValidation && !urlValidationService.isValidFormat(url)) {
            throw new IllegalArgumentException("Invalid URL format");
        }
        
        if (!forceOverrideValidation && !urlValidationService.isAccessible(url)) {
            throw new IllegalArgumentException("URL is not accessible");
        }
        
        // Check rate limiting - 30 jobs per hour
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long recentJobs = crawlerJobRepository.countRecentByUser(user, oneHourAgo);
        if (recentJobs >= 30) {
            throw new IllegalArgumentException("Rate limit exceeded (30 jobs per hour)");
        }
        
        // Create recipe
        Recipe recipe = new Recipe(
            recipeName, 
            recipeDescription, 
            url, 
            false
        );
        recipe.setOwner(user);
        recipe = recipeRepository.save(recipe);
        
        // Create crawler job
        CrawlerJob crawlerJob = new CrawlerJob(user, url, crawlDepth);
        crawlerJob.setRecipe(recipe);
        
        return crawlerJobRepository.save(crawlerJob);
    }
    
    /**
     * Gets a crawler job by ID
     * 
     * @param id The crawler job ID
     * @return The crawler job
     */
    public Optional<CrawlerJob> getCrawlerJob(Long id) {
        return crawlerJobRepository.findById(id);
    }
    
    /**
     * Gets crawler jobs for a user with pagination
     * 
     * @param user The user
     * @param archived Whether to include archived jobs
     * @param pageable Pagination information
     * @return Page of crawler jobs
     */
    public Page<CrawlerJob> getCrawlerJobs(SysUser user, boolean archived, Pageable pageable) {
        return crawlerJobRepository.findByUserAndArchived(user, archived, pageable);
    }
    
    /**
     * Archives a crawler job
     * 
     * @param crawlerJob The crawler job to archive
     * @return The updated crawler job
     */
    @Transactional
    public CrawlerJob archiveCrawlerJob(CrawlerJob crawlerJob) {
        crawlerJob.setArchived(true);
        return crawlerJobRepository.save(crawlerJob);
    }
    
    /**
     * Starts processing a crawler job
     * 
     * @param crawlerJob The crawler job to process
     * @return The updated crawler job
     */
    @Transactional
    public CrawlerJob processCrawlerJob(CrawlerJob crawlerJob) {
        // Update status to in progress
        crawlerJob.setStatus(CrawlerJob.Status.IN_PROGRESS);
        crawlerJob.setStartedAt(LocalDateTime.now());
        crawlerJobRepository.save(crawlerJob);
        
        try {
            // Run the crawler
            boolean success = webCrawlerService.crawl(crawlerJob);
            
            // Update status based on result
            if (success) {
                crawlerJob.setStatus(CrawlerJob.Status.SUCCESS);
            } else {
                crawlerJob.setStatus(CrawlerJob.Status.FAILED_RETRYABLE);
                crawlerJob.setErrorCode("CRAWL_FAILED");
                crawlerJob.setErrorMessage("Crawling failed");
            }
        } catch (Exception e) {
            // Handle exceptions
            logger.error("Error processing crawler job: {}", e.getMessage(), e);
            crawlerJob.setStatus(CrawlerJob.Status.FAILED_FOREVER);
            crawlerJob.setErrorCode("EXCEPTION");
            crawlerJob.setErrorMessage(e.getMessage());
        }
        
        // Update finished time
        crawlerJob.setFinishedAt(LocalDateTime.now());
        return crawlerJobRepository.save(crawlerJob);
    }
    
    /**
     * Retries a failed crawler job
     * 
     * @param crawlerJob The crawler job to retry
     * @return The updated crawler job
     * @throws IllegalStateException if the job is not in a retryable state
     */
    @Transactional
    public CrawlerJob retryCrawlerJob(CrawlerJob crawlerJob) {
        if (crawlerJob.getStatus() != CrawlerJob.Status.FAILED_RETRYABLE) {
            throw new IllegalStateException("Crawler job is not in a retryable state");
        }
        
        // Reset status to pending
        crawlerJob.setStatus(CrawlerJob.Status.PENDING);
        crawlerJob.setStartedAt(null);
        crawlerJob.setFinishedAt(null);
        crawlerJob.setErrorCode(null);
        crawlerJob.setErrorMessage(null);
        
        return crawlerJobRepository.save(crawlerJob);
    }
    
    /**
     * Gets storage locations for a crawler job
     * 
     * @param crawlerJob The crawler job
     * @return List of storage locations
     */
    public List<CrawlerStorage> getCrawlerStorages(CrawlerJob crawlerJob) {
        return crawlerStorageRepository.findByCrawlerJob(crawlerJob);
    }
    
    /**
     * Checks if a user has reached the rate limit for crawler jobs
     * 
     * @param user The user
     * @return true if the rate limit has been reached, false otherwise
     */
    public boolean hasReachedRateLimit(SysUser user) {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long recentJobs = crawlerJobRepository.countRecentByUser(user, oneHourAgo);
        return recentJobs >= 30;
    }
} 
