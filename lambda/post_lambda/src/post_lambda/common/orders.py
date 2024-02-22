import random
from typing import List

from pydantic import BaseModel


class OrderItem(BaseModel):
    status: str
    power: int


class OrdersSchema(BaseModel):
    orders: List[OrderItem]

    @classmethod
    def from_dict(cls, input_dict: dict):
        try:
            orders = [
                OrderItem(
                    status=random.choice(["accepted", "rejected"]), power=item["power"]
                )
                for item in input_dict.get("orders", [])
            ]

            return cls(orders=orders)
        except Exception as e:
            raise Exception(f"Validation error: {e}")
