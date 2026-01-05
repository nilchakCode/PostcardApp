# PostcardsTo - Brand Guidelines

## Logo

The PostcardsTo logo represents the core concept of sending postcards with love to friends and family.

### Logo Elements

1. **Main Postcard** - A clean, rectangular postcard shape with rounded corners
2. **Stamp** - A traditional postage stamp in the top-right corner
3. **Address Lines** - Stylized lines representing the recipient's address
4. **Heart Symbol** - A red heart representing the "To" in PostcardsTo (sending with love)
5. **Motion Lines** - Dynamic lines suggesting the postcard being sent

### Logo Files

- `frontend/public/logo.svg` - Full-size logo (200x200px)
- `frontend/public/favicon.svg` - Favicon version (32x32px)
- `frontend/components/Logo.tsx` - React component version

### Color Palette

**Primary Colors:**
- Blue (#3B82F6) - Main brand color, represents trust and communication
- Red (#EF4444) - Heart accent, represents love and connection
- White (#FFFFFF) - Clean, modern feel

**Secondary Colors:**
- Slate Gray (#94A3B8) - Text and subtle elements
- Light Blue (#DBEAFE) - Backgrounds and accents

### Typography

**Primary Font:** System fonts (Arial, Helvetica, sans-serif)
- Clean and readable
- Works across all devices

### Usage Guidelines

#### Do's ✓
- Use the logo with adequate white space around it
- Maintain the aspect ratio when scaling
- Use on light backgrounds for best visibility
- Use the React component for dynamic color matching

#### Don'ts ✗
- Don't distort or stretch the logo
- Don't change the color scheme (except when using the component)
- Don't add effects like shadows or gradients
- Don't rotate the logo

### Logo in Different Contexts

#### Homepage
- Large logo (120x120px)
- Centered above the app name
- Full color with background circle

#### Authentication Pages (Login/Signup)
- Medium logo (80x80px)
- Centered at top of form
- Full color

#### Navigation Bar
- Small logo (40x40px)
- Left-aligned with app name
- Full color

### Using the React Logo Component

```tsx
import Logo from '@/components/Logo'

// Default size (40px)
<Logo />

// Custom size
<Logo size={80} />

// With custom class (inherits text color)
<Logo size={60} className="text-blue-600" />
```

The Logo component uses `currentColor` for dynamic theming, allowing it to match your design system colors.

## App Name Styling

**PostcardsTo** should always be written as:
- One word, no spaces
- Capital "P", capital "T"
- Never: "Postcards To", "postcards to", "PostCards To"

## Tagline

**"Share your moments, stories, and memories with the world"**

Alternative taglines:
- "Send love through stories and photos"
- "Your moments, beautifully shared"
- "Connect through postcards"

## Brand Voice

- **Friendly** - Warm and welcoming
- **Modern** - Contemporary and fresh
- **Personal** - Intimate and meaningful
- **Simple** - Easy to understand and use

## UI/UX Principles

1. **Clean Design** - Minimal clutter, focus on content
2. **Easy Navigation** - Intuitive user flows
3. **Visual Hierarchy** - Clear information structure
4. **Responsive** - Works beautifully on all devices
5. **Accessible** - Inclusive design for all users

## Social Media

When sharing on social media, use:
- Logo as profile picture
- Brand colors in cover images
- Consistent messaging with brand voice

## Questions?

For brand-related questions, refer to this document or contact the design team.
