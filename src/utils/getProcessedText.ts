/**
 * Processes text to convert bare URLs into markdown hyperlinks while preserving existing links
 */
export const getProcessedText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Regex to match URLs that are NOT already in markdown or HTML link format
  // This looks for URLs that are not preceded by ]( or href=" or [ and not followed by ) or ]
  const urlRegex = /(?<!\]\(|href=["']|\[)https?:\/\/[^\s[\]()]+(?![)\]])/gi;

  // Replace bare URLs with markdown links
  const processedText = text.replace(urlRegex, (url) => {
    // Clean up common punctuation that shouldn't be part of the URL
    let cleanUrl = url;
    let trailingPunctuation = '';

    // Check for trailing punctuation and remove it from the URL
    const trailingPunctuationMatch = cleanUrl.match(/([.,;:!?]+)$/);
    if (trailingPunctuationMatch) {
      trailingPunctuation = trailingPunctuationMatch[1];
      cleanUrl = cleanUrl.slice(0, -trailingPunctuation.length);
    }

    // Create markdown link with the URL as both the link text and href
    return `[${cleanUrl}](${cleanUrl})${trailingPunctuation}`;
  });

  return processedText;
};