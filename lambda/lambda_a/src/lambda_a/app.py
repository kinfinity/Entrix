"""
Module docstring: 
    Lambda A Generates T/F Values to trigger Lambda B or trigger itself
"""

import os
import random
from typing import Any, Dict, Optional

import boto3

from lambda_a.common.orders import OrdersSchema

TABLE_NAME = os.environ["DYNAMODB_TABLE_NAME"]


def retrieve_orders_from_dynamodb():
    """Retrieve orders from DynamoDB."""
    dynamodb = boto3.client("dynamodb")
    response = dynamodb.scan(TableName=TABLE_NAME)
    orders: OrdersSchema = response["Items"]
    return orders


def lambda_handler(event: Dict[str, Any], context: Optional[Any]) -> Dict[str, Any]:
    """Generate event for results processing."""
    response: Dict[str, Any] = {"results": random.choice([True, False])}
    if response["results"]:
        # iterate over orders from dynamodb
        orders = retrieve_orders_from_dynamodb()
        if not orders:
            print("No orders found.")
            # put in mechanism to filter out only new orders
        else:
            print(f"Found {len(orders)} new order(s).")
            response["orders"] = orders

    return response


#  response["orders"] = [
#                 {
#                     "status": "accepted",
#                     "power": 1,
#                 },
#                 {
#                     "status": "rejected",
#                     "power": 2,
#                 },
#             ]
