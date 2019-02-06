// within the last 5 minutes
const isOkLastModified = lastModified =>
  lastModified && new Date(lastModified).getTime() > Date.now() - 500000;

module.exports = isOkLastModified;
