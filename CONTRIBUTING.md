# Contributing to Notion SDK for JavaScript

Thank you for your interest in contributing to the Notion SDK! This guide will help you understand how to contribute effectively.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Auto Review System](#auto-review-system)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Security Guidelines](#security-guidelines)

## Getting Started

### What Can You Contribute?

We welcome contributions in the following areas:

✅ **Documentation improvements** - README updates, code examples, clarifications  
✅ **Bug fixes** - Fixes for SDK functionality issues  
✅ **Test improvements** - Additional test coverage or test quality enhancements  
✅ **Examples** - New examples demonstrating SDK usage  
✅ **Tooling improvements** - Build scripts, CI/CD enhancements

⚠️ **Please note**: Most client code in `src/api-endpoints.ts` is generated programmatically from the Notion API specification. Direct changes to generated files will be overwritten. For API-related features, please open an issue first to discuss.

### Before You Start

1. **Check existing issues**: Look for similar issues or feature requests
2. **Open an issue**: For significant changes, discuss your proposal first
3. **Fork the repository**: Create your own fork to work on
4. **Read this guide**: Understand our development workflow and requirements

## Development Setup

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Git

### Setup Steps

1. **Fork and clone the repository**:

   ```bash
   git clone https://github.com/YOUR_USERNAME/notion-sdk-js.git
   cd notion-sdk-js
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Build the project**:

   ```bash
   npm run build
   ```

4. **Run tests**:

   ```bash
   npm test
   ```

5. **Verify linting**:
   ```bash
   npm run lint
   ```

## Making Changes

### Branch Naming

Use descriptive branch names:

- `fix/issue-description` - for bug fixes
- `feature/feature-name` - for new features
- `docs/what-changed` - for documentation
- `test/what-tested` - for test improvements

### Development Workflow

1. **Create a new branch**:

   ```bash
   git checkout -b fix/my-bug-fix
   ```

2. **Make your changes**:

   - Write clean, readable code
   - Follow existing patterns and conventions
   - Add tests for new functionality

3. **Test your changes**:

   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "fix: descriptive commit message"
   ```

### Commit Message Guidelines

Follow conventional commit format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test additions or modifications
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes

Example:

```
fix: handle empty response in pagination helper

- Added null check for response data
- Added test case for empty responses
- Updated documentation
```

## Submitting a Pull Request

### PR Checklist

Before submitting, ensure:

- [ ] Code builds successfully (`npm run build`)
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] New tests added for new functionality
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventional format
- [ ] PR description explains the changes clearly

### Creating the PR

1. **Push your branch**:

   ```bash
   git push origin fix/my-bug-fix
   ```

2. **Create Pull Request on GitHub**:

   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

3. **PR Description Should Include**:
   - **What**: What problem does this solve?
   - **Why**: Why is this change necessary?
   - **How**: How does this change address the problem?
   - **Testing**: How was this tested?
   - **Screenshots**: If UI changes (if applicable)

### Example PR Description

```markdown
## Description

Fixes pagination issue when API returns empty result sets.

## Problem

The `collectPaginatedAPI` helper throws an error when the API returns
an empty array, causing applications to crash unnecessarily.

## Solution

Added null/undefined checks before accessing response data. The helper
now gracefully handles empty responses and returns an empty array.

## Testing

- [x] Added unit test for empty response scenario
- [x] Tested manually with live API
- [x] All existing tests pass

## Related Issues

Fixes #123
```

## Auto Review System

Every pull request automatically triggers our Auto Review system, which checks:

### 1. Code Style & Formatting

- **Prettier**: Code formatting consistency
- **ESLint**: Code quality and TypeScript rules
- **cspell**: Spelling in code and comments

**Fix locally**:

```bash
npm run prettier  # Auto-format code
npm run lint      # Check for issues
```

### 2. Security Analysis

- **npm audit**: Dependency vulnerabilities
- **Dependabot**: Automated dependency updates
- **CodeQL**: Advanced security scanning

### 3. Build & Test

- Builds on Node.js 18.x, 20.x, 22.x
- All tests must pass
- Coverage reports generated

### 4. Code Quality

- Complexity analysis
- Pattern detection
- Best practice checks

### Understanding Auto Review Feedback

When Auto Review runs:

