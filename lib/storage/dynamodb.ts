import { RemovalPolicy } from 'aws-cdk-lib'
import { AttributeType, Table, TableProps } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

class EntrixDynamoDB extends Construct {
    private readonly dynamoTable: Table
    
    constructor(scope: Construct, id: string, tableName: string) {
        super(scope, `entrix-${id}-dynamodb-table_super`)

        const tableprops: TableProps = {
            tableName: tableName,
            partitionKey: { name: 'primaryKey', type: AttributeType.STRING },
            removalPolicy: RemovalPolicy.DESTROY,
            readCapacity: 5,
            writeCapacity: 5,
        }

        // DynamoDB Table
        this.dynamoTable = new Table(
            this,
            `entrix-${id}-dynamodb-table`,
            tableprops
        ) 

        this.dynamoTable

    }

    /**
     * Getter for the underlying CDK DynamoDB Table object.
     */
    get Table(): Table {
        return this.dynamoTable
    }
}

export default EntrixDynamoDB
