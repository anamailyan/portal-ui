// @flow

import React from 'react';
import { compose, withState } from 'recompose';
import { sortBy, sum, get } from 'lodash';
import withRouter from '@ncigdc/utils/withRouter';
import { Row, Column } from '@ncigdc/uikit/Flex';
import DownloadVisualizationButton from '@ncigdc/components/DownloadVisualizationButton';
import { withTheme } from '@ncigdc/theme';
import BarChart from '@ncigdc/components/Charts/BarChart';
import FilteredStackedBarChart from '@ncigdc/components/Charts/FilteredStackedBarChart';
import wrapSvg from '@ncigdc/utils/wrapSvg';
import ExploreLink from '@ncigdc/components/Links/ExploreLink';
import ProjectsLink from '@ncigdc/components/Links/ProjectsLink';
import { TGroupFilter } from '@ncigdc/utils/filters/types';

type TProps = {
  style: Object,
  filters: ?TGroupFilter,
  cases: {
    total: {
      project__project_id: {
        buckets: Array<{
          key: string,
          doc_count: number,
        }>,
      },
    },
    filtered: {
      project__project_id: {
        buckets: Array<{
          key: string,
          doc_count: number,
        }>,
      },
    },
  },
  ssms: {
    hits: {
      total: number,
    },
  },
  aggregations: Object,
  theme: Object,
  push: Function,
  ChartTitle: ReactClass<{}>,
};

const CHART_HEIGHT = 295;
const CHART_MARGINS = { top: 20, right: 50, bottom: 75, left: 55 };

