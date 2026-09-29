package env

import (
	"os"
	"strings"
)

// Load reads .env from local development paths if present,
// and sets any environment variables that are not already set in the process.
func Load() {
	candidates := []string{".env", "backend/.env", "../backend/.env", "../.env"}
	for _, path := range candidates {
		data, err := os.ReadFile(path)
		if err == nil {
			for _, line := range strings.Split(string(data), "\n") {
				line = strings.TrimSpace(line)
				if line == "" || strings.HasPrefix(line, "#") {
					continue
				}
				parts := strings.SplitN(line, "=", 2)
				if len(parts) == 2 {
					key := strings.TrimSpace(parts[0])
					val := strings.TrimSpace(parts[1])
					val = strings.Trim(val, `"'`)
					if os.Getenv(key) == "" {
						os.Setenv(key, val)
					}
				}
			}
			return
		}
	}
}
