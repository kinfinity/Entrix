import json
import os
import string
from typing import Any
from unittest.mock import MagicMock, call, patch

import pytest

from lambda_b.app import lambda_handler, save_to_s3, send_sns_notification

LOG_BUCKET = os.environ["LOG_BUCKET"]
SNS_TOPIC_ARN = os.environ["SNS_TOPIC_ARN"]


@pytest.fixture
def event() -> dict[str, Any]:
    event: dict[str, Any] = {
        "results": True,
        "orders": [
            {"status": "accepted", "power": 1},
            {"status": "rejected", "power": 2},
        ],
    }
    return event


@pytest.fixture
def context():
    return MagicMock()


@patch("lambda_b.app.s3")
def test_save_to_s3(s3):
    filename = "test_filename"
    data = {
        "results": True,
        "orders": [
            {"status": "accepted", "power": 1},
            {"status": "rejected", "power": 2},
        ],
    }
    save_to_s3(data, filename)

    assert s3.put_object.call_args_list == [
        call(
            Bucket=LOG_BUCKET,
            Key=f"{filename}.json",
            Body=json.dumps(
                {
                    "results": True,
                    "orders": [
                        {"status": "accepted", "power": 1},
                        {"status": "rejected", "power": 2},
                    ],
                }
            ),
        )
    ]


@patch("lambda_b.app.sns")
def test_send_sns_notification(sns):
    message = "Test message"
    send_sns_notification(message)

    sns.publish.assert_called_once_with(TopicArn=SNS_TOPIC_ARN, Message=message)


def test_lambda_handler_accepted_event(event, context):
    lambda_handler(event, context)


def test_lambda_handler_rejected_event(event, context):
    # result key not put to trigger KeyError and raise Exception
    event = {"orders": [{"status": "accepted", "power": 1}]}

    with pytest.raises(KeyError, match=""):
        lambda_handler(event, context)
