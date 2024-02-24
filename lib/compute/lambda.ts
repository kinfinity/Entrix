import * as ecr from 'aws-cdk-lib/aws-ecr'
import { DockerImageCode, DockerImageFunction, DockerImageFunctionProps } from 'aws-cdk-lib/aws-lambda'
import { aws_lambda } from 'aws-cdk-lib'
import { Construct } from 'constructs'


export interface EntrixLambdaProps {
    repositoryName: string
    tag: string
    environment?: { [key: string]: string }
}

class EntrixLambda extends Construct {

    private readonly lambdaFunction: DockerImageFunction
    
    constructor(scope: Construct, id: string, functionName: string, props?:  EntrixLambdaProps) {
        super(scope, `entrix-${id}-${functionName}-lambda_super`)

        const repository =  (props?.repositoryName)? props.repositoryName: functionName
        const tag =  (props?.tag)? props.tag: "latest"
        // Get the ECR repository
        const repo = ecr.Repository.fromRepositoryName(this, `entrix-${id}-${functionName}-ecr`, repository)
        
        const ecrImageCodeProps: aws_lambda.EcrImageCodeProps = {
            tagOrDigest: tag,
            cmd: [`${functionName}.app.lambda_handler`]
          }
        const dockerImageFunctionProps: DockerImageFunctionProps = {
            functionName: `k_${functionName}`,
            code: DockerImageCode.fromEcr(repo, ecrImageCodeProps),
            memorySize: 256,
            environment: (props?.environment) ? props.environment : {}
        }

        const fn = new DockerImageFunction(this, `entrix-${id}-${functionName}-lambda`, dockerImageFunctionProps)

        this.lambdaFunction = fn
    }

    /**
     * Getter for the underlying CDK Lambda Function object.
     */    
    get Function(): DockerImageFunction  {
        return this.lambdaFunction
    }
}

export default EntrixLambda
