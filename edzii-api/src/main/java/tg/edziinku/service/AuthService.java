package tg.edziinku.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tg.edziinku.config.AppProperties;
import tg.edziinku.domain.NotificationPreference;
import tg.edziinku.domain.RefreshToken;
import tg.edziinku.domain.Role;
import tg.edziinku.domain.UserAccount;
import tg.edziinku.dto.Dtos;
import tg.edziinku.repo.NeighborhoodRepository;
import tg.edziinku.repo.PreferenceRepository;
import tg.edziinku.repo.RefreshTokenRepository;
import tg.edziinku.repo.UserRepository;
import tg.edziinku.security.AuthUser;
import tg.edziinku.security.JwtService;
import tg.edziinku.web.ApiException;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository users;
    private final PreferenceRepository preferences;
    private final RefreshTokenRepository refreshTokens;
    private final NeighborhoodRepository neighborhoods;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ViewMapper mapper;
    private final AppProperties properties;
    private final GoogleIdentityService googleIdentity;
    private final SecureRandom random = new SecureRandom();

    public AuthService(
            UserRepository users,
            PreferenceRepository preferences,
            RefreshTokenRepository refreshTokens,
            NeighborhoodRepository neighborhoods,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            ViewMapper mapper,
            AppProperties properties,
            GoogleIdentityService googleIdentity
    ) {
        this.users = users;
        this.preferences = preferences;
        this.refreshTokens = refreshTokens;
        this.neighborhoods = neighborhoods;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.mapper = mapper;
        this.properties = properties;
        this.googleIdentity = googleIdentity;
    }

    @Transactional
    public Dtos.AuthResponse register(Dtos.RegisterRequest request) {
        String email = blankToNull(request.email());
        String phone = normalizePhone(request.phone());
        if (email == null && phone == null) {
            throw new ApiException(400, "Indiquez un e-mail ou un numéro de téléphone");
        }
        assertPassword(request.password());
        if (email != null && users.findByEmailIgnoreCase(email).isPresent()) {
            throw new ApiException(409, "Un compte existe déjà avec cet e-mail");
        }
        if (phone != null && users.findByPhone(phone).isPresent()) {
            throw new ApiException(409, "Un compte existe déjà avec ce numéro");
        }
        UserAccount user = new UserAccount();
        user.setEmail(email == null ? null : email.toLowerCase(Locale.ROOT));
        user.setPhone(phone);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setDisplayName(request.displayName().trim());
        user.setRole(Role.CITOYEN);
        user.setLanguage("fr");
        user.setTheme("dark");
        user.setVerified(false);
        users.save(user);
        NotificationPreference prefs = new NotificationPreference();
        prefs.setUser(user);
        prefs.setPushEnabled(true);
        prefs.setAlertLanguage("fr");
        preferences.save(prefs);
        user.setPreferences(prefs);
        return tokens(user);
    }

    @Transactional
    public Dtos.AuthResponse login(Dtos.LoginRequest request) {
        String id = request.identifier().trim();
        UserAccount user = id.contains("@")
                ? users.findByEmailIgnoreCase(id).orElse(null)
                : users.findByPhone(normalizePhone(id)).orElse(null);
        if (user == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(401, "Identifiants invalides");
        }
        return tokens(user);
    }

    @Transactional
    public Dtos.AuthResponse refresh(String rawToken) {
        RefreshToken stored = refreshTokens.findByTokenHash(sha256(rawToken))
                .orElseThrow(() -> new ApiException(401, "Session expirée"));
        if (stored.isRevoked() || stored.getExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(401, "Session expirée");
        }
        stored.setRevoked(true);
        return tokens(stored.getUser());
    }

    @Transactional
    public void logout(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        refreshTokens.findByTokenHash(sha256(rawToken)).ifPresent(token -> token.setRevoked(true));
    }

    @Transactional
    public Dtos.AuthResponse google(String idToken) {
        if (properties.getGoogle().getClientId() == null || properties.getGoogle().getClientId().isBlank()) {
            throw new ApiException(503, "Google OAuth n’est pas encore configuré (GOOGLE_CLIENT_ID)");
        }
        GoogleIdentityService.Profile profile = googleIdentity.verify(idToken);
        UserAccount user = users.findByGoogleSub(profile.sub()).orElse(null);
        if (user == null && profile.email() != null) {
            user = users.findByEmailIgnoreCase(profile.email()).orElse(null);
            if (user != null) {
                user.setGoogleSub(profile.sub());
            }
        }
        if (user == null) {
            user = new UserAccount();
            user.setEmail(profile.email());
            user.setGoogleSub(profile.sub());
            user.setDisplayName(profile.name() == null ? "Citoyen" : profile.name());
            user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setRole(Role.CITOYEN);
            user.setLanguage("fr");
            user.setTheme("dark");
            user.setVerified(true);
            users.save(user);
            NotificationPreference prefs = new NotificationPreference();
            prefs.setUser(user);
            prefs.setPushEnabled(true);
            prefs.setAlertLanguage("fr");
            preferences.save(prefs);
        }
        return tokens(user);
    }

    @Transactional(readOnly = true)
    public Dtos.ProfileCard profile(AuthUser current) {
        UserAccount user = load(current.id());
        return new Dtos.ProfileCard(
                mapper.user(user),
                mapper.preferences(user.getPreferences()),
                user.getNeighborhoods().stream().map(mapper::neighborhood).toList()
        );
    }

    @Transactional
    public Dtos.ProfileCard updateProfile(AuthUser current, Dtos.ProfileUpdate update) {
        UserAccount user = load(current.id());
        if (update.displayName() != null && !update.displayName().isBlank()) {
            user.setDisplayName(update.displayName().trim());
        }
        if (update.language() != null) {
            user.setLanguage(language(update.language()));
        }
        return profile(current);
    }

    @Transactional
    public Dtos.UserCard updateTheme(AuthUser current, String theme) {
        if (!"dark".equals(theme) && !"light".equals(theme)) {
            throw new ApiException(400, "Thème attendu : dark ou light");
        }
        UserAccount user = load(current.id());
        user.setTheme(theme);
        return mapper.user(user);
    }

    @Transactional
    public Dtos.PreferenceCard updateChannels(AuthUser current, Dtos.ChannelsRequest request) {
        UserAccount user = load(current.id());
        NotificationPreference prefs = user.getPreferences();
        if (prefs == null) {
            prefs = new NotificationPreference();
            prefs.setUser(user);
            preferences.save(prefs);
            user.setPreferences(prefs);
        }
        prefs.setPushEnabled(request.pushEnabled());
        prefs.setWhatsappEnabled(request.whatsappEnabled());
        prefs.setSmsEnabled(request.smsEnabled());
        prefs.setNightAlerts(request.nightAlerts());
        prefs.setAlertLanguage(language(request.alertLanguage()));
        return mapper.preferences(prefs);
    }

    @Transactional
    public Dtos.ProfileCard updateNeighborhoods(AuthUser current, Dtos.NeighborhoodsRequest request) {
        UserAccount user = load(current.id());
        user.getNeighborhoods().clear();
        for (UUID id : request.neighborhoodIds()) {
            user.getNeighborhoods().add(neighborhoods.findById(id)
                    .orElseThrow(() -> new ApiException(404, "Quartier introuvable")));
        }
        return profile(current);
    }

    private Dtos.AuthResponse tokens(UserAccount user) {
        String access = jwtService.issueAccess(user.getId(), user.getRole(), user.getDisplayName());
        String refresh = newRefresh(user);
        return new Dtos.AuthResponse(access, refresh, jwtService.accessTtlSeconds(), mapper.user(user));
    }

    private String newRefresh(UserAccount user) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash(sha256(raw));
        token.setExpiresAt(Instant.now().plusSeconds(properties.getJwt().getRefreshTtlSeconds()));
        token.setRevoked(false);
        refreshTokens.save(token);
        return raw;
    }

    private UserAccount load(UUID id) {
        return users.findById(id).orElseThrow(() -> new ApiException(401, "Compte introuvable"));
    }

    private void assertPassword(String password) {
        boolean letter = password.codePoints().anyMatch(Character::isLetter);
        boolean digit = password.codePoints().anyMatch(Character::isDigit);
        if (!letter || !digit) {
            throw new ApiException(400, "Le mot de passe doit contenir une lettre et un chiffre");
        }
    }

    private String language(String value) {
        if ("fr".equals(value) || "ewe".equals(value) || "both".equals(value)) {
            return value;
        }
        throw new ApiException(400, "Langue attendue : fr, ewe ou both");
    }

    static String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    static String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return null;
        }
        String trimmed = phone.trim().replace(" ", "").replace("-", "");
        if (!trimmed.startsWith("+") && trimmed.startsWith("228")) {
            trimmed = "+" + trimmed;
        }
        return trimmed;
    }

    static String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }
}
