import { resource } from "fict/plus";
import type { Resources } from "./types";

const DEFAULT_DATA_PROVIDER = "https://jsonplaceholder.typicode.com";

export const getList = resource<
  Resources[keyof Resources][],
  {
    resource: keyof Resources;
  }
>({
  key: ({ resource }: { resource: keyof Resources }) => resource,
  suspense: true,
  fetch: async (
    { signal },
    {
      resource,
    }: {
      resource: keyof Resources;
    },
  ) => {
    const response = await fetch(`${DEFAULT_DATA_PROVIDER}/${resource}`, {
      signal,
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${resource}`);
    }
    return response.json();
  },
});

export const getOne = resource<
  Resources[keyof Resources],
  { resource: keyof Resources; id: number }
>({
  key: ({ resource, id }: { resource: keyof Resources; id: number }) =>
    `${resource}/${id}`,
  suspense: true,
  fetch: async (
    { signal },
    {
      resource,
      id,
    }: {
      resource: keyof Resources;
      id: number;
    },
  ) => {
    const response = await fetch(`${DEFAULT_DATA_PROVIDER}/${resource}/${id}`, {
      signal,
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${resource} with id ${id}`);
    }
    return response.json();
  },
});
