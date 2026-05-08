# Saazvat Field Service - Logo Usage Guide

## Logo Files

### Icon Versions (512x512px)
- `logo-icon.svg` - Full color gradient version (primary app icon)
- `logo-icon-flat.svg` - Flat color version (simplified)
- `logo-icon-mono.svg` - Monochrome version (for light backgrounds)

### Full Logo
- `logo-full.svg` - Horizontal layout with text

## Color Specifications

### Primary Brand Colors
```css
--brand-sky-blue: #0ea5e9
--brand-sky-blue-dark: #0284c7
--brand-amber: #f59e0b
--brand-amber-dark: #d97706
```

### Supporting Colors
```css
--brand-slate: #1e293b
--brand-slate-light: #334155
--brand-white: #ffffff
```

## Typography

**Primary Font**: Inter (Bold 700 for logo text)
**Tagline Font**: Inter (Medium 500, uppercase, wide tracking)

## Usage Guidelines

### ✅ DO
- Use the gradient version for the primary app icon
- Maintain minimum clear space (20% of logo height on all sides)
- Use the flat version for small sizes (< 64px)
- Use monochrome version on colored backgrounds
- Scale proportionally (maintain aspect ratio)

### ❌ DON'T
- Don't rotate or skew the logo
- Don't change the colors
- Don't add effects (shadows, outlines, etc.)
- Don't place on busy backgrounds
- Don't stretch or distort

## Minimum Sizes
- App Icon: 512x512px (original)
- Favicon: 32x32px (use flat version)
- Splash Screen: 1024x1024px
- Social Media: 400x400px

## Background Requirements

### Light Backgrounds
- Use full color gradient version
- Ensure sufficient contrast

### Dark Backgrounds
- Use full color gradient version
- The white pin provides contrast

### Colored Backgrounds
- Use monochrome version
- Ensure WCAG AA contrast (4.5:1 minimum)

## File Formats

### For Web/App
- **SVG** (preferred) - Scalable, small file size
- **PNG** - For compatibility (export at 2x resolution)

### For Print
- **SVG** or **PDF** - Vector formats
- **PNG** - Minimum 300 DPI

## Android App Icon Specifications

### Required Sizes
- `mipmap-mdpi`: 48x48px
- `mipmap-hdpi`: 72x72px
- `mipmap-xhdpi`: 96x96px
- `mipmap-xxhdpi`: 144x144px
- `mipmap-xxxhdpi`: 192x192px
- Adaptive Icon: 108x108dp (foreground + background)

### Adaptive Icon Layers
- **Foreground**: Logo icon (wrench + pin)
- **Background**: Solid gradient or color

## iOS App Icon Specifications

### Required Sizes
- iPhone: 180x180px (@3x), 120x120px (@2x)
- iPad: 167x167px (@2x), 152x152px (@2x)
- App Store: 1024x1024px

## Integration Examples

### Angular Component
```typescript
// In your component
<img src="assets/logo-icon.svg" alt="Saazvat Field Service" width="48" height="48">
```

### Favicon
```html
<!-- In index.html -->
<link rel="icon" type="image/svg+xml" href="assets/logo-icon-flat.svg">
```

### Splash Screen
```html
<!-- In index.html -->
<meta name="theme-color" content="#0ea5e9">
```

## Brand Voice

**Tagline Options**:
- "Field Service Made Simple"
- "Your Mobile Workforce Solution"
- "Service Management On The Go"

## Contact

For logo modifications or questions, refer to the design system documentation.

---

**Version**: 1.0
**Last Updated**: May 2026
**Designer**: Claude + Visual Design Foundations
