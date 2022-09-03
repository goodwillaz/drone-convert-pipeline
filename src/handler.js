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

import express from 'express';
import httpSignature from 'http-signature';
import 'express-async-errors';
import Axios from 'axios';
import logger from './lib/logger.js';
import { signer } from './lib/signer.js';

const { parseRequest, verifyHMAC } = httpSignature;

const validator = secret => (req, res, next) => {
  if (req.path === '/ping' || verifyHMAC(parseRequest(req, {}), secret)) {
    return next();
  }

  throw new Error('Authorization header is not valid');
};

/**
 *
 * @param {Array} endpoints
 * @param {String} secret
 * @returns {Express}
 */
export default function ({ endpoints, secret }) {
  const app = express();

  // Setup some middleware to assist with the requests
  app.use(validator(secret));
  app.use(express.json());

  const client = Axios.create();
  client.interceptors.request.use(signer(secret), Promise.reject);

  app.get('/ping', (req, res) => {
    logger.info('Ping');
    res.set('Content-Type', 'text/plain').send('pong');
  });

  app.post('/', async ({body}, res) => {
    logger.info(`Request for ${body.repo.slug}`)
    logger.debug('Request body', body);

    // Create a chained promise with all the endpoints one after the other, using the previous one's result
    // Start with the initial data sent in from Drone
    const response = await endpoints.reduce(
        (response, endpoint) => response
          // Send a post to the next endpoint in the list
          .then(({ data }) => client.post(endpoint, data))
          // when we get the response (it's just the config), put it into a proper object again
          .then(({ data }) => ({ data: { ...body, config: data }}))
          // If we get an error, just return the original response
          .catch(err => {
            logger.error(`Error calling endpoint ${endpoint}`, { err })
            return response;
          }),
        // The initial value to a promise that resolves like an Axios response would (a response object with a data property)
        Promise.resolve({ data: body })
      );

    // Once we're done, return just the config
    logger.debug('Config response', response.data.config);
    res
      .set('Content-Type', 'application/json')
      .send(response.data.config);
  });

  return app;
}
