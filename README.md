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
```
#### Set OpenAI API key
The SIEM alert generation and evaluation endpoints require an OpenAI key.

Before starting the back-end, set the enviroment variable 'OPENAI_API_KEY'.

``` 
echo "OPENAI_API_KEY=your_api_key" > .env
```
Now, run the back-end:

``` npm run dev ```

### 3. Front-end:
```bash
cd fe
npm i

npm run dev
```

Now, you can go to localhost:5173!


### SIEM

<img width="1443" height="403" alt="image" src="https://github.com/user-attachments/assets/3afd9f2e-6da9-463e-94a1-4f1d1fa10390" />


### GENERATE

<img width="1443" height="781" alt="image" src="https://github.com/user-attachments/assets/26f76dbc-614a-42bb-9696-540b044c0122" />


### EVALUATE

<img width="1788" height="630" alt="image" src="https://github.com/user-attachments/assets/46e2a12b-975e-4f0c-b8e5-3ed382dce952" />

<img width="1788" height="567" alt="image" src="https://github.com/user-attachments/assets/ac82c56e-59b9-42af-862e-79ed480dbd13" />


### STATS

<img width="1788" height="625" alt="image" src="https://github.com/user-attachments/assets/051f1c48-0a83-4d8d-b49b-84101fd93073" />


### THREATS

<img width="1788" height="838" alt="image" src="https://github.com/user-attachments/assets/64e4aec3-0dc1-488c-b7fa-54c30732621c" />

