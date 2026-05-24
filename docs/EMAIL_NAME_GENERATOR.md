# AI Agent Email Name Generator

A utility for generating unique, friendly, professional email addresses for AI agents.

## Overview

The email name generator provides a curated pool of 200+ human-sounding names that work well as AI agent identities. Names are short (4-7 characters), easy to spell, gender-neutral where possible, and convey a warm but professional tone.

## Features

- ✅ **200+ curated names** across multiple categories
- ✅ **Collision handling** with random 2-digit suffixes
- ✅ **Database uniqueness check** via Supabase
- ✅ **Fallback mechanism** using short UUIDs
- ✅ **TypeScript typed** with full IntelliSense support
- ✅ **Zero dependencies** (uses existing nanoid)

## Name Categories

### Nature-Inspired (70 names)
```
sage, echo, reef, clay, wren, iris, skye, vale, dawn, mist, 
star, moon, rain, wind, jade, amber, pearl, storm, frost...
```

### Tech/Modern (40 names)
```
nova, byte, sync, link, node, beam, flux, core, pulse, vibe,
spark, loop, arch, grid, edge, apex, prism, nexus, orbit...
```

### Human Names - Gender Neutral (60 names)
```
aria, finn, milo, luna, theo, zara, blake, eden, cruz, rome,
kai, alex, drew, ryan, noah, sam, quinn...
```

### Action/Quality Words (30 names)
```
bolt, rush, flow, rise, soar, calm, bold, wise, kind, joy,
hope, grace, trust, peace, brave...
```

### Colors (20 names)
```
blue, gold, cyan, teal, mint, plum, olive, indigo, mauve...
```

### Celestial/Mythic (25 names)
```
atlas, vega, lyra, ceres, mars, orion, sirius, nova...
```

### Gemstones (20 names)
```
flint, slate, agate, beryl, topaz, opal, garnet...
```

### Geography (15 names)
```
delta, dune, mesa, cape, gulf, inlet, sound...
```

## API Reference

### `generateUniqueAgentEmail()`

Generate a unique AI agent email address with collision handling.

**Returns:** `Promise<EmailGenerationResult>`

```typescript
interface EmailGenerationResult {
  email: string;        // Full email (e.g., "nova42@nanowork.ai")
  name: string;         // Name portion (e.g., "nova42")
  hadCollision: boolean; // True if base name was taken
}
```

**Algorithm:**
1. Pick random name from pool
2. Check if `{name}@nanowork.ai` exists in database
3. If taken, append 2-digit random number
4. Retry up to 10 times
5. Fallback to `user-{shortUUID}@nanowork.ai`

**Example:**
```typescript
import { generateUniqueAgentEmail } from './utils/emailNameGenerator';

const result = await generateUniqueAgentEmail();
console.log(result.email);  // "sage@nanowork.ai"
console.log(result.name);   // "sage"
console.log(result.hadCollision); // false

// If "sage" is taken:
// result.email = "sage42@nanowork.ai"
// result.name = "sage42"
// result.hadCollision = true
```

---

### `getRandomAgentName()`

Get a random name from the pool without checking uniqueness.

**Returns:** `string`

**Use cases:**
- Display names
- Testing
- Suggestions

**Example:**
```typescript
import { getRandomAgentName } from './utils/emailNameGenerator';

const name = getRandomAgentName();
console.log(name); // "echo"
```

---

### `getNamePool()`

Get the full array of available names.

**Returns:** `string[]`

**Example:**
```typescript
import { getNamePool } from './utils/emailNameGenerator';

const allNames = getNamePool();
console.log(allNames.length); // 260+
console.log(allNames.slice(0, 5)); // ["sage", "echo", "reef", "clay", "wren"]
```

---

### `getNamePoolStats()`

Get statistics about the name pool.

**Returns:** 
```typescript
{
  total: number;      // Total number of names
  avgLength: number;  // Average name length
  shortest: number;   // Shortest name length
  longest: number;    // Longest name length
  unique: boolean;    // Whether all names are unique
}
```

**Example:**
```typescript
import { getNamePoolStats } from './utils/emailNameGenerator';

const stats = getNamePoolStats();
console.log(stats);
// {
//   total: 260,
//   avgLength: 4.8,
//   shortest: 3,
//   longest: 7,
//   unique: true
// }
```

## Usage Examples

### Creating a New Agent Profile

```typescript
import { generateUniqueAgentEmail } from './utils/emailNameGenerator';
import { getSupabase } from './services/supabase';

async function createAgentProfile(userId: string) {
  const supabase = getSupabase();
  
  // Generate unique email
  const { email, name } = await generateUniqueAgentEmail();
  
  // Create profile
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      ai_email: email,
      name: name,
      email: null, // User's actual email goes here
    });
  
  if (error) {
    console.error('Failed to create profile:', error);
    return null;
  }
  
  console.log(`Created agent: ${email}`);
  return data;
}
```

