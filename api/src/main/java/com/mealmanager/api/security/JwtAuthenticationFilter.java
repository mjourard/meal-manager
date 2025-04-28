package com.mealmanager.api.security;

import java.io.IOException;
import java.security.interfaces.RSAPublicKey;
import java.util.Collections;
import java.util.Optional;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.filter.OncePerRequestFilter;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.Verification;
import com.mealmanager.api.config.JwtConfig;

/**
 * Filter that handles JWT authentication for the API.
 * Validates the JWT token from the Authorization header and sets up Spring Security context.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwkProvider jwkProvider;
    private final JwtConfig jwtConfig;
    private final boolean debugEnabled;

    /**
     * Creates a new JWT authentication filter.
     *
     * @param jwkProvider The JWK provider for key verification
     * @param jwtConfig The JWT configuration
     * @param debugEnabled Whether debug mode is enabled
     */
    public JwtAuthenticationFilter(
            JwkProvider jwkProvider, 
            JwtConfig jwtConfig,
            @Value("${app.debug.enabled:false}") boolean debugEnabled) {
        this.jwkProvider = jwkProvider;
        this.jwtConfig = jwtConfig;
        this.debugEnabled = debugEnabled;
        
        if (debugEnabled) {
            log.warn("JWT Debug mode is enabled. This should not be used in production!");
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            Optional<String> token = getJwtFromRequest(request);
            if (token.isPresent()) {
                if (debugEnabled) {
                    log.debug("JWT token found in request for URL: {}", request.getRequestURI());
                }
                validateToken(token.get())
                    .ifPresentOrElse(
                        jwt -> {
                            setAuthentication(jwt);
                            if (debugEnabled) {
                                log.debug("Authentication successful for user: {}", jwt.getSubject());
                            }
                        },
                        () -> {
                            log.warn("Failed to validate JWT token for URL: {}", request.getRequestURI());
                            if (debugEnabled) {
                                try {
                                    DecodedJWT debugJwt = JWT.decode(token.get());
                                    log.debug("Invalid token details - Issuer: {}, KeyID: {}", 
                                        debugJwt.getIssuer(), debugJwt.getKeyId());
                                    log.debug("Expected issuer: {}", jwtConfig.getIssuer());
                                } catch (Exception e) {
                                    log.debug("Could not decode token for debugging: {}", e.getMessage());
                                }
                            }
                        }
                    );
            } else if (debugEnabled) {
                log.debug("No JWT token found in request for URL: {}", request.getRequestURI());
            }
        } catch (Exception e) {
            log.error("JWT Authentication failed: {}", e.getMessage());
            if (debugEnabled) {
                log.debug("JWT Authentication exception details:", e);
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extracts the JWT token from the request's Authorization header.
     *
     * @param request The HTTP request
     * @return An Optional containing the JWT token if present
     */
    private Optional<String> getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (bearerToken != null && bearerToken.startsWith(BEARER_PREFIX)) {
            return Optional.of(bearerToken.substring(BEARER_PREFIX.length()));
        }
        return Optional.empty();
    }

    /**
     * Validates the JWT token against the configured issuer and audience.
     *
     * @param token The JWT token to validate
     * @return An Optional containing the decoded JWT if valid
     */
    private Optional<DecodedJWT> validateToken(String token) {
        try {
            // Only decode and log token details if debug is enabled
            if (debugEnabled) {
                log.debug("Validating JWT token");
                DecodedJWT debugJwt = JWT.decode(token);
                log.debug("JWT Subject: {}", debugJwt.getSubject());
                log.debug("JWT Issuer: {}", debugJwt.getIssuer());
                log.debug("JWT Key ID: {}", debugJwt.getKeyId());
                
                // Check if token is expired
                if (debugJwt.getExpiresAt() != null && debugJwt.getExpiresAt().before(new java.util.Date())) {
                    log.debug("JWT token is expired. Expiration: {}, Current time: {}", 
                        debugJwt.getExpiresAt(), new java.util.Date());
                    return Optional.empty();
                }
            }
            
            // Safe decoding for actual verification
            DecodedJWT jwt = JWT.decode(token);
            String keyId = jwt.getKeyId();
            if (keyId == null) {
                log.error("JWT key ID is missing");
                return Optional.empty();
            }

            if (debugEnabled) {
                log.debug("Fetching JWK for key ID: {}", keyId);
            }
            
            Jwk jwk = jwkProvider.get(keyId);
            Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);

            // Build the verification with required claims
            if (debugEnabled) {
                log.debug("Configuring JWT verification with issuer: {}", jwtConfig.getIssuer());
            }
            
            Verification verification = JWT.require(algorithm)
                    .withIssuer(jwtConfig.getIssuer());
            
            // Only add audience check if configured
            String audience = jwtConfig.getAudience();
            if (audience != null && !audience.trim().isEmpty()) {
                if (debugEnabled) {
                    log.debug("Adding audience verification: {}", audience);
                }
                verification = verification.withAudience(audience);
            } else if (debugEnabled) {
                log.debug("No audience configured, skipping audience verification");
            }
            
            // Verify the token
            if (debugEnabled) {
                log.debug("Verifying JWT token");
            }
            
            jwt = verification.build().verify(token);
            
            if (debugEnabled) {
                log.debug("JWT token verified successfully");
            }

            return Optional.of(jwt);
        } catch (JWTVerificationException e) {
            log.error("JWT verification failed: {}", e.getMessage());
            if (debugEnabled) {
                log.debug("JWT verification exception details:", e);
            }
            return Optional.empty();
        } catch (Exception e) {
            log.error("JWT processing error: {}", e.getMessage());
            if (debugEnabled) {
                log.debug("JWT processing exception details:", e);
            }
            return Optional.empty();
        }
    }

    /**
     * Sets up the Spring Security authentication context with the validated JWT.
     *
     * @param jwt The validated JWT token
     */
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
