package tg.edziinku.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int LIMIT = 30;
    private static final long WINDOW_SECONDS = 60;

    private final SecurityResponses responses;
    private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();

    public RateLimitFilter(SecurityResponses responses) {
        this.responses = responses;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (!limited(request)) {
            filterChain.doFilter(request, response);
            return;
        }
        String key = clientKey(request) + "|" + request.getRequestURI();
        long now = Instant.now().getEpochSecond();
        Deque<Long> deque = hits.computeIfAbsent(key, ignored -> new ArrayDeque<>());
        synchronized (deque) {
            while (!deque.isEmpty() && now - deque.peekFirst() >= WINDOW_SECONDS) {
                deque.removeFirst();
            }
            if (deque.size() >= LIMIT) {
                responses.write(response, 429, "Trop de tentatives. Réessayez dans une minute.");
                return;
            }
            deque.addLast(now);
        }
        filterChain.doFilter(request, response);
    }

    private boolean limited(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return false;
        }
        String path = request.getRequestURI();
        return path.endsWith("/api/auth/login")
                || path.endsWith("/api/auth/register")
                || path.equals("/api/reports");
    }

    private String clientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
    }
}
