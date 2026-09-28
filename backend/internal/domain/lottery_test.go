package domain

import "testing"

func TestLotteryRuleValidation(t *testing.T) {
	valid := func() LotteryRules {
		return LotteryRules{Deductions: []Deduction{{"Operations", 1500}, {"Other", 500}}, PrizeBPS: []int64{3500, 2000, 1200, 800, 600, 500, 400, 400, 300, 300}}
	}
	if !valid().Valid() {
		t.Fatal("valid rules rejected")
	}
	for _, change := range []func(*LotteryRules){
		func(r *LotteryRules) { r.PrizeBPS[9] = 299 }, func(r *LotteryRules) { r.PrizeBPS[0] = 0 },
		func(r *LotteryRules) { r.PrizeBPS = r.PrizeBPS[:9] }, func(r *LotteryRules) { r.Deductions[0].BPS = -1 },
		func(r *LotteryRules) { r.Deductions[0].BPS = 9500 }, func(r *LotteryRules) { r.Deductions[1].Label = "operations" },
		func(r *LotteryRules) { r.Deductions[0].Label = " " },
	} {
		r := valid()
		change(&r)
		if r.Valid() {
			t.Fatalf("invalid rules accepted: %+v", r)
		}
	}
	r := valid()
	if r.Net(62500000) != 50000000 || r.Net(1) != 1 || r.Net(0) != 0 {
		t.Fatal("incorrect minor-unit projection")
	}
	settings := LotterySettings{Title: "Weekly", Currency: "ETB", PriceMinor: 100000000, Capacity: 100000, Rules: r}
	if !settings.Valid() || r.Net(int64(settings.Capacity)*settings.PriceMinor) != 8000000000000 {
		t.Fatal("bounds or overflow")
	}
	settings.Capacity = 9
	if settings.Valid() {
		t.Fatal("capacity below ten accepted")
	}
}
