package tg.edziinku.security;

import tg.edziinku.domain.Role;

import java.util.UUID;

public record AuthUser(UUID id, Role role, String displayName, String email) {
}
