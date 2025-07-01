<?php
/*
 * AI SCOTT: Software Idea Evaluator API
 * Name: AI Scott
 * Endpoint: http://localhost:8000/ai-scott.php
 * Description: Evaluates software projects based on engineering quality, AI integration, UX, and business feasibility.
 *
 * Required JSON Format (POST):
 * {
 *   "project_title": "string",
 *   "description": "string",
 *   "technologies": ["tech1", "tech2"],
 *   "target_audience": "string",
 *   "goals": "string"
 * }
 *
 * Response Format:
 * {
 *   "evaluation": "string",
 *   "score": {
 *     "engineering": 0,
 *     "ai_integration": 0,
 *     "ux_design": 0,
 *     "business_feasibility": 0
 *   }
 * }
 */

// Allow CORS for local testing
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");

// Read the POST body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    echo json_encode([
        "error" => "Invalid JSON input",
        "received" => $input
    ]);
    exit();
}

// Simulate evaluation logic
$response = [
    "evaluation" => "This is a sample evaluation for project: " . ($data['project_title'] ?? 'Unknown'),
    "score" => [
        "engineering" => rand(5, 10),
        "ai_integration" => rand(5, 10),
        "ux_design" => rand(5, 10),
        "business_feasibility" => rand(5, 10)
    ]
];

echo json_encode($response); 