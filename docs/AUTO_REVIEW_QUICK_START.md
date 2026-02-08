# Auto Review Quick Reference

## For Contributors

### Before Creating a PR

```bash
# 1. Run linting locally
npm run lint

# 2. Auto-fix formatting issues
npm run prettier

# 3. Build the project
npm run build

# 4. Run tests
npm test
```

### Understanding Auto Review Results

| Status     | Meaning               | Action Required              |
| ---------- | --------------------- | ---------------------------- |
| ✅ Passed  | All checks successful | Request human review         |
| ❌ Failed  | Blocking issues found | Fix issues and push changes  |
| ⚠️ Warning | Non-blocking issues   | Consider fixing before merge |

## Common Issues and Fixes

### Code Style Failures

**Issue**: Prettier or ESLint errors

**Fix**:

```bash
npm run prettier  # Auto-format code
npm run lint      # Check for remaining issues
```

### Security Vulnerabilities

**Issue**: Critical or high-severity CVEs

**Fix**:

```bash
npm audit fix           # Auto-fix vulnerabilities
npm audit fix --force   # For breaking changes (careful!)
```

### Test Failures

**Issue**: Tests failing or coverage too low

**Fix**:

- Fix failing tests
- Add tests for new code
- Ensure coverage >= 70%

### Build Failures

**Issue**: TypeScript compilation errors

**Fix**:

- Check TypeScript errors
- Ensure types are correct
- Run `npm run build` locally

## Workflow Jobs

### 1. code-style (Blocking)

- Prettier formatting
- ESLint linting
- Spell checking

### 2. security-analysis (Blocking on Critical)

- npm audit
- Dependency scanning
- Critical vulnerabilities fail PR

### 3. build-and-test (Blocking)

- Multi-version builds
- Test suite execution
- Coverage reporting

### 4. code-quality (Advisory)

- Complexity analysis
- Pattern detection
- Best practice checks

### 5. review-summary (Always runs)

- Aggregates all results
- Posts PR comment
- Shows overall status

### 6. suggest-improvements (Advisory)

- Improvement suggestions
- Optimization ideas
- Documentation tips

## Accessing Reports

### View Summary

- Check PR comments for automated summary
- Status badges show at-a-glance results

### Download Detailed Reports

1. Go to Actions tab
2. Find your workflow run
3. Scroll to Artifacts section
4. Download reports:
   - code-style-reports
   - security-reports
   - coverage-report
   - quality-reports

## Overriding Checks

### ESLint

```typescript
// eslint-disable-next-line rule-name
const special = doSomethingSpecial()
```

### Prettier

```typescript
// prettier-ignore
const matrix = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
]
```

### cspell

```typescript
// cspell:disable-next-line
const apiEndpoint = "notion-xyz-endpoint"
```

## Quality Thresholds

| Check         | Threshold           | Type     |
| ------------- | ------------------- | -------- |
| Linting       | 0 errors            | Blocking |
| Formatting    | All files formatted | Blocking |
| Critical CVEs | 0 vulnerabilities   | Blocking |
| High CVEs     | 0 recommended       | Warning  |
| Test Coverage | 70% minimum         | Warning  |
| Build         | Must succeed        | Blocking |

## Debugging Tips

### Workflow Not Running

- Ensure PR is not draft
- Check Actions are enabled
- Verify branch protection rules

### False Positives

- Review specific error message
- Check if known tool limitation
- Use inline overrides if justified

### Performance

- Workflow takes 5-10 minutes
- Parallel jobs for speed
- Large PRs may take longer

## Getting Help

- **Documentation**: [AUTO_REVIEW.md](AUTO_REVIEW.md)
- **Contributing Guide**: [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Issues**: Open an issue with "auto-review" label
- **Questions**: Comment on your PR

## Configuration Files

- `.github/workflows/auto-review.yml` - Main workflow
- `.github/dependabot.yml` - Dependency updates
- `.eslintrc.js` - Linting rules
- `.prettierrc` - Formatting rules
- `.cspell.json` - Spell checking dictionary

---

**Need more help?** See [Full Documentation](AUTO_REVIEW.md)
