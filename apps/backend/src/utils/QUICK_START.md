# Email Name Generator - Quick Start

## 🚀 Quick Usage

```typescript
import { generateUniqueAgentEmail } from './utils/emailNameGenerator';

// Generate a unique email
const { email, name, hadCollision } = await generateUniqueAgentEmail();
console.log(email); // "sage@nanowork.ai" or "nova42@nanowork.ai"
```

## 📋 Common Use Cases

### 1. Creating a New Agent Profile
```typescript
const { email, name } = await generateUniqueAgentEmail();

await supabase.from('profiles').insert({
  id: userId,
  ai_email: email,
  name: name,
});
```

### 2. Suggesting Available Names
```typescript
import { getRandomAgentName } from './utils/emailNameGenerator';

const suggestions = Array.from(
  { length: 5 }, 
  () => getRandomAgentName()
);
// ["aria", "nova", "sage", "echo", "finn"]
```

### 3. API Endpoint
```typescript
router.post('/generate-email', async (req, res) => {
  const result = await generateUniqueAgentEmail();
  res.json(result);
});
```

## 📊 Name Pool Info

- **Total names**: 260+
- **Categories**: Nature, Tech, Human, Colors, Celestial, etc.
- **Length range**: 4-7 characters
- **All unique**: ✅ Yes

## 🔄 Collision Handling

```
1. Try: sage@nanowork.ai
   ✅ Available → Return

2. Try: sage42@nanowork.ai (random 2-digit)
   ✅ Available → Return

3. Retry up to 10 times

4. Fallback: user-abc12xyz@nanowork.ai
```

## 🧪 Test It

```bash
npx tsx src/utils/__tests__/emailNameGenerator.test.ts
```

## 📖 Full Documentation

See [EMAIL_NAME_GENERATOR.md](../../EMAIL_NAME_GENERATOR.md) for complete API reference and examples.
