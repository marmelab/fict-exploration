type WithId = { id: number };

type EnforceId<T extends Record<string, WithId>> = T;

export type Resources = EnforceId<{
  posts: {
    userId: number;
    id: number;
    title: string;
    body: string;
  };
  comments: {
    postId: number;
    id: number;
    name: string;
    email: string;
    body: string;
  };
  todos: {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
  };
  users: {
    id: number;
    name: string;
    username: string;
    email: string;
    address: {
      street: string;
      suite: string;
      city: string;
      zipcode: string;
      geo: {
        lat: string;
        lng: string;
      };
    };
    phone: string;
    website: string;
    company: {
      name: string;
      catchPhrase: string;
      bs: string;
    };
  };
  albums: {
    userId: number;
    id: number;
    title: string;
  };
  photos: {
    albumId: number;
    id: number;
    title: string;
    url: string;
    thumbnailUrl: string;
  };
}>;
