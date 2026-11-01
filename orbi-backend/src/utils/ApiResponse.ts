import type { Response } from 'express';

interface SuccessBody<T> {
  success: true;
  message: string;
  data: T;
}

export class ApiResponse {
  static ok<T>(res: Response, data: T, message = 'OK', statusCode = 200): Response {
    const body: SuccessBody<T> = { success: true, message, data };
    return res.status(statusCode).json(body);
  }

  static created<T>(res: Response, data: T, message = 'Created'): Response {
    return ApiResponse.ok(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
