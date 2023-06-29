import { Field, PrimaryKey, TigrisCollection, TigrisDataTypes } from '@tigrisdata/core';

import type { TigrisCollectionType } from '@tigrisdata/core';

@TigrisCollection('breweries')
export class Brewery implements TigrisCollectionType {
  @PrimaryKey(TigrisDataTypes.INT64)
  id!: number;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  type: string;

  @Field()
  label: string;

  @Field()
  city: string;

  @Field()
  state: string;

  @Field()
  country: string;

  @Field()
  lat: number;

  @Field()
  lng: number;

  @Field()
  checkinCount?: number;

  @Field()
  cumulative?: number;
}
