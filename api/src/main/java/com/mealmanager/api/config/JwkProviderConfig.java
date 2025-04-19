package com.mealmanager.api.config;

import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.JwkProviderBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.URL;
import java.util.concurrent.TimeUnit;

@Configuration
public class JwkProviderConfig {

    private final JwtConfig jwtConfig;

    public JwkProviderConfig(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
    }

    @Bean
    public JwkProvider jwkProvider() throws Exception {
        return new JwkProviderBuilder(new URL(jwtConfig.getJwksUri()))
                .cached(10, 24, TimeUnit.HOURS)
                .rateLimited(10, 1, TimeUnit.MINUTES)
                .build();
    }
} 
