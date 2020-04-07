import Sequelize from 'sequelize'

import User from '../app/models/User'
import File from '../app/models/File'
import Appointments from '../app/models/Appointments'

import databaseConfig from '../config/database'

const models = [User, File, Appointments]

class Database {
  constructor () {
    this.init()
  }

  // Método de conexão com o banco de dados
  init () {
    this.connection = new Sequelize(databaseConfig)

    models
      .map(model => model.init(this.connection))
      // Loader de models
      .map(model => model.associate && model.associate(this.connection.models))
  }
}

export default new Database()
