---
name: Forest Immersion
colors:
  surface: '#f8faf9'
  surface-dim: '#d8dada'
  surface-bright: '#f8faf9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f3'
  surface-container: '#eceeed'
  surface-container-high: '#e6e9e8'
  surface-container-highest: '#e1e3e2'
  on-surface: '#191c1c'
  on-surface-variant: '#414844'
  inverse-surface: '#2e3131'
  inverse-on-surface: '#eff1f0'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3f6653'
  primary: '#012d1d'
  on-primary: '#ffffff'
  primary-container: '#1b4332'
  on-primary-container: '#86af99'
  inverse-primary: '#a5d0b9'
  secondary: '#006c48'
  on-secondary: '#ffffff'
  secondary-container: '#92f7c3'
  on-secondary-container: '#00734d'
  tertiary: '#002d1a'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a432e'
  on-tertiary-container: '#84b095'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecd4'
  primary-fixed-dim: '#a5d0b9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#274e3d'
  secondary-fixed: '#92f7c3'
  secondary-fixed-dim: '#75daa8'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005235'
  tertiary-fixed: '#c0edd0'
  tertiary-fixed-dim: '#a4d1b4'
  on-tertiary-fixed: '#002112'
  on-tertiary-fixed-variant: '#264f39'
  background: '#f8faf9'
  on-background: '#191c1c'
  surface-variant: '#e1e3e2'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin: 32px
  section-gap: 64px
---

## Brand & Style

The design system is rooted in the concept of biophilic productivity. It transforms the often-sterile environment of document AI into a restorative, "Forest Immersion" experience. The brand personality is professional yet organic, evoking a sense of calm focus and clarity through the metaphor of a sun-drenched woodland.

The visual style blends **Minimalism** with **Glassmorphism** and **Tactile** elements. By using high-quality organic textures and soft, dappled light effects, the UI reduces the cognitive load associated with complex data processing. The emotional response is one of "ordered nature"—where the intelligence of the AI feels as natural and inevitable as the growth of a forest.

## Colors

The palette is derived from the vertical layers of a forest. The primary "Deep Woods Green" provides a stable, professional foundation for typography and primary actions. "Leaf Bright Green" serves as the active accent, representing growth and AI-driven insights. 

The background utilizes "Soft Misty Whites" to create a sense of atmospheric depth. Rather than pure grays, neutrals are infused with a hint of moss and mint to maintain the organic theme. High-contrast elements should use the darkest forest green to ensure accessibility while maintaining the monochromatic harmony of the woodland floor.

## Typography

This design system utilizes **Manrope** across all levels to maintain a modern, technical, yet balanced appearance. The geometric qualities of the typeface provide a necessary "human-made" contrast to the organic textures of the UI. 

Headlines use a bolder weight and tighter tracking to feel impactful and grounded. Body text is set with generous line height to ensure legibility against textured or translucent backgrounds. Labels are treated with slightly increased letter spacing and medium weights to ensure they remain distinct when used within glassmorphic chips or navigation elements.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model within a fluid container, emphasizing a sense of "clearings" within the interface. Content is organized into a 12-column system with generous gutters that mimic the airy space between trees.

Spacing is based on an 8px rhythmic scale. Larger gaps are encouraged between major sections to prevent visual clutter, reflecting the openness of a sun-drenched forest. Padding within components is ample, ensuring that data-heavy AI outputs have "room to breathe," avoiding the dense, claustrophobic feel of traditional document editors.

## Elevation & Depth

Depth in this design system is achieved through **Glassmorphism** and **Dappled Shadows**. Surfaces are not merely layered; they interact with light like the forest canopy.

1.  **Dewdrop Layers:** Primary UI containers use a backdrop-blur (12px to 20px) with a semi-transparent misty white fill (60-80% opacity). This mimics light filtered through leaves.
2.  **Dappled Sunlight Shadows:** Shadows are extra-diffused and multi-layered. Instead of neutral grays, shadows use a very low-opacity forest green (#1B4332 at 8-12%) to create a soft, natural lift that feels like sunlight casting organic shadows on the forest floor.
3.  **Organic Textures:** Subtle grain or "leaf fiber" textures are applied to the lowest z-index background to provide tactile grounding.

## Shapes

The shape language is **Rounded**, avoiding harsh 90-degree angles to remain consistent with organic forms found in nature. A standard corner radius of 0.5rem (8px) is used for most interactive elements, while larger containers and cards utilize 1rem (16px) or 1.5rem (24px) to feel soft and approachable. 

Interactive triggers like buttons or active states should feel like polished river stones—smooth and ergonomic. The use of "pill-shaped" geometry is reserved for status indicators and tags to mimic the shape of young leaves or seeds.

## Components

### Buttons & Inputs
Buttons are rendered in deep forest green with white text for primary actions, while secondary actions use a glassmorphic "mist" style with a fine 1px border in leaf green. Input fields utilize a soft misty background with a focus state that glows slightly, mimicking sunlight hitting a dewdrop.

### Cards & Containers
Cards are the primary vehicle for document data. They feature a soft backdrop blur and a very subtle inner glow on the top-left edge to simulate directional sunlight. Textures should be applied sparingly to the card background to give a paper-like, organic feel.

### Chips & Tags
Chips are pill-shaped and semi-transparent. Use "Leaf Bright Green" for positive AI confidence scores and a muted "Earthy Brown" or "Misty Gray" for neutral or pending states.

### Dappled Overlays
When modals or overlays appear, the background dimming is not a simple black tint, but a deep green blur that maintains the "immersion" even when focus shifts.

### Document Preview
Document previews should be framed by a wide "misty" margin, making the digital document feel like it is resting on a natural surface. Use soft shadows to lift the document from the interface.