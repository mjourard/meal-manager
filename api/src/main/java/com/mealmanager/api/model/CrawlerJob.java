package com.mealmanager.api.model;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "crawler_job")
public class CrawlerJob {

    public enum Status {
        PENDING, 
        IN_PROGRESS, 
        SUCCESS, 
        FAILED_RETRYABLE, 
        FAILED_FOREVER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sysuser_id", nullable = false)
    private SysUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;

    @Column(name = "url", nullable = false)
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "error_code")
    private String errorCode;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @Column(name = "last_updated_at", nullable = false)
    private LocalDateTime lastUpdatedAt;

    @Column(name = "crawl_depth", nullable = false)
    private Integer crawlDepth;

    @Column(name = "is_archived", nullable = false)
    private boolean archived;

    @OneToMany(mappedBy = "crawlerJob", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CrawlerStorage> storages = new HashSet<>();

    public CrawlerJob() {
        this.createdAt = LocalDateTime.now();
        this.lastUpdatedAt = LocalDateTime.now();
        this.status = Status.PENDING;
        this.crawlDepth = 1;
        this.archived = false;
    }

    public CrawlerJob(SysUser user, String url, Integer crawlDepth) {
        this();
        this.user = user;
        this.url = url;
        if (crawlDepth != null && crawlDepth > 0 && crawlDepth <= 5) {
            this.crawlDepth = crawlDepth;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SysUser getUser() {
        return user;
    }

    public void setUser(SysUser user) {
        this.user = user;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
        this.lastUpdatedAt = LocalDateTime.now();
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
        this.lastUpdatedAt = LocalDateTime.now();
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
        this.lastUpdatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
        this.lastUpdatedAt = LocalDateTime.now();
    }

    public LocalDateTime getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(LocalDateTime finishedAt) {
        this.finishedAt = finishedAt;
        this.lastUpdatedAt = LocalDateTime.now();
    }

    public LocalDateTime getLastUpdatedAt() {
        return lastUpdatedAt;
    }

    public void setLastUpdatedAt(LocalDateTime lastUpdatedAt) {
        this.lastUpdatedAt = lastUpdatedAt;
    }

    public Integer getCrawlDepth() {
        return crawlDepth;
    }

    public void setCrawlDepth(Integer crawlDepth) {
        if (crawlDepth != null && crawlDepth > 0 && crawlDepth <= 5) {
            this.crawlDepth = crawlDepth;
        }
    }

    public boolean isArchived() {
        return archived;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }

    public Set<CrawlerStorage> getStorages() {
        return storages;
    }

    public void setStorages(Set<CrawlerStorage> storages) {
        this.storages = storages;
    }

    public void addStorage(CrawlerStorage storage) {
        storages.add(storage);
        storage.setCrawlerJob(this);
    }

    public void removeStorage(CrawlerStorage storage) {
        storages.remove(storage);
        storage.setCrawlerJob(null);
    }
} 
