<?php
/**
 * @api {post} /DOM/ai_specialists/et_generate_homepage_description Generate Hackathon Homepage HTML
 * @apiName GenerateHomepage
 * @apiGroup ContentGenerator
 * @apiDescription
 * Generates a detailed HTML homepage using OpenAI based on provided event fields like title, goals, audience, tools, etc.
 *
 * @apiHeader {String} Authorization Bearer token to authorize API access
 * @apiHeader {String} Content-Type Must be application/json
 *
 * @apiParam {String} customer_id Unique identifier for the external customer
 * @apiParam {String} category Category for logging and analytics
 * @apiParam {String} tone Desired tone of the output (e.g., "inspirational", "professional")
 * @apiParam {String} notes Detailed event background or concept note
 * @apiParam {String} event_name Name of the event
 * @apiParam {String} tagline Event tagline or slogan
 * @apiParam {String} event_goals Goals of the event
 * @apiParam {String[]} target_audience Target participant groups
 * @apiParam {String[]} benefits Key benefits for participants
 * @apiParam {Object} how_it_works Details on registration, team info, tools, and pitch
 * @apiParam {String[]} prizes List of prizes
 * @apiParam {String} signup_link Link to the signup page
 *
 * @apiParamExample {json} Request Example:
 * {
 *   "customer_id": "open_sea_hackathon_2025",
 *   "category": "HomePage",
 *   "tone": "inspirational",
 *   "event_name": "The Open Sea Lab",
 *   "notes": "The Open Sea Lab (OSL)..."
 * }
 *
 * @apiSuccess {String} tone The tone applied
 * @apiSuccess {String} generated_html Full HTML content for the event homepage
 */

ob_start();
header("Content-Type: application/json");
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'rate_limiter.php';
require_once 'db.php';
require_once 'common_functions.php';
require_once 'importantDataAISpecialists.php';
require_once 'extractTextFunctions1.php'; // You need this reusable function — already used in judge-project.php

$startTime = microtime(true);

// Validate API Key
$apiKeyValidation = validateApiKey($conn);
if (!$apiKeyValidation["valid"]) {
    echo json_encode(["error" => $apiKeyValidation["message"]]);
    exit;
}
$customerId = $apiKeyValidation["customer_id"];

// Deduct Credit
requireCredits($conn, $customerId, 1);

// Detect content type
$contentType = $_SERVER["CONTENT_TYPE"] ?? '';
$handlingFileUpload = strpos($contentType, "multipart/form-data") !== false;

// Initialize variables
$tone = "professional";
$notes = "";
$eventName = "";
$tagline = "";
$goals = "";
$audienceStr = "";
$benefitsStr = "";
$prizesStr = "";
$registration = "TBD";
$teamInfo = "TBD";
$tools = "TBD";
$pitch = "TBD";
$link = "https://eventornado.com/";
$emojiInstruction = "";

if ($handlingFileUpload) {
    // Handle file upload
    if (!isset($_FILES['doc'])) {
        echo json_encode(["error" => "No document uploaded."]);
        exit;
    }

    $tmpFile = $_FILES['doc']['tmp_name'];
    $originalName = $_FILES['doc']['name'];

    $extractedText = extractTextFromFile($tmpFile, $originalName);
    $notes = $extractedText;

    // Optional: accept tone from POST field if provided
    $tone = strtolower(trim($_POST['tone'] ?? 'professional'));
    $category = $_POST['category'] ?? 'HomePage';
    $externalCustomerId = $_POST['customer_id'] ?? 'unknown';

} else {
    // Handle JSON POST
    $rawInput = file_get_contents("php://input");
    $input = json_decode($rawInput, true);

    $notes = trim($input["notes"] ?? "");
    $tone = strtolower(trim($input["tone"] ?? "professional"));
    $eventName = trim($input["event_name"] ?? "");
//    $tagline = trim($input["tagline"] ?? "");
//    $goals = trim($input["event_goals"] ?? "");
//    $audience = $input["target_audience"] ?? [];
//    $benefits = $input["benefits"] ?? [];
//    $how = $input["how_it_works"] ?? [];
//    $prizes = $input["prizes"] ?? [];
//    $link = trim($input["signup_link"] ?? "https://eventornado.com/");
//
//    $audienceStr = !empty($audience) ? implode(", ", $audience) : "";
//    $benefitsStr = !empty($benefits) ? implode("; ", $benefits) : "";
//    $prizesStr = !empty($prizes) ? implode("; ", $prizes) : "";
//    $registration = $how['registration'] ?? 'TBD';
//    $teamInfo = $how['team_info'] ?? 'TBD';
//    $tools = $how['tools'] ?? 'TBD';
//    $pitch = $how['pitch'] ?? 'TBD';

    $category = $input['category'] ?? 'HomePage';
    $externalCustomerId = $input['customer_id'] ?? 'unknown';
}

