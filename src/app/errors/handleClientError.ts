import { Prisma } from "@prisma/client";
import { IGenericErrorMessage } from "../interface/error";

const handleClientError = (
  error: Prisma.PrismaClientKnownRequestError
): {
  statusCode: number;
  message: string;
  errorMessages: IGenericErrorMessage[];
} => {
  let statusCode = 400;
  let message = "A Prisma client error occurred";
  const errorMessages: IGenericErrorMessage[] = [];

  switch (error.code) {
    case "P2002":
      // Unique constraint failed
      message = `Unique constraint failed on the field(s): ${(error.meta as any)?.target?.join(
        ", "
      )}`;
      statusCode = 409;
      break;

    case "P2003":
      // Foreign key constraint failed
      message = "Foreign key constraint failed";
      statusCode = 409;
      break;

    case "P2025":
      // Record not found
      message = "Requested record not found in the database";
      statusCode = 404;
      break;

    case "P2022":
      // Column does not exist
      message = `Invalid column name: ${(error.meta as any)?.column || "unknown"}`;
      statusCode = 400;
      break;

    case "P2014":
      message = "Detected a cycle in the path of the relation";
      statusCode = 400;
      break;

    default:
      message = error.message || "An unknown database error occurred";
      statusCode = 500;
      break;
  }

  errorMessages.push({
    path: "",
    message,
  });

  return {
    statusCode,
    message,
    errorMessages,
  };
};

export default handleClientError;
