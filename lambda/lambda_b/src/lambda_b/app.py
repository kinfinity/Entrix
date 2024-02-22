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


def save_to_s3(data: dict[str, Any], filename: str):
    """Save data to the s3 bucket.

    Parameters
    ----------
    data: dict[str, Any]
        The data to save to s3 bucket.
    filename: str
        The full object name for the file.
    """
    s3 = boto3.client("s3")
    s3.put_object(Bucket=LOG_BUCKET, Key=f"{filename}.json", Body=json.dumps(data))


def send_sns_notification(message: str):
    """Send notification to SNS topic.

    Parameters
    ----------
    message: str
        The message to be sent in the notification.
    """
    sns = boto3.client("sns")
    sns.publish(TopicArn=SNS_TOPIC_ARN, Message=message)


def lambda_handler(event, context):
    """Process order result."""
    try:
        if event["status"] == "rejected":
            raise ValueError("Order status is rejected!")
        save_to_s3(
            data=event,
            filename=f"orders/order_{dt.datetime.now(dt.timezone.utc).isoformat()}",
        )
    except Exception as e:
        error_message = f"Error processing order: {str(e)}"
        send_sns_notification(error_message)
        raise e
