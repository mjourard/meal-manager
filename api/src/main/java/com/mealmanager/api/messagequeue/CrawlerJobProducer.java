package com.mealmanager.api.messagequeue;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Producer for sending crawler job messages to RabbitMQ
 */
@Component
public class CrawlerJobProducer {

    private final Logger logger = LoggerFactory.getLogger(CrawlerJobProducer.class);

    private final RabbitTemplate rabbitTemplate;
    private final Queue crawlerJobQueue;

    @Autowired
    public CrawlerJobProducer(RabbitTemplate rabbitTemplate, Queue crawlerJobQueue) {
        this.rabbitTemplate = rabbitTemplate;
        this.crawlerJobQueue = crawlerJobQueue;
    }

    /**
     * Sends a crawler job ID to the queue for processing
     * 
     * @param jobId The ID of the crawler job to process
     */
    public void sendCrawlerJob(Long jobId) {
        logger.info("Sending crawler job to queue: {}", jobId);
        rabbitTemplate.convertAndSend(crawlerJobQueue.getName(), jobId);
    }
} 