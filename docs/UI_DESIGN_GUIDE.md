# UI/UX Quick Reference Guide

**Visual Design Language:** Dark Glassmorphism with Neon Accents

---

## 🎨 Color Palette Quick Reference

### Primary Colors
```
Background Dark:    #0f172a  ███████
Background Medium:  #1e293b  ███████
Background Light:   #334155  ███████

Text Primary:       #f1f5f9  ███████
Text Secondary:     #94a3b8  ███████
Text Tertiary:      #64748b  ███████
```

### Accent Colors
```
Primary (Sky):      #0ea5e9  ███████  (Neon glow)
Secondary (Amber):  #f59e0b  ███████  (Neon glow)
Tertiary (Purple):  #8b5cf6  ███████  (Neon glow)

Success (Green):    #10b981  ███████
Warning (Yellow):   #f59e0b  ███████
Error (Red):        #ef4444  ███████
Info (Blue):        #3b82f6  ███████
```

---

## 🎭 Component States

### Button States
```
Default:    Glass background, border, normal text
Hover:      Lifted (-2px to -4px), enhanced shadow, glow
Active:     Pressed (scale 0.95), reduced shadow
Disabled:   50% opacity, no pointer, muted colors
Focus:      2px outline, accent color, 2px offset
```

### Card States
```
Default:    Glass panel, subtle shadow
Hover:      Lift + scale (1.02), enhanced shadow, glow overlay
Active:     Slight press, reduced lift
Loading:    Shimmer animation, skeleton state
```

### Input States
```
Default:    Glass background, light border
Focus:      Accent border, 3px glow ring, lighter background
Error:      Red border, red glow ring
Disabled:   Muted background, no interaction
```

---

## 📐 Spacing System

```
xs:   4px   ▪
sm:   8px   ▪▪
md:   16px  ▪▪▪▪
lg:   24px  ▪▪▪▪▪▪
xl:   32px  ▪▪▪▪▪▪▪▪
2xl:  48px  ▪▪▪▪▪▪▪▪▪▪▪▪
```

**Usage:**
- Card padding: lg (24px)
- Section gaps: lg-xl (24-32px)
- Element gaps: sm-md (8-16px)
- Icon gaps: xs-sm (4-8px)

---

## 🔤 Typography Scale

```
Page Title:     1.75rem (28px)  Bold 700
Section Title:  1.5rem  (24px)  Bold 700
Card Title:     1.25rem (20px)  SemiBold 600
Body Large:     1.1rem  (18px)  Medium 500
Body:           1rem    (16px)  Regular 400
Body Small:     0.95rem (15px)  Regular 400
Caption:        0.85rem (14px)  Medium 500
Label:          0.8rem  (13px)  Bold 600
Tiny:           0.75rem (12px)  Bold 600
```

---

## 🎬 Animation Timing

### Transition Speeds
```
Fast:    150ms  - Micro-interactions (hover, active)
Base:    300ms  - Standard transitions (color, size)
Slow:    500ms  - Complex animations (entrance, exit)
Bounce:  500ms  - Playful animations (pop, bounce)
```

### Easing Functions
```
cubic-bezier(0.4, 0, 0.2, 1)      - Standard ease
cubic-bezier(0.68, -0.55, 0.265, 1.55) - Bounce
```

### Animation Durations
```
Pulse:           2s infinite
Neon Pulse:      2s infinite
Background:      15s infinite
Spin (loader):   1s infinite
Shimmer:         2s infinite
```

---

## 🎯 Interactive Elements

### Hover Effects
```css
/* Lift */
transform: translateY(-2px) to translateY(-4px)

/* Scale */
transform: scale(1.02) to scale(1.1)

/* Glow */
box-shadow: 0 0 20px rgba(accent, 0.3)

/* Shine */
Linear gradient sweep across element
```

### Click/Active Effects
```css
/* Press */
transform: scale(0.95)

/* Ripple */
Expanding circle from click point

/* Bounce */
Scale 1 → 1.2 → 1 (keyframe)
```

---

## 🏷️ Status Indicators

### Work Order Status
```
OPEN:         Purple (#8b5cf6) + pulsing dot
IN_PROGRESS:  Amber  (#f59e0b) + pulsing dot
COMPLETED:    Green  (#10b981) + pulsing dot
```

### Network Status
```
ONLINE:   Green dot + pulse animation + glow
OFFLINE:  Gray dot + no animation
```

### Sync Queue Status
```
PENDING:     Amber text
PROCESSING:  Blue text
FAILED:      Red text
```

---

## 📦 Glass Panel Variants

### Standard Glass
```scss
background: rgba(30, 41, 59, 0.4)
backdrop-filter: blur(16px)
border: 1px solid rgba(148, 163, 184, 0.2)
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37)
```

### Light Glass
```scss
background: rgba(51, 65, 85, 0.5)
```

