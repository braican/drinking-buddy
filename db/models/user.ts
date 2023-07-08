import { Field, PrimaryKey, TigrisCollection, TigrisDataTypes } from '@tigrisdata/core';

import type { TigrisCollectionType } from '@tigrisdata/core';

@TigrisCollection('users')
export class User implements TigrisCollectionType {
  @PrimaryKey(TigrisDataTypes.INT64)
  id!: number;

  @Field()
  username!: string;

  @Field()
  firstName?: string;

  @Field()
  lastName?: string;

  @Field()
  avatar?: string;

  @Field()
  badges?: number;

  @Field()
  checkins?: number;

  @Field()
  beers?: number;

  @Field()
  lastUpdated?: Date;
}
