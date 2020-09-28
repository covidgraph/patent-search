export type Patent = {
  id: string;
  name: string;
  patentTitle: PatentTitle[]
}

export type PatentTitle = {
  _hash_id: string;
  lang: string;
  text: string;
}

