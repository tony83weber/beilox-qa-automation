import fs from 'node:fs';
import path from 'node:path';
import { getEnvironmentConfig } from '../types/env';
import { maskVolatileFields } from './mask-volatile';
import type { SwapiResource } from './swapi.client';

export type ApiEvidenceMeta = {
  environment: string;
  method: 'GET';
  endpoint: string;
  status: number;
  elapsedMs: number;
  savedAt: string;
  scenario: string;
};

export type ApiEvidenceDocument = {
  meta: ApiEvidenceMeta;
  body: unknown;
};

export type SaveEvidenceInput = {
  resource: SwapiResource;
  scenario: string;
  endpoint: string;
  status: number;
  elapsedMs: number;
  body: unknown;
  /** Si true, también actualiza api-responses/{resource}-happy-path.json (enmascarado). */
  updateHappyPath?: boolean;
};

/**
 * Guarda evidencia de corrida en api-evidence/ (gitignore).
 * Opcionalmente refresca el happy-path del challenge con body enmascarado.
 */
export function saveApiEvidence(input: SaveEvidenceInput): {
  evidencePath: string;
  happyPathPath?: string;
} {
  const env = getEnvironmentConfig();
  const document: ApiEvidenceDocument = {
    meta: {
      environment: env.name,
      method: 'GET',
      endpoint: input.endpoint,
      status: input.status,
      elapsedMs: input.elapsedMs,
      savedAt: new Date().toISOString(),
      scenario: input.scenario,
    },
    body: maskVolatileFields(input.body),
  };

  const evidenceDir = path.resolve(process.cwd(), 'api-evidence');
  fs.mkdirSync(evidenceDir, { recursive: true });
  const evidencePath = path.join(
    evidenceDir,
    `${input.resource}-${slug(input.scenario)}.json`,
  );
  fs.writeFileSync(evidencePath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');

  let happyPathPath: string | undefined;
  if (input.updateHappyPath) {
    const happyDir = path.resolve(process.cwd(), 'api-responses');
    fs.mkdirSync(happyDir, { recursive: true });
    happyPathPath = path.join(happyDir, `${input.resource}-happy-path.json`);
    fs.writeFileSync(
      happyPathPath,
      `${JSON.stringify(maskVolatileFields(input.body), null, 2)}\n`,
      'utf8',
    );
  }

  return { evidencePath, happyPathPath };
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}
