# Role-Based Access Control (RBAC) System

This document describes the RBAC system implemented in this Next.js template.

## Roles and Permissions

The system has three main roles:

1. **Admin**: Can access and modify all resources
   - Has all permissions
   - Can view/edit/delete any user
   - Can manage roles

2. **User**: Can access and modify their own data only
   - Can view/edit their own profile
   - Cannot delete their own account via API (to prevent accidental deletion)
   - Cannot access other users' data

3. **Moderator**: Special role for content moderation
   - Can access content moderation features
   - Has more permissions than regular users but less than admins

## Permissions

Permissions are stored in the database and associated with roles. The main permissions include:

- `user:read` - Ability to read user information
- `user:create` - Ability to create new users
- `user:update` - Ability to update user information
- `user:delete` - Ability to delete users
- `role:read` - Ability to read role information
- `role:create` - Ability to create new roles
- `role:update` - Ability to update roles
- `role:delete` - Ability to delete roles
- `profile:read` - Ability to read profile information
- `profile:update` - Ability to update profile information
- `content:read` - Ability to read content
- `content:update` - Ability to update content
- `content:moderate` - Ability to moderate content

## Implementation

The RBAC system is implemented through several components:

1. **Middleware (`src/middleware.ts`)**:
   - Enforces authentication and authorization for all routes
   - Manages route-specific permissions and roles
   - Handles user-specific routes (user can access their own data)
   - Checks if a user has required permissions or roles

2. **Authentication Middleware (`src/middleware/auth.ts`)**:
   - Provides functions for authenticating users in API routes
   - Checks permissions and roles for specific operations

3. **Database Queries (`src/db/queries.ts`)**:
   - Provides functions for checking permissions, roles, and user information
   - Implements the core RBAC functionality

## Route Access Control

Routes are categorized into:

1. **Public Routes**: Accessible without authentication
   - Home page, sign-in, sign-up, etc.

2. **Permission-Protected Routes**: Require specific permissions
   - API endpoints for user, role management, etc.

3. **Role-Protected Routes**: Require specific roles
   - Admin pages, moderator pages, etc.

4. **User-Specific Routes**: Allow users to access their own data
   - Profile, settings, etc.

## Access Rules

- **Admin Access Rule**: Admins have access to everything
- **User Access Rule**: Users can only access and modify their own data
- **Data Ownership**: Users can only modify data they own

## Usage in API Routes

For API routes, use the `authenticate` function with appropriate options:

```typescript
// Basic authentication
const authResult = await authenticate(req);

// Check for specific permissions
const authResult = await authenticate(req, {
  permissions: ["user:read"]
});

// Check for specific roles
const authResult = await authenticate(req, {
  roles: ["Admin"]
});

// Check if user has any of these roles
const authResult = await authenticate(req, {
  anyRole: ["Admin", "Moderator"]
});
```

## Best Practices

1. Always check authentication before processing requests
2. Use the most specific permission required for each operation
3. For user data, always verify the requesting user has the right to access or modify it
4. Admin roles should be used sparingly and only for necessary administrative tasks
