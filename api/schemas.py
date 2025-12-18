from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Category schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Product schemas
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    image_url: Optional[str] = None
    category_id: int
    stock: int = 0

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Cart schemas
class CartItemBase(BaseModel):
    product_id: int
    quantity: int

class CartItemCreate(CartItemBase):
    pass

class CartItem(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: Product
    
    class Config:
        from_attributes = True

class CartTotal(BaseModel):
    items: List[CartItem]
    total: float
