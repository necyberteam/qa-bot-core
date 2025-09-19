/**
 * Deep merge utility for nested configuration objects
 * Handles proper merging of nested objects while preserving arrays and other types
 */
export function deepMerge(target: any, source: any): any {
  // Handle null/undefined cases
  if (!target) return source || {};
  if (!source) return target || {};

  // Start with shallow copy of target
  const result = { ...target };

  // Deep merge each property from source
  for (const [key, value] of Object.entries(source)) {
    if (value === null || value === undefined) {
      // Explicit null/undefined overrides target
      result[key] = value;
    } else if (Array.isArray(value)) {
      // Arrays replace entirely (no merging arrays)
      result[key] = [...value];
    } else if (typeof value === 'object' && value.constructor === Object) {
      // Plain objects get deep merged
      result[key] = deepMerge(result[key] || {}, value);
    } else {
      // Primitives, functions, classes, etc. replace entirely
      result[key] = value;
    }
  }

  return result;
}

/**
 * Merge multiple objects with deep merging
 * Objects are merged left-to-right (later objects have higher priority)
 */
export function deepMergeAll(...objects: any[]): any {
  return objects.reduce((result, obj) => deepMerge(result, obj), {});
}
