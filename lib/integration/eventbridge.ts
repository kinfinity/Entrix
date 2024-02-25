import { CronOptions, Rule, Schedule } from 'aws-cdk-lib/aws-events'
import { SfnStateMachine } from 'aws-cdk-lib/aws-events-targets'
import { StateMachine } from 'aws-cdk-lib/aws-stepfunctions'
import { Construct } from 'constructs'

export class EntrixEventBridgeCron extends Construct {
    
    private readonly  cron: Rule

    constructor(scope: Construct, id: string, cronOptions: CronOptions) {
        super(scope, id)

        // EventBridge cron Rule
        this.cron = new Rule(
            this, 
            `entrix-${id}-statemachine-cron`, 
            {
                schedule: Schedule.cron(cronOptions), 
            }
        )

    }
    
    get Cron() : Rule { return this.cron}

}

export default EntrixEventBridgeCron