if ($tone === "playful" || $tone === "friendly") {
    $emojiInstruction = <<<EOM
🎉 You must use playful emojis throughout the HTML output — not just in headers or section titles, but also inside paragraphs. For example:

- Add emoji reactions after sentences (e.g., "You'll gain access to exclusive datasets 🌊")
- Insert emoji-based transitions or excitement (e.g., "Ready to dive in? 🐠 Let’s go!")
- Include emojis for feelings (e.g., "incredible opportunity 🎯", "collaboration 🤝", "data wizardry 🧙‍♂️")

Add a few emojis inline within each paragraph, especially around actions, achievements, or team engagement. Use natural placement, but include at least one per paragraph if the tone is playful.
EOM;
}

if ($handlingFileUpload) {
$prompt = <<<EOT
        You are a skilled HTML copywriter and hackathon content strategist.

🎯 Your task is to generate a full HTML homepage (not Markdown) for a virtual or hybrid hackathon, based on the document content provided. 

You will extract and expand content into 10 clearly labeled sections, structured as follows:

📘 REQUIRED STRUCTURE:
1. <h2> Tagline</h2>        
2. <h2> Welcome to [Event Name] </h2>
3. <h3> Who should join? </h3>
4. <h3> Why participate? </h3>
5. <h3> How it works </h3>
6. <h3> Tools </h3>
7. <h3> Prizes </h3>
8. <h3> Event Timeline </h3>
9. <h3> Sign up today </h3>
10. <h3> Contact </h3>

📌 GENERAL RULES:
- Extract as much usable content as possible from the document — including section headers, paragraphs, bullet points, and footnotes.
- DO NOT summarize lightly. Fully elaborate and expand content into complete, publish-ready HTML.
- Where lists exist in the source document, convert each list item into 2+ descriptive sentences in either <li> or <p> format.
- Do not invent or fabricate content. Only infer relationships where context is strongly supported by the document.
- If a section is missing in the document (Tools, Timeline, or Contact), OMIT that section completely — do not fabricate or fill it with placeholders.

🖋️ TONE:
- Maintain the tone set by the document.
- If the tone is clearly playful or friendly, you may insert emojis sparingly in headers or paragraphs where appropriate.
- If the tone is formal or neutral, DO NOT insert emojis.

🚫 ALLOWED TAGS:
- Use ONLY the following tags: <h2>, <h3>, <ul>, <li>, <p>, <strong>, <a>
- DO NOT use <div>, <span>, <section>, <article>, or any non-semantic HTML.
- DO NOT use Markdown or plaintext in any part of the output — HTML only.

📌 SECTION-SPECIFIC INSTRUCTIONS:
        
1. <h2> Tagline </h2>
- If a tagline is provided, use it, otherwise create a creative tagline.

2. <h2> Welcome to [Event Name] </h2>
- Write a detailed, multi-paragraph introduction.
- Describe the event’s mission, goals, organizing entity (if stated), and what the hackathon is about.
- Write 3–5 paragraphs if the document contains rich detail (mission, platform, experience, community, etc.).
- Clearly mention the organizer if named.

3. <h3> Who should join? </h3>
- Describe ideal participant profiles based on the document.
- If the document lists participant types, expand each type into a full sentence or two explaining its relevance.
- Structure as either multiple short paragraphs or a <ul> list.

4. <h3> Why participate? </h3>
- Write a <ul> with 5–8 <li> items.
- Each <li> must be at least 2 full sentences explaining the benefit and its value.

5. <h3> How it works </h3>
- Provide a 4-step <ul> list:
  - Register: sign up by visiting the registration link
  - Form Teams: build or join diverse teams with complementary skills
  - Develop Solutions: collaborate and create responses to the hackathon themes
  - Compete & Win: submit your pitch and demo for judging and prizes
- Expand each step with 1–2 descriptive sentences. Use any relevant content from the document if present.

6. <h3> Tools </h3>
- If tools/platforms/services are mentioned:
  - Write one full paragraph per major tool or service.
  - Explain how participants use it (data access, modeling, analytics, collaboration).
- Do NOT compress all tools into a single paragraph or sentence.
- Omit this section if no tools are mentioned.

7. <h3> Prizes </h3>
- Write 1–2 full paragraphs describing all types of rewards (cash prizes, mentoring, travel, recognition, etc.).
- If the document lacks prize detail, still write 1–2 paragraphs describing non-monetary benefits like exposure, feedback, mentorship, publication, or follow-on opportunities.

8. <h3> Event Timeline </h3>
- Write a <ul> with 3–6+ key milestones.
- For each milestone, include a short sentence describing what happens at that stage (e.g., "Two-week warm-up and team matching period begins.").

9. <h3> Sign up today </h3>
- Write a full call-to-action paragraph.
- Emphasize urgency, value, and community.
- End with a working <a href="">Register Now</a> link using the signup URL in the document, or default to https://eventornado.com/.

10. <h3> Contact </h3>
- If available, include contact name, email, organization, or support info as a <p>.
- Omit this section if no contact info is provided.
        
📘 SOURCE DOCUMENT:
{$notes}

{$emojiInstruction}

When ready, output the result as **HTML only** — no Markdown, no plaintext.
EOT;
}
 else {
     $prompt = <<<EOT
You are a skilled HTML copywriter and hackathon content strategist.

Your task is to generate a compelling homepage in valid HTML for a virtual or hybrid hackathon, based on the NOTES field provided.

📌 INSTRUCTIONS:
- The NOTES field may include: what the hackathon is about, goals, who it’s for, challenges or themes, prizes, key dates — but some items may be missing or incomplete.
- Extract as much usable content as possible from NOTES — including section headers, paragraphs, bullet points, and footnotes.
- DO NOT summarize. Expand on every detail, list, or paragraph as needed.
- If NOTES contains lists, elaborate on each item into full sentences or paragraphs.
- Use multiple paragraphs for each section if NOTES contains rich content.
- If a section is missing, infer only when necessary — do not fabricate sponsors, tools, partners, or contacts.
- If "Tools", "Venue", or "Contact" details appear, include them; otherwise, omit those sections.
- DO NOT include a “Challenges” section — this will be handled separately.
- Output valid HTML using <h2>, <h3>, <ul>, <li>, <p>, <strong>, and <a> tags only.
- NO Markdown, no plaintext. Final output must be HTML only.
- If tone is playful, insert appropriate emojis sparingly in headers, bullets, and inline paragraphs — not just titles.

🎯 PAGE STRUCTURE:
1. <h2> Tagline </h2>
- If a tagline is provided, use it, otherwise create a creative tagline.

2. <h2>Welcome to [Event Name]</h2>  
   Write a detailed, multi-paragraph introduction. Describe the event’s mission, goals, organizing entity (if stated), and what the hackathon is about.  
   If the NOTES contains rich detail, write 3–5 paragraphs covering different aspects (mission, platform, experience, community, etc.).  
   If an organizer is named, mention it clearly.

3. <h3>Who should join?</h3>  
   Describe the ideal participant profiles based on the NOTES.  
   Use multiple paragraphs or a <ul> with brief descriptions for each group.  
   If a participant list is present, expand each item with 1–2 sentences about why this group matters.

4. <h3>Why participate?</h3>  
   Create a <ul> list of 5–8 <li> items.  
   Each bullet should be written as 2–3 full sentences — explain the real benefit and why it matters.  
   If NOTES has a benefits list, use and elaborate on it; if not, infer from features and themes.

5. <h3>How it works</h3>  
   Provide a 4-step <ul> list with the following steps:
   - Register: sign up by visiting the registration link
   - Form Teams: build or join diverse teams with complementary skills
   - Develop Solutions: collaborate and create responses to the hackathon themes
   - Compete & Win: submit your pitch and demo for judging and prizes  
   If NOTES includes any explanation for each step, expand that step with a short description (1–2 sentences).

6. <h3>Tools</h3>  
   If tools/platforms/services are mentioned:
   - Write 1 full paragraph per major tool or service.
   - Explain how participants use it (data access, modeling, analytics, collaboration).
   - Do not compress tools into a single line.  
   If no tools are mentioned, omit this section.

7. <h3>Prizes</h3>  
   Write 1–2 full paragraphs describing all types of rewards (cash prizes, mentoring, travel, recognition, etc.).  
   If NOTES lacks prize detail, still write 1–2 meaningful paragraphs describing non-monetary benefits like exposure, feedback, mentorship, publication, or follow-on opportunities.

8. <h3>Event Timeline</h3>  
   List 3–6+ key milestones as <ul> bullets.  
   For each date or phase, include a short sentence describing what happens (e.g., “a two-week warm-up and team matching period begins”).  
   Do not fabricate milestones — only use info from NOTES.

9. <h3>Sign up today</h3>  
   Write a full call-to-action paragraph.  
   Emphasize urgency, value, and community.  
   If a signup URL is present in NOTES, use it. If not, default to https://eventornado.com/.

10. <h3>Contact</h3>  
   If available in NOTES, include contact name, email, organization, or support info as <p>.  
   Omit if none provided.

📘 SOURCE TEXT (NOTES):
{$notes}

📎 Final Output: Only HTML, no Markdown, no plaintext.  
Use emojis sparingly and meaningfully, only if the tone is set to playful or friendly.
{$emojiInstruction}

EOT;
 } 


