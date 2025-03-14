# Scripts Directory

This directory contains utility scripts for the project.

## Mock OAuth Server

The mock OAuth server provides a local testing environment for OAuth authentication. It allows you to test the OAuth flow without needing to set up external OAuth providers.

### Getting Started

1. Make the script executable (if not already):
   ```bash
   chmod +x scripts/mock-oauth-server.js
   ```

2. Start the mock OAuth server:
   ```bash
   npm run mock:oauth
   ```

   This will start the server on http://localhost:3333.

### Server Endpoints

- **Authorization Endpoint**: `http://localhost:3333/oauth/authorize`
- **Token Endpoint**: `http://localhost:3333/oauth/token`
- **User Info Endpoint**: `http://localhost:3333/oauth/userinfo`
- **OpenID Configuration**: `http://localhost:3333/.well-known/openid-configuration`

### Test Accounts

The mock OAuth server comes with two predefined test accounts:

1. **Regular User**:
   - Email: `test@example.com`
   - Password: `password`

2. **Admin User**:
   - Email: `admin@example.com`
   - Password: `password`

### Client Information

- **Client ID**: `local-client-id`
- **Client Secret**: `local-client-secret`
- **Redirect URI**: `http://localhost:3000/api/auth/callback/local-oauth`

### Testing the OAuth Flow

1. Start your Next.js application:
   ```bash
   npm run dev
   ```

2. Start the mock OAuth server:
   ```bash
   npm run mock:oauth
   ```

3. Navigate to the sign-in page of your application

4. Click on the "Sign In with Local OAuth" button

5. You will be redirected to the mock OAuth server's login page

6. Enter the credentials for one of the test accounts

7. After successful authentication, you will be redirected back to your application

### Implementation Details

The mock OAuth server implements the standard OAuth 2.0 authorization code flow:

1. Authorization request
2. User authentication
3. Authorization code issuance
4. Token exchange
5. Resource access

All data is stored in-memory and will be lost when the server is restarted.

### Customization

You can customize the server behavior by editing the `scripts/mock-oauth-server.js` file:

- Add more test users
- Change the client credentials
- Modify the token expiration times
- Add additional scopes
- Implement additional OAuth features

### Troubleshooting

If you encounter any issues with the mock OAuth server:

1. Make sure both the Next.js app and mock OAuth server are running
2. Check the console logs for both servers
3. Verify that the client configuration in your auth.ts matches the server configuration
4. Ensure network connectivity between the two servers if running in different environments
