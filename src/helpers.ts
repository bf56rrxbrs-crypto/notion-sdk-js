import {
  BlockObjectResponse,
  CommentObjectResponse,
  DatabaseObjectResponse,
  DataSourceObjectResponse,
  EquationRichTextItemResponse,
  ListDataSourceTemplatesResponse,
  MentionRichTextItemResponse,
  PageObjectResponse,
  PartialBlockObjectResponse,
  PartialCommentObjectResponse,
  PartialDatabaseObjectResponse,
  PartialDataSourceObjectResponse,
  PartialPageObjectResponse,
  PartialUserObjectResponse,
  RichTextItemResponse,
  RichTextItemResponseCommon,
  TextRichTextItemResponse,
  UserObjectResponse,
} from "./api-endpoints"
import type Client from "./Client"

type PaginatedArgs = {
  start_cursor?: string
}

type PaginatedList<T> = {
  object: "list"
  results: T[]
  next_cursor: string | null
  has_more: boolean
}

/**
 * Returns an async iterator over the results of any paginated Notion API.
 *
 * Example (given a notion Client called `notion`):
 *
 * ```
 * for await (const block of iteratePaginatedAPI(notion.blocks.children.list, {
 *   block_id: parentBlockId,
 * })) {
 *   // Do something with block.
 * }
 * ```
 *
 * @param listFn A bound function on the Notion client that represents a conforming paginated
 *   API. Example: `notion.blocks.children.list`.
 * @param firstPageArgs Arguments that should be passed to the API on the first and subsequent
 *   calls to the API. Any necessary `next_cursor` will be automatically populated by
 *   this function. Example: `{ block_id: "<my block id>" }`
 */
export async function* iteratePaginatedAPI<Args extends PaginatedArgs, Item>(
  listFn: (args: Args) => Promise<PaginatedList<Item>>,
  firstPageArgs: Args
): AsyncIterableIterator<Item> {
  let nextCursor: string | null | undefined = firstPageArgs.start_cursor
  do {
    const response: PaginatedList<Item> = await listFn({
      ...firstPageArgs,
      start_cursor: nextCursor,
    })
    yield* response.results
    nextCursor = response.next_cursor
  } while (nextCursor)
}

/**
 * Collect all of the results of paginating an API into an in-memory array.
 *
 * Example (given a notion Client called `notion`):
 *
 * ```
 * const blocks = await collectPaginatedAPI(notion.blocks.children.list, {
 *   block_id: parentBlockId,
 * })
 * // Do something with blocks.
 * ```
 *
 * @param listFn A bound function on the Notion client that represents a conforming paginated
 *   API. Example: `notion.blocks.children.list`.
 * @param firstPageArgs Arguments that should be passed to the API on the first and subsequent
 *   calls to the API. Any necessary `next_cursor` will be automatically populated by
 *   this function. Example: `{ block_id: "<my block id>" }`
 */
export async function collectPaginatedAPI<Args extends PaginatedArgs, Item>(
  listFn: (args: Args) => Promise<PaginatedList<Item>>,
  firstPageArgs: Args
): Promise<Item[]> {
  const results: Item[] = []
  for await (const item of iteratePaginatedAPI(listFn, firstPageArgs)) {
    results.push(item)
  }
  return results
}

type DataSourceTemplate = ListDataSourceTemplatesResponse["templates"][number]

type ListDataSourceTemplatesArgs = PaginatedArgs & {
  data_source_id: string
  name?: string
  page_size?: number
}

/**
 * Returns an async iterator over data source templates.
 *
 * Example (given a notion Client called `notion`):
 *
 * ```
 * for await (const template of iterateDataSourceTemplates(notion, {
 *   data_source_id: dataSourceId,
 * })) {
 *   console.log(template.name, template.is_default)
 * }
 * ```
 *
 * @param client A Notion client instance.
 * @param args Arguments including the data_source_id and optional start_cursor.
 */
export async function* iterateDataSourceTemplates(
  client: Client,
  args: ListDataSourceTemplatesArgs
): AsyncIterableIterator<DataSourceTemplate> {
  let nextCursor: string | null | undefined = args.start_cursor
  do {
    const response: ListDataSourceTemplatesResponse =
      await client.dataSources.listTemplates({
        ...args,
        start_cursor: nextCursor,
      })
    yield* response.templates
    nextCursor = response.next_cursor
  } while (nextCursor)
}

