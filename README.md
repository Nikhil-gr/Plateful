# Plateful

A full-stack, one-level MVP of a surplus-food marketplace. It includes the essential customer, business, and admin journeys without production integrations such as payments, maps, image storage, or notifications.

## Run locally

1. Start MongoDB locally or use a MongoDB Atlas connection string.
2. In `backend`, copy `.env.example` to `.env`, then set `MONGODB_URI` and `JWT_SECRET`.
3. Install each application once:

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

4. Start both the API and frontend together:

   ```bash
   npm run dev
   ```

This starts the API on `http://localhost:4000` and the frontend on `http://localhost:3000`. You no longer need two terminals. Dependencies remain separate in `backend/node_modules` and `frontend/node_modules`.

The frontend uses `http://localhost:4000/api` by default. When no API is running or it has no active listings yet, the marketplace renders sample listings so the customer interface remains demonstrable. To place a real order, start the API, register a business, publish a listing, then register a customer. Live items can be added to the browser basket and reserved from the customer center.

## Prototype routes

- `/` — marketplace discovery, search, filters, favorites, and live-item basket
- `/account` — customer/business registration and login (JWT is stored locally)
- `/cart` — persistent browser basket and quantity controls
- `/customer` — reserve the basket and view live order status
- `/business` — publish a surplus listing and manage the business API workflow
- `/admin` — platform statistics and admin-management API access

Register a business or customer through `/account`. The initial admin account is intentionally not self-service; create it directly in MongoDB by changing a user document's `role` to `admin`.

## API

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/listings`, `POST /api/listings`, `PATCH /api/listings/:id`
- `POST /api/orders`, `GET /api/orders/mine`, `PATCH /api/orders/:id/status`
- `GET /api/admin/stats`, `GET/PATCH /api/admin/users`, `GET /api/admin/orders`

Business and customer capabilities are protected with JWT role checks. Create a business user to make listings; customer users can create pickup orders.
