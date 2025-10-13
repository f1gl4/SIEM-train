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


## SIEM

<img width="1796" height="536" alt="image" src="https://github.com/user-attachments/assets/f8077748-ca82-4318-be2d-fa1d8215a540" />

## GENERATE

<img width="1796" height="829" alt="image" src="https://github.com/user-attachments/assets/95e9eabc-bcae-4641-9d19-949c1977548f" />
