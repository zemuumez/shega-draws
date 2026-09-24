FROM golang:1.26.8-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o /out/api ./cmd/server && \
    CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o /out/migrate ./cmd/migrate && \
    CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o /out/admin ./cmd/admin
FROM alpine:3.23
RUN apk add --no-cache ca-certificates && addgroup -g 10001 rimna && adduser -D -u 10001 -G rimna rimna && mkdir /data && chown rimna:rimna /data
COPY --from=build /out/ /app/
USER 10001:10001
WORKDIR /app
ENV LISTEN_ADDR=:8080 MEDIA_DIR=/data/private-media
EXPOSE 8080
CMD ["/app/api"]
