# Gym Platform Admin

> A modern, enterprise-grade admin dashboard for managing multi-tenant gym and fitness platforms. Built with Angular 21 and designed for platform administrators to oversee gym operations, memberships, staff, and access control systems.

[![Angular](https://img.shields.io/badge/Angular-21.0-DD0031?style=flat&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat)](LICENSE)

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [API Integration](#api-integration)
- [Development](#development)
- [Build Configuration](#build-configuration)
- [Browser Support](#browser-support)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [Support](#support)

## Overview

Gym Platform Admin is a comprehensive administrative web application that provides centralized management capabilities for multi-tenant gym operations. It enables platform administrators to manage organizations (tenants), track memberships, monitor staff activities, configure access gates, maintain exercise catalogs, review attendance logs, and handle support tickets across multiple gym locations.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/gym-application-org/gym-platform-admin.git
cd gym-platform-admin

# Install dependencies
npm install

# Start development server
npm start

# Open browser to http://localhost:4200
```

## Key Features

### Core Management Features
- **Multi-Tenant Administration** - Manage multiple gym organizations from a single dashboard
- **Member Management** - View and manage member profiles across all tenants
- **Staff Management** - Track and manage staff members and their roles
- **Access Gate Configuration** - Configure and monitor gym access control points
- **Exercise Catalog** - Maintain a centralized exercise database
- **Attendance Tracking** - Monitor check-ins and gate activity logs
- **Support Ticket System** - Handle customer support requests efficiently

### Security & Access Control
- **JWT-based Authentication** - Secure token-based authentication with automatic refresh
- **Role-Based Access Control (RBAC)** - Fine-grained permissions using operation claims
- **Admin-Only Access** - Restricted to platform administrators
- **User Management** - Platform user accounts with granular permissions
- **Operation Claims Management** - Define and assign specific access rights

### Technical Features
- **Responsive Design** - Mobile-first approach with seamless tablet and desktop experiences
- **Real-time Data** - Live updates and monitoring capabilities
- **Repository Pattern** - Clean architecture with abstracted data access
- **Error Handling** - Comprehensive error management with toast notifications
- **Type Safety** - Full TypeScript implementation with strict mode
- **Modern UI** - Clean, professional interface with SCSS styling

## Tech Stack

### Frontend Framework
- **Angular 21.0** - Latest Angular framework
- **TypeScript 5.9** - Type-safe JavaScript
- **RxJS 7.8** - Reactive programming with observables

### Authentication & Security
- **@auth0/angular-jwt** - JWT token handling and automatic injection
- **HTTP Interceptors** - Token refresh and error handling

### Testing
- **Vitest 4.0** - Fast unit testing framework
- **JSDOM 27.1** - DOM implementation for testing

### Development Tools
- **Angular CLI 21.0** - Command-line interface for Angular
- **SCSS** - CSS preprocessor for maintainable styles
- **Prettier** - Code formatting with custom configuration

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** - Version 20.x or later (LTS recommended)
- **npm** - Version 11.6 or later (included with Node.js)
- **Angular CLI** - Install globally:
  ```bash
  npm install -g @angular/cli
  ```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/gym-application-org/gym-platform-admin.git
cd gym-platform-admin
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

The application is pre-configured with the following API endpoints:

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://gym-app-api.us-east-1.elasticbeanstalk.com'
};
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'http://gym-app-api.us-east-1.elasticbeanstalk.com'
};
```

Update these files if you need to point to a different API endpoint.

## Running the Application

### Development Server

Start the development server:

```bash
npm start
# or
ng serve
```

The application will be available at `http://localhost:4200/`. The app automatically reloads when you modify source files.

### Production Build

Build the project for production:

```bash
npm run build
# or
ng build
```

Production artifacts will be stored in the `dist/` directory with optimization enabled.

### Watch Mode

Run the build in watch mode for development:

```bash
npm run watch
# or
ng build --watch --configuration development
```

## Project Structure

```
gym-platform-admin/
├── src/
│   ├── app/
│   │   ├── config/                    # Application configuration
│   │   │   ├── jwt.config.ts         # JWT configuration and token handling
│   │   │   ├── repository.tokens.ts  # Dependency injection tokens
│   │   │   └── repository.providers.ts # Repository implementations
│   │   ├── data/                      # Data layer
│   │   │   ├── repository/            # Repository pattern implementations
│   │   │   │   ├── auth/             # Authentication repository
│   │   │   │   ├── tenant/           # Tenant management
│   │   │   │   ├── member/           # Member management
│   │   │   │   ├── staff/            # Staff management
│   │   │   │   ├── gate/             # Access gate management
│   │   │   │   ├── exercise/         # Exercise catalog
│   │   │   │   ├── attendance-log/   # Attendance tracking
│   │   │   │   ├── support-ticket/   # Support system
│   │   │   │   └── user/             # Platform user management
│   │   │   └── services/              # API services
│   │   │       ├── api/
│   │   │       │   ├── api-client.ts        # Main API client
│   │   │       │   ├── auth-api-client.ts   # Authentication API
│   │   │       │   └── models/              # TypeScript interfaces/models
│   │   │       └── local-storage-service.ts # Browser storage management
│   │   ├── guards/                    # Route guards
│   │   │   ├── auth.guard.ts         # Authentication guard
│   │   │   ├── guest.guard.ts        # Guest-only guard
│   │   │   └── sign-in-required.guard.ts # Sign-in redirect guard
│   │   ├── interceptors/              # HTTP interceptors
│   │   │   └── token-expiration.interceptor.ts # Token refresh logic
│   │   ├── layouts/                   # Application layouts
│   │   │   ├── full/                 # Main dashboard layout
│   │   │   └── blank/                # Minimal layout (login, errors)
│   │   ├── pages/                     # Feature pages
│   │   │   ├── authentication/       # Login and auth flows
│   │   │   ├── dashboard/            # Main dashboard
│   │   │   ├── tenants/              # Tenant management pages
│   │   │   ├── members/              # Member management
│   │   │   ├── staff/                # Staff management
│   │   │   ├── gates/                # Gate configuration
│   │   │   ├── exercises/            # Exercise catalog
│   │   │   ├── attendance-logs/      # Attendance monitoring
│   │   │   ├── user-management/      # Platform users & permissions
│   │   │   └── [status pages]/       # Error and info pages
│   │   ├── services/                  # Application services
│   │   │   ├── authorization.service.ts # Authorization logic
│   │   │   ├── core.service.ts      # Core application state
│   │   │   └── nav.service.ts       # Navigation state
│   │   ├── shared/                    # Shared components
│   │   │   └── ui/                   # Reusable UI components
│   │   └── utils/                     # Utility functions
│   │       ├── result.ts             # Result type for error handling
│   │       ├── jwt-helper.ts         # JWT utilities
│   │       └── error-extractor.ts    # API error extraction
│   ├── environments/                  # Environment configurations
│   ├── styles/                        # Global styles
│   └── index.html                     # Application entry point
├── public/                            # Static assets
├── angular.json                       # Angular workspace configuration
├── package.json                       # NPM dependencies and scripts
└── tsconfig.json                      # TypeScript configuration
```

## Architecture

### Repository Pattern

The application uses a clean repository pattern to abstract data access:

- **Abstract Repositories** - Define contracts for data operations
- **Remote Repositories** - Implement HTTP-based data fetching
- **Local Repositories** - Implement browser storage operations
- **Dependency Injection** - Repositories provided via Angular DI tokens

### Authentication Flow

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│   Login     │ ───> │ AuthService  │ ───> │  Backend    │ ───> │ localStorage │
│   Form      │      │              │      │    API      │      │  (JWT Token) │
└─────────────┘      └──────────────┘      └─────────────┘      └──────────────┘
                             │                     │
                             v                     v
                      ┌──────────────┐      ┌─────────────┐
                      │  JwtModule   │      │  Extract    │
                      │  (Auto Token │      │  Roles &    │
                      │   Injection) │      │  Claims     │
                      └──────────────┘      └─────────────┘
```

**Flow Steps:**
1. User submits credentials via login form
2. `AuthService` sends credentials to backend API
3. Upon success, JWT token is stored in `localStorage`
4. Roles and claims extracted from JWT for authorization
5. Admin role validated (non-admin users are logged out)
6. `JwtModule` automatically attaches token to subsequent requests
7. `TokenExpirationInterceptor` handles token refresh on 401 errors
8. On refresh failure, user is redirected to login page

### Authorization System

**Role-Based Access:**
- Admin role required for main application access
- Role checks enforced at route level via `AuthGuard`
- Fine-grained permissions using operation claims

**Operation Claims:**
- `users.admin`, `users.read`, `users.add`, `users.update`, `users.delete`
- `useroperationclaims.add`, `useroperationclaims.delete`
- `operationclaims.admin`
- Custom claims for specific features

### Data Flow

```
Component → Repository (Interface) → API Service → Backend API
                ↓                         ↓
        Local Storage          HTTP Interceptors
```

## Screenshots

> Note: Add screenshots of your application here to showcase the user interface and features.

```
[Dashboard Screenshot]
[Tenant Management Screenshot]
[Member Management Screenshot]
```

## Dashboard Features

The main dashboard provides real-time insights and quick access to key metrics:

- **Tenant Count** - Total number of gym organizations
- **Member Count** - Total members across all tenants
- **Staff Count** - Total staff members
- **Gate Count** - Number of configured access gates
- **Exercise Count** - Total exercises in catalog
- **Open Support Tickets** - Pending support requests
- **User Count** - Platform users (conditional access)
- **Recent Attendance Logs** - Latest check-in activities

## API Integration

The application communicates with a RESTful backend API:

### Authentication Endpoints
- `POST /api/Auth/Login` - User login
- `POST /api/Auth/RefreshToken` - Token refresh
- `POST /api/Auth/RevokeToken` - User logout

### Admin Endpoints
- `/api/admin/tenants` - Tenant CRUD operations
- `/api/admin/members` - Member management
- `/api/admin/staffs` - Staff management
- `/api/admin/gates` - Access gate configuration
- `/api/admin/exercises` - Exercise catalog management
- `/api/admin/attendance-logs` - Attendance tracking
- `/api/admin/support-tickets` - Support ticket system

### User Management Endpoints
- `/api/Users` - Platform user CRUD
- `/api/OperationClaims` - Operation claims catalog
- `/api/UserOperationClaims` - User-claim assignments

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Start | `npm start` | Start development server at `http://localhost:4200` |
| Build | `npm run build` | Build for production in `dist/` directory |
| Watch | `npm run watch` | Build in watch mode with development configuration |
| Test | `npm test` | Run unit tests with Vitest |
| Lint | `ng lint` | Run linting (if configured) |

## Development

### Code Generation

Generate new components:
```bash
ng generate component component-name
```

Generate services:
```bash
ng generate service service-name
```

View all available schematics:
```bash
ng generate --help
```

### Testing

Run unit tests:
```bash
npm test
# or
ng test
```

Tests are executed using Vitest, a fast and modern testing framework.

### Code Style

The project uses Prettier for code formatting with the following configuration:
- Print width: 100 characters
- Single quotes: enabled
- Angular HTML parser for templates

Format code:
```bash
npx prettier --write .
```

## Build Configuration

### Development Build
- Source maps enabled
- No optimization
- Fast rebuild times

### Production Build
- Full optimization
- Output hashing for cache busting
- Bundle size limits:
  - Initial bundle: 500kB warning, 1MB error
  - Component styles: 14kB limit

## Performance & Optimization

### Lazy Loading
The application uses Angular's lazy loading for feature modules to improve initial load time:
- Dashboard, Tenants, Members, Staff, Gates, Exercises, and other modules load on demand
- Reduces initial bundle size
- Faster time to interactive

### Optimization Techniques
- **Tree Shaking** - Unused code is eliminated during production build
- **Ahead-of-Time (AOT) Compilation** - Templates compiled during build
- **Minification** - JavaScript and CSS are minified
- **Code Splitting** - Automatic splitting of vendor and application code
- **Gzip Compression** - Enable on web server for smaller transfer sizes

### Best Practices
1. **Use OnPush Change Detection** - For better performance in list components
2. **Unsubscribe from Observables** - Prevent memory leaks
3. **Virtual Scrolling** - Implement for large lists (future enhancement)
4. **Service Workers** - Consider adding PWA capabilities (future enhancement)
5. **Image Optimization** - Compress and optimize images before deployment

### Monitoring
Consider implementing:
- **Google Analytics** - User behavior tracking
- **Sentry** - Error monitoring and reporting
- **Performance Monitoring** - Track Core Web Vitals

## Browser Support

The application supports all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Security Considerations

- JWT tokens stored in `localStorage` (consider `httpOnly` cookies for production)
- All API requests include credentials
- Automatic token refresh on expiration
- Admin-only access enforced at multiple levels
- XSS protection via Angular's built-in sanitization
- CORS configuration required on backend
- HTTPS recommended for production deployments

## Deployment

### Production Deployment Checklist

1. **Environment Configuration**
   - Update `src/environments/environment.prod.ts` with production API URL
   - Ensure HTTPS is enabled for API endpoints

2. **Build for Production**
   ```bash
   npm run build
   ```

3. **Deploy Build Artifacts**
   - Deploy contents of `dist/` directory to web server
   - Configure server for single-page application routing
   - Ensure all routes redirect to `index.html`

4. **Server Configuration Examples**

   **Nginx:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/dist/gym-platform-admin/browser;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

   **Apache (.htaccess):**
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

### Hosting Platforms

The application can be deployed to various hosting platforms:
- **AWS S3 + CloudFront** - Static website hosting with CDN
- **Netlify** - Automatic deployments from Git
- **Vercel** - Zero-configuration deployments
- **Azure Static Web Apps** - Integrated with GitHub
- **Firebase Hosting** - Google Cloud platform

## Troubleshooting

### Common Issues

**Issue: Cannot connect to API**
- Verify API URL in environment files
- Check CORS configuration on backend
- Ensure network connectivity to API server

**Issue: Login fails with no error message**
- Open browser console to check for errors
- Verify credentials are correct
- Check if API is returning proper error messages

**Issue: Token refresh fails**
- Check if refresh token endpoint is accessible
- Verify interceptor configuration in `app.config.ts`
- Clear browser localStorage and try again

**Issue: Routes not working after deployment**
- Ensure server is configured for SPA routing
- All routes should redirect to `index.html`
- Check server configuration examples above

**Issue: Build fails**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Angular cache: `rm -rf .angular/cache`
- Verify Node.js version is 20.x or higher

**Issue: Authorization errors**
- Verify user has Admin role
- Check JWT token claims in browser DevTools
- Ensure token is not expired

## Frequently Asked Questions (FAQ)

### General Questions

**Q: Who can access this admin panel?**
A: Only users with the "Admin" role can access the platform. Regular users are automatically logged out after login.

**Q: Can I manage multiple gyms from this dashboard?**
A: Yes, the platform is designed for multi-tenant management, allowing you to oversee multiple gym organizations from a single dashboard.

**Q: Is this application mobile-friendly?**
A: Yes, the application is built with a mobile-first approach and works seamlessly on phones, tablets, and desktop computers.

### Technical Questions

**Q: What backend does this application require?**
A: The application expects a RESTful API backend with specific endpoints (see API Integration section). The backend should support JWT authentication and the documented API contracts.

**Q: Can I customize the UI?**
A: Yes, the application uses SCSS for styling. You can customize themes, colors, and layouts by modifying the SCSS files in `src/styles/`.

**Q: How do I add new features or pages?**
A: Follow the existing architecture patterns:
1. Create a new page component in `src/app/pages/`
2. Add routes in `src/app/app-routing.module.ts`
3. Implement repository if needed
4. Update navigation in `src/app/layouts/full/full.component.html`

**Q: Where is the user profile stored?**
A: User information is stored in localStorage and extracted from the JWT token. The token contains user ID, username, roles, and claims.

**Q: Can I integrate this with a different backend?**
A: Yes, but you'll need to ensure your backend implements the expected API contracts or modify the API services to match your backend's responses.

## Contributing

We welcome contributions from the development team. Please follow these guidelines:

### Development Workflow

1. **Fork & Clone**
   ```bash
   git clone https://github.com/gym-application-org/gym-platform-admin.git
   cd gym-platform-admin
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow existing code style and patterns
   - Write tests for new features
   - Update documentation as needed

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push & Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a pull request on GitHub.

### Commit Message Convention

Follow conventional commits format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Code Review Process

- All pull requests require review before merging
- Ensure all tests pass
- Follow Angular style guide
- Update documentation for API changes

## License

This project is private and proprietary. All rights reserved.

**Copyright © 2026 Gym Application Organization**

This software and associated documentation files are the exclusive property of Gym Application Organization. Unauthorized copying, distribution, modification, or use of this software is strictly prohibited.

## Support

For support, questions, or issues:

- **GitHub Issues** - Report bugs or request features: [GitHub Issues](https://github.com/gym-application-org/gym-platform-admin/issues)
- **Development Team** - Contact the development team for technical assistance
- **Documentation** - Refer to inline documentation and code comments

## Acknowledgments

Built with:
- [Angular](https://angular.dev/) - Web application framework
- [RxJS](https://rxjs.dev/) - Reactive programming library
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Auth0 Angular JWT](https://github.com/auth0/angular2-jwt) - JWT utilities
- [Vitest](https://vitest.dev/) - Testing framework

---

**Made with ❤️ by the Gym Platform Team**
