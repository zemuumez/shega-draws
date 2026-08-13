// Package logger provides structured logging via zerolog.
package logger

import (
	"os"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

// Init configures the global zerolog logger.
func Init(isDevelopment bool) {
	zerolog.TimeFieldFormat = time.RFC3339

	if isDevelopment {
		// Pretty-print for local development
		log.Logger = log.Output(zerolog.ConsoleWriter{
			Out:        os.Stderr,
			TimeFormat: "15:04:05",
		})
	} else {
		// JSON for production log aggregation (CloudWatch, Loki, etc.)
		log.Logger = zerolog.New(os.Stderr).With().Timestamp().Logger()
	}
}
