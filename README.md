# Gdt.Sample.Client.React

Minimal React demo client for the `Gdt.Sample` Todo API.

## Features

- Shows API base URL and backend health status
- Lists todos from `GET /api/todos/`
- Creates todos with `POST /api/todos/`
- Toggles completion with `PUT /api/todos/{id}`
- Deletes todos with `DELETE /api/todos/{id}`

## Prerequisites

- Node.js 22+
- npm
- Running backend API from the sibling `Gdt.Sample` repository

## Install

```powershell
npm install
```

## Run in development

```powershell
npm run dev
```

Open:

- `http://localhost:5173`

## Backend expectations

By default the client calls:

- `http://localhost:5271/api/todos/`
- `http://localhost:5271/health`

You can override the API base URL with `VITE_API_BASE_URL`.

Example:

```powershell
$env:VITE_API_BASE_URL="http://localhost:5271"
npm run dev
```

## Build

```powershell
npm run build
```

## Lint

```powershell
npm run lint
```
