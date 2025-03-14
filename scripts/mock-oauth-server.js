#!/usr/bin/env node
/**
 * Mock OAuth2 Server for Local Testing
 *
 * This script creates a simple OAuth2 server that can be used for local testing of your authentication flow.
 * It implements a basic OAuth2 flow with authorization code grant type.
 *
 * Usage:
 * 1. Run this script: node scripts/mock-oauth-server.js
 * 2. Configure the local-oauth provider in your auth.ts file
 * 3. Use the local-oauth provider in your application
 *
 * The server provides endpoints for:
 * - /oauth/authorize - Authorization endpoint
 * - /oauth/token - Token endpoint
 * - /oauth/userinfo - User info endpoint
 *
 * Default credentials:
 * - Client ID: local-client-id
 * - Client Secret: local-client-secret
 *
 * Test Users:
 * - test@example.com / password (regular user)
 * - admin@example.com / password (admin user)
 */

import http from 'http';
import url from 'url';
import crypto from 'crypto';
import querystring from 'querystring';

// Prevent running in production
if (process.env.NODE_ENV === 'production') {
  console.error('ERROR: Mock OAuth server should not be run in production!');
  process.exit(1);
}

// Server configuration
const PORT = process.env.MOCK_OAUTH_PORT || 3333;
const HOST = process.env.MOCK_OAUTH_HOST || 'localhost';

// In-memory storage for authorization codes and tokens
const authCodes = new Map();
const accessTokens = new Map();
const refreshTokens = new Map();

// Registered client
const CLIENT = {
  id: 'local-client-id',
  secret: 'local-client-secret',
  redirectUris: [
    'http://localhost:3000/api/auth/callback/local-oauth',
    'http://127.0.0.1:3000/api/auth/callback/local-oauth'
  ]
};

// Mock users database
const USERS = [
  {
    id: '1',
    email: 'test@example.com',
    password: 'password',
    name: 'Test User',
    role: 'user'
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: 'password',
    name: 'Admin User',
    role: 'admin'
  }
];

// Generate random string for security tokens
function generateRandomString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Find user by email and password
function authenticateUser(email, password) {
  return USERS.find(user => user.email === email && user.password === password);
}

// Find user by ID
function findUserById(id) {
  return USERS.find(user => user.id === id);
}

