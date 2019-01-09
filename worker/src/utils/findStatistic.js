// const escapeStringRegexp = require('escape-string-regexp');

// index 0 = pool statistic, 1 = network statistic
module.exports = (body, valueKey, useIndex = 0) => {
  let regex;
  // const escapedValueKey = escapeStringRegexp(valueKey);

  if (useIndex === 0) {
    regex = new RegExp(`(?:\\n\\s*${valueKey}:\\s)(\\S+)`);
  } else if (useIndex === 1) {
    regex = new RegExp(`(?:\\n\\s*${valueKey}:\\s)(?:\\S+\\sof\\s)(\\S+)`);
  }

  const result = regex.exec(body);
  return Array.isArray(result) ? result[1] : undefined;
};
