// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// ng serve --configuration=remote --port 3000
// ng serve -c server --port 3000
export const environment = {
    production: false,
    apiMockUrl: "http://127.0.0.1:9090/api/heroes",  // Mock URL for server web api
    apiUrl: "http://ixinbuy.com:9090/api/heroes"     // URL to server web api
};
  
  /*
   * For easier debugging in development mode, you can import the following file
   * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
   *
   * This import should be commented out in production mode because it will have a negative impact
   * on performance if an error is thrown.
   */
  // import 'zone.js/dist/zone-error';  // Included with Angular CLI.
  