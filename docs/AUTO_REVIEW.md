# Auto Review Feature

## Overview

The Auto Review feature provides automated code review capabilities for pull requests in the notion-sdk-js repository. It integrates multiple static analysis tools, security scanners, and quality checks to ensure code quality and maintainability.

## Features

### 1. Code Style and Formatting
- **Prettier**: Checks code formatting consistency
- **ESLint**: Enforces code quality rules and TypeScript best practices
- **cspell**: Validates spelling in code and comments

### 2. Security Analysis
- **npm audit**: Scans for known vulnerabilities in dependencies
- **Dependabot**: Automated dependency updates and security patches
- **CodeQL**: Advanced security vulnerability detection
- **Semgrep**: Pattern-based security analysis (existing integration)

### 3. Build and Test
- Multi-version Node.js testing (18.x, 20.x, 22.x)
- Automated test execution with coverage reporting
- Build verification across all supported Node versions
- Coverage thresholds enforcement (70% minimum recommended)

### 4. Code Quality Analysis
- Code complexity metrics
- Pattern detection for common issues
- Large file detection (files >500 lines)
- TypeScript strict mode verification
- Detection of:
  - Console.log statements in production code
  - Overuse of `any` types
  - TODO/FIXME comments

### 5. Automated Reporting
- Comprehensive PR comment with review summary
- Detailed reports as workflow artifacts
- Status badges for each check
- Overall approval/rejection status

### 6. Improvement Suggestions
- Automated suggestions for code improvements
- Performance optimization recommendations
- Security best practices reminders
- Documentation enhancement tips

## Workflow Triggers

The Auto Review workflow runs on:
- New pull requests
- Pull request updates (synchronize)
- Pull request reopening
- When PR is marked as ready for review

It does **not** run on draft pull requests.

## Quality Gates

### Blocking Conditions (PR cannot be merged if these fail):
1. **Code Style Failures**: Prettier, ESLint, or cspell errors
2. **Critical Security Vulnerabilities**: Any critical-severity CVEs in dependencies
3. **Build Failures**: Project fails to build on any supported Node.js version
4. **Test Failures**: Any test suite failures

### Warning Conditions (advised to fix but not blocking):
1. **High-Severity Vulnerabilities**: High-severity CVEs (should be fixed)
2. **Low Test Coverage**: Coverage below 70%
3. **Code Quality Issues**: Large files, overuse of `any`, etc.

## Using the Auto Review Feature

### For Contributors

1. **Create a Pull Request**: The Auto Review workflow will automatically trigger
2. **Review Automated Feedback**: Check the PR comments for the review summary
3. **Address Issues**: Fix any failing checks
4. **Re-run Checks**: Push new commits to trigger a re-review
5. **Manual Review**: Once automated checks pass, request human review

### For Maintainers

1. **Review Summary**: Check the automated review comment on each PR
2. **Detailed Reports**: Download workflow artifacts for in-depth analysis
3. **Override When Necessary**: Some warnings may be acceptable in context
4. **Configure Thresholds**: Adjust quality gates in the workflow file as needed

## Configuration

### Quality Thresholds

You can adjust quality thresholds by modifying `.github/workflows/auto-review.yml`:

```yaml
# Example: Change coverage threshold
if (( $(echo "$COVERAGE < 80" | bc -l) )); then
  echo "::warning::Code coverage ($COVERAGE%) is below 80% threshold"
fi
```

### Security Scanning

Configure Dependabot in `.github/dependabot.yml`:
- Update frequency
- Dependency grouping
- Reviewers
- Labels

### Static Analysis

Adjust linting rules:
- **ESLint**: `.eslintrc.js`
- **Prettier**: `.prettierrc`
- **cspell**: `.cspell.json`

## Workflow Jobs

### 1. code-style
- Runs Prettier, ESLint, and cspell
- Generates report artifacts
- Blocks merge if formatting/linting fails

### 2. security-analysis
- Runs npm audit
- Checks for critical and high-severity vulnerabilities
- Generates security report
- Blocks merge on critical vulnerabilities

