// import { Prisma } from "@prisma/client";
// import { IGenericErrorResponse } from "../interface/common";

// const handleValidationError = (
//   error: Prisma.PrismaClientValidationError
// ): IGenericErrorResponse => {
//   const errors = [
//     {
//       path: "",
//       message: error.message,
//     },
//   ];
//   const statusCode = 400;
//   return {
//     statusCode,
//     message: "Validation Error",
//     errorMessages: errors,
//   };
// };

// export default handleValidationError;

import { Prisma } from "@prisma/client";
import { IGenericErrorMessage } from "../interface/error";

const handleValidationError = (
  error: Prisma.PrismaClientValidationError
): {
  statusCode: number;
  message: string;
  errorType: string;
  errorMessages: IGenericErrorMessage[];
} => {
  const rawMessage = error.message;
  const errorMessages: IGenericErrorMessage[] = [];

  // Match multiple "Argument `field` is missing"
  const matches = [...rawMessage.matchAll(/Argument `(\w+)` is missing/g)];

  for (const match of matches) {
    const field = match[1];
    errorMessages.push({
      path: field,
      message: `${capitalize(field)} is required`,
    });
  }

  const finalMessage =
    errorMessages.length > 0 ? errorMessages.map((e) => e.message).join(", ") : "Validation failed";

  return {
    statusCode: 400,
    message: finalMessage,
    errorType: "Validation Error",
    errorMessages,
  };
};

export default handleValidationError;

// Helper to capitalize field names
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
