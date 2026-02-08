import {
  isValidNotionId,
  richTextToPlainText,
  richTextToMarkdown,
  getPageTitle,
  getPageProperty,
  getBlockPlainText,
  getPagePropertyNames,
  getPagePropertiesAsObject,
} from "../src/helpers"
import type {
  RichTextItemResponse,
  PageObjectResponse,
  BlockObjectResponse,
} from "../src/api-endpoints"

describe("Utility functions", () => {
  describe("isValidNotionId", () => {
    it("should validate standard UUID format", () => {
      expect(isValidNotionId("12345678-1234-1234-1234-123456789abc")).toBe(true)
      expect(isValidNotionId("a1b2c3d4-e5f6-7890-abcd-ef1234567890")).toBe(true)
    })

    it("should validate compact UUID format", () => {
      expect(isValidNotionId("12345678123412341234123456789abc")).toBe(true)
      expect(isValidNotionId("a1b2c3d4e5f67890abcdef1234567890")).toBe(true)
    })

    it("should reject invalid formats", () => {
      expect(isValidNotionId("invalid-id")).toBe(false)
      expect(isValidNotionId("12345678-1234-1234-1234")).toBe(false)
      expect(isValidNotionId("")).toBe(false)
      expect(isValidNotionId("not a uuid at all")).toBe(false)
    })

    it("should handle edge cases", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(isValidNotionId(null as any)).toBe(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(isValidNotionId(undefined as any)).toBe(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(isValidNotionId(123 as any)).toBe(false)
    })

    it("should handle whitespace", () => {
      expect(isValidNotionId("  12345678-1234-1234-1234-123456789abc  ")).toBe(
        true
      )
    })
  })

  describe("richTextToPlainText", () => {
    it("should convert simple text", () => {
      const richText: RichTextItemResponse[] = [
        {
          type: "text",
          text: { content: "Hello World", link: null },
          plain_text: "Hello World",
          href: null,
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
        },
      ]
      expect(richTextToPlainText(richText)).toBe("Hello World")
    })

    it("should handle multiple text items", () => {
      const richText: RichTextItemResponse[] = [
        {
          type: "text",
          text: { content: "Hello ", link: null },
          plain_text: "Hello ",
          href: null,
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
        },
        {
          type: "text",
          text: { content: "World", link: null },
          plain_text: "World",
          href: null,
          annotations: {
            bold: true,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
        },
      ]
      expect(richTextToPlainText(richText)).toBe("Hello World")
    })

    it("should handle empty array", () => {
      expect(richTextToPlainText([])).toBe("")
    })

    it("should handle null/undefined", () => {
      expect(richTextToPlainText(null)).toBe("")
      expect(richTextToPlainText(undefined)).toBe("")
    })

    it("should handle equation type", () => {
      const richText: RichTextItemResponse[] = [
        {
          type: "equation",
          equation: { expression: "E=mc^2" },
          plain_text: "E=mc^2",
          href: null,
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
        },
      ]
      expect(richTextToPlainText(richText)).toBe("E=mc^2")
    })
  })

  describe("richTextToMarkdown", () => {
    it("should convert text with bold formatting", () => {
      const richText: RichTextItemResponse[] = [
        {
          type: "text",
          text: { content: "Bold text", link: null },
          plain_text: "Bold text",
          href: null,
          annotations: {
            bold: true,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
        },
      ]
      expect(richTextToMarkdown(richText)).toBe("**Bold text**")
    })

    it("should convert text with italic formatting", () => {
      const richText: RichTextItemResponse[] = [
        {
          type: "text",
          text: { content: "Italic text", link: null },
          plain_text: "Italic text",
          href: null,
          annotations: {
            bold: false,
            italic: true,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
        },
      ]
      expect(richTextToMarkdown(richText)).toBe("*Italic text*")
    })

    it("should convert text with code formatting", () => {
      const richText: RichTextItemResponse[] = [
        {
          type: "text",
          text: { content: "code", link: null },
          plain_text: "code",
          href: null,
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: true,
            color: "default",
          },
        },
      ]
      expect(richTextToMarkdown(richText)).toBe("`code`")
    })

    it("should convert text with strikethrough formatting", () => {
      const richText: RichTextItemResponse[] = [
        {
          type: "text",
          text: { content: "strikethrough", link: null },
          plain_text: "strikethrough",
          href: null,
          annotations: {
            bold: false,
            italic: false,
            strikethrough: true,
            underline: false,
            code: false,
            color: "default",
          },
        },
      ]
      expect(richTextToMarkdown(richText)).toBe("~~strikethrough~~")
    })

    it("should convert text with underline formatting", () => {
      const richText: RichTextItemResponse[] = [
        {
          type: "text",
          text: { content: "underline", link: null },
          plain_text: "underline",
          href: null,
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: true,
            code: false,
            color: "default",
          },
        },
      ]
      expect(richTextToMarkdown(richText)).toBe("<u>underline</u>")
    })

    it("should convert links", () => {
      const richText: RichTextItemResponse[] = [
        {
          type: "text",
          text: {
            content: "Click here",
            link: { url: "https://example.com" },
          },
          plain_text: "Click here",
          href: "https://example.com",
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
        },
      ]
      expect(richTextToMarkdown(richText)).toBe(
        "[Click here](https://example.com)"
      )
    })

    it("should handle combined formatting", () => {
      const richText: RichTextItemResponse[] = [
        {
          type: "text",
          text: { content: "Bold and italic", link: null },
          plain_text: "Bold and italic",
          href: null,
          annotations: {
            bold: true,
            italic: true,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
        },
      ]
      expect(richTextToMarkdown(richText)).toBe("***Bold and italic***")
    })

    it("should handle equation type", () => {
      const richText: RichTextItemResponse[] = [
        {
          type: "equation",
          equation: { expression: "E=mc^2" },
          plain_text: "E=mc^2",
          href: null,
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
        },
      ]
      expect(richTextToMarkdown(richText)).toBe("$E=mc^2$")
    })

    it("should handle mention type", () => {
      const richText: RichTextItemResponse[] = [
        {
          type: "mention",
          mention: {
            type: "user",
            user: {
              object: "user",
              id: "user-id",
            },
          },
          // Notion API includes @ in plain_text for mentions
          plain_text: "@John Doe",
          href: null,
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
        },
      ]
      // Double @ is expected because Notion includes @ in plain_text
      expect(richTextToMarkdown(richText)).toBe("@@John Doe")
    })

    it("should handle empty array", () => {
      expect(richTextToMarkdown([])).toBe("")
    })

    it("should handle null/undefined", () => {
      expect(richTextToMarkdown(null)).toBe("")
      expect(richTextToMarkdown(undefined)).toBe("")
    })
  })

  describe("getPageTitle", () => {
    it("should extract title from page", () => {
      const page: PageObjectResponse = {
        object: "page",
        id: "page-id",
        created_time: "2023-01-01T00:00:00.000Z",
        last_edited_time: "2023-01-01T00:00:00.000Z",
        created_by: { object: "user", id: "user-id" },
        last_edited_by: { object: "user", id: "user-id" },
        cover: null,
        icon: null,
        parent: { type: "workspace", workspace: true },
        archived: false,
        in_trash: false,
        is_locked: false,
        properties: {
          title: {
            id: "title",
            type: "title",
            title: [
              {
                type: "text",
                text: { content: "My Page Title", link: null },
                plain_text: "My Page Title",
                href: null,
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: "default",
                },
              },
            ],
          },
        },
        url: "https://notion.so/page-id",
        public_url: null,
      }

      expect(getPageTitle(page)).toBe("My Page Title")
    })

    it("should handle page without title", () => {
      const page: PageObjectResponse = {
        object: "page",
        id: "page-id",
        created_time: "2023-01-01T00:00:00.000Z",
        last_edited_time: "2023-01-01T00:00:00.000Z",
        created_by: { object: "user", id: "user-id" },
        last_edited_by: { object: "user", id: "user-id" },
        cover: null,
        icon: null,
        parent: { type: "workspace", workspace: true },
        archived: false,
        in_trash: false,
        is_locked: false,
        properties: {},
        url: "https://notion.so/page-id",
        public_url: null,
      }

      expect(getPageTitle(page)).toBe("")
    })

    it("should handle partial page", () => {
      const partialPage = {
        object: "page" as const,
        id: "page-id",
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(getPageTitle(partialPage as any)).toBe("")
    })
  })

  describe("getPageProperty", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createPage = (properties: any): PageObjectResponse => ({
      object: "page",
      id: "page-id",
      created_time: "2023-01-01T00:00:00.000Z",
      last_edited_time: "2023-01-01T00:00:00.000Z",
      created_by: { object: "user", id: "user-id" },
      last_edited_by: { object: "user", id: "user-id" },
      cover: null,
      icon: null,
      parent: { type: "workspace", workspace: true },
      archived: false,
      in_trash: false,
      is_locked: false,
      properties,
      url: "https://notion.so/page-id",
      public_url: null,
    })

    it("should extract title property", () => {
      const page = createPage({
        Name: {
          id: "title",
          type: "title",
          title: [
            {
              type: "text",
              text: { content: "Test Title", link: null },
              plain_text: "Test Title",
              href: null,
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
            },
          ],
        },
      })

      expect(getPageProperty(page, "Name")).toBe("Test Title")
    })

    it("should extract rich_text property", () => {
      const page = createPage({
        Description: {
          id: "desc",
          type: "rich_text",
          rich_text: [
            {
              type: "text",
              text: { content: "Some description", link: null },
              plain_text: "Some description",
              href: null,
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
            },
          ],
        },
      })

      expect(getPageProperty(page, "Description")).toBe("Some description")
    })

    it("should extract number property", () => {
      const page = createPage({
        Count: {
          id: "count",
          type: "number",
          number: 42,
        },
      })

      expect(getPageProperty(page, "Count")).toBe(42)
    })

    it("should extract select property", () => {
      const page = createPage({
        Status: {
          id: "status",
          type: "select",
          select: { id: "1", name: "Active", color: "green" },
        },
      })

      expect(getPageProperty(page, "Status")).toBe("Active")
    })

    it("should extract multi_select property", () => {
      const page = createPage({
        Tags: {
          id: "tags",
          type: "multi_select",
          multi_select: [
            { id: "1", name: "Tag1", color: "blue" },
            { id: "2", name: "Tag2", color: "red" },
          ],
        },
      })

      expect(getPageProperty(page, "Tags")).toEqual(["Tag1", "Tag2"])
    })

    it("should extract checkbox property", () => {
      const page = createPage({
        Done: {
          id: "done",
          type: "checkbox",
          checkbox: true,
        },
      })

      expect(getPageProperty(page, "Done")).toBe(true)
    })

    it("should extract url property", () => {
      const page = createPage({
        Website: {
          id: "url",
          type: "url",
          url: "https://example.com",
        },
      })

      expect(getPageProperty(page, "Website")).toBe("https://example.com")
    })

    it("should return null for non-existent property", () => {
      const page = createPage({})

      expect(getPageProperty(page, "NonExistent")).toBe(null)
    })

    it("should handle partial page", () => {
      const partialPage = {
        object: "page" as const,
        id: "page-id",
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(getPageProperty(partialPage as any, "Name")).toBe(null)
    })
  })

  describe("getBlockPlainText", () => {
    it("should extract text from paragraph block", () => {
      const block: BlockObjectResponse = {
        object: "block",
        id: "block-id",
        created_time: "2023-01-01T00:00:00.000Z",
        last_edited_time: "2023-01-01T00:00:00.000Z",
        created_by: { object: "user", id: "user-id" },
        last_edited_by: { object: "user", id: "user-id" },
        has_children: false,
        archived: false,
        in_trash: false,
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: { content: "Block content", link: null },
              plain_text: "Block content",
              href: null,
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
            },
          ],
          color: "default",
        },
        parent: { type: "page_id", page_id: "page-id" },
      }

      expect(getBlockPlainText(block)).toBe("Block content")
    })

    it("should extract text from heading blocks", () => {
      const h1Block: BlockObjectResponse = {
        object: "block",
        id: "block-id",
        created_time: "2023-01-01T00:00:00.000Z",
        last_edited_time: "2023-01-01T00:00:00.000Z",
        created_by: { object: "user", id: "user-id" },
        last_edited_by: { object: "user", id: "user-id" },
        has_children: false,
        archived: false,
        in_trash: false,
        type: "heading_1",
        heading_1: {
          rich_text: [
            {
              type: "text",
              text: { content: "Heading 1", link: null },
              plain_text: "Heading 1",
              href: null,
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
            },
          ],
          color: "default",
          is_toggleable: false,
        },
        parent: { type: "page_id", page_id: "page-id" },
      }

      expect(getBlockPlainText(h1Block)).toBe("Heading 1")
    })

    it("should extract text from list item blocks", () => {
      const listBlock: BlockObjectResponse = {
        object: "block",
        id: "block-id",
        created_time: "2023-01-01T00:00:00.000Z",
        last_edited_time: "2023-01-01T00:00:00.000Z",
        created_by: { object: "user", id: "user-id" },
        last_edited_by: { object: "user", id: "user-id" },
        has_children: false,
        archived: false,
        in_trash: false,
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [
            {
              type: "text",
              text: { content: "List item", link: null },
              plain_text: "List item",
              href: null,
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
            },
          ],
          color: "default",
        },
        parent: { type: "page_id", page_id: "page-id" },
      }

      expect(getBlockPlainText(listBlock)).toBe("List item")
    })

    it("should return empty string for unsupported block types", () => {
      const imageBlock: BlockObjectResponse = {
        object: "block",
        id: "block-id",
        created_time: "2023-01-01T00:00:00.000Z",
        last_edited_time: "2023-01-01T00:00:00.000Z",
        created_by: { object: "user", id: "user-id" },
        last_edited_by: { object: "user", id: "user-id" },
        has_children: false,
        archived: false,
        in_trash: false,
        type: "image",
        image: {
          type: "external",
          external: { url: "https://example.com/image.jpg" },
          caption: [],
        },
        parent: { type: "page_id", page_id: "page-id" },
      }

      expect(getBlockPlainText(imageBlock)).toBe("")
    })

    it("should handle partial block", () => {
      const partialBlock = {
        object: "block" as const,
        id: "block-id",
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(getBlockPlainText(partialBlock as any)).toBe("")
    })
  })

  describe("getPagePropertyNames", () => {
    it("should return array of property names", () => {
      const page: PageObjectResponse = {
        object: "page",
        id: "page-id",
        created_time: "2023-01-01T00:00:00.000Z",
        last_edited_time: "2023-01-01T00:00:00.000Z",
        created_by: { object: "user", id: "user-id" },
        last_edited_by: { object: "user", id: "user-id" },
        cover: null,
        icon: null,
        parent: { type: "workspace", workspace: true },
        archived: false,
        in_trash: false,
        is_locked: false,
        properties: {
          Name: {
            id: "title",
            type: "title",
            title: [],
          },
          Status: {
            id: "status",
            type: "select",
            select: null,
          },
          Tags: {
            id: "tags",
            type: "multi_select",
            multi_select: [],
          },
        },
        url: "https://notion.so/page-id",
        public_url: null,
      }

      const names = getPagePropertyNames(page)
      expect(names).toContain("Name")
      expect(names).toContain("Status")
      expect(names).toContain("Tags")
      expect(names).toHaveLength(3)
    })

    it("should return empty array for page without properties", () => {
      const page: PageObjectResponse = {
        object: "page",
        id: "page-id",
        created_time: "2023-01-01T00:00:00.000Z",
        last_edited_time: "2023-01-01T00:00:00.000Z",
        created_by: { object: "user", id: "user-id" },
        last_edited_by: { object: "user", id: "user-id" },
        cover: null,
        icon: null,
        parent: { type: "workspace", workspace: true },
        archived: false,
        in_trash: false,
        is_locked: false,
        properties: {},
        url: "https://notion.so/page-id",
        public_url: null,
      }

      expect(getPagePropertyNames(page)).toEqual([])
    })

    it("should handle partial page", () => {
      const partialPage = {
        object: "page" as const,
        id: "page-id",
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(getPagePropertyNames(partialPage as any)).toEqual([])
    })
  })

  describe("getPagePropertiesAsObject", () => {
    it("should convert all properties to object", () => {
      const page: PageObjectResponse = {
        object: "page",
        id: "page-id",
        created_time: "2023-01-01T00:00:00.000Z",
        last_edited_time: "2023-01-01T00:00:00.000Z",
        created_by: { object: "user", id: "user-id" },
        last_edited_by: { object: "user", id: "user-id" },
        cover: null,
        icon: null,
        parent: { type: "workspace", workspace: true },
        archived: false,
        in_trash: false,
        is_locked: false,
        properties: {
          Name: {
            id: "title",
            type: "title",
            title: [
              {
                type: "text",
                text: { content: "Test", link: null },
                plain_text: "Test",
                href: null,
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: "default",
                },
              },
            ],
          },
          Count: {
            id: "count",
            type: "number",
            number: 42,
          },
          Done: {
            id: "done",
            type: "checkbox",
            checkbox: true,
          },
        },
        url: "https://notion.so/page-id",
        public_url: null,
      }

      const props = getPagePropertiesAsObject(page)
      expect(props).toEqual({
        Name: "Test",
        Count: 42,
        Done: true,
      })
    })

    it("should return empty object for partial page", () => {
      const partialPage = {
        object: "page" as const,
        id: "page-id",
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(getPagePropertiesAsObject(partialPage as any)).toEqual({})
    })
  })
})
