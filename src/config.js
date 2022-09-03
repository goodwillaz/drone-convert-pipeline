import convict from 'convict';
import formats from 'convict-format-with-validator';

convict.addFormats(formats);
convict.addFormat({
  name: 'endpoints',
  validate: (val) => {
    if (!Array.isArray(val)) {
      throw new Error('must be of type Array');
    }
    val.forEach(url =>
      convict({ url: { format: 'url', default: null } }).load({ url }).validate({ allowed: 'strict '})
    )
  },
  coerce: val => val.split(',')
});

const config = convict({
  debug: {
    format: Boolean,
    doc: 'Debug',
    default: false,
    arg: 'debug',
    env: 'PLUGIN_DEBUG'
  },
  host: {
    format: 'ipaddress',
    doc: 'Address',
    default: '0.0.0.0',
    arg: 'host',
    env: 'PLUGIN_HOST'
  },
  port: {
    format: 'port',
    doc: 'Port',
    default: 3000,
    arg: 'port',
    env: 'PLUGIN_PORT'
  },
  secret: {
    format: String,
    doc: 'Secret for communication',
    default: null,
    arg: 'secret',
    env: 'PLUGIN_SECRET'
  },
  endpoints: {
    format: 'endpoints',
    doc: 'Array of endpoints to iterate through',
    default: [],
    arg: 'endpoints',
    env: 'PLUGIN_ENDPOINTS'
  }
});

// Perform validation
config.validate({ allowed: 'strict' });

export default config.getProperties();
