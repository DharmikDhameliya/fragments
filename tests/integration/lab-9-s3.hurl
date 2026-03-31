# tests/integration/lab-9-s3.hurl

# 1. POST a new text fragment
POST http://localhost:8080/v1/fragments
Authorization: Basic dGVzdC11c2VyMUBmcmFnbWVudHMtdGVzdGluZy5jb206cGFzc3dvcmQx
Content-Type: text/plain
file,body.txt;

HTTP/1.1 201
[Asserts]
  header "Location" exists
[Captures]
url: header "Location"

# 2. GET the fragment
GET {{url}}
Authorization: Basic dGVzdC11c2VyMUBmcmFnbWVudHMtdGVzdGluZy5jb206cGFzc3dvcmQx

HTTP/1.1 200
Content-Type: text/plain
[Asserts]
  body == "Hello S3!"

# 3. DELETE the fragment
DELETE {{url}}
Authorization: Basic dGVzdC11c2VyMUBmcmFnbWVudHMtdGVzdGluZy5jb206cGFzc3dvcmQx

HTTP/1.1 200

# 4. GET again (404)
GET {{url}}
Authorization: Basic dGVzdC11c2VyMUBmcmFnbWVudHMtdGVzdGluZy5jb206cGFzc3dvcmQx

HTTP/1.1 404
