#!/bin/bash

set -eu

USAGE="USAGE:
${0} <lambda-directory> <service-name> <ecr-region> <ecr-registry>  <base-image-tag> <dockerfile>"

if [[ $# -ne 6 ]]; then
    echo "${USAGE}" >&2
    exit 1
fi

# Prepare vars
LAMBDA_NAME="${2}"
REGION="${3}"
REGISTRY="${4}"
IMAGE_TAG="${5}"
DOCKERFILE="${6}"

# Get absolute path of docker files dir
LAMBDA_DIR="$(cd "${1}"; pwd -P)"
pushd ${LAMBDA_DIR} > /dev/null

# LOGIN TO ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $REGISTRY
# Check if the repository exists else create
repository_exists=$(aws ecr describe-repositories --repository-names k_${LAMBDA_NAME} --region ${REGION} --output json 2>/dev/null)
if [ -z "$repository_exists" ];then
    aws ecr create-repository --repository-name k_${LAMBDA_NAME} --region ${REGION}
fi

# BUILD IMAGE  & PUSH
echo Docker Build and Push
PUSH_TAG=$REGISTRY/k_${LAMBDA_NAME}:"latest"
echo $PUSH_TAG
docker build --build-arg LAMBDA_NAME=${LAMBDA_NAME} -t $IMAGE_TAG -t $PUSH_TAG --no-cache=true -f $DOCKERFILE .
docker push $PUSH_TAG
