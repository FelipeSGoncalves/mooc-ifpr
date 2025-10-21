import { NextResponse } from 'next/server';
import { PagedResult } from './types';

export const jsonResponse = (data: unknown, status = 200) =>
  NextResponse.json(data, { status });

export const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ message }, { status });

export const paginate = <T>(items: T[], page = 0, size = 10): PagedResult<T> => {
  const pageNumber = Number.isFinite(page) && page >= 0 ? page : 0;
  const pageSize = Number.isFinite(size) && size > 0 ? size : 10;
  const start = pageNumber * pageSize;
  const end = start + pageSize;
  const content = items.slice(start, end);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return {
    content,
    page: pageNumber,
    size: pageSize,
    totalItems,
    totalPages,
  };
};
