export function generateCodeSample(language: string, requestData: any): string {
  const { endpoint, method, headers, body, authToken } = requestData

  const samples = {
    curl: `curl -X ${method} "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${authToken}" \\
  -d '${body.replace(/\n\s*/g, " ")}'`,

    python: `import requests
import json

url = "${endpoint}"
headers = ${headers}
data = ${body}

response = requests.${method.toLowerCase()}(url, headers=headers, json=data)
print(response.json())`,

    javascript: `fetch('${endpoint}', {
  method: '${method}',
  headers: ${headers},
  body: JSON.stringify(${body})
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`,

    nodejs: `const axios = require('axios');

const config = {
  method: '${method.toLowerCase()}',
  url: '${endpoint}',
  headers: ${headers},
  data: ${body}
};

axios(config)
.then(response => console.log(response.data))
.catch(error => console.log(error));`,

    php: `<?php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '${endpoint}',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => '${method}',
  CURLOPT_POSTFIELDS => '${body.replace(/\n\s*/g, " ")}',
  CURLOPT_HTTPHEADER => array(
    'Content-Type: application/json',
    'Authorization: Bearer ${authToken}'
  ),
));

$response = curl_exec($curl);
curl_close($curl);
echo $response;
?>`,
  }

  return samples[language as keyof typeof samples] || ""
}
