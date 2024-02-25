import json
import os
from unittest.mock import MagicMock, call, patch

import pytest

from post_lambda.app import lambda_handler, save_to_db, validate_orders

TABLE_NAME = os.environ["DYNAMODB_TABLE_NAME"]

# Sample Order Data for Testing
sample_order_data: dict = {
    "orders": [
        {"order_id": 1, "product": "Product1", "power": 2},
        {"order_id": 2, "product": "Product2", "power": 1},
    ]
}


@pytest.fixture
def context():
    return MagicMock()


# Mocking DynamoDB Table Name
@patch("post_lambda.app.TABLE_NAME", "mock-dynamodb-table")
def test_validate_orders():
    orders_schema = validate_orders(sample_order_data)
    if orders_schema is not None:
        assert len(orders_schema) == 2
        assert orders_schema[0].order_id == 1
        assert orders_schema[1].product == "Product2"


@patch("post_lambda.app.validate_orders", side_effect=lambda x: x)
@patch("post_lambda.app.save_to_db")
def test_lambda_handler_successful(save_to_db, validate_orders):
    event = {
        "httpMethod": "POST",
        "path": "/api",
        "body": json.dumps(sample_order_data),
    }

    response = lambda_handler(event, context)

    assert response["statusCode"] == 201
    assert validate_orders.call_args_list == [call(sample_order_data)]
    assert save_to_db.call_args_list == [call(records=sample_order_data)]


def test_lambda_handler_empty_body():
    event = {"httpMethod": "POST", "path": "/api", "body": None}

    response = lambda_handler(event, context)

    if response is not None:
        assert response["statusCode"] == 400
        assert "Request body is empty" in response["body"]
    else:
        print("Response: " + str(response))


def test_lambda_handler_json_decode_error():
    event = {"httpMethod": "POST", "path": "/api", "body": "invalid json"}

    response = lambda_handler(event, context)

    if response is not None:
        assert response["statusCode"] == 400
        assert "JSON decoding failed" in response["body"]
    else:
        print("Response: " + str(response))
