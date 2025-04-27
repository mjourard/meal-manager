package com.mealmanager.api.repository;

import com.mealmanager.api.model.CrawlerJob;
import com.mealmanager.api.model.SysUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CrawlerJobRepository extends JpaRepository<CrawlerJob, Long> {
    
    Page<CrawlerJob> findByUser(SysUser user, Pageable pageable);
    
    Page<CrawlerJob> findByUserAndStatus(SysUser user, CrawlerJob.Status status, Pageable pageable);
    
    Page<CrawlerJob> findByUserAndIsArchived(SysUser user, boolean isArchived, Pageable pageable);
    
    @Query("SELECT cj FROM CrawlerJob cj WHERE cj.user = :user AND cj.createdAt >= :since")
    List<CrawlerJob> findRecentByUser(@Param("user") SysUser user, @Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(cj) FROM CrawlerJob cj WHERE cj.user = :user AND cj.createdAt >= :since")
    long countRecentByUser(@Param("user") SysUser user, @Param("since") LocalDateTime since);
} 
