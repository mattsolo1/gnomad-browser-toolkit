import React from 'react'
import styled from 'styled-components'
import { useTable, useFilters, useGlobalFilter, useAsyncDebounce } from 'react-table'
// A great library for fuzzy filtering/sorting items
import matchSorter from 'match-sorter'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import data from '../data/200819_pan_ancestry_manifest.json'

import CloudDownloadIcon from '@material-ui/icons/CloudDownload'
import FileCopyIcon from '@material-ui/icons/FileCopy'

import uniqBy from 'lodash/uniqBy'
import groupBy from 'lodash/groupBy'

// import {  ClassificationType, useAdditivePredicates, useClassificationSelectorState } from ;

import ClassificationViewer, {
  useInternalState,
  ClassificationType
} from '@gnomad/classification-selector'

console.log(data)

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`

// Define a default UI for filtering
function GlobalFilter({ preGlobalFilteredRows, globalFilter, setGlobalFilter }) {
  const count = preGlobalFilteredRows.length
  const [value, setValue] = React.useState(globalFilter)
  const onChange = useAsyncDebounce(value => {
    setGlobalFilter(value || undefined)
  }, 200)

  return (
    <span>
      Search:{' '}
      <input
        value={value || ''}
        onChange={e => {
          setValue(e.target.value)
          onChange(e.target.value)
        }}
        placeholder={`${count} records...`}
        style={{
          fontSize: '1.1rem',
          border: '0'
        }}
      />
    </span>
  )
}

// Define a default UI for filtering
function DefaultColumnFilter({ column: { filterValue, preFilteredRows, setFilter } }) {
  const count = preFilteredRows.length

  return (
    <input
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  )
}

// This is a custom filter UI for selecting
// a unique option from a list
function SelectColumnFilter({ column: { filterValue, setFilter, preFilteredRows, id } }) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set()
    preFilteredRows.forEach(row => {
      options.add(row.values[id])
    })
    return [...options.values()]
  }, [id, preFilteredRows])

  // Render a multi-select box
  return (
    <select
      value={filterValue}
      onChange={e => {
        setFilter(e.target.value || undefined)
      }}
    >
      <option value="">All</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

// This is a custom filter UI that uses a
// slider to set the filter value between a column's
// min and max values
function SliderColumnFilter({ column: { filterValue, setFilter, preFilteredRows, id } }) {
  // Calculate the min and max
  // using the preFilteredRows

  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    preFilteredRows.forEach(row => {
      min = Math.min(row.values[id], min)
      max = Math.max(row.values[id], max)
    })
    return [min, max]
  }, [id, preFilteredRows])

  return (
    <>
      <input
        type="range"
        min={min}
        max={max}
        value={filterValue || min}
        onChange={e => {
          setFilter(parseInt(e.target.value, 10))
        }}
      />
      <button onClick={() => setFilter(undefined)}>Off</button>
    </>
  )
}

// This is a custom UI for our 'between' or number range
// filter. It uses two number boxes and filters rows to
// ones that have values between the two
function NumberRangeColumnFilter({ column: { filterValue = [], preFilteredRows, setFilter, id } }) {
  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    preFilteredRows.forEach(row => {
      min = Math.min(row.values[id], min)
      max = Math.max(row.values[id], max)
    })
    return [min, max]
  }, [id, preFilteredRows])

  return (
    <div
      style={{
        display: 'flex'
      }}
    >
      <input
        value={filterValue[0] || ''}
        type="number"
        onChange={e => {
          const val = e.target.value
          setFilter((old = []) => [val ? parseInt(val, 10) : undefined, old[1]])
        }}
        placeholder={`Min (${min})`}
        style={{
          width: '70px',
          marginRight: '0.5rem'
        }}
      />
      to
      <input
        value={filterValue[1] || ''}
        type="number"
        onChange={e => {
          const val = e.target.value
          setFilter((old = []) => [old[0], val ? parseInt(val, 10) : undefined])
        }}
        placeholder={`Max (${max})`}
        style={{
          width: '70px',
          marginLeft: '0.5rem'
        }}
      />
    </div>
  )
}

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [row => row.values[id]] })
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = val => !val

// Our table component
function Table({ columns, data }) {
  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      fuzzyText: fuzzyTextFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => {
        return rows.filter(row => {
          const rowValue = row.values[id]
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true
        })
      }
    }),
    []
  )

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter
    }),
    []
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    visibleColumns,
    preGlobalFilteredRows,
    setGlobalFilter
  } = useTable(
    {
      columns,
      data,
      defaultColumn, // Be sure to pass the defaultColumn option
      filterTypes
    },
    useFilters, // useFilters!
    useGlobalFilter // useGlobalFilter!
  )

  // We don't want to render all of the rows for this example, so cap
  // it for this use case
  const firstPageRows = rows.slice(0, 30)

  return (
    <>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>
                  {column.render('Header')}
                  {/* Render the columns filter UI */}
                  <div>{column.canFilter ? column.render('Filter') : null}</div>
                </th>
              ))}
            </tr>
          ))}
          <tr>
            <th
              colSpan={visibleColumns.length}
              style={{
                textAlign: 'left'
              }}
            >
              <GlobalFilter
                preGlobalFilteredRows={preGlobalFilteredRows}
                globalFilter={state.globalFilter}
                setGlobalFilter={setGlobalFilter}
              />
            </th>
          </tr>
        </thead>
        <tbody {...getTableBodyProps()}>
          {firstPageRows.map((row, i) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <br />
      <div>Showing the first 20 results of {rows.length} rows</div>
      <div>
        <pre>
          <code>{JSON.stringify(state.filters, null, 2)}</code>
        </pre>
      </div>
    </>
  )
}

// Define a custom filter filter function!
function filterGreaterThan(rows, id, filterValue) {
  return rows.filter(row => {
    const rowValue = row.values[id]
    return rowValue >= filterValue
  })
}

// This is an autoRemove method on the filter function that
// when given the new filter value and returns true, the filter
// will be automatically removed. Normally this is just an undefined
// check, but here, we want to remove the filter if it's not a number
filterGreaterThan.autoRemove = val => typeof val !== 'number'

const pops = ['AFR', 'AMR', 'CSA', 'EAS', 'EUR', 'MID']

const Downloads = styled.div`
  display: flex;
  flex-direction: row;
