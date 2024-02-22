import { Construct } from 'constructs'
import EntrixLambda from '../compute/lambda'
import { IFunction } from 'aws-cdk-lib/aws-lambda'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { Stack } from 'aws-cdk-lib'
import EntrixDynamoDB from '../storage/dynamodb'
import { Table } from 'aws-cdk-lib/aws-dynamodb'

export interface EntrixLambdaDynamoDBProps {
    readonly tableName: string
}

export class EntrixLambdaDynamoDB extends Construct {
    
    private readonly backend: IFunction
    private readonly table:  Table
    
    constructor(scope: Construct, id: string, lambdaFunction: EntrixLambda,dynamodb: EntrixDynamoDB, props?: EntrixLambdaDynamoDBProps) {
      super(scope, `entrix-${id}-${lambdaFunction.Function.functionName}-lambda-dynamodb_super`)

      this.backend =  lambdaFunction.Function
      if (!this.backend){ throw new Error('No lambda function defined')}
      this.table =  dynamodb.Table
      if (!this.table){ throw new Error('No dynamodb table defined')}

      // get the table name
      const tableName = (props?.tableName) ? props.tableName :  this.table.tableName

      // Create DynamoDB permissions
      const dynamoDbTablePermissions = new PolicyStatement({
          actions: ['dynamodb:Scan', 'dynamodb:PutItem'],
          resources: [`arn:aws:dynamodb:${Stack.of(this).region}:${Stack.of(this).account}:table/${tableName}`]
      })

      // Add DynamoDB Permissions Function Execution Role
      this.backend.addToRolePolicy(dynamoDbTablePermissions)

    }

    // Get lambda function
    public get Lambda(): IFunction{ return this.backend }


}

export default EntrixLambdaDynamoDB
