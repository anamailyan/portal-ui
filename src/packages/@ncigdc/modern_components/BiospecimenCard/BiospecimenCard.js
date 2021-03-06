// @flow

import React from 'react';
import _ from 'lodash';

import SearchIcon from 'react-icons/lib/fa/search';
import { compose, withState, branch, renderComponent } from 'recompose';
import { connect } from 'react-redux';
import { humanify } from '@ncigdc/utils/string';
import { makeFilter } from '@ncigdc/utils/filters';
import Card from '@ncigdc/uikit/Card';
import { Row, Column } from '@ncigdc/uikit/Flex';
import Input from '@ncigdc/uikit/Form/Input';
import EntityPageVerticalTable from '@ncigdc/components/EntityPageVerticalTable';
import Hidden from '@ncigdc/components/Hidden';
import { withTheme } from '@ncigdc/theme';
import { visualizingButton } from '@ncigdc/theme/mixins';
import Button from '@ncigdc/uikit/Button';
import Emitter from '@ncigdc/utils/emitter';
import BioTreeView from './BioTreeView';
import { search, idFields, formatValue } from './utils';
import ImageViewerLink from '@ncigdc/components/Links/ImageViewerLink';
import { iconButton } from '@ncigdc/theme/mixins';
import { Tooltip } from '@ncigdc/uikit/Tooltip';
import { MicroscopeIcon } from '@ncigdc/theme/icons';
import { entityTypes } from './';
import withRouter from '@ncigdc/utils/withRouter';
import { DISPLAY_SLIDES } from '@ncigdc/utils/constants';
import DownloadBiospecimenDropdown from '@ncigdc/modern_components/DownloadBiospecimenDropdown';
import timestamp from '@ncigdc/utils/timestamp';
import EntityPageHorizontalTable from '@ncigdc/components/EntityPageHorizontalTable';
import AddToCartButtonSingle from '@ncigdc/components/AddToCartButtonSingle';
import DownloadFile from '@ncigdc/components/DownloadFile';

const styles = {
  searchIcon: theme => ({
    backgroundColor: theme.greyScale5,
    color: theme.greyScale2,
    padding: '0.8rem',
    width: '3.4rem',
    height: '3.4rem',
    borderRadius: '4px 0 0 4px',
    border: `1px solid ${theme.greyScale4}`,
    borderRight: 'none',
  }),
  common: theme => ({
    backgroundColor: 'transparent',
    color: theme.greyScale2,
    justifyContent: 'flex-start',
    ':hover': {
      backgroundColor: theme.greyScale6,
    },
  }),
  downloadButton: theme => ({
    ...styles.common(theme),
    padding: '3px 5px',
    border: `1px solid ${theme.greyScale4}`,
  }),
};

const getType = node =>
  (entityTypes.find(type => node[`${type.s}_id`]) || { s: null }).s;

