## Instructions

### 1. Clone repository:
```bash
git clone https://github.com/f1gl4/SIEM-train.git
cd SIEM-train
```

### 2. Back-end:
```bash
cd be
npm i

npm prisma migrate dev --name init
npx prisma db seed

npm run dev
```
### 3. Front-end:
```bash
cd fe
npm i

npm run dev
```

Now, you can go to localhost:5173!

