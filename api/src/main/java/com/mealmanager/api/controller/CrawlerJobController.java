package com.mealmanager.api.controller;

import com.mealmanager.api.dto.CrawlerJobActionRequest;
import com.mealmanager.api.dto.CrawlerJobCreateRequest;
import com.mealmanager.api.dto.CrawlerJobResponse;
import com.mealmanager.api.model.CrawlerJob;
import com.mealmanager.api.model.CrawlerStorage;
import com.mealmanager.api.model.SysUser;
import com.mealmanager.api.messagequeue.CrawlerJobProducer;
import com.mealmanager.api.security.SecurityUtils;
import com.mealmanager.api.services.CrawlerJobService;
import com.mealmanager.api.services.S3StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller for managing crawler jobs
 */
@RestController
@RequestMapping("/api")
public class CrawlerJobController {

    private final Logger logger = LoggerFactory.getLogger(CrawlerJobController.class);
    
    @Autowired
    private CrawlerJobService crawlerJobService;
    
    @Autowired
    private CrawlerJobProducer crawlerJobProducer;
    
    @Autowired
    private S3StorageService s3StorageService;
    
    @Autowired
    private SecurityUtils securityUtils;
    
    /**
     * Get all crawler jobs for the current user with pagination
     * 
     * @param page Page number
     * @param size Page size
     * @param showArchived Whether to include archived jobs
     * @return List of crawler jobs
     */
    @GetMapping("/crawler-jobs")
    public ResponseEntity<Map<String, Object>> getCrawlerJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean showArchived) {
        
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            
            SysUser currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<CrawlerJob> jobPage = crawlerJobService.getCrawlerJobs(currentUser, showArchived, pageable);
            
            List<CrawlerJobResponse> jobs = jobPage.getContent().stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("jobs", jobs);
            response.put("currentPage", jobPage.getNumber());
            response.put("totalItems", jobPage.getTotalElements());
            response.put("totalPages", jobPage.getTotalPages());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting crawler jobs", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get a crawler job by ID
     * 
     * @param id Crawler job ID
     * @return Crawler job details
     */
    @GetMapping("/crawler-jobs/{id}")
    public ResponseEntity<CrawlerJobResponse> getCrawlerJob(@PathVariable("id") long id) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            
            SysUser currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            
            Optional<CrawlerJob> jobOptional = crawlerJobService.getCrawlerJob(id);
            
            if (jobOptional.isPresent()) {
                CrawlerJob job = jobOptional.get();
                
                // Check if user owns the job
                if (job.getUser().getId() != currentUser.getId()) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                }
                
                return new ResponseEntity<>(convertToResponse(job), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error getting crawler job", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Create a new crawler job
     * 
     * @param request Crawler job create request
     * @return Created crawler job
     */
    @PostMapping("/crawler-jobs")
    public ResponseEntity<CrawlerJobResponse> createCrawlerJob(@RequestBody CrawlerJobCreateRequest request) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            
            SysUser currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            
            // Check rate limiting
            if (crawlerJobService.hasReachedRateLimit(currentUser)) {
                return new ResponseEntity<>(HttpStatus.TOO_MANY_REQUESTS);
            }
            
            // Validate inputs
            if (request.getUrl() == null || request.getUrl().isEmpty()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            if (request.getRecipeName() == null || request.getRecipeName().isEmpty()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            try {
                // Create the job
                CrawlerJob job = crawlerJobService.createCrawlerJob(
                    request.getUrl(),
                    currentUser,
                    request.getCrawlDepth(),
                    request.getRecipeName(),
                    request.getRecipeDescription(),
                    request.isForceOverrideValidation()
                );
                
                // Send to queue for processing
                crawlerJobProducer.sendCrawlerJob(job.getId());
                
                return new ResponseEntity<>(convertToResponse(job), HttpStatus.CREATED);
            } catch (IllegalArgumentException e) {
                // Return bad request for validation errors
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error creating crawler job", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Perform an action on a crawler job (retry, cancel)
     * 
     * @param id Crawler job ID
     * @param request Action request
     * @return Updated crawler job
     */
    @PutMapping("/crawler-jobs/{id}/action")
    public ResponseEntity<CrawlerJobResponse> performCrawlerJobAction(
            @PathVariable("id") long id,
            @RequestBody CrawlerJobActionRequest request) {
        
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            
            SysUser currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            
            Optional<CrawlerJob> jobOptional = crawlerJobService.getCrawlerJob(id);
            
            if (jobOptional.isPresent()) {
                CrawlerJob job = jobOptional.get();
                
                // Check if user owns the job
                if (job.getUser().getId() != currentUser.getId()) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                }
                
                // Process action
                if ("retry".equals(request.getAction())) {
                    try {
                        job = crawlerJobService.retryCrawlerJob(job);
                        crawlerJobProducer.sendCrawlerJob(job.getId());
                        return new ResponseEntity<>(convertToResponse(job), HttpStatus.OK);
                    } catch (IllegalStateException e) {
                        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                    }
                } else if ("archive".equals(request.getAction())) {
                    job = crawlerJobService.archiveCrawlerJob(job);
                    return new ResponseEntity<>(convertToResponse(job), HttpStatus.OK);
                } else {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error performing crawler job action", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get a presigned URL to view crawled content
     * 
     * @param id Crawler job ID
     * @param path Path within the crawled content (optional)
     * @return Presigned URL
     */
    @GetMapping("/crawler-jobs/{id}/content")
    public ResponseEntity<Map<String, String>> getCrawledContent(
            @PathVariable("id") long id,
            @RequestParam(required = false) String path) {
        
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            
            SysUser currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            
            Optional<CrawlerJob> jobOptional = crawlerJobService.getCrawlerJob(id);
            
            if (jobOptional.isPresent()) {
                CrawlerJob job = jobOptional.get();
                
                // Check if user owns the job
                if (job.getUser().getId() != currentUser.getId()) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                }
                
                // Check if job was successful
                if (job.getStatus() != CrawlerJob.Status.SUCCESS) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                
                // Get the storage location
                List<CrawlerStorage> storages = crawlerJobService.getCrawlerStorages(job);
                
                if (storages.isEmpty()) {
                    return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                }
                
                CrawlerStorage storage = storages.get(0);
                String contentPath = path != null && !path.isEmpty() ? path : "index.html";
                
                // Generate presigned URL
                String url = s3StorageService.generatePresignedUrl(storage, contentPath, 60);
                
                Map<String, String> response = new HashMap<>();
                response.put("url", url);
                
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error getting crawled content", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Convert a CrawlerJob entity to a CrawlerJobResponse DTO
     * 
     * @param job The crawler job entity
     * @return The crawler job response DTO
     */
    private CrawlerJobResponse convertToResponse(CrawlerJob job) {
        CrawlerJobResponse response = new CrawlerJobResponse();
        response.setId(job.getId());
        response.setUrl(job.getUrl());
        response.setStatus(job.getStatus().name());
        response.setErrorCode(job.getErrorCode());
        response.setErrorMessage(job.getErrorMessage());
        response.setCreatedAt(job.getCreatedAt());
        response.setStartedAt(job.getStartedAt());
        response.setFinishedAt(job.getFinishedAt());
        response.setCrawlDepth(job.getCrawlDepth());
        response.setArchived(job.isArchived());
        
        if (job.getRecipe() != null) {
            response.setRecipeId(job.getRecipe().getId());
            response.setRecipeName(job.getRecipe().getName());
        }
        
        return response;
    }
} 