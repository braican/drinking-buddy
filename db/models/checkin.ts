import {
  Field,
  PrimaryKey,
  SearchField,
  TigrisCollection,
  TigrisDataTypes
} from '@tigrisdata/core';

import type { TigrisCollectionType } from '@tigrisdata/core';

class Beer {
  @Field()
  id!: number;

  @Field()
  name: string;

  @Field()
  label: string;

  @Field()
  style: string;

  @Field()
  abv: number;
}

class Brewery {
  @Field()
  id!: number;

  @Field()
  name: string;

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
  @PrimaryKey(TigrisDataTypes.INT32, { order: 1, autoGenerate: true })
  id!: number;

  @Field()
  checkinId!: string;

  @Field()
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
}