export type Patent = {
  patentId: string;
  name: string;
  patentTitle: PatentTitle[]
  patentAbstract: PatentAbstract[]
}

export type PatentTitle = {
  _hash_id: string;
  lang: string;
  text: string;
}

export type PatentAbstract = {
  _hash_id: string;
  lang: string;
  text: string;
}


