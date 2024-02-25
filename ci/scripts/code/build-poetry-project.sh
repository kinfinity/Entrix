#!/bin/bash

set -eu

USAGE="USAGE:
${0} <project dir>"

if [[ $# < 1 ]]; then
    echo "${USAGE}" >&2
    exit 1
fi

PROJECT_DIR=$1

pushd ${PROJECT_DIR} > /dev/null
ROOT_MODULE_DIR=$(ls src)
PACKAGE_NAME=${ROOT_MODULE_DIR}

mkdir -p reports # for test reports

poetry install
poetry run pylint ${ROOT_MODULE_DIR}

# --check only in GHA
# poetry run black --check .  
# poetry run isort --check . 

# local build
poetry run black . 
poetry run isort . 

[ -d ${ROOT_MODULE_DIR}/tests ] & poetry run pytest --junitxml=../reports/${PACKAGE_NAME}-junit.xml
# poetry run mypy --ignore-missing-imports --junit-xml=../reports/${PACKAGE_NAME}-junit.xml . 

popd > /dev/null