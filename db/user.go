package db

import (
	"time"
)

type User struct {
	ID              int64     `gorm:"id" json:"id"`
	Email           string    `gorm:"email" json:"email"`
	FirstName       string    `gorm:"first_name" json:"first_name,omitempty"`
	LastName        string    `gorm:"last_name" json:"last_name,omitempty"`
	HashedPassword  string    `gorm:"hashed_password" json:"-"` // "-" to never show in JSON
	UpdatedPassword string    `gorm:"-" json:"updated_password,omitempty"`
	CreatedAt       time.Time `gorm:"created_at" json:"inserted_at"`
	UpdatedAt       time.Time `gorm:"updated_at" json:"updated_at"`
	Role            string    `gorm:"role" json:"role,omitempty"`
	IsAdmin         bool      `json:"is_admin"`
}

func (u *User) Get(id int64) error {
	res := MainDB.Table("users").Where("id = ?", id).First(u)
	return res.Error
}

func (u *User) GetUserByEmail(email string) error {
	res := MainDB.Table("users").Where("email = ?", email).First(u)
	return res.Error
}

func (u *User) Create() error {
	res := MainDB.Table("users").Create(u)
	return res.Error
}

func (u *User) Update() error {
	res := MainDB.Table("users").Save(u)
	return res.Error
}
