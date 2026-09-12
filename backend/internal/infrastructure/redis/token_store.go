// Package redis contains Redis-backed infrastructure implementations.
package redis

import (
	"context"
	"fmt"
	"time"

	goredis "github.com/redis/go-redis/v9"
	"github.com/rs/zerolog/log"
	"github.com/shega-draws/backend/internal/usecase"
)

type tokenStore struct {
	client *goredis.Client
}

// NewTokenStore constructs a Redis-backed TokenStore for refresh token management.
func NewTokenStore(client *goredis.Client) usecase.TokenStore {
	return &tokenStore{client: client}
}

// key returns the Redis key for a user's refresh token JTI.
// Pattern: refresh_token:{userID}:{tokenID}
func (s *tokenStore) key(userID, tokenID string) string {
	return fmt.Sprintf("refresh_token:%s:%s", userID, tokenID)
}

func (s *tokenStore) StoreRefreshToken(ctx context.Context, userID, tokenID string, ttl time.Duration) error {
	return s.client.Set(ctx, s.key(userID, tokenID), "1", ttl).Err()
}

func (s *tokenStore) ConsumeRefreshToken(ctx context.Context, userID, tokenID string) (bool, error) {
	_, err := s.client.GetDel(ctx, s.key(userID, tokenID)).Result()
	if err == goredis.Nil {
		return false, nil
	}
	return err == nil, err
}

func (s *tokenStore) RevokeRefreshToken(ctx context.Context, userID, tokenID string) error {
	return s.client.Del(ctx, s.key(userID, tokenID)).Err()
}

// NewClient creates a configured Redis client and verifies connectivity.
func NewClient(addr, password string, db int) (*goredis.Client, error) {
	client := goredis.NewClient(&goredis.Options{
		Addr:         addr,
		Password:     password,
		DB:           db,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
		PoolSize:     20,
		MinIdleConns: 5,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("connecting to Redis: %w", err)
	}

	log.Info().Str("addr", addr).Msg("Redis connection established")
	return client, nil
}

// A fixed per-account window prevents bypassing the PIN limit by changing IP.
func (s *tokenStore) AllowPlayerLogin(ctx context.Context, phone string) (bool, error) {
	count, err := s.client.Eval(ctx, `
 local count = redis.call('INCR', KEYS[1])
 if count == 1 then redis.call('EXPIRE', KEYS[1], 900) end
 return count`, []string{"player_login:" + phone}).Int()
	return count <= 5, err
}
