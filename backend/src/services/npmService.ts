import { ILabel } from '../models/Label.model.js';
import logger from '../utils/logger.js';
import config from '../config/environment.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import * as os from 'os';

const exec = promisify(execCallback);

export class NpmService {
  /**
   * Generate package.json content for a label
   */
  generatePackageJson(label: ILabel, userId: string) {
    return {
      name: label.packageName,
      version: label.version,
      description: `${label.displayName} - ${label.description}`,
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      files: ['dist', 'README.md'],
      author: {
        name: userId,
        url: `https://taggr.dev/${userId}`,
      },
      homepage: `https://taggr.dev/labels/${label._id}`,
      repository: {
        type: 'git',
        url: `https://github.com/taggr/${label.name}`,
      },
      keywords: ['label', 'taggr', ...label.tags],
      license: 'MIT',
      publishConfig: {
        access: label.isPrivate ? 'private' : 'public',
      },
    };
  }

  /**
   * Generate index.js content for a label
   */
  generateIndexJs(label: ILabel) {
    return `export default {
  value: "${label.value.replace(/"/g, '\\"')}",
  metadata: {
    name: "${label.name}",
    displayName: "${label.displayName}",
    description: "${label.description}",
    category: "${label.category}",
    tags: ${JSON.stringify(label.tags)},
    version: "${label.version}"
  }
};
`;
  }

  /**
   * Generate index.d.ts content for a label
   */
  generateIndexDts(label: ILabel) {
    const interfaceName = label.name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    return `export interface ${interfaceName}Label {
  value: string;
  metadata: {
    name: string;
    displayName: string;
    description: string;
    category: string;
    tags: string[];
    version: string;
  };
}

declare const label: ${interfaceName}Label;
export default label;
`;
  }

  /**
   * Generate README.md content for a label
   */
  generateReadme(label: ILabel, userId: string) {
    return `# ${label.displayName}

${label.description}

## Installation

\`\`\`bash
npm install ${label.packageName}
\`\`\`

## Usage

\`\`\`javascript
import label from '${label.packageName}';

console.log(label.value); // "${label.value}"
\`\`\`

## Label Information

- **Name**: ${label.name}
- **Category**: ${label.category}
- **Version**: ${label.version}
- **Tags**: ${label.tags.join(', ')}

## Version History

${label.versions
  .slice()
  .reverse()
  .map((v) => `### ${v.version}\n- ${v.changelog}\n- Released: ${v.publishedAt.toLocaleDateString()}`)
  .join('\n\n')}

## License

MIT

---

Generated with [Taggr](https://taggr.dev) - Create Once, Use Everywhere
`;
  }

  /**
   * Create temporary package directory with all required files
   */
  private async createTempPackageDirectory(label: ILabel, userId: string): Promise<string> {
    const tempDir = path.join(os.tmpdir(), `taggr-${label._id}-${Date.now()}`);

    // Create directory structure
    await fs.ensureDir(path.join(tempDir, 'dist'));

    // Write package.json
    await fs.writeJSON(
      path.join(tempDir, 'package.json'),
      this.generatePackageJson(label, userId),
      { spaces: 2 }
    );

    // Write dist/index.js
    await fs.writeFile(
      path.join(tempDir, 'dist', 'index.js'),
      this.generateIndexJs(label)
    );

    // Write dist/index.d.ts
    await fs.writeFile(
      path.join(tempDir, 'dist', 'index.d.ts'),
      this.generateIndexDts(label)
    );

    // Write README.md
    await fs.writeFile(
      path.join(tempDir, 'README.md'),
      this.generateReadme(label, userId)
    );

    return tempDir;
  }

  /**
   * Execute npm publish command
   */
  private async executeNpmPublish(packageDir: string): Promise<void> {
    const registry = process.env.NPM_REGISTRY_URL || 'http://localhost:4873';

    try {
      // Run npm publish with registry configuration
      const { stdout, stderr } = await exec('npm publish', {
        cwd: packageDir,
        env: {
          ...process.env,
          NPM_CONFIG_REGISTRY: registry,
        },
      });

      if (stderr && !stderr.includes('npm notice')) {
        logger.warn('npm publish stderr:', stderr);
      }

      logger.info('npm publish stdout:', stdout);
    } catch (error: any) {
      logger.error('npm publish error:', error);
      throw new Error(`NPM publish failed: ${error.message}`);
    }
  }

  /**
   * Publish a label to npm registry (Verdaccio or npmjs.org)
   */
  async publishToNpm(label: ILabel, userId: string): Promise<{ success: boolean; packageId?: string; error?: string }> {
    let tempDir: string | null = null;

    try {
      logger.info(`Publishing ${label.packageName}@${label.version} to npm`);

      // 1. Create temp directory with package files
      tempDir = await this.createTempPackageDirectory(label, userId);
      logger.info(`Created temp package directory: ${tempDir}`);

      // 2. Run npm publish
      await this.executeNpmPublish(tempDir);

      // 3. Generate package ID
      const packageId = `npm-${label._id}-${Date.now()}`;

      logger.info(`Successfully published ${label.packageName}@${label.version}`);

      return {
        success: true,
        packageId,
      };
    } catch (error: any) {
      logger.error('Failed to publish to npm:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred during npm publish',
      };
    } finally {
      // 4. Clean up temp directory
      if (tempDir) {
        try {
          await fs.remove(tempDir);
          logger.info(`Cleaned up temp directory: ${tempDir}`);
        } catch (cleanupError) {
          logger.warn('Failed to clean up temp directory:', cleanupError);
        }
      }
    }
  }

  /**
   * Get package info from npm registry
   */
  async getPackageInfo(packageName: string) {
    try {
      // In production, fetch from npm registry API
      // const response = await fetch(`${config.npm.registry}/${packageName}`);
      // return response.json();

      return {
        name: packageName,
        version: '1.0.0',
        description: 'Package info from npm registry',
      };
    } catch (error) {
      logger.error('Failed to fetch package info:', error);
      return null;
    }
  }

  /**
   * Generate complete package structure
   */
  generatePackageStructure(label: ILabel, userId: string) {
    return {
      'package.json': this.generatePackageJson(label, userId),
      'dist/index.js': this.generateIndexJs(label),
      'dist/index.d.ts': this.generateIndexDts(label),
      'README.md': this.generateReadme(label, userId),
    };
  }
}

export default new NpmService();
