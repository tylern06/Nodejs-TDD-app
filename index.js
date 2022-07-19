const app = require('./src/app');
const sequelize = require('./src/config/database');

// initailize database. Create tables from the schema defined
sequelize.sync({ force: true });

app.listen(3000, () => {
  console.log('app is running on port', 3000);
});
