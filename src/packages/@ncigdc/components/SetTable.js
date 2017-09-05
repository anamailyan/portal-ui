// @flow
import React from 'react';
import { connect } from 'react-redux';
import { withProps, compose } from 'recompose';

import EntityPageHorizontalTable from '@ncigdc/components/EntityPageHorizontalTable';
import countComponents from '@ncigdc/modern_components/Counts';
import withPropsOnChange from '@ncigdc/utils/withPropsOnChange';

type TProps = {
  sets: {},
  setSelected: Function,
  selected: string,
  type: string,
  field: string,
};

const enhance = compose(
  connect(({ sets }) => ({ sets })),
  withProps(({ sets, type }) => ({ sets: sets[type] || {} })),
  withPropsOnChange(['sets'], ({ sets, selected, setSelected }) => {
    const setKeys = Object.keys(sets);
    if (!selected && setKeys.length === 1) {
      setSelected(setKeys[0]);
    }
  }),
);

const SetTable = ({ sets, setSelected, selected, type, field }: TProps) => {
  const CountComponent = countComponents[type];

  return (
    <EntityPageHorizontalTable
      data={Object.keys(sets).map((key, i) => {
        const id = `set-table-${key}-select`;

        return {
          select: (
            <input
              style={{ marginLeft: 3 }}
              autoFocus={i === 0}
              id={id}
              type="radio"
              value={key}
              onChange={e => setSelected(e.target.value)}
              checked={key === selected}
            />
          ),
          name: <label htmlFor={id}>{sets[key]}</label>,
          count: (
            <CountComponent
              filters={{
                op: '=',
                content: {
                  field,
                  value: `set_id:${key}`,
                },
              }}
            />
          ),
        };
      })}
      headings={[
        { key: 'select', title: ' ' },
        { key: 'name', title: 'Name' },
        { key: 'count', title: 'Items', style: { textAlign: 'right' } },
      ]}
    />
  );
};

export default enhance(SetTable);