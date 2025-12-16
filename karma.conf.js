module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'), // <--- IMPORTANTE
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      clearContext: false, // deja visible la salida del test en el navegador
    },
    // Configuración del reporte de cobertura
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/portal-medico-reservas'),
      subdir: '.',
      reporters: [
        { type: 'html' }, // Genera la página web visual
        { type: 'text-summary' }, // Muestra un resumen en la consola
      ],
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true,
  });
};
