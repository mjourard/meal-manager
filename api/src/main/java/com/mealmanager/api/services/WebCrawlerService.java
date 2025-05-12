package com.mealmanager.api.services;

import com.mealmanager.api.model.CrawlerJob;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for crawling websites and storing their content
 */
@Service
public class WebCrawlerService {

    private final Logger logger = LoggerFactory.getLogger(WebCrawlerService.class);
    
    private final S3StorageService s3StorageService;
    private final RobotsTxtParser robotsTxtParser;
    private final LinkFilterService linkFilterService;
    
    @Autowired
    public WebCrawlerService(
            S3StorageService s3StorageService,
            RobotsTxtParser robotsTxtParser,
            LinkFilterService linkFilterService) {
        this.s3StorageService = s3StorageService;
        this.robotsTxtParser = robotsTxtParser;
        this.linkFilterService = linkFilterService;
    }
    
    /**
     * Crawls a website starting from the given URL
     * 
     * @param crawlerJob The crawler job
     * @return true if crawling was successful, false otherwise
     */
    public boolean crawl(CrawlerJob crawlerJob) {
        try {
            // Create a set to keep track of visited URLs
            Set<String> visitedUrls = ConcurrentHashMap.newKeySet();
            
            // Start crawling from the initial URL
            return crawlPage(crawlerJob, crawlerJob.getUrl(), 0, visitedUrls);
        } catch (Exception e) {
            logger.error("Error crawling URL: {}", crawlerJob.getUrl(), e);
            return false;
        }
    }
    
    /**
     * Recursively crawls pages up to the specified depth
     * 
     * @param crawlerJob The crawler job
     * @param url The URL to crawl
     * @param depth The current depth
     * @param visitedUrls Set of already visited URLs
     * @return true if crawling was successful, false otherwise
     */
    private boolean crawlPage(CrawlerJob crawlerJob, String url, int depth, Set<String> visitedUrls) {
        // Check if URL has already been visited
        if (visitedUrls.contains(url)) {
            return true;
        }
        
        // Check depth limit
        if (depth > crawlerJob.getCrawlDepth()) {
            return true;
        }
        
        // Check robots.txt
        if (!robotsTxtParser.isAllowed(url)) {
            logger.info("URL is not allowed by robots.txt: {}", url);
            return true;
        }
        
        // Mark URL as visited
        visitedUrls.add(url);
        
        try {
            URL urlObj = new URL(url);
            String host = urlObj.getHost();
            String path = urlObj.getPath();
            if (path.isEmpty()) {
                path = "index.html";
            } else if (path.endsWith("/")) {
                path += "index.html";
            }
            
            // Fetch the page
            Connection.Response response = Jsoup.connect(url)
                    .userAgent("MealManagerBot")
                    .timeout(10000)
                    .execute();
            
            // Get content type
            String contentType = response.contentType();
            if (contentType == null) {
                contentType = "text/html";
            }
            
            // Store the content
            byte[] content = response.bodyAsBytes();
            s3StorageService.storeContent(crawlerJob, content, contentType, path);
            
            // Only parse HTML content for links
            if (contentType.contains("text/html")) {
                Document doc = response.parse();
                
                // Find and process links
                Elements links = doc.select("a[href], link[href], img[src], script[src]");
                for (Element link : links) {
                    String tagName = link.tagName();
                    String relativeUrl;
                    
                    // Extract URL from the appropriate attribute
                    if (tagName.equals("a") || tagName.equals("link")) {
                        relativeUrl = link.attr("href");
                    } else {
                        relativeUrl = link.attr("src");
                    }
                    
                    // Skip empty URLs
                    if (relativeUrl.isEmpty()) {
                        continue;
                    }
                    
                    // Skip URLs that should be filtered out
                    if (linkFilterService.shouldFilter(relativeUrl)) {
                        continue;
                    }
                    
                    // Clean URLs
                    relativeUrl = linkFilterService.cleanUrl(relativeUrl);
                    
                    // Convert to absolute URL
                    String absoluteUrl = makeAbsoluteUrl(url, relativeUrl);
                    if (absoluteUrl == null) {
                        continue;
                    }
                    
                    // Only follow links to the same domain
                    URL absoluteUrlObj = new URL(absoluteUrl);
                    if (!absoluteUrlObj.getHost().equals(host)) {
                        // Still store external resources, but don't crawl them
                        if (tagName.equals("img") || tagName.equals("script") || tagName.equals("link")) {
                            storeExternalResource(crawlerJob, absoluteUrl, path);
                        }
                        continue;
                    }
                    
                    // Recursively crawl the page
                    crawlPage(crawlerJob, absoluteUrl, depth + 1, visitedUrls);
                }
            }
            
            return true;
        } catch (IOException e) {
            logger.warn("Error fetching URL: {}", url, e);
            return false;
        }
    }
    
    /**
     * Stores an external resource
     * 
     * @param crawlerJob The crawler job
     * @param url The URL of the resource
     * @param parentPath The path of the parent HTML page
     */
    private void storeExternalResource(CrawlerJob crawlerJob, String url, String parentPath) {
        try {
            // Determine resource type
            String resourceType = "unknown";
            if (url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".gif")) {
                resourceType = "image";
            } else if (url.endsWith(".css")) {
                resourceType = "css";
            } else if (url.endsWith(".js")) {
                resourceType = "js";
            }
            
            // Fetch resource
            Connection.Response response = Jsoup.connect(url)
                    .userAgent("MealManagerBot")
                    .timeout(5000)
                    .ignoreContentType(true)
                    .execute();
            
            // Create path for resource
            URL urlObj = new URL(url);
            String resourcePath = "resources/" + resourceType + "/" + urlObj.getHost() + urlObj.getPath();
            
            // Store content
            s3StorageService.storeContent(
                crawlerJob,
                response.bodyAsBytes(),
                response.contentType(),
                resourcePath
            );
        } catch (IOException e) {
            logger.warn("Error fetching external resource: {}", url, e);
        }
    }
    
    /**
     * Converts a relative URL to an absolute URL
     * 
     * @param baseUrl The base URL
     * @param relativeUrl The relative URL
     * @return The absolute URL, or null if it can't be converted
     */
    private String makeAbsoluteUrl(String baseUrl, String relativeUrl) {
        try {
            // If the URL is already absolute, return it
            if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
                return relativeUrl;
            }
            
            // Skip invalid URLs
            if (relativeUrl.startsWith("javascript:") || relativeUrl.startsWith("mailto:")) {
                return null;
            }
            
            // Convert to absolute URL
            URL base = new URL(baseUrl);
            return new URL(base, relativeUrl).toString();
        } catch (MalformedURLException e) {
            logger.debug("Error creating absolute URL from base {} and relative {}: {}", 
                baseUrl, relativeUrl, e.getMessage());
            return null;
        }
    }
} 
