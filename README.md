# Dharan Stays

Guest ordering and apartment booking platform for a short-term rental in Dharan, Eastern Nepal.

**Stack:** React 18 + Vite, Node.js + Express, PostgreSQL 16, Nginx, Docker Compose

## Quick Start

```bash
git clone <repo>
cd dharan-stays
cp .env.example .env
# Edit .env with your values
docker-compose up --build
```

- **Frontend:** http://localhost
- **API:** http://localhost:4000
- **Admin:** http://localhost/admin
  - Email: `admin@dharanstays.com`
  - Password: `admin123`
- **Database:** localhost:5432

## Features

- **Guest side:** Browse groceries + meal kits, add to cart, checkout, track order, book apartment
- **Admin dashboard:** View/manage orders, toggle inventory stock, revenue analytics, manage bookings
- **WhatsApp notifications:** Auto-notifies host on new orders and booking requests (Twilio)
- **Payments:** eSewa, Khalti, Cash on delivery
- **60 products** across 6 categories with 5 curated meal kits

## Useful Commands

```bash
# View logs
docker-compose logs -f api
docker-compose logs -f postgres

# Connect to database
docker exec -it dharan_postgres psql -U dharan -d dharanstays

# Rebuild a single service
docker-compose up --build api

# Stop everything
docker-compose down

# Stop and delete all data (WARNING: deletes the database)
docker-compose down -v
```

## Change Admin Password

```sql
UPDATE admin_users
SET password_hash = crypt('your_new_password', gen_salt('bf'))
WHERE email = 'admin@dharanstays.com';
```

## Production Deployment

1. Change all passwords and `JWT_SECRET` in `.env`
2. Remove port mappings for `postgres` and `api` in `docker-compose.yml`
3. Add SSL certificates to `./nginx/ssl/` and update `nginx.conf` for HTTPS
4. Set `NODE_ENV=production`
5. Register eSewa merchant account at esewa.com.np
6. Apply for Twilio WhatsApp Business API at twilio.com
