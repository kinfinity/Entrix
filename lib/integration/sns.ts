import { Topic } from 'aws-cdk-lib/aws-sns'
import { Construct } from 'constructs'

interface EntrixSNSProps {
  topicName: string
}

class EntrixSNS extends Construct {
  private readonly topic: Topic

  constructor(scope: Construct, id: string, props: EntrixSNSProps) {
    super(scope, `entrix-${id}-sns-topic`)

    // Create SNS Topic
    this.topic = new Topic(this, `entrix-${id}-sns-topic`, {
      displayName: props.topicName
    })
  }

  /**
   * Getter for the underlying CDK SNS Topic object.
   */
  get Topic(): Topic {
    return this.topic
  }
}

export default EntrixSNS
