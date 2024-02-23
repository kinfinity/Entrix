import { Capture, Match, Template } from "aws-cdk-lib/assertions"
import EntrixLambda, { EntrixLambdaProps } from '../lib/compute/lambda'
import { beforeEach, describe, expect, it } from '@jest/globals'
import { App, Stack, StackProps } from "aws-cdk-lib"
import { log } from "console"

describe('EntrixLambda', () => {
  let app: App
  let stackProps: StackProps
  let stack: Stack

  beforeEach(() => {
    app = new App()
    stackProps = {
      env: {
        account: '830962405258',
        region: 'eu-west-1',
      },
    }
    stack = new Stack(app, 'LambaTestStack', stackProps)
  })

  it('should create Lambda function', () => {

    // Arrange
    const testLambdaProps: EntrixLambdaProps = {
      repositoryName: 'TestEntrixLambdaRepo',
      tag: "latest"
    }
    const functionName = 'TestEntrixLambda'
    new EntrixLambda(stack, "lambda_id", functionName, testLambdaProps)

    // Prepare stack for Assertions
    const template = Template.fromStack(stack)

    // Check template
    template.hasResource("AWS::Lambda::Function", {
        Properties: {
          FunctionName: functionName
        }
      })
      
    // Assert - API Gateway
    expect(template.resourceCountIs('AWS::Lambda::Function', 1))
      
  })

  it('should use the correct ECR repository', () => {

    // Arrange
    const testLambdaProps: EntrixLambdaProps = {
      repositoryName: 'TestEntrixLambdaRepo',
      tag: "latest"
    }
    const functionName = 'TestEntrixLambda'
    const lambda = new EntrixLambda(stack, "lambda_id", functionName, testLambdaProps)

    // Prepare stack for Assertions
    const template = Template.fromStack(stack)
 
    // Capture Data 
    const codeCapture = new Capture()
    
    // Assert
    template.hasResource("AWS::Lambda::Function", {
      Properties: {
        FunctionName: functionName,
        Code: codeCapture
      }
    })

    expect(codeCapture.asObject()).toMatchObject({
      "ImageUri": {
        "Fn::Join": [
          "",
          [
            new RegExp(`.*dkr.ecr.*`),
            {"Ref": "AWS::URLSuffix"},
            `/${testLambdaProps.repositoryName}:${testLambdaProps.tag}`,
          ],
        ]
      }
    })
        
  })

})