### Lighter Glass
```scss
background: rgba(71, 85, 105, 0.3)
```

---

## 🎨 Gradient Presets

### Primary Gradient
```css
linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)
```

### Secondary Gradient
```css
linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)
```

### Success Gradient
```css
linear-gradient(135deg, #10b981 0%, #059669 100%)
```

### Background Gradient
```css
radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)
```

---

## 🔘 Border Radius Scale

```
sm:    8px   - Small elements, badges
md:    12px  - Inputs, buttons, cards
lg:    16px  - Panels, containers
xl:    24px  - Large sections
full:  9999px - Pills, circles, badges
```

---

## 📱 Responsive Breakpoints

```
Mobile:     < 640px
Tablet:     640px - 1024px
Desktop:    > 1024px
```

**Touch Targets:** Minimum 44x44px

---

## ✨ Special Effects

### Neon Glow
```css
text-shadow: 
  0 0 20px rgba(14, 165, 233, 0.6),
  0 0 40px rgba(14, 165, 233, 0.4)

box-shadow:
  0 0 20px rgba(14, 165, 233, 0.5),
  0 0 40px rgba(14, 165, 233, 0.3)
```

### Pulsing Dot
```css
width: 8px
height: 8px
border-radius: 50%
background: accent-color
box-shadow: 0 0 10px accent-color
animation: pulse 2s ease-in-out infinite
```

### Shimmer Loading
```css
background: linear-gradient(
  90deg,
  glass-bg 25%,
  glass-bg-light 50%,
  glass-bg 75%
)
background-size: 1000px 100%
animation: shimmer 2s infinite
```

---

## 🎪 Component Patterns

### Card Pattern
```
.glass-panel
  padding: 20px
  hover: lift + glow
  animation: fadeIn 0.5s
```

### Button Pattern
```
.button
  gradient background
  padding: 10px 20px
  border-radius: full
  hover: lift + enhanced shadow
  active: scale(0.95)
```

### Input Pattern
```
.glass-input
  glass background
  border: 1px solid
  padding: 14px 16px
  focus: accent border + glow ring
```

### Badge Pattern
```
.badge
  pill shape (border-radius: full)
  small text (0.7-0.8rem)
  padding: 6px 14px
  uppercase + letter-spacing
```

---

## 🎯 Usage Examples

### Creating a New Card
```html
<div class="glass-panel interactive fade-in">
  <div class="card-glow"></div>
  <!-- Content -->
</div>
```

### Creating a Status Badge
```html
<span class="status-badge">
  <span class="pulse-dot"></span>
  Status Text
</span>
```

### Creating a Button
```html
<button class="action-btn">
  <svg><!-- icon --></svg>
  <span>Button Text</span>
</button>
```

### Creating an Input
```html
<input 
  type="text" 
  class="glass-input"
  placeholder="Enter text..."
/>
```

---

## 🎨 Icon Guidelines

### Icon Sizes
```
Small:   16px - Inline with text
Medium:  20px - Buttons, badges
Large:   24px - Navigation, headers
XLarge:  48px - Empty states, features
Huge:    80px - Hero sections
```

### Icon Colors
```
Primary:    var(--color-accent-primary)
Secondary:  var(--color-text-secondary)
Success:    var(--color-status-success)
Warning:    var(--color-status-warning)
Error:      var(--color-status-error)
```

### Icon Effects
```
Glow:   filter: drop-shadow(0 0 10px color)
Pulse:  animation: pulse 2s infinite
Spin:   animation: spin 1s linear infinite
```

---

## 🚀 Performance Tips

### Animations
- Use `transform` and `opacity` for best performance
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly for complex animations

### Transitions
- Keep transitions under 500ms
- Use hardware acceleration (`transform3d`)
- Batch DOM updates

### Images
- Compress images before upload
- Use appropriate formats (WebP, AVIF)
- Lazy load images below fold

---

## ♿ Accessibility Checklist

✅ Focus-visible styles on all interactive elements  
✅ ARIA labels on icon-only buttons  
✅ Proper heading hierarchy (h1 → h2 → h3)  
✅ Color contrast ratio > 4.5:1  
✅ Touch targets minimum 44x44px  
✅ Keyboard navigation support  
✅ Screen reader friendly markup  
✅ Alt text on images  
✅ Form labels associated with inputs  

---

## 🎓 Best Practices

### DO ✅
- Use CSS variables for consistency
- Apply animations to enhance UX
- Maintain visual hierarchy
- Test on multiple devices
- Keep animations subtle
- Use semantic HTML
- Follow spacing system
- Maintain color contrast

### DON'T ❌
- Overuse animations
- Ignore loading states
- Skip empty states
- Use fixed pixel values
- Animate expensive properties
- Ignore accessibility
- Break visual consistency
- Use too many colors

---

**Quick Start:** Copy this guide for reference when building new components!

