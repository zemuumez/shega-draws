package handler

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"image"
	"image/png"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shega-draws/backend/internal/delivery/http/middleware"
	"github.com/shega-draws/backend/internal/domain"
	"github.com/shega-draws/backend/internal/infrastructure/postgres"
	"github.com/shega-draws/backend/internal/repository"
	"github.com/shega-draws/backend/internal/usecase"
	pkgjwt "github.com/shega-draws/backend/pkg/jwt"
	"golang.org/x/crypto/bcrypt"
)

type testUsers struct {
	repository.UserRepository
	users map[uuid.UUID]*domain.User
}

func (r *testUsers) Create(_ context.Context, u *domain.User) (*domain.User, error) {
	r.users[u.ID] = u
	return u, nil
}
func (r *testUsers) FindByID(_ context.Context, id uuid.UUID) (*domain.User, error) {
	if u := r.users[id]; u != nil {
		return u, nil
	}
	return nil, domain.ErrUserNotFound
}
func (r *testUsers) FindByPhone(_ context.Context, p string) (*domain.User, error) {
	for _, u := range r.users {
		if u.Phone == p {
			return u, nil
		}
	}
	return nil, domain.ErrUserNotFound
}
func (r *testUsers) ExistsByPhone(ctx context.Context, p string) (bool, error) {
	_, err := r.FindByPhone(ctx, p)
	return err == nil, nil
}

type testDraws struct {
	repository.DrawRepository
	draws map[uuid.UUID]*domain.Draw
}

func (r *testDraws) FindByID(_ context.Context, id uuid.UUID) (*domain.Draw, error) {
	if d := r.draws[id]; d != nil {
		return d, nil
	}
	return nil, domain.ErrDrawNotFound
}
func (r *testDraws) FindActive(_ context.Context) (*domain.Draw, error) {
	for _, d := range r.draws {
		if d.Status == domain.DrawStatusOpen {
			return d, nil
		}
	}
	return nil, domain.ErrDrawNotFound
}
func (r *testDraws) Create(_ context.Context, d *domain.Draw) (*domain.Draw, error) {
	r.draws[d.ID] = d
	return d, nil
}

type testEntries struct {
	repository.EntryRepository
	entries []*domain.Entry
}

func (r *testEntries) FindAll(_ context.Context, f repository.EntryFilter) ([]*domain.Entry, error) {
	var result []*domain.Entry
	for _, e := range r.entries {
		if f.UserID != nil && e.UserID != *f.UserID {
			continue
		}
		if f.DrawID != nil && e.DrawID != *f.DrawID {
			continue
		}
		result = append(result, e)
	}
	return result, nil
}
func (r *testEntries) Create(_ context.Context, e *domain.Entry) (*domain.Entry, error) {
	r.entries = append(r.entries, e)
	return e, nil
}
func (r *testEntries) IsNumberTaken(_ context.Context, d uuid.UUID, n string) (bool, error) {
	for _, e := range r.entries {
		if e.DrawID == d && e.Number == n && e.Status == domain.EntryStatusConfirmed {
			return true, nil
		}
	}
	return false, nil
}

func (s *testTokens) AllowPlayerLogin(_ context.Context, _ string) (bool, error) { return true, nil }

type testTokens struct {
	mu     sync.Mutex
	tokens map[string]bool
}

func (s *testTokens) StoreRefreshToken(_ context.Context, u, j string, _ time.Duration) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.tokens[u+j] = true
	return nil
}
func (s *testTokens) ConsumeRefreshToken(_ context.Context, u, j string) (bool, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	v := s.tokens[u+j]
	delete(s.tokens, u+j)
	return v, nil
}
func (s *testTokens) RevokeRefreshToken(_ context.Context, u, j string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.tokens, u+j)
	return nil
}

type testUploader struct{ uploads int }

func (s *testUploader) Upload(_ context.Context, _ string, _ []byte, _ string) error {
	s.uploads++
	return nil
}
func (s *testUploader) PresignGetURL(_ context.Context, _ string) (string, error) { return "", nil }

