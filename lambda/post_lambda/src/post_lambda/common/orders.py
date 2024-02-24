"""
Handle Orders
"""

import random
from typing import List

from pydantic import BaseModel


class OrderItem(BaseModel):
    """Base order"""

    order_id: int
    product: str
    status: str
    power: int


class OrdersSchema(BaseModel):
    """Order list schema"""

    orders: List[OrderItem]

    @classmethod
    def from_dict(cls, input_dict: dict):
        """Create Orders with all values"""
        try:
            orders = [
                OrderItem(
                    order_id=item["order_id"],
                    product=item["product"],
                    status=random.choice(["accepted", "rejected"]),
                    power=item["power"],
                )
                for item in input_dict.get("orders", [])
            ]

            return cls(orders=orders)
        except Exception as e:
            raise Exception(f"Validation error: {e}") from e
