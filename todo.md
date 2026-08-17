# Project TODO

- [x] Document the Liverton requirements and verify the scaffold
- [x] Replace all retired brand references with Liverton across the codebase, copy, metadata, and UI
- [x] Build the shared Liverton visual system with purple/lavender gradients, lime accents, glass navigation, rounded cards, and responsive motion
- [x] Build the sticky responsive navbar with Liverton logo, routes, cart count, and mobile menu
- [x] Build the home page with announcement dashboard, hero video-ready area, categories, parallax motion, and promotional highlights
- [x] Build the New Arrivals page with product badges and arrival dates
- [x] Build the Products catalog with at least 9 products, category filters, and working Add to Cart controls
- [x] Build About Us, Innovation, Solutions, and Support pages with meaningful content
- [x] Integrate the built-in AIChatBox as Hanna AI on Support and as a site-wide floating support action
- [x] Build the two-column footer with navigation, social links, legal routes, status route, and newsletter signup
- [x] Build functional Status, Privacy Policy, Terms of Service, and footer-linked utility pages
- [x] Add PWA manifest, service worker registration, and install prompt banner
- [x] Add Vitest coverage for cart behavior, route data, and PWA/install behavior
- [x] Run type checks, tests, and visual responsive verification
- [x] Save the final checkpoint and deliver the updated Liverton project

## Change History

- [x] Initial implementation request recorded
- [x] Retry interrupted implementation from a clean step

## Notes

- The design must preserve the existing purple/lavender and lime visual direction while using Liverton exclusively.
- The Hanna AI interface must use the provided built-in AIChatBox component.
- Do not add fabricated reviews, ratings, testimonials, or other user-generated content.

- [x] Register the injected commerce router and environment exports required by Shopify
- [x] Use the injected Storefront API procedures and CartContext for storefront product and cart behavior
- [x] Keep Shopify catalog seeding within the integration limit while making the UI support a larger catalog
- [x] Run the Shopify probe and smoke tests after the storefront wiring is complete
- [x] Retry and complete the interrupted Liverton storefront implementation from this clean checkpoint

- [x] Export the current Liverton storefront into the target GitHub repository
- [x] Add Vercel-compatible project configuration and deployment documentation
- [x] Verify build, repository structure, commit, and pushed remote branch
- [x] Make every footer link route to a real in-app page instead of leaving users in the footer section
- [x] Add a dedicated in-app Contact page with Email and WhatsApp options
- [x] Add an email contact form addressed to livertoncodes@gmail.com without navigating away from the app
- [x] Add an in-app WhatsApp message composer for +256705954597 with a clear handoff to WhatsApp delivery
- [x] Add configurable home dashboard banner slots for videos, announcements, and promotional content
- [x] Add tests for footer routes, contact form states, WhatsApp handoff, and dashboard banner rendering
- [x] Use the built-in owner-notification channel for keyless contact submissions and label the confirmation accurately
- [x] Remove the unused Resend credential test and provider path
- [x] Verify contact form success/error states and WhatsApp handoff without external API credentials
- [x] Sync the latest verified contact, WhatsApp, dashboard-banner, and helper-test changes to GitHub
- [x] Commit and push the latest Liverton changes to the main branch