export default compose(
  withRouter,
  branch(
    ({ viewer }) => !viewer.repository.cases.hits.edges[0],
    renderComponent(() => <div>No case found.</div>),
  ),
  branch(
    ({ viewer }) =>
      !viewer.repository.cases.hits.edges[0].node.samples.hits.edges.length,
    renderComponent(() => <div>No biospecimen data found.</div>),
  ),
  connect(state => state.cart),
  withState('allExpanded', 'setAllExpanded', false),
  withState('expandAllFirstClick', 'setExpandAllFirstClick', true),
  withState(
    'state',
    'setState',
    ({ viewer: { repository: { cases: { hits: { edges } } } }, bioId }) => {
      const p = edges[0].node;
      const selectedEntity = p.samples.hits.edges[0].node;
      return {
        selectedEntity,
        type: getType(selectedEntity),
        query: bioId || '',
      };
    },
  ),
  withTheme,
)(
  ({
    history,
    push,
    theme,
    viewer: { repository: { cases: { hits: { edges } } } },
    state: { selectedEntity: se, type, query },
    setState,
    setAllExpanded,
    allExpanded,
    expandAllFirstClick,
    setExpandAllFirstClick,
    inactiveText,
  }) => {
    const p = edges[0].node;
    const caseFilter = makeFilter([
      { field: 'cases.case_id', value: [p.case_id] },
    ]);

    const founds = p.samples.hits.edges.map(e => search(query, e));
    const flattened = _.flatten(founds);
    const foundNode = ((flattened || [])[0] || { node: {} }).node;
    const selectedNode = (query && foundNode) || se;
    const foundType = (query && getType(foundNode)) || type;
    const selectedEntity = Object.keys(selectedNode).length
      ? selectedNode
      : p.samples.hits.edges[0].node;
    const {
      files: { hits: { edges: supplementalFiles = [] } },
    } = edges[0].node;
    const withTrimmedSubIds = supplementalFiles.map(({ node }) => ({
      ...node,
      submitter_id: _.trimEnd(node.submitter_id, '_slide_image'),
    }));
    const selectedSlide = _.find(withTrimmedSubIds, {
      submitter_id: selectedEntity.submitter_id,
    });
    return (
      <Card
        className="test-biospecimen-card"
        style={{ flex: 1 }}
        title={
          <Row style={{ justifyContent: 'space-between' }}>
            <span>Biospecimen</span>
            <DownloadBiospecimenDropdown
              jsonFilename={`biospecimen.case-${p.submitter_id}-${p.project
                .project_id}.${timestamp()}.json`}
              tsvFilename={`biospecimen.case-${p.submitter_id}-${p.project
                .project_id}.${timestamp()}.tar.gz`}
              filters={caseFilter}
              buttonStyles={visualizingButton}
              inactiveText={'Download'}
              total={edges.length}
            />
          </Row>
        }
      >
        <Row>
          <Column flex="3" style={{ padding: '0 15px' }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Row style={{ width: '70%' }}>
                <label htmlFor="search-biospecimen">
                  <SearchIcon style={styles.searchIcon(theme)} />
                  <Hidden>Search</Hidden>
                </label>
                <Input
                  id="search-biospecimen"
                  name="search-biospecimen"
                  onChange={({ target }) =>
                    setState(s => ({ ...s, query: target.value }))}
                  placeholder="Search"
                  value={query}
                  style={{ borderRadius: '0 4px 4px 0' }}
                />
              </Row>
              <Button
                style={{
                  paddingLeft: '10px',
                }}
                onClick={() => {
                  Emitter.emit('expand', !allExpanded);
                  setExpandAllFirstClick(false);
                  setAllExpanded(!allExpanded);
                }}
              >
                {allExpanded ? 'Collapse All' : 'Expand All'}
              </Button>
            </Row>

            <Column style={{ padding: '10px' }}>
              <BioTreeView
                entities={{ ...p.samples, expanded: expandAllFirstClick }}
                type={{ s: 'sample', p: 'samples' }}
                query={query}
                selectedEntity={selectedEntity}
                selectEntity={(selectedEntity, type) => {
                  setState(s => ({
                    ...s,
                    selectedEntity,
                    type: type.s,
                    query: '',
                  }));
                  push({
                    ...history.location,
                    query: {
                      ...history.location.query,
                      bioId: selectedEntity[`${type.s}_id`],
                    },
                  });
                }}
                defaultExpanded={allExpanded}
              />
            </Column>
          </Column>
          <Column flex="4">
            <EntityPageVerticalTable
              thToTd={[
                { th: `${foundType} ID`, td: selectedEntity.submitter_id },
                {
                  th: `${foundType} UUID`,
                  td: selectedEntity[idFields.find(id => selectedEntity[id])],
                },
                ...Object.entries(selectedEntity)
                  .filter(
                    ([key]) =>
                      ![
                        'submitter_id',
                        'expanded',
                        `${foundType}_id`,
                        '__dataID__',
                      ].includes(key),
                  )
                  .map(([key, val]) => {
                    if (
                      ['portions', 'aliquots', 'analytes', 'slides'].includes(
                        key,
                      )
                    ) {
                      return {
                        th: humanify({ term: key }),
                        td: formatValue(val.hits.total),
                      };
                    }
                    return {
                      th: humanify({ term: key }),
                      td: formatValue(val),
                    };
                  }),
                ...(DISPLAY_SLIDES &&
                  foundType === 'slide' &&
                  !!selectedSlide && [
                    {
                      th: 'Slide Image',
                      td: (
                        <Row>
                          <Tooltip Component="View Slide Image">
                            <ImageViewerLink
                              isIcon
                              query={{
                                filters: makeFilter([
                                  { field: 'cases.case_id', value: p.case_id },
                                ]),
                                selectedId: selectedSlide.file_id,
                              }}
                            >
                              <MicroscopeIcon
                                aria-label={'View slide image'}
                                style={{ maxWidth: '20px' }}
                              />
                            </ImageViewerLink>
                          </Tooltip>
                          <Tooltip Component="Add to cart">
                            <AddToCartButtonSingle
                              style={{
                                ...iconButton,
                                marginLeft: '0.5rem',
                                marginRight: '0.5rem',
                                border: 'none',
                                paddingLeft: '2px',
                                paddingBottom: '5px',
                              }}
                              file={selectedSlide}
                              asIcon
                            />
                          </Tooltip>
                          <Tooltip Component="Download">
                            <DownloadFile
                              style={{ ...iconButton, marginLeft: '0.5rem' }}
                              file={selectedSlide}
                              activeText={''}
                              inactiveText={''}
                            />
                          </Tooltip>
                        </Row>
                      ),
                    },
                  ]),
              ]}
              style={{ flex: '1 1 auto' }}
            />
          </Column>
        </Row>
        {supplementalFiles.length > 0 && (
          <div
            style={{
              padding: '2px 10px 10px 10px',
              borderTop: `1px solid ${theme.greyScale5}`,
              marginTop: '10px',
            }}
          >
            <EntityPageHorizontalTable
              title={'Biospecimen Supplement File'}
              titleStyle={{ fontSize: '1em' }}
              className="biospecimen-supplement-file-table"
              headings={[
                { key: 'file_name', title: 'Filename' },
                { key: 'data_format', title: 'Data format' },
                { key: 'file_size', title: 'Size' },
                { key: 'action', title: 'Action' },
              ]}
              data={supplementalFiles.map((f, i) => {
                const fileData = {
                  ...f.node,
                  projects: [p.projectId],
                };
                return {
                  file_name: (
                    <span key="filename">
                      {f.node.access === 'open' && (
                        <i className="fa fa-unlock-alt" />
                      )}
                      {f.node.access === 'controlled' && (
                        <i className="fa fa-lock" />
                      )}{' '}
                      {f.node.file_name}
                    </span>
                  ),
                  data_format: f.node.data_format,
                  file_size: f.node.file_size,
                  action: (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                      }}
                    >
                      <span key="add_to_cart" style={{ paddingRight: '10px' }}>
                        <AddToCartButtonSingle file={fileData} />
                      </span>
                      <span style={{ paddingRight: '10px' }}>
                        <DownloadFile
                          style={{
                            ...styles.downloadButton(theme),
                            backgroundColor: 'white',
                          }}
                          file={f.node}
                          activeText={''}
                          inactiveText={''}
                        />
                      </span>
                    </div>
                  ),
                };
              })}
            />
          </div>
        )}
      </Card>
    );
  },
);
