package config

import (
	"os"
	"time"

	"github.com/kelseyhightower/envconfig"
	"github.com/rs/zerolog/log"
)

// Config holds all application configuration sourced from environment variables.
type Config struct {
	// App
	AppEnv  string `envconfig:"APP_ENV" default:"development"`
	AppPort string `envconfig:"APP_PORT" default:"8080"`

	// Database
	DatabaseURL string `envconfig:"DATABASE_URL" required:"true"`

	// Redis
	RedisAddr     string `envconfig:"REDIS_ADDR" required:"true"`
	RedisPassword string `envconfig:"REDIS_PASSWORD" default:""`
	RedisDB       int    `envconfig:"REDIS_DB" default:"0"`

	// JWT
	JWTPrivateKeyPath    string        `envconfig:"JWT_PRIVATE_KEY_PATH" required:"true"`
	JWTPublicKeyPath     string        `envconfig:"JWT_PUBLIC_KEY_PATH" required:"true"`
	JWTAccessTokenExpiry time.Duration `envconfig:"JWT_ACCESS_TOKEN_EXPIRY" default:"15m"`
	JWTRefreshTokenExpiry time.Duration `envconfig:"JWT_REFRESH_TOKEN_EXPIRY" default:"168h"`

	// Superadmin seed
	SuperAdminPhone        string `envconfig:"SUPERADMIN_PHONE" required:"true"`
	SuperAdminPasswordHash string `envconfig:"SUPERADMIN_PASSWORD_HASH" required:"true"`

	// S3 / MinIO
	S3Endpoint      string        `envconfig:"S3_ENDPOINT" required:"true"`
	S3AccessKey     string        `envconfig:"S3_ACCESS_KEY" required:"true"`
	S3SecretKey     string        `envconfig:"S3_SECRET_KEY" required:"true"`
	S3Bucket        string        `envconfig:"S3_BUCKET" default:"shega-draws-proofs"`
	S3Region        string        `envconfig:"S3_REGION" default:"us-east-1"`
	S3UsePathStyle  bool          `envconfig:"S3_USE_PATH_STYLE" default:"true"`
	S3PresignExpiry time.Duration `envconfig:"S3_PRESIGN_EXPIRY" default:"15m"`

	// CORS
	CORSAllowedOrigins string `envconfig:"CORS_ALLOWED_ORIGINS" default:"http://localhost:3000"`

	// Rate limiting
	RateLimitGlobal      int `envconfig:"RATE_LIMIT_GLOBAL" default:"100"`
	RateLimitAuth        int `envconfig:"RATE_LIMIT_AUTH" default:"5"`
	RateLimitEntrySubmit int `envconfig:"RATE_LIMIT_ENTRY_SUBMIT" default:"3"`
}

// Load reads configuration from environment variables.
func Load() (*Config, error) {
	var cfg Config
	if err := envconfig.Process("", &cfg); err != nil {
		return nil, err
	}

	// Verify key files exist
	if _, err := os.Stat(cfg.JWTPrivateKeyPath); err != nil {
		log.Fatal().Str("path", cfg.JWTPrivateKeyPath).Msg("JWT private key file not found")
	}
	if _, err := os.Stat(cfg.JWTPublicKeyPath); err != nil {
		log.Fatal().Str("path", cfg.JWTPublicKeyPath).Msg("JWT public key file not found")
	}

	return &cfg, nil
}

// IsDevelopment returns true when running in development mode.
func (c *Config) IsDevelopment() bool {
	return c.AppEnv == "development"
}