/**
 * Collect all data source templates into an in-memory array.
 *
 * Example (given a notion Client called `notion`):
 *
 * ```
 * const templates = await collectDataSourceTemplates(notion, {
 *   data_source_id: dataSourceId,
 * })
 * // Do something with templates.
 * ```
 *
 * @param client A Notion client instance.
 * @param args Arguments including the data_source_id and optional start_cursor.
 */
export async function collectDataSourceTemplates(
  client: Client,
  args: ListDataSourceTemplatesArgs
): Promise<DataSourceTemplate[]> {
  const results: DataSourceTemplate[] = []
  for await (const template of iterateDataSourceTemplates(client, args)) {
    results.push(template)
  }
  return results
}

type ObjectResponse =
  | PageObjectResponse
  | PartialPageObjectResponse
  | DataSourceObjectResponse
  | PartialDataSourceObjectResponse
  | DatabaseObjectResponse
  | PartialDatabaseObjectResponse
  | BlockObjectResponse
  | PartialBlockObjectResponse

/**
 * @returns `true` if `response` is a full `BlockObjectResponse`.
 */
export function isFullBlock(
  response: ObjectResponse
): response is BlockObjectResponse {
  return response.object === "block" && "type" in response
}

/**
 * @returns `true` if `response` is a full `PageObjectResponse`.
 */
export function isFullPage(
  response: ObjectResponse
): response is PageObjectResponse {
  return response.object === "page" && "url" in response
}

/**
 * @returns `true` if `response` is a full `DataSourceObjectResponse`.
 */
export function isFullDataSource(
  response: ObjectResponse
): response is DataSourceObjectResponse {
  return response.object === "data_source"
}

/**
 * @returns `true` if `response` is a full `DatabaseObjectResponse`.
 */
export function isFullDatabase(
  response: ObjectResponse
): response is DatabaseObjectResponse {
  return response.object === "database"
}

/**
 * @returns `true` if `response` is a full `DataSourceObjectResponse` or a full
 * `PageObjectResponse`.
 *
 * Can be used on the results of the list response from `queryDataSource` or
 * `search` APIs.
 */
export function isFullPageOrDataSource(
  response: ObjectResponse
): response is DataSourceObjectResponse | PageObjectResponse {
  if (response.object === "data_source") {
    return isFullDataSource(response)
  } else {
    return isFullPage(response)
  }
}

/**
 * @returns `true` if `response` is a full `UserObjectResponse`.
 */
export function isFullUser(
  response: UserObjectResponse | PartialUserObjectResponse
): response is UserObjectResponse {
  return "type" in response
}

/**
 * @returns `true` if `response` is a full `CommentObjectResponse`.
 */
export function isFullComment(
  response: CommentObjectResponse | PartialCommentObjectResponse
): response is CommentObjectResponse {
  return "created_by" in response
}

/**
 * @returns `true` if `richText` is a `TextRichTextItemResponse`.
 */
export function isTextRichTextItemResponse(
  richText: RichTextItemResponse
): richText is RichTextItemResponseCommon & TextRichTextItemResponse {
  return richText.type === "text"
}

/**
 * @returns `true` if `richText` is an `EquationRichTextItemResponse`.
 */
export function isEquationRichTextItemResponse(
  richText: RichTextItemResponse
): richText is RichTextItemResponseCommon & EquationRichTextItemResponse {
  return richText.type === "equation"
}

/**
 * @returns `true` if `richText` is an `MentionRichTextItemResponse`.
 */
export function isMentionRichTextItemResponse(
  richText: RichTextItemResponse
): richText is RichTextItemResponseCommon & MentionRichTextItemResponse {
  return richText.type === "mention"
}

/**
 * Extracts a Notion ID from a Notion URL or returns the input if it's already a valid ID.
 *
 * Prioritizes path IDs over query parameters to avoid extracting view IDs instead of database IDs.
 *
 * @param urlOrId A Notion URL or ID string
 * @returns The extracted UUID in standard format (with hyphens) or null if invalid
 *
 * @example
 * ```typescript
 * // Database URL with view ID - extracts database ID, not view ID
 * extractNotionId('https://notion.so/workspace/DB-abc123def456789012345678901234ab?v=viewid123')
 * // Returns: 'abc123de-f456-7890-1234-5678901234ab' (database ID)
 *
 * // Already formatted UUID
 * extractNotionId('12345678-1234-1234-1234-123456789abc')
 * // Returns: '12345678-1234-1234-1234-123456789abc'
 * ```
 */
