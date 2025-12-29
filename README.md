# marketplace-platform

```bash
marketplace-platform/
├── src/
│   ├── config/          # Database configs, env variables
│   ├── models/          # SQL (Prisma) + NoSQL (Mongoose) models
│   ├── services/        # Business logic
│   ├── controllers/     # Route handlers
│   ├── routes/          # Express routes
│   ├── middleware/      # Auth, logging, caching, rate limiting
│   ├── utils/           # Helpers, validators
│   ├── scripts/         # DB seeds, migrations
│   └── app.js           # App entry point
├── prisma/              # Prisma schema, migrations
├── docker-compose.yml   # Container setup
└── package.json
```

```bash
# Core
npm install express dotenv cors helmet compression

# Database Drivers
npm install prisma @prisma/client mongoose redis

# Utilities
npm install bcrypt jsonwebtoken joi express-rate-limit

# Development
npm install -D nodemon morgan

```