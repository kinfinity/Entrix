import { Construct } from 'constructs'
import EntrixLambda from '../compute/lambda'
import EntrixS3 from '../storage/s3'
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';


class EntrixLambdaS3 extends Construct {

    private readonly backend: IFunction
    private readonly s3: Bucket
    
    constructor(scope: Construct, id: string, lambdaFunction: EntrixLambda, s3: EntrixS3 ) {
        super(scope, id)
        
        this.backend =  lambdaFunction.Function
        if (!this.backend){ throw new Error('No lambda function defined')}
        
        this.s3 =  s3.Bucket
        if (!this.backend){ throw new Error('No S3 Bucket defined')}
        
        // Grant Lambda access to S3 Bucket
        this.s3.grantReadWrite(lambdaFunction.Function)

    }

}

export default EntrixLambdaS3
