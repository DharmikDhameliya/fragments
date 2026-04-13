# Authenticated POST to /v1/fragments
POST http://localhost:3000/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain
# Include HTTP Basic Auth credentials

[BasicAuth]
test-user1@fragments-testing.com:password1

# Body of the request
`This is a fragment!`

# 1. We expect to get back an HTTP 201 Created
HTTP/1.1 201
[Asserts]
# The Location header should contain the URL to the new fragment
header "Location" matches "^http:\/\/localhost:3000\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
# Check that the fragment ID is a valid nanoid
jsonpath "$.fragment.id" matches "^[A-Za-z0-9_-]+$"
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/plain"
# 19 is the length of our fragment data: 'This is a fragment!'
jsonpath "$.fragment.size" == 19

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# 2. Try to GET the fragment we just posted using the captured variable
GET {{url}}

[BasicAuth]
test-user1@fragments-testing.com:password1

HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "This is a fragment!"
