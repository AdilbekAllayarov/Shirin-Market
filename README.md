# Shirin Magazin - E-Commerce Platform

Full-stack e-commerce application with FastAPI backend and vanilla JavaScript frontend.

## Tech Stack

**Backend:**
- FastAPI 0.104.1
- SQLAlchemy 2.0.23
- SQLite
- python-jose 3.3.0 (JWT)
- passlib[bcrypt] 1.7.4
- CORS enabled

**Frontend:**
- HTML5
- CSS3
- JavaScript (ES6 modules)
- Bootstrap 5.3.2
- Fetch API

## Project Structure

```
backend/
├── main.py           # FastAPI app, all endpoints
├── models.py         # SQLAlchemy: User, Category, Product, CartItem
├── schemas.py        # Pydantic validation schemas
├── auth.py           # JWT tokens, password hashing, auth dependencies
├── database.py       # SQLAlchemy engine, SessionLocal, Base
├── requirements.txt  # Python dependencies
├── .env.example      # Environment variables template
└── .gitignore

frontend2/
├── index.html        # HTML structure with Bootstrap
├── css/
│   └── style.css     # Complete styling, responsive (768px, 480px breakpoints)
└── js/
    ├── main.js       # App logic, state management, event handlers
    ├── api.js        # API client, formatPrice function
    └── cart.js       # LocalCart class for guest users
```

## Installation & Setup

### Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Server runs on:** `http://192.168.1.4:8000` (network access)

### Frontend

```bash
cd frontend2

# Start HTTP server
python3 -m http.server 8080
```

**Frontend runs on:** `http://192.168.1.4:8080`

## API Endpoints

### Authentication
- `POST /auth/login` - Body: `{username, password}` → `{access_token, token_type}`
- `GET /auth/me` - Header: `Authorization: Bearer {token}` → User object

### Categories
- `GET /categories` - Returns list of categories
- `POST /categories` - Admin only, Body: `{name, description}`
- `DELETE /categories/{id}` - Admin only

### Products
- `GET /products` - Query: `?category_id={id}` (optional)
- `POST /products` - Admin only, Body: `{name, description, price, image_url, category_id, stock}`
- `PUT /products/{id}` - Admin only
- `DELETE /products/{id}` - Admin only

### Cart (Authenticated Users)
- `GET /cart` - Returns `{items: [], total: float}`
- `POST /cart` - Body: `{product_id, quantity}`
- `PUT /cart/{item_id}?quantity={qty}` - Update quantity
- `DELETE /cart/{item_id}` - Remove item
- `DELETE /cart` - Clear all items

## Database Models

### User
```python
id: Integer (PK)
username: String (unique)
hashed_password: String
is_admin: Boolean (default: False)
created_at: DateTime
```

### Category
```python
id: Integer (PK)
name: String (unique)
description: String (nullable)
created_at: DateTime
products: Relationship → Product[]
```

### Product
```python
id: Integer (PK)
name: String
description: String
price: Float
image_url: String (nullable)
category_id: Integer (FK)
stock: Integer
created_at: DateTime
category: Relationship → Category
cart_items: Relationship → CartItem[]
```

### CartItem
```python
id: Integer (PK)
user_id: Integer (FK)
product_id: Integer (FK)
quantity: Integer
created_at: DateTime
product: Relationship → Product
```

## Authentication

- Default admin: `username: admin`, `password: admin123`
- JWT tokens created with `ACCESS_TOKEN_EXPIRE_MINUTES = 30`
- Password hashing: bcrypt
- Auth header format: `Authorization: Bearer {token}`
- Bearer token extraction via HTTPBearer

## Cart System

**Authenticated Users:** Server-side cart calculation
- Cart items stored in `cart_items` table
- Total calculated on backend: `sum(item.product.price * item.quantity)`
- Prevents price manipulation

**Guest Users:** Client-side localStorage
- LocalCart class stores items in `localCart` key
- Methods: `add()`, `updateQuantity()`, `remove()`, `clear()`, `getTotal()`, `getItems()`

## Frontend Features

### Responsive Design
- **Desktop (960px+):** 2-column layout (products grid + sidebar cart)
- **Tablet (768px-960px):** 1-column layout, cart on top
- **Mobile (480px-768px):** Burger menu (☰), full-width layout, stack all inputs
- **Small Mobile (<480px):** Compact grid (160px cards), reduced font sizes

### UI Components
- Product cards: image, category pill, stock badge, price, action buttons
- Category filter: chip buttons, active state highlighting
- Search bar: text input, min/max price inputs
- Cart panel: sticky sidebar, item list, copy button, clear button
- Admin panel: category form, product form, item lists with edit/delete

### Styling
- CSS variables: `--accent: #2563eb`, `--border: #e5e7eb`, `--shadow`
- Border radius: 10px-20px
- Gap/spacing: 8px-16px
- Transitions: 120ms ease
- Background gradients

## Environment Variables

```env
DATABASE_URL=sqlite:///./shop.db
SECRET_KEY=your-secret-key-change-this-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## CORS Configuration

Allowed origins: `["*"]` (all origins)
Credentials: True
Methods: All
Headers: All

## HTTP Status Codes

- `200 OK` - Successful request
- `400 Bad Request` - Invalid input (e.g., duplicate username)
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Non-admin accessing admin endpoint
- `404 Not Found` - Resource not found

## Key Implementation Details

1. **Server-side cart total:** Backend sums `product.price * quantity` for security
2. **Guest cart persistence:** localStorage with JSON serialization
3. **Admin initialization:** Default admin created on app startup if not exists
4. **Price formatting:** `Intl.NumberFormat('ru-RU').format(price) + ' sum'`
5. **Burger menu:** Toggle with `menu-open` class on `.topbar`
6. **Image fallback:** `onerror` attribute loads placeholder from CDN
7. **Clipboard copy:** Modern Fetch API with document.execCommand fallback for mobile

## Performance Notes

- Static files served from `frontend2/` directory
- No build step required for frontend
- SQLite for simplicity (suitable for small to medium apps)
- Eager relationships for cart items (N+1 query prevention)

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guide.

**Quick Deploy:**
- Backend: Render.com (free tier)
- Frontend: Vercel/Netlify (free tier)
- Docker: `docker-compose up -d`

**Files for deployment:**
- `backend/Dockerfile` - Docker configuration
- `docker-compose.yml` - Multi-container setup
- `backend/.env.production` - Production environment template
- `frontend2/js/config.js` - Dynamic API URL configuration
# Shirin-Market
