const findSoftwareVersion = body => {
  const regex = /version\s(\d\.\d\.\d)\./;

  const result = regex.exec(body);
  return Array.isArray(result) ? result[1] : undefined;
};

module.exports = findSoftwareVersion;
