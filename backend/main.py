from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
import os
from dotenv import load_dotenv

import models
import schemas
from database import engine, get_db
from auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    get_current_user,
    get_current_admin_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

load_dotenv()

# Database yaratish
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Shirin Magazin API")

# CORS sozlamalari
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production'da faqat frontend URL'ni qo'ying
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Boshlang'ich admin yaratish
@app.on_event("startup")
async def startup_event():
    db = next(get_db())
    admin_username = os.getenv("ADMIN_USERNAME", "admin")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    
    admin = db.query(models.User).filter(models.User.username == admin_username).first()
    if not admin:
        admin = models.User(
            username=admin_username,
            hashed_password=get_password_hash(admin_password),
            is_admin=True
        )
        db.add(admin)
        db.commit()
        print(f"Admin user created: {admin_username}")

# AUTH ENDPOINTS
@app.post("/auth/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password, is_admin=False)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/auth/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# CATEGORY ENDPOINTS
@app.get("/categories", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(models.Category).all()
    return categories

@app.post("/categories", response_model=schemas.Category)
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.put("/categories/{category_id}", response_model=schemas.Category)
def update_category(
    category_id: int,
    category: schemas.CategoryUpdate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for key, value in category.dict().items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

@app.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted successfully"}

# PRODUCT ENDPOINTS
@app.get("/products", response_model=List[schemas.Product])
def get_products(category_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Product)
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    products = query.all()
    return products

@app.get("/products/{product_id}", response_model=schemas.Product)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products", response_model=schemas.Product)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.put("/products/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int,
    product: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}

# CART ENDPOINTS (SERVER-SIDE CALCULATION)
@app.get("/cart", response_model=schemas.CartTotal)
def get_cart(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart_items = db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id
    ).all()
    
    # Server tomonida narxni hisoblash
    total = sum(item.product.price * item.quantity for item in cart_items)
    
    return {"items": cart_items, "total": total}

@app.post("/cart", response_model=schemas.CartItem)
def add_to_cart(
    cart_item: schemas.CartItemCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Mahsulot mavjudligini tekshirish
    product = db.query(models.Product).filter(
        models.Product.id == cart_item.product_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Savatda allaqachon bor-yo'qligini tekshirish
    existing_item = db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id,
        models.CartItem.product_id == cart_item.product_id
    ).first()
    
    if existing_item:
        existing_item.quantity += cart_item.quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item
    
    db_cart_item = models.CartItem(
        user_id=current_user.id,
        **cart_item.dict()
    )
    db.add(db_cart_item)
    db.commit()
    db.refresh(db_cart_item)
    return db_cart_item

@app.put("/cart/{item_id}")
def update_cart_item(
    item_id: int,
    quantity: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.user_id == current_user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    if quantity <= 0:
        db.delete(cart_item)
    else:
        cart_item.quantity = quantity
    
    db.commit()
    return {"message": "Cart updated successfully"}

@app.delete("/cart/{item_id}")
def delete_cart_item(
    item_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.user_id == current_user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart"}

@app.delete("/cart")
def clear_cart(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id
    ).delete()
    db.commit()
    return {"message": "Cart cleared successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
