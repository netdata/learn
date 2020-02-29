/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  docs: [
    {
      type: 'doc',
      id: 'introduction'
    },
    {
      type: 'doc',
      id: 'getting-started',
    },
    {
      type: 'category',
      label: 'Collecting metrics',
      items: [
        'collectors',
        'collectors/QUICKSTART',
        'collectors/REFERENCE',
        'collectors/COLLECTORS',
        {
          type: 'category',
          label: 'Internal plugins',
          items: [
            'collectors/ebpf_process.plugin'
          ]
        },
        {
          type: 'category',
          label: 'External plugins',
          items: [
            'collectors/plugins.d',
            {
              type: 'category',
              label: 'Go',
              items: [
                'collectors/go.d.plugin',
                {
                  type: 'category',
                  label: 'Modules',
                  items: [
                    'collectors/go.d.plugin/modules/activemq',
                  ]
                },
              ]
            },
          ]
        },
      ]
    },
    {
      type: 'category',
      label: 'Web',
      items: ['web']
    },
  ]
};