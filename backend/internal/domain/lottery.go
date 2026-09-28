package domain

import (
	"strings"
	"time"
)

// Percentages use basis points (100 = 1%) and money uses integer minor units.
// Rules are copied into a round and frozen on its first opening.
type Deduction struct {
	Label string `json:"label"`
	BPS   int64  `json:"bps"`
}
type LotteryRules struct {
	Deductions []Deduction `json:"deductions"`
	PrizeBPS   []int64     `json:"prizeBps"`
}

func (r LotteryRules) Valid() bool {
	if len(r.Deductions) > 10 || len(r.PrizeBPS) != 10 {
		return false
	}
	var deductions, prizes int64
	labels := map[string]bool{}
	for _, d := range r.Deductions {
		label := strings.TrimSpace(d.Label)
		key := strings.ToLower(label)
		if label == "" || len(label) > 80 || labels[key] || d.BPS < 0 || d.BPS >= 10000 {
			return false
		}
		labels[key] = true
		deductions += d.BPS
	}
	for _, p := range r.PrizeBPS {
		if p <= 0 || p > 10000 {
			return false
		}
		prizes += p
	}
	return deductions < 10000 && prizes == 10000
}

// Net is a projection. Each disclosed deduction is rounded down to a minor
// unit; the remainder stays in the prize fund. Settlement approval is separate.
func (r LotteryRules) Net(gross int64) int64 {
	net := gross
	for _, d := range r.Deductions {
		net -= gross * d.BPS / 10000
	}
	return net
}

type LotterySettings struct {
	Title      string       `json:"title"`
	Currency   string       `json:"currency"`
	PriceMinor int64        `json:"priceMinor"`
	Capacity   int          `json:"capacity"`
	Rules      LotteryRules `json:"rules"`
}

func (s LotterySettings) Valid() bool {
	return len(strings.TrimSpace(s.Title)) > 0 && len(s.Title) <= 160 && (s.Currency == "ETB" || s.Currency == "USD") && s.PriceMinor > 0 && s.PriceMinor <= 100000000 && s.Capacity >= 10 && s.Capacity <= 100000 && s.Rules.Valid()
}

type LotteryTemplate struct {
	LotterySettings
	ID      string `json:"id"`
	Version int    `json:"version"`
	Active  bool   `json:"active"`
}
type RoundCommand struct {
	LotterySettings
	Version         int       `json:"version"`
	Action          string    `json:"action"`
	TemplateID      string    `json:"templateId"`
	TemplateVersion int       `json:"templateVersion"`
	Deadline        time.Time `json:"deadline"`
	LiveVideoURL    string    `json:"liveVideoUrl"`
}
type AdminRound struct {
	Draw
	TemplateID      string        `json:"templateId"`
	TemplateVersion int           `json:"templateVersion"`
	Version         int           `json:"version"`
	Rules           *LotteryRules `json:"rules"`
	State           string        `json:"state"`
	StartedAt       *time.Time    `json:"startedAt"`
	ClosedAt        *time.Time    `json:"closedAt"`
	Sold            int           `json:"sold"`
	Occupied        int           `json:"occupied"`
	Remaining       int           `json:"remaining"`
	CurrentNetMinor *int64        `json:"currentNetMinor"`
	MaximumNetMinor *int64        `json:"maximumNetMinor"`
}
