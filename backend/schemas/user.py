from pydantic import BaseModel

try:
    import email_validator  # noqa
    from pydantic import EmailStr
except Exception:
    EmailStr = str


class UserCreate(BaseModel):
    name: str
    email: EmailStr


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True