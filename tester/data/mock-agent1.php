<?php
/*
{
  "user_id": "integer",
  "message": "string",
  "options": {
    "temperature": 0.7,
    "max_tokens": 256
  }
}
*/

// Mock PHP API logic below
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'reply' => 'This is a mock response from Agent 1.'
    ]);
    exit;
} 