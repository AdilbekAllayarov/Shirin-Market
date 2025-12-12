# Shirin Magazin - E-Commerce Platform

Complete full-stack e-commerce application with React/Vanilla JS frontend and FastAPI backend.

## 🌟 Features

- **Guest Shopping**: Browse and add to cart without registration
- **User Authentication**: Login with JWT tokens
- **Admin Panel**: Full CRUD operations for products and categories
- **Server-side Cart**: Calculations on server for security
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Search & Filter**: Find products by name, category, and price range
- **Mobile Menu**: Burger menu for small screens
- **Multiple Versions**: React and vanilla HTML/CSS/JS frontends

## 📁 Project Structure

```
Shirin-Magazin/
├── backend/           # FastAPI server
│   ├── main.py       # API endpoints
│   ├── models.py     # Database models
│   ├── schemas.py    # Pydantic schemas
│   ├── auth.py       # JWT authentication
│   ├── database.py   # SQLAlchemy setup
│   └── requirements.txt
├── frontend/         # React+Vite app
│   └── src/
│       ├── App.jsx
│       ├── components/
│       └── api/
├── frontend2/        # Vanilla JS version
│   ├── index.html
│   ├── css/
│   └── js/
└── README.md
```

## 🚀 Quick Start

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file (optional, defaults provided)
cp .env.example .env

# Run server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Server runs on: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### Frontend - React Version

```bash
cd frontend
npm install
npm run dev
```

Runs on: `http://localhost:5173`

### Frontend - Vanilla JS Version

```bash
cd frontend2
python3 -m http.server 8080
```

Runs on: `http://localhost:8080`

## 👤 Default Credentials

- **Username**: admin
- **Password**: admin123

## 🔌 API Endpoints

### Authentication
- `POST /auth/login` - Login user
- `POST /auth/register` - Register new user
- `GET /auth/me` - Get current user info

### Categories
- `GET /categories` - List all categories
- `POST /categories` - Create category (admin only)
- `DELETE /categories/{id}` - Delete category (admin only)

### Products
- `GET /products` - List products (with optional category filter)
- `POST /products` - Create product (admin only)
- `PUT /products/{id}` - Update product (admin only)
- `DELETE /products/{id}` - Delete product (admin only)

### Cart (Authenticated Users)
- `GET /cart` - Get user's cart
- `POST /cart` - Add item to cart
- `PUT /cart/{item_id}` - Update quantity
- `DELETE /cart/{item_id}` - Remove from cart
- `DELETE /cart` - Clear entire cart

## 🛠 Technologies

**Backend:**
- FastAPI
- SQLAlchemy
- SQLite
- JWT (python-jose)
- Bcrypt

**Frontend (React):**
- React 19
- Vite
- Axios
- CSS3

**Frontend (Vanilla):**
- HTML5
- CSS3
- Vanilla JavaScript (ES6 modules)
- Bootstrap 5

## 📱 Features Details

### Guest Mode
- Browse products without login
- Add to cart (stored in localStorage)
- Cart persists across sessions

### Admin Features
- Create, read, update, delete products
- Manage product categories
- View all products
- Set product stock levels
- Add product images

### User Features
- Server-side cart calculation
- Cart synchronization across sessions
- Search products by name
- Filter by category and price range
- Copy cart to clipboard

## 🌐 Network Access

To access from mobile on the same network:
1. Find your machine's IP: `ifconfig` (macOS/Linux) or `ipconfig` (Windows)
2. Backend: `http://<YOUR_IP>:8000`
3. Frontend: `http://<YOUR_IP>:8080` (vanilla) or `http://<YOUR_IP>:5173` (React)

## 📝 Environment Variables

```env
DATABASE_URL=sqlite:///./shop.db
SECRET_KEY=your-secret-key-change-this-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## 🔒 Security Notes

- Passwords are hashed with bcrypt
- Cart totals calculated on server (prevents price manipulation)
- JWT tokens for authentication
- CORS enabled (configure origins in production)

## 📄 License

MIT License - feel free to use this project for learning and development.

---

**Built with ❤️ for e-commerce learning**
