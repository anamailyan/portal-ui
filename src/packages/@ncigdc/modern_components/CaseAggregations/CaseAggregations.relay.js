// @flow

import React from 'react';
import { graphql } from 'react-relay';
import { compose, withPropsOnChange } from 'recompose';
import { connect } from 'react-redux';
import { parse } from 'query-string';
import Query from '@ncigdc/modern_components/Query';
import { parseFilterParam } from '@ncigdc/utils/uri';
import withRouter from '@ncigdc/utils/withRouter';

const entityType = 'RepositoryCases';
export default (Component: ReactClass<*>) =>
  compose(
    withRouter,
    withPropsOnChange(
      ['location'],
      ({ location: { search }, defaultFilters = null }) => {
        const q = parse(search);
        const filters = parseFilterParam(q.filters, defaultFilters);
        return {
          filters,
        };
      },
    ),
    connect((state, props) => ({
      userSelectedFacets: state.customFacets[entityType],
    })),
    withPropsOnChange(
      ['userSelectedFacets', 'filters'],
      ({ userSelectedFacets, filters }) => {
        return {
          variables: {
            filters,
            repoCaseCustomFacetFields: userSelectedFacets
              .map(({ field }) => field)
              .join(','),
          },
        };
      },
    ),
  )((props: Object) => {
    return (
      <Query
        parentProps={props}
        minHeight={578}
        variables={props.variables}
        Component={Component}
        query={graphql`
          query CaseAggregations_relayQuery(
            $filters: FiltersArgument
            $repoCaseCustomFacetFields: [String]!
          ) {
            viewer {
              repository {
                cases {
                  facets(facets: $repoCaseCustomFacetFields)
                  aggregations(
                    filters: $filters
                    aggregations_filter_themselves: false
                  ) {
                    primary_site {
                      buckets {
                        doc_count
                        key
                      }
                    }
                    project__program__name {
                      buckets {
                        doc_count
                        key
                      }
                    }
                    project__project_id {
                      buckets {
                        doc_count
                        key
                      }
                    }
                    metadata_participant__age_2012 {
                      buckets {
                        doc_count
                        key
                      }
                    }
                    metadata_participant__totMETs1 {
                      buckets {
                        doc_count
                        key
                      }
                    }
                    metadata_participant__weight_lbs {
                      buckets {
                        doc_count
                        key
                      }
                    }
                  }
                }
              }
            }
          }
        `}
      />
    );
  });
