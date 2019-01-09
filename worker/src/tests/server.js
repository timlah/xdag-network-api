const express = require('express'); // eslint-disable-line

const server = express();

server.get('/state', (req, res) =>
  res.send('XDAG 0.2.5 Synchronized with the main network. Normal operation.')
);

server.get('/state-connect', (req, res) =>
  res.send('XDAG 0.2.5 Trying to connect to the main network.')
);

server.get('/state-bad', (req, res) => res.send('foobar'));

server.get('/json-state', (req, res) =>
  res.json({
    version: '0.2.5',
    state: 'Synchronized with the main network. Normal operation.',
    stats: {
      hosts: [595, 596],
      blocks: [113266024, 113266024],
      main_blocks: [392080, 392080],
      orphan_blocks: 6,
      wait_sync_blocks: 72809,
      chain_difficulty: [
        '81920b3379caa2ea50f7436448d',
        '81920b3379caa2ea50f7436448d'
      ],
      xdag_supply: [401489920, 401489920],
      '4_hr_hashrate_mhs': [2009.28, 48535414.88],
      hashrate: [2106882785.28, 50893071193211]
    },
    pool_config: {
      max_conn: 8192,
      max_ip: 2048,
      max_addr: 2048,
      fee: 0,
      reward: 20,
      direct: 10,
      fund: 1
    },
    date: 'Tue Oct 23 18:49:02 UTC 2018'
  })
);

server.get('/stats/', (req, res) =>
  res.send(`Statistics for ours and maximum known parameters:
                hosts: 593 of 594
               blocks: 110489092 of 110489092
          main blocks: 380782 of 380782
        orphan blocks: 11
     wait sync blocks: 50766
     chain difficulty: 8062ba6b4d81288231492060020 of 8062ba6b4d81288231492060020
          XDAG supply: 389920768.000000000 of 389920768.000000000
    hour hashrate MHs: 1524.48 of 61804085.91`)
);

server.get('/404', (req, res) => res.status(404).send('Not found'));

server.get('/timeout', (req, res) =>
  setTimeout(() => res.send('response after 10s'), 10000)
);

module.exports = server;