// 🚀 Dynamic tuning of max_tokens based on input length
$inputTokenEstimate = str_word_count($notes) * 1.3;  // rough word→token estimate (~1.3 tokens per word)

if ($inputTokenEstimate < 1000) {
    $maxTokens = 2500;  // short doc, safe fast response
} elseif ($inputTokenEstimate < 2500) {
    $maxTokens = 3500;  // default for normal concept notes
} elseif ($inputTokenEstimate < 5000) {
    $maxTokens = 4500;  // larger detailed document
} else {
    $maxTokens = 6000;  // very large doc (rare)
}

//Prepare OpenAI Request 
//$openAiRequest = [
//    "model" => "gpt-3.5-turbo",
//    "messages" => [["role" => "user", "content" => $prompt]],
//    "temperature" => 0.85,
//    "max_tokens" => $maxTokens
//];
$openAiRequest = [
    "model" => "gpt-4o",
    "messages" => [["role" => "user", "content" => $prompt]],
    "temperature" => 0.85,
    "max_tokens" => $maxTokens
];
//$openAiRequest = [
//    "model" => "gpt-4",
//    "messages" => [["role" => "user", "content" => $prompt]],
//    "temperature" => 0.85,
//    "max_tokens" => $maxTokens
//];

$response = callOpenAIChat(OPENAI_API_KEY_VEAVAI, $openAiRequest);
$html = $response['content'] ?? "⚠️ No content generated.";
$usage = $response['usage'] ?? ["prompt_tokens" => 0, "completion_tokens" => 0, "total_tokens" => 0];

