# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install git and build essentials
RUN apk add --no-cache git ca-certificates tzdata

# Cache Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build statically linked binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/bin/server ./cmd/server

# Final stage
FROM alpine:3.20

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

# Copy binary from builder
COPY --from=builder /app/bin/server /app/server
COPY --from=builder /app/migrations /app/migrations

# Create directory for keys
RUN mkdir -p /app/keys

EXPOSE 8080

ENTRYPOINT ["/app/server"]
