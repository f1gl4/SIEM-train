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

npx prisma migrate dev --name init
npx prisma db seed

npm run dev
```
### Set OpenAI API key
The SIEM alert generation and evaluation endpoints require an OpenAI key.

Before starting the back-end, set the enviroment variable 'OPENAI_API_KEY'.

``` export OPENAI_API_KEY="your_key_here" ```

### 3. Front-end:
```bash
cd fe
npm i

npm run dev
```

Now, you can go to localhost:5173!


### SIEM

<img width="1788" height="457" alt="image" src="https://github.com/user-attachments/assets/85ceb466-1283-4daa-b371-b75ee78fb8df" />


### GENERATE

<img width="1788" height="854" alt="image" src="https://github.com/user-attachments/assets/63f33d04-e833-4de6-8c32-9b4aeca47cab" />


### EVALUATE

<img width="1788" height="630" alt="image" src="https://github.com/user-attachments/assets/46e2a12b-975e-4f0c-b8e5-3ed382dce952" />

<img width="1788" height="567" alt="image" src="https://github.com/user-attachments/assets/ac82c56e-59b9-42af-862e-79ed480dbd13" />


### STATS

<img width="1788" height="625" alt="image" src="https://github.com/user-attachments/assets/051f1c48-0a83-4d8d-b49b-84101fd93073" />


### THREATS

<img width="1788" height="838" alt="image" src="https://github.com/user-attachments/assets/64e4aec3-0dc1-488c-b7fa-54c30732621c" />

