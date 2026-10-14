package tg.edziinku.web;

import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tg.edziinku.dto.Dtos;
import tg.edziinku.security.AuthUser;
import tg.edziinku.service.AuthService;
import tg.edziinku.service.ReportService;

import java.util.List;

@RestController
@RequestMapping("/api/me")
public class MeController {

    private final AuthService auth;
    private final ReportService reports;

    public MeController(AuthService auth, ReportService reports) {
        this.auth = auth;
        this.reports = reports;
    }

    @GetMapping
    Dtos.ProfileCard me(@AuthenticationPrincipal AuthUser user) {
        return auth.profile(user);
    }

    @PutMapping
    Dtos.ProfileCard update(@AuthenticationPrincipal AuthUser user, @Valid @RequestBody Dtos.ProfileUpdate request) {
        return auth.updateProfile(user, request);
    }

    @PutMapping("/theme")
    Dtos.UserCard theme(@AuthenticationPrincipal AuthUser user, @Valid @RequestBody Dtos.ThemeRequest request) {
        return auth.updateTheme(user, request.theme());
    }

    @PutMapping("/channels")
    Dtos.PreferenceCard channels(@AuthenticationPrincipal AuthUser user, @Valid @RequestBody Dtos.ChannelsRequest request) {
        return auth.updateChannels(user, request);
    }

    @PutMapping("/neighborhoods")
    Dtos.ProfileCard neighborhoods(@AuthenticationPrincipal AuthUser user, @Valid @RequestBody Dtos.NeighborhoodsRequest request) {
        return auth.updateNeighborhoods(user, request);
    }

    @GetMapping("/reports")
    List<Dtos.ReportCard> reports(@AuthenticationPrincipal AuthUser user) {
        return reports.mine(user.id());
    }
}
