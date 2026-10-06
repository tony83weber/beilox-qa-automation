const VOLATILE_KEYS = new Set([
  'timestamp',
  'created',
  'edited',
  'created_at',
  'updated_at',
]);

const MASK = '<volatile>';

/**
 * Clona el body y reemplaza campos temporales para evidencia estable.
 * No muta el original (las aserciones usan el body crudo).
 */
export function maskVolatileFields<T>(value: T): T {
  return maskValue(value) as T;
}

function maskValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => maskValue(item));
  }

  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      output[key] = VOLATILE_KEYS.has(key) ? MASK : maskValue(nested);
    }
    return output;
  }

  return value;
}
