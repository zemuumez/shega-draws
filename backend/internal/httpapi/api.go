package httpapi

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"golang.org/x/sync/singleflight"
	"io"
	"log/slog"
	"net"
	"net/http"
	"net/mail"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"rimna/backend/internal/domain"
	"rimna/backend/internal/service"
	"rimna/backend/internal/store"
	"strconv"
	"strings"
	"sync"
	"time"
)

type Identity interface {
	Verify(context.Context, string) (domain.User, error)
}
type cacheEntry struct {
	Data  []byte
	Until time.Time
}
type API struct {
	Store            *store.Store
	Service          *service.Service
	Auth             Identity
	Origin, MediaDir string
	TrustedProxies   []*net.IPNet
	MetricsToken     string
	metrics          metrics
	mu               sync.Mutex
	flights          singleflight.Group
	cache            map[string]cacheEntry
	gate             chan struct{}
}

func (a *API) Handler() http.Handler {
	a.cache = map[string]cacheEntry{}
	a.metrics.samples = map[string]*sample{}
	a.gate = make(chan struct{}, 256)
	m := http.NewServeMux()
	m.HandleFunc("GET /metrics", a.serveMetrics)
	m.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) { reply(w, 200, map[string]bool{"ok": true}) })
	m.HandleFunc("GET /readyz", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), time.Second)
		defer cancel()
		if a.Store.DB.Ping(ctx) != nil {
			reply(w, 503, map[string]string{"error": "database unavailable"})
			return
		}
		reply(w, 200, map[string]bool{"ok": true})
	})
	m.HandleFunc("GET /v1/draws", func(w http.ResponseWriter, r *http.Request) {
		a.cached(w, r, "draws", func() (any, error) { return a.Store.Draws(r.Context()) })
	})
	m.HandleFunc("GET /v1/draws/{id}/availability", a.availability)
	m.HandleFunc("GET /v1/results", func(w http.ResponseWriter, r *http.Request) {
		a.cached(w, r, "results", func() (any, error) { return a.Store.JSONList(r.Context(), "results", 0) })
	})
	m.HandleFunc("GET /v1/payment-methods", func(w http.ResponseWriter, r *http.Request) {
		out := []string{}
		for name, p := range a.Service.Providers {
			if p.Supports(r.URL.Query().Get("currency")) {
				out = append(out, name)
			}
		}
		reply(w, 200, out)
	})
	m.HandleFunc("POST /v1/orders", a.authenticated(a.purchase))
	m.HandleFunc("GET /v1/orders", a.authenticated(a.orders))
	m.HandleFunc("GET /v1/orders/{id}", a.authenticated(a.order))
	m.HandleFunc("POST /v1/webhooks/chapa", a.webhook)
	m.HandleFunc("POST /v1/contact", a.message)
	m.HandleFunc("POST /v1/subscribe", a.message)
	m.HandleFunc("GET /v1/admin/{kind}", a.authenticated(a.admin))
	m.HandleFunc("PUT /v1/admin/{kind}/{id}", a.authenticated(a.admin))
	m.HandleFunc("GET /v1/admin/media/{id}", a.authenticated(a.media))
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if recover() != nil {
				slog.Error("request panic", "request_id", w.Header().Get("X-Request-ID"))
				reply(w, 500, map[string]string{"error": "Request failed"})
			}
		}()
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Cache-Control", "no-store")
		w.Header().Set("X-Request-ID", service.ID())
		if o := r.Header.Get("Origin"); o != "" {
			if o != a.Origin {
				reply(w, 403, map[string]string{"error": "Origin not allowed"})
				return
			}
			w.Header().Set("Access-Control-Allow-Origin", a.Origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, Idempotency-Key")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
		}
		if r.Method == "OPTIONS" {
			w.WriteHeader(204)
			return
		}
		select {
		case a.gate <- struct{}{}:
			defer func() { <-a.gate }()
		default:
			w.Header().Set("Retry-After", "2")
			reply(w, 503, map[string]string{"error": "Busy, please retry shortly"})
			return
		}
		r.Body = http.MaxBytesReader(w, r.Body, 64<<10)
		ctx, cancel := context.WithTimeout(r.Context(), 20*time.Second)
		defer cancel()
		inner := r.WithContext(ctx)
		defer func() { r.Pattern = inner.Pattern }()
		m.ServeHTTP(w, inner)
	})
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { a.observe(w, r, handler) })
}
func reply(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
func fail(w http.ResponseWriter, err error) {
	status := 503
	message := "Service temporarily unavailable"
	switch {
	case errors.Is(err, domain.ErrInvalid):
		status = 400
		message = err.Error()
	case errors.Is(err, domain.ErrNotFound):
		status = 404
		message = err.Error()
	case errors.Is(err, domain.ErrPaused):
		status = 503
		message = err.Error()
		w.Header().Set("Retry-After", "30")
	case errors.Is(err, domain.ErrClosed), errors.Is(err, domain.ErrConflict):
		status = 409
		message = err.Error()
	case errors.Is(err, domain.ErrRate):
		status = 429
		message = err.Error()
		w.Header().Set("Retry-After", "60")
	case errors.Is(err, domain.ErrUnavailable):
		message = err.Error()
	default:
		slog.Error("request failed")
	}
	reply(w, status, map[string]string{"error": message})
}
func decode(r *http.Request, v any) error {
	if !strings.HasPrefix(r.Header.Get("Content-Type"), "application/json") {
		return domain.ErrInvalid
	}
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if dec.Decode(v) != nil {
		return domain.ErrInvalid
	}
	if err := dec.Decode(new(any)); err != io.EOF {
		return domain.ErrInvalid
	}
	return nil
}
func offset(r *http.Request) int {
	n, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	if n < 0 || n > 1000000 {
		return 0
	}
	return n
}
func (a *API) authenticated(next func(http.ResponseWriter, *http.Request, domain.User)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		h := r.Header.Get("Authorization")
		if !strings.HasPrefix(h, "Bearer ") || len(h) > 8192 {
			reply(w, 401, map[string]string{"error": "Sign in to continue"})
			return
		}
		u, err := a.Auth.Verify(r.Context(), strings.TrimPrefix(h, "Bearer "))
		if err != nil || !u.Verified || !a.Store.SessionActive(r.Context(), u) {
			reply(w, 401, map[string]string{"error": "Sign in with a verified account"})
			return
		}
		if r.Method != "GET" {
			if err = a.Store.Rate(r.Context(), "user:"+u.ID, 30); err != nil {
				fail(w, err)
				return
			}
		}
		next(w, r, u)
	}
}
func (a *API) cached(w http.ResponseWriter, r *http.Request, key string, load func() (any, error)) {
	value, err, _ := a.flights.Do(key, func() (any, error) {
		a.mu.Lock()
		c, ok := a.cache[key]
		a.mu.Unlock()
		if ok && time.Now().Before(c.Until) {
			return c.Data, nil
		}
		v, err := load()
		if err != nil {
			return nil, err
		}
		b, err := json.Marshal(v)
		if err != nil {
			return nil, err
		}
		a.mu.Lock()
		if len(a.cache) > 2048 {
			a.cache = map[string]cacheEntry{}
		}
		a.cache[key] = cacheEntry{Data: b, Until: time.Now().Add(3 * time.Second)}
		a.mu.Unlock()
		return b, nil
	})
	if err != nil {
		fail(w, err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=3")
	w.Write(value.([]byte))
}
func (a *API) availability(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if len(id) > 100 {
		fail(w, domain.ErrInvalid)
		return
	}
	from, _ := strconv.Atoi(r.URL.Query().Get("from"))
	if from < 1 {
		from = 1
	}
	if from > 100000 {
		fail(w, domain.ErrInvalid)
		return
	}
	from = ((from-1)/100)*100 + 1
	a.cached(w, r, id+":"+strconv.Itoa(from), func() (any, error) { return a.Store.Availability(r.Context(), id, from, from+99) })
}
func (a *API) purchase(w http.ResponseWriter, r *http.Request, u domain.User) {
	var p domain.Purchase
	if err := decode(r, &p); err != nil {
		fail(w, err)
		return
	}
	o, err := a.Service.Purchase(r.Context(), u, r.Header.Get("Idempotency-Key"), p)
	if err != nil {
		fail(w, err)
		return
	}
	reply(w, 201, o)
}
func (a *API) orders(w http.ResponseWriter, r *http.Request, u domain.User) {
	o, err := a.Store.Orders(r.Context(), u.ID, offset(r), false)
	if err != nil {
		fail(w, err)
		return
	}
	reply(w, 200, o)
}
func (a *API) order(w http.ResponseWriter, r *http.Request, u domain.User) {
	o, err := a.Store.Order(r.Context(), r.PathValue("id"))
	if err != nil {
		fail(w, err)
		return
	}
	if o.UserID != u.ID {
		fail(w, domain.ErrNotFound)
		return
	}
	reply(w, 200, o)
}
func (a *API) webhook(w http.ResponseWriter, r *http.Request) {
	p := a.Service.Providers["chapa"]
	body, err := io.ReadAll(r.Body)
	if err != nil {
		fail(w, domain.ErrInvalid)
		return
	}
	if p == nil || !p.AuthenticateWebhook(body, r.Header.Get("X-Chapa-Signature")) {
		reply(w, 401, map[string]string{"error": "Invalid signature"})
		return
	}
	ref, err := p.WebhookReference(body)
	if err != nil {
		fail(w, err)
		return
	}
	sum := sha256.Sum256(body)
	if err = a.Store.Webhook(r.Context(), p.Name(), hex.EncodeToString(sum[:]), ref.MerchantReference, ref.ProviderReference); err != nil {
		fail(w, err)
		return
	}
	reply(w, 200, map[string]bool{"received": true})
}

var telegram = regexp.MustCompile(`^@[a-zA-Z][a-zA-Z0-9_]{4,31}$`)

func (a *API) message(w http.ResponseWriter, r *http.Request) {
	host := a.clientIP(r)
	sum := sha256.Sum256([]byte(host))
	if err := a.Store.Rate(r.Context(), "contact:"+hex.EncodeToString(sum[:]), 10); err != nil {
		fail(w, err)
		return
	}
	var data map[string]string
	if err := decode(r, &data); err != nil {
		fail(w, err)
		return
	}
	kind := "contact"
	id := service.ID()
	if r.URL.Path == "/v1/subscribe" {
		kind = "subscription"
		contact := strings.TrimSpace(data["contact"])
		_, err := mail.ParseAddress(contact)
		if len(contact) > 254 || (!telegram.MatchString(contact) && err != nil) {
			fail(w, domain.ErrInvalid)
			return
		}
		h := sha256.Sum256([]byte(strings.ToLower(contact)))
		id = "sub-" + hex.EncodeToString(h[:])
	} else {
		if len(strings.TrimSpace(data["message"])) < 1 || len(data["message"]) > 5000 || len(data["name"]) > 120 || len(data["phone"]) < 7 || len(data["phone"]) > 30 || len(data["email"]) > 254 || len(data["topic"]) > 100 {
			fail(w, domain.ErrInvalid)
			return
		}
	}
	raw, _ := json.Marshal(data)
	if err := a.Store.Message(r.Context(), id, kind, raw); err != nil {
		fail(w, err)
		return
	}
	reply(w, 201, map[string]bool{"success": true})
}
func (a *API) admin(w http.ResponseWriter, r *http.Request, u domain.User) {
	role, err := a.Store.Staff(r.Context(), u.ID)
	if err != nil {
		reply(w, 403, map[string]string{"error": "Staff access required"})
		return
	}
	kind := r.PathValue("kind")
	if !adminAllowed(role, r.Method, kind) {
		reply(w, 403, map[string]string{"error": "You do not have permission for this operation"})
		return
	}
	if r.Method == "GET" {
		if kind == "users" || kind == "overview" || kind == "rounds" || kind == "templates" {
			if err = a.Store.Rate(r.Context(), "admin-read:"+u.ID, 60); err != nil {
				fail(w, err)
				return
			}
		}
		var out any
		if kind == "session" {
			out = map[string]string{"role": role, "userId": u.ID}
		} else if kind == "overview" {
			out, err = a.Store.AdminOverview(r.Context())
		} else if kind == "users" {
			out, err = a.Store.AdminUsers(r.Context(), r.URL.Query().Get("q"), offset(r))
		} else if kind == "operations" {
			out, err = a.Store.Operations(r.Context())
		} else if kind == "orders" {
			out, err = a.Store.Orders(r.Context(), "", offset(r), true)
		} else if kind == "templates" {
			out, err = a.Store.Templates(r.Context(), offset(r))
		} else if kind == "rounds" {
			out, err = a.Store.Rounds(r.Context(), offset(r))
		} else if kind == "draws" {
			out, err = a.Store.AdminDraws(r.Context(), offset(r))
		} else {
			out, err = a.Store.JSONList(r.Context(), kind, offset(r))
		}
		if err != nil {
			fail(w, err)
			return
		}
		reply(w, 200, out)
		return
	}
	if role != "admin" {
		reply(w, 403, map[string]string{"error": "Administrator access required"})
		return
	}
	if kind == "operations" {
		switch r.PathValue("id") {
		case "sales":
			var input struct {
				Paused bool   `json:"paused"`
				Reason string `json:"reason"`
			}
			err = decode(r, &input)
			if err == nil {
				err = a.Store.SetSalesPaused(r.Context(), u.ID, input.Paused, input.Reason)
			}
		case "backup":
			var input struct{}
			err = decode(r, &input)
			if err == nil {
				err = a.Store.RequestBackup(r.Context(), u.ID, service.ID())
			}
		default:
			err = domain.ErrNotFound
		}
	} else if kind == "payments" {
		var input struct {
			Reference string `json:"reference"`
		}
		err = decode(r, &input)
		if err == nil && (len(input.Reference) > 128 || input.Reference == "") {
			err = domain.ErrInvalid
		}
		if err == nil {
			var o domain.Order
			o, err = a.Store.Order(r.Context(), r.PathValue("id"))
			if err == nil {
				if o.Provider == "legacy" || (o.ProviderReference != "" && o.ProviderReference != input.Reference) {
					err = domain.ErrConflict
				} else {
					o.ProviderReference = input.Reference
					err = a.Service.Reconcile(r.Context(), o)
					if err == nil {
						err = a.Store.Audit(r.Context(), u.ID, "payment.recheck", o.ID)
					}
				}
			}
		}
	} else if kind == "templates" {
		var input domain.LotteryTemplate
		if err = decode(r, &input); err == nil {
			if input.ID != r.PathValue("id") {
				err = domain.ErrInvalid
			} else {
				err = a.Store.SaveTemplate(r.Context(), u.ID, input)
			}
		}
	} else if kind == "rounds" {
		var input domain.RoundCommand
		if err = decode(r, &input); err == nil {
			err = a.Store.SaveRound(r.Context(), u.ID, r.PathValue("id"), input)
		}
	} else {
		var data json.RawMessage
		err = decode(r, &data)
		if err == nil {
			err = a.Store.AdminWrite(r.Context(), u.ID, kind, r.PathValue("id"), data)
		}
	}
	if err != nil {
		fail(w, err)
		return
	}
	a.mu.Lock()
	a.cache = map[string]cacheEntry{}
	a.mu.Unlock()
	reply(w, 200, map[string]bool{"success": true})
}
func safeLink(s string) bool {
	u, err := url.Parse(s)
	return err == nil && u.Scheme == "https" && u.Host != "" && u.User == nil
}
func (a *API) media(w http.ResponseWriter, r *http.Request, u domain.User) {
	if _, err := a.Store.Staff(r.Context(), u.ID); err != nil {
		reply(w, 403, map[string]string{"error": "Staff access required"})
		return
	}
	id := r.PathValue("id")
	if !regexp.MustCompile(`^[a-f0-9]{64}$`).MatchString(id) {
		fail(w, domain.ErrInvalid)
		return
	}
	f, err := os.Open(filepath.Join(a.MediaDir, id))
	if err != nil {
		fail(w, domain.ErrNotFound)
		return
	}
	defer f.Close()
	stat, err := f.Stat()
	if err != nil {
		fail(w, err)
		return
	}
	w.Header().Set("Content-Disposition", `attachment; filename="receipt-`+id+`"`)
	w.Header().Set("Content-Type", "application/octet-stream")
	http.ServeContent(w, r, "receipt", stat.ModTime(), f)
}

// Only an explicitly trusted proxy may supply X-Real-IP. Configure that proxy
// to overwrite this header, and prevent clients reaching the API directly.
func (a *API) clientIP(r *http.Request) string {
	host, _, _ := net.SplitHostPort(r.RemoteAddr)
	remote := net.ParseIP(host)
	for _, network := range a.TrustedProxies {
		if network.Contains(remote) {
			if ip := net.ParseIP(r.Header.Get("X-Real-IP")); ip != nil {
				return ip.String()
			}
			break
		}
	}
	return host
}
