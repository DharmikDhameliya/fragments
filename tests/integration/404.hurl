# 404 Test
GET http://localhost:3000/no-such-route

# We expect a 404 Not Found response
HTTP/1.1 404

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