export type TChartTitleProps = {
  cases: number,
  projects: Array<{ project_id: string }>,
  ssms: number,
  filters: any,
};
const DefaultChartTitle = ({
  type = 'mutations',
  cases = 0,
  projects = [],
  ssms = 0,
  filters,
}: TChartTitleProps) => (
  <div style={{ textTransform: 'uppercase', padding: '0 2rem' }}>
    <ExploreLink query={{ searchTableTab: 'cases', filters }}>
      {cases.toLocaleString()}
    </ExploreLink>&nbsp; cases affected by&nbsp;
    <ExploreLink query={{ searchTableTab: 'mutations', filters }}>
      {ssms.toLocaleString()}
    </ExploreLink>&nbsp; {type} across&nbsp;
    <ProjectsLink
      query={{
        filters: {
          op: 'and',
          content: [
            {
              op: 'in',
              content: {
                field: 'projects.project_id',
                value: projects.map(p => p.project_id),
              },
            },
          ],
        },
      }}
    >
      {projects.length.toLocaleString()}
    </ProjectsLink>&nbsp; projects
  </div>
);
const initalcnv = {
  gain: true,
  amplification: true,
  shallowLoss: true,
  deepLoss: true,
};
export default compose(
  withRouter,
  withTheme,
  withState('cnv', 'setCnv', initalcnv),
  withState('collapsed', 'setCollapsed', false),
)(
  (
    {
      viewer: { explore: { cases, ssms } },
      theme,
      push,
      ChartTitle = DefaultChartTitle,
      filters,
      style,
      cnv,
      setCnv,
      collapsed,
      setCollapsed,
      type, //mutation or cnv
    }: TProps = {},
  ) => {
    let cnvFiltered ={};
    ['amplification', 'gain', 'loss', 'deepLoss'].map(cnvType => 
      cases[cnvType].project__project_id.buckets.map(b => 
        cnvFiltered = {
          ...cnvFiltered,
          [b.key]: {
            ...cnvFiltered[b.key],
            [cnvType]: b.doc_count
          }
        }
      )
    );

    const cnvCancerDistData =  Object.keys(cnvFiltered).map(p => {
          const nums = cases.cnvTotal.project__project_id.buckets.filter(
            f => f.key === p,
          )[0].doc_count;
          return {
            deepLoss: cnvFiltered[p]['deepLoss'] || 0, 
            shallowLoss: cnvFiltered[p]['loss'] || 0, 
            gain: cnvFiltered[p]['gain'] || 0, 
            amplification: cnvFiltered[p]['amplification'] || 0, 
            project_id: p,
            num_cases_total: cases.cnvTotal.project__project_id.buckets.filter(
              f => f.key === p,
            )[0].doc_count,
          };
        });

    const chartStyles = {
      xAxis: {
        stroke: theme.greyScale4,
        textFill: theme.greyScale3,
      },
      yAxis: {
        stroke: theme.greyScale4,
        textFill: theme.greyScale3,
      },
      bars: { fill: theme.secondary },
      tooltips: {
        fill: '#fff',
        stroke: theme.greyScale4,
        textFill: theme.greyScale3,
      },
    };

    const checkers = [
      { key: 'amplification', name: 'Amplification', color: '#900000' },
      { key: 'gain', name: 'Gain', color: '#d33737' },
      { key: 'shallowLoss', name: 'Shallow Loss', color: '#0d71e8' },
      { key: 'deepLoss', name: 'Deep Loss', color: '#00457c' },
    ];
    const mutationCancerDistData = (cases.filtered || {
      project__project_id: { buckets: [] },
    }).project__project_id.buckets.map(b => {
      const totalCasesByProject = cases.total.project__project_id.buckets.filter(
        f => f.key === b.key,
      )[0].doc_count;
      return {
        freq: b.doc_count / totalCasesByProject,
        project_id: b.key,
        num_affected_cases: b.doc_count,
        num_cases_total: totalCasesByProject,
      };
    });
    const mutationChartData = sortBy(mutationCancerDistData, d => -d.freq)
      .slice(0, 20)
      .map(d => ({
        label: d.project_id,
        value: d.freq * 100,
        onClick: () => push(`/projects/${d.project_id}`),
        tooltip: (
          <span>
            {d.num_affected_cases.toLocaleString()}&nbsp;Case
            {d.num_affected_cases > 1 ? 's ' : ' '}
            Affected in <b>{d.project_id}</b>
            <br />
            {d.num_affected_cases.toLocaleString()}
            &nbsp;/&nbsp;
            {d.num_cases_total.toLocaleString()}&nbsp; ({(d.freq * 100).toFixed(2)}%)
          </span>
        ),
      }));

    const cnvChartData = sortBy(
      cnvCancerDistData,
      d =>
        -checkers.reduce(
          (acc, f) => acc + d[f.key] / d.num_cases_total * cnv[f.key],
          0,
        ),
    )
      .slice(0, 20)
      .map(d => ({
        symbol: d.project_id,
        deepLoss: d.deepLoss / d.num_cases_total * 100,
        shallowLoss: d.shallowLoss / d.num_cases_total * 100,
        gain: d.gain / d.num_cases_total * 100,
        amplification: d.amplification / d.num_cases_total * 100,
        total: d.num_cases_total,
        onClick: () => push(`/projects/${d.project_id}`),
        tooltips: checkers.reduce(
          (acc, f) => ({
            ...acc,
            [f.key]: (
              <span>
                {d[f.key].toLocaleString()}&nbsp;Case
                {d[f.key] > 1 ? 's ' : ' '}
                Affected in <b>{d.project_id}</b>
                <br />
                {d[f.key].toLocaleString()}
                &nbsp;/&nbsp;
                {d.num_cases_total.toLocaleString()}&nbsp; ({(d[f.key] / d.num_cases_total * 100).toFixed(2)}%)
              </span>
            ),
          }),
          0,
        ),
      }));
    return (
      <div>
        <Row style={{ width: '100%' }}>
          {mutationChartData.length >= 5 && (
            <span style={{ width: '50%' }}>
              <Column style={{ padding: '0 0 0 2rem' }}>
                <Row
                  style={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <ChartTitle
                    cases={sum(
                      mutationCancerDistData.map(d => d.num_affected_cases),
                    )}
                    ssms={get(ssms, 'hits.total', 0)}
                    projects={mutationCancerDistData}
                    filters={filters}
                  />
                  <DownloadVisualizationButton
                    svg={() =>
                      wrapSvg({
                        selector: '#cancer-distribution svg',
                        title: 'Cancer Distribution',
                      })}
                    data={mutationChartData.map(d => ({
                      label: d.label,
                      value: d.value,
                    }))}
                    slug="cancer-distribution-bar-chart"
                    noText
                    tooltipHTML="Download image or data"
                    style={{ marginRight: '2rem' }}
                  />
                </Row>
                <BarChart
                  margin={CHART_MARGINS}
                  data={mutationChartData}
                  yAxis={{ title: '% of Cases Affected' }}
                  height={CHART_HEIGHT}
                  styles={chartStyles}
                />
              </Column>
            </span>
          )}
          <span style={{ width: '50%' }}>
            <Column style={{ padding: '0 0 0 2rem' }}>
              <Row
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <ChartTitle
                  cases={sum(
                    cnvCancerDistData.map(
                      d => d.amplification + d.gain + d.shallowLoss + d.deepLoss,
                    ),
                  )}
                  ssms={get(ssms, 'hits.total', 0)}
                  projects={cnvCancerDistData}
                  filters={filters}
                  type="cnv"
                />
                <DownloadVisualizationButton
                  svg={() =>
                    wrapSvg({
                      selector: '.test-stacked-bar-chart svg',
                      title: 'cnv Distribution',
                    })}
                  data={cnvChartData.map(d => ({
                    symbol: d.symbol,
                    amplification: d.amplification,
                    gain: d.gain,
                    shallowLoss: d.shallowLoss,
                    deepLoss: d.deepLoss,
                    total: d.total,
                  }))}
                  slug="cancer-distribution-bar-chart"
                  noText
                  tooltipHTML="Download image or data"
                  style={{ marginRight: '2rem' }}
                />
              </Row>
              <Column>
                <FilteredStackedBarChart
                  margin={CHART_MARGINS}
                  height={200}
                  data={cnvChartData}
                  displayFilters={cnv}
                  colors={checkers.reduce(
                    (acc, f) => ({ ...acc, [f.key]: f.color }),
                    0,
                  )}
                  yAxis={{ title: '% of Cases Affected' }}
                  styles={chartStyles}
                />
                <Row style={{ display: 'flex', justifyContent: 'center' }}>
                  {checkers.map(f => (
                    <label key={f.key}>
                      <span
                        onClick={() =>
                          setCnv({
                            ...cnv,
                            [f.key]: !cnv[f.key],
                          })}
                        style={{
                          color: f.color,
                          textAlign: 'center',
                          border: '2px solid',
                          height: '18px',
                          width: '18px',
                          cursor: 'pointer',
                          display: 'inline-block',
                          marginRight: '6px',
                          marginTop: '3px',
                          verticalAlign: 'middle',
                          lineHeight: '16px',
                        }}
                      >
                        {cnv[f.key] ? '✓' : <span>&nbsp;</span>}
                      </span>
                      {f.name}&nbsp;&nbsp;&nbsp;
                    </label>
                  ))}
                </Row>
              </Column>
            </Column>
          </span>
        </Row>
      </div>
    );
  },
);
