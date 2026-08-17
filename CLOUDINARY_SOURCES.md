# Cloudinary implementation sources

The Cloudinary implementation follows the official documentation reviewed on 2026-08-17:

1. Upload Widget documentation: https://cloudinary.com/documentation/upload_widget
   - Cloudinary supports direct browser uploads with unsigned presets and signed uploads for more secure workflows.
   - The widget requires a cloud name and upload preset; signed workflows generate a server-side signature.

2. Upload Presets documentation: https://cloudinary.com/documentation/upload_presets
   - Presets can be signed or unsigned.
   - Unsigned presets are intended for direct browser uploads and should be constrained by file types, size, folder, and overwrite policy.
   - Presets can define folders, naming, transformations, and eager transformations.

3. Node.js SDK documentation: https://cloudinary.com/documentation/node_integration
   - The Node SDK can be configured with cloud name, API key, and API secret.
   - The API secret must remain server-only.
   - The SDK provides signature helpers for secure uploads.

Liverton uses the signed route: the admin-only tRPC procedure signs a short-lived payload, the browser uploads directly to Cloudinary, and the API secret is never returned to the browser.
