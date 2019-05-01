import config from 'config';
import _ from 'lodash';

import { serializePets, serializePet } from '../../serializers/pets-serializer';

import { getConnection } from 'api/v1/db/oracledb/connection';
import contrib from 'api/v1/db/oracledb/contrib/contrib';

const { endpointUri } = config.get('server');

/**
 * @summary Return a list of pets
 * @function
 * @returns {Promise} Promise object represents a list of pets
 */
const getPets = () => new Promise(async (resolve, reject) => {
  const connection = await getConnection();
  try {
    const { rawPets } = await connection.execute(contrib.getPets());
    const serializedPets = serializePets(rawPets, endpointUri);
    resolve(serializedPets);
  } catch (err) {
    reject(err);
  } finally {
    connection.close();
  }
});

/**
 * @summary Return a specific pet by unique ID
 * @function
 * @param {string} id Unique pet ID
 * @returns {Promise} Promise object represents a specific pet
 */
const getPetById = id => new Promise(async (resolve, reject) => {
  const connection = await getConnection();
  try {
    const { rawPets } = await connection.execute(contrib.getPetById(id), id);

    if (_.isEmpty(rawPets)) {
      resolve(undefined);
    } else if (rawPets.length > 1) {
      reject(new Error('Expect a single object but got multiple results.'));
    } else {
      const [rawPet] = rawPets;
      const serializedPet = serializePet(rawPet);
      resolve(serializedPet);
    }
  } catch (err) {
    reject(err);
  } finally {
    connection.close();
  }
});

export { getPets, getPetById };
