package tg.edziinku.service;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tg.edziinku.config.AppProperties;
import tg.edziinku.web.ApiException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
public class MediaStorage {

    private final Path root;

    public MediaStorage(AppProperties properties) throws IOException {
        this.root = Path.of(properties.getStorage().getDir()).toAbsolutePath().normalize();
        Files.createDirectories(root);
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        try {
            return store(file.getBytes());
        } catch (IOException ex) {
            throw new ApiException(400, "Impossible de lire la photo");
        }
    }

    public String store(byte[] bytes) {
        String ext = sniff(bytes);
        String name = UUID.randomUUID() + ext;
        try {
            Files.write(root.resolve(name), bytes);
            return name;
        } catch (IOException ex) {
            throw new ApiException(500, "Impossible d’enregistrer la photo");
        }
    }

    public Resource load(String filename) {
        if (filename == null || !filename.matches("[a-zA-Z0-9._-]+")) {
            throw new ApiException(404, "Fichier introuvable");
        }
        Path path = root.resolve(filename).normalize();
        if (!path.startsWith(root) || !Files.isRegularFile(path)) {
            throw new ApiException(404, "Fichier introuvable");
        }
        return new FileSystemResource(path);
    }

    private String sniff(byte[] bytes) {
        if (bytes.length >= 3 && (bytes[0] & 0xFF) == 0xFF && (bytes[1] & 0xFF) == 0xD8 && (bytes[2] & 0xFF) == 0xFF) {
            return ".jpg";
        }
        if (bytes.length >= 8
                && bytes[0] == (byte) 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47) {
            return ".png";
        }
        if (bytes.length >= 12
                && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') {
            return ".webp";
        }
        throw new ApiException(400, "La photo doit être un JPEG, un PNG ou un WebP");
    }
}
