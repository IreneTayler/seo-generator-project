import {
  Controller,
  Post,
  Body,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import axios from 'axios';

@Controller('api')
export class SeoController {
  private FLOWISE_URL = process.env.FLOWISE_URL;
  private TIMEOUT = 15000;

  @Post('generate-seo')
  async generateSeo(@Body() body: any, @Res() res: Response) {
    const { product_name, category, keywords } = body;

    if (!product_name || !category) {
      throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
    }

    try {
      const response = await axios.post(
        this.FLOWISE_URL,
        {
          question: '',
          overrideConfig: {
            product_name,
            category,
            keywords: (keywords || '').slice(0, 300),
          },
        },
        {
          timeout: this.TIMEOUT,
          responseType: 'stream',
        },
      );

      let buffer = '';

      response.data.on('data', (chunk) => {
        buffer += chunk.toString();
      });

      response.data.on('end', () => {
        if (!buffer.trim()) {
          return res.status(500).json({ error: 'Empty LLM response' });
        }

        try {
          const parsed = JSON.parse(buffer);

          if (!parsed.title || !parsed.description) {
            return res.status(500).json({ error: 'Incomplete response' });
          }

          res.json(parsed);
        } catch {
          res.status(500).json({ error: 'Invalid JSON from LLM' });
        }
      });

    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        return res.status(504).json({ error: 'LLM timeout' });
      }

      return res.status(500).json({ error: 'Flowise error' });
    }
  }
}
