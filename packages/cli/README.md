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
| `taggr sync` | Force sync all labels (alias for pull --all) |
| `taggr check` | Check if labels are up-to-date |
| `taggr check --strict` | Fail build if labels are outdated (for CI/CD) |
| `taggr watch` | Watch for label changes and auto-sync |
| `taggr status` | Show sync status and label versions |

## Options

### Login
```bash
taggr login <token> [options]

Options:
  -u, --url <url>  API URL (default: https://taggr.onrender.com/api)
```

### Pull
```bash
taggr pull [name] [options]

Options:
  -a, --all  Pull all labels
```

### Check
```bash
taggr check [options]

Options:
  --strict   Fail if labels are outdated (for CI/CD)
  --fix      Show fix instructions
```

### Watch
```bash
taggr watch [options]

Options:
  -i, --interval <seconds>  Poll interval in seconds (default: 30)
```

### Status
```bash
taggr status

Shows:
  - Last sync time
  - API URL
  - Label count
  - Individual label versions
  - File status
```

## Generated Files

When you run `taggr pull`, files are created in a `./taggr` directory:

```
./taggr/
├── labels.json    # All your labels
├── labels.d.ts    # TypeScript definitions for autocomplete
└── .taggr.json    # Metadata file (version tracking, sync status)
```

> **Note:** The `.taggr.json` file is automatically managed by the CLI. It tracks which version of each label you're using and when labels were last synced. This enables features like version checking and integrity verification.

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

## Advanced Features

### Version Tracking

The CLI automatically tracks which version of each label you're using. This ensures your team stays in sync and prevents outdated labels in production.

When you run `taggr pull`, the CLI:
- Saves version information for each label
- Tracks when labels were last synced
- Stores checksums for integrity verification

### Build-Time Validation

Use `taggr check --strict` in your CI/CD pipeline to fail builds if labels are outdated. This prevents deploying stale labels to production.

**Example CI/CD Integration:**
```yaml
# .github/workflows/taggr-check.yml
- name: Check labels are up-to-date
  run: |
    taggr login $TAGGR_API_KEY
    taggr check --strict
```

### Auto-Sync Mode

Run `taggr watch` to automatically sync labels when they change in the cloud. Perfect for development!

```bash
taggr watch
# Or with custom interval
taggr watch --interval 60
```

The watch mode will:
- Poll the API for changes every N seconds
- Automatically pull updated labels
- Show notifications when labels change

### Integrity Protection

The CLI detects manual edits to `labels.json` and warns you before overwriting. This prevents accidental loss of local changes.

### Check Sync Status

Use `taggr status` to see:
- When labels were last synced
- Which version of each label you're using
- Whether files exist and are up-to-date

```bash
taggr status
```

## Configuration

The CLI stores your token in `~/.taggr/config.json`. This file is created when you run `taggr login`.

## Tips

- Add `./taggr` to your `.gitignore` if you don't want to commit generated files
- The `.taggr.json` metadata file is automatically managed - don't edit it manually
- Use `taggr check --strict` in CI/CD to ensure labels are always up-to-date
- Run `taggr watch` during development for automatic label syncing

## License

MIT
