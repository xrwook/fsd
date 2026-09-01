#!/bin/bash

FILE="/Users/wookhuh/Desktop/project/hyundai/202601_hec_CPO_MVP/keycloakify-starter-main/src/login/assets/images/login-logo.svg"
TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJaR01SUHI5OVg2d2FaWGVfWVNyNkh2SUp2UHA4UGd0ZmpwRHo2TjFEVUxZIn0.eyJleHAiOjE3ODgyMjU1NDYsImlhdCI6MTc4ODIyNDM0NiwianRpIjoiNzg4MjIzNzkyLCJqdGkiOiJybnJ0cnQ6NjYxNDdlZTEtYTY1ZC0zYjQyLTM4ZDQtNjFjNjdhYjg0YTd1IiwiaXNzIjoiaHR0cHM6Ly9kZXYtYXV0aC51LWNhcC5jby5rci9hdXRoL3JlYWxtcy91Y21uIiwiaXVkIjoiYWNjb3VudCIsInN1YiI6IjIwMTM2MGFiLTE4OWItNGUwMC05ZTcyLWU5NTE0YjM0MDQ0ZCIsInR5cCI6IkJlYXJlciIsImF6cCI6ImJvLXd1YmFwLWNpZCIsInNlc3Npb25fc3RhdGUiOiIzZjA4NzA4QGh1Yy1wYXJ0bmVyLmNvLmtyIiwic2NvcGUiOiJIRUMiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiIyNjA4NzA4QGh1Yy1wYXJ0bmVyLmNvLmtyIiwicm9sZXMiOlsiYm9hcmRfYWRtaW4iLCJ1c2VyIl0sImNsaWVudF9pZCI6ImJvLXd1YmFwLWNpZCIsImVtYWlsIjoiaHR0cHM6Ly9kZXYtYXV0aC51LWNhcC5jby5rciJ9.X_sOKbdFisalV58jtPYcNew6NotqWDR7bhXV7uOaKhRmn_qZGlOXPM99ja-KjowXPJJrp6Y_rHL94iGjBRMTcegWgkUT8JdkW2JXfnrHgZA-qpTVp-u7xA5EI9i6kTugl9N2jqdWVXH9HHevuiTM_iS9_7GQ6g3S6dENkGhj6LuqYGPTRVaBlv8wTXiwICfg1UUqDzIPJz-fr5Ky4a4MUKdierRC8TWGyLFJuyJrZWa7a-IwXYZ0J00-M3D_RIvnhhcpGf7dV0_-Yzs39m-ZJqEJh64c2M4QZHa-4kZOXOtWXGuDVWGT1nKgFrXgw0pkhv31wg2dd2iuRPvZYKKhW"

API_URL="https://dev-emspapi.e-cmp.co.kr/v1/backoffice/files/multiple/upload/urls"
UPLOAD_URL="https://dev-media.e-cmp.co.kr/BOARD/98e9fba917514d39bad5f02ad6650ff3.png?Expires=1788225246&Signature=W3ZcnnWf6Th1xMC1V8nu5aXEpNsNVR88ZpgcSmRSLNsaEqj3yfIBRhhXW0RlWfkmUBcB3LTwajYInl6Rpf5ZwcpEzsOt3o0qf0VuGSQj1l8shbTu1oY1xVtiz8vDiUkUfV46vAkyFzkD0kOWgC4JqBx9kG4SQbrW0avHj~Ck6aRJC1NYvzkNNB6Y64RUc0x0ExHDA1RDHZ2M0NykkXVe6dAsZ~yaHPnBKuztCHoVYe3pzPH0NT2Hzd~q72~uUCpi~yg2~2SDm7vPJJz0L3A99uqPHHw63SUZnQzJUfWaA9aSEfRG~L27MnB0Ws7A-PLfbzXBVDPND6L1j~jK90bKo1g__&Key-Pair-Id=K2SVMJCOYT2KC3"
# FILE_NAME=$(basename "$FILE")
# FILE_SIZE=$(stat -f%z "$FILE")
# CONTENT_TYPE="image/svg+xml"

# echo "파일명: $FILE_NAME"
# echo "파일크기: $FILE_SIZE bytes"

# # 1. 서명 Upload URL 발급
# RESPONSE=$(curl --silent --show-error --fail-with-body \
#   --request POST \
#   --url "$API_URL" \
#   --header "Authorization: Bearer ${TOKEN}" \
#   --header "Content-Type: application/json;charset=UTF-8" \
#   --data "[
#     {
#       \"referenceType\": \"BOARD\",
#       \"originalName\": \"${FILE_NAME}\",
#       \"contentType\": \"${CONTENT_TYPE}\",
#       \"fileSize\": ${FILE_SIZE}
#     }
#   ]"
# )

# echo "서명 URL 발급 응답:"
# echo "$RESPONSE" | jq .

# # API 결과 코드 확인
# CODE=$(echo "$RESPONSE" | jq -r '.code')

# if [ "$CODE" != "0000" ]; then
#   echo "서명 URL 발급 API 실패"
#   exit 1
# fi

# # 응답 데이터 추출
# FILE_DTL_ID=$(echo "$RESPONSE" | jq -r '.data[0].fileDtlId')
# UPLOAD_URL=$(echo "$RESPONSE" | jq -r '.data[0].uploadUrl')
# DOWNLOAD_URL=$(echo "$RESPONSE" | jq -r '.data[0].downloadUrl')

# echo
# echo "fileDtlId: $FILE_DTL_ID"
# echo "uploadUrl: $UPLOAD_URL"
# echo "downloadUrl: $DOWNLOAD_URL"

# if [ -z "$UPLOAD_URL" ] || [ "$UPLOAD_URL" = "null" ]; then
#   echo "uploadUrl 발급 실패"
#   exit 1
# fi

# 2. 실제 파일 업로드
echo
echo "파일 업로드 시작..."

curl -i --show-error --fail-with-body \
  --request PUT \
  --url "$UPLOAD_URL" \
  --header "Content-Type: application/octet-stream" \
  --data-binary "@${FILE}"

echo
echo "파일 업로드 완료"
echo "fileDtlId: $FILE_DTL_ID"


# sed -i '' $'s/\r$//' z.sh
# chmod +x z.sh
# ./z.sh
