package org.example.secureapp.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.*;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    // Remplace par ton clientId Keycloak si différent
    private static final String CLIENT_ID = "react-client";

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.csrf((csrf) -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests((authorize) ->
                        authorize
                                .requestMatchers("/h2-console/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/courses/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_STUDENT")
                                .requestMatchers(HttpMethod.POST, "/courses/**").hasAuthority("ROLE_ADMIN")
                                .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(converter())));

        return httpSecurity.build();
    }

    @Bean
    public JwtAuthenticationConverter converter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            try {
                System.out.println("=== JWT claims received by backend ===");
                System.out.println(jwt.getClaims());

                List<String> roles = jwt.getClaimAsStringList("roles");

                if (roles == null || roles.isEmpty()) {
                    Object realmAccessObj = jwt.getClaim("realm_access");
                    if (realmAccessObj instanceof Map) {
                        Map<?, ?> realmAccess = (Map<?, ?>) realmAccessObj;
                        Object r = realmAccess.get("roles");
                        if (r instanceof List) {
                            roles = ((List<?>) r).stream().map(Object::toString).collect(Collectors.toList());
                        }
                    }
                }

                if (roles == null || roles.isEmpty()) {
                    Object resourceAccessObj = jwt.getClaim("resource_access");
                    if (resourceAccessObj instanceof Map) {
                        Map<?, ?> resourceAccess = (Map<?, ?>) resourceAccessObj;
                        Object clientMap = resourceAccess.get(CLIENT_ID); // bien utiliser ton clientId
                        if (clientMap instanceof Map) {
                            Object r = ((Map<?, ?>) clientMap).get("roles");
                            if (r instanceof List) {
                                roles = ((List<?>) r).stream().map(Object::toString).collect(Collectors.toList());
                            }
                        }
                    }
                }

                System.out.println("Resolved roles (raw) = " + roles);

                if (roles == null || roles.isEmpty()) {
                    System.out.println("No roles found in token -> returning no authorities");
                    return Collections.emptyList();
                }

                // rôles à ignorer (non applicatifs)
                Set<String> ignored = Set.of(
                        "OFFLINE_ACCESS",
                        "UMA_AUTHORIZATION",
                        "DEFAULT-ROLES-ELEARNING-REALM", // adapte si nécessaire
                        "VIEW-PROFILE",
                        "MANAGE-ACCOUNT",
                        "MANAGE-ACCOUNT-LINKS"
                );

                Collection<GrantedAuthority> authorities = roles.stream()
                        .map(Object::toString)
                        .map(String::trim)
                        .map(String::toUpperCase)
                        .map(r -> {
                            // si déjà préfixé ROLE_ -> retirer le préfixe
                            if (r.startsWith("ROLE_")) return r.substring(5);
                            return r;
                        })
                        .filter(r -> !ignored.contains(r))        // filtrer les entrées non utiles
                        .filter(r -> !r.isBlank())                // éliminer vide
                        .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                        .collect(Collectors.toList());

                System.out.println("Mapped authorities = " + authorities);
                return authorities;
            } catch (Exception ex) {
                ex.printStackTrace();
                return Collections.emptyList();
            }
        });

        return converter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
