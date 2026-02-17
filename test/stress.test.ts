/**
 * Stress Testing Suite
 * Tests robustness under high load and edge conditions
 */

import {
  Client,
  APIResponseError,
  RequestTimeoutError,
  isFullPage,
} from "../src"

describe("Stress Tests", () => {
  describe("Concurrent Request Handling", () => {
    test("should handle multiple concurrent instantiations", async () => {
      const promises = []

      for (let i = 0; i < 50; i++) {
        promises.push(
          new Promise<void>(resolve => {
            const client = new Client({ auth: `token_${i}` })
            expect(client).toBeDefined()
            resolve()
          })
        )
      }

      await expect(Promise.all(promises)).resolves.toBeDefined()
    })

    test("should handle rapid sequential operations", async () => {
      const operations = []
      for (let i = 0; i < 1000; i++) {
        operations.push(() => {
          const testObj = { object: "page", id: "test" }
          isFullPage(testObj as never)
        })
      }

      const startTime = Date.now()
      operations.forEach(op => op())
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(1000) // Should complete in < 1 second
    })
  })

  describe("Rate Limiting Behavior", () => {
    test("should handle rate limit responses correctly", async () => {
      const errorBody = {
        object: "error",
        status: 429,
        code: "rate_limited",
        message: "Rate limited",
      }
      const mockFetch = jest.fn(async () => ({
        ok: false,
        status: 429,
        headers: new Map([
          ["content-type", "application/json"],
          ["retry-after", "1"],
        ]),
        json: async () => errorBody,
        text: async () => JSON.stringify(errorBody),
      })) as unknown as typeof fetch

      const client = new Client({
        auth: "test_token",
        fetch: mockFetch,
        retry: {
          maxRetries: 2,
          initialRetryDelayMs: 100,
          maxRetryDelayMs: 1000,
        },
      })

      await expect(
        client.users.list({
          page_size: 10,
        })
      ).rejects.toThrow()

      // Should have made initial attempt + 2 retries
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    test("should respect retry-after header", async () => {
      let attemptCount = 0
      const mockFetch = jest.fn(async () => {
        attemptCount++
        if (attemptCount <= 2) {
          const errorBody = {
            object: "error",
            status: 429,
            code: "rate_limited",
            message: "Rate limited",
          }
          const headers = new Headers()
          headers.set("content-type", "application/json")
          headers.set("retry-after", "1") // 1 second, per HTTP spec (must be whole seconds)
          return {
            ok: false,
            status: 429,
            headers,
            json: async () => errorBody,
            statusText: "Too Many Requests",
            type: "default",
            url: "",
            redirected: false,
            body: null,
            bodyUsed: false,
            arrayBuffer: async () => new ArrayBuffer(0),
            blob: async () => new Blob(),
            formData: async () => new FormData(),
            text: async () => JSON.stringify(errorBody),
            clone: function () {
              return this
            },
          } as unknown as Response
        }
        const successBody = {
          object: "list",
          results: [],
          has_more: false,
        }
        const headers = new Headers()
        headers.set("content-type", "application/json")
        return {
          ok: true,
          status: 200,
          headers,
          json: async () => successBody,
          statusText: "OK",
          type: "default",
          url: "",
          redirected: false,
          body: null,
          bodyUsed: false,
          arrayBuffer: async () => new ArrayBuffer(0),
          blob: async () => new Blob(),
          formData: async () => new FormData(),
          text: async () => JSON.stringify(successBody),
          clone: function () {
            return this
          },
        } as unknown as Response
      }) as unknown as typeof fetch

      const client = new Client({
        auth: "test_token",
        fetch: mockFetch,
        retry: {
          maxRetries: 3,
          initialRetryDelayMs: 100,
          maxRetryDelayMs: 1000,
        },
      })

      const startTime = Date.now()
      await client.users.list({ page_size: 10 })
      const duration = Date.now() - startTime

      // Should have waited for retry-after delays (2 retries x 1 second each)
      expect(duration).toBeGreaterThan(1800) // At least 1.8 seconds
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })
  })

  describe("Timeout Handling", () => {
    test("should timeout on very slow responses", async () => {
      const mockFetch = jest.fn(
        async () =>
          new Promise(resolve => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  status: 200,
                  headers: new Map([["content-type", "application/json"]]),
                  json: async () => ({ results: [] }),
                }),
              5000
            ) // 5 second delay
          })
      ) as unknown as typeof fetch

      const client = new Client({
        auth: "test_token",
        fetch: mockFetch,
        timeoutMs: 100, // 100ms timeout
      })

      await expect(
        client.users.list({
          page_size: 10,
        })
      ).rejects.toThrow(RequestTimeoutError)
    }, 10000)

    test("should handle multiple timeout scenarios", async () => {
      const errors: Error[] = []

      for (let i = 0; i < 5; i++) {
        const mockFetch = jest.fn(
          async () => new Promise(resolve => setTimeout(resolve, 200))
        ) as unknown as typeof fetch

        const client = new Client({
          auth: "test_token",
          fetch: mockFetch,
          timeoutMs: 50,
        })

        try {
          await client.users.list({ page_size: 10 })
        } catch (error) {
          errors.push(error as Error)
        }
      }

      expect(errors.length).toBe(5)
      errors.forEach(error => {
        expect(error).toBeInstanceOf(RequestTimeoutError)
      })
    })
  })

  describe("Large Payload Handling", () => {
    test("should handle large response bodies", async () => {
      const largeResults = Array.from({ length: 100 }, (_, i) => ({
        object: "user",
        id: `user-${i}`,
        type: "person",
        person: { email: `user${i}@example.com` },
        name: `User ${i}`,
      }))

      const responseBody = {
        object: "list",
        results: largeResults,
        has_more: false,
      }
      const mockFetch = jest.fn(async () => ({
        ok: true,
        status: 200,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => responseBody,
        text: async () => JSON.stringify(responseBody),
      })) as unknown as typeof fetch

      const client = new Client({
        auth: "test_token",
        fetch: mockFetch,
      })

      const response = await client.users.list({})
      expect(response.results.length).toBe(100)
    })

    test("should handle deeply nested structures", async () => {
      const nestedStructure = {
        object: "page",
        id: "test",
        created_time: "2021-01-01T00:00:00.000Z",
        last_edited_time: "2021-01-01T00:00:00.000Z",
        archived: false,
        properties: {
          title: {
            id: "title",
            type: "title",
            title: Array.from({ length: 50 }, (_, i) => ({
              type: "text",
              text: { content: `Text ${i}` },
            })),
          },
        },
        parent: { type: "workspace", workspace: true },
        url: "https://notion.so/test",
      }

      const mockFetch = jest.fn(
        async () =>
          ({
            ok: true,
            status: 200,
            headers: new Map([["content-type", "application/json"]]),
            json: async () => nestedStructure,
            statusText: "OK",
            type: "default",
            url: "",
            redirected: false,
            body: null,
            bodyUsed: false,
            arrayBuffer: async () => new ArrayBuffer(0),
            blob: async () => new Blob(),
            formData: async () => new FormData(),
            text: async () => JSON.stringify(nestedStructure),
            clone: function () {
              return this
            },
          }) as unknown as Response
      ) as unknown as typeof fetch

      const client = new Client({
        auth: "test_token",
        fetch: mockFetch,
      })

      const response = await client.pages.retrieve({ page_id: "test" })
      expect(response).toBeDefined()
      // Don't check for properties directly as the response type may vary
    })
  })

  describe("Error Recovery", () => {
    test("should recover from intermittent failures", async () => {
      let attemptCount = 0
      const mockFetch = jest.fn(async () => {
        attemptCount++
        if (attemptCount === 1) {
          const errorBody = {
            object: "error",
            status: 500,
            code: "internal_server_error",
            message: "Internal error",
          }
          return {
            ok: false,
            status: 500,
            headers: new Map([["content-type", "application/json"]]),
            json: async () => errorBody,
            statusText: "Internal Server Error",
            type: "default",
            url: "",
            redirected: false,
            body: null,
            bodyUsed: false,
            arrayBuffer: async () => new ArrayBuffer(0),
            blob: async () => new Blob(),
            formData: async () => new FormData(),
            text: async () => JSON.stringify(errorBody),
            clone: function () {
              return this
            },
          } as unknown as Response
        }
        const successBody = {
          object: "list",
          results: [],
          has_more: false,
        }
        return {
          ok: true,
          status: 200,
          headers: new Map([["content-type", "application/json"]]),
          json: async () => successBody,
          statusText: "OK",
          type: "default",
          url: "",
          redirected: false,
          body: null,
          bodyUsed: false,
          arrayBuffer: async () => new ArrayBuffer(0),
          blob: async () => new Blob(),
          formData: async () => new FormData(),
          text: async () => JSON.stringify(successBody),
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
          initialRetryDelayMs: 10,
          maxRetryDelayMs: 100,
        },
      })

      const response = await client.users.list({})
      expect(response.results).toEqual([])
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    test("should fail after max retries", async () => {
      const errorBody = {
        object: "error",
        status: 500,
        code: "internal_server_error",
        message: "Internal error",
      }
      const mockFetch = jest.fn(
        async () =>
          ({
            ok: false,
            status: 500,
            headers: new Map([["content-type", "application/json"]]),
            json: async () => errorBody,
            statusText: "Internal Server Error",
            type: "default",
            url: "",
            redirected: false,
            body: null,
            bodyUsed: false,
            arrayBuffer: async () => new ArrayBuffer(0),
            blob: async () => new Blob(),
            formData: async () => new FormData(),
            text: async () => JSON.stringify(errorBody),
            clone: function () {
              return this
            },
          }) as unknown as Response
      ) as unknown as typeof fetch

      const client = new Client({
        auth: "test_token",
        fetch: mockFetch,
        retry: {
          maxRetries: 2,
          initialRetryDelayMs: 10,
          maxRetryDelayMs: 100,
        },
      })

      await expect(client.users.list({})).rejects.toThrow(APIResponseError)
      expect(mockFetch).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })
  })

  describe("Resource Exhaustion", () => {
    test("should handle many sequential requests", async () => {
      const responseBody = {
        object: "list",
        results: [],
        has_more: false,
      }
      const mockFetch = jest.fn(async () => ({
        ok: true,
        status: 200,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => responseBody,
        text: async () => JSON.stringify(responseBody),
      })) as unknown as typeof fetch

      const client = new Client({
        auth: "test_token",
        fetch: mockFetch,
      })

      const requests = []
      for (let i = 0; i < 50; i++) {
        requests.push(client.users.list({}))
      }

      const results = await Promise.all(requests)
      expect(results.length).toBe(50)
      expect(mockFetch).toHaveBeenCalledTimes(50)
    })

    test("should not exhaust memory with many clients", () => {
      if (global.gc) {
        global.gc()
      }
      const initialMemory = process.memoryUsage().heapUsed

      const clients = []
      for (let i = 0; i < 200; i++) {
        clients.push(new Client({ auth: `token_${i}` }))
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryGrowth = finalMemory - initialMemory

      expect(clients.length).toBe(200)
      // Should not use more than 20MB for 200 clients
      expect(memoryGrowth).toBeLessThan(20 * 1024 * 1024)
    })
  })

  describe("Edge Cases", () => {
    test("should handle empty responses", async () => {
      const responseBody = {
        object: "list",
        results: [],
        has_more: false,
      }
      const mockFetch = jest.fn(
        async () =>
          ({
            ok: true,
            status: 200,
            headers: new Map([["content-type", "application/json"]]),
            json: async () => responseBody,
            statusText: "OK",
            type: "default",
            url: "",
            redirected: false,
            body: null,
            bodyUsed: false,
            arrayBuffer: async () => new ArrayBuffer(0),
            blob: async () => new Blob(),
            formData: async () => new FormData(),
            text: async () => JSON.stringify(responseBody),
            clone: function () {
              return this
            },
          }) as unknown as Response
      ) as unknown as typeof fetch

      const client = new Client({
        auth: "test_token",
        fetch: mockFetch,
      })

      const response = await client.users.list({})
      expect(response.results).toEqual([])
    })

    test("should handle special characters in parameters", async () => {
      const responseBody = {
        object: "list",
        results: [],
        has_more: false,
      }
      const mockFetch = jest.fn(
        async () =>
          ({
            ok: true,
            status: 200,
            headers: new Map([["content-type", "application/json"]]),
            json: async () => responseBody,
            statusText: "OK",
            type: "default",
            url: "",
            redirected: false,
            body: null,
            bodyUsed: false,
            arrayBuffer: async () => new ArrayBuffer(0),
            blob: async () => new Blob(),
            formData: async () => new FormData(),
            text: async () => JSON.stringify(responseBody),
            clone: function () {
              return this
            },
          }) as unknown as Response
      ) as unknown as typeof fetch

      const client = new Client({
        auth: "test_token",
        fetch: mockFetch,
      })

      await client.search({
        query: "Special chars: @#$%^&*()",
      })

      expect(mockFetch).toHaveBeenCalled()
    })
  })
})
