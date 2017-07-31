const { graphql } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');

const DogSchema = new mongoose.Schema({
    name: String,
    photo: String,
    description: String,
    score: {
        type: Number,
        default: 0
    }
});

const Dog = mongoose.model('Pet',DogSchema);

mongoose.connect('mongodb://localhost/updog');

const app = express();

app.use(express.static('public'));

const typeDefs = `
    type Query {
        allDogs: [Dog]
    }
    type Mutation {
        createDog(
            name: String!
            photo: String!
            description: String!
        ): Dog,
        deleteDog(_id: String!): Dog,
        updateDog(_id: String!): Dog
    }
    type Dog {
        _id: String
        name: String
        description: String
        photo: String
        score: Int
    }
`;

const resolvers = {
    Query: {
        allDogs: () => new Promise((resolve,reject) => {
            Dog.find({},(err,docs) => {
                if(err !== null) {
                    reject(err);
                }
                resolve(docs);
            })
        })
    },
    Mutation: {
        createDog: (_, dog) => new Dog(dog).save(),
        deleteDog: (_, {_id}) => new Promise((resolve,reject) => {
            Dog.findByIdAndRemove(_id,(err,doc) => {
                if(err !== null) {
                    reject(err);
                }
                resolve(doc);
            });
        }),
        updateDog: (_, {_id}) => new Promise((resolve,reject) => {
            Dog.findByIdAndUpdate(_id,{
                $inc: {
                    score: 1
                }
            },(err,doc) => {
                if(err !== null) {
                    reject(err)
                }
                resolve(doc)
            });
        })
    }
}
const schema = makeExecutableSchema({ typeDefs, resolvers });
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true,
}))

app.listen(4000);