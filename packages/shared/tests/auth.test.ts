import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../src/utils/auth.js";

describe("password hashing", () => {
  it("hashes a password to a string different from the input", async () => {
    const hash = await hashPassword("mysecretpassword");
    expect(hash).toBeTypeOf("string");
    expect(hash).not.toBe("mysecretpassword");
    expect(hash.length).toBeGreaterThan(0);
  });

  it("produces different hashes for the same password (salted)", async () => {
    const hash1 = await hashPassword("same");
    const hash2 = await hashPassword("same");
    expect(hash1).not.toBe(hash2);
  });

  it("verifies a correct password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    const result = await verifyPassword("correct-horse-battery-staple", hash);
    expect(result).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    const result = await verifyPassword("wrong-password", hash);
    expect(result).toBe(false);
  });

  it("rejects empty password against a valid hash", async () => {
    const hash = await hashPassword("something");
    const result = await verifyPassword("", hash);
    expect(result).toBe(false);
  });
});
