const { PubSub } = require('graphql-subscriptions');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const pizzas = require('../data/pizzas.json');
const pizza_modifications = require('../data/pizza_modifications.json');
const orders = require('../data/orders.json');
const pizza_availability = require('../data/pizza_availability.json');
const pizza_types = require('../data/pizza_types.json');

const pubsub = new PubSub();

const resolvers = {
  Query: {
    pizzas: (_, args) => {
      const { limit, offset, pizzaTypeId } = args;
      let filteredPizzas = pizzas;
      if (pizzaTypeId) {
        filteredPizzas = pizzas.filter(({ id: pizzaId }) => {
          const type = pizza_types.find(({ id }) => id === pizzaTypeId);
          return type.pizzasIds.includes(pizzaId);
        });
      }
      const edges = filteredPizzas.slice(offset).slice(0, limit);
      return {
        edges,
        pageInfo: {
          hasNextPage: filteredPizzas.length > offset + limit,
        },
      };
    },
    pizza_availability: () => pizza_availability,
    pizza_types: () => pizza_types,
  },

  Mutation: {
    createOrder: (_, { order }) => {
      const { totalPrice, totalAmount, orderedPizzas } = order;
      const newOrder = {
        id: uuidv4(),
        totalPrice,
        totalAmount,
        orderedPizzas,
      };
      orders.push(newOrder);
      fs.readFile('src/data/orders.json', 'utf8', function readFileCallback(err, data) {
        if (err) {
          console.log(err);
        } else {
          ordersArr = JSON.parse(data);
          ordersArr.push(newOrder);
          const json = JSON.stringify(ordersArr);
          fs.writeFile('src/data/orders.json', json, 'utf8', () => newOrder);
        }
      });
      const updatedPizzaAvailability = orderedPizzas.reduce((res, { pizzaId, amount }) => {
        const availabilityIndexToUpdate = res.findIndex(({ pizzaId: api }) => api === pizzaId);
        res[availabilityIndexToUpdate] = {
          ...res[availabilityIndexToUpdate],
          orderedAmount: res[availabilityIndexToUpdate].orderedAmount + amount,
        };
        return res;
      }, pizza_availability);

      const availabilityJson = JSON.stringify(updatedPizzaAvailability);
      fs.writeFile(
        'src/data/pizza_availability.json',
        availabilityJson,
        'utf8',
        () => updatedPizzaAvailability,
      );

      pubsub.publish('AVAILABILITY_UPDATED', {
        availabilityUpdated: {
          updated_pizza_availability: updatedPizzaAvailability,
        },
      });
      return newOrder;
    },
  },

  Subscription: {
    availabilityUpdated: {
      subscribe: () => pubsub.asyncIterator(['AVAILABILITY_UPDATED']),
    },
  },

  Pizza: {
    modifications(parent) {
      return pizza_modifications.filter(({ pizzasIds }) => pizzasIds.includes(parent.id));
    },
    pizzaAvailability(parent) {
      return pizza_availability.find(({ pizzaId }) => pizzaId === parent.id);
    },
  },
};

module.exports = { resolvers };
