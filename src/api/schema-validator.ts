import Ajv, { type ErrorObject, type ValidateFunction } from 'ajv';

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  validateFormats: false,
});

export function compileSchema(schema: object): ValidateFunction {
  return ajv.compile(schema);
}

export function assertValidSchema(validate: ValidateFunction, data: unknown): void {
  const ok = validate(data);
  if (!ok) {
    const details = (validate.errors ?? [])
      .map((err: ErrorObject) => `${err.instancePath || '/'} ${err.message ?? ''}`.trim())
      .join('; ');
    throw new Error(`AJV schema validation failed: ${details}`);
  }
}
