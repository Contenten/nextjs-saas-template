This is a Next.js template simply based on [ui.shadcn.com](https://ui.shadcn.com/).

You can use this template as a starting point for your next project.

## Tech Stack
- [Next.js@15](https://nextjs.org/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Contentlayer](https://contentlayer.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [E2E Testing with Playwright](https://playwright.dev/)
- [Better-Auth](https://better-auth.com/) for authentication

Biome is used for linting and formatting locally.

## Authentication with Better-Auth

This template includes a complete authentication system using Better-Auth, including:

- Email/password authentication
- Social login with multiple providers
- User roles and permissions
- Profile management

### Local OAuth Testing

For development and testing purposes, this template includes a mock OAuth server that allows you to test the OAuth flow locally without relying on external providers:

1. Start the mock OAuth server:
   ```bash
   npm run mock:oauth
   ```

2. Use the "Sign In with Local OAuth" button on the sign-in page

3. Test credentials:
   - Regular User: `test@example.com` / `password`
   - Admin User: `admin@example.com` / `password`

For more details on the mock OAuth server, see the [scripts/README.md](scripts/README.md) file.

## Deploy to multiple platforms

### [github pages](asd55667.github.io/nextjs-template)

### [cloudflare pages](nextjs-template.wuchengwei.com)

Build command

``` shell
npx tsx --tsconfig ./tsconfig.scripts.json ./src/scripts/build-registry.mts && npx next build
```

### [vercel](https://nextjs-template-psi-six.vercel.app/)

Build command

``` shell
tsx --tsconfig ./tsconfig.scripts.json ./src/scripts/build-registry.mts && next build
```

## Screenshot
![](/tests/e2e/homepage.spec.ts-snapshots/homepage-chromium-darwin.png)

[Try it in stackblitz](https://stackblitz.com/github/asd55667/nextjs-template)
