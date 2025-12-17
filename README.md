# Bobrossify

A full-stack web application for exploring and managing famous paintings from art history. Browse masterpieces from artists like Leonardo da Vinci, Vincent van Gogh, Salvador Dali, and more.

## Tech Stack

- **Frontend**: React 19, React Router 7, TypeScript, Tailwind CSS 4, Vite
- **Backend**: .NET 10, ASP.NET Core Minimal APIs, Entity Framework Core
- **Database**: PostgreSQL
- **Orchestration**: .NET Aspire
- **Observability**: OpenTelemetry (distributed tracing)
- **Testing**: Vitest, Playwright

## Project Structure

```
bobrossify/
├── frontend/           # React frontend application
├── webapi/             # .NET Web API backend
├── ServiceDefaults/    # Shared .NET Aspire configuration
├── apphost.cs          # Aspire orchestration entry point
└── bobrossify.slnx     # Solution file
```

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v20+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Getting Started

### Run Full Stack (Recommended)

The easiest way to run the entire application with all dependencies:

```powershell
dotnet apphost.cs
```

This uses .NET Aspire to orchestrate:
- Frontend dev server
- Backend API
- PostgreSQL database
- DbGate (database management UI)

### Run Frontend Only

```powershell
cd frontend
npm install
npm run dev
```

### Run Backend Only

```powershell
cd webapi
dotnet run
```

### Creating a Different Frontend

If you need to replace the frontend with a different framework or configuration, you can scaffold a new one using Vite:

```powershell
# Remove the existing frontend
# or manually delete the `frontend` folder
Remove-Item -Recurse -Force frontend

# Create a new frontend with Vite (follow the prompts to choose your framework)
npm create vite@latest frontend
```

This will prompt you to select a framework (React, Vue, Svelte, etc.) and variant (TypeScript, JavaScript, etc.). After creation, the Aspire orchestration will automatically pick up the new frontend.

## Development Commands

| Command | Location | Description |
|---------|----------|-------------|
| `dotnet apphost.cs` | root | Run full stack with Aspire |
| `npm run dev` | frontend/ | Start frontend dev server |
| `npm run build` | frontend/ | Build frontend for production |
| `npm run typecheck` | frontend/ | Run TypeScript type checking |
| `npm run test` | frontend/ | Run unit tests |
| `npm run test:e2e` | frontend/ | Run Playwright E2E tests |
| `dotnet build` | root | Build backend |
| `dotnet run` | webapi/ | Run backend API |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/paintings` | Get all paintings |
| GET | `/api/paintings/{id}` | Get painting by ID |
| POST | `/api/paintings` | Create a new painting |
| PUT | `/api/paintings/{id}` | Update a painting |
| DELETE | `/api/paintings/{id}` | Delete a painting |

API documentation is available at `/scalar/v1` when running the backend.

## Frontend Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/paintings` | Gallery of famous paintings |
| `/about` | About page |
| `/features` | Features section |

## Observability

The application includes end-to-end distributed tracing with OpenTelemetry:

- **Frontend**: Browser instrumentation for document load, fetch requests, and user interactions
- **Backend**: .NET instrumentation for HTTP requests, EF Core database calls, and custom spans

When running with Aspire (`dotnet apphost.cs`), traces are automatically collected and viewable in the Aspire dashboard.

## Azure Deployment

Deploy to Azure Container Apps using Aspire:

```powershell
aspire deploy
```

This creates:
- **Container Apps Environment** with frontend and API containers
- **Azure PostgreSQL Flexible Server** (PaaS) with Entra ID authentication
- **Azure Application Insights** for production telemetry
- **Managed Identity** for secure database access (no passwords)

### Application Insights (Production Telemetry)

When deployed to Azure, the application automatically sends telemetry to Azure Application Insights:

- **Browser**: Page views, user interactions, fetch requests, exceptions
- **Frontend Node.js**: SSR traces, HTTP requests, server-side errors
- **API**: HTTP requests, database queries, custom spans, exceptions

The Aspire Dashboard is also available in production for real-time debugging.

To view telemetry in Azure Portal:
1. Navigate to your resource group
2. Open the Application Insights resource
3. Use **Transaction search**, **Performance**, or **Failures** to explore traces

### Connecting to Azure PostgreSQL from Your Machine

The Azure PostgreSQL database is firewalled off from the public internet by default. To connect from your local machine:

#### 1. Get Your PostgreSQL Server Name

```powershell
az postgres flexible-server list --resource-group <your-resource-group> --query "[].name" -o tsv
```

#### 2. Add a Firewall Rule for Your IP

```powershell
# Get your public IP
(Invoke-RestMethod ifconfig.me)

# Add firewall rule
az postgres flexible-server firewall-rule create --resource-group <your-resource-group> --name <your-postgres-server-name> --rule-name AllowMyIP --start-ip-address <your-ip> --end-ip-address <your-ip>
```

#### 3. Get an Entra ID Access Token

The database uses Entra ID (Azure AD) authentication instead of passwords. Get a token:

```powershell
az account get-access-token --resource-type oss-rdbms --query accessToken -o tsv
```

#### 4. Connect with psql

```powershell
psql "host=<server-name>.postgres.database.azure.com port=5432 dbname=db user=<your-azure-email> sslmode=require"
# When prompted for password, paste the access token from step 3
```

#### 5. Remove the Firewall Rule When Done

```powershell
# List firewall rules
az postgres flexible-server firewall-rule list --resource-group <your-resource-group> --name <your-postgres-server-name> --output table

# Delete the rule
az postgres flexible-server firewall-rule delete --resource-group <your-resource-group> --name <your-postgres-server-name> --rule-name AllowMyIP
```

> **Note**: The deployed Container Apps access the database via Azure's internal networking (VNet integration), not through the public firewall.
