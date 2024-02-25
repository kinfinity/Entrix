import { RemovalPolicy } from 'aws-cdk-lib'
import { Bucket, BucketProps } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'

class EntrixS3 extends Construct {

    private readonly  bucket: Bucket
    
    constructor(scope: Construct, id: string, bucketName:  string) {
        super(scope, `entrix-${id}-s3-bucket_super`)

        // Props
        const bucketProps : BucketProps  = {
            bucketName: bucketName,
            removalPolicy: RemovalPolicy.DESTROY
        }

        // Create S3 Bucket w Props
        this.bucket = new Bucket(
            this,
            `entrix-${id}-s3-bucket`,
            bucketProps
        )

    }

    /**
     * Getter for the underlying CDK S3 Bucket object.
     */
    get Bucket(): Bucket {
        return this.bucket
    }
}

export default EntrixS3
