$ErrorActionPreference = "Stop"

$PROJECT_ID="g-acharaf-prod-" + (Get-Random -Minimum 1000 -Maximum 9999)
$BILLING_ACCOUNT="0132BA-2F2A10-4E9960"
$REGION="europe-west9"
$SA_NAME="github-actions-sa"
$REPO_NAME="groupe-acharaf-repo"
$POOL_NAME="github-actions-pool"
$PROVIDER_NAME="github-provider"
$GITHUB_REPO="hamzaboulida/Groupe-Acharaf-last"
$GITHUB_REPO2="hamzaboulida/Groupe-Acharaf"

Write-Host "Creating project $PROJECT_ID..."
gcloud.cmd projects create $PROJECT_ID --name="Groupe Acharaf Prod"
gcloud.cmd config set project $PROJECT_ID

Write-Host "Linking billing..."
gcloud.cmd billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT

Write-Host "Enabling APIs (this may take a minute)..."
gcloud.cmd services enable run.googleapis.com artifactregistry.googleapis.com iamcredentials.googleapis.com cloudresourcemanager.googleapis.com cloudbuild.googleapis.com

Write-Host "Creating Artifact Registry..."
gcloud.cmd artifacts repositories create $REPO_NAME --repository-format=docker --location=$REGION --description="Docker repository for Groupe Acharaf"

Write-Host "Creating Service Account..."
gcloud.cmd iam service-accounts create $SA_NAME --display-name="GitHub Actions Deploy"
$SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

Start-Sleep -Seconds 10

Write-Host "Granting Roles..."
gcloud.cmd projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:${SA_EMAIL}" --role="roles/run.admin"
gcloud.cmd projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:${SA_EMAIL}" --role="roles/artifactregistry.writer"
gcloud.cmd projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:${SA_EMAIL}" --role="roles/iam.serviceAccountUser"

Write-Host "Creating Workload Identity Pool..."
gcloud.cmd iam workload-identity-pools create $POOL_NAME --location="global" --display-name="GitHub Actions Pool"

Start-Sleep -Seconds 10

$PROJECT_NUMBER = (gcloud.cmd projects describe $PROJECT_ID --format="value(projectNumber)")

Write-Host "Creating Workload Identity Provider..."
gcloud.cmd iam workload-identity-pools providers create-oidc $PROVIDER_NAME --location="global" --workload-identity-pool=$POOL_NAME --display-name="GitHub Provider" --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" --issuer-uri="https://token.actions.githubusercontent.com"

Write-Host "Allowing GitHub repo to impersonate SA..."
gcloud.cmd iam service-accounts add-iam-policy-binding $SA_EMAIL --role="roles/iam.workloadIdentityUser" --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/attribute.repository/${GITHUB_REPO}"
gcloud.cmd iam service-accounts add-iam-policy-binding $SA_EMAIL --role="roles/iam.workloadIdentityUser" --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/attribute.repository/${GITHUB_REPO2}"

Write-Host "============================"
Write-Host "PROJECT_ID: $PROJECT_ID"
Write-Host "WIF_PROVIDER: projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}"
Write-Host "WIF_SERVICE_ACCOUNT: ${SA_EMAIL}"
Write-Host "============================"
