import { json } from '@sveltejs/kit';
import type { ApiResponse as ApiResponseObject } from '@app';

export default class ApiResponse {
  static success(data) {
    return json({
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

    return json(returnData);
  }
}
