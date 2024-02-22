"""
Module docstring: 
    Defines the Schema for the Order data handled by Application
"""

from typing import List

from pydantic import BaseModel


class OrderItem(BaseModel):
    """
    Represents an individual order item.

    Attributes:
        status (str): The status of the order.
        power (int): The power associated with the order.
    """

    status: str
    power: int


class OrdersSchema(BaseModel):
    """
    Represents a collection of order items.

    Attributes:
        orders (List[OrderItem]): List of order items.
    """

    orders: List[OrderItem]

    @classmethod
    def from_dict(cls, input_dict: dict):
        """
        Create an instance of OrdersSchema from a dictionary.

        Args:
            input_dict (dict): The input dictionary containing orders.

        Returns:
            OrdersSchema: An instance of OrdersSchema.

        Raises:
            ValueError: If there is a validation error.
        """
        try:
            orders = [OrderItem(**item) for item in input_dict.get("orders", [])]
            return cls(orders=orders)
        except Exception as e:
            raise ValueError(f"Validation error: {e}") from e
