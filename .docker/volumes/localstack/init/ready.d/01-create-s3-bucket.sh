#!/bin/bash

# Create S3 bucket for recipe images
echo "Creating S3 bucket for recipe images..."
awslocal s3api create-bucket --bucket test-bucket --region us-east-1

# Set proper bucket permissions (optional)
echo "Setting bucket ACL..."
awslocal s3api put-bucket-acl --bucket test-bucket --acl private

# Create test objects to verify bucket is working
echo "Creating test object in S3 bucket..."
echo "This is a test file" > /tmp/test.txt
awslocal s3api put-object --bucket test-bucket --key test.txt --body /tmp/test.txt --content-type text/plain

# Verify bucket was created
echo "Listing S3 buckets:"
awslocal s3api list-buckets

# Verify object was created
echo "Listing objects in test-bucket:"
awslocal s3api list-objects --bucket test-bucket

echo "S3 bucket initialization complete." 