# Contributing to Nanowork

Thank you for your interest in contributing to Nanowork! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 18+ (see `.nvmrc` for specific version)
- Bun (for the web app)
- npm 10.8.2+

### Setting Up Your Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/nanowork-web.git
   cd nanowork-web
   ```

3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/nanowork/nanowork-web.git
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```

6. Configure your local environment variables in `.env`

## Development Workflow

### Running the Project

- **Start all services**: `npm run dev`
- **Web app only**: `npm run dev:web`
- **Worker only**: `npm run dev:worker`
- **Backend only**: `npm run dev:backend`

### Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   
   Use descriptive branch names:
   - `feature/` for new features
   - `fix/` for bug fixes
   - `docs/` for documentation
   - `refactor/` for code refactoring
   - `test/` for test additions/changes

2. Make your changes, following the coding standards below

3. Test your changes thoroughly:
   ```bash
   npm run validate  # Runs typecheck and lint
   ```

4. Commit your changes using conventional commits (see below)

### Coding Standards

- **TypeScript**: Use TypeScript for all new code
- **Formatting**: Code is automatically formatted on commit via pre-commit hooks
- **Linting**: All code must pass linting checks (`npm run lint`)
- **Type Safety**: All code must pass type checking (`npm run typecheck`)

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add OAuth2 authentication

fix(worker): resolve memory leak in queue processor

docs(readme): update installation instructions
```

## Submitting a Pull Request

### Before Submitting

1. Ensure your code follows the project's coding standards
2. Run the validation suite:
   ```bash
   npm run validate
   ```
3. Update tests if you've added new functionality
4. Update documentation if you've changed APIs or behavior
5. Rebase your branch on the latest `main`:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### PR Submission Guidelines

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a pull request against the `main` branch

3. Fill out the PR template with:
   - **Title**: Clear, concise description (follows conventional commit format)
   - **Description**: What changes were made and why
   - **Type of Change**: Feature, bug fix, documentation, etc.
   - **Testing**: How you tested the changes
   - **Screenshots**: If applicable (for UI changes)
   - **Breaking Changes**: Note any breaking changes
   - **Related Issues**: Link to related issues using `Closes #123` or `Fixes #123`

4. Ensure all CI checks pass

5. Request review from maintainers

### PR Review Process

- Maintainers will review your PR and may request changes
- Address feedback by pushing additional commits to your branch
- Once approved, a maintainer will merge your PR
- Your contribution will be credited in the project

### PR Best Practices

- **Keep PRs focused**: One feature or fix per PR
- **Keep PRs small**: Smaller PRs are easier to review and merge
- **Write clear descriptions**: Help reviewers understand your changes
- **Respond to feedback**: Engage constructively with reviewers
- **Be patient**: Maintainers review PRs as time permits

## Monorepo Structure

This project uses a monorepo structure with Turbo:

```
nanowork-web/
├── apps/
│   ├── web/        # SvelteKit web application
│   ├── worker/     # Cloudflare Worker
│   └── backend/    # Backend API
└── packages/       # Shared packages
```

When making changes:
- Changes to `apps/web` require testing the web app
- Changes to `apps/worker` require testing the worker
- Changes to shared packages may affect multiple apps

## Reporting Issues

- Use GitHub Issues to report bugs or suggest features
- Search existing issues before creating a new one
- Include reproduction steps for bugs
- Provide context and use cases for feature requests

## Questions?

- Open a GitHub Discussion for general questions
- Review existing documentation in the repository
- Check closed issues and PRs for similar questions

## License

By contributing to Nanowork, you agree that your contributions will be licensed under the Apache License 2.0.

Thank you for contributing to Nanowork!
