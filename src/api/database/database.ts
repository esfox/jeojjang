import { Sequelize } from 'sequelize';
import { initializeModels } from './models';

const sequelize = new Sequelize(
{
  storage: `${__dirname}/database.sqlite`,
  dialect: 'sqlite'
});

function syncDatabase()
{
  initializeModels(sequelize);

  return sequelize.sync(/* { force: true } */)
    .then('Database synced.')
    .catch(console.error);
}

export { sequelize, syncDatabase };