export function extractNotionId(urlOrId: string): string | null {
  if (!urlOrId || typeof urlOrId !== "string") {
    return null
  }

  const trimmed = urlOrId.trim()

  // Check if it's already a properly formatted UUID
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(trimmed)) {
    return trimmed.toLowerCase()
  }

  // Check if it's a compact UUID (32 chars, no hyphens)
  const compactUuidRegex = /^[0-9a-f]{32}$/i
  if (compactUuidRegex.test(trimmed)) {
    return formatUuid(trimmed)
  }

  // Extract from URL - prioritize path over query parameters
  // This prevents extracting view IDs when database IDs are in the path
  const pathMatch = trimmed.match(/\/[^/?#]*-([0-9a-f]{32})(?:[/?#]|$)/i)
  if (pathMatch && pathMatch[1]) {
    return formatUuid(pathMatch[1])
  }

  // Fallback to query parameters if no path ID found
  const queryMatch = trimmed.match(
    /[?&](?:p|page_id|database_id)=([0-9a-f]{32})/i
  )
  if (queryMatch && queryMatch[1]) {
    return formatUuid(queryMatch[1])
  }

  // Last resort: any 32-char hex string in the URL
  const anyMatch = trimmed.match(/([0-9a-f]{32})/i)
  if (anyMatch && anyMatch[1]) {
    return formatUuid(anyMatch[1])
  }

  return null
}

/**
 * Formats a 32-character hex string into a standard UUID format.
 * @param compactId 32-character hex string without hyphens
 * @returns UUID with hyphens in standard format
 */
function formatUuid(compactId: string): string {
  const clean = compactId.toLowerCase()
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(
    12,
    16
  )}-${clean.slice(16, 20)}-${clean.slice(20, 32)}`
}

/**
 * Extracts a database ID from a Notion database URL.
 * Convenience wrapper around `extractNotionId`.
 */
export function extractDatabaseId(databaseUrl: string): string | null {
  return extractNotionId(databaseUrl)
}

/**
 * Extracts a page ID from a Notion page URL.
 * Convenience wrapper around `extractNotionId`.
 */
export function extractPageId(pageUrl: string): string | null {
  return extractNotionId(pageUrl)
}

/**
 * Extracts a block ID from a Notion URL with a block fragment.
 * Looks for #block-<id> or #<id> patterns.
 */
export function extractBlockId(urlWithBlock: string): string | null {
  if (!urlWithBlock || typeof urlWithBlock !== "string") {
    return null
  }

  // Look for block fragment in URL (#block-32chars or just #32chars)
  const blockMatch = urlWithBlock.match(/#(?:block-)?([0-9a-f]{32})/i)
  if (blockMatch && blockMatch[1]) {
    return formatUuid(blockMatch[1])
  }

  return null
}

/**
 * Validates if a value is a valid Notion UUID format.
 *
 * @param id The value to validate as a Notion ID
 * @returns `true` if the value is a valid UUID format
 *
 * @example
 * ```typescript
 * isValidNotionId('12345678-1234-1234-1234-123456789abc') // true
 * isValidNotionId('abc123def456789012345678901234ab') // true (compact format)
 * isValidNotionId('invalid-id') // false
 * isValidNotionId(null) // false
 * isValidNotionId(undefined) // false
 * ```
 */
export function isValidNotionId(id: unknown): boolean {
  if (!id || typeof id !== "string") {
    return false
  }

  const trimmed = id.trim()

  // Check standard UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(trimmed)) {
    return true
  }

  // Check compact UUID format (32 chars, no hyphens)
  const compactUuidRegex = /^[0-9a-f]{32}$/i
  return compactUuidRegex.test(trimmed)
}

/**
 * Converts an array of rich text items to plain text.
 *
 * @param richText Array of rich text items from Notion API
 * @returns Plain text string with all formatting removed
 *
 * @example
 * ```typescript
 * const title = page.properties.Name.title
 * const plainText = richTextToPlainText(title)
 * console.log(plainText) // "Hello World"
 * ```
 */
export function richTextToPlainText(
  richText: RichTextItemResponse[] | undefined | null
): string {
  if (!richText || !Array.isArray(richText)) {
    return ""
  }

  return richText.map(item => item.plain_text || "").join("")
}

/**
 * Converts an array of rich text items to Markdown format.
 *
 * @param richText Array of rich text items from Notion API
 * @returns Markdown-formatted string
 *
 * @example
 * ```typescript
 * const content = block.paragraph.rich_text
 * const markdown = richTextToMarkdown(content)
 * console.log(markdown) // "**Bold** and *italic* text"
 * ```
 */
export function richTextToMarkdown(
  richText: RichTextItemResponse[] | undefined | null
): string {
  if (!richText || !Array.isArray(richText)) {
    return ""
  }

  return richText
    .map(item => {
      let text = item.plain_text || ""

      if (item.type === "equation") {
        return `$${text}$`
      } else if (item.type === "mention") {
        // Notion API always includes @ in plain_text for mentions
        return text
      }

      // Apply annotations in order: bold/italic/strikethrough/underline first, then code
      if (item.annotations) {
        if (item.annotations.bold) {
          text = `**${text}**`
        }
        if (item.annotations.italic) {
          text = `*${text}*`
        }
        if (item.annotations.strikethrough) {
          text = `~~${text}~~`
        }
        if (item.annotations.underline) {
          text = `<u>${text}</u>`
        }
        // Code formatting should be applied last to wrap everything
        if (item.annotations.code) {
          text = `\`${text}\``
        }
      }

      // Links should wrap the final formatted text
      if (item.type === "text" && item.text?.link) {
        text = `[${text}](${item.text.link.url})`
      }

      return text
    })
    .join("")
}

