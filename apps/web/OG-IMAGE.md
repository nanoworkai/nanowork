# OpenGraph Image

This directory contains the OpenGraph (social share) image for Nanowork.

## Files

- `public/og-image.html` - HTML template for the OG image (1200x630px)
- `public/og-image.png` - Generated PNG image used in social shares
- `generate-og-image.js` - Script to generate the PNG from the HTML template

## Usage

To regenerate the OpenGraph image after making changes to `og-image.html`:

```bash
npm run generate-og
```

Or directly:

```bash
node generate-og-image.js
```

## Meta Tags

The OpenGraph image is referenced in `index.html` with these meta tags:

- `og:image` - Main OG image URL
- `og:image:width` / `og:image:height` - Dimensions (1200x630)
- `og:image:alt` - Alt text for accessibility
- `twitter:image` - Twitter card image

## Design

The OG image follows Nanowork's Bloomberg terminal aesthetic:
- Dark background (#0c0d10)
- Monospace typography
- White text with subtle opacity variations
- Green accent for active status indicators
- All 7 departments displayed as badges

## Testing

To test how the image appears when shared:

1. **Twitter/X**: https://cards-dev.twitter.com/validator
2. **Facebook**: https://developers.facebook.com/tools/debug/
3. **LinkedIn**: https://www.linkedin.com/post-inspector/

Note: Social platforms cache images aggressively. After updating, you may need to:
- Add a cache-busting query parameter to the URL
- Wait 24-48 hours for cache expiration
- Use the platform's cache clearing tool
