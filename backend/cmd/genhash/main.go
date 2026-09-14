package main

import (
	"fmt"
	"io"
	"os"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	input, err := io.ReadAll(io.LimitReader(os.Stdin, 75))
	if err != nil {
		fmt.Fprintln(os.Stderr, "Could not read password from standard input")
		os.Exit(1)
	}
	password := strings.TrimSuffix(strings.TrimSuffix(string(input), "\n"), "\r")
	if len(password) < 12 || len(password) > 72 {
		fmt.Fprintln(os.Stderr, "Use an admin password between 12 and 72 bytes")
		os.Exit(1)
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(hash))
}
