# 1. POST a new JSON fragment
POST http://localhost:8080/v1/fragments
Authorization: Basic dGVzdC11c2VyMUBmcmFnbWVudHMtdGVzdGluZy5jb206cGFzc3dvcmQx
Content-Type: application/json

{"service":"DynamoDB"}

HTTP/1.1 201

[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"
[Asserts]
header "Location" exists
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" exists
jsonpath "$.fragment.ownerId" exists
jsonpath "$.fragment.created" exists
jsonpath "$.fragment.updated" exists
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 22

# 2. GET the fragment info
GET {{fragment1_url}}/info
Authorization: Basic dGVzdC11c2VyMUBmcmFnbWVudHMtdGVzdGluZy5jb206cGFzc3dvcmQx

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment1_id}}"
jsonpath "$.fragment.ownerId" exists
jsonpath "$.fragment.created" exists
jsonpath "$.fragment.updated" exists
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 22

# 3. POST a second Markdown fragment 
POST http://localhost:8080/v1/fragments
Authorization: Basic dGVzdC11c2VyMUBmcmFnbWVudHMtdGVzdGluZy5jb206cGFzc3dvcmQx
Content-Type: text/markdown

`DynamoDB notes`

HTTP/1.1 201

[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"
[Asserts]
header "Location" exists
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" exists
jsonpath "$.fragment.ownerId" exists
jsonpath "$.fragment.created" exists
jsonpath "$.fragment.updated" exists
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 14

# 4. GET the second fragment info
GET {{fragment2_url}}/info
Authorization: Basic dGVzdC11c2VyMUBmcmFnbWVudHMtdGVzdGluZy5jb206cGFzc3dvcmQx

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment2_id}}"
jsonpath "$.fragment.ownerId" exists
jsonpath "$.fragment.created" exists
jsonpath "$.fragment.updated" exists
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 14

# 5. GET all fragments
GET http://localhost:8080/v1/fragments
Authorization: Basic dGVzdC11c2VyMUBmcmFnbWVudHMtdGVzdGluZy5jb206cGFzc3dvcmQx

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments[*]" contains "{{fragment1_id}}"
jsonpath "$.fragments[*]" contains "{{fragment2_id}}"

# 6. DELETE the first fragment
DELETE {{fragment1_url}}
Authorization: Basic dGVzdC11c2VyMUBmcmFnbWVudHMtdGVzdGluZy5jb206cGFzc3dvcmQx

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"

# 7. GET the first fragment - should be 404
GET {{fragment1_url}}
Authorization: Basic dGVzdC11c2VyMUBmcmFnbWVudHMtdGVzdGluZy5jb206cGFzc3dvcmQx

HTTP/1.1 404

# 8. GET all fragments - fragment1 gone, fragment2 remains
GET http://localhost:8080/v1/fragments
Authorization: Basic dGVzdC11c2VyMUBmcmFnbWVudHMtdGVzdGluZy5jb206cGFzc3dvcmQx

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments[*]" not contains "{{fragment1_id}}"
jsonpath "$.fragments[*]" contains "{{fragment2_id}}"
