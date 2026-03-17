import { z } from "zod";

export class ServiceResponse<T = null> {
  readonly success: boolean;
  readonly message: string;
  readonly responseObject: T;

  private constructor(success: boolean, message: string, responseObject: T) {
    this.success = success;
    this.message = message;
    this.responseObject = responseObject;
  }

  static success<T>(message: string, responseObject: T) {
    return new ServiceResponse(true, message, responseObject);
  }

  static failure<T>(message: string, responseObject: T) {
    return new ServiceResponse(false, message, responseObject);
  }
}

export const ServiceResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    responseObject: dataSchema.optional(),
  });
