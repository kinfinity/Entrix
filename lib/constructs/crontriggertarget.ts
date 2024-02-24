import { StateMachine } from 'aws-cdk-lib/aws-stepfunctions'
import { Construct } from 'constructs'
import EntrixEventBridgeCron from '../integration/eventbridge'
import { SfnStateMachine } from 'aws-cdk-lib/aws-events-targets'


class EntrixCronTriggerTarget extends Construct {

    constructor(scope: Construct, id: string, eventBridgeCron: EntrixEventBridgeCron, stateMachine: StateMachine  ) {
        super(scope,`entrix-${id}-cron_super`)
        
        eventBridgeCron.Cron.addTarget(new SfnStateMachine(stateMachine))

    }

}

export default EntrixCronTriggerTarget