`

const Download = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 10px;
`

function getRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function App() {

  const [visibleColumns, setVisibleColumns] = React.useState({
    analysis: true,
    description: true,
    lambda: false,
    saigeHeritability: false,
    nCases: false,
    nControls: false,
    downloads: true
  })

  // const groupedByTraitType = groupBy(data, ({ trait_type }) => trait_type)
  // const traitTypeCategories = Object.values(groupedByTraitType).map(phenotypesInGroup => {
  //   const [firstPhenotype] = phenotypesInGroup
  //   return {
  //     name: firstPhenotype.trait_type,
  //     itemCount: phenotypesInGroup.length,
  //     color: getRandomColor()
  //   }
  // })

  // const classifications = [
  //   {
  //     name: 'Trait types',
  //     type: ClassificationType.Simple,
  //     categories: traitTypeCategories,
  //     getCategoryValueOfItem: ({ trait_type }) => trait_type
  //   }
  // ]

  // console.log(classifications)

  // const {
  //   filteredItems,
  //   selected,
  //   setSelected,
  //   hierarchicalLevels,
  //   setHierarchicalLevel
  // } = useInternalState({ data, classifications })

  const handleChange = event => {
    setVisibleColumns({ ...visibleColumns, [event.target.name]: event.target.checked })
  }

  const columns = React.useMemo(
    () => [
      {
        Header: 'Analysis',
        columns: [
          {
            Header: 'Coding',
            accessor: 'coding',
            Filter: ''
          },
          {
            Header: 'Phenocode',
            accessor: 'phenocode',
            filter: 'fuzzyText'
          },
          {
            Header: 'Trait type',
            accessor: 'trait_type',
            Filter: SelectColumnFilter
          },
          {
            Header: 'Sex',
            accessor: 'pheno_sex',
            Filter: SelectColumnFilter
          }
        ]
      }
    ],
    [visibleColumns]
  )

  if (visibleColumns.description) {
    columns.push({
      Header: 'Description',
      columns: [
        {
          Header: 'Description',
          accessor: 'description'
        },
        {
          Header: 'More',
          accessor: 'description_more'
        },
        {
          Header: 'Category',
          accessor: 'category'
        },
        {
          Header: 'N Pops',
          accessor: 'num_pops',
          Filter: SliderColumnFilter
        },
        {
          Header: 'Populations',
          accessor: 'pops'
        }
      ]
    })
  }

  if (visibleColumns.lambda) {
    columns.push({
      Header: 'Lambda GC',
      columns: pops.map(pop => ({
        Header: pop,
        accessor: `lambda_gc_${pop}`,
        Filter: SliderColumnFilter
      }))
    })
  }

  if (visibleColumns.saigeHeritability) {
    columns.push({
      Header: 'Saige heritability',
      columns: pops.map(pop => ({
        Header: pop,
        accessor: `saige_heritability_${pop}`,
        Filter: SliderColumnFilter
      }))
    })
  }

  if (visibleColumns.nCases) {
    columns.push({
      Header: 'N Cases',
      columns: [
        {
          Header: 'Both sexes',
          accessor: 'n_cases_full_cohort_both_sexes',
          Filter: SliderColumnFilter
        },
        {
          Header: 'Female',
          accessor: 'n_cases_full_cohort_females',
          Filter: SliderColumnFilter
        },
        {
          Header: 'Males',
          accessor: 'n_cases_full_cohort_males',
          Filter: SliderColumnFilter
        },
        ...pops.map(pop => ({
          Header: pop,
          accessor: `n_cases_${pop}`,
          Filter: SliderColumnFilter
        }))
      ]
    })
  }

  if (visibleColumns.nControls) {
    columns.push({
      Header: 'N Controls',
      columns: pops.map(pop => ({
        Header: pop,
        accessor: `n_controls_${pop}`,
        Filter: SliderColumnFilter
      }))
    })
  }

  if (visibleColumns.downloads) {
    columns.push({
      Header: 'Downloads',
      columns: [
        {
          Header: 'Filename',
          accessor: 'filename',
          Cell: ({ cell, row }) => {
            // return <p>{cell.value} {row.cells.value}</p>
            return (
              <Downloads>
                <Download>
                  <CloudDownloadIcon />
                  <a>tsv{'   '}</a>
                </Download>

                <Download>
                  <CloudDownloadIcon />
                  <a>tbi</a>
                </Download>
                <Download>
                  <FileCopyIcon />
                  <a>curl</a>
                </Download>
              </Downloads>
            )
          }
        },
        {
          Header: 'MD5 tsv',
          accessor: 'md5_hex'
        },
        {
          Header: 'MD5 tabix',
          accessor: 'md5_hex_tabix'
        }
      ]
    })
  }

  return (
    <Styles>
      {/*<ClassificationViewer
        classifications={classifications}
        selected={selected}
        setSelected={setSelected}
        hierarchicalLevels={hierarchicalLevels}
        setHierarchicalLevel={setHierarchicalLevel}
      />*/}
      <FormControlLabel
        control={
          <Checkbox
            checked={visibleColumns.description}
            onChange={handleChange}
            name="description"
            color="primary"
          />
        }
        label="Metadata"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={visibleColumns.nCases}
            onChange={handleChange}
            name="nCases"
            color="primary"
          />
        }
        label="N Cases"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={visibleColumns.nControls}
            onChange={handleChange}
            name="nControls"
            color="primary"
          />
        }
        label="N Controls"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={visibleColumns.saigeHeritability}
            onChange={handleChange}
            name="saigeHeritability"
            color="primary"
          />
        }
        label="Saige heritability"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={visibleColumns.lambda}
            onChange={handleChange}
            name="lambda"
            color="primary"
          />
        }
        label="Lambda GC"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={visibleColumns.downloads}
            onChange={handleChange}
            name="downloads"
            color="primary"
          />
        }
        label="Downloads"
      />
      <Table columns={columns} data={data} />
    </Styles>
  )
}

export default App
