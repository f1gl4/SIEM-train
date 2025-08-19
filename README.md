# Project VAJ

## Instructions

### 1. Clone repository:
```bash
git clone https://github.com/vsb-vaj/2025s-project-iam0001.git
cd 2025s-project-iam0001
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

**Home page**
![image](https://github.com/user-attachments/assets/d0eb97ff-b9c9-4c60-b68e-964882bf416b)

**Malware List**
![image](https://github.com/user-attachments/assets/fdf020b2-0d67-4063-af89-c01ef6b6f650)

**Malware Detail**
![image](https://github.com/user-attachments/assets/ed4ff771-6a9c-48b4-96e1-de153f1d8808)

**Infection Stats**
![image](https://github.com/user-attachments/assets/ffad46b0-de9b-4886-a535-f5389b2d31dd)

