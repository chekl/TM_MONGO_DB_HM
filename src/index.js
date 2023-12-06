import { connect, close } from './connection.js';

const db = await connect();
const usersCollection = db.collection('users');
const studentsCollection = db.collection('students');

const run = async () => {
  try {
    // await task1();
    //await task2();
    //await getUsersExample();
    //await task3();
    //await task4();
    //await task5();
    //await task6();
    //await task7();
    //await task8();
    //await task9();
    //await task10();
    //await task11();
    //await task12();

    await close();
  } catch (err) {
    console.log('Error: ', err);
  }
};
run();

// #### Users
// - Get users example
async function getUsersExample() {
  try {
    const [allUsers, firstUser] = await Promise.all([
      usersCollection.find().toArray(),
      usersCollection.findOne(),
    ]);

    console.log('allUsers', allUsers);
    console.log('firstUser', firstUser);
  } catch (err) {
    console.error('getUsersExample', err);
  }
}

// - Get all users, sort them by age (ascending), and return only 5 records with firstName, lastName, and age fields.
async function task1() {
  try {
    const sortedUsers = await usersCollection
      .aggregate([
        { $sort: { age: 1 } },
        { $limit: 5 },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            age: 1,
            _id: 0,
          },
        },
      ])
      .toArray();

    console.log('sortedUsers', sortedUsers);
  } catch (err) {
    console.error('task1', err);
  }
}

// - Add new field 'skills: []" for all users where age >= 25 && age < 30 or tags includes 'Engineering'
async function task2() {
  try {
    const skilledUsers = await usersCollection.updateMany(
      {
        $or: [{ age: { $gte: 25, $lt: 30 } }, { tags: 'Engineering' }],
      },
      {
        $set: {
          skills: [],
        },
      }
    );

    console.log('skilledUsers', skilledUsers);
  } catch (err) {
    console.error('task2', err);
  }
}

// - Update the first document and return the updated document in one operation (add 'js' and 'git' to the 'skills' array)
//   Filter: the document should contain the 'skills' field
async function task3() {
  try {
    const updatedUser = await usersCollection.findOneAndUpdate(
      { skills: { $exists: true } },
      { $set: { skills: ['js', 'git'] } },
      { returnDocument: 'after' }
    );

    console.log('updatedUser', updatedUser);
  } catch (err) {
    console.error('task3', err);
  }
}

// - REPLACE the first document where the 'email' field starts with 'john' and the 'address state' is equal to 'CA'
//   Set firstName: "Jason", lastName: "Wood", tags: ['a', 'b', 'c'], department: 'Support'
async function task4() {
  try {
    const updatedUser = await usersCollection.findOneAndReplace(
      {
        $and: [{ email: { $regex: /^john/g } }, { 'address.state': 'CA' }],
      },
      {
        firstName: 'Jason',
        lastName: 'Wood',
        tags: ['a', 'b', 'c'],
        department: 'Support',
      },
      { returnDocument: 'after' }
    );

    console.log('updatedUser', updatedUser);
  } catch (err) {
    console.log('task4', err);
  }
}

// - Pull tag 'c' from the first document where firstName: "Jason", lastName: "Wood"
async function task5() {
  try {
    const updatedUser = await usersCollection.findOneAndUpdate(
      {
        firstName: 'Jason',
        lastName: 'Wood',
      },
      {
        $pull: {
          tags: 'c',
        },
      },
      { returnDocument: 'after' }
    );

    console.log('updatedUser', updatedUser);
  } catch (err) {
    console.log('task5', err);
  }
}

// - Push tag 'b' to the first document where firstName: "Jason", lastName: "Wood"
//   ONLY if the 'b' value does not exist in the 'tags'
async function task6() {
  try {
    const updatedUser = await usersCollection.findOneAndUpdate(
      {
        $and: [
          { firstName: 'Jason' },
          { lastName: 'Wood' },
          { tags: { $nin: ['b'] } },
        ],
      },
      {
        $push: {
          tags: 'b',
        },
      },
      { returnDocument: 'after' }
    );

    console.log('updatedUser', updatedUser);
  } catch (err) {
    console.log('task6', err);
  }
}