$endTime = microtime(true);
$durationMs = round(($endTime - $startTime) * 1000);
$endpoint = basename($_SERVER['PHP_SELF']);
$ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$modelUsed = $openAiRequest['model'];

if ($modelUsed === 'gpt-4') {
    $estimatedCost = ($usage['prompt_tokens'] * 0.03 + $usage['completion_tokens'] * 0.06) / 1000;
} elseif ($modelUsed === 'gpt-4o') {
    $estimatedCost = ($usage['prompt_tokens'] * 0.01 + $usage['completion_tokens'] * 0.03) / 1000;
} else {
    $estimatedCost = ($usage['prompt_tokens'] + $usage['completion_tokens']) * 0.0005 / 1000;
}
$estimatedCost = round($estimatedCost, 5);

// Log the API Call
logApiCall($conn, [
    'internal_customer_id' => $customerId,
    'external_customer_id' => $externalCustomerId,
    'category' => $category,
    'prompt_type' => 'homepage_description',
    'prompt_tokens' => $usage['prompt_tokens'],
    'completion_tokens' => $usage['completion_tokens'],
    'total_tokens' => $usage['total_tokens'],
    'model_used' => $modelUsed,
    'endpoint' => $endpoint,
    'duration_ms' => $durationMs,
    'input_json' => $handlingFileUpload ? json_encode(['file' => $originalName, 'tone' => $tone]) : $rawInput,
    'output_json' => json_encode(["tone" => $tone, "generated_html" => $html]),
    'estimated_cost_usd' => $estimatedCost,
    'ip_address' => $ipAddress
]);

// Output Final Result
echo json_encode([
    "tone" => $tone,
    "generated_html" => $html
]);
exit;

function callOpenAIChat($apiKey, $data) {
    $url = "https://api.openai.com/v1/chat/completions";
    $headers = [
        "Authorization: Bearer $apiKey",
        "Content-Type: application/json"
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $result = curl_exec($ch);
    curl_close($ch);

    $response = json_decode($result, true);
    return [
        "content" => $response['choices'][0]['message']['content'] ?? null,
        "usage" => $response['usage'] ?? null
    ];
}
?>
