export interface CreateUrlRequest {
  url: string;
}

export interface CreateUrlResponse {
  id: string;
  shortUrl: string;
  originalUrl: string;
}

export interface UrlService {
  createShortUrl(originalUrl: string, baseUrl: string): Promise<CreateUrlResponse>;
}
