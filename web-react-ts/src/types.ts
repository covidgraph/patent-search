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
  fragments: Fragment[];
}

export type PatentAbstract = {
  _hash_id: string;
  lang: string;
  text: string;
}

export type Fragment = {
  mentions: GeneSymbol[];
}

export type GeneSymbol = {
  sid: string;
}
