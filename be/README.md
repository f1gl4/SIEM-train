## Our backend API

### 2. Back-end:
```bash
cd be
npm i

npm prisma migrate dev --name init
npx prisma db seed

npm run dev
```