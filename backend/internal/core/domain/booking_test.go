package domain

import "testing"

func TestBookingStatusTransitions(t *testing.T) {
	t.Parallel()

	tests := []struct {
		from BookingStatus
		to   BookingStatus
		want bool
	}{
		{BookingStatusNew, BookingStatusConfirmed, true},
		{BookingStatusNew, BookingStatusCancelled, true},
		{BookingStatusConfirmed, BookingStatusCompleted, true},
		{BookingStatusCompleted, BookingStatusNew, true},
		{BookingStatusCancelled, BookingStatusNew, true},
		{BookingStatusCompleted, BookingStatusCancelled, false},
		{BookingStatusNew, BookingStatusNew, false},
	}

	for _, test := range tests {
		if got := test.from.CanTransitionTo(test.to); got != test.want {
			t.Errorf("%q.CanTransitionTo(%q) = %v, want %v", test.from, test.to, got, test.want)
		}
	}
}
