import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import type { TaggrConfig } from '../types.js';

const CONFIG_DIR = path.join(os.homedir(), '.taggr');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Default to production API URL, fallback to localhost for development
const DEFAULT_API_URL = process.env.TAGGR_API_URL || 'https://taggr.onrender.com/api';

/**
 * Ensure config directory exists
 */
async function ensureConfigDir(): Promise<void> {
  await fs.ensureDir(CONFIG_DIR);
}

/**
 * Get the current configuration
 */
export async function getConfig(): Promise<TaggrConfig | null> {
  try {
    await ensureConfigDir();
    
    if (await fs.pathExists(CONFIG_FILE)) {
      const config = await fs.readJson(CONFIG_FILE);
      
      // Validate config structure
      if (config && typeof config === 'object' && !Array.isArray(config)) {
        return {
          apiKey: config.apiKey || '',
          apiUrl: config.apiUrl || DEFAULT_API_URL,
        };
      } else {
        // Config file is corrupted (not an object)
        console.warn(`Warning: Config file at ${CONFIG_FILE} is corrupted. Please login again.`);
        return null;
      }
    }
    
    return null;
  } catch (error) {
    // If JSON parsing fails, config is corrupted
    console.warn(`Warning: Could not read config file at ${CONFIG_FILE}. Please login again.`);
    return null;
  }
}

/**
 * Save configuration
 */
export async function saveConfig(config: Partial<TaggrConfig>): Promise<void> {
  await ensureConfigDir();
  
  const existingConfig = await getConfig() || { apiKey: '', apiUrl: DEFAULT_API_URL };
  const newConfig = { ...existingConfig, ...config };
  
  await fs.writeJson(CONFIG_FILE, newConfig, { spaces: 2 });
}

/**
 * Delete configuration (logout)
 */
export async function deleteConfig(): Promise<void> {
  if (await fs.pathExists(CONFIG_FILE)) {
    await fs.remove(CONFIG_FILE);
  }
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(): Promise<boolean> {
  const config = await getConfig();
  return config !== null && !!config.apiKey;
}

/**
 * Get API key or throw if not logged in
 */
export async function requireAuth(): Promise<TaggrConfig> {
  const config = await getConfig();
  
  if (!config || !config.apiKey) {
    throw new Error('Not logged in. Run "taggr login <API_KEY>" first.');
  }
  
  return config;
}