// HTML template for the login page
function renderLoginPage(clientId, redirectUri, state, scope, responseType) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Local OAuth Server - Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.5;
            max-width: 500px;
            margin: 0 auto;
            padding: 2rem 1rem;
            color: #333;
          }
          .container {
            border: 1px solid #ccc;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            margin-top: 0;
            font-size: 1.5rem;
            color: #111;
          }
          .form-group {
            margin-bottom: 1rem;
          }
          label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
          }
          input {
            width: 100%;
            padding: 0.5rem;
            font-size: 1rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
          }
          button {
            background-color: #4f46e5;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            font-size: 1rem;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
          }
          button:hover {
            background-color: #4338ca;
          }
          .quick-login {
            margin-top: 1rem;
            text-align: center;
          }
          .quick-login button {
            background-color: #16a34a;
            width: auto;
            display: inline-block;
            margin: 0 0.25rem;
          }
          .quick-login button:hover {
            background-color: #15803d;
          }
          .info {
            margin-top: 1.5rem;
            font-size: 0.85rem;
            color: #666;
          }
          .test-accounts {
            margin-top: 1rem;
            padding: 1rem;
            background-color: #f8fafc;
            border-radius: 4px;
            font-size: 0.85rem;
          }
          .test-account {
            margin-bottom: 0.5rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Mock OAuth Sign In</h1>
          <form id="loginForm" action="/oauth/authorize" method="POST">
            <input type="hidden" name="client_id" value="${clientId}">
            <input type="hidden" name="redirect_uri" value="${redirectUri}">
            <input type="hidden" name="state" value="${state || ''}">
            <input type="hidden" name="scope" value="${scope || ''}">
            <input type="hidden" name="response_type" value="${responseType || 'code'}">

            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required>
            </div>

            <button type="submit">Sign In</button>

            <div class="quick-login">
              <button type="button" id="loginAsRegular">Login as Test User</button>
              <button type="button" id="loginAsAdmin">Login as Admin</button>
            </div>
          </form>

          <div class="info">
            <p>This is a mock OAuth server for local testing.</p>

            <div class="test-accounts">
              <p><strong>Test Accounts:</strong></p>
              <div class="test-account">
                <strong>Regular User:</strong><br>
                Email: test@example.com<br>
                Password: password
              </div>
              <div class="test-account">
                <strong>Admin User:</strong><br>
                Email: admin@example.com<br>
                Password: password
              </div>
            </div>
          </div>
        </div>

        <script>
          // Quick login buttons
          document.getElementById('loginAsRegular').addEventListener('click', function() {
            document.getElementById('email').value = 'test@example.com';
            document.getElementById('password').value = 'password';
            document.getElementById('loginForm').submit();
          });

          document.getElementById('loginAsAdmin').addEventListener('click', function() {
            document.getElementById('email').value = 'admin@example.com';
            document.getElementById('password').value = 'password';
            document.getElementById('loginForm').submit();
          });
        </script>
      </body>
    </html>
  `;
}

// Create and start the server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Set CORS headers to allow requests from the frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Handle different endpoints
  try {
    // Authorization endpoint - GET shows login page
    if (path === '/oauth/authorize' && req.method === 'GET') {
      console.log('GET /oauth/authorize');
      const { client_id, redirect_uri, state, scope, response_type } = query;

      // Validate client and redirect URI
      if (client_id !== CLIENT.id) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'invalid_client', error_description: 'Invalid client ID' }));
        return;
      }

      if (!CLIENT.redirectUris.includes(redirect_uri)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'invalid_request', error_description: 'Invalid redirect URI' }));
        return;
      }

      // Show login page
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(renderLoginPage(client_id, redirect_uri, state, scope, response_type));
      return;
    }

    // Authorization endpoint - POST processes login form
    if (path === '/oauth/authorize' && req.method === 'POST') {
      console.log('POST /oauth/authorize');
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        const formData = querystring.parse(body);
        const { client_id, redirect_uri, state, scope, response_type, email, password } = formData;

        // Validate client and redirect URI
        if (client_id !== CLIENT.id) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'invalid_client', error_description: 'Invalid client ID' }));
          return;
        }

        if (!CLIENT.redirectUris.includes(redirect_uri)) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'invalid_request', error_description: 'Invalid redirect URI' }));
          return;
        }

        // Authenticate user
        const user = authenticateUser(email, password);
        if (!user) {
          // Show login page with error
          res.statusCode = 401;
          res.setHeader('Content-Type', 'text/html');
          res.end(renderLoginPage(client_id, redirect_uri, state, scope, response_type) +
                 '<script>alert("Invalid email or password");</script>');
          return;
        }

        // Generate authorization code
        const code = generateRandomString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Store the authorization code
        authCodes.set(code, {
          clientId: client_id,
          userId: user.id,
          redirectUri: redirect_uri,
          expiresAt,
          scope: scope || ''
        });

        // Redirect back to client with authorization code
        const redirectUrl = new URL(redirect_uri);
        redirectUrl.searchParams.append('code', code);
        if (state) {
          redirectUrl.searchParams.append('state', state);
        }

        res.statusCode = 302;
        res.setHeader('Location', redirectUrl.toString());
        res.end();
      });

      return;
    }

    // Token endpoint
    if (path === '/oauth/token' && req.method === 'POST') {
      console.log('POST /oauth/token');
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        let payload;

        // Parse request body
        try {
          const contentType = req.headers['content-type'] || '';
          if (contentType.includes('application/json')) {
            payload = JSON.parse(body);
          } else {
            // Handle application/x-www-form-urlencoded or any other format
            payload = querystring.parse(body);
          }

          // Log the parsed payload for debugging
          console.log('Token request payload:', payload);
        } catch (error) {
          console.error('Error parsing request body:', error);
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'invalid_request', error_description: 'Invalid request body' }));
          return;
        }

        // Extract fields, handling different cases and formats
        const grantType = payload.grant_type || '';
        const code = payload.code || '';
        const redirectUri = payload.redirect_uri || payload.redirectUri || payload.redirect_url || '';
        const clientId = payload.client_id || payload.clientId || '';
        const clientSecret = payload.client_secret || payload.clientSecret || '';
        const refreshToken = payload.refresh_token || payload.refreshToken || '';

        // Log the extracted parameters
        console.log('Processed token request params:', {
          grantType,
          clientId,
          redirectUri,
          hasCode: !!code,
          hasRefreshToken: !!refreshToken
        });

        // Validate client credentials
        if (clientId !== CLIENT.id || clientSecret !== CLIENT.secret) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'invalid_client', error_description: 'Invalid client credentials' }));
          return;
        }

        // Handle different grant types
        if (grantType === 'authorization_code') {
          console.log('Grant type: authorization_code');
          // Validate authorization code
          const authCodeData = authCodes.get(code);

          if (!authCodeData || authCodeData.expiresAt < Date.now()) {
            console.error('Invalid or expired authorization code');
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid or expired authorization code' }));
            return;
          }

          if (authCodeData.clientId !== clientId || authCodeData.redirectUri !== redirectUri) {
            console.error('Authorization code was not issued for this client or redirect URI');
            console.error('Received:', { clientId, redirectUri });
            console.error('Expected:', { clientId: authCodeData.clientId, redirectUri: authCodeData.redirectUri });
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'invalid_grant', error_description: 'Authorization code was not issued for this client or redirect URI' }));
            return;
          }

          // Generate tokens
          const accessToken = generateRandomString();
          const newRefreshToken = generateRandomString();
          const accessTokenExpiresAt = Date.now() + 3600 * 1000 * 24; // 24 hours (increased from 1 hour)
          const refreshTokenExpiresAt = Date.now() + 30 * 24 * 3600 * 1000; // 30 days

          console.log('Generated access token:', accessToken);
          console.log('Access token expires at:', new Date(accessTokenExpiresAt).toISOString());

          // Store tokens
          accessTokens.set(accessToken, {
            userId: authCodeData.userId,
            clientId,
            scope: authCodeData.scope,
            expiresAt: accessTokenExpiresAt
          });

          console.log('Stored access token in Map with key:', accessToken);
          console.log('Total tokens in storage:', accessTokens.size);

          refreshTokens.set(newRefreshToken, {
            userId: authCodeData.userId,
            clientId: authCodeData.clientId,
            scope: authCodeData.scope,
            expiresAt: refreshTokenExpiresAt
          });

          // Delete used authorization code
          authCodes.delete(code);

          // Send response
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 3600,
            refresh_token: newRefreshToken,
            scope: authCodeData.scope
          }));
          return;
        } else if (grantType === 'refresh_token') {
          console.log('Grant type: refresh_token');
          // Validate refresh token
          const refreshTokenData = refreshTokens.get(refreshToken);

          if (!refreshTokenData || refreshTokenData.expiresAt < Date.now()) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid or expired refresh token' }));
            return;
          }

          if (refreshTokenData.clientId !== clientId) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'invalid_grant', error_description: 'Refresh token was not issued for this client' }));
            return;
          }

          // Generate new access token
          const accessToken = generateRandomString();
          const accessTokenExpiresAt = Date.now() + 3600 * 1000; // 1 hour

          // Store token
          accessTokens.set(accessToken, {
            userId: refreshTokenData.userId,
            clientId: refreshTokenData.clientId,
            scope: refreshTokenData.scope,
            expiresAt: accessTokenExpiresAt
          });

          // Send response
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 3600,
            scope: refreshTokenData.scope
          }));
          return;
        } else {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'unsupported_grant_type', error_description: 'Unsupported grant type' }));
          return;
        }
      });

      return;
    }

    // User info endpoint
    if (path === '/oauth/userinfo' && req.method === 'GET') {
      console.log('GET /oauth/userinfo');
      // Get access token from Authorization header
      const authHeader = req.headers.authorization;

      console.log('Authorization header:', authHeader);

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'invalid_token', error_description: 'Missing or invalid access token' }));
        return;
      }

      const accessToken = authHeader.substring(7);
      console.log('Access token from header:', accessToken);

      const tokenData = accessTokens.get(accessToken);
      console.log('Token data found:', !!tokenData, tokenData ? {
        userId: tokenData.userId,
        clientId: tokenData.clientId,
        expiresAt: new Date(tokenData.expiresAt).toISOString(),
        expired: tokenData.expiresAt < Date.now(),
        timeLeft: Math.floor((tokenData.expiresAt - Date.now()) / 1000) + ' seconds'
      } : 'No token data');

      if (!tokenData || tokenData.expiresAt < Date.now()) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'invalid_token', error_description: 'Invalid or expired access token' }));
        return;
      }

      // Get user info
      const user = findUserById(tokenData.userId);

      if (!user) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'server_error', error_description: 'User not found' }));
        return;
      }

      // Always include essential user information regardless of scope
      const userInfo = {
        sub: user.id,
        name: user.name,
        email: user.email,
        email_verified: true,
        role: user.role
      };

      // Send response
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(userInfo));
      return;
    }

    // Debug endpoint - only available in development
    if (path === '/oauth/debug/tokens' && req.method === 'GET') {
      if (process.env.NODE_ENV === 'production') {
        res.statusCode = 404;
        res.end();
        return;
      }

      console.log('GET /oauth/debug/tokens');

      const tokenDebugInfo = {
        accessTokens: Array.from(accessTokens.entries()).map(([token, data]) => ({
          token: token.substring(0, 8) + '...',
          userId: data.userId,
          clientId: data.clientId,
          expiresAt: new Date(data.expiresAt).toISOString(),
          expired: data.expiresAt < Date.now(),
          timeLeft: Math.floor((data.expiresAt - Date.now()) / 1000) + ' seconds'
        })),
        refreshTokens: Array.from(refreshTokens.entries()).map(([token, data]) => ({
          token: token.substring(0, 8) + '...',
          userId: data.userId,
          clientId: data.clientId,
          expiresAt: new Date(data.expiresAt).toISOString(),
          expired: data.expiresAt < Date.now()
        })),
        authCodes: Array.from(authCodes.entries()).map(([code, data]) => ({
          code: code.substring(0, 8) + '...',
          userId: data.userId,
          clientId: data.clientId,
          expiresAt: new Date(data.expiresAt).toISOString(),
          expired: data.expiresAt < Date.now()
        }))
      };

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(tokenDebugInfo, null, 2));
      return;
    }

    // OpenID Connect configuration endpoint
    if ((path === '/.well-known/openid-configuration' || path === '/oauth/.well-known/openid-configuration') && req.method === 'GET') {
      console.log(`GET ${path}`);
      const baseUrl = `http://${HOST}:${PORT}`;

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        issuer: baseUrl,
        authorization_endpoint: `${baseUrl}/oauth/authorize`,
        token_endpoint: `${baseUrl}/oauth/token`,
        userinfo_endpoint: `${baseUrl}/oauth/userinfo`,
        jwks_uri: `${baseUrl}/.well-known/jwks.json`,
        response_types_supported: ['code'],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['RS256'],
        scopes_supported: ['openid', 'profile', 'email'],
        token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
        claims_supported: ['sub', 'name', 'email', 'email_verified']
      }));
      return;
    }

    // Default route
    if (path === '/' && req.method === 'GET') {
      console.log('GET /');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Mock OAuth2 Server</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                line-height: 1.5;
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem 1rem;
                color: #333;
              }
              h1 {
                margin-top: 0;
                color: #111;
              }
              .container {
                border: 1px solid #ccc;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              }
              .endpoint {
                margin-bottom: 1.5rem;
                padding: 1rem;
                background-color: #f8fafc;
                border-radius: 4px;
              }
              .endpoint h3 {
                margin-top: 0;
                margin-bottom: 0.5rem;
                color: #111;
              }
              .endpoint p {
                margin-top: 0;
              }
              code {
                background-color: #f1f5f9;
                padding: 0.2rem 0.4rem;
                border-radius: 3px;
                font-size: 0.9em;
              }
              .test-accounts {
                margin-top: 2rem;
              }
              .test-account {
                margin-bottom: 1rem;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Mock OAuth2 Server</h1>
              <p>This is a simple OAuth2 server for local testing. The server implements the OAuth2 authorization code flow.</p>

              <h2>Available Endpoints</h2>

              <div class="endpoint">
                <h3>Authorization Endpoint</h3>
                <p><code>GET /oauth/authorize</code></p>
                <p>Used to authenticate the user and obtain authorization.</p>
              </div>

              <div class="endpoint">
                <h3>Token Endpoint</h3>
                <p><code>POST /oauth/token</code></p>
                <p>Used to exchange an authorization code for an access token.</p>
              </div>

              <div class="endpoint">
                <h3>User Info Endpoint</h3>
                <p><code>GET /oauth/userinfo</code></p>
                <p>Returns information about the authenticated user.</p>
              </div>

              <div class="endpoint">
                <h3>OpenID Configuration</h3>
                <p><code>GET /.well-known/openid-configuration</code></p>
                <p>Returns OpenID Connect discovery document.</p>
              </div>

              <div class="endpoint">
                <h3>Debug Endpoint</h3>
                <p><code>GET /oauth/debug/tokens</code></p>
                <p>Development endpoint to inspect the current tokens in the system.</p>
              </div>

              <div class="test-accounts">
                <h2>Test Accounts</h2>

                <div class="test-account">
                  <h3>Regular User</h3>
                  <p><strong>Email:</strong> test@example.com</p>
                  <p><strong>Password:</strong> password</p>
                </div>

                <div class="test-account">
                  <h3>Admin User</h3>
                  <p><strong>Email:</strong> admin@example.com</p>
                  <p><strong>Password:</strong> password</p>
                </div>
              </div>

              <h2>Client Information</h2>
              <p><strong>Client ID:</strong> local-client-id</p>
              <p><strong>Client Secret:</strong> local-client-secret</p>
            </div>
          </body>
        </html>
      `);
      return;
    }

    // Unknown route
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'not_found', error_description: 'Endpoint not found' }));
  } catch (error) {
    console.error('Server error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'server_error', error_description: 'Internal server error' }));
  }
});

// Start the server
server.listen(PORT, HOST, () => {
  console.log(`Mock OAuth2 Server running at http://${HOST}:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`- Authorization: http://${HOST}:${PORT}/oauth/authorize`);
  console.log(`- Token: http://${HOST}:${PORT}/oauth/token`);
  console.log(`- UserInfo: http://${HOST}:${PORT}/oauth/userinfo`);
  console.log(`- OpenID Configuration: http://${HOST}:${PORT}/.well-known/openid-configuration`);
});
