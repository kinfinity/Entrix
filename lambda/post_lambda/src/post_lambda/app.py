"""
    Post Lambda  Function Processing
"""

import json
import logging
import os
from typing import Any

import boto3

from post_lambda.common.orders import OrderItem, OrdersSchema

logger = logging.getLogger()
TABLE_NAME = os.environ["DYNAMODB_TABLE_NAME"]
dynamodb = boto3.client("dynamodb")


def save_to_db(records: list[dict[str, Any]]):
    """Save records to the DynamoDB table.

    Parameters
    ----------
    records: list[dict[str, Any]]
        The data to save to DynamoDB.
    """
    # saving records to the dynamoDB
    dynamodb.put_item(records)
    logger.info("Records are successfully saved to the DB table %s.", TABLE_NAME)


def validate_orders(orders: dict) -> list[OrdersSchema]:
    """Validate orders against the schema and return a list of validated items."""
    try:
        orders_schema = OrdersSchema.from_dict(orders)
        return orders_schema.orders
    except Exception as e:
        logger.error("Order validation failed: %s", str(e))
        raise


def lambda_handler(event, context):
    """Process POST request to the API."""
    logger.info(
        "Received %s request to %s endpoint", event["httpMethod"], event["path"]
    )
    # logger.info(
    #     "Trace ID:  %s", context.get_trace_id()
    # )  # Just incase we need extra debugging

    if (body := event.get("body")) is not None:
        try:
            orders: dict = json.loads(body)
            validated_orders = validate_orders(orders)
            logger.info("Orders received and validated: %s.", validated_orders)

            # Process Validated Orders
            if len(validated_orders) > 0:
                logger.info("Orders received: %s.", orders)
                save_to_db(records=orders)

            return {
                "isBase64Encoded": False,
                "statusCode": 201,
                "headers": {"Content-Type": "application/json"},
                "body": "",
            }

        except json.JSONDecodeError as e:
            logger.error("JSON decoding failed: %s", str(e))
    else:
        logger.error("Request body is empty")
        return {
            "isBase64Encoded": False,
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"errorMessage": "Request body is empty"}),
        }
