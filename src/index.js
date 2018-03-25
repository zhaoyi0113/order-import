const Controller = require('./controller');
const config = require('config-yml');

let env = process.env.NODE_ENV || 'dev';
if (!config[env]) {
  env = 'dev';
}
const {url, options} = config[env].db;
const ctr = new Controller(url, options);

const argv = process.argv;
let dataFile = './data/orders.csv';
if(argv && argv.length > 2) {
	// load data file from command line argument
	dataFile = argv[2];
}

// start process the data
ctr
  .process(dataFile)
  .then(() => process.exit())
  .catch(err => {
    console.error(err);
    process.exit(1);
  });