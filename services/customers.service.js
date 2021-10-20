const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');

const { models } = require('../libs/sequelize');

class CustomersService {
  constructor() {}

  removePassword(newCustomer) {
    delete newCustomer.dataValues.user.dataValues.password;
    return newCustomer;
  }

  async getAll() {
    const rta = await models.Customer.findAll({
      include: ['user']
    });
    return rta;
  }

  async fidOne(id) {
    const user = await models.Customer.findByPk(id, {
      include: ['user']
    });
    if (!user) {
      throw boom.notFound('Customer not found');
    }
    return user;
  }

  async create(data) {
    const hash = await bcrypt.hash(data.user.password, 10);
    const newData = {
      ...data,
      user: {
        ...data.user,
        password: hash
      }
    };
    let newCustomer = await models.Customer.create(
      newData,
      {
        include: ['user']
      }
    );
    newCustomer = this.removePassword(newCustomer);
    return newCustomer;
  }

  async update(id, data) {
    const customer = await this.fidOne(id);
    let rta = await customer.update(data);
    rta = this.removePassword(rta);
    return rta;
  }

  async delete(id) {
    const customer = await this.fidOne(id);
    await customer.destroy();
    return { message: 'Customer Deleted' };
  }
}

module.exports = CustomersService;
