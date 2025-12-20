# @taggr/cli

CLI tool for Taggr - Pull and manage your labels locally.

## Installation

```bash
npm install -g @taggr/cli
```

## Quick Start

1. **Get your token** from Taggr Tokens page

2. **Login** with your token:
   ```bash
   taggr login <your-token>
   ```

3. **Pull your labels**:
   ```bash
   # Pull a specific label
   taggr pull my-label

   # Pull all labels
   taggr pull --all
   ```

4. **Use in your code**:
   ```javascript
   import labels from './taggr/labels.json';
   
   console.log(labels.myLabel);
   ```

## Commands

| Command | Description |
|---------|-------------|
| `taggr login <token>` | Authenticate with your token |
| `taggr logout` | Remove saved credentials |
| `taggr whoami` | Show current authenticated user |
| `taggr list` | List all your labels |
| `taggr pull <name>` | Pull a specific label |
| `taggr pull --all` | Pull all labels |

## Options

### Login
```bash
taggr login <token> [options]

Options:
  -u, --url <url>  API URL (default: https://taggr-lab.vercel.app/api)
```

### Pull
```bash
taggr pull [name] [options]

Options:
  -a, --all  Pull all labels
```

## Generated Files

When you run `taggr pull`, files are created in a `./taggr` directory:

```
./taggr/
├── labels.json    # All your labels
└── labels.d.ts    # TypeScript definitions for autocomplete
```

### labels.json
```json
{
  "myLabel": "your-label-value",
  "anotherLabel": "another-value"
}
```

### labels.d.ts
```typescript
declare const labels: {
  myLabel: string;
  anotherLabel: string;
};

export default labels;
```

## Usage Examples

### Import and use labels
```javascript
import labels from './taggr/labels.json';

console.log(labels.myLabel);
console.log(labels.anotherLabel);
```

### TypeScript/JavaScript Support
The `labels.d.ts` file provides autocomplete in VS Code and other editors for both TypeScript and JavaScript projects.

## Configuration

The CLI stores your token in `~/.taggr/config.json`. This file is created when you run `taggr login`.

## License

MIT
