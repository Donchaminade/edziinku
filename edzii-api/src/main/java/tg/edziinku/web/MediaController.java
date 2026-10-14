package tg.edziinku.web;

import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tg.edziinku.service.MediaStorage;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaStorage storage;

    public MediaController(MediaStorage storage) {
        this.storage = storage;
    }

    @GetMapping("/{filename}")
    ResponseEntity<Resource> file(@PathVariable String filename) {
        Resource resource = storage.load(filename);
        MediaType type = MediaType.APPLICATION_OCTET_STREAM;
        if (filename.endsWith(".png")) {
            type = MediaType.IMAGE_PNG;
        } else if (filename.endsWith(".webp")) {
            type = MediaType.parseMediaType("image/webp");
        } else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
            type = MediaType.IMAGE_JPEG;
        }
        return ResponseEntity.ok().contentType(type).body(resource);
    }
}
