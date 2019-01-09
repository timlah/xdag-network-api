const findStatistic = require('../utils/findStatistic');

const body = `Statistics for ours and maximum known parameters:
                hosts: 593 of 594
               blocks: 110489092 of 110489092
          main blocks: 380782 of 380782
        orphan blocks: 11
     wait sync blocks: 50766
     chain difficulty: 8062ba6b4d81288231492060020 of 8062ba6b4d81288231492060020
          XDAG supply: 389920768.000000000 of 389920768.000000000
    hour hashrate MHs: 1524.48 of 61804085.91`;

describe('findStatistic', () => {
  test('Should return the requested pool statistic', () => {
    expect(findStatistic(body, '(?:(?:4 hr)|(?:hour)) hashrate MHs', 0)).toBe(
      '1524.48'
    );
    expect(findStatistic(body, 'main blocks', 0)).toBe('380782');
    expect(findStatistic(body, 'chain difficulty', 0)).toBe(
      '8062ba6b4d81288231492060020'
    );
  });

  test('Should return the requested network statistic', () => {
    expect(findStatistic(body, '(?:(?:4 hr)|(?:hour)) hashrate MHs', 1)).toBe(
      '61804085.91'
    );
    expect(findStatistic(body, 'hosts', 1)).toBe('594');
  });

  test('Should return undefined when value key is not found', () => {
    expect(findStatistic(body, 'foobar')).toBeUndefined();
  });
});
