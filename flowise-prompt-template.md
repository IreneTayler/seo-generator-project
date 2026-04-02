# Flowise Chatflow Configuration

## Prompt Template

Create a chatflow in Flowise with the following components:

### 1. Prompt Template Node
```
You are an expert SEO copywriter. Generate compelling product content for e-commerce.

Product: {product_name}
Category: {category}
Keywords: {keywords}

Create SEO-optimized content with these requirements:
- Title: 50-60 characters, include primary keyword
- Meta Description: 150-160 characters, compelling and keyword-rich
- H1: Clear, keyword-focused heading
- Description: 2-3 paragraphs, engaging product description
- Bullets: 5-7 key features/benefits as bullet points

Focus on:
- Search engine optimization
- User engagement
- Conversion optimization
- Brand voice consistency

Return ONLY valid JSON in this exact format:
{
  "title": "SEO-optimized product title",
  "meta_description": "Compelling meta description for search results",
  "h1": "Main heading for the product page",
  "description": "Detailed product description with benefits and features",
  "bullets": [
    "Key feature or benefit 1",
    "Key feature or benefit 2",
    "Key feature or benefit 3",
    "Key feature or benefit 4",
    "Key feature or benefit 5"
  ]
}
```

### 2. Variables Configuration
- `product_name`: String variable for product name
- `category`: String variable for product category  
- `keywords`: String variable for SEO keywords (optional)

### 3. LLM Chain Configuration
- Model: GPT-4 or Claude (recommended for structured output)
- Temperature: 0.3 (for consistency)
- Max Tokens: 1000-1500
- Top P: 0.9

### 4. Output Parser
- Type: JSON Output Parser
- Schema validation for required fields
- Error handling for malformed JSON

### 5. Chatflow Settings
- Enable streaming: Yes
- Timeout: 30 seconds
- Rate limiting: As needed for your use case

## API Endpoint
After creating the chatflow, use the Prediction API URL:
`http://your-flowise-instance/api/v1/prediction/{chatflow-id}`

Update your `.env` file with this URL.