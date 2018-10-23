const read = require('./read');
const send = require('./send');

module.exports = ({ config, params }) => {
  const data = read(config);

  return send(data, params);
};
