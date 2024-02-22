import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import EntrixLambda from '../compute/lambda'
import { HttpMethod } from 'aws-cdk-lib/aws-events'
import { LambdaRestApiProps } from 'aws-cdk-lib/aws-apigateway'

export interface EntrixAPIGatewayLambdaProps {
  httpMethod: HttpMethod
}

export class EntrixAPIGatewayLambda extends Construct {
    
    private readonly api: cdk.aws_apigateway.RestApi
    private readonly backend: cdk.aws_lambda.Function
    
    constructor(scope: Construct, id: string, lambdaFunction: EntrixLambda,props?: EntrixAPIGatewayLambdaProps) {
      
      super(scope, `entrix-${id}-apigateway_super`)

      this.backend =  lambdaFunction.Function
      if (!this.backend){ throw new Error('No lambda function defined')}

      let httpMethod = (props?.httpMethod) ? props.httpMethod : HttpMethod.POST
      let lambdaProps: LambdaRestApiProps = {
        handler: this.backend,
        proxy: false, // Disable default proxy behavior
        integrationOptions: {
          allowTestInvoke: false,
          timeout: cdk.Duration.seconds(25),
        },
      }
    
      // API Gateway
      this.api = new cdk.aws_apigateway.LambdaRestApi(
        this,
        `entrix-${id}-restapi`,
        lambdaProps
      )

      // Restrict -> POST /orders
      const ordersResource = this.api.root.addResource('orders');
      ordersResource.addMethod(httpMethod);

      new cdk.CfnOutput(scope, "EndpointURL", { value: this.api.url! })
    }
    
    public get url(): string | undefined { return this.api.url }
}

export default EntrixAPIGatewayLambda
