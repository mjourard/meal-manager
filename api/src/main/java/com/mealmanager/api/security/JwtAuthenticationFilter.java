package com.mealmanager.api.security;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.Verification;
import com.mealmanager.api.config.JwtConfig;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.interfaces.RSAPublicKey;
import java.util.Collections;
import java.util.Optional;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwkProvider jwkProvider;
    private final JwtConfig jwtConfig;

    public JwtAuthenticationFilter(JwkProvider jwkProvider, JwtConfig jwtConfig) {
        this.jwkProvider = jwkProvider;
        this.jwtConfig = jwtConfig;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            Optional<String> token = getJwtFromRequest(request);
            if (token.isPresent()) {
                log.debug("JWT token found in request");
                validateToken(token.get())
                        .ifPresentOrElse(
                            jwt -> {
                                setAuthentication(jwt);
                                log.debug("Authentication successful for user: {}", jwt.getSubject());
                            },
                            () -> log.warn("Failed to validate JWT token")
                        );
            }
        } catch (Exception e) {
            log.error("JWT Authentication failed", e);
        }

        filterChain.doFilter(request, response);
    }

    private Optional<String> getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (bearerToken != null && bearerToken.startsWith(BEARER_PREFIX)) {
            return Optional.of(bearerToken.substring(BEARER_PREFIX.length()));
        }
        return Optional.empty();
    }

    private Optional<DecodedJWT> validateToken(String token) {
        try {
            log.debug("Validating JWT token");
            DecodedJWT jwt = JWT.decode(token);
            
            // Log token details for debugging
            log.debug("JWT Subject: {}", jwt.getSubject());
            log.debug("JWT Issuer: {}", jwt.getIssuer());
            log.debug("JWT Key ID: {}", jwt.getKeyId());
            
            String keyId = jwt.getKeyId();
            if (keyId == null) {
                log.error("JWT key ID is missing");
                return Optional.empty();
            }

            log.debug("Fetching JWK for key ID: {}", keyId);
            Jwk jwk = jwkProvider.get(keyId);
            Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);

            // Build the verification with required claims
            log.debug("Configuring JWT verification with issuer: {}", jwtConfig.getIssuer());
            Verification verification = JWT.require(algorithm)
                    .withIssuer(jwtConfig.getIssuer());
            
            // Only add audience check if configured
            String audience = jwtConfig.getAudience();
            if (audience != null && !audience.trim().isEmpty()) {
                log.debug("Adding audience verification: {}", audience);
                verification = verification.withAudience(audience);
            } else {
                log.debug("No audience configured, skipping audience verification");
            }
            
            // Verify the token
            log.debug("Verifying JWT token");
            jwt = verification.build().verify(token);
            log.debug("JWT token verified successfully");

            return Optional.of(jwt);
        } catch (JWTVerificationException e) {
            log.error("JWT verification failed: {}", e.getMessage(), e);
            return Optional.empty();
        } catch (Exception e) {
            log.error("JWT processing error: {}", e.getMessage(), e);
            return Optional.empty();
        }
    }

    private void setAuthentication(DecodedJWT jwt) {
        String userId = jwt.getSubject();
        
        // Create a Spring Security User with the subject claim as the username
        User user = new User(
                userId,
                "",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                user,
                null,
                user.getAuthorities()
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
} 