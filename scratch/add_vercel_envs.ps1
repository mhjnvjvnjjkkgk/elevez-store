# Add Firebase Environment Variables to Vercel
$envs = @(
    @{ name = "VITE_FIREBASE_API_KEY"; value = "AIzaSyCCrE4ikRxLf2fF6ujdhwOcKGfuGRnMBMw" },
    @{ name = "VITE_FIREBASE_AUTH_DOMAIN"; value = "elevez-ed97f.firebaseapp.com" },
    @{ name = "VITE_FIREBASE_PROJECT_ID"; value = "elevez-ed97f" },
    @{ name = "VITE_FIREBASE_STORAGE_BUCKET"; value = "elevez-ed97f.firebasestorage.app" },
    @{ name = "VITE_FIREBASE_MESSAGING_SENDER_ID"; value = "440636781018" },
    @{ name = "VITE_FIREBASE_APP_ID"; value = "1:440636781018:web:24d9b6d31d5aee537850e3" },
    @{ name = "VITE_FIREBASE_MEASUREMENT_ID"; value = "G-1H0YRD521H" }
)

foreach ($env in $envs) {
    Write-Host "Setting environment variable: $($env.name)" -ForegroundColor Cyan
    foreach ($target in @("production", "preview", "development")) {
        Write-Host "  To environment: $target"
        # Echo the value into the vercel env add command
        $env.value | vercel env add $env.name $target --force
    }
}

Write-Host "All environment variables successfully added to Vercel!" -ForegroundColor Green
