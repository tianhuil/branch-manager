import { describe, expect, test } from "bun:test";
import { validateOption } from "./util";

describe("validateOption", () => {
  test("returns first value when it is truthy", () => {
    const result = validateOption("error", "value1", "value2");
    expect(result).toBe("value1");
  });

  test("returns second value when first is undefined", () => {
    const result = validateOption("error", undefined, "value2");
    expect(result).toBe("value2");
  });

  test("returns third value when first two are undefined", () => {
    const result = validateOption("error", undefined, undefined, "value3");
    expect(result).toBe("value3");
  });

  test("returns first non-falsy value when some are empty strings", () => {
    const result = validateOption("error", "", undefined, "value3");
    expect(result).toBe("value3");
  });

  test("throws error with custom message when all values are undefined", () => {
    expect(() =>
      validateOption("Custom error message", undefined, undefined)
    ).toThrow("Custom error message");
  });

  test("throws error when all values are empty strings", () => {
    expect(() => validateOption("No valid value", "", "")).toThrow(
      "No valid value"
    );
  });

  test("throws error when no options provided", () => {
    expect(() => validateOption("No options")).toThrow("No options");
  });
});
