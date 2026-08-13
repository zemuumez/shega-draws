package redis

// Re-export NewRateLimiter for use in the delivery layer.
// This avoids circular imports by keeping all Redis infrastructure in this package.

// NewRateLimiter is already defined in rate_limiter.go.
// This file exists to document the public surface of the redis package.
