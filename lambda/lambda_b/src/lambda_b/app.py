"""
Module docstring: 
    Lambda B is triggered by an event from Lambda A 
    - dumps data to s3
    - on error invokes slack ? > just implement sending a notification to SNS
"""

import datetime as dt
import json
import os
from typing import Any

import boto3

LOG_BUCKET = os.environ["LOG_BUCKET"]
SNS_TOPIC_ARN = os.environ["SNS_TOPIC_ARN"]

s3 = boto3.client("s3")
sns = boto3.client("sns")


def save_to_s3(data: dict[str, Any], filename: str):
    """Save data to the s3 bucket.

    Parameters
    ----------
    data: dict[str, Any]
        The data to save to s3 bucket.
    filename: str
        The full object name for the file.
    """
    s3.put_object(Bucket=LOG_BUCKET, Key=f"{filename}.json", Body=json.dumps(data))


def send_sns_notification(message: str):
    """Send notification to SNS topic.

    Parameters
    ----------
    message: str
        The message to be sent in the notification.
    """
    sns.publish(TopicArn=SNS_TOPIC_ARN, Message=message)


def lambda_handler(event, context):
    """Process order result.

    All accepted orders get aggregated and sent to S3
    All rejected orders or errors to slack

    """
    rejected_orders = []
    try:
        accepted_orders = []
        if event["results"]:
            for order in event["orders"]:
                if order["status"] == "rejected":
                    print(f"{json.dumps(order)} Order status is rejected!")
                    rejected_orders.append(order)
                if order["status"] == "accepted":
                    print(f"{json.dumps(order)} Order status is accepted!")
                    accepted_orders.append(order)
        save_to_s3(
            data=accepted_orders,
            filename=f"orders/order_{dt.datetime.now(dt.timezone.utc).isoformat()}",
        )
        send_sns_notification(json.dumps(rejected_orders))
    except Exception as e:
        error_message = f"Key: {str(e)}"
        send_sns_notification(error_message)
        raise KeyError(error_message) from e
