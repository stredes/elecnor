# NP migration checklist

Use this checklist before implementing any NP in `elecnor-next`.

## 1. Legacy analysis

- Identify the source repository, branch, commit, and working-tree status.
- Map affected dashboard routes, API routes, backend modules, data stores, and tests.
- Record public contracts, dependencies, security risks, and behavior that is not understood.
- Separate reusable business behavior from framework, persistence, and legacy debt.

## 2. Target projection

- Map dashboard behavior to `pages/` and `src/dashboard/`.
- Map HTTP contracts to `pages/api/` and boundary mappers.
- Map business rules to `src/backend/domain/` and use cases to `application/`.
- Define ports before implementing outbound adapters.
- Wire adapters only in `src/backend/composition/`.

## 3. TDD and delivery

- Add the NP story, task, risks, and AC-to-test links in `.hc/`.
- Capture RED against the observable contract before production behavior.
- Implement the smallest authorized GREEN change, then REFACTOR.
- Run unit, contract, integration, E2E, lint, typecheck, build, and Brain gates required by risk.
- Record decisions, owners, evidence, rollback, and legacy limitations without inventing approval.

The legacy project remains a source of evidence, not a dependency of the new app.
