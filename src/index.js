import 'babel-polyfill';
import dotenv from 'dotenv';
import 'isomorphic-fetch';

// Config dotenv
dotenv.config();

// Define api call class
export default class OpenSecretsCall {
  constructor(method, params, output, apikey) {
    this.method = method;
    this.params = params;
    this.output = output || 'json';
    this.apikey = apikey || process.env.OPENSECRETS_API_KEY;
    this.baseurl = 'http://www.opensecrets.org/api/';
  }

  // Check output
  checkOutput() {
    const output = this.output;
    const validVals = ['json', 'xml'];
    if (validVals.indexOf(output) === -1) {
      throw new Error('Whoops! Output value is invalid');
    } else {
      return output;
    }
  }

  // Check for api key
  checkApiKey() {
    const apikey = this.apikey;
    if (!apikey) {
      throw new Error('Whoops! OpenSecrets API key required');
    } else {
      return apikey;
    }
  }

  // Initiate url
  initUrl() {
    // Call checkApiKey() and checkOutput()
    let apikey,
        output;
    try {
      apikey = this.checkApiKey();
      output = this.checkOutput();
    } catch (e) {
      console.log(`${e.name} : ${e.message}`);
    }
    // Build url
    if (apikey) {
      let url = `${this.baseurl}?method=${this.method}&output=${this.output}&apikey=${this.apikey}`;
      for (var prop in this.params) {
        url += `&${prop}=${this.params[prop]}`;
      }
      return url;
    }
  }

  // Get the data
  async fetchData() {
    // Call initUrl()
    let url = this.initUrl();

    // Handle fetch response status
    const status = (response) => {
      if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
      } else {
        return Promise.reject(new Error(response.statusText));
      }
    }

    // Handle fetch response JSON
    const json = (response) => {
      return response.json();
    }

    // Handle fetch response XML
    const text = (response) => {
      return response.text();
    }

    // Fetch API
    const initFetch = new Promise((resolve, reject) => {
      if (typeof url !== 'undefined' && this.output === 'json') { // JSON
        fetch(url)
        .then(status)
        .then(json)
        .then((data) => {
          console.log(`Request succeeded, \n${data}`);
          resolve(data);
        })
        .catch((err) => {
          console.log(`Request failed, \n${err}`);
        });
      } else if (typeof url !== 'undefined' && this.output === 'xml') { // XML
        fetch(url)
        .then(status)
        .then(text)
        .then((data) => {
          console.log(`Request succeeded, \n${data}`);
          resolve(data);
        })
        .catch((err) => {
          console.log(`Request failed, \n${err}`);
        });
      } else {
        reject('fetch prevented');
      }
    });

    try {
      const result = await initFetch;
      return result;
    } catch (err) {
      console.log(err);
    }

  }
}
