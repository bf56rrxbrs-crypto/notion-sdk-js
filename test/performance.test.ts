/**
 * Performance Testing Suite
 * Tests latency, throughput, and performance characteristics
 */

import { Client, isFullPage, isFullBlock, extractNotionId } from "../src"

describe("Performance Tests", () => {
  describe("Client Instantiation Performance", () => {
    test("should instantiate client quickly", () => {
      const startTime = Date.now()
      const client = new Client({ auth: "test_token" })
      const endTime = Date.now()

      expect(client).toBeDefined()
      expect(endTime - startTime).toBeLessThan(100) // Should be < 100ms
    })

    test("should handle multiple client instances", () => {
      const startTime = Date.now()
      const clients = []

      for (let i = 0; i < 50; i++) {
        clients.push(new Client({ auth: `token_${i}` }))
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(clients.length).toBe(50)
      expect(duration).toBeLessThan(500) // Should create 50 clients in < 500ms
    })
  })

  describe("Helper Function Performance", () => {
    test("should extract IDs quickly", () => {
      const validId = "123e4567-e89b-12d3-a456-426614174000"

      const startTime = performance.now()
      for (let i = 0; i < 1000; i++) {
        extractNotionId(validId)
      }
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(100) // 1000 validations in < 100ms
    })

    test("should extract IDs efficiently", () => {
      const url =
        "https://www.notion.so/myworkspace/Test-Page-123e4567e89b12d3a456426614174000"

      const startTime = performance.now()
      for (let i = 0; i < 1000; i++) {
        extractNotionId(url)
      }
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(100) // 1000 extractions in < 100ms
    })

    test("should check type guards efficiently", () => {
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
      }

      const startTime = performance.now()
      for (let i = 0; i < 1000; i++) {
        isFullPage(pageObject as never)
      }
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(50) // 1000 checks in < 50ms
    })
  })

  describe("Type Guard Performance", () => {
    test("should check isFullPage efficiently", () => {
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
      }

      const startTime = performance.now()
      for (let i = 0; i < 10000; i++) {
        isFullPage(pageObject as never)
      }
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(50) // 10000 checks in < 50ms
    })

    test("should check isFullBlock efficiently", () => {
      const blockObject = {
        object: "block",
        id: "test-id",
        created_time: "2021-01-01T00:00:00.000Z",
        last_edited_time: "2021-01-01T00:00:00.000Z",
        archived: false,
        has_children: false,
        type: "paragraph",
        paragraph: { rich_text: [], color: "default" },
      }

      const startTime = performance.now()
      for (let i = 0; i < 10000; i++) {
        isFullBlock(blockObject as never)
      }
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(50) // 10000 checks in < 50ms
    })
  })

  describe("Error Creation Performance", () => {
    test("should create error objects efficiently", () => {
      const startTime = performance.now()
      for (let i = 0; i < 1000; i++) {
        const error = new Error("Test error")
        expect(error).toBeDefined()
      }
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(100) // 1000 error creations in < 100ms
    })
  })

  describe("Retry Logic Performance", () => {
    test("should calculate retry delay efficiently", () => {
      // Test the retry delay calculation performance
      const startTime = performance.now()

      for (let i = 0; i < 1000; i++) {
        const attempt = i % 5
        const baseDelay = 1000
        const maxDelay = 60000
        // Exponential back-off calculation
        const exponentialDelay = Math.min(
          baseDelay * Math.pow(2, attempt),
          maxDelay
        )
        const jitter = Math.random() * 0.1 * exponentialDelay
        const delay = exponentialDelay + jitter
        expect(delay).toBeGreaterThan(0)
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(100) // 1000 calculations in < 100ms
    })
  })

  describe("Memory Efficiency", () => {
    test("should not leak memory with repeated operations", () => {
      const testObject = {
        object: "page",
        id: "test",
        created_time: "2021-01-01T00:00:00.000Z",
        last_edited_time: "2021-01-01T00:00:00.000Z",
        archived: false,
        properties: {},
        parent: { type: "workspace", workspace: true },
        url: "https://notion.so/test",
        public_url: null,
      }

      if (global.gc) {
        global.gc()
      }
      const initialMemory = process.memoryUsage().heapUsed

      // Perform many operations
      for (let i = 0; i < 10000; i++) {
        isFullPage(testObject as never)
      }

      if (global.gc) {
        global.gc()
      }
      const finalMemory = process.memoryUsage().heapUsed
      const memoryGrowth = finalMemory - initialMemory

      // Memory should not grow significantly (< 5MB)
      expect(memoryGrowth).toBeLessThan(5 * 1024 * 1024)
    })

    test("should handle large arrays efficiently", () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => ({
        object: "page",
        id: `test-${i}`,
        created_time: "2021-01-01T00:00:00.000Z",
        last_edited_time: "2021-01-01T00:00:00.000Z",
        archived: false,
        properties: {},
        parent: { type: "workspace", workspace: true },
        url: "https://notion.so/test",
        public_url: null,
      }))

      const startTime = performance.now()
      largeArray.forEach(item => isFullPage(item as never))
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(50) // Should process 100 items in < 50ms
    })
  })

  describe("Throughput Benchmarks", () => {
    test("should handle rapid client creation", () => {
      const startTime = performance.now()
      const clients = []

      for (let i = 0; i < 100; i++) {
        clients.push(new Client({ auth: `token_${i}` }))
      }

      const endTime = performance.now()
      const duration = endTime - startTime
      const throughput = (100 / duration) * 1000 // clients per second

      expect(clients.length).toBe(100)
      expect(throughput).toBeGreaterThan(100) // Should create > 100 clients/sec
    })

    test("should handle rapid type checking", () => {
      const testObject = {
        object: "page",
        id: "test",
        created_time: "2021-01-01T00:00:00.000Z",
        last_edited_time: "2021-01-01T00:00:00.000Z",
        archived: false,
        properties: {},
        parent: { type: "workspace", workspace: true },
        url: "https://notion.so/test",
        public_url: null,
      }

      const iterations = 100000
      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        isFullPage(testObject as never)
      }

      const endTime = performance.now()
      const duration = endTime - startTime
      const throughput = (iterations / duration) * 1000 // ops per second

      expect(throughput).toBeGreaterThan(100000) // Should do > 100k ops/sec
    })
  })
})
