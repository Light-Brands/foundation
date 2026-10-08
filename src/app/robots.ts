import type { MetadataRoute } from "next";

// Public pages may be found. The command center and the API are kept out, and each admin page also says noindex.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] } };
}
