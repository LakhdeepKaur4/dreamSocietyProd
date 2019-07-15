const request = require('supertest');
const {signinDecrypted,getUserDecrypted}  = require('../user')

// test('fails with missing credentials',  (done) => {
//     const user = {};
//     request(signinDecrypted).post('/api/auth/signin')
//     .send({
//         // user
//         userName:'Lakhdeep123',
//         password:'lakhdeep'
//     })
//     .then((res)=>{
//         console.log("***************************")
//         expect(422);
//         // const body = res.body;
//         // expect(body).to.contain.property('Successfully Logged In');
//         // expect(message).toBe('Username cannot be empty')
//         done();
//     })
//     //  expect(signinDecrypted).toBe(demoUser.userName);
//    });


   test('list all users',  (done) => {
    request(getUserDecrypted).get('/api/user')
        .expect(200)
        .then(res => {
            expect(res.body).toBe(Array);
            console.log(res.body);
        })
        done();
   });