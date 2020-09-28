import React from 'react'
import { withStyles, createStyles, Theme } from '@material-ui/core/styles'
import {
  Table,
  TableBody,
  TableCell,
  SortDirection,
  TableHead,
  TableRow,
  Tooltip,
  Paper,
  TableSortLabel,
  TextField,
} from '@material-ui/core'
import { useQuery, gql } from '@apollo/client';

import Title from './Title'
import { Patent, PatentTitle, PatentAbstract, Fragment, GeneSymbol } from '../types';

const styles = (theme: Theme) => createStyles({
  root: {
    maxWidth: 700,
    marginTop: theme.spacing(3),
    overflowX: 'auto',
    margin: 'auto',
  },
  table: {
    minWidth: 700,
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    minWidth: 300,
  },
})

const GET_PATENT = gql`
  query patentPaginateQuery(
    $first: Int
    $offset: Int
    $orderBy: [_PatentOrdering]
    $filter: _PatentFilter
  ) {
    Patent(first: $first, offset: $offset, orderBy: $orderBy, filter: $filter) {
      patentId
      name
      patentTitle{
        text
        lang
        fragments{
          _hash_id
          mentions{
            sid
          }
        }
      }
      patentAbstract{
        text
        lang
      }
    }
  }
`

function PatentList(props: any) {
  const { classes } = props
  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc')
  const [orderBy, setOrderBy] = React.useState('name')
  const [page] = React.useState(0)
  const [rowsPerPage] = React.useState(10)
  const [filterState, setFilterState] = React.useState({ searchTermFilter: '' })

  const getFilter = () => {
    if (filterState.searchTermFilter.length > 0) {
      return {
        OR: [
          { patentTitle_some: { text_contains: filterState.searchTermFilter } },
          { patentAbstract_some: { text_contains: filterState.searchTermFilter } }
        ]
      }
    }
    return {};
  }

  const { loading, data, error } = useQuery(GET_PATENT, {
    variables: {
      first: rowsPerPage,
      offset: rowsPerPage * page,
      orderBy: orderBy + '_' + order,
      filter: getFilter(),
    },
  })

  const handleSortRequest = (property: any) => {
    const newOrderBy = property
    let newOrder: SortDirection = 'desc'

    if (orderBy === property && order === 'desc') {
      newOrder = 'asc'
    }

    setOrder(newOrder)
    setOrderBy(newOrderBy)
  }

  const handleFilterChange = (filterName: any) => (event: any) => {
    const val = event.target.value

    setFilterState((oldFilterState) => ({
      ...oldFilterState,
      [filterName]: val,
    }))
  }

  return (
    <Paper className={classes.root}>
      <Title>Patent List</Title>
      <TextField
        id="search"
        label="Search"
        className={classes.textField}
        value={filterState.searchTermFilter}
        onChange={handleFilterChange('searchTermFilter')}
        margin="normal"
        variant="outlined"
        type="text"
        InputProps={{
          className: classes.input,
        }}
      />
      {loading && !error && <p>Loading...</p>}
      {error && !loading && <p>Error</p>}
      {data && !loading && !error && (
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell
                key="id"
                sortDirection={orderBy === 'patentId' ? order : false}
              >
                <Tooltip title="Sort" placement="bottom-start" enterDelay={300}>
                  <TableSortLabel
                    active={orderBy === 'patentId'}
                    direction={order}
                    onClick={() => handleSortRequest('patentId')}
                  >
                    ID
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
              <TableCell
                key="title"
                sortDirection={orderBy === 'lang' ? order : false}
              >
                <div>Title</div>
              </TableCell>
              <TableCell
                key="abstract"
                sortDirection={orderBy === 'lang' ? order : false}
              >
                <div>Abstract</div>
              </TableCell>
              <TableCell
                key="gene_symbols"
              >
                <div>Gene Symbols</div>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.Patent.map((n: Patent) => {
              return (
                <TableRow key={n.patentId}>
                  <TableCell component="th" scope="row">
                    {n.patentId}
                  </TableCell>
                  <TableCell>
                    {n.patentTitle.map((title: PatentTitle, i: number) => {
                      return <div key={i}>
                        {title.lang}: {title.text}
                      </div>
                    })}
                  </TableCell>
                  <TableCell>
                    {n.patentAbstract.map((title: PatentAbstract, i: number) => {
                      return <div key={i}>
                        {title.lang}: {title.text}
                      </div>
                    })}
                  </TableCell>
                  <TableCell>
                    {n.patentTitle.map((title: PatentTitle, i: number) => {
                      return title.fragments.map((fragment: Fragment, j: number) => {
                        return fragment.mentions.map((geneSymbol: GeneSymbol, k: number) => {
                          return <div key={i + "-" + j + "-" + k}>
                            {geneSymbol.sid}
                          </div>
                        })
                      })
                    })
                    }
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )
      }
    </Paper >
  )
}

export default withStyles(styles)(PatentList)
