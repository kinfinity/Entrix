import { HttpMethod } from 'aws-cdk-lib/aws-events'
import { Stack } from 'aws-cdk-lib'
import EntrixLambda, { EntrixLambdaProps } from '../lib/compute/lambda'
import EntrixAPIGatewayLambda from '../lib/constructs/apigatewaylambda'
import { Capture, Match, Template } from 'aws-cdk-lib/assertions'
import { beforeEach, describe, expect, it } from '@jest/globals'
import { log } from 'node:console'

describe('EntrixAPIGatewayLambda', () => {
  let stack: Stack

  beforeEach(() => {
    stack = new Stack()
  })

  it('should create API Gateway with Lambda integration for POST /orders', () => {
    
    // Arrange
    const postLambdaProps: EntrixLambdaProps = {
      repositoryName: "k_post_lambda",
      tag: "latest"
    }
    const lambdaName = 'TestEntrixLambda'
    const lambdaFunction = new EntrixLambda(stack, 'lambda_id', lambdaName, postLambdaProps)
    const httpMethod = HttpMethod.POST
    new EntrixAPIGatewayLambda(stack, 'TestEntrixAPIGatewayLambda', lambdaFunction, { httpMethod })

    // Prepare stack for Assertions
    const template = Template.fromStack(stack)

    // Capture Data
    const resourceIdCapture = new Capture()
    const restApiIdCapture = new Capture()
    const uriCapture = new Capture()

    // Debugging 
    // const apiGatewayTemplate = template.findResources("AWS::ApiGateway::Method")
    // log(apiGatewayTemplate)

    template.hasResource("AWS::ApiGateway::Method", {
      Properties: {
          AuthorizationType: 'NONE',
          HttpMethod: 'POST',
          ResourceId: { Ref: resourceIdCapture },
          RestApiId: { Ref: restApiIdCapture },
          Integration: {
            IntegrationHttpMethod: "POST",
            Type: "AWS_PROXY",
            Uri: uriCapture,
          }
        }
    })
    
    // Assert - API Gateway
    expect(template.resourceCountIs('AWS::ApiGateway::RestApi', 1))
    expect(template.resourceCountIs('AWS::ApiGateway::Method', 1))
    expect(template.resourceCountIs('AWS::Lambda::Function', 1))

    // Assert - API Gateway resource
    expect(resourceIdCapture.asString()).toBeDefined()
    expect(restApiIdCapture.asString()).toBeDefined()

    // Assert - Lambda Integration for POST /orders
    expect(uriCapture.asObject()).toMatchObject({
      "Fn::Join": [
        "",
        [
          "arn:",
          { "Ref": "AWS::Partition" },
          ":apigateway:",
          { "Ref": "AWS::Region" },
          ":lambda:path/2015-03-31/functions/",
          { "Fn::GetAtt": [ new RegExp(`.*${lambdaFunction}.*`), "Arn"] },
          "/invocations",
        ],
      ]
    })
    
    // // Assert - Output
    // expect(template.hasOutput("EndpointURL", {
    //   Value: Match.stringLikeRegexp("*execute-api*"),
    // }))

  })
})
