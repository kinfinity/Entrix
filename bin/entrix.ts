#!/usr/bin/env node
import { App } from 'aws-cdk-lib'
import { EntrixStack } from '../lib/entrix-stack'

// Initialize Application and Stack for Entrix Orders
const app = new App()
new EntrixStack(
    app,
    'Orders',
    {
        env: {
            account: process.env.AWS_ACCOUNT_ID,
            region: process.env.AWS_DEFAULT_REGION,
        }
    }
)
