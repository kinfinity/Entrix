import { Duration } from "aws-cdk-lib"
import { Table } from "aws-cdk-lib/aws-dynamodb"
import { IFunction } from "aws-cdk-lib/aws-lambda"
import { Bucket } from "aws-cdk-lib/aws-s3"
import { Choice, Condition, DefinitionBody, Pass, StateMachine } from "aws-cdk-lib/aws-stepfunctions"
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks"
import EntrixEventBridgeCron from "../integration/eventbridge"
import { CronOptions } from "aws-cdk-lib/aws-events"
import { Construct } from "constructs"
import EntrixCronTriggerTarget from "./crontriggertarget"


export interface EntrixDataPipelineProps {
  lambdaA: IFunction
  lambdaB: IFunction
  s3Bucket: Bucket
  dynamodbTable: Table
  cronOptions: CronOptions
}

class EntrixDataPipeline extends Construct {

    private readonly stateMachine: StateMachine

    constructor(scope: Construct, id: string, props: EntrixDataPipelineProps) {
        super(scope, `entrix-${id}-statemachine_super`)

        // Lambda A Task
        const lambdaATask = new LambdaInvoke(this, `entrix-${id}-${props.lambdaA.functionName}-task`, {
        lambdaFunction: props.lambdaA,
        outputPath: '$.Payload',
        })

        // Lambda B Task
        const lambdaBTask = new LambdaInvoke(this, `entrix-${id}-${props.lambdaB.functionName}-lambdatask`, {
            lambdaFunction: props.lambdaB,
            outputPath: '$.Payload',
        })

        // Control - check Lambda A Result into Retry  or Lambda B
        const choice = new Choice(this, `entrix-${id}-${props.lambdaA.functionName}-choice`)
        const condition = Condition.booleanEquals('$.results', false)
        const finish = new Pass(this, 'Finish')

        // Create State Machine
        this.stateMachine = new StateMachine(
            this, 
            `entrix-${id}-statemachine`, 
            {
                definitionBody: DefinitionBody.fromChainable(
                    lambdaATask
                    .next(
                        choice.when(condition, lambdaATask)
                        .otherwise(lambdaBTask)
                    )
                ),
                timeout: Duration.minutes(5)
            }
        )

        // Allow S3 Access
        if (props.s3Bucket !== undefined){
            props.s3Bucket.grantReadWrite(this.stateMachine)
        }

        // Allow DynamoDB Access
        if (props.dynamodbTable !== undefined){
            props.dynamodbTable.grantFullAccess(this.stateMachine)
        }

        // Setup Trigger
        const cron = new EntrixEventBridgeCron(this, id, props.cronOptions)
        new EntrixCronTriggerTarget(this,id, cron, this.stateMachine )
        
  }


  get  StateMachine(): StateMachine{
    return this.stateMachine
  }
}

export default EntrixDataPipeline
