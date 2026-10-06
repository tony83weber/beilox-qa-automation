/**
 * Schemas AJV alineados al shape real de swapi.tech (no swapi.dev legacy).
 * people/planets listan en `results`; films lista en `result`.
 */

export const peoplePlanetsListSchema = {
  type: 'object',
  required: ['message', 'results'],
  additionalProperties: true,
  properties: {
    message: { type: 'string' },
    total_records: { type: 'number' },
    total_pages: { type: 'number' },
    previous: { type: ['string', 'null'] },
    next: { type: ['string', 'null'] },
    results: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['uid', 'name', 'url'],
        properties: {
          uid: { type: 'string' },
          name: { type: 'string' },
          url: { type: 'string' },
        },
        additionalProperties: true,
      },
    },
  },
} as const;

export const filmsListSchema = {
  type: 'object',
  required: ['message', 'result'],
  additionalProperties: true,
  properties: {
    message: { type: 'string' },
    result: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['properties', 'uid', 'description'],
        properties: {
          uid: { type: 'string' },
          description: { type: 'string' },
          properties: {
            type: 'object',
            required: ['title', 'episode_id'],
            properties: {
              title: { type: 'string' },
              episode_id: { type: 'number' },
            },
            additionalProperties: true,
          },
        },
        additionalProperties: true,
      },
    },
  },
} as const;

export const resourceDetailSchema = {
  type: 'object',
  required: ['message', 'result'],
  additionalProperties: true,
  properties: {
    message: { type: 'string' },
    result: {
      type: 'object',
      required: ['properties', 'uid'],
      properties: {
        uid: { type: 'string' },
        properties: { type: 'object' },
      },
      additionalProperties: true,
    },
  },
} as const;

/** 404 body. Planets a veces tipan `messsage` en lugar de `message`. */
export const notFoundSchema = {
  type: 'object',
  additionalProperties: true,
  anyOf: [
    {
      required: ['message'],
      properties: { message: { type: 'string' } },
    },
    {
      required: ['messsage'],
      properties: { messsage: { type: 'string' } },
    },
  ],
} as const;
