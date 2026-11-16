# Forever Clothing Store

Expo Router clothing storefront and admin app for iOS, Android, and web.

## Run locally

```bash
npm install
npm run web
```

For Android or iOS, use `npm run android` or `npm run ios`.

## Features

- Product catalog seeded on first launch, product details, category browsing, name/category search, and price filtering.
- Customer registration, login, profile and address editing, favorites, cart quantity controls, checkout, and purchase history.
- Admin dashboard for account roles, product categories, products, and order status.
- Local persistent data stored with AsyncStorage.

## Admin demo account

- Email: `admin@forever.com`
- Password: `Admin123!`

The app seeds this administrator and the initial catalog the first time it runs. Account creation, checkout, and order management are local demo flows: there is no remote API, real payment processing, or cross-device synchronization. AsyncStorage is unencrypted; do not use real customer data or production credentials with this demo.

## Checks

```bash
npm run lint
npx tsc --noEmit
```
