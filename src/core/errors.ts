export class DomainError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends DomainError {
  constructor(message = "Not found") {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
    this.name = "ConflictError";
  }
}
