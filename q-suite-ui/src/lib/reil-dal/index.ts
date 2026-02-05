/**
 * REIL Core Data Access Layer (ENGDEL-REIL-DATA-ACCESS-LAYER-0004).
 * Single entry: all DAL exports. No direct DB writes outside this layer.
 */

export type { DalClient, Actor, DalResult } from './types';
export { dalErr, dalOk } from './types';

export {
  createSourceItemRaw,
  listSourceItemsRaw,
  getSourceItemRawByExternalId,
} from './source-items-raw';
export type { CreateSourceItemRawParams, ListSourceItemsRawParams } from './source-items-raw';

export {
  upsertSourceItemNormalized,
  getNormalizedByRawId,
} from './source-items-normalized';
export type { UpsertSourceItemNormalizedParams } from './source-items-normalized';

export {
  createRecord,
  getRecord,
  searchRecords,
  linkRecordToSourceItem,
} from './records';
export type {
  CreateRecordParams,
  SearchRecordsParams,
  LinkRecordToSourceItemParams,
} from './records';

export {
  createDocumentPointer,
  linkDocumentToRecord,
} from './documents';
export type {
  CreateDocumentPointerParams,
  LinkDocumentToRecordParams,
} from './documents';

export {
  appendLedgerEvent,
  listLedgerEventsByRecord,
} from './ledger-events';
export type { AppendLedgerEventParams } from './ledger-events';
