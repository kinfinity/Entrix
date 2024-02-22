import { Stack, StackProps } from 'aws-cdk-lib'
import { CronOptions } from 'aws-cdk-lib/aws-events'
import EntrixS3 from './storage/s3'
import EntrixDynamoDB from './storage/dynamodb'
import EntrixLambda, { EntrixLambdaProps } from './compute/lambda'
import EntrixLambdaDynamoDB from './constructs/lambda-access-dynamodb'
import EntrixAPIGatewayLambda from './constructs/apigatewaylambda'
import EntrixDataPipeline, { EntrixDataPipelineProps } from './constructs/datapipeline'
import EntrixLambdaS3 from './constructs/lambda-access-s3'
import { Construct } from 'constructs'

export class EntrixStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {

    super(scope, id, props)

    // Create S3 Bucket
    const bucket: EntrixS3 = new EntrixS3( this, id, "entrix-orders-bucket")

    // Create DynamoDB Table
    const dynamoDB: EntrixDynamoDB = new EntrixDynamoDB(this, id, "orders-table")

    // Create Post Lambda
    const postLambdaProps: EntrixLambdaProps = {
      repositoryName: "k_post_lambda",
      tag: "latest"
    }
    const postLambda: EntrixLambda = new EntrixLambda(this, id, "k_post_lambda" )

    // Attach DYnamoDB Permission
    new EntrixLambdaDynamoDB(this, id, postLambda, dynamoDB)

    // Create   API Gateway w Lambda
    new EntrixAPIGatewayLambda(this, id, postLambda)

    // Create Data Pipeline Lambdas
    // A -
    const lambdaAProps: EntrixLambdaProps = {
      repositoryName: "k_lambda_a",
      tag: "latest"
    }
    const lambdaA: EntrixLambda = new EntrixLambda(this, id, "k_lambda_a" , lambdaAProps)
    // B -
    const lambdaBProps: EntrixLambdaProps = {
      repositoryName: "k_lambda_b",
      tag: "latest"
    }
    const lambdaB: EntrixLambda = new EntrixLambda(this, id, "k_lambda_b" , lambdaBProps)

    // Attach Permissions
    new EntrixLambdaDynamoDB(this, id, lambdaA, dynamoDB)
    new EntrixLambdaS3(this, id, lambdaB, bucket)

    // Create Data Pipeline
    const cron: CronOptions = { minute: '*/10' }
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
