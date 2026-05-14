import { getSupabase } from '../services/supabase';
import { customAlphabet } from 'nanoid';

// Generate short random numbers (2 digits)
const randomNumber = customAlphabet('0123456789', 2);

// Generate short UUID for fallback
const shortId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

/**
 * Curated pool of 200+ friendly, professional, human-sounding names
 * Criteria: 4-7 characters, easy to spell, gender neutral, warm but professional
 */
const NAME_POOL = [
  // Nature-inspired (70)
  'sage', 'echo', 'reef', 'clay', 'wren', 'iris', 'skye', 'vale', 'dawn', 'dusk',
  'mist', 'star', 'moon', 'rain', 'wind', 'tide', 'cove', 'moss', 'leaf', 'fern',
  'pine', 'jade', 'onyx', 'pearl', 'coral', 'amber', 'ruby', 'rose', 'storm', 'frost',
  'snow', 'hail', 'cloud', 'bloom', 'grove', 'brook', 'creek', 'ridge', 'peak', 'bay',
  'shore', 'beach', 'river', 'stone', 'ash', 'elm', 'dale', 'glen', 'lake', 'pond',
  'pool', 'hawk', 'crow', 'wolf', 'bear', 'dove', 'swan', 'lark', 'seal', 'otter',
  'lynx', 'puma', 'colt', 'fawn', 'roan', 'basil', 'thyme', 'clove', 'rowan', 'hazel',

  // Tech/Modern (40)
  'nova', 'byte', 'sync', 'link', 'node', 'beam', 'flux', 'core', 'mesh', 'pulse',
  'vibe', 'glide', 'drift', 'surge', 'spark', 'loop', 'arch', 'grid', 'edge', 'apex',
  'prism', 'nexus', 'orbit', 'pixel', 'data', 'zoom', 'dash', 'echo', 'codec', 'cache',
  'frame', 'layer', 'trace', 'route', 'phase', 'scope', 'index', 'query', 'parse', 'stack',

  // Human names - gender neutral (60)
  'aria', 'finn', 'milo', 'luna', 'theo', 'zara', 'blake', 'eden', 'cruz', 'rome',
  'ace', 'max', 'rex', 'leo', 'kai', 'zoe', 'eli', 'ava', 'eva', 'sam',
  'ben', 'alex', 'drew', 'kyle', 'ryan', 'owen', 'noah', 'liam', 'jack', 'luke',
  'cole', 'sean', 'dean', 'gray', 'jude', 'dane', 'wade', 'lane', 'cade', 'seth',
  'joel', 'mark', 'paul', 'kent', 'beau', 'tate', 'jace', 'page', 'gage', 'reed',
  'west', 'ford', 'bell', 'york', 'penn', 'lynn', 'faye', 'june', 'kris', 'quinn',

  // Action/Quality words (30)
  'bolt', 'rush', 'flow', 'rise', 'soar', 'dive', 'trek', 'roam', 'keen', 'swift',
  'calm', 'bold', 'true', 'wise', 'kind', 'joy', 'hope', 'faith', 'grace', 'trust',
  'peace', 'brave', 'merit', 'valor', 'honor', 'pride', 'zeal', 'mirth', 'bliss', 'charm',

  // Colors (20)
  'blue', 'gold', 'noir', 'cyan', 'teal', 'mint', 'plum', 'olive', 'ochre', 'umber',
  'sienna', 'sepia', 'indigo', 'mauve', 'taupe', 'khaki', 'drab', 'puce', 'beige', 'ecru',

  // Celestial/Mythic (25)
  'atlas', 'vega', 'lyra', 'ceres', 'juno', 'mars', 'gaia', 'sol', 'orion', 'aries',
  'libra', 'virgo', 'gemini', 'leo', 'hydra', 'draco', 'auriga', 'castor', 'pollux', 'rigel',
  'deneb', 'spica', 'altair', 'antares', 'sirius',

  // Gemstones/Minerals (20)
  'flint', 'slate', 'shale', 'agate', 'beryl', 'topaz', 'opal', 'citrine', 'azurite', 'jade',
  'garnet', 'peridot', 'zircon', 'iolite', 'kunzite', 'epidote', 'diopside', 'benitoite', 'phenakite', 'axinite',

  // Geography (15)
  'delta', 'beta', 'dune', 'mesa', 'cliff', 'crag', 'gulf', 'inlet', 'sound', 'cape',
  'bluff', 'knoll', 'glade', 'heath', 'moor',
];

/**
 * Result of email generation
 */
export interface EmailGenerationResult {
  email: string;
  name: string;
  hadCollision: boolean;
}

/**
 * Check if an email already exists in the profiles table
 */
async function emailExists(email: string): Promise<boolean> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('profiles')
    .select('ai_email')
    .eq('ai_email', email)
    .maybeSingle();

  if (error) {
    console.error('Error checking email existence:', error);
    return false; // Assume doesn't exist on error
  }

  return !!data;
}

/**
 * Generate a unique AI agent email address
 *
 * Algorithm:
 * 1. Pick a random name from the pool
 * 2. Check if {name}@nanowork.ai exists
 * 3. If taken, append 2-digit random number (e.g. nova42@nanowork.ai)
 * 4. Retry up to 10 times
 * 5. Fallback to user-{shortUUID}@nanowork.ai
 *
 * @returns Object with email, name, and collision flag
 */
export async function generateUniqueAgentEmail(): Promise<EmailGenerationResult> {
  const domain = 'nanowork.ai';
  const maxAttempts = 10;

  // Pick a random name from the pool
  const randomName = NAME_POOL[Math.floor(Math.random() * NAME_POOL.length)];

  // Try the base name first
  let candidateEmail = `${randomName}@${domain}`;
  let exists = await emailExists(candidateEmail);

  if (!exists) {
    return {
      email: candidateEmail,
      name: randomName,
      hadCollision: false,
    };
  }

  // If base name is taken, try with random numbers
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const suffix = randomNumber();
    candidateEmail = `${randomName}${suffix}@${domain}`;
    exists = await emailExists(candidateEmail);

    if (!exists) {
      return {
        email: candidateEmail,
        name: `${randomName}${suffix}`,
        hadCollision: true,
      };
    }
  }

  // Fallback: use short UUID
  const fallbackId = shortId();
  candidateEmail = `user-${fallbackId}@${domain}`;

  // Final check (should be virtually impossible to collide)
  exists = await emailExists(candidateEmail);
  if (exists) {
    // Last resort: add timestamp
    const timestamp = Date.now().toString(36);
    candidateEmail = `user-${timestamp}@${domain}`;
  }

  return {
    email: candidateEmail,
    name: `user-${fallbackId}`,
    hadCollision: true,
  };
}

/**
 * Get a random name from the pool (without checking uniqueness)
 * Useful for display names, testing, etc.
 */
export function getRandomAgentName(): string {
  return NAME_POOL[Math.floor(Math.random() * NAME_POOL.length)];
}

/**
 * Get the full name pool (for testing or admin purposes)
 */
export function getNamePool(): string[] {
  return [...NAME_POOL];
}

/**
 * Get statistics about the name pool
 */
export function getNamePoolStats() {
  return {
    total: NAME_POOL.length,
    avgLength: NAME_POOL.reduce((sum, name) => sum + name.length, 0) / NAME_POOL.length,
    shortest: Math.min(...NAME_POOL.map(n => n.length)),
    longest: Math.max(...NAME_POOL.map(n => n.length)),
    unique: new Set(NAME_POOL).size === NAME_POOL.length,
  };
}
