## Custom Domain Setup for Firebase Hosting

To use a custom domain with your Firebase-hosted website:

### Step 1: Purchase a Domain
If you don't already have a domain, purchase one from a domain registrar like:
- Google Domains
- Namecheap
- GoDaddy
- Cloudflare

### Step 2: Add Custom Domain to Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. In the left sidebar, click "Hosting"
4. Click "Add Custom Domain"
5. Enter your domain name (e.g., `www.yourstore.com` or `yourstore.com`)
6. Choose if you want to redirect all users to one domain version (recommended: redirect to `www.yourstore.com`)

### Step 3: Verify Domain Ownership

Firebase will provide you with DNS records to verify your domain ownership:
1. **TXT Record**: For verification
2. **A Records**: For directing traffic to Firebase servers

### Step 4: Update DNS Records

1. Go to your domain registrar's DNS management panel
2. Add the TXT record provided by Firebase for verification
3. Add the A records for directing traffic to Firebase servers
4. If you're using a subdomain like `www`, you'll also need to add a CNAME record

### Step 5: Wait for SSL Certificate Provisioning

Firebase will automatically provision an SSL certificate for your domain:
1. This process usually takes a few minutes to a few hours
2. Firebase will send you an email when the certificate is provisioned
3. Your site will be available over HTTPS automatically

### Step 6: Test Your Custom Domain

1. Visit your custom domain in a browser
2. Verify that your site loads correctly
3. Check that HTTPS is working properly

### Example DNS Configuration

For a domain like `example.com`, Firebase might provide records like:

```
Type: A
Name: @
Value: 199.36.158.100

Type: TXT
Name: @
Value: firebase=your-verification-string

Type: CNAME
Name: www
Value: your-project-id.firebaseapp.com
```

### Troubleshooting Custom Domain Issues

1. **Domain Not Verified**: 
   - Double-check that you've added the TXT record correctly
   - DNS changes can take up to 48 hours to propagate

2. **Site Not Loading**:
   - Verify A records are pointing to the correct Firebase IP addresses
   - Check that there are no conflicting DNS records

3. **SSL Certificate Issues**:
   - Ensure your domain is properly verified
   - Check that your DNS records are correct
   - Contact Firebase support if issues persist after 24 hours

### Redirecting Non-www to www (or vice versa)

Firebase Hosting allows you to redirect traffic from one version of your domain to another:
1. During the custom domain setup, choose your preferred domain version
2. Firebase will automatically set up the redirect
3. All traffic will be redirected to your preferred version

### Using Both www and Non-www Versions

If you want both `www.yourstore.com` and `yourstore.com` to work:
1. Add both domains in the Firebase Hosting console
2. Set up one as the primary domain
3. Configure redirects as needed

### Advanced Configuration

For more advanced configurations, you can modify the `firebase.json` file:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "redirects": [
      {
        "source": "/old-page",
        "destination": "/new-page",
        "type": 301
      }
    ],
    "headers": [
      {
        "source": "/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=300"
          }
        ]
      }
    ],
    "cleanUrls": true
  }
}
```