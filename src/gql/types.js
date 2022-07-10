const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type PizzaModification {
    id: ID
    dough: String
    size: Int
    price: Float
    pizzasIds: [String]
  }

  type Pizza {
    id: ID
    name: String
    image: String
    popularity: Int
    modifications: [PizzaModification]
    pizzaAvailability: Pizza_Availability
  }

  type Pizza_Availability {
    pizzaId: String
    orderedAmount: Int
    maxAmount: Int
  }

  type PizzaType {
    id: ID
    name: String
    pizzaIds: [String]
  }

  type PageInfo {
    hasNextPage: Boolean
  }

  type PizzaConnection {
    edges: [Pizza]
    pageInfo: PageInfo
  }

  type Query {
    pizzas(limit: Int, offset: Int, pizzaTypeId: ID): PizzaConnection
    pizza_availability: [Pizza_Availability]
    pizza_types: [PizzaType]
  }

  type OrderedPizza {
    pizzaId: ID
    dough: String
    size: Int
    price: Float
    amount: Int
    pizzaName: String
  }

  type Order {
    id: ID
    totalAmount: Int
    totalPrice: Float
    orderedPizzas: [OrderedPizza]
  }

  input OrderedPizzaInput {
    pizzaId: ID
    dough: String
    size: Int
    price: Float
    amount: Int
    pizzaName: String
  }

  input OrderInput {
    totalAmount: Int
    totalPrice: Float
    orderedPizzas: [OrderedPizzaInput]
  }

  type Mutation {
    createOrder(order: OrderInput): Order
  }

  type UpdatedPizzaAvailability {
    updated_pizza_availability: [Pizza_Availability]
  }

  type Subscription {
    availabilityUpdated: UpdatedPizzaAvailability
  }
`;

module.exports = { typeDefs };
