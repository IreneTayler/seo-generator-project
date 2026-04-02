import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import axios from 'axios';

interface SeoRequest {
  product_name: string;
  category: string;
  keywords?: string;
}

interface SeoResponse {
  title: string;
  meta_description: string;
  h1: string;
  description: string;
  bullets: string[];
}

@Controller('api')
export class SeoController {
  private readonly logger = new Logger(SeoController.name);
  private FLOWISE_URL = process.env.FLOWISE_URL;
  private TIMEOUT = 15000;

  @Get('generate-seo')
  getInfo() {
    return {
      message: 'SEO Generator API',
      endpoint: 'POST /api/generate-seo',
      required_fields: ['product_name', 'category'],
      optional_fields: ['keywords'],
      flowise_configured: !!this.FLOWISE_URL
    };
  }

  @Post('generate-seo')
  async generateSeo(@Body() body: SeoRequest, @Res() res: Response) {
    const startTime = Date.now();

    // Input validation
    if (!body.product_name?.trim() || !body.category?.trim()) {
      this.logger.warn('Invalid request: missing required fields');
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Missing required fields: product_name and category are required'
      });
    }

    if (!this.FLOWISE_URL) {
      this.logger.error('Flowise URL not configured');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Service configuration error'
      });
    }

    // Sanitize inputs
    const sanitizedData = {
      product_name: body.product_name.trim().slice(0, 100),
      category: body.category.trim().slice(0, 50),
      keywords: body.keywords?.trim().slice(0, 300) || ''
    };

    this.logger.log(`Generating SEO for product: ${sanitizedData.product_name}`);

    try {
      const response = await axios.post(
        this.FLOWISE_URL,
        {
          question: '',
          overrideConfig: sanitizedData,
        },
        {
          timeout: this.TIMEOUT,
          responseType: 'stream',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      let buffer = '';
      let hasError = false;

      // Set up streaming response headers
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Transfer-Encoding', 'chunked');

      response.data.on('data', (chunk: Buffer) => {
        if (hasError) return;

        buffer += chunk.toString();

        // Optional: Stream partial data back to client
        // res.write(chunk);
      });

      response.data.on('end', () => {
        if (hasError) return;

        const processingTime = Date.now() - startTime;
        this.logger.log(`Processing completed in ${processingTime}ms`);

        if (!buffer.trim()) {
          this.logger.warn('Empty response from Flowise');
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: 'Empty response from LLM service'
          });
        }

        try {
          const parsed: SeoResponse = JSON.parse(buffer);

          // Validate required fields in response
          const requiredFields = ['title', 'meta_description', 'h1', 'description', 'bullets'];
          const missingFields = requiredFields.filter(field => !parsed[field]);

          if (missingFields.length > 0) {
            this.logger.warn(`Incomplete response, missing: ${missingFields.join(', ')}`);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
              error: `Incomplete response from LLM: missing ${missingFields.join(', ')}`
            });
          }

          // Validate bullets is an array
          if (!Array.isArray(parsed.bullets)) {
            this.logger.warn('Invalid bullets format in response');
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
              error: 'Invalid response format: bullets must be an array'
            });
          }

          this.logger.log('SEO generation successful');
          res.json({
            ...parsed,
            processing_time_ms: processingTime
          });

        } catch (parseError) {
          this.logger.error('JSON parsing failed', parseError);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: 'Invalid JSON response from LLM service'
          });
        }
      });

      response.data.on('error', (streamError: Error) => {
        hasError = true;
        this.logger.error('Stream error', streamError);
        if (!res.headersSent) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: 'Stream processing error'
          });
        }
      });

    } catch (error: any) {
      const processingTime = Date.now() - startTime;

      if (error.code === 'ECONNABORTED') {
        this.logger.warn(`Request timeout after ${processingTime}ms`);
        return res.status(HttpStatus.GATEWAY_TIMEOUT).json({
          error: 'Request timeout - LLM service took too long to respond'
        });
      }

      if (error.code === 'ECONNREFUSED') {
        this.logger.error('Connection refused to Flowise service');
        return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          error: 'LLM service unavailable'
        });
      }

      if (error.response?.status) {
        this.logger.error(`Flowise API error: ${error.response.status}`);
        return res.status(HttpStatus.BAD_GATEWAY).json({
          error: `LLM service error: ${error.response.status}`
        });
      }

      this.logger.error('Unexpected error', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }
}
