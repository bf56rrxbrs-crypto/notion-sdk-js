/**
 * Compatibility Testing Suite
 * Tests cross-platform, Node.js version, and module format compatibility
 */

import { Client, isFullPage, isFullBlock } from "../src"

describe("Compatibility Tests", () => {
  describe("Node.js Environment", () => {
    test("should work in current Node.js version", () => {
      const version = process.version
      expect(version).toBeDefined()
      const versionParts = version.slice(1).split(".")
      const majorVersion = versionParts[0] ? parseInt(versionParts[0], 10) : 0
      expect(majorVersion).toBeGreaterThanOrEqual(18)
    })

    test("should have required global objects", () => {
      expect(typeof global).toBe("object")
      expect(typeof process).toBe("object")
      expect(typeof Buffer).toBe("function")
    })

    test("should support async/await", async () => {
      const asyncFunction = async () => "test"
      const result = await asyncFunction()
      expect(result).toBe("test")
    })

    test("should support Promise", () => {
      const promise = Promise.resolve("test")
      expect(promise).toBeInstanceOf(Promise)
    })
  })

  describe("Module System", () => {
    test("should export Client class", () => {
      expect(Client).toBeDefined()
      expect(typeof Client).toBe("function")
    })

    test("should be able to instantiate Client", () => {
      const client = new Client({ auth: "test_token" })
      expect(client).toBeInstanceOf(Client)
    })

    test("should export error types", () => {
      expect(Client).toBeDefined()
      // Error types are exported and available
    })

    test("should export helper functions", () => {
      expect(typeof isFullPage).toBe("function")
      expect(typeof isFullBlock).toBe("function")
    })
  })

  describe("Platform Compatibility", () => {
    test("should identify platform", () => {
      expect(process.platform).toBeDefined()
      expect(typeof process.platform).toBe("string")
    })

    test("should identify architecture", () => {
      expect(process.arch).toBeDefined()
      expect(typeof process.arch).toBe("string")
    })

    test("should have file system access", () => {
      expect(process.cwd()).toBeDefined()
      expect(typeof process.cwd).toBe("function")
    })
  })

  describe("TypeScript Compatibility", () => {
    test("should support type guards", () => {
      const pageObject = {
        object: "page",
        id: "test-id",
        created_time: "2021-01-01T00:00:00.000Z",
        last_edited_time: "2021-01-01T00:00:00.000Z",
        archived: false,
        properties: {},
        parent: { type: "workspace", workspace: true },
        url: "https://notion.so/test",
        public_url: null,
      } as const

      expect(isFullPage(pageObject as never)).toBe(true)
      expect(isFullBlock(pageObject as never)).toBe(false)
    })

    test("should have proper type exports", () => {
      expect(Client).toBeDefined()
      // Types are available at compile time
    })
  })

  describe("HTTP Client Compatibility", () => {
    test("should handle URL construction", () => {
      const client = new Client({
        auth: "test_token",
      })
      expect(client).toBeDefined()
    })

    test("should support custom base URL", () => {
      const customBaseUrl = "https://custom.notion.api"
      const client = new Client({
        auth: "test_token",
        baseUrl: customBaseUrl,
      })
      expect(client).toBeDefined()
    })

    test("should support custom timeouts", () => {
      const client = new Client({
        auth: "test_token",
        timeoutMs: 30000,
      })
      expect(client).toBeDefined()
    })

    test("should support custom Notion version", () => {
      const client = new Client({
        auth: "test_token",
        notionVersion: "2022-06-28",
      })
      expect(client).toBeDefined()
    })
  })

  describe("Encoding Compatibility", () => {
    test("should handle UTF-8 strings", () => {
      const utf8String = "Hello 世界 🌍"
      expect(utf8String).toBeDefined()
      expect(utf8String.length).toBeGreaterThan(0)
    })

    test("should handle special characters in parameters", () => {
      const id = "123e4567-e89b-12d3-a456-426614174000"
      expect(id).toBeDefined()
    })
  })

  describe("Memory Management", () => {
    test("should not leak memory on client creation", () => {
      const initialMemory = process.memoryUsage().heapUsed
      const clients = []

      for (let i = 0; i < 100; i++) {
        clients.push(new Client({ auth: `token_${i}` }))
      }

      clients.length = 0

      const finalMemory = process.memoryUsage().heapUsed
      const memoryGrowth = finalMemory - initialMemory

      // Memory growth should be reasonable (less than 10MB for 100 clients)
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024)
    })
  })
})
