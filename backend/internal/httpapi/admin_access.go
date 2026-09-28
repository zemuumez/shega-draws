package httpapi

// Explicitly enumerate permissions. Unknown routes/roles fail closed.
func adminAllowed(role, method, kind string) bool {
	if role != "admin" && role != "reviewer" {
		return false
	}
	if method == "GET" {
		switch kind {
		case "session", "templates", "rounds", "draws", "orders", "legacy", "results", "messages":
			return true
		case "overview", "users", "operations", "audit", "advertisers":
			return role == "admin"
		}
	}
	if method == "PUT" && role == "admin" {
		switch kind {
		case "templates", "rounds", "payments", "legacy", "results", "messages", "advertisers", "operations":
			return true
		}
	}
	return false
}