### 3. build-and-test
- Tests on Node.js 18.x, 20.x, 22.x
- Runs full test suite with coverage
- Checks coverage thresholds
- Blocks merge on test failures

### 4. code-quality
- Analyzes code complexity
- Detects problematic patterns
- Generates quality reports
- Provides recommendations (non-blocking)

### 5. review-summary
- Aggregates results from all jobs
- Posts comprehensive comment on PR
- Updates existing comments
- Provides overall pass/fail status

### 6. suggest-improvements
- Analyzes code for improvement opportunities
- Posts suggestions as PR comment
- Non-blocking, advisory only

## Report Artifacts

Each workflow run generates downloadable artifacts:

1. **code-style-reports**: Prettier, ESLint, and cspell reports
2. **security-reports**: npm audit JSON report
3. **coverage-report**: Test coverage data
4. **quality-reports**: Complexity and pattern analysis

## Best Practices

### For Contributors

1. **Run Checks Locally**: Use `npm run lint` before pushing
2. **Fix Style Issues**: Run `npm run prettier` to auto-fix formatting
3. **Review Security Alerts**: Take security vulnerabilities seriously
4. **Maintain Test Coverage**: Add tests for new functionality
5. **Keep Files Focused**: Refactor large files (>500 lines)

### For Code Quality

1. **Avoid `any` Types**: Use proper TypeScript types
2. **Remove Debug Code**: Clean up console.log statements
3. **Complete TODOs**: Address or document TODO/FIXME comments
4. **Document Complex Logic**: Add comments for non-obvious code
5. **Keep Dependencies Updated**: Review and merge Dependabot PRs

### For Security

1. **Update Dependencies Regularly**: Don't ignore Dependabot PRs
2. **Review Security Advisories**: Check npm audit output
3. **Validate Inputs**: Always validate user-provided data
4. **Use Environment Variables**: Never commit secrets
5. **Follow OWASP Guidelines**: Apply security best practices

## Troubleshooting

### Auto Review Not Running
- Ensure PR is not marked as draft
- Check workflow permissions in repository settings
- Verify GitHub Actions are enabled

### False Positives
- Review the specific error message
- Check if it's a known issue in the tool
- Override with inline comments if necessary (e.g., `// eslint-disable-next-line`)

### Performance Issues
- Workflow takes ~5-10 minutes typically
- Parallel jobs speed up execution
- Large PRs may take longer

### Security Alert Overload
- Group related vulnerabilities
- Prioritize critical and high-severity issues
- Use Dependabot to automate fixes

## Integration with Other Tools

### Existing CI/CD
- Auto Review runs alongside existing CI workflow
- Does not replace manual code review
- Complements human judgment with automation

### Semgrep Integration
- Existing Semgrep workflow continues to run
- Provides additional security pattern detection
- Results available in Security tab

### Branch Protection
Consider enabling these branch protection rules:
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Require review from code owners
- Include administrators in restrictions

## Continuous Improvement

The Auto Review feature is designed to evolve:

1. **Add New Checks**: Extend workflow with additional tools
2. **Adjust Thresholds**: Fine-tune quality gates based on team needs
3. **Custom Rules**: Add project-specific linting rules
4. **Performance Optimization**: Optimize workflow execution time
5. **Better Reporting**: Enhance summary format and detail level

## Support and Feedback

- **Issues**: Report problems via GitHub Issues
- **Enhancements**: Suggest improvements via pull requests
- **Questions**: Refer to this documentation first
- **Configuration Help**: See inline comments in workflow files

## Related Documentation

- [Contributing Guidelines](CONTRIBUTING.md) - if available
- [CI/CD Documentation](.github/workflows/ci.yml)
- [ESLint Configuration](.eslintrc.js)
- [Prettier Configuration](.prettierrc)
- [TypeScript Configuration](tsconfig.json)

## License

This Auto Review feature is part of the notion-sdk-js project and follows the same MIT License.

---

**Last Updated**: 2026-02-08  
**Version**: 1.0.0
