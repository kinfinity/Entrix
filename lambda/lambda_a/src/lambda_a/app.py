"""
Module docstring: 
    Lambda A Generates T/F Values to trigger Lambda B or trigger itself
"""

import os
import random
from typing import Any, Dict, Optional

import boto3
from botocore.exceptions import ClientError

TABLE_NAME = os.environ["DYNAMODB_TABLE_NAME"]
dynamodb = boto3.client("dynamodb")


def retrieve_items_from_dynamodb(table_name):

    try:
        # Retrieve the item
        response = dynamodb.scan(TableName=table_name)

        # Check if the item exists in the response
        if "Item" in response:
            return response["Item"]["orders"]
        return None

    except ClientError as e:
        print(f"Error: {e}")
        return None


def gen_random() -> Dict[str, Any]:
    """Generate Random T/F"""
    return {"results": random.choice([True, False])}


def lambda_handler(event: Dict[str, Any], context: Optional[Any]) -> Dict[str, Any]:
    """Generate event for results processing."""
    response = gen_random()
    if response["results"]:
        # T => Get Orders from DynamoDB
        response["orders"] = retrieve_items_from_dynamodb(table_name=TABLE_NAME)
    return response
