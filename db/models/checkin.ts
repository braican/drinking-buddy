import {
  Field,
  PrimaryKey,
  SearchField,
  TigrisCollection,
  TigrisDataTypes
} from '@tigrisdata/core';

import type { TigrisCollectionType } from '@tigrisdata/core';

@TigrisCollection('checkins')
export class Checkin implements TigrisCollectionType {
  @PrimaryKey(TigrisDataTypes.INT32, { order: 1, autoGenerate: true })
  id!: number;

  @Field()
  @SearchField()
  text!: string;

  @Field()
  completed!: boolean;
}