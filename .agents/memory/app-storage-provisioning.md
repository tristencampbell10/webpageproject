---
name: App Storage provisioning
description: Replit Object Storage requires an App Storage bucket to be provisioned for the Repl.
---

The Replit `@replit/object-storage` client can throw during construction when the Repl has no bucket configured. Installing the SDK does not provision a bucket.

**Why:** Treating initialization as optional can silently route private contact records to the local filesystem, which is not a production persistence guarantee.

**How to apply:** Verify App Storage is provisioned before relying on the default bucket. Allow a clearly labeled filesystem backend only for local development; production should fail startup when App Storage is unavailable.