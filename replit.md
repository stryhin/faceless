# Faceless Social Media Application

## Overview

Faceless is a social media platform that prioritizes authentic content over vanity metrics. The application removes follower counts, like counters, and other engagement metrics to create a more genuine social experience. Users can share videos, images, and text posts while interacting through comments and subscriptions without the pressure of visible metrics.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Replit OIDC integration with session management
- **API**: RESTful endpoints following conventional patterns

### Database Architecture
- **ORM**: Drizzle ORM with type-safe queries
- **Database**: PostgreSQL (specifically Neon Database)
- **Migrations**: Drizzle Kit for schema management
- **Session Storage**: PostgreSQL-based session store

## Key Components

### Authentication System
- **Provider**: Replit OpenID Connect (OIDC)
- **Session Management**: Express sessions with PostgreSQL storage
- **User Model**: Stores profile information including username, bio, and profile images
- **Security**: HTTP-only cookies with secure flags

### Content Management
- **Post Types**: Three distinct content types (video, image, text)
- **Media Storage**: URL-based media references (external storage assumed)
- **Categories**: Optional categorization system for posts
- **Content Structure**: Flexible schema supporting multiple media URLs per post

### Social Features
- **Subscriptions**: User-to-user subscription system (replaces traditional "following")
- **Comments**: Threaded commenting system on posts
- **Engagement**: Like and save functionality (metrics hidden from UI)
- **Feed Algorithm**: Simple chronological feed with pagination

### UI/UX Design
- **Theme**: Dark-mode focused with custom "Faceless" color scheme
- **Navigation**: Bottom navigation bar for mobile-first experience
- **Feed Experience**: TikTok-style vertical scrolling with full-screen posts
- **Responsive Design**: Mobile-optimized with desktop compatibility

## Data Flow

### Authentication Flow
1. User initiates login through `/api/login` endpoint
2. Replit OIDC provider handles authentication
3. User profile is created or updated in database
4. Session is established with secure cookies
5. Client receives user data through `/api/auth/user`

### Content Creation Flow
1. User selects post type (video/image/text)
2. Media files are uploaded (implementation pending)
3. Post metadata is submitted to `/api/posts`
4. Database stores post with user reference
5. Feed queries are invalidated to show new content

### Feed Consumption Flow
1. Client requests posts through `/api/posts` with pagination
2. Server queries database with user context
3. Posts are returned with user information
4. Client renders posts based on type
5. User interactions trigger additional API calls

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **express**: Web server framework
- **passport**: Authentication middleware

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant management

### Development Dependencies
- **vite**: Frontend build tool
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React application to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle Kit handles schema migrations

### Production Configuration
- **Environment Variables**: `DATABASE_URL`, `SESSION_SECRET`, `REPLIT_DOMAINS`
- **Static Assets**: Served through Express in production
- **Process Management**: Single Node.js process handling both API and static files

### Development Workflow
- **Hot Reload**: Vite HMR for frontend changes
- **API Development**: tsx watch mode for backend changes
- **Database**: Push schema changes with `npm run db:push`

## Changelog
- July 08, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.