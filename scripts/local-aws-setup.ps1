# Setup AWS environment variables for LocalStack/DynamoDB-local
$env:AWS_ACCESS_KEY_ID = "test"
$env:AWS_SECRET_ACCESS_KEY = "test"
$env:AWS_DEFAULT_REGION = "us-east-2"

# Wait for LocalStack S3 to be ready
Write-Host "Waiting for LocalStack S3..."
$ready = $false
while (-not $ready) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4566/_localstack/health" -ErrorAction Stop
        if ($response.services.s3 -eq "running" -or $response.services.s3 -eq "available") {
            $ready = $true
        }
    } catch {
        # not ready yet
    }
    if (-not $ready) { Start-Sleep -Seconds 2 }
}
Write-Host "LocalStack S3 Ready"

# Create S3 bucket
Write-Host "Creating LocalStack S3 bucket: fragments"
aws --endpoint-url=http://localhost:4566 s3api create-bucket `
    --bucket fragments `
    --create-bucket-configuration LocationConstraint=us-east-2

# Create DynamoDB table
Write-Host "Creating DynamoDB-Local table: fragments"
aws --endpoint-url=http://localhost:8000 dynamodb create-table `
    --table-name fragments `
    --attribute-definitions AttributeName=ownerId,AttributeType=S AttributeName=id,AttributeType=S `
    --key-schema AttributeName=ownerId,KeyType=HASH AttributeName=id,KeyType=RANGE `
    --billing-mode PAY_PER_REQUEST

# Wait for table to be active
aws --endpoint-url=http://localhost:8000 dynamodb wait table-exists --table-name fragments
Write-Host "DynamoDB Table Ready"
