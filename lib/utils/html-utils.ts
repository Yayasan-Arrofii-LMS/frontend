/**
 * Process HTML content to display in preview:
 * - Strip HTML tags but keep text content
 * - Replace <img> tags with "<image>" text
 */
export function processHtmlForPreview(html: string): string {
  if (!html) return "";

  // Create a temporary div to parse HTML
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Replace all img tags with "<image>" text
  const images = temp.querySelectorAll("img");
  images.forEach((img) => {
    const textNode = document.createTextNode("<image>");
    img.parentNode?.replaceChild(textNode, img);
  });

  // Get text content (strips all HTML tags)
  return temp.textContent || temp.innerText || "";
}

/**
 * Strip all HTML tags from content
 */
export function stripHtmlTags(html: string): string {
  if (!html) return "";

  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}
