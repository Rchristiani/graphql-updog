
const { graphql } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');
const express = require('express');
const graphqlHTTP = require('express-graphql');

const app = express();


const dogs = [
    {
        id: 1,
        name: 'Dug the Pug',
    },
    {
        id: 2,
        name: 'Jessie',
    }
]

let id = dogs.length;

const typeDefs = `
    type Query {
        allDogs: [Dog]
    }
    type Mutation {
        createDog(name: String!): Dog,
        deleteDog(id: Int!): Dog,
        updateDog(id: Int!, name: String!): Dog
    }
    type Dog {
        id: Int
        name: String
    }
`;

const resolvers = {
    Query: {
        allDogs: () => {
            return dogs;
        }
    },
    Mutation: {
        createDog: (_, {name}) => {
            const dog = {
                id: id++,
                name,
            }
            dogs.push(dog);
            return dog; 
        },
        deleteDog: (_, {id}) => {
            const dog = dogs.filter(dog => dog.id === id)[0];
            const dogIndex = dogs.indexOf(dog);
            dogs.splice(dogIndex, dogIndex + 1);
            return dog;
        },
        updateDog: (_, {id, name}) => {
            const dog = dogs.filter(dog => dog.id === id)[0];
            const dogIndex = dogs.indexOf(dog);
            dogs[dogIndex].name = name;
            return dogs[dogIndex];
        }
    }
}
const schema = makeExecutableSchema({ typeDefs, resolvers });
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true,
}))

app.listen(4000);