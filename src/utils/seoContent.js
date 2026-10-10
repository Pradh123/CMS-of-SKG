// Pure SEO-content helpers shared by the CMS editor UI and its tests.

const NAMED_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': ' ',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&#x27;': "'",
}

export function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z#x0-9]+;/gi, match => NAMED_ENTITIES[match.toLowerCase()] ?? " ")
    .replace(/\s+/g, " ")
    .trim();
}

function trimToLength(value, maxLength) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) return text;
  const shortened = text.slice(0, maxLength - 1);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > maxLength * 0.6 ? lastSpace : shortened.length).trimEnd()}…`;
}

export function countState(length, { min, max }) {
  if (length === 0) return "empty";
  if (length < min || length > max) return "warn";
  return "ok";
}

export function serpPreview({ title, slug, description, content, siteUrl = "https://skgtravels.com" }) {
  const headline = String(title || "").trim() || "Untitled page";
  const summary = String(description || "").trim() || trimToLength(stripHtml(content), 160);
  return {
    url: `${siteUrl.replace(/\/+$/, "")}/${slug || "your-page"}`,
    title: trimToLength(headline, 60),
    description: trimToLength(summary, 160),
  };
}

export function seoChecklist({ metaTitle = "", metaDescription = "", content = "", image = "", slug = "" } = {}) {
  const titleLength = String(metaTitle).trim().length;
  const descriptionLength = String(metaDescription).trim().length;
  const contentLength = stripHtml(content).length;
  return [
    {
      label: "SEO title length",
      detail: `${titleLength} characters (aim for 30-60)`,
      state: countState(titleLength, { min: 30, max: 60 }),
    },
    {
      label: "Meta description length",
      detail: `${descriptionLength} characters (aim for 70-160)`,
      state: countState(descriptionLength, { min: 70, max: 160 }),
    },
    {
      label: "Content length",
      detail: `${contentLength} characters (aim for 300+)`,
      state: contentLength === 0 ? "empty" : contentLength < 300 ? "warn" : "ok",
    },
    {
      label: "Featured image",
      detail: image ? "Image set for listings and social cards" : "Add an image URL for richer previews",
      state: image ? "ok" : "empty",
    },
    {
      label: "Public URL",
      detail: slug ? `/${slug}` : "A slug is generated from the title on save",
      state: slug ? "ok" : "warn",
    },
  ];
}
