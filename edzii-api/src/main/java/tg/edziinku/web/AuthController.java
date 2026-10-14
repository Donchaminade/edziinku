package tg.edziinku.web;

import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tg.edziinku.dto.Dtos;
import tg.edziinku.security.AuthUser;
import tg.edziinku.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/register")
    Dtos.AuthResponse register(@Valid @RequestBody Dtos.RegisterRequest request) {
        return auth.register(request);
    }

    @PostMapping("/login")
    Dtos.AuthResponse login(@Valid @RequestBody Dtos.LoginRequest request) {
        return auth.login(request);
    }

    @PostMapping("/refresh")
    Dtos.AuthResponse refresh(@Valid @RequestBody Dtos.RefreshRequest request) {
        return auth.refresh(request.refreshToken());
    }

    @PostMapping("/logout")
    void logout(@RequestBody(required = false) Dtos.RefreshRequest request, @AuthenticationPrincipal AuthUser user) {
        auth.logout(request == null ? null : request.refreshToken());
    }

    @PostMapping("/google")
    Dtos.AuthResponse google(@Valid @RequestBody Dtos.GoogleRequest request) {
        return auth.google(request.idToken());
    }
}
