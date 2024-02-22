#!/bin/bash

set -eu

USAGE="USAGE:
${0} <lambda-directory>"

if [[ $# -ne 1 ]]; then
    echo "${USAGE}" >&2
    exit 1
fi

# lambda directory should be the name of the lambda
[ -d  "lambda/${1}" ] || mkdir  lambda/${1}

LAMBDA_DIR="$(cd "lambda/${1}"; pwd -P)"
pushd ${LAMBDA_DIR} > /dev/null

poetry init -n
poetry add boto3
poetry add mypy-boto3
poetry add black
poetry add docopt
poetry add types-docopt
poetry add mypy
poetry add isort
poetry add pylint
poetry add asyncio
poetry add requests
poetry add pytest
poetry add pytest-cov

# install
poetry install --no-interaction --remove-untracked

popd > /dev/null