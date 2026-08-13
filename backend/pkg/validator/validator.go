// Package validator wraps go-playground/validator for structured validation.
package validator

import (
	"errors"
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

// ValidationError holds a map of field → error message for client responses.
type ValidationError struct {
	Fields map[string]string `json:"fields"`
}

func (e *ValidationError) Error() string {
	msgs := make([]string, 0, len(e.Fields))
	for f, m := range e.Fields {
		msgs = append(msgs, fmt.Sprintf("%s: %s", f, m))
	}
	return strings.Join(msgs, "; ")
}

var validate = validator.New()

// Validate runs struct validation and returns a ValidationError if invalid.
func Validate(s interface{}) error {
	if err := validate.Struct(s); err != nil {
		var valErrs validator.ValidationErrors
		if !errors.As(err, &valErrs) {
			return err
		}
		fields := make(map[string]string, len(valErrs))
		for _, fe := range valErrs {
			field := strings.ToLower(fe.Field())
			fields[field] = fieldMessage(fe)
		}
		return &ValidationError{Fields: fields}
	}
	return nil
}

// IsValidationError returns true if the error is a ValidationError.
func IsValidationError(err error) (*ValidationError, bool) {
	var ve *ValidationError
	if errors.As(err, &ve) {
		return ve, true
	}
	return nil, false
}

func fieldMessage(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "this field is required"
	case "min":
		return fmt.Sprintf("minimum length is %s", fe.Param())
	case "max":
		return fmt.Sprintf("maximum length is %s", fe.Param())
	case "e164":
		return "must be a valid phone number (e.g. +251911223344)"
	case "oneof":
		return fmt.Sprintf("must be one of: %s", fe.Param())
	case "gt":
		return fmt.Sprintf("must be greater than %s", fe.Param())
	default:
		return fmt.Sprintf("failed validation: %s", fe.Tag())
	}
}
