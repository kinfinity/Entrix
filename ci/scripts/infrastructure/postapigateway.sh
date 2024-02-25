
set -eu

USAGE="USAGE:
${0} <API Gateway Endpoint> <json-request-file>"

if [[ $# -ne 2 ]]; then
    echo "${USAGE}" >&2
    exit 1
fi

API_GATEWAY_ENDPOINT="${1}"
REQUEST_FILE="${2}"

curl -X POST \
  -H "Content-Type: application/json" \
  -d @$REQUEST_FILE \
  $API_GATEWAY_ENDPOINT \
  -w "Status Code: %{http_code}\n"
