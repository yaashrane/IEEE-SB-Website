class ApiResponse {
  static success(res, data = {}, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      ...data,
    });
  }

  static created(res, data = {}, message = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  static paginated(res, key, records, total, page, limit, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      [key]: records,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  }
}

export default ApiResponse;
