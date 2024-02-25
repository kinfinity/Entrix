import os
from typing import Any, Dict, Optional
from unittest.mock import MagicMock, call, patch

import pytest

from lambda_a.app import lambda_handler

TABLE_NAME = os.environ["DYNAMODB_TABLE_NAME"]


@pytest.fixture
def random_true_fixture() -> Dict[str, Any]:
    """True Fixture"""
    return {"results": True}


@pytest.fixture
def random_false() -> Dict[str, Any]:
    """False Fixture"""
    return {"results": False}


# Sample Order Data for Testing
sample_order_data: dict = {}


@pytest.fixture
def dynamodb_fetch():
    """fetched orders"""
    return {
        "orders": [
            {"order_id": 1, "product": "Product1", "power": 2, "status": "accepted"},
            {"order_id": 2, "product": "Product2", "power": 1, "status": "rejected"},
        ]
    }


@patch("lambda_a.app.gen_random")
@patch("lambda_a.app.retrieve_items_from_dynamodb")
@pytest.mark.usefixtures("random_true_fixture")
@pytest.mark.usefixtures("dynamodb_fetch")
def test_lambda_handler_accepted_orders(
    retrieve_items_from_dynamodb, gen_random, random_true_fixture, dynamodb_fetch
):
    gen_random.return_value = random_true_fixture
    retrieve_items_from_dynamodb.return_value = dynamodb_fetch
    # Act
    response = lambda_handler({"key": "value"}, None)

    # Assertions
    assert gen_random.call_args_list == [call()]
    assert retrieve_items_from_dynamodb.call_args_list == [call(table_name=TABLE_NAME)]
    if response["results"] is True:
        assert "orders" in response
        print(response["orders"]["orders"])
        assert len(response["orders"]["orders"]) == 2
        assert response["orders"]["orders"][0].get("status") == "accepted"


@patch("lambda_a.app.gen_random")
def test_lambda_handler_no_orders(gen_random, random_false):
    gen_random.return_value = random_false

    response = lambda_handler({"key": "value"}, None)

    # Assertions
    assert gen_random.call_args_list == [call()]
    if response["results"] is False:
        assert "orders" not in response
