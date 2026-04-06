# Design System Document

## 1. Overview & Creative North Star: "The Academic Curator"

This design system moves away from the sterile, "template-first" look of standard management apps. Instead, it adopts the persona of **The Academic Curator**. The vision is a high-end editorial experience that feels like a premium digital planner or a modern university gallery.

The system rejects the "box-in-a-box" layout of traditional apps. Instead, it utilizes **The Breathable Canvas**—a layout strategy driven by expansive white space, intentional asymmetry, and overlapping elements that challenge the rigid mobile grid. We create a sense of prestige through a "High-Contrast, Low-Noise" approach: bold, authoritative typography paired with soft, tonal surface shifts.

## 2. Colors: Tonal Depth & The "No-Line" Rule

The palette is anchored in a sophisticated "Evergreen" primary, supported by earthen tertiary tones to evoke a sense of heritage and growth.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning content. Boundaries must be defined solely through background color shifts or vertical whitespace. 
*   *Implementation:* A `surface-container-low` section sitting on a `surface` background is the standard for differentiation.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine vellum. Use the surface-container tiers to define importance:
*   **Base:** `surface` (#f8faf7) - The global canvas.
*   **Sectioning:** `surface-container-low` (#f2f4f1) - To group related modules.
*   **Interactive Cards:** `surface-container-lowest` (#ffffff) - To pop against the background.
*   **Active Elements:** `surface-container-high` (#e7e9e6) - For pressed states or elevated information.

### The "Glass & Gradient" Rule
To move beyond "out-of-the-box" Material design, use Glassmorphism for floating action buttons or sticky headers.
*   **Execution:** Apply `surface` with 70% opacity and a `20px` backdrop blur. 
*   **Signature Textures:** For Hero sections (e.g., student GPA or progress overview), use a subtle linear gradient from `primary` (#00342b) to `primary-container` (#004d40) at a 135-degree angle to provide a deep, professional "soul."

## 3. Typography: Editorial Authority

We use a dual-font pairing to balance academic authority with modern utility.

*   **Display & Headlines (Manrope):** Use Manrope for all `display` and `headline` scales. It provides a geometric, modern warmth that feels curated. Headlines should use "tight" letter-spacing (-0.02em) to feel like a premium publication.
*   **Body & Labels (Inter):** Use Inter for all functional text. Inter’s high x-height ensures readability in complex activity lists.
*   **The Hierarchy Goal:** Use extreme scale shifts. A `display-sm` header paired with `body-md` secondary text creates a sophisticated "Editorial" look that guides the eye immediately to the most important data point.

## 4. Elevation & Depth: Tonal Layering

Traditional shadows are often "dirty" and clutter the interface. We achieve depth through **Tonal Layering** and **Ambient Light**.

*   **The Layering Principle:** Instead of a shadow, place a `surface-container-lowest` card on a `surface-container-low` background. The subtle 2% difference in luminosity creates a sophisticated, "natural" lift.
*   **Ambient Shadows:** If a floating effect is required (e.g., a Bottom Sheet or a Floating Action Button), use a highly diffused shadow: `Y: 12, Blur: 24, Color: on-surface @ 6%`. This mimics soft, natural gallery lighting.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., in high-contrast mode), use a "Ghost Border": `outline-variant` (#bfc9c4) at 15% opacity. Never use 100% opaque borders.

## 5. Components

### Cards & Lists
*   **Constraint:** Zero dividers. Use a `1.5rem` (xl) vertical gap or a subtle shift from `surface` to `surface-container-low` to separate items.
*   **Styling:** All cards must use the `xl` (1.5rem) roundedness for a soft, approachable academic feel.

### Buttons
*   **Primary:** `primary` background with `on-primary` text. No border. `full` roundedness for a modern "pill" look.
*   **Secondary:** `secondary-container` background with `on-secondary-container` text.
*   **Signature Interaction:** For the main "Add Activity" button, use the **Glassmorphism** rule: a semi-transparent primary color with a heavy backdrop blur.

### Input Fields
*   **Style:** Minimalist. No bounding box. Use a `surface-container-highest` bottom bar (2px) that transforms into `primary` on focus.
*   **Labels:** Use `label-md` in `primary` color for floating labels to maintain the academic aesthetic.

### Chips (Activity Tags)
*   **Selection Chips:** Use `secondary-fixed-dim` for inactive states and `primary` for active states. Use `sm` (0.25rem) roundedness to contrast with the "pill" buttons.

### Specialized Component: The "Activity Pulse"
*   A custom progress component for student goals. Instead of a standard bar, use a series of staggered vertical lines of varying heights (using `primary` and `primary-fixed`), creating a "data-visualization" look that feels more sophisticated than a generic progress bar.

## 6. Do's and Don'ts

### Do
*   **Do** embrace asymmetry. Align large headlines to the left while keeping activity counts pushed to the far right.
*   **Do** use "Negative Space" as a functional tool. If the screen feels crowded, increase the padding to `2rem` (xl).
*   **Do** use `tertiary` (#4e2013) sparingly as an accent for "Urgent" or "High Priority" tasks to provide warmth against the cool greens.

### Don't
*   **Don't** use pure black (#000000) for text. Always use `on-surface` (#191c1b) to maintain the soft academic tone.
*   **Don't** use standard Material icons in their filled state. Use "Light" or "Thin" weight stroke icons to match the refined typography.
*   **Don't** use "Drop Shadows" on cards. Stick to the **Tonal Layering** principle to keep the UI feeling "light" and integrated.