func TestPlayerAccountAndTickets(t *testing.T) {
	ctx := context.Background()
	var users repository.UserRepository = &testUsers{users: map[uuid.UUID]*domain.User{}}
	var draws repository.DrawRepository = &testDraws{draws: map[uuid.UUID]*domain.Draw{}}
	var entries repository.EntryRepository = &testEntries{}
	// Optional isolated PostgreSQL run exercises the real migrations and SQL queries.
	if url := os.Getenv("PLAYER_TEST_DATABASE_URL"); url != "" {
		pool, err := pgxpool.New(ctx, url)
		if err != nil {
			t.Fatal(err)
		}
		defer pool.Close()
		schema := "player_test_" + strings.ReplaceAll(uuid.NewString(), "-", "")
		if _, err = pool.Exec(ctx, "CREATE SCHEMA "+schema); err != nil {
			t.Fatal(err)
		}
		defer pool.Exec(ctx, "DROP SCHEMA "+schema+" CASCADE")
		cfg, err := pgxpool.ParseConfig(url)
		if err != nil {
			t.Fatal(err)
		}
		cfg.ConnConfig.RuntimeParams["search_path"] = schema + ",public"
		testPool, err := pgxpool.NewWithConfig(ctx, cfg)
		if err != nil {
			t.Fatal(err)
		}
		defer testPool.Close()
		files, err := filepath.Glob("../../../../migrations/*.sql")
		if err != nil || len(files) == 0 {
			t.Fatal("missing migrations", err)
		}
		for _, file := range files {
			sql, err := os.ReadFile(file)
			if err != nil {
				t.Fatal(err)
			}
			if _, err = testPool.Exec(ctx, string(sql)); err != nil {
				t.Fatalf("%s: %v", file, err)
			}
		}
		users = postgres.NewUserRepository(testPool)
		draws = postgres.NewDrawRepository(testPool)
		entries = postgres.NewEntryRepository(testPool)
	}
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatal(err)
	}
	dir := t.TempDir()
	priv := filepath.Join(dir, "private.pem")
	pub := filepath.Join(dir, "public.pem")
	os.WriteFile(priv, pem.EncodeToMemory(&pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(key)}), 0600)
	os.WriteFile(pub, pem.EncodeToMemory(&pem.Block{Type: "RSA PUBLIC KEY", Bytes: x509.MarshalPKCS1PublicKey(&key.PublicKey)}), 0600)
	manager, err := pkgjwt.NewManager(priv, pub, time.Minute, time.Hour)
	if err != nil {
		t.Fatal(err)
	}
	auth := usecase.NewAuthUseCase(users, manager, &testTokens{tokens: map[string]bool{}}, time.Hour)
	upload := &testUploader{}
	authH := NewAuthHandler(auth, time.Hour)
	entryH := NewEntryHandler(usecase.NewEntryUseCase(entries, draws, upload))
	drawH := NewDrawHandler(usecase.NewDrawUseCase(draws, entries))
	router := chi.NewRouter()
	router.Post("/register", authH.RegisterPlayer)
	router.Post("/login", authH.LoginPlayer)
	router.Post("/refresh", authH.Refresh)
	router.Post("/logout", authH.Logout)
	router.With(middleware.Authenticate(manager)).Get("/me", authH.Me)
	router.With(middleware.Authenticate(manager)).Get("/mine", entryH.GetMyEntries)
	router.With(middleware.Authenticate(manager)).Post("/entries", entryH.SubmitEntry)
	router.Get("/active", drawH.GetActiveDraw)
	call := func(method, path, body, token string, cookie *http.Cookie) *httptest.ResponseRecorder {
		t.Helper()
		r := httptest.NewRequest(method, path, strings.NewReader(body))
		r.Header.Set("Content-Type", "application/json")
		if token != "" {
			r.Header.Set("Authorization", "Bearer "+token)
		}
		if cookie != nil {
			r.AddCookie(cookie)
		}
		w := httptest.NewRecorder()
		router.ServeHTTP(w, r)
		return w
	}
	mustStatus := func(w *httptest.ResponseRecorder, status int) {
		t.Helper()
		if w.Code != status {
			t.Fatalf("status %d, want %d: %s", w.Code, status, w.Body.String())
		}
	}
	type loginResult struct {
		Access string      `json:"access_token"`
		User   domain.User `json:"user"`
	}
	register := func(name, phone string) loginResult {
		t.Helper()
		w := call("POST", "/register", fmt.Sprintf(`{"name":%q,"phone":%q,"pin":"1234"}`, name, phone), "", nil)
		mustStatus(w, 201)
		var result loginResult
		if err := json.Unmarshal(w.Body.Bytes(), &result); err != nil {
			t.Fatal(err)
		}
		return result
	}
	alice := register("Alice Player", "0911 234 567")
	bob := register("Bob Player", "+251922334455")
	if alice.User.Phone != "+251911234567" {
		t.Fatal("phone not normalized")
	}
	stored, _ := users.FindByID(ctx, alice.User.ID)
	if stored.PasswordHash == nil || bcrypt.CompareHashAndPassword([]byte(*stored.PasswordHash), []byte("1234")) != nil {
		t.Fatal("PIN not hashed")
	}
	mustStatus(call("POST", "/register", `{"name":"Duplicate","phone":"+251911234567","pin":"1234"}`, "", nil), 409)
	mustStatus(call("POST", "/register", `{"name":"Bad PIN","phone":"+251933445566","pin":"12ab"}`, "", nil), 422)
	mustStatus(call("POST", "/login", `{"phone":"0911234567","pin":"9999"}`, "", nil), 401)
	mustStatus(call("POST", "/login", `{"phone":"0911234567","pin":"-123"}`, "", nil), 422)
	w := call("POST", "/login", `{"phone":"0911234567","pin":"1234"}`, "", nil)
	mustStatus(w, 200)
	cookies := w.Result().Cookies()
	if len(cookies) != 1 || !cookies[0].HttpOnly {
		t.Fatal("missing secure refresh cookie")
	}
	refresh := cookies[0]
	mustStatus(call("GET", "/me", "", alice.Access, nil), 200)
	mustStatus(call("GET", "/me", "", "token_forged", nil), 401)
	mustStatus(call("GET", "/me", "", refresh.Value, nil), 401)
	mustStatus(call("POST", "/refresh", "", "", &http.Cookie{Name: "refresh_token", Value: alice.Access}), 401)
	mustStatus(call("POST", "/refresh", "", "", nil), 401)
	w = call("POST", "/refresh", "", "", refresh)
	mustStatus(w, 200)
	rotated := w.Result().Cookies()[0]
	mustStatus(call("POST", "/refresh", "", "", refresh), 401)
	w = call("POST", "/logout", "", "", rotated)
	mustStatus(w, 200)
	if w.Result().Cookies()[0].Path != refresh.Path {
		t.Fatal("logout cookie path mismatch")
	}
	mustStatus(call("POST", "/refresh", "", "", rotated), 401)
	// An admin's password must never authenticate through player login.
	hash, _ := bcrypt.GenerateFromPassword([]byte("1234"), bcrypt.MinCost)
	hashString := string(hash)
	admin, err := users.Create(ctx, &domain.User{ID: uuid.New(), Name: "Admin", Phone: "+251944556677", Role: domain.RoleAdmin, PasswordHash: &hashString, CreatedAt: time.Now(), UpdatedAt: time.Now()})
	if err != nil {
		t.Fatal(err)
	}
	mustStatus(call("POST", "/login", fmt.Sprintf(`{"phone":%q,"pin":"1234"}`, admin.Phone), "", nil), 401)
	old := &domain.Draw{ID: uuid.New(), DrawID: "PAST", SanityID: "past", Status: domain.DrawStatusRevealed, Deadline: time.Now().Add(-time.Hour), CreatedAt: time.Now().Add(-2 * time.Hour), TicketPrice: 100}
	current := &domain.Draw{ID: uuid.New(), DrawID: "CURRENT", SanityID: "current", Status: domain.DrawStatusOpen, Deadline: time.Now().Add(time.Hour), CreatedAt: time.Now(), TicketPrice: 100}
	for _, d := range []*domain.Draw{old, current} {
		if _, err := draws.Create(ctx, d); err != nil {
			t.Fatal(err)
		}
	}
	for i, item := range []struct {
		u uuid.UUID
		d uuid.UUID
	}{{alice.User.ID, old.ID}, {alice.User.ID, current.ID}, {bob.User.ID, current.ID}} {
		_, err := entries.Create(ctx, &domain.Entry{ID: uuid.New(), UserID: item.u, DrawID: item.d, Number: fmt.Sprintf("%02d", i), Amount: 100, Method: domain.PaymentMethodBank, PaymentReference: fmt.Sprintf("REF%06d", i), ProofKey: "private-proof", Status: domain.EntryStatusConfirmed, CreatedAt: time.Now()})
		if err != nil {
			t.Fatal(err)
		}
	}
	mustStatus(call("GET", "/mine?phone="+bob.User.Phone, "", "", nil), 401)
	mustStatus(call("GET", "/mine?draw_id=bad", "", alice.Access, nil), 400)
	w = call("GET", "/mine?phone="+bob.User.Phone+"&user_id="+bob.User.ID.String(), "", alice.Access, nil)
	mustStatus(w, 200)
	var history []domain.Entry
	if err := json.Unmarshal(w.Body.Bytes(), &history); err != nil {
		t.Fatal(err)
	}
	if len(history) != 2 {
		t.Fatalf("want current and past tickets, got %d", len(history))
	}
	for _, e := range history {
		if e.UserID != alice.User.ID {
			t.Fatal("other player's ticket leaked")
		}
	}
	if strings.Contains(w.Body.String(), "private-proof") {
		t.Fatal("proof key leaked")
	}
	w = call("GET", "/mine?draw_id="+current.ID.String(), "", alice.Access, nil)
	mustStatus(w, 200)
	json.Unmarshal(w.Body.Bytes(), &history)
	if len(history) != 1 {
		t.Fatal("draw filter failed")
	}
	w = call("GET", "/mine?draw_id="+uuid.NewString(), "", alice.Access, nil)
	mustStatus(w, 200)
	if strings.TrimSpace(w.Body.String()) != "[]" {
		t.Fatal("empty history must be an array")
	}
	activeResponse := call("GET", "/active", "", "", nil)
	mustStatus(activeResponse, 200)
	var active domain.Draw
	json.Unmarshal(activeResponse.Body.Bytes(), &active)
	if active.TicketPrice != 100 || len(active.TakenNumbers) != 2 {
		t.Fatal("active price or availability missing")
	}
	if strings.Contains(activeResponse.Body.String(), alice.User.Phone) {
		t.Fatal("active draw leaks personal data")
	}
	submissionNumber := 0
	submit := func(drawID uuid.UUID, number, amount, method string) *httptest.ResponseRecorder {
		submissionNumber++
		var body bytes.Buffer
		form := multipart.NewWriter(&body)
		for k, v := range map[string]string{"draw_id": drawID.String(), "number": number, "amount": amount, "method": method, "payment_reference": fmt.Sprintf("NEWREF%06d", submissionNumber), "user_id": bob.User.ID.String(), "user_phone": bob.User.Phone} {
			form.WriteField(k, v)
		}
		part, _ := form.CreateFormFile("proof", "receipt.png")
		png.Encode(part, image.NewRGBA(image.Rect(0, 0, 1, 1)))
		form.Close()
		r := httptest.NewRequest("POST", "/entries", &body)
		r.Header.Set("Content-Type", form.FormDataContentType())
		r.Header.Set("Authorization", "Bearer "+alice.Access)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, r)
		return w
	}
	mustStatus(submit(current.ID, "AB", "100", "bank"), 422)
	mustStatus(submit(current.ID, "-1", "100", "bank"), 422)
	mustStatus(submit(current.ID, "07", "1", "bank"), 422)
	mustStatus(submit(current.ID, "07", "100", "card"), 422)
	mustStatus(submit(old.ID, "07", "100", "bank"), 400)
	if upload.uploads != 0 {
		t.Fatal("invalid purchase uploaded proof")
	}
	w = submit(current.ID, "07", "100", "bank")
	mustStatus(w, 201)
	var bought domain.Entry
	json.Unmarshal(w.Body.Bytes(), &bought)
	if bought.UserID != alice.User.ID || bought.Status != domain.EntryStatusPending {
		t.Fatal("purchase ownership or pending status incorrect")
	}
	w = call("GET", "/mine", "", alice.Access, nil)
	mustStatus(w, 200)
	json.Unmarshal(w.Body.Bytes(), &history)
	if len(history) != 3 {
		t.Fatal("purchase missing from history")
	}
	if os.Getenv("PLAYER_TEST_DATABASE_URL") != "" {
		mustStatus(submit(current.ID, "07", "100", "bank"), 409)
		if err := entries.Reject(ctx, bought.ID, admin.ID); err != nil {
			t.Fatal(err)
		}
		mustStatus(submit(current.ID, "07", "100", "bank"), 201)
	}

}