// - Delete all users by department (Support)
async function task7() {
  try {
    const deletedUsers = await usersCollection.deleteMany(
      {
        department: 'Support',
      },
      { returnDocument: 'after' }
    );

    console.log(deletedUsers);
  } catch (err) {
    console.log('task7', err);
  }
}

// #### Articles
// - Create new collection 'articles'. Using bulk write:
//   Create one article per each type (a, b, c)
//   Find articles with type a, and update tag list with next value ['tag1-a', 'tag2-a', 'tag3']
//   Add tags ['tag2', 'tag3', 'super'] to articles except articles with type 'a'
//   Pull ['tag2', 'tag1-a'] from all articles
async function task8() {
  try {
    await db.createCollection('articles');
    await db.collection('articles').bulkWrite([
      {
        insertOne: {
          document: {
            name: 'Mongodb - introduction',
            description: 'Mongodb - text',
            type: 'a',
            tags: [],
          },
        },
      },
      {
        insertOne: {
          document: {
            name: 'Bootstrap - introduction',
            description: 'Bootstrap - text',
            type: 'b',
            tags: [],
          },
        },
      },
      {
        insertOne: {
          document: {
            name: 'CSS - introduction',
            description: 'CSS - text',
            type: 'c',
            tags: [],
          },
        },
      },
      {
        updateMany: {
          filter: { type: 'a' },
          update: { $set: { tags: ['tag1-a', 'tag2-a', 'tag3'] } },
        },
      },
      {
        updateMany: {
          filter: { type: { $ne: 'a' } },
          update: { $push: { tags: { $each: ['tag2', 'tag3', 'super'] } } },
        },
      },
      {
        updateMany: {
          filter: {},
          update: { $pull: { tags: { $in: ['tag2', 'tag1-a'] } } },
        },
      },
    ]);
  } catch (err) {
    console.error('task8', err);
  }
}

// - Find all articles that contains tags 'super' or 'tag2-a'
async function task9() {
  try {
    const searchArticles = await db
      .collection('articles')
      .find({
        tags: { $in: ['super', 'tag2-a'] },
      })
      .toArray();
    console.log('searchArticles', searchArticles);
  } catch (err) {
    console.log('task9', err);
  }
}

// #### Students Statistic (Aggregations)
// - Find the student who have the worst score for homework, the result should be [ { name: <name>, worst_homework_score: <score> } ]
async function task10() {
  try {
    const worstStudent = await studentsCollection
      .aggregate([
        { $unwind: '$scores' },
        { $match: { 'scores.type': 'homework' } },
        { $sort: { 'scores.score': 1 } },
        { $limit: 1 },
        {
          $project: {
            name: 1,
            worst_homework_score: '$scores.score',
            _id: 0,
          },
        },
      ])
      .toArray();

    console.log(worstStudent);
  } catch (err) {
    console.log('task10', err);
  }
}

// - Calculate the average score for homework for all students, the result should be [ { avg_score: <number> } ]
async function task11() {
  try {
    const averageHomework = await studentsCollection
      .aggregate([
        { $unwind: '$scores' },
        { $match: { 'scores.type': 'homework' } },
        {
          $group: {
            _id: null,
            avg_score: { $avg: '$scores.score' },
          },
        },
        {
          $project: {
            _id: 0,
            avg_score: 1,
          },
        },
      ])
      .toArray();

    console.log(averageHomework);
  } catch (err) {
    console.log('task11', err);
  }
}

// - Calculate the average score by all types (homework, exam, quiz) for each student, sort from the largest to the smallest value
async function task12() {
  try {
    const averageScores = await studentsCollection
      .aggregate([
        { $unwind: '$scores' },
        {
          $group: {
            _id: '$name',
            avg_score: { $avg: '$scores.score' },
          },
        },
        {
          $project: {
            _id: 0,
            name: '$_id',
            avg_score: 1,
          },
        },
        {
          $sort: { avg_score: -1 },
        },
      ])
      .toArray();

    console.log(averageScores);
  } catch (err) {
    console.log('task12', err);
  }
}
