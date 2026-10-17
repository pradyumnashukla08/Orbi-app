import { isAxiosError } from "axios";
import Toast from "react-native-toast-message";

const AUTH_ERROR_CODES = ["AUTH_TOKEN_INVALID", "AUTH_TOKEN_MISSING"];

type ApiErrorBody = {
  message?: string;
  error?: string;
  code?: string;
};

const getString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

const clientCatchError = (error: unknown): void => {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;

    const errorCode = getString(data?.code) ?? getString(data?.error);
    if (errorCode && AUTH_ERROR_CODES.includes(errorCode)) {
      return;
    }

    const message =
      getString(data?.message) ??
      getString(data?.error) ??
      getString(error.response?.statusText) ??
      "Server error";

    Toast.show({ type: "error", text1: "Error", text2: message });
    return;
  }

  if (error instanceof Error) {
    Toast.show({ type: "error", text1: "Error", text2: error.message });
    return;
  }

  Toast.show({ type: "error", text1: "Error", text2: "Internal server error" });
};

export default clientCatchError;
