/**
 * This file was generated by:
 *   relay-compiler
 *
 * @providesModule DownloadClinicalButton_relayQuery.graphql
 * @generated SignedSource<<ae90af457128c71abd973cf8ad1d17e3>>
 * @relayHash 16cc358f90885627a63634bfdfe08423
 * @flow
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type {ConcreteBatch} from 'relay-runtime';

*/


/*
query DownloadClinicalButton_relayQuery(
  $filters: FiltersArgument
) {
  viewer {
    repository {
      cases {
        hits(first: 0, filters: $filters) {
          total
        }
      }
    }
  }
}
*/

const batch /*: ConcreteBatch*/ = {
  "fragment": {
    "argumentDefinitions": [
      {
        "kind": "LocalArgument",
        "name": "filters",
        "type": "FiltersArgument",
        "defaultValue": null
      }
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "DownloadClinicalButton_relayQuery",
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "args": null,
        "concreteType": "Root",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "args": null,
            "concreteType": "Repository",
            "name": "repository",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "args": null,
                "concreteType": "RepositoryCases",
                "name": "cases",
                "plural": false,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "args": [
                      {
                        "kind": "Variable",
                        "name": "filters",
                        "variableName": "filters",
                        "type": "FiltersArgument"
                      },
                      {
                        "kind": "Literal",
                        "name": "first",
                        "value": 0,
                        "type": "Int"
                      }
                    ],
                    "concreteType": "CaseConnection",
                    "name": "hits",
                    "plural": false,
                    "selections": [
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "args": null,
                        "name": "total",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Root"
  },
  "id": null,
  "kind": "Batch",
  "metadata": {},
  "name": "DownloadClinicalButton_relayQuery",
  "query": {
    "argumentDefinitions": [
      {
        "kind": "LocalArgument",
        "name": "filters",
        "type": "FiltersArgument",
        "defaultValue": null
      }
    ],
    "kind": "Root",
    "name": "DownloadClinicalButton_relayQuery",
    "operation": "query",
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "args": null,
        "concreteType": "Root",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "args": null,
            "concreteType": "Repository",
            "name": "repository",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "args": null,
                "concreteType": "RepositoryCases",
                "name": "cases",
                "plural": false,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "args": [
                      {
                        "kind": "Variable",
                        "name": "filters",
                        "variableName": "filters",
                        "type": "FiltersArgument"
                      },
                      {
                        "kind": "Literal",
                        "name": "first",
                        "value": 0,
                        "type": "Int"
                      }
                    ],
                    "concreteType": "CaseConnection",
                    "name": "hits",
                    "plural": false,
                    "selections": [
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "args": null,
                        "name": "total",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "text": "query DownloadClinicalButton_relayQuery(\n  $filters: FiltersArgument\n) {\n  viewer {\n    repository {\n      cases {\n        hits(first: 0, filters: $filters) {\n          total\n        }\n      }\n    }\n  }\n}\n"
};

module.exports = batch;