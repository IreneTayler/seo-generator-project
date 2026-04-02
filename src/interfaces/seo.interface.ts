export interface SeoRequest {
    product_name: string;
    category: string;
    keywords?: string;
}

export interface SeoResponse {
    title: string;
    meta_description: string;
    h1: string;
    description: string;
    bullets: string[];
}