# 📚 Academia – Backend

Academia is an advanced **Learning Management System (LMS)** similar to Udemy, with additional features such as **seminars, live events, messaging, an advanced instructor dashboard, an advanced admin dashboard, a bidding system for instructor services, and coin-based rewards**.

This repository contains the backend implementation, structured into:

* **`main/`** – Core backend service (APIs, authentication, payments, courses, events, messaging, bidding, coins, admin panel)
* **`infra/`** – Infrastructure configurations (k8s, terraform)
* **`transcoding-dev/`** – Video processing microservice (AWS S3, FFmpeg, ECS workflow)

Built with:

* **Node.js** + **TypeScript**
* **MongoDB** (Mongoose)
* **Redis** (Cache, Pub/Sub)
* **Apache Kafka** (Event streaming)
* **BullMQ** (Job queue)
* **Clean Layered Architecture** + **Repository Pattern** for maintainability and scalability

---

## 🖥️ Running Locally

### 1️⃣ Clone the repository

```bash
git clone https://github.com/MeghajMB/academia-backend.git
cd academia-backend
```

---

### 2️⃣ Set up `.env` for `main`

Inside the `main/` directory, create a `.env` file with the following variables:

```env
# ----- Server Config -----
PORT=5000
NODE_ENV=development
BACKEND_URL=http://localhost:5000
PUBLIC_IP=127.0.0.1

# ----- Database -----
MONGO_URI=mongodb://localhost:27017/academia

# ----- Mail -----
MAILTRAP_USER_ID=your_mailtrap_user_id
MAILTRAP_USER_PASSWORD=your_mailtrap_password

# ----- Kafka -----
KAFKA_CLIENT_ID=academia
KAFKA_BROKER=localhost:9092

# ----- Redis -----
REDIS_HOST=localhost
REDIS_PORT=6379

# ----- OpenAI -----
OPENAI_API_KEY=your_openai_api_key

# ----- Domain & Client -----
DOMAIN_NAME=localhost
CLIENT_URL=http://localhost:3000

# ----- JWT Secrets -----
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret
JWT_PASSWORD_RESET_SECRET=your_password_reset_secret

# ----- Google OAuth -----
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ----- Payments (Razorpay) -----
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEB_HOOK_SECRET=your_webhook_secret

# ----- AWS (S3 & CloudFront) -----
AWS_REGION=your_region
AWS_BUCKET_NAME=your_main_bucket
AWS_TEMP_BUCKET_NAME=your_temp_bucket
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_QUEUE_URL=your_s3_queue_url
CLOUDFRONT_DOMAIN=your_cloudfront_domain
CLOUDFRONT_KEY_PAIR_ID=your_key_pair_id
CLOUDFRONT_PRIVATE_KEY=your_private_key
```

💡 **Note:**

* This `.env` is **only for the `/main` service** (the core backend API).
* Replace all placeholder values with your actual credentials.

---

### 3️⃣ Run Redis and Kafka Locally

Both **Redis** and **Kafka** must be running for the backend to work.
You can start them using Docker or other installation methods.

Example using Docker:

```bash
# Start Redis
docker run -d --name redis -p 6379:6379 redis

# Start Kafka (requires Docker version >= 3.3 to run without ZooKeeper)
docker run -d --name kafka -p 9092:9092 apache/kafka
```

If your Kafka version requires ZooKeeper, refer to the official Kafka documentation or a YouTube guide.

---

### 4️⃣ Install dependencies and start `main`

```bash
cd main
npm install
npm run dev
```

The backend should now be running at:

```
http://localhost:5000
```

---

## 🖥️ Running the Transcoding Service Locally

The `transcoding-dev/` directory contains the **video processing microservice** responsible for:

* Listening to **Kafka** events for new uploads
* Fetching videos from the AWS S3 temporary bucket
* Transcoding videos via **FFmpeg**
* Uploading processed files to the permanent S3 bucket

---

### 1️⃣ Set up `.env` for `transcoding-dev`

Inside `transcoding-dev/`, create a `.env` file with the following variables:

```env
# ----- Environment -----
NODE_ENV=development
PORT=3000

# ----- Kafka -----
KAFKA_BROKER=localhost:9092
KAFKA_CLIENT_ID=academia-transcoding

# ----- AWS -----
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_TEMP_BUCKET_NAME=your_temp_bucket
AWS_BUCKET_NAME=your_final_bucket
```

💡 **Notes:**

* `NODE_ENV` can be `development`, `production`, or `test`
* `PORT` defaults to **3000** if not set
* AWS bucket names should match those used in `/main` for video storage flow

---

### 2️⃣ Start Kafka (if not already running)

```bash
docker run -d --name kafka -p 9092:9092 apache/kafka
```

---

### 3️⃣ Install dependencies and start `transcoding-dev`

```bash
cd transcoding-dev
npm install
npm run dev
```

The transcoding service should now be running and listening for events from Kafka.

---

## 📜 License

MIT License © 2025 Meghaj M B

---