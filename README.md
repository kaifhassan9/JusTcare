# JusTcare 

JusTcare is a **full-stack online pharmacy/medical store web application** currently under development.

The goal of this project is to provide a simple and user-friendly platform where customers can browse medicines and healthcare products, manage their cart, and place orders online.

> 🚧 **Status:** Under Development

## 🛠️ Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend & Database

* Next.js API Routes
* Prisma ORM
* PostgreSQL

### Development Tools

* Git & GitHub
* npm

## ✨ Current Features

* 🏠 Home page
* 💊 Medicine/product listing
* 🔎 Product browsing
* 📦 Product details
* 🛒 Shopping cart
* ➕ Add/remove products from cart
* 🔢 Update product quantity
* 💰 Cart total calculation
* 🗄️ Database integration with Prisma
* 👨‍💼 Product management
* 📋 Prescription-required product support

## 🚧 Currently Working On

* User authentication
* Checkout and order placement
* Order management
* Admin dashboard improvements
* Product management improvements
* UI/UX improvements
* Testing and bug fixing

## 📁 Project Structure

```text
JusTcare/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── public/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── context/
│   └── ...
│
├── .gitignore
├── package.json
├── prisma.config.ts
└── README.md
```

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/kaifhassan9/JusTcare.git
cd JusTcare
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="your_database_url"
```

> Never commit your `.env` file or expose database credentials/API keys on GitHub.

### 4. Run Prisma migrations

```bash
npx prisma migrate dev
```

### 5. Start the development server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

## 📌 Future Improvements

* User authentication and authorization
* Online order placement
* Order tracking
* Admin dashboard
* Payment integration
* Prescription upload
* Advanced product search and filtering
* Email notifications
* Improved responsive design

## 👨‍💻 Developer

**Kaif Hassan**

GitHub: [kaifhassan9](https://github.com/kaifhassan9)

⭐ This project is currently under active development.
