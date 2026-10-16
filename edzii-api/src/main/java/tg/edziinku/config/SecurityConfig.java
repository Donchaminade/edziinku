package tg.edziinku.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import tg.edziinku.security.JwtAuthFilter;
import tg.edziinku.security.SecurityResponses;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final SecurityResponses responses;
    private final AppProperties properties;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, SecurityResponses responses, AppProperties properties) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.responses = responses;
        this.properties = properties;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = corsConfiguration(properties.isDev(), properties.getCors().getOrigins());
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }

    /**
     * Toujours des motifs : {@code setAllowedOrigins} refuse les jokers
     * ({@code https://*.vercel.app}) dès que {@code APP_ENV=prod}.
     */
    static CorsConfiguration corsConfiguration(boolean dev, String originsCsv) {
        CorsConfiguration cors = new CorsConfiguration();
        List<String> patterns = new ArrayList<>();
        if (dev) {
            patterns.add("http://localhost:*");
            patterns.add("http://127.0.0.1:*");
        }
        if (originsCsv != null) {
            Arrays.stream(originsCsv.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .forEach(patterns::add);
        }
        cors.setAllowedOriginPatterns(patterns);
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("*"));
        cors.setAllowCredentials(true);
        cors.setMaxAge(3600L);
        return cors;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(h -> h.frameOptions(f -> f.deny()))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint((req, res, ex) ->
                                responses.write(res, 401, "Authentification requise"))
                        .accessDeniedHandler((req, res, ex) ->
                                responses.write(res, 403, "Accès réservé à la mairie ou à la protection civile"))
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login", "/api/auth/refresh", "/api/auth/google").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/neighborhoods", "/api/neighborhoods/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cities", "/api/cities/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/urgency-levels", "/api/urgency-levels/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/alerts", "/api/alerts/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reports", "/api/reports/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/reports").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/basins", "/api/basins/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/weather/**").permitAll()
                        .requestMatchers("/api/geo/**").permitAll()
                        .requestMatchers("/api/whatsapp/webhook").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/media/**").permitAll()
                        .requestMatchers("/api/admin/**").hasAnyRole("MAIRIE", "PROTECTION_CIVILE")
                        .requestMatchers("/api/me/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
