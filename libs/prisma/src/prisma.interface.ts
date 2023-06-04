export interface DBOption {
  type?: 'mysql' | 'postgresql';
  user?: string;
  password?: string;
  host?: string;
  port?: number;
  database?: string;
  inject?: string[];
}

export type OrderBy = {
  updated_at?: never;
  created_at?: never;
};

export type PaginationParam = {
  current?: number;
  pageSize?: number;
  createAt?: string;
  updatedAt?: string;
};
