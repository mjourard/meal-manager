package com.mealmanager.api.messagequeue;

import com.mealmanager.api.model.CrawlerJob;
import com.mealmanager.api.services.CrawlerJobService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Consumer for processing crawler job messages from RabbitMQ
 */
@Component
@RabbitListener(queues = "#{crawlerJobQueue.name}")
public class CrawlerJobConsumer {

    private final Logger logger = LoggerFactory.getLogger(CrawlerJobConsumer.class);

    private final CrawlerJobService crawlerJobService;

    @Autowired
    public CrawlerJobConsumer(CrawlerJobService crawlerJobService) {
        this.crawlerJobService = crawlerJobService;
    }

    /**
     * Processes a crawler job message from the queue
     * 
     * @param jobId The ID of the crawler job to process
     */
    @RabbitHandler
    public void receiveMessage(Long jobId) {
        logger.info("Received crawler job from queue: {}", jobId);
        
        try {
            // Look up the crawler job
            Optional<CrawlerJob> crawlerJobOptional = crawlerJobService.getCrawlerJob(jobId);
            
            if (crawlerJobOptional.isPresent()) {
                CrawlerJob crawlerJob = crawlerJobOptional.get();
                
                // Only process if the job is in PENDING state
                if (crawlerJob.getStatus() == CrawlerJob.Status.PENDING) {
                    logger.info("Processing crawler job: {}", jobId);
                    crawlerJobService.processCrawlerJob(crawlerJob);
                } else {
                    logger.warn("Crawler job is not in PENDING state: {}, status: {}", 
                        jobId, crawlerJob.getStatus());
                }
            } else {
                logger.error("Crawler job not found: {}", jobId);
            }
        } catch (Exception e) {
            logger.error("Error processing crawler job: {}", jobId, e);
        }
    }
} 