---

### Suggesting Available Names

```typescript
import { getRandomAgentName, generateUniqueAgentEmail } from './utils/emailNameGenerator';

async function suggestAgentNames(count: number = 5) {
  const suggestions = [];
  
  for (let i = 0; i < count; i++) {
    const result = await generateUniqueAgentEmail();
    suggestions.push({
      email: result.email,
      name: result.name,
      available: !result.hadCollision,
    });
  }
  
  return suggestions;
}

// Usage:
const names = await suggestAgentNames(5);
console.log(names);
// [
//   { email: "aria@nanowork.ai", name: "aria", available: true },
//   { email: "nova42@nanowork.ai", name: "nova42", available: false },
//   ...
// ]
```

---

### API Endpoint for Name Generation

```typescript
import { Router } from 'express';
import { generateUniqueAgentEmail } from '../utils/emailNameGenerator';

const router = Router();

router.post('/agents/generate-email', async (req, res) => {
  try {
    const result = await generateUniqueAgentEmail();
    
    res.json({
      email: result.email,
      name: result.name,
      isOriginalName: !result.hadCollision,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate email',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;
```

---

### Frontend Integration

```typescript
// React hook for generating agent emails
import { useState } from 'react';

function useAgentEmailGenerator() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agents/generate-email', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEmail(data.email);
    } catch (error) {
      console.error('Failed to generate email:', error);
    } finally {
      setLoading(false);
    }
  };

  return { email, loading, generate };
}

// Component usage:
function CreateAgentForm() {
  const { email, loading, generate } = useAgentEmailGenerator();

  return (
    <div>
      <button onClick={generate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Agent Email'}
      </button>
      {email && <p>Your agent email: {email}</p>}
    </div>
  );
}
```

## Testing

Run the test suite:

```bash
npx tsx src/utils/__tests__/emailNameGenerator.test.ts
```

**Output:**
```
🧪 Testing Email Name Generator
============================================================

1️⃣  NAME POOL STATISTICS
------------------------------------------------------------
Total names: 260
Average length: 4.8 characters
Shortest: 3 characters
Longest: 7 characters
All unique: ✅ Yes

2️⃣  SAMPLE RANDOM NAMES (10)
------------------------------------------------------------
aria, nova, sage, echo, finn, jade, milo, luna, reef, clay

3️⃣  GENERATE UNIQUE EMAILS (5)
------------------------------------------------------------
1. sage@nanowork.ai
   Name: sage
   Had collision: ✅ No
2. nova42@nanowork.ai
   Name: nova42
   Had collision: ⚠️  Yes
...
```

## Design Principles

### Name Selection Criteria

1. **Length**: 4-7 characters
   - Easy to type and remember
   - Professional but friendly
   - Works well in UI elements

2. **Spelling**: Clear and unambiguous
   - No complex letter combinations
   - Phonetically intuitive
   - No homophones that could confuse

3. **Tone**: Warm but professional
   - Not overly cutesy or informal
   - Suitable for business contexts
   - Conveys competence and approachability

4. **Gender Neutrality**: Inclusive by default
   - Avoids strongly gendered associations
   - Appeals to diverse user base
   - Focuses on qualities over demographics

### Collision Handling Strategy

**Why 2-digit suffixes?**
- Short enough to maintain readability
- Large enough space (00-99) for most use cases
- Professional appearance (better than random strings)
- Easy to communicate verbally

**Why 10 retry attempts?**
- Balance between thoroughness and performance
- With 260 names × 100 suffix combinations = 26,000+ possible emails
- Extremely low collision probability even with 1000s of agents

**Why fallback to UUID?**
- Guaranteed uniqueness
- Still maintains professional format
- Rare edge case (only after exhausting named options)

## Performance

- **Average generation time**: ~50ms (includes DB check)
- **Name pool lookup**: O(1) constant time
- **Database queries**: 1 query per attempt (optimized with indexes)
- **Maximum latency**: ~500ms (10 attempts + fallback)

## Future Enhancements

- [ ] Support for custom domains (e.g., `sage@company.ai`)
- [ ] Name preferences by industry/vertical
- [ ] Multi-language name pools
- [ ] Pronunciation guides for names
- [ ] Agent name reservations
- [ ] Name analytics (most popular, trending)
- [ ] Custom name pool upload for enterprise

## License

Part of the Nanowork platform. Internal use only.