1. **✅ All checks passed**: Your PR is ready for human review
2. **❌ Checks failed**: Review the detailed feedback and fix issues
3. **⚠️ Warnings**: Consider addressing, but not blocking

**Viewing Results**:

- Check the PR comment from the Auto Review bot
- View detailed logs in the GitHub Actions tab
- Download report artifacts for in-depth analysis

For more details, see [Auto Review Documentation](docs/AUTO_REVIEW.md).

## Code Style Guidelines

### TypeScript

- **Use strict typing**: Avoid `any` types when possible
- **Prefer interfaces**: For object shapes
- **Use type guards**: From `src/type-utils.ts`
- **No `as` casts**: Unless absolutely necessary

### Formatting

- **No semicolons**: Enforced by Prettier
- **Arrow parens**: avoid when possible
- **Trailing commas**: ES5 style
- **Line endings**: LF (Unix style)

### Comments

- **Explain "why", not "what"**: Code should be self-documenting
- **Keep comments concise**: Max 80 characters per line
- **Update comments**: When changing code
- **Remove commented code**: Don't commit dead code

### Best Practices

```typescript
// ✅ Good
function isValidUser(user: User): boolean {
  return user.id !== undefined && user.name !== ""
}

// ❌ Avoid
function isValidUser(user: any) {
  return user.id && user.name // Implicit boolean coercion
}
```

## Testing Guidelines

### Test Structure

- **Location**: All tests in `test/` directory
- **Naming**: `*.test.ts` files
- **Framework**: Jest with ts-jest

### Writing Tests

```typescript
describe("Feature Name", () => {
  it("should handle expected case", () => {
    // Arrange
    const input = createTestData()

    // Act
    const result = functionUnderTest(input)

    // Assert
    expect(result).toEqual(expectedOutput)
  })

  it("should handle edge cases", () => {
    // Test edge cases, errors, boundaries
  })
})
```

### Test Coverage

- **Aim for 70%+ coverage**: Especially for new code
- **Test edge cases**: Null, undefined, empty arrays
- **Test error conditions**: What happens when things fail?
- **Test public APIs**: Focus on exported functions

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx jest test/helpers.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Security Guidelines

### Dependency Security

- **Review Dependabot PRs**: Don't ignore security updates
- **Check npm audit**: Before committing dependencies
- **Update regularly**: Keep dependencies current
- **Avoid unnecessary deps**: Smaller dependency tree = fewer vulnerabilities

### Code Security

- **Validate inputs**: Never trust user input
- **Avoid eval**: No dynamic code execution
- **Sanitize outputs**: Prevent injection attacks
- **Use environment variables**: For sensitive configuration
- **Never commit secrets**: Use .gitignore

### Security Checklist

- [ ] No hardcoded credentials or API keys
- [ ] Input validation for all external data
- [ ] Proper error handling (no sensitive data in errors)
- [ ] Dependencies are up-to-date
- [ ] No use of deprecated/vulnerable packages

## Review Process

### What to Expect

1. **Auto Review**: Runs immediately on PR creation
2. **Maintainer Review**: May take a few days
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, maintainers will merge

### Responding to Feedback

- **Be responsive**: Reply to comments promptly
- **Ask questions**: If feedback is unclear
- **Make changes**: Push new commits to your branch
- **Be patient**: Maintainers are volunteers

### Getting Help

If you're stuck or have questions:

1. **Comment on your PR**: Ask for clarification
2. **Open a discussion**: For broader questions
3. **Check documentation**: README, CLAUDE.md, AUTO_REVIEW.md
4. **Email support**: developers@makenotion.com for API questions

## Code of Conduct

### Our Standards

- **Be respectful**: Treat everyone with respect
- **Be constructive**: Provide helpful feedback
- **Be patient**: We're all learning
- **Be inclusive**: Welcome diverse perspectives

### Unacceptable Behavior

- Harassment or discriminatory comments
- Trolling or insulting remarks
- Spam or promotional content
- Publishing private information

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

- **General questions**: Open a discussion
- **Bug reports**: Open an issue
- **Security issues**: Email developers@makenotion.com
- **API questions**: Email developers@makenotion.com

---

Thank you for contributing to Notion SDK for JavaScript! 🎉
