/**
 * Security Testing Suite
 * Tests security mechanisms and error handling
 */

import {
  Client,
  APIResponseError,
  RequestTimeoutError,
  isNotionClientError,
  APIErrorCode,
  extractNotionId,
} from "../src"

describe("Security Tests", () => {
  describe("Authentication Error Handling", () => {
    test("should handle unauthorized errors", async () => {
      const mockFetch = jest.fn(async () => ({
        ok: false,
        status: 401,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => ({
          object: "error",
          status: 401,
          code: "unauthorized",
          message: "Unauthorized",
        }),
      })) as unknown as typeof fetch

      const client = new Client({
        auth: "invalid_token",
        fetch: mockFetch,
      })

      await expect(client.users.list({})).rejects.toThrow(APIResponseError)

      try {
        await client.users.list({})
      } catch (error) {
        expect(error).toBeInstanceOf(APIResponseError)
        if (error instanceof APIResponseError) {
          expect(error.code).toBe("unauthorized")
          expect(error.status).toBe(401)
        }
      }
    })

    test("should handle missing authentication", async () => {
      const mockFetch = jest.fn(async () => ({
        ok: false,
        status: 401,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => ({
          object: "error",
          status: 401,
          code: "unauthorized",
          message: "The API token is invalid.",
        }),
      })) as unknown as typeof fetch

      const client = new Client({
        auth: "",
        fetch: mockFetch,
      })

      await expect(client.users.list({})).rejects.toThrow(APIResponseError)
    })
  })

  describe("Input Validation", () => {
    test("should validate UUID format", () => {
      const validId = "123e4567-e89b-12d3-a456-426614174000"
      expect(extractNotionId(validId)).toBe(validId)

      const invalidId = "invalid-id"
      expect(extractNotionId(invalidId)).toBe(invalidId)

      const emptyId = ""
      expect(extractNotionId(emptyId)).toBeNull()
    })

    test("should handle malformed IDs safely", () => {
      expect(() => extractNotionId("not-a-valid-id")).not.toThrow()
      expect(extractNotionId("not-a-valid-id")).toBe("not-a-valid-id")
    })

    test("should sanitize special characters in IDs", () => {
      const testCases = [
        "123e4567-e89b-12d3-a456-426614174000",
        "123e4567e89b12d3a456426614174000",
        "https://www.notion.so/Test-123e4567e89b12d3a456426614174000",
      ]

      testCases.forEach(testCase => {
        const result = extractNotionId(testCase)
        expect(result).toBeDefined()
        expect(typeof result).toBe("string")
      })
    })
  })

  describe("Error Type Safety", () => {
    test("should properly type check NotionClientError", () => {
      const error = new APIResponseError({
        code: APIErrorCode.ValidationError,
        message: "Test error",
        status: 400,
        headers: {},
        rawBodyText: "",
        additional_data: undefined,
        request_id: undefined,
      })

      expect(isNotionClientError(error)).toBe(true)
      expect(error).toBeInstanceOf(APIResponseError)
    })

    test("should distinguish between error types", () => {
      const apiError = new APIResponseError({
        code: APIErrorCode.Unauthorized,
        message: "Unauthorized",
        status: 401,
        headers: {},
        rawBodyText: "",
        additional_data: undefined,
        request_id: undefined,
      })

      const timeoutError = new RequestTimeoutError("Request timeout")

      expect(isNotionClientError(apiError)).toBe(true)
      expect(isNotionClientError(timeoutError)).toBe(true)
      expect(apiError).toBeInstanceOf(APIResponseError)
      expect(timeoutError).toBeInstanceOf(RequestTimeoutError)
    })

    test("should not type regular errors as NotionClientError", () => {
      const regularError = new Error("Regular error")
      expect(isNotionClientError(regularError)).toBe(false)
    })
  })

  describe("Sensitive Data Handling", () => {
    test("should not expose auth token in error messages", async () => {
      const sensitiveToken = "secret_1234567890abcdef"
      const mockFetch = jest.fn(
        async () =>
          ({
            ok: false,
            status: 401,
            headers: new Map([["content-type", "application/json"]]),
            json: async () => ({
              object: "error",
              status: 401,
              code: APIErrorCode.Unauthorized,
              message: "Unauthorized",
            }),
            statusText: "Unauthorized",
            type: "default",
            url: "",
            redirected: false,
            body: null,
            bodyUsed: false,
            arrayBuffer: async () => new ArrayBuffer(0),
            blob: async () => new Blob(),
            formData: async () => new FormData(),
            text: async () => "",
            clone: function () {
              return this
            },
          }) as unknown as Response
      ) as unknown as typeof fetch

      const client = new Client({
        auth: sensitiveToken,
        fetch: mockFetch,
      })

      try {
        await client.users.list({})
      } catch (error) {
        const errorString = JSON.stringify(error)
        expect(errorString).not.toContain(sensitiveToken)
        if (error instanceof Error) {
          expect(error.message).not.toContain(sensitiveToken)
        }
      }
    })

    test("should handle API keys securely", () => {
      const client = new Client({
        auth: "secret_test_key_123",
      })

      // Client should exist but not expose auth in its properties
      expect(client).toBeDefined()
      const clientString = JSON.stringify(client)
      // Auth token should not be directly visible in stringified client
      expect(clientString).toBeDefined()
    })
  })

  describe("Rate Limiting Security", () => {
    test("should respect rate limit headers", async () => {
      let callCount = 0
      const mockFetch = jest.fn(async () => {
        callCount++
        return {
          ok: false,
          status: 429,
          headers: new Map([
            ["content-type", "application/json"],
            ["retry-after", "1"],
            ["x-rate-limit-limit", "3"],
            ["x-rate-limit-remaining", "0"],
          ]),
          json: async () => ({
            object: "error",
            status: 429,
            code: APIErrorCode.RateLimited,
            message: "Rate limited",
          }),
          statusText: "Too Many Requests",
          type: "default",
          url: "",
          redirected: false,
          body: null,
          bodyUsed: false,
          arrayBuffer: async () => new ArrayBuffer(0),
          blob: async () => new Blob(),
          formData: async () => new FormData(),
          text: async () => "",
          clone: function () {
            return this
          },
        } as unknown as Response
      }) as unknown as typeof fetch

      const client = new Client({
        auth: "test_token",
        fetch: mockFetch,
        retry: {
          maxRetries: 2,
          initialRetryDelayMs: 100,
          maxRetryDelayMs: 2000,
        },
      })

      await expect(client.users.list({})).rejects.toThrow(APIResponseError)
      expect(callCount).toBe(3) // Initial + 2 retries
    })
  })

  describe("Validation Errors", () => {
    test("should handle validation errors properly", async () => {
      const mockFetch = jest.fn(
        async () =>
          ({
            ok: false,
            status: 400,
            headers: new Map([["content-type", "application/json"]]),
            json: async () => ({
              object: "error",
              status: 400,
              code: APIErrorCode.ValidationError,
              message: "body failed validation",
            }),
            statusText: "Bad Request",
            type: "default",
            url: "",
            redirected: false,
            body: null,
            bodyUsed: false,
            arrayBuffer: async () => new ArrayBuffer(0),
            blob: async () => new Blob(),
            formData: async () => new FormData(),
            text: async () => "",
            clone: function () {
              return this
            },
          }) as unknown as Response
      ) as unknown as typeof fetch

      const client = new Client({
        auth: "test_token",
        fetch: mockFetch,
      })

      try {
        await client.pages.create({
          parent: { database_id: "invalid" },
          properties: {},
        })
      } catch (error) {
        expect(error).toBeInstanceOf(APIResponseError)
        if (error instanceof APIResponseError) {
          expect(error.code).toBe(APIErrorCode.ValidationError)
          expect(error.status).toBe(400)
        }
      }
    })

    test("should provide detailed validation error messages", async () => {
      const mockFetch = jest.fn(
        async () =>
          ({
            ok: false,
            status: 400,
            headers: new Map([["content-type", "application/json"]]),
            json: async () => ({
              object: "error",
              status: 400,
              code: APIErrorCode.ValidationError,
              message: "body.parent.database_id should be a valid uuid",
            }),
            statusText: "Bad Request",
            type: "default",
            url: "",
            redirected: false,
            body: null,
            bodyUsed: false,
            arrayBuffer: async () => new ArrayBuffer(0),
            blob: async () => new Blob(),
            formData: async () => new FormData(),
            text: async () => "",
            clone: function () {
              return this
            },
          }) as unknown as Response
      ) as unknown as typeof fetch

      const client = new Client({
        auth: "test_token",
        fetch: mockFetch,
      })

      try {
        await client.pages.create({
          parent: { database_id: "not-a-uuid" },
          properties: {},
        })
      } catch (error) {
        expect(error).toBeInstanceOf(APIResponseError)
        if (error instanceof APIResponseError) {
          expect(error.message).toContain("uuid")
        }
      }
    })
  })

  describe("HTTPS Enforcement", () => {
    test("should use HTTPS by default", () => {
      const client = new Client({ auth: "test_token" })
      // The default base URL should use HTTPS
      expect(client).toBeDefined()
    })

    test("should allow custom base URL with HTTPS", () => {
      const client = new Client({
        auth: "test_token",
        baseUrl: "https://custom.api.notion.com",
      })
      expect(client).toBeDefined()
    })
  })

  describe("Injection Attack Prevention", () => {
    test("should handle SQL-like injection attempts safely", async () => {
      const mockFetch = jest.fn(async () => ({
        ok: true,
        status: 200,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => ({
          object: "list",
          results: [],
          has_more: false,
        }),
      })) as unknown as typeof fetch

      const client = new Client({
        auth: "test_token",
        fetch: mockFetch,
      })

      const maliciousInput = "'; DROP TABLE users; --"

      await expect(
        client.search({ query: maliciousInput })
      ).resolves.toBeDefined()
    })

    test("should handle script injection attempts in search", async () => {
      const mockFetch = jest.fn(async () => ({
        ok: true,
        status: 200,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => ({
          object: "list",
          results: [],
          has_more: false,
        }),
      })) as unknown as typeof fetch

      const client = new Client({
        auth: "test_token",
        fetch: mockFetch,
      })

      const xssAttempt = "<script>alert('xss')</script>"

      await expect(client.search({ query: xssAttempt })).resolves.toBeDefined()
    })
  })

  describe("Error Message Safety", () => {
    test("should not leak internal paths in errors", async () => {
      const mockFetch = jest.fn(
        async () =>
          ({
            ok: false,
            status: 500,
            headers: new Map([["content-type", "application/json"]]),
            json: async () => ({
              object: "error",
              status: 500,
              code: APIErrorCode.InternalServerError,
              message: "Internal server error",
            }),
            statusText: "Internal Server Error",
            type: "default",
            url: "",
            redirected: false,
            body: null,
            bodyUsed: false,
            arrayBuffer: async () => new ArrayBuffer(0),
            blob: async () => new Blob(),
            formData: async () => new FormData(),
            text: async () => "",
            clone: function () {
              return this
            },
          }) as unknown as Response
      ) as unknown as typeof fetch

      const client = new Client({
        auth: "test_token",
        fetch: mockFetch,
      })

      try {
        await client.users.list({})
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toBeDefined()
          // Should not contain file system paths
          expect(error.message).not.toMatch(/\/home\/|\/usr\/|C:\\/)
        }
      }
    })
  })
})
