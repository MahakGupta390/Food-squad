# 🍔 FoodSquad – Smart Ordering & Bill Splitting Platform

FoodSquad is a full-stack web application that enables users to order food collaboratively, invite friends to a shared session, and split bills dynamically in real time.

---

## 🚀 Features

- 👥 **Group Ordering** – Create a session and invite friends via shareable link  
- 💸 **Dynamic Bill Splitting** – Automatically split bills among participants  
- 🔐 **Authentication & Security** – Secure login using Auth0  
- ⚡ **Real-time Collaboration** – Seamless updates using Socket.IO  
- 📱 **Responsive UI** – Optimized for all devices using Tailwind CSS  

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Auth0 Authentication
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- Socket.IO
- JWT Authentication (Auth0)

---

## 📂 Project Structure
FoodSquad/
│── frontend/ # React + Vite frontend
│── backend/ # Node.js + Express backend
│── README.md


---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/MahakGupta390/Food-squad/
cd foodsquad
2. Setup Backend
cd backend
npm install

Create a .env file in the backend folder:

MONGO_CONNECT_STRING="mongodb+srv://guptamahak364_db_user:NlkfeFnjeFloYnYC@food-order.uwj0snj.mongodb.net/?appName=Food-order"
#auth0
AUTH0_AUDIENCE=https://food-ordering-system
AUTH0_ISSUER_BASE_URL=https://dev-jo6xlkffyi568b1u.us.auth0.com/
FRONTEND_URL=https://food-squad-isxm.vercel.app
Run backend:

npm run dev
3. Setup Frontend
cd frontend
npm install
npm run dev
🔗 Live Demo

👉 https://food-squad-isxm.vercel.app/

📌 Future Improvements
🧾 Payment gateway integration (Stripe/Razorpay)
📊 Order history & analytics
🍽️ Restaurant recommendations
🔔 Push notifications
