/**
 * Copyright 2022 Goodwill of Central and Northern Arizona

 * Licensed under the BSD 3-Clause (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * https://opensource.org/licenses/BSD-3-Clause

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import logger from './lib/logger.js';
import handler from './handler.js';

(async function () {
  const { default: config } = await import('./config.js').catch((e) => {
    logger.error('Error importing configuration', e);
    process.exit(1);
  });

  // Handle term signals
  process.on('SIGINT', () => process.exit());
  process.on('SIGTERM', () => process.exit());

  if (config.debug) {
    logger.level = 'debug';
  }
  logger.debug('Configuration', config);

  handler(config).listen(config.port, config.host, err => {
    if (err) logger.error('Error starting server', err);
    logger.info(`Started server at http://${config.host}:${config.port}`);
  });
})();
