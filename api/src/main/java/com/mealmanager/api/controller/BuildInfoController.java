package com.mealmanager.api.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/buildinfo")
public class BuildInfoController {

    @Value("${app.version}")
    private String appVersion;

    @Value("${app.build.timestamp}")
    private String buildTimestamp;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Value("${app.api.url}")
    private String apiUrl;

    @GetMapping
    public Map<String, String> getBuildInfo() {
        Map<String, String> buildInfo = new HashMap<>();
        buildInfo.put("version", appVersion);
        buildInfo.put("buildTimestamp", buildTimestamp);
        buildInfo.put("environment", activeProfile);
        buildInfo.put("apiUrl", apiUrl);
        return buildInfo;
    }
} 