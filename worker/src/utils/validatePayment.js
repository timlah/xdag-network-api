const validatePayment = value => {
  const isValid = typeof value === 'number' && value <= 100 && value >= 0;
  return isValid ? value : undefined;
};

module.exports = validatePayment;
