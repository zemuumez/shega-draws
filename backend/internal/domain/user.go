// Package domain contains the core business entities of the Shega Draws platform.
// This layer has zero external dependencies — it is the heart of clean architecture.
package domain

import (
	"time"

	"github.com/google/uuid"
)

// Role represents a user's permission level in the system.
type Role string

const (
	RolePlayer     Role = "player"
	RoleAdmin      Role = "admin"
	RoleSuperAdmin Role = "superadmin"
)

// roleOrder maps roles to a numeric weight for comparison.
var roleOrder = map[Role]int{
	RolePlayer:     0,
	RoleAdmin:      1,
	RoleSuperAdmin: 2,
}

// AtLeast returns true if r has at least the same privilege level as min.
func (r Role) AtLeast(min Role) bool {
	return roleOrder[r] >= roleOrder[min]
}

// User is the core user entity.
type User struct {
	ID           uuid.UUID  `json:"id"`
	Name         string     `json:"name"`
	Phone        string     `json:"phone"`
	Role         Role       `json:"role"`
	PasswordHash *string    `json:"-"` // Only set for admin/superadmin
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// IsAdmin returns true if the user has admin or higher privileges.
func (u *User) IsAdmin() bool {
	return u.Role.AtLeast(RoleAdmin)
}

// IsSuperAdmin returns true if the user has superadmin privileges.
func (u *User) IsSuperAdmin() bool {
	return u.Role == RoleSuperAdmin
}
