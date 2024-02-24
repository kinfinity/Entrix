import { Stack, StackProps } from 'aws-cdk-lib'
import { CronOptions, HttpMethod } from 'aws-cdk-lib/aws-events'
import EntrixS3 from './storage/s3'
import EntrixDynamoDB from './storage/dynamodb'
import EntrixLambda, { EntrixLambdaProps } from './compute/lambda'
import EntrixLambdaDynamoDB from './constructs/lambda-access-dynamodb'
import EntrixAPIGatewayLambda, { EntrixAPIGatewayLambdaProps } from './constructs/apigatewaylambda'
import EntrixDataPipeline, { EntrixDataPipelineProps } from './constructs/datapipeline'
import EntrixLambdaS3 from './constructs/lambda-access-s3'
import { Construct } from 'constructs'
import EntrixSNS from './integration/sns'

export class EntrixStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {

    super(scope, id, props)

    // Create S3 Bucket
    const bucket: EntrixS3 = new EntrixS3( this, id, "entrix-orders-bucket")

    // Create DynamoDB Table
    const dynamoDB: EntrixDynamoDB = new EntrixDynamoDB(this, id, "orders-table")

    // Create Post Lambda
    const postLambdaProps: EntrixLambdaProps = {
      repositoryName: "post_lambda",
      tag: "latest",
      environment: {
        DYNAMODB_TABLE_NAME: dynamoDB.Table.tableName,
        CMD: "post_lambda.app.lambda_handler"
      }
    }
    const postLambda: EntrixLambda = new EntrixLambda(this, id, "post_lambda",postLambdaProps )

    // Attach DYnamoDB Permission
    new EntrixLambdaDynamoDB(this, id, postLambda, dynamoDB)

    // Create   API Gateway w Lambda
    const entrixAPIGatewayLambdaProps: EntrixAPIGatewayLambdaProps = {
        httpMethod: HttpMethod.POST,
        path: "api"
    }
    new EntrixAPIGatewayLambda(this, id, postLambda, entrixAPIGatewayLambdaProps)

    // SNS 
    const snsTopic : EntrixSNS = new EntrixSNS(this, id, {topicName: "OrdersErrors2Slack"} )

    // Create Data Pipeline Lambdas
    // A -
    const lambdaAProps: EntrixLambdaProps = {
      repositoryName: "lambda_a",
      tag: "latest"
    }
    const lambdaA: EntrixLambda = new EntrixLambda(this, id, "lambda_a" , lambdaAProps)
    // B -
    const lambdaBProps: EntrixLambdaProps = {
      repositoryName: "lambda_b",
      tag: "latest",
      environment: {
        SNS_TOPIC_ARN: snsTopic.Topic.topicArn,
        LOG_BUCKET: bucket.Bucket.bucketName
      }
    }
    const lambdaB: EntrixLambda = new EntrixLambda(this, id, "lambda_b" , lambdaBProps)

    // Attach Permissions
    new EntrixLambdaDynamoDB(this, id, lambdaA, dynamoDB)
    new EntrixLambdaS3(this, id, lambdaB, bucket)
    snsTopic.Topic.grantPublish(lambdaB.Function)

    // Create Data Pipeline
    const cron: CronOptions = {  
      hour: '8',
      minute: '*/10' 
    }
    const dataPipelineProps: EntrixDataPipelineProps = {
      lambdaA: lambdaA.Function,
      lambdaB: lambdaB.Function,
      s3Bucket: bucket.Bucket,
      dynamodbTable: dynamoDB.Table,
      cronOptions: cron
    }
    
    new EntrixDataPipeline(this, id, dataPipelineProps)

  }
  
}
