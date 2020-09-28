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
    const md5sum = crypto.createHash('md5')
    rec['patentTitleId'] = md5sum
      .update(
        rec.patentTitleId + '-' + rec.patentTitle + '-' + rec.patentTitleLang
      )
      .digest('hex')

    return {
      mutation: gql`
        mutation mergePatent(
          $patentId: String!
          $patentTitleId: String!
          $patentTitle: String!
          $patentTitleLang: String
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
        }
      `,
      variables: rec,
    }
  })
}