type blockedTokens struct{ testTokens }

func (s *blockedTokens) AllowPlayerLogin(context.Context, string) (bool, error) { return false, nil }

func TestPlayerLoginLimit(t *testing.T) {
	auth := NewAuthHandler(usecase.NewAuthUseCase(nil, nil, &blockedTokens{}, time.Hour), time.Hour)
	request := httptest.NewRequest("POST", "/login", strings.NewReader(`{"phone":"0911234567","pin":"1234"}`))
	response := httptest.NewRecorder()
	auth.LoginPlayer(response, request)
	if response.Code != http.StatusTooManyRequests || response.Header().Get("Retry-After") != "900" {
		t.Fatalf("expected account rate limit: %d", response.Code)
	}
}

func TestExpiredDrawUnavailable(t *testing.T) {
	draw := &domain.Draw{ID: uuid.New(), Status: domain.DrawStatusOpen, Deadline: time.Now().Add(-time.Minute)}
	repo := &testDraws{draws: map[uuid.UUID]*domain.Draw{draw.ID: draw}}
	handler := NewDrawHandler(usecase.NewDrawUseCase(repo, nil))
	response := httptest.NewRecorder()
	handler.GetActiveDraw(response, httptest.NewRequest("GET", "/active", nil))
	if response.Code != http.StatusNotFound {
		t.Fatalf("expired draw offered for sale: %d", response.Code)
	}
}
