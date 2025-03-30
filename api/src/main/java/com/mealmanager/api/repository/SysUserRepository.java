package com.mealmanager.api.repository;

import com.mealmanager.api.model.SysUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SysUserRepository extends JpaRepository<SysUser, Long> {
    Optional<SysUser> findByClerkUserId(String clerkUserId);
}
