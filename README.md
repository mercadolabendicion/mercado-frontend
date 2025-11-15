# Facturacion

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.1.

## 🧪 E2E Testing with Playwright

This project includes a comprehensive E2E testing suite built with Playwright and Python. The tests are located in the `scrapper/` directory.

### Quick Start

```bash
# Navigate to the scrapper directory
cd scrapper

# Install dependencies
pip install -r requirements.txt
playwright install

# Configure environment
cp .env.example .env  # Edit with your credentials

# Run all tests
python run_tests.py

# Run specific tests
python run_tests.py cliente    # Client tests
python run_tests.py producto   # Product tests
python run_tests.py venta      # Sales tests
```

### Documentation

- [Scrapper README](scrapper/README.md) - Complete usage guide
- [Architecture Guide](scrapper/ARCHITECTURE.md) - Design and best practices
- [Implementation Summary](scrapper/SUMMARY.md) - What's included

### Features

- ✅ 10 independent E2E tests
- ✅ 36+ reusable action functions
- ✅ Modular architecture (Core → Actions → Tests)
- ✅ Complete CRUD flows for Clients and Products
- ✅ Integrated Sales flow
- ✅ Master test runner script

---

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
