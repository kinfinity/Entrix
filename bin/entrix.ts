#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { EntrixStack } from '../lib/entrix-stack'

// Initialize Application and Stack for Entrix Orders
const app = new cdk.App()
new EntrixStack(app, 'Orders')
