package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	password := "Admin@1234!" // Change this to your desired superadmin password
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		panic(err)
	}
	fmt.Printf("Password: %s\nBcrypt hash: %s\n", password, hash)
}
