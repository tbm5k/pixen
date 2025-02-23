/**
 * ${GET:API calls by "GET" method}
 *
 * @param {string} url
 * @param {object} [settings={\}]
 * @property {string} settings.defaultVal   defaultVal of settings'
 * @property {string} settings.type   type of settings'
 * @returns {*\}
 */
export const GET = (url, settings = {}) => {
  return new Promise((resolve, reject) => {
    if (!url) return reject("no url");
    const { defaultVal, type = "json" } = settings;

      // FIX: check on cdn2 certificate producing NET::ERR_CERT_AUTHORITY_INVALID error
      // FIX: this is a temporary fix
        const userAgent = navigator.userAgent.toLocaleLowerCase();
        // if ((/nettv|sraf|tcl|iserver|whaletv/i).test(userAgent)) // zeasn
      const isPhilips = (/philipstv/i).test(userAgent);
      if (isPhilips && url.includes('cdn2') && url.includes('feed')) {
          url = url.replace('https://', 'http://');
      }
    const request = new XMLHttpRequest();
    request.responseType = type;

    request.onreadystatechange = () => {
      if (request.readyState === 4) {
        if (request.status === 200) {
          //success
          try {
            return resolve(request.response);
          } catch (error) {

            reject(
              `Data received, but there is an additional error, is it a valid File? url: ${url}`
            );
          }
        }

        if (request.status >= 400) {

          resolve(defaultVal);
        }
      }
    };
    request.open("GET", url, true);
    request.send();
  });
};
