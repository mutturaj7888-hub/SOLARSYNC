# Contributing to SolarSync

Thank you for contributing to SolarSync! We adhere to a structured, reproducible development workflow.

## 📌 Development Workflow

1. **Branching Strategy**:
   - `main`: Production-ready, stable codebase.
   - `develop`: Integration branch for active phase development.
   - `feature/<feature-name>`: Specific module or feature work.
   - `fix/<bug-name>`: Bug fixes and security patches.

2. **Commit Conventions**:
   Follow conventional commits:
   - `feat:` New feature implementation
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `test:` Unit, integration, or e2e tests
   - `refactor:` Code restructuring without behavior changes
   - `ci:` CI/CD pipeline modifications

3. **Code Quality Standards**:
   - **Backend**: Adhere to PEP 8, type hints with Pydantic/SQLAlchemy, and write unit tests for endpoints.
   - **Frontend**: Clean component architecture, accessible UI elements, and semantic markup.
   - **Security**: Never commit secrets, API keys, or database credentials.

4. **Testing before submission**:
   Run all tests before opening a pull request:
   ```bash
   # Backend
   cd backend && pytest

   # Frontend
   cd frontend && npm run build
   ```
