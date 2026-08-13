// Package storage provides S3-compatible object storage for proof images.
package storage

import (
	"bytes"
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/config"
)

// S3Uploader wraps AWS S3 / MinIO for proof image management.
type S3Uploader struct {
	client         *s3.Client
	presignClient  *s3.PresignClient
	bucket         string
	presignExpiry  time.Duration
}

// NewS3Uploader creates an S3Uploader configured for S3-compatible storage (incl. MinIO).
func NewS3Uploader(endpoint, accessKey, secretKey, bucket, region string, usePathStyle bool, presignExpiry time.Duration) (*S3Uploader, error) {
	customResolver := aws.EndpointResolverWithOptionsFunc(func(service, reg string, opts ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL:               endpoint,
			SigningRegion:     region,
			HostnameImmutable: usePathStyle,
		}, nil
	})

	cfg, err := config.LoadDefaultConfig(context.Background(),
		config.WithRegion(region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
		config.WithEndpointResolverWithOptions(customResolver),
	)
	if err != nil {
		return nil, fmt.Errorf("loading S3 config: %w", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = usePathStyle
	})

	return &S3Uploader{
		client:        client,
		presignClient: s3.NewPresignClient(client),
		bucket:        bucket,
		presignExpiry: presignExpiry,
	}, nil
}

// Upload stores an object in S3 with the given key and content type.
func (u *S3Uploader) Upload(ctx context.Context, key string, data []byte, contentType string) error {
	_, err := u.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(u.bucket),
		Key:         aws.String(key),
		Body:        bytes.NewReader(data),
		ContentType: aws.String(contentType),
		// Prevent public access — images only accessible via pre-signed URLs
		ACL: "private",
	})
	if err != nil {
		return fmt.Errorf("uploading to S3: %w", err)
	}
	return nil
}

// PresignGetURL generates a temporary, time-limited URL to view a proof image.
func (u *S3Uploader) PresignGetURL(ctx context.Context, key string) (string, error) {
	req, err := u.presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(u.bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(u.presignExpiry))
	if err != nil {
		return "", fmt.Errorf("pre-signing URL: %w", err)
	}
	return req.URL, nil
}