/**
 * Extracts the title (page name) from a page object.
 *
 * @param page A full page object from Notion API
 * @returns The page title as plain text, or empty string if not found
 *
 * @example
 * ```typescript
 * const page = await notion.pages.retrieve({ page_id: pageId })
 * const title = getPageTitle(page)
 * console.log(title) // "My Page Title"
 * ```
 */
export function getPageTitle(
  page: PageObjectResponse | PartialPageObjectResponse
): string {
  if (!isFullPage(page)) {
    return ""
  }

  for (const property of Object.values(page.properties)) {
    if (property.type === "title" && "title" in property) {
      return richTextToPlainText(property.title)
    }
  }

  return ""
}

/**
 * Safely extracts a property value from a page object by property name.
 *
 * Normalizes some common property types (e.g., `select` to its name,
 * `multi_select` to an array of names) and returns the underlying value
 * for others. The return type is `unknown | null`, so you may need to
 * inspect or narrow it yourself for non-normalized types.
 *
 * @param page A full page object from Notion API
 * @param propertyName The name of the property to extract
 * @returns The property value or null if not found
 *
 * @example
 * ```typescript
 * const page = await notion.pages.retrieve({ page_id: pageId })
 * const status = getPageProperty(page, "Status")
 * const tags = getPageProperty(page, "Tags")
 * ```
 */
export function getPageProperty(
  page: PageObjectResponse | PartialPageObjectResponse,
  propertyName: string
): unknown | null {
  if (!isFullPage(page) || !page.properties) {
    return null
  }

  const property = page.properties[propertyName]
  if (!property) {
    return null
  }

  switch (property.type) {
    case "title":
      return "title" in property ? richTextToPlainText(property.title) : null
    case "rich_text":
      return "rich_text" in property
        ? richTextToPlainText(property.rich_text)
        : null
    case "number":
      return "number" in property ? property.number : null
    case "select":
      return "select" in property ? property.select?.name : null
    case "multi_select":
      return "multi_select" in property
        ? property.multi_select.map(item => item.name)
        : null
    case "date":
      return "date" in property ? property.date : null
    case "people":
      return "people" in property ? property.people : null
    case "files":
      return "files" in property ? property.files : null
    case "checkbox":
      return "checkbox" in property ? property.checkbox : null
    case "url":
      return "url" in property ? property.url : null
    case "email":
      return "email" in property ? property.email : null
    case "phone_number":
      return "phone_number" in property ? property.phone_number : null
    case "formula":
      return "formula" in property ? property.formula : null
    case "relation":
      return "relation" in property ? property.relation : null
    case "rollup":
      return "rollup" in property ? property.rollup : null
    case "created_time":
      return "created_time" in property ? property.created_time : null
    case "created_by":
      return "created_by" in property ? property.created_by : null
    case "last_edited_time":
      return "last_edited_time" in property ? property.last_edited_time : null
    case "last_edited_by":
      return "last_edited_by" in property ? property.last_edited_by : null
    case "status":
      return "status" in property ? property.status?.name : null
    case "unique_id":
      return "unique_id" in property ? property.unique_id : null
    case "verification":
      return "verification" in property ? property.verification : null
    case "button":
      return "button" in property ? property.button : null
    default:
      return null
  }
}

