import { TagInterface } from './tag.interface';

export interface UserInterface {
  email: string;
  fullname: string;
  role: number;
  tags: TagInterface[];
  companies: string[];
  companiesId?: string[];
  tagsId?: {};
  advertisers?: string[];
  apiKey: string;
  _key: string;
}
