import type { ApiResponse as ApiResponseObject } from '@types';

export default class ApiResponse {
  static success(data) {
    return Response.json({
      success: true,
      data,
    });
  }

  static error(message, status = null) {
    const returnData: ApiResponseObject = {
      success: false,
      message,
    };

    if (status) {
      returnData.status = status;
    }

    return Response.json(returnData);
  }
}
