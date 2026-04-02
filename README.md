# SEO Product Description Generator

A high-performance NestJS API that generates SEO-optimized product content using Flowise and LLM integration.

## Features

- **Structured Output**: Returns JSON with title, meta_description, h1, description, and bullets
- **Streaming Response**: Efficient handling of LLM responses via streaming
- **Comprehensive Error Handling**: Timeout, empty response, invalid JSON, and connection errors
- **Input Validation**: Sanitizes and validates all inputs
- **Performance Monitoring**: Tracks processing time and logs performance metrics
- **Type Safety**: Full TypeScript implementation with proper interfaces

## API Specification

### Endpoint
```
POST /api/generate-seo
```

### Request Body
```json
{
  "product_name": "Wireless Bluetooth Headphones",
  "category": "Electronics",
  "keywords": "wireless headphones, bluetooth, noise cancelling"
}
```

### Response Format
```json
{
  "title": "Premium Wireless Bluetooth Headphones - Noise Cancelling Audio",
  "meta_description": "Experience superior sound quality with our wireless Bluetooth headphones featuring active noise cancellation and 30-hour battery life.",
  "h1": "Wireless Bluetooth Headphones with Active Noise Cancellation",
  "description": "Immerse yourself in crystal-clear audio with our premium wireless Bluetooth headphones. Featuring advanced noise cancellation technology, these headphones deliver exceptional sound quality whether you're commuting, working, or relaxing. The ergonomic design ensures comfort during extended listening sessions, while the 30-hour battery life keeps your music playing all day long.",
  "bullets": [
    "Active noise cancellation blocks out ambient noise",
    "30-hour battery life with quick charge capability",
    "Premium drivers deliver rich, detailed sound",
    "Comfortable over-ear design for extended wear",
    "Bluetooth 5.0 for stable wireless connection"
  ],
  "processing_time_ms": 1250
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file:
```env
FLOWISE_URL=http://localhost:3000/api/v1/prediction/your-chatflow-id
```

### 3. Set Up Flowise Chatflow
Follow the instructions in `flowise-prompt-template.md` to create your Flowise chatflow with:
- Prompt template with variables: `{product_name}`, `{category}`, `{keywords}`
- LLM chain with structured output parser
- JSON output format validation

### 4. Run the Application
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start
```

The API will be available at `http://localhost:3001`

## Error Handling

The API handles various edge cases:

- **400 Bad Request**: Missing required fields (product_name, category)
- **500 Internal Server Error**: Empty LLM response, invalid JSON, incomplete response
- **503 Service Unavailable**: Flowise service connection issues
- **504 Gateway Timeout**: LLM processing timeout (15 seconds)

## Performance Considerations

### Chunking Strategy
- Input sanitization limits: product_name (100 chars), category (50 chars), keywords (300 chars)
- Streaming response handling for efficient memory usage
- 15-second timeout to prevent hanging requests

### Prompt Optimization
- Structured prompt with clear instructions for consistent output
- Temperature: 0.3 for consistency while maintaining creativity
- Max tokens: 1000-1500 for comprehensive but focused responses

### Parser Configuration
- JSON schema validation ensures all required fields are present
- Type checking for arrays (bullets field)
- Graceful error handling for malformed responses

## Architecture Decisions

### Why Streaming?
- **Memory Efficiency**: Handles large LLM responses without buffering everything in memory
- **Responsiveness**: Can provide partial responses to clients if needed
- **Scalability**: Better resource utilization under high load

### Why These Prompt Parameters?
- **Temperature 0.3**: Balances creativity with consistency for SEO content
- **Structured JSON Output**: Ensures reliable parsing and integration
- **Variable Chunking**: Prevents prompt injection and manages token limits

### Error Handling Strategy
- **Specific Error Codes**: Different HTTP status codes for different failure modes
- **Logging**: Comprehensive logging for debugging and monitoring
- **Graceful Degradation**: Never crashes, always returns meaningful error messages

## Testing

Test the API with curl:

```bash
# Test endpoint availability
curl http://localhost:3001/api/generate-seo

# Generate SEO content
curl -X POST http://localhost:3001/api/generate-seo \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Wireless Bluetooth Headphones",
    "category": "Electronics",
    "keywords": "wireless, bluetooth, noise cancelling"
  }'
```

## Production Considerations

- Set up proper logging and monitoring
- Configure rate limiting for the API
- Use environment-specific Flowise instances
- Implement caching for frequently requested products
- Add authentication/authorization as needed
- Monitor LLM costs and usage patterns
