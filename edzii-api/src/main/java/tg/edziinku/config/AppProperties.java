package tg.edziinku.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "edzii")
public class AppProperties {

    private String env = "dev";
    private String publicWebUrl = "http://localhost:5173";
    private final Jwt jwt = new Jwt();
    private final Cors cors = new Cors();
    private final Google google = new Google();
    private final Whatsapp whatsapp = new Whatsapp();
    private final Storage storage = new Storage();
    private final Weather weather = new Weather();

    public String getEnv() {
        return env;
    }

    public void setEnv(String env) {
        this.env = env;
    }

    public String getPublicWebUrl() {
        return publicWebUrl;
    }

    public void setPublicWebUrl(String publicWebUrl) {
        this.publicWebUrl = publicWebUrl;
    }

    public Jwt getJwt() {
        return jwt;
    }

    public Cors getCors() {
        return cors;
    }

    public Google getGoogle() {
        return google;
    }

    public Whatsapp getWhatsapp() {
        return whatsapp;
    }

    public Storage getStorage() {
        return storage;
    }

    public Weather getWeather() {
        return weather;
    }

    public boolean isDev() {
        return !"prod".equalsIgnoreCase(env);
    }

    public static class Jwt {
        private String secret;
        private long accessTtlSeconds = 900;
        private long refreshTtlSeconds = 604800;

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public long getAccessTtlSeconds() {
            return accessTtlSeconds;
        }

        public void setAccessTtlSeconds(long accessTtlSeconds) {
            this.accessTtlSeconds = accessTtlSeconds;
        }

        public long getRefreshTtlSeconds() {
            return refreshTtlSeconds;
        }

        public void setRefreshTtlSeconds(long refreshTtlSeconds) {
            this.refreshTtlSeconds = refreshTtlSeconds;
        }
    }

    public static class Cors {
        private String origins = "http://localhost:5173";

        public String getOrigins() {
            return origins;
        }

        public void setOrigins(String origins) {
            this.origins = origins;
        }
    }

    public static class Google {
        private String clientId = "";

        public String getClientId() {
            return clientId;
        }

        public void setClientId(String clientId) {
            this.clientId = clientId;
        }
    }

    public static class Whatsapp {
        private String token = "";
        private String phoneNumberId = "";
        private String verifyToken = "";
        private String appSecret = "";
        private String graphVersion = "v21.0";

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public String getPhoneNumberId() {
            return phoneNumberId;
        }

        public void setPhoneNumberId(String phoneNumberId) {
            this.phoneNumberId = phoneNumberId;
        }

        public String getVerifyToken() {
            return verifyToken;
        }

        public void setVerifyToken(String verifyToken) {
            this.verifyToken = verifyToken;
        }

        public String getAppSecret() {
            return appSecret;
        }

        public void setAppSecret(String appSecret) {
            this.appSecret = appSecret;
        }

        public String getGraphVersion() {
            return graphVersion;
        }

        public void setGraphVersion(String graphVersion) {
            this.graphVersion = graphVersion;
        }

        public boolean isConfigured() {
            return token != null && !token.isBlank() && phoneNumberId != null && !phoneNumberId.isBlank();
        }
    }

    public static class Storage {
        private String dir = "storage/uploads";

        public String getDir() {
            return dir;
        }

        public void setDir(String dir) {
            this.dir = dir;
        }
    }

    public static class Weather {
        private double latitude = 6.1725;
        private double longitude = 1.2314;

        public double getLatitude() {
            return latitude;
        }

        public void setLatitude(double latitude) {
            this.latitude = latitude;
        }

        public double getLongitude() {
            return longitude;
        }

        public void setLongitude(double longitude) {
            this.longitude = longitude;
        }
    }
}
