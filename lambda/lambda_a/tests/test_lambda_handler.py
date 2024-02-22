from typing import Any, Dict

import pytest

# from lambda_a.src.lambda_a.app import lambda_handler


def test_lambda_handler_acceptance():
    # Generate an event that should result in accepted orders
    event: Dict[str, Any] = {"key": "value"}
    # response: Dict[str, Any] = lambda_handler(event, None)

    # assert response["results"] is True
    # assert "orders" in response
    # assert len(response["orders"]) == 2
    # assert response["orders"][0]["status"] == "accepted"


def test_lambda_handler_rejection():
    # Generate an event that should result in rejected orders
    event: Dict[str, Any] = {"key": "value"}
    # response: Dict[str, Any] = lambda_handler(event, None)

    # assert response["results"] is False
    # assert "orders" not in response
