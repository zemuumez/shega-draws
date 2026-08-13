// Package crypto provides cryptographic helpers for the commit-reveal fairness mechanism.
package crypto

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math/big"
)

// GenerateSeed creates a cryptographically secure 32-byte random seed as a hex string.
// This seed is kept secret until draw day.
func GenerateSeed() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("generating seed: %w", err)
	}
	return hex.EncodeToString(b), nil
}

// SHA256Hex returns the lowercase hex-encoded SHA-256 hash of the input string.
func SHA256Hex(input string) string {
	h := sha256.Sum256([]byte(input))
	return hex.EncodeToString(h[:])
}

// DeriveWinningNumber deterministically derives a two-digit winning number ("00"–"99")
// for a specific draw rank using the revealed seed.
//
// Algorithm: winning_number = ParseHex(SHA-256("seed:drawID:rank")[0:8]) % 100
// This is reproducible by any third party given the seed.
func DeriveWinningNumber(seed, drawID string, rank int) string {
	input := fmt.Sprintf("%s:%s:%d", seed, drawID, rank)
	hash := SHA256Hex(input)
	// Take first 8 hex chars → 4 bytes → uint32
	hexSlice := hash[:8]
	n := new(big.Int)
	n.SetString(hexSlice, 16)
	mod := new(big.Int).Mod(n, big.NewInt(100))
	return fmt.Sprintf("%02d", mod.Int64())
}

// VerifyCommitment checks that SHA-256(seed) == commitment.
// Players use this to confirm the draw was not manipulated.
func VerifyCommitment(seed, commitment string) bool {
	return SHA256Hex(seed) == commitment
}
