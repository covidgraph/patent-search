const fs = require('fs').promises
var crypto = require('crypto')
const parse = require('csv-parse/lib/sync')
const { gql } = require('@apollo/client')

export const getSeedMutations = async () => {
  const content = await fs.readFile(`seed-data/seed.csv`)
  const records = parse(content, { columns: true })
  const mutations = generateMutations(records)
  return mutations
}

const generateMutations = (records) => {
  return records.map((rec) => {
    let md5sum = crypto.createHash('md5')
    rec['patentTitleId'] = md5sum
      .update(rec.patentId + '-' + rec.patentTitle + '-' + rec.patentTitleLang)
      .digest('hex')
    rec['patentTitleFragmentId'] = rec['patentTitleId']

    md5sum = crypto.createHash('md5')
    rec['patentAbstractId'] = md5sum
      .update(
        rec.patentId +
          '-' +
          rec.patentAbstractText +
          '-' +
          rec.patentAbstractLang
      )
      .digest('hex')

    return {
      mutation: gql`
        mutation mergePatent(
          $patentId: String!
          $patentTitleId: String!
          $patentTitle: String!
          $patentTitleLang: String
          $patentAbstractId: String!
          $patentAbstractText: String
          $patentAbstractLang: String
          $patentTitleFragmentId: String!
          $geneSymbol: String!
        ) {
          patent: MergePatent(patentId: $patentId, name: $patentTitle) {
            _id
            patentId
          }

          patentTitle: MergePatentTitle(
            _hash_id: $patentTitleId
            lang: $patentTitleLang
            text: $patentTitle
          ) {
            _id
            _hash_id
          }

          patentTitlePatent: MergePatentTitlePatents(
            from: { patentId: $patentId }
            to: { _hash_id: $patentTitleId }
          ) {
            from {
              patentId
            }
          }

          patentAbstract: MergePatentAbstract(
            _hash_id: $patentAbstractId
            lang: $patentAbstractLang
            text: $patentAbstractText
          ) {
            _id
            _hash_id
          }

          patentAbstractPatent: MergePatentAbstractPatents(
            from: { patentId: $patentId }
            to: { _hash_id: $patentAbstractId }
          ) {
            from {
              patentId
            }
          }

          fragment: MergeFragment(
            _hash_id: $patentTitleFragmentId
            dummy_field: $patentTitleFragmentId
          ) {
            _id
            _hash_id
          }

          fragmentPatentTitle: MergePatentTitleFragments(
            from: { _hash_id: $patentTitleId }
            to: { _hash_id: $patentTitleFragmentId }
          ) {
            from {
              _hash_id
            }
          }

          geneSymbol: MergeGeneSymbol(
            sid: $geneSymbol
            dummy_field: $geneSymbol
          ) {
            sid
          }

          fragmentMentions: MergeFragmentMentions(
            from: { _hash_id: $patentTitleFragmentId }
            to: { sid: $geneSymbol }
          ) {
            from {
              _hash_id
            }
          }
        }
      `,
      variables: rec,
    }
  })
}
