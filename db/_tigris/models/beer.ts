import { Field } from '@tigrisdata/core';

export class Beer {
  @Field()
  id!: number;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  label: string;

  @Field()
  style: string;

  @Field()
  abv: number;
}
