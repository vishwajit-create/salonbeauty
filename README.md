# BeautyBook — initial scaffold

This repo contains the initial backend scaffold for the BeautyBook / SalonBeauty project.

What's included:
- apps/api: Nest-style TypeScript backend (minimal) using TypeORM + PostgreSQL + Redis
- Docker Compose (postgres + redis)
- Basic OTP auth (OTP stored in Redis and logged to console for dev)
- JWT access + refresh tokens
- Entities: User, Role, Salon, SalonAddress
- Basic endpoints: /auth/send-otp, /auth/verify-otp, /users/me, /salons

Run (dev):
1. Copy .env.example to apps/api/.env and edit if needed
2. docker-compose up -d
3. cd apps/api && npm install
4. npm run start:dev (runs ts-node-dev)

Notes:
- This is a minimal MVP scaffold to get you started. Production hardening, migrations, and tests to follow.
