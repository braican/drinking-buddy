import { Field, PrimaryKey, TigrisCollection, TigrisDataTypes } from '@tigrisdata/core';
import type { TigrisCollectionType } from '@tigrisdata/core';
import { Beer } from './beer.ts';

class Brewery {
  @Field()
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
}

class Venue {
  @Field()
  id!: number;

  @Field()
  name: string;

  @Field()
  address: string;

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
}

@TigrisCollection('checkins')
export class Checkin implements TigrisCollectionType {
  @PrimaryKey(TigrisDataTypes.INT64)
  id!: number;

  @Field({ index: true })
  createdAt!: Date;

  @Field()
  comment: string;

  @Field()
  rating: number;

  @Field()
  beer: Beer;

  @Field()
  brewery: Brewery;

  @Field()
  venue: Venue;

  @Field()
  raw: string;
}