/**
 * Extracts plain text content from a block, handling different block types.
 *
 * @param block A full block object from Notion API
 * @returns Plain text content of the block, or empty string if block has no text
 *
 * @example
 * ```typescript
 * const block = await notion.blocks.retrieve({ block_id: blockId })
 * const text = getBlockPlainText(block)
 * console.log(text) // "This is the block content"
 * ```
 */
export function getBlockPlainText(
  block: BlockObjectResponse | PartialBlockObjectResponse
): string {
  if (!isFullBlock(block)) {
    return ""
  }

  const type = block.type

  switch (type) {
    case "paragraph":
      return "paragraph" in block
        ? richTextToPlainText(block.paragraph.rich_text)
        : ""
    case "heading_1":
      return "heading_1" in block
        ? richTextToPlainText(block.heading_1.rich_text)
        : ""
    case "heading_2":
      return "heading_2" in block
        ? richTextToPlainText(block.heading_2.rich_text)
        : ""
    case "heading_3":
      return "heading_3" in block
        ? richTextToPlainText(block.heading_3.rich_text)
        : ""
    case "bulleted_list_item":
      return "bulleted_list_item" in block
        ? richTextToPlainText(block.bulleted_list_item.rich_text)
        : ""
    case "numbered_list_item":
      return "numbered_list_item" in block
        ? richTextToPlainText(block.numbered_list_item.rich_text)
        : ""
    case "toggle":
      return "toggle" in block
        ? richTextToPlainText(block.toggle.rich_text)
        : ""
    case "to_do":
      return "to_do" in block ? richTextToPlainText(block.to_do.rich_text) : ""
    case "quote":
      return "quote" in block ? richTextToPlainText(block.quote.rich_text) : ""
    case "callout":
      return "callout" in block
        ? richTextToPlainText(block.callout.rich_text)
        : ""
    case "code":
      return "code" in block ? richTextToPlainText(block.code.rich_text) : ""
    default:
      return ""
  }
}

/**
 * Gets all property names from a page.
 *
 * @param page A full page object from Notion API
 * @returns Array of property names
 *
 * @example
 * ```typescript
 * const page = await notion.pages.retrieve({ page_id: pageId })
 * const propertyNames = getPagePropertyNames(page)
 * console.log(propertyNames) // ["Name", "Status", "Tags", "Created"]
 * ```
 */
export function getPagePropertyNames(
  page: PageObjectResponse | PartialPageObjectResponse
): string[] {
  if (!isFullPage(page) || !page.properties) {
    return []
  }

  return Object.keys(page.properties)
}

/**
 * Creates a plain object with all page properties as key-value pairs.
 * Useful for logging, debugging, or converting to JSON.
 *
 * @param page A full page object from Notion API
 * @returns Object with property names as keys and values extracted
 *
 * @example
 * ```typescript
 * const page = await notion.pages.retrieve({ page_id: pageId })
 * const props = getPagePropertiesAsObject(page)
 * console.log(props)
 * // { Name: "My Page", Status: "Active", Count: 42, Done: true }
 * ```
 */
export function getPagePropertiesAsObject(
  page: PageObjectResponse | PartialPageObjectResponse
): Record<string, unknown> {
  if (!isFullPage(page) || !page.properties) {
    return {}
  }

  const result: Record<string, unknown> = {}
  for (const propertyName of Object.keys(page.properties)) {
    result[propertyName] = getPageProperty(page, propertyName)
  }

  return result
}
