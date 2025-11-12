# Networking BudE - Documentation Wiki

Welcome to the comprehensive documentation wiki for the Networking BudE application. This wiki contains all technical documentation, guides, and reference materials organized by topic.

---

## 📚 Table of Contents

### 1. [Getting Started](#getting-started)
- [Project Overview](#project-overview)
- [Quick Start Guide](#quick-start)
- [Architecture Overview](architecture/ARCHITECTURE_OVERVIEW.md)

### 2. [Security](security/)
- [Security Audit Report](security/SECURITY_AUDIT_REPORT.md) ⚠️ **CRITICAL**
- [RLS Policies](security/RLS_POLICIES.md)
- [Email Change Security](security/EMAIL_CHANGE_SECURITY.md)
- [API Authentication](security/API_AUTHENTICATION.md)

### 3. [Architecture](architecture/)
- [System Architecture](architecture/ARCHITECTURE_OVERVIEW.md)
- [Database Schema](architecture/DATABASE_SCHEMA.md)
- [API Endpoints](architecture/API_ENDPOINTS.md)
- [Frontend Structure](architecture/FRONTEND_STRUCTURE.md)

### 4. [Matching Algorithm](matching/)
- [Algorithm Summary](matching/ALGORITHM_SUMMARY.md)
- [Matching Policy](matching/MATCHING_POLICY.md)
- [Match Reports](matching/MATCH_REPORTS.md)

### 5. [Integrations](integrations/)
- [Google Sheets Setup](integrations/GOOGLE_SHEETS_SETUP.md)
- [Google Forms Setup](integrations/GOOGLE_FORMS_SETUP.md)
- [Supabase Setup](integrations/SUPABASE_SETUP.md)
- [Resend Email API](integrations/RESEND_EMAIL.md)

### 6. [Development](development/)
- [Best Practices](development/BEST_PRACTICES.md)
- [Development Workflow](development/WORKFLOW.md)
- [Optimization TODO](development/OPTIMIZATION_TODO.md)

### 7. [Deployment](deployment/)
- [Vercel Setup](deployment/VERCEL_SETUP.md)
- [Environment Variables](deployment/ENVIRONMENT_VARS.md)
- [Beta to Production](deployment/BETA_TO_PRODUCTION.md)

### 8. [Testing](testing/)
- [Testing Checklist](testing/TESTING_CHECKLIST.md)
- [Cypress E2E Tests](testing/CYPRESS_TESTS.md)
- [Manual Testing Guide](testing/MANUAL_TESTING.md)

### 9. [Features](features/)
- [Connection Flow](features/CONNECTION_FLOW.md)
- [Notification System](features/NOTIFICATIONS.md)
- [Events Management](features/EVENTS.md)
- [Photo Upload](features/PHOTO_UPLOAD.md)

### 10. [Reports & Analytics](reports/)
- [Beta Findings Report](reports/BETA_FINDINGS.md)
- [Match Reports](reports/MATCH_REPORTS.md)
- [Notification System Report](reports/NOTIFICATION_SYSTEM.md)

---

## 🚀 Getting Started

### Project Overview

**Networking BudE** is a sophisticated networking application that connects professionals based on compatibility scores calculated using a multi-factor matching algorithm.

**Tech Stack:**
- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel Serverless Functions
- **Email**: Resend API
- **Forms/Sheets**: Google APIs

**Key Features:**
- AI-powered matching algorithm (60%+ compatibility threshold)
- Connection management with status tracking
- Event discovery and engagement
- In-app notifications
- Secure two-factor email changes
- Profile photo upload to Supabase Storage

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd bude

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev

# Build for production
npm run build
```

### Environment Variables Required

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Google APIs
GOOGLE_PROJECT_ID=
GOOGLE_PRIVATE_KEY=
GOOGLE_CLIENT_EMAIL=
GOOGLE_SHEET_ID=

# Resend Email
RESEND_API_KEY=

# Security
MATCHING_SERVICE_KEY=
CRON_SECRET=
```

---

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────────────────────────────────┐
│           Frontend (React + Vite)            │
│  - Dashboard, Connections, Events, Settings │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│     Vercel Serverless Functions (API)       │
│  - Authentication Middleware                │
│  - Rate Limiting                            │
│  - Input Validation                         │
└─────────────────┬───────────────────────────┘
                  │
      ┌───────────┼───────────┐
      ▼           ▼           ▼
┌──────────┐ ┌─────────┐ ┌────────┐
│ Supabase │ │  Resend │ │ Google │
│  DB+Auth │ │  Email  │ │ Sheets │
└──────────┘ └─────────┘ └────────┘
```

### Database Tables

| Table | Purpose | RLS Enabled |
|-------|---------|-------------|
| `users` | User profiles | ✅ Yes |
| `matches` | Connection recommendations | ✅ Yes |
| `notifications` | In-app notifications | ✅ Yes |
| `notification_preferences` | User notification settings | ✅ Yes |
| `events` | Event listings | ✅ Yes |
| `event_likes` | User event engagement | ✅ Yes |
| `event_registration_clicks` | Event click tracking | ✅ Yes |
| `email_change_requests` | Two-factor email changes | ✅ Yes |

---

## 🔒 Security

### Current Security Status

**CRITICAL Issues Identified** (see [Security Audit Report](security/SECURITY_AUDIT_REPORT.md)):
1. ✅ **FIXED**: RLS policies now support tiered visibility
2. ✅ **FIXED**: API endpoints secured with authentication
3. ✅ **FIXED**: Rate limiting implemented
4. ✅ **FIXED**: Input validation and sanitization
5. ✅ **FIXED**: Service role key for admin operations

### Security Best Practices

- All API endpoints require authentication
- Rate limiting on email endpoints (10/hour per user)
- Input sanitization to prevent XSS
- CORS restricted to allowed origins
- Service role key for privileged operations
- Token-based email change verification

---

## 📖 Documentation Standards

### File Organization

- **security/**: Security audits, RLS policies, authentication
- **architecture/**: System design, database schema, API docs
- **matching/**: Matching algorithm documentation
- **integrations/**: Third-party service setup guides
- **development/**: Developer guides and best practices
- **deployment/**: Deployment and environment setup
- **testing/**: Testing guides and procedures
- **features/**: Feature-specific documentation
- **reports/**: Analytics and findings reports

### Documentation Guidelines

1. **Use clear, descriptive titles**
2. **Include code examples** where applicable
3. **Add diagrams** for complex flows
4. **Keep documents up-to-date** with code changes
5. **Cross-reference** related documents
6. **Include timestamps** on reports and audits

---

## 🤝 Contributing

### Development Workflow

1. Read [Best Practices](development/BEST_PRACTICES.md)
2. Review [Architecture Overview](architecture/ARCHITECTURE_OVERVIEW.md)
3. Check [Security Guidelines](security/SECURITY_AUDIT_REPORT.md)
4. Follow [Testing Checklist](testing/TESTING_CHECKLIST.md)
5. Submit changes via pull request

### Code Review Checklist

- [ ] Security vulnerabilities addressed
- [ ] RLS policies correct
- [ ] Input validation implemented
- [ ] Error handling in place
- [ ] Tests written and passing
- [ ] Documentation updated

---

## 📞 Support & Resources

### Internal Resources
- [Security Audit Report](security/SECURITY_AUDIT_REPORT.md)
- [Best Practices Guide](development/BEST_PRACTICES.md)
- [Testing Checklist](testing/TESTING_CHECKLIST.md)

### External Resources
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Vercel Documentation](https://vercel.com/docs)

---

## 📝 Recent Updates

### 2025-11-12 - Security Hardening
- ✅ Comprehensive security audit completed
- ✅ Optimal RLS policies implemented
- ✅ API authentication middleware added
- ✅ Rate limiting implemented
- ✅ Input validation and sanitization
- ✅ Documentation wiki organized

### Next Steps
- [ ] Implement Cypress E2E tests
- [ ] Set up automated security scanning
- [ ] Add GDPR compliance features
- [ ] Implement audit logging
- [ ] Add admin role system

---

## 📄 License

[Your License Here]

---

**Last Updated**: 2025-11-12
**Maintained By**: Development Team
**Version**: 1.0.